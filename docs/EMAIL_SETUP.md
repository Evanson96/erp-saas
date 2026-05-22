# Email Notification Setup

The backend uses Nodemailer for SMTP email delivery.

## Local Development

If SMTP variables are empty, emails are not sent. The backend logs the email preview to the terminal instead.

## Environment Variables

Add these to `backend/.env` in development or to your hosting provider in production:

```env
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
EMAIL_FROM="ERP SaaS <no-reply@your-domain.com>"
```

## Recommended Providers

- SendGrid
- Mailgun
- Amazon SES
- Postmark
- Gmail app password for testing only

## Emails Sent

- Customer welcome email after customer portal registration.
- Customer order confirmation after order placement.
- Company new order notification after a customer places an order.
- Customer invoice email after invoice generation.
- Customer payment receipt after payment recording.

## Production Notes

- Use a verified sending domain.
- Configure SPF, DKIM, and DMARC records.
- Do not use a personal Gmail account for production.
- Store SMTP credentials only as environment variables.
