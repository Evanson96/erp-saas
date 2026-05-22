const pool = require("../config/database");
const { writeAuditLog } = require("../utils/auditLogger");

const getSuppliers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, company_id, name, email, phone, address, created_at, updated_at
       FROM suppliers
       WHERE company_id = $1
       ORDER BY id DESC`,
      [req.user.company_id]
    );

    return res.status(200).json({ suppliers: result.rows });
  } catch (error) {
    console.error("Get suppliers error:", error);
    return res.status(500).json({ message: "Failed to load suppliers" });
  }
};

const createSupplier = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    const result = await pool.query(
      `INSERT INTO suppliers (company_id, name, email, phone, address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, company_id, name, email, phone, address, created_at, updated_at`,
      [req.user.company_id, name, email || null, phone || null, address || null]
    );

    await writeAuditLog({
      req,
      companyId: req.user.company_id,
      actorId: req.user.id,
      actorEmail: req.user.email,
      action: "supplier.created",
      entityType: "supplier",
      entityId: result.rows[0].id,
      details: { name: result.rows[0].name, email: result.rows[0].email },
    });

    return res.status(201).json({
      message: "Supplier created successfully",
      supplier: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "A supplier with this email already exists" });
    }

    console.error("Create supplier error:", error);
    return res.status(500).json({ message: "Failed to create supplier" });
  }
};

const getPurchaseOrders = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT purchase_orders.id,
              purchase_orders.supplier_id,
              suppliers.name AS supplier_name,
              purchase_orders.purchase_order_number,
              purchase_orders.status,
              purchase_orders.total_amount,
              purchase_orders.order_date,
              purchase_orders.received_at,
              purchase_orders.created_at
       FROM purchase_orders
       JOIN suppliers ON suppliers.id = purchase_orders.supplier_id
       WHERE purchase_orders.company_id = $1
       ORDER BY purchase_orders.id DESC`,
      [req.user.company_id]
    );

    return res.status(200).json({ purchaseOrders: result.rows });
  } catch (error) {
    console.error("Get purchase orders error:", error);
    return res.status(500).json({ message: "Failed to load purchase orders" });
  }
};

const createPurchaseOrder = async (req, res) => {
  const client = await pool.connect();

  try {
    const { supplier_id, items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "At least one purchase item is required" });
    }

    await client.query("BEGIN");

    const supplierResult = await client.query(
      "SELECT id FROM suppliers WHERE id = $1 AND company_id = $2",
      [supplier_id, req.user.company_id]
    );

    if (supplierResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Supplier not found" });
    }

    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const quantity = Number(item.quantity);
      const unitCost = Number(item.unit_cost);

      if (!item.product_id || quantity <= 0 || unitCost < 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Each item must include product, quantity, and unit cost" });
      }

      const productResult = await client.query(
        "SELECT id FROM products WHERE id = $1 AND company_id = $2",
        [item.product_id, req.user.company_id]
      );

      if (productResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ message: `Product ${item.product_id} not found` });
      }

      const lineTotal = quantity * unitCost;
      totalAmount += lineTotal;

      validatedItems.push({
        product_id: Number(item.product_id),
        quantity,
        unit_cost: unitCost,
        line_total: lineTotal,
      });
    }

    const purchaseOrderResult = await client.query(
      `INSERT INTO purchase_orders (company_id, supplier_id, purchase_order_number, status, total_amount)
       VALUES ($1, $2, $3, 'ordered', $4)
       RETURNING id, company_id, supplier_id, purchase_order_number, status, total_amount, order_date, created_at`,
      [req.user.company_id, supplier_id, `PO-${Date.now()}`, totalAmount]
    );

    const purchaseOrder = purchaseOrderResult.rows[0];
    const createdItems = [];

    for (const item of validatedItems) {
      const itemResult = await client.query(
        `INSERT INTO purchase_order_items (company_id, purchase_order_id, product_id, quantity, unit_cost, line_total)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, purchase_order_id, product_id, quantity, unit_cost, line_total`,
        [req.user.company_id, purchaseOrder.id, item.product_id, item.quantity, item.unit_cost, item.line_total]
      );

      createdItems.push(itemResult.rows[0]);
    }

    await client.query("COMMIT");

    await writeAuditLog({
      req,
      companyId: req.user.company_id,
      actorId: req.user.id,
      actorEmail: req.user.email,
      action: "purchase_order.created",
      entityType: "purchase_order",
      entityId: purchaseOrder.id,
      details: { purchase_order_number: purchaseOrder.purchase_order_number, total_amount: totalAmount },
    });

    return res.status(201).json({
      message: "Purchase order created successfully",
      purchaseOrder: {
        ...purchaseOrder,
        items: createdItems,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Create purchase order error:", error);
    return res.status(500).json({ message: "Failed to create purchase order" });
  } finally {
    client.release();
  }
};

const receivePurchaseOrder = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const purchaseOrderResult = await client.query(
      `SELECT id, status
       FROM purchase_orders
       WHERE id = $1 AND company_id = $2
       FOR UPDATE`,
      [req.params.id, req.user.company_id]
    );

    if (purchaseOrderResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Purchase order not found" });
    }

    const purchaseOrder = purchaseOrderResult.rows[0];

    if (purchaseOrder.status === "received") {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: "Purchase order is already received" });
    }

    if (purchaseOrder.status === "cancelled") {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: "Cancelled purchase orders cannot be received" });
    }

    const itemsResult = await client.query(
      `SELECT product_id, quantity
       FROM purchase_order_items
       WHERE purchase_order_id = $1 AND company_id = $2`,
      [req.params.id, req.user.company_id]
    );

    for (const item of itemsResult.rows) {
      await client.query(
        `UPDATE products
         SET stock_quantity = stock_quantity + $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND company_id = $3`,
        [item.quantity, item.product_id, req.user.company_id]
      );
    }

    const updatedPurchaseOrderResult = await client.query(
      `UPDATE purchase_orders
       SET status = 'received',
           received_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND company_id = $2
       RETURNING id, supplier_id, purchase_order_number, status, total_amount, order_date, received_at`,
      [req.params.id, req.user.company_id]
    );

    await client.query("COMMIT");

    await writeAuditLog({
      req,
      companyId: req.user.company_id,
      actorId: req.user.id,
      actorEmail: req.user.email,
      action: "purchase_order.received",
      entityType: "purchase_order",
      entityId: updatedPurchaseOrderResult.rows[0].id,
      details: { purchase_order_number: updatedPurchaseOrderResult.rows[0].purchase_order_number },
    });

    return res.status(200).json({
      message: "Purchase order received and stock updated",
      purchaseOrder: updatedPurchaseOrderResult.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Receive purchase order error:", error);
    return res.status(500).json({ message: "Failed to receive purchase order" });
  } finally {
    client.release();
  }
};

module.exports = {
  getSuppliers,
  createSupplier,
  getPurchaseOrders,
  createPurchaseOrder,
  receivePurchaseOrder,
};
