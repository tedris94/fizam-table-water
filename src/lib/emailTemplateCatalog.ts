import { sampleOrderInvoiceVars } from '@/lib/orderInvoice'

export type EmailTemplateCategory = 'careers' | 'orders' | 'contact' | 'internal'
export type EmailTemplateLayout = 'careers' | 'branded' | 'plain'

export type EmailTemplateSlug =
  | 'careers-application-received'
  | 'careers-application-shortlisted'
  | 'careers-application-approved'
  | 'careers-application-rejected'
  | 'careers-hr-new-application'
  | 'contact-lead-notification'
  | 'order-confirmation'
  | 'order-processing'
  | 'order-delivered'
  | 'order-cancelled'
  | 'order-staff-new-order'

export type EmailTemplateDefinition = {
  slug: EmailTemplateSlug
  name: string
  description: string
  category: EmailTemplateCategory
  layout: EmailTemplateLayout
  variablesHelp: string
  subject: string
  textBody: string
  htmlBody: string
}

export const EMAIL_TEMPLATE_SLUGS: EmailTemplateSlug[] = [
  'careers-application-received',
  'careers-application-shortlisted',
  'careers-application-approved',
  'careers-application-rejected',
  'careers-hr-new-application',
  'contact-lead-notification',
  'order-confirmation',
  'order-processing',
  'order-delivered',
  'order-cancelled',
  'order-staff-new-order',
]

const REF_BLOCK = `<p style="margin:0 0 20px;padding:14px 16px;background:#eff6ff;border-radius:10px;border:1px solid #bfdbfe;font-size:14px;color:#1e3a8a;">
  <strong>Application reference:</strong> {{applicationRef}}<br>
  <span style="color:#64748b;font-size:13px;">Quote this reference in any correspondence with our HR team.</span>
</p>`

const ORDER_INVOICE_SECTION = `{{orderProgressHtml}}
{{invoiceTableHtml}}
{{invoiceTotalsHtml}}
<p style="margin:20px 0 8px;font-size:14px;font-weight:600;color:#1a1f71;">Delivery</p>
{{deliveryInfoHtml}}`

