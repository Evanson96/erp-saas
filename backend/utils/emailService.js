const nodemailer = require("nodemailer");

const isEmailConfigured = () => {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
};

const createTransporter = () => {
  if (!isEmailConfigured()) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  if (!to) {
    return { skipped: true, reason: "Missing recipient" };
  }

  const transporter = createTransporter();

  if (!transporter) {
    console.log("Email not sent because SMTP is not configured:", {
      to,
      subject,
      preview: text || html,
    });
    return { skipped: true, reason: "SMTP not configured" };
  }

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || "ERP SaaS <no-reply@erp-saas.local>",
    to,
    subject,
    text,
    html,
  });

  return { skipped: false, messageId: info.messageId };
};

const currency = (amount) => {
  return `KES ${Number(amount || 0).toLocaleString()}`;
};

const sendCustomerWelcomeEmail = async ({ customerEmail, customerName, companyName }) => {
  return sendEmail({
    to: customerEmail,
    subject: `Welcome to ${companyName || "the customer portal"}`,
    text: `Hello ${customerName}, your customer portal account is ready.`,
    html: `
      <h2>Welcome, ${customerName}</h2>
      <p>Your customer portal account for <strong>${companyName || "the company"}</strong> is ready.</p>
      <p>You can now browse products, place orders, and track your order history.</p>
    `,
  });
};

const sendCustomerOrderConfirmationEmail = async ({ customerEmail, customerName, order }) => {
  return sendEmail({
    to: customerEmail,
    subject: `Order received: ${order.order_number}`,
    text: `Hello ${customerName}, your order ${order.order_number} was received. Total: ${currency(order.total_amount)}.`,
    html: `
      <h2>Order received</h2>
      <p>Hello ${customerName}, your order <strong>${order.order_number}</strong> was received.</p>
      <p><strong>Total:</strong> ${currency(order.total_amount)}</p>
      <p>Status: ${order.status}</p>
    `,
  });
};

const sendCompanyNewOrderEmail = async ({ companyEmail, companyName, customerName, order }) => {
  return sendEmail({
    to: companyEmail,
    subject: `New customer order: ${order.order_number}`,
    text: `${customerName} placed order ${order.order_number} for ${currency(order.total_amount)}.`,
    html: `
      <h2>New customer order</h2>
      <p><strong>${customerName}</strong> placed a new order for ${companyName || "your company"}.</p>
      <p><strong>Order:</strong> ${order.order_number}</p>
      <p><strong>Total:</strong> ${currency(order.total_amount)}</p>
    `,
  });
};

const sendInvoiceEmail = async ({ customerEmail, customerName, invoice }) => {
  return sendEmail({
    to: customerEmail,
    subject: `Invoice ${invoice.invoice_number}`,
    text: `Hello ${customerName}, invoice ${invoice.invoice_number} has been issued. Balance due: ${currency(invoice.balance_due)}.`,
    html: `
      <h2>Invoice issued</h2>
      <p>Hello ${customerName}, invoice <strong>${invoice.invoice_number}</strong> has been issued.</p>
      <p><strong>Total:</strong> ${currency(invoice.total_amount)}</p>
      <p><strong>Balance due:</strong> ${currency(invoice.balance_due)}</p>
    `,
  });
};

const sendPaymentReceiptEmail = async ({ customerEmail, customerName, payment, invoice }) => {
  return sendEmail({
    to: customerEmail,
    subject: `Payment received for ${invoice.invoice_number}`,
    text: `Hello ${customerName}, we received your payment of ${currency(payment.amount)} for ${invoice.invoice_number}.`,
    html: `
      <h2>Payment received</h2>
      <p>Hello ${customerName}, your payment has been recorded.</p>
      <p><strong>Invoice:</strong> ${invoice.invoice_number}</p>
      <p><strong>Amount:</strong> ${currency(payment.amount)}</p>
      <p><strong>Remaining balance:</strong> ${currency(invoice.balance_due)}</p>
    `,
  });
};

module.exports = {
  sendCustomerWelcomeEmail,
  sendCustomerOrderConfirmationEmail,
  sendCompanyNewOrderEmail,
  sendInvoiceEmail,
  sendPaymentReceiptEmail,
};
