const pool = require("../config/database");
const { writeAuditLog } = require("../utils/auditLogger");

const getProducts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, company_id, name, sku, description, price, stock_quantity, reorder_level, is_active, created_at, updated_at
       FROM products
       WHERE company_id = $1
       ORDER BY id DESC`,
      [req.user.company_id]
    );

    return res.status(200).json({ products: result.rows });
  } catch (error) {
    console.error("Get products error:", error);
    return res.status(500).json({ message: "Failed to get products" });
  }
};

const getProductById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, company_id, name, sku, description, price, stock_quantity, reorder_level, is_active, created_at, updated_at
       FROM products
       WHERE id = $1 AND company_id = $2`,
      [req.params.id, req.user.company_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({ product: result.rows[0] });
  } catch (error) {
    console.error("Get product error:", error);
    return res.status(500).json({ message: "Failed to get product" });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, sku, description, price, stock_quantity, reorder_level } = req.body;

    if (!name || !sku) {
      return res.status(400).json({ message: "Product name and SKU are required" });
    }

    const result = await pool.query(
      `INSERT INTO products (company_id, name, sku, description, price, stock_quantity, reorder_level)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, company_id, name, sku, description, price, stock_quantity, reorder_level, is_active, created_at, updated_at`,
      [
        req.user.company_id,
        name,
        sku,
        description || null,
        price || 0,
        stock_quantity || 0,
        reorder_level || 0,
      ]
    );

    await writeAuditLog({
      req,
      companyId: req.user.company_id,
      actorId: req.user.id,
      actorEmail: req.user.email,
      action: "product.created",
      entityType: "product",
      entityId: result.rows[0].id,
      details: { sku: result.rows[0].sku, name: result.rows[0].name },
    });

    return res.status(201).json({
      message: "Product created successfully",
      product: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "A product with this SKU already exists" });
    }

    console.error("Create product error:", error);
    return res.status(500).json({ message: "Failed to create product" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { name, sku, description, price, stock_quantity, reorder_level, is_active } = req.body;

    if (!name || !sku) {
      return res.status(400).json({ message: "Product name and SKU are required" });
    }

    const result = await pool.query(
      `UPDATE products
       SET name = $1,
           sku = $2,
           description = $3,
           price = $4,
           stock_quantity = $5,
           reorder_level = $6,
           is_active = $7,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 AND company_id = $9
       RETURNING id, company_id, name, sku, description, price, stock_quantity, reorder_level, is_active, created_at, updated_at`,
      [
        name,
        sku,
        description || null,
        price || 0,
        stock_quantity || 0,
        reorder_level || 0,
        typeof is_active === "boolean" ? is_active : true,
        req.params.id,
        req.user.company_id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    await writeAuditLog({
      req,
      companyId: req.user.company_id,
      actorId: req.user.id,
      actorEmail: req.user.email,
      action: "product.updated",
      entityType: "product",
      entityId: result.rows[0].id,
      details: { sku: result.rows[0].sku, name: result.rows[0].name },
    });

    return res.status(200).json({
      message: "Product updated successfully",
      product: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "A product with this SKU already exists" });
    }

    console.error("Update product error:", error);
    return res.status(500).json({ message: "Failed to update product" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM products
       WHERE id = $1 AND company_id = $2
       RETURNING id`,
      [req.params.id, req.user.company_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    await writeAuditLog({
      req,
      companyId: req.user.company_id,
      actorId: req.user.id,
      actorEmail: req.user.email,
      action: "product.deleted",
      entityType: "product",
      entityId: result.rows[0].id,
    });

    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    if (error.code === "23503") {
      return res.status(409).json({ message: "Product cannot be deleted because it is used in an order" });
    }

    console.error("Delete product error:", error);
    return res.status(500).json({ message: "Failed to delete product" });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