export const EMAIL_TEMPLATE_DEFAULTS: Record<EmailTemplateSlug, EmailTemplateDefinition> = {
  'careers-application-received': {
    slug: 'careers-application-received',
    name: 'Application received (applicant)',
    description: 'Sent to the applicant immediately after they submit a job application.',
    category: 'careers',
    layout: 'careers',
    variablesHelp:
      '{{firstName}}, {{applicantName}}, {{jobTitle}}, {{applicationRef}}, {{statusLabel}}, {{careersEmail}}, {{siteUrl}}',
    subject: 'Application received — {{jobTitle}} ({{applicationRef}})',
    textBody: `Dear {{firstName}},

Thank you for applying to Fizam Table Water.

Position: {{jobTitle}}
Reference: {{applicationRef}}
Status: {{statusLabel}}

We have received your application and our HR team will review it. You will receive an email when your status changes.

If you have questions, contact us at {{careersEmail}} and include your reference number.

— Fizam Table Water · Careers`,
    htmlBody: `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#374151;">Dear {{firstName}},</p>
<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#374151;">
  Thank you for applying to <strong>{{jobTitle}}</strong> at Fizam Table Water. This email confirms we received your application.
</p>
${REF_BLOCK}
<p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#1a1f71;">Current status</p>
<p style="margin:0 0 20px;font-size:15px;color:#374151;">
  <span style="display:inline-block;padding:6px 12px;background:#fef9c3;color:#854d0e;border-radius:999px;font-size:13px;font-weight:600;">{{statusLabel}}</span>
</p>
<p style="margin:0;font-size:14px;line-height:1.6;color:#64748b;">
  Our HR team will assess your application against the role requirements. We will email you again when there is an update — please allow a reasonable time for review.
</p>`,
  },
  'careers-application-shortlisted': {
    slug: 'careers-application-shortlisted',
    name: 'Application shortlisted (applicant)',
    description: 'Sent when HR shortlists an applicant.',
    category: 'careers',
    layout: 'careers',
    variablesHelp:
      '{{firstName}}, {{applicantName}}, {{jobTitle}}, {{applicationRef}}, {{statusLabel}}, {{careersEmail}}, {{siteUrl}}',
    subject: 'Shortlisted — {{jobTitle}} ({{applicationRef}})',
    textBody: `Dear {{firstName}},

You have been shortlisted

Position: {{jobTitle}}
Reference: {{applicationRef}}
Status: {{statusLabel}}

Congratulations — your application has passed our initial review and you are on our shortlist for this role. A member of our HR team may contact you shortly to discuss next steps, which may include an interview or further assessment.

Questions: {{careersEmail}}

— Fizam Table Water · Careers`,
    htmlBody: `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#374151;">Dear {{firstName}},</p>
<p style="margin:0 0 20px;font-size:18px;font-weight:600;color:#1a1f71;">You have been shortlisted</p>
${REF_BLOCK}
<p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#1a1f71;">Position</p>
<p style="margin:0 0 16px;font-size:15px;color:#374151;">{{jobTitle}}</p>
<p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#1a1f71;">Status</p>
<p style="margin:0 0 20px;">
  <span style="display:inline-block;padding:6px 12px;background:#dbeafe;color:#1d4ed8;border-radius:999px;font-size:13px;font-weight:600;">{{statusLabel}}</span>
</p>
<p style="margin:0;font-size:14px;line-height:1.6;color:#64748b;">Congratulations — your application has passed our initial review and you are on our shortlist for this role. A member of our HR team may contact you shortly to discuss next steps, which may include an interview or further assessment.</p>`,
  },
  'careers-application-approved': {
    slug: 'careers-application-approved',
    name: 'Application approved (applicant)',
    description: 'Sent when HR approves an applicant.',
    category: 'careers',
    layout: 'careers',
    variablesHelp:
      '{{firstName}}, {{applicantName}}, {{jobTitle}}, {{applicationRef}}, {{statusLabel}}, {{careersEmail}}, {{siteUrl}}',
    subject: 'Application approved — {{jobTitle}} ({{applicationRef}})',
    textBody: `Dear {{firstName}},

Your application has been approved

Position: {{jobTitle}}
Reference: {{applicationRef}}
Status: {{statusLabel}}

We are pleased to inform you that your application has been approved at this stage of our recruitment process. Our HR team will contact you directly regarding offer details, onboarding, or any remaining steps.

Questions: {{careersEmail}}

— Fizam Table Water · Careers`,
    htmlBody: `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#374151;">Dear {{firstName}},</p>
<p style="margin:0 0 20px;font-size:18px;font-weight:600;color:#1a1f71;">Your application has been approved</p>
${REF_BLOCK}
<p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#1a1f71;">Position</p>
<p style="margin:0 0 16px;font-size:15px;color:#374151;">{{jobTitle}}</p>
<p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#1a1f71;">Status</p>
<p style="margin:0 0 20px;">
  <span style="display:inline-block;padding:6px 12px;background:#dcfce7;color:#15803d;border-radius:999px;font-size:13px;font-weight:600;">{{statusLabel}}</span>
</p>
<p style="margin:0;font-size:14px;line-height:1.6;color:#64748b;">We are pleased to inform you that your application has been approved at this stage of our recruitment process. Our HR team will contact you directly regarding offer details, onboarding, or any remaining steps.</p>`,
  },
  'careers-application-rejected': {
    slug: 'careers-application-rejected',
    name: 'Application rejected (applicant)',
    description: 'Sent when HR rejects an applicant.',
    category: 'careers',
    layout: 'careers',
    variablesHelp:
      '{{firstName}}, {{applicantName}}, {{jobTitle}}, {{applicationRef}}, {{statusLabel}}, {{careersEmail}}, {{siteUrl}}',
    subject: 'Application update — {{jobTitle}} ({{applicationRef}})',
    textBody: `Dear {{firstName}},

Update on your application

Position: {{jobTitle}}
Reference: {{applicationRef}}
Status: {{statusLabel}}

Thank you again for your interest in Fizam Table Water and for the time you invested in your application. After careful consideration, we will not be progressing your application further for this role at this time. We encourage you to apply for future openings that match your experience.

Questions: {{careersEmail}}

— Fizam Table Water · Careers`,
    htmlBody: `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#374151;">Dear {{firstName}},</p>
<p style="margin:0 0 20px;font-size:18px;font-weight:600;color:#1a1f71;">Update on your application</p>
${REF_BLOCK}
<p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#1a1f71;">Position</p>
<p style="margin:0 0 16px;font-size:15px;color:#374151;">{{jobTitle}}</p>
<p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#1a1f71;">Status</p>
<p style="margin:0 0 20px;">
  <span style="display:inline-block;padding:6px 12px;background:#f3f4f6;color:#4b5563;border-radius:999px;font-size:13px;font-weight:600;">{{statusLabel}}</span>
</p>
<p style="margin:0;font-size:14px;line-height:1.6;color:#64748b;">Thank you again for your interest in Fizam Table Water and for the time you invested in your application. After careful consideration, we will not be progressing your application further for this role at this time. We encourage you to apply for future openings that match your experience.</p>`,
  },
  'careers-hr-new-application': {
    slug: 'careers-hr-new-application',
    name: 'New application alert (HR)',
    description: 'Internal notification when someone applies for a job.',
    category: 'internal',
    layout: 'plain',
    variablesHelp:
      '{{applicantName}}, {{applicantEmail}}, {{jobTitle}}, {{applicationRef}}, {{dashboardUrl}}, {{siteUrl}}',
    subject: '[Fizam Careers] New application — {{jobTitle}} ({{applicationRef}})',
    textBody: `A new job application was submitted.

Applicant: {{applicantName}}
Email: {{applicantEmail}}
Position: {{jobTitle}}
Reference: {{applicationRef}}

Review in dashboard: {{dashboardUrl}}`,
    htmlBody: `<p style="margin:0 0 12px;font-size:15px;color:#374151;">A new job application was submitted.</p>
<ul style="margin:0 0 16px;padding-left:20px;font-size:14px;line-height:1.7;color:#374151;">
  <li><strong>Applicant:</strong> {{applicantName}}</li>
  <li><strong>Email:</strong> {{applicantEmail}}</li>
  <li><strong>Position:</strong> {{jobTitle}}</li>
  <li><strong>Reference:</strong> {{applicationRef}}</li>
</ul>
<p style="margin:0;font-size:14px;"><a href="{{dashboardUrl}}" style="color:#2563eb;">Open applications dashboard</a></p>`,
  },
  'contact-lead-notification': {
    slug: 'contact-lead-notification',
    name: 'Contact form notification (staff)',
    description: 'Sent to staff when a visitor submits the contact form.',
    category: 'contact',
    layout: 'plain',
    variablesHelp: '{{name}}, {{email}}, {{phone}}, {{orderType}}, {{message}}',
    subject: '[Fizam Website] Message from {{name}}',
    textBody: `Name: {{name}}
Email: {{email}}
Phone: {{phone}}
Order type: {{orderType}}

{{message}}`,
    htmlBody: `<ul style="margin:0 0 16px;padding-left:20px;font-size:14px;line-height:1.7;color:#374151;">
  <li><strong>Name:</strong> {{name}}</li>
  <li><strong>Email:</strong> {{email}}</li>
  <li><strong>Phone:</strong> {{phone}}</li>
  <li><strong>Order type:</strong> {{orderType}}</li>
</ul>
<p style="margin:0;font-size:14px;line-height:1.6;color:#374151;white-space:pre-wrap;">{{message}}</p>`,
  },
  'order-confirmation': {
    slug: 'order-confirmation',
    name: 'Order confirmation (customer)',
    description: 'Sent to the customer after successful payment.',
    category: 'orders',
    layout: 'branded',
    variablesHelp:
      '{{customerName}}, {{orderRef}}, {{orderProgressHtml}}, {{invoiceTableHtml}}, {{invoiceTotalsHtml}}, {{deliveryInfoHtml}}, {{paymentReference}}, {{siteUrl}}',
    subject: 'Order confirmed — {{orderRef}}',
    textBody: `Hi {{customerName}},

Thank you for your order with Fizam Table Water.

Order reference: {{orderRef}}
Status: {{statusLabel}}
{{paymentReferenceLine}}

Items:
{{invoiceTableText}}

{{invoiceTotalsText}}

{{deliveryInfoText}}

We will prepare your order and notify you when it is on the way.

Questions? Contact us at {{ordersEmail}}.

— Fizam Table Water`,
    htmlBody: `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#374151;">Hi {{customerName}},</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">Thank you for your order. Your payment of <strong>{{totalFormatted}}</strong> was received successfully.</p>
<p style="margin:0 0 20px;padding:14px 16px;background:#eff6ff;border-radius:10px;border:1px solid #bfdbfe;font-size:14px;color:#1e3a8a;">
  <strong>Order reference:</strong> {{orderRef}}
</p>
${ORDER_INVOICE_SECTION}
<p style="margin:20px 0 0;font-size:14px;line-height:1.6;color:#64748b;">We will prepare your order and email you when it is on the way.</p>`,
  },
  'order-processing': {
    slug: 'order-processing',
    name: 'Order processing (customer)',
    description: 'Sent when the order is being prepared or dispatched.',
    category: 'orders',
    layout: 'branded',
    variablesHelp:
      '{{customerName}}, {{orderRef}}, {{orderProgressHtml}}, {{invoiceTableHtml}}, {{invoiceTotalsHtml}}, {{deliveryInfoHtml}}, {{statusLabel}}, {{siteUrl}}',
    subject: 'Your order is on the way — {{orderRef}}',
    textBody: `Hi {{customerName}},

Your Fizam Table Water order is now being prepared.

Order reference: {{orderRef}}
Status: {{statusLabel}}

Items:
{{invoiceTableText}}

{{invoiceTotalsText}}

{{deliveryInfoText}}

— Fizam Table Water`,
    htmlBody: `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#374151;">Hi {{customerName}},</p>
<p style="margin:0 0 20px;font-size:18px;font-weight:600;color:#1a1f71;">Your order is on the way</p>
<p style="margin:0 0 20px;padding:14px 16px;background:#eff6ff;border-radius:10px;border:1px solid #bfdbfe;font-size:14px;color:#1e3a8a;">
  <strong>Order reference:</strong> {{orderRef}}
</p>
${ORDER_INVOICE_SECTION}
<p style="margin:20px 0 0;font-size:14px;line-height:1.6;color:#64748b;">You will receive another email when your order has been delivered.</p>`,
  },
  'order-delivered': {
    slug: 'order-delivered',
    name: 'Order delivered (customer)',
    description: 'Sent when the order is marked as delivered.',
    category: 'orders',
    layout: 'branded',
    variablesHelp:
      '{{customerName}}, {{orderRef}}, {{orderProgressHtml}}, {{invoiceTableHtml}}, {{invoiceTotalsHtml}}, {{statusLabel}}, {{siteUrl}}',
    subject: 'Order delivered — {{orderRef}}',
    textBody: `Hi {{customerName}},

Your Fizam Table Water order has been delivered.

Order reference: {{orderRef}}

Items:
{{invoiceTableText}}

{{invoiceTotalsText}}

Thank you for choosing Fizam Table Water.

Order again: {{siteUrl}}/order

— Fizam Table Water`,
    htmlBody: `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#374151;">Hi {{customerName}},</p>
<p style="margin:0 0 20px;font-size:18px;font-weight:600;color:#1a1f71;">Your order has been delivered</p>
<p style="margin:0 0 20px;padding:14px 16px;background:#f0fdf4;border-radius:10px;border:1px solid #bbf7d0;font-size:14px;color:#166534;">
  <strong>Order reference:</strong> {{orderRef}}
</p>
${ORDER_INVOICE_SECTION}
<p style="margin:20px 0 0;font-size:14px;line-height:1.6;color:#64748b;">Thank you for choosing Fizam Table Water!</p>
<p style="margin:16px 0 0;font-size:14px;"><a href="{{siteUrl}}/order" style="color:#2563eb;font-weight:600;">Order again →</a></p>`,
  },
  'order-cancelled': {
    slug: 'order-cancelled',
    name: 'Order cancelled (customer)',
    description: 'Sent when an order is cancelled.',
    category: 'orders',
    layout: 'branded',
    variablesHelp: '{{customerName}}, {{orderRef}}, {{orderId}}, {{totalFormatted}}, {{statusLabel}}, {{ordersEmail}}, {{siteUrl}}',
    subject: 'Order cancelled — {{orderRef}}',
    textBody: `Hi {{customerName}},

Your order {{orderRef}} has been cancelled.

Status: {{statusLabel}}
Order total: {{totalFormatted}}

If you did not request this cancellation or have questions about a refund, please contact us at {{ordersEmail}} and quote your order reference.

— Fizam Table Water`,
    htmlBody: `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#374151;">Hi {{customerName}},</p>
<p style="margin:0 0 20px;font-size:18px;font-weight:600;color:#1a1f71;">Your order has been cancelled</p>
<p style="margin:0 0 20px;padding:14px 16px;background:#fef2f2;border-radius:10px;border:1px solid #fecaca;font-size:14px;color:#991b1b;">
  <strong>Order reference:</strong> {{orderRef}}
</p>
<p style="margin:0 0 20px;">
  <span style="display:inline-block;padding:6px 12px;background:#f3f4f6;color:#4b5563;border-radius:999px;font-size:13px;font-weight:600;">{{statusLabel}}</span>
</p>
<p style="margin:0;font-size:14px;line-height:1.6;color:#64748b;">If you did not request this cancellation or need help with a refund, contact us at <a href="mailto:{{ordersEmail}}" style="color:#2563eb;">{{ordersEmail}}</a> and include your order reference.</p>`,
  },
  'order-staff-new-order': {
    slug: 'order-staff-new-order',
    name: 'New order alert (staff)',
    description: 'Internal notification when a customer completes payment.',
    category: 'internal',
    layout: 'plain',
    variablesHelp:
      '{{customerName}}, {{customerEmail}}, {{customerPhone}}, {{orderRef}}, {{invoiceTableHtml}}, {{invoiceTotalsHtml}}, {{deliveryInfoHtml}}, {{dashboardUrl}}, {{siteUrl}}',
    subject: '[Fizam Orders] New paid order — {{orderRef}}',
    textBody: `A new paid order was placed.

Customer: {{customerName}}
Email: {{customerEmail}}
Phone: {{customerPhone}}
Reference: {{orderRef}}
Total: {{totalFormatted}}

Items:
{{invoiceTableText}}

{{invoiceTotalsText}}

{{deliveryInfoText}}

Manage in dashboard: {{dashboardUrl}}`,
    htmlBody: `<p style="margin:0 0 12px;font-size:15px;color:#374151;">A new <strong>paid</strong> order was placed.</p>
<ul style="margin:0 0 16px;padding-left:20px;font-size:14px;line-height:1.7;color:#374151;">
  <li><strong>Customer:</strong> {{customerName}}</li>
  <li><strong>Email:</strong> {{customerEmail}}</li>
  <li><strong>Phone:</strong> {{customerPhone}}</li>
  <li><strong>Reference:</strong> {{orderRef}}</li>
  <li><strong>Total:</strong> {{totalFormatted}}</li>
</ul>
{{invoiceTableHtml}}
{{invoiceTotalsHtml}}
<p style="margin:16px 0 8px;font-size:14px;font-weight:600;color:#1a1f71;">Delivery</p>
{{deliveryInfoHtml}}
<p style="margin:16px 0 0;font-size:14px;"><a href="{{dashboardUrl}}" style="color:#2563eb;">Open orders dashboard</a></p>`,
  },
}

