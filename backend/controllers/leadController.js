const pool = require("../config/database");
const { sendSalesLeadEmail } = require("../utils/emailService");

const createLead = async (req, res) => {
  try {
    const { company_name, contact_name, email, phone, team_size, message } = req.body;

    if (!company_name || !contact_name || !email) {
      return res.status(400).json({
        message: "Company name, contact name, and email are required.",
      });
    }

    const result = await pool.query(
      `INSERT INTO sales_leads (company_name, contact_name, email, phone, team_size, message)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, company_name, contact_name, email, phone, team_size, message, status, created_at`,
      [company_name, contact_name, email, phone || null, team_size || null, message || null]
    );

    await sendSalesLeadEmail({
      lead: result.rows[0],
      to: process.env.SALES_EMAIL || process.env.EMAIL_FROM,
    });

    return res.status(201).json({
      message: "Demo request received. Our team will contact you shortly.",
      lead: result.rows[0],
    });
  } catch (error) {
    console.error("Create sales lead error:", error);
    return res.status(500).json({ message: "Failed to submit demo request" });
  }
};

module.exports = {
  createLead,
};
