const pool = require("../config/database");

const getDateFilter = ({ companyId, date_from, date_to, column = "created_at" }) => {
  const params = [companyId];
  let clause = "";

  if (date_from) {
    params.push(date_from);
    clause += ` AND ${column} >= $${params.length}`;
  }

  if (date_to) {
    params.push(date_to);
    clause += ` AND ${column} < ($${params.length}::date + INTERVAL '1 day')`;
  }

  return { clause, params };
};

const getJoinedDateFilter = ({ companyId, date_from, date_to }) => {
  return getDateFilter({ companyId, date_from, date_to, column: "orders.created_at" });
};

const getSummaryReport = async (req, res) => {
  try {
    const filter = getDateFilter({
      companyId: req.user.company_id,
      date_from: req.query.date_from,
      date_to: req.query.date_to,
    });

    const ordersResult = await pool.query(
      `SELECT COUNT(*)::int AS total_orders,
              COALESCE(SUM(total_amount), 0)::numeric AS total_sales
       FROM orders
       WHERE company_id = $1 ${filter.clause}`,
      filter.params
    );

    const invoicesResult = await pool.query(
      `SELECT COUNT(*)::int AS total_invoices,
              COALESCE(SUM(total_amount), 0)::numeric AS invoiced_amount,
              COALESCE(SUM(paid_amount), 0)::numeric AS paid_amount,
              COALESCE(SUM(balance_due), 0)::numeric AS balance_due
       FROM invoices
       WHERE company_id = $1 ${filter.clause}`,
      filter.params
    );

    const purchasesResult = await pool.query(
      `SELECT COUNT(*)::int AS total_purchase_orders,
              COALESCE(SUM(total_amount), 0)::numeric AS purchase_value
       FROM purchase_orders
       WHERE company_id = $1 ${filter.clause}`,
      filter.params
    );

    const inventoryResult = await pool.query(
      `SELECT COUNT(*)::int AS total_products,
              COALESCE(SUM(price * stock_quantity), 0)::numeric AS inventory_value,
              COUNT(*) FILTER (WHERE stock_quantity <= reorder_level)::int AS low_stock_count
       FROM products
       WHERE company_id = $1`,
      [req.user.company_id]
    );

    const salesFilter = getJoinedDateFilter({
      companyId: req.user.company_id,
      date_from: req.query.date_from,
      date_to: req.query.date_to,
    });

    const salesByProductResult = await pool.query(
      `SELECT products.name,
              products.sku,
              SUM(order_items.quantity)::int AS quantity_sold,
              SUM(order_items.line_total)::numeric AS sales_amount
       FROM order_items
       JOIN products ON products.id = order_items.product_id
       JOIN orders ON orders.id = order_items.order_id
       WHERE order_items.company_id = $1 ${salesFilter.clause}
       GROUP BY products.id, products.name, products.sku
       ORDER BY sales_amount DESC
       LIMIT 10`,
      salesFilter.params
    );

    const salesByCustomerResult = await pool.query(
      `SELECT customers.name,
              customers.email,
              COUNT(orders.id)::int AS orders_count,
              SUM(orders.total_amount)::numeric AS sales_amount
       FROM orders
       JOIN customers ON customers.id = orders.customer_id
       WHERE orders.company_id = $1 ${salesFilter.clause}
       GROUP BY customers.id, customers.name, customers.email
       ORDER BY sales_amount DESC
       LIMIT 10`,
      salesFilter.params
    );

    const paymentMethodsResult = await pool.query(
      `SELECT method,
              COUNT(*)::int AS payments_count,
              COALESCE(SUM(amount), 0)::numeric AS amount
       FROM payments
       WHERE company_id = $1 ${filter.clause}
       GROUP BY method
       ORDER BY amount DESC`,
      filter.params
    );

    return res.status(200).json({
      summary: {
        ...ordersResult.rows[0],
        ...invoicesResult.rows[0],
        ...purchasesResult.rows[0],
        ...inventoryResult.rows[0],
      },
      salesByProduct: salesByProductResult.rows,
      salesByCustomer: salesByCustomerResult.rows,
      paymentMethods: paymentMethodsResult.rows,
    });
  } catch (error) {
    console.error("Get summary report error:", error);
    return res.status(500).json({ message: "Failed to load reports" });
  }
};

module.exports = {
  getSummaryReport,
};