const ORDER_SAMPLE_DELIVERY = {
  deliveryInfoText: 'Home delivery\n12 Admiralty Way, Lekki, Lagos',
  deliveryInfoHtml:
    '<p style="margin:0;font-size:14px;line-height:1.6;color:#374151;"><strong>Home delivery</strong><br>12 Admiralty Way, Lekki, Lagos</p>',
}

function orderTemplateSample(status: 'paid' | 'processing' | 'delivered') {
  const inv = sampleOrderInvoiceVars(status)
  return {
    customerName: 'John Doe',
    orderRef: 'FZ-ORD-2026-00104',
    orderId: '104',
    totalFormatted: '₦45,750',
    paymentReference: 'PAY-ABC123',
    paymentReferenceLine: 'Payment reference: PAY-ABC123',
    statusLabel: status === 'paid' ? 'Payment received' : status === 'processing' ? 'Being prepared' : 'Delivered',
    ordersEmail: 'sales@fizam.ng',
    siteUrl: 'https://fizam.ng',
    ...ORDER_SAMPLE_DELIVERY,
    ...inv,
  }
}

export const EMAIL_TEMPLATE_SAMPLE_VARS: Record<EmailTemplateSlug, Record<string, string>> = {
  'careers-application-received': {
    firstName: 'Ada',
    applicantName: 'Ada Okonkwo',
    jobTitle: 'Production Supervisor',
    applicationRef: 'FZ-APP-2026-00042',
    statusLabel: 'Under review',
    careersEmail: 'hr@fizam.ng',
    siteUrl: 'https://fizam.ng',
  },
  'careers-application-shortlisted': {
    firstName: 'Ada',
    applicantName: 'Ada Okonkwo',
    jobTitle: 'Production Supervisor',
    applicationRef: 'FZ-APP-2026-00042',
    statusLabel: 'Shortlisted',
    careersEmail: 'hr@fizam.ng',
    siteUrl: 'https://fizam.ng',
  },
  'careers-application-approved': {
    firstName: 'Ada',
    applicantName: 'Ada Okonkwo',
    jobTitle: 'Production Supervisor',
    applicationRef: 'FZ-APP-2026-00042',
    statusLabel: 'Approved',
    careersEmail: 'hr@fizam.ng',
    siteUrl: 'https://fizam.ng',
  },
  'careers-application-rejected': {
    firstName: 'Ada',
    applicantName: 'Ada Okonkwo',
    jobTitle: 'Production Supervisor',
    applicationRef: 'FZ-APP-2026-00042',
    statusLabel: 'Not progressing',
    careersEmail: 'hr@fizam.ng',
    siteUrl: 'https://fizam.ng',
  },
  'careers-hr-new-application': {
    applicantName: 'Ada Okonkwo',
    applicantEmail: 'ada@example.com',
    jobTitle: 'Production Supervisor',
    applicationRef: 'FZ-APP-2026-00042',
    dashboardUrl: 'https://fizam.ng/dashboard/applications',
    siteUrl: 'https://fizam.ng',
  },
  'contact-lead-notification': {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+234 800 000 0000',
    orderType: 'Bulk delivery',
    message: 'I would like a quote for 500 cartons.',
  },
  'order-confirmation': orderTemplateSample('paid'),
  'order-processing': orderTemplateSample('processing'),
  'order-delivered': orderTemplateSample('delivered'),
  'order-cancelled': {
    customerName: 'John Doe',
    orderRef: 'FZ-ORD-2026-00104',
    orderId: '104',
    totalFormatted: '₦45,750',
    statusLabel: 'Cancelled',
    ordersEmail: 'sales@fizam.ng',
    siteUrl: 'https://fizam.ng',
  },
  'order-staff-new-order': {
    ...orderTemplateSample('paid'),
    customerEmail: 'john@example.com',
    customerPhone: '+234 800 000 0000',
    dashboardUrl: 'https://fizam.ng/dashboard/orders',
  },
}

export function isEmailTemplateSlug(value: string): value is EmailTemplateSlug {
  return EMAIL_TEMPLATE_SLUGS.includes(value as EmailTemplateSlug)
}

import {
  canEditEmailTemplateCategory,
  hasCapability,
  capabilitiesForRoleSlug,
} from '@/lib/capabilities'

export function canViewEmailTemplates(
  role: string | undefined,
  capabilities?: string[],
): boolean {
  if (capabilities) return hasCapability(capabilities, 'email.templates')
  return hasCapability(capabilitiesForRoleSlug(role), 'email.templates')
}

export function canEditEmailTemplate(
  role: string | undefined,
  category: EmailTemplateCategory,
  capabilities?: string[],
): boolean {
  const caps = capabilities ?? capabilitiesForRoleSlug(role)
  return canEditEmailTemplateCategory(caps, category)
}
