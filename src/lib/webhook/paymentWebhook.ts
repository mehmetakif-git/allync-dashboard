// src/lib/webhooks/paymentWebhook.ts
// Payment Webhook Handler - Triggers Service Reactivation

import { supabase } from '../supabase';
import { SuspensionHandler } from '../services/suspensionHandler';
import type { PaymentWebhookData } from '../services/types';

// =====================================================
// PAYMENT SUCCESS HANDLER
// =====================================================

export async function handlePaymentSuccess(data: PaymentWebhookData): Promise<boolean> {
  console.log('💰 [PaymentWebhook] Payment success received:', {
    invoiceId: data.invoiceId,
    amount: data.amount,
    gateway: data.paymentGateway,
  });

  try {
    // 1. Update invoice status
    const { data: invoice, error: updateError } = await supabase
      .from('invoices')
      .update({
        status: 'paid',
        paid_at: data.paidAt,
        payment_gateway: data.paymentGateway,
        gateway_payment_id: data.gatewayPaymentId,
      })
      .eq('id', data.invoiceId)
      .select(`
        *,
        companies(id, name, email),
        company_services(id, service_name, status)
      `)
      .single();

    if (updateError) {
      console.error('❌ [PaymentWebhook] Update invoice error:', updateError);
      throw updateError;
    }

    console.log('✅ [PaymentWebhook] Invoice marked as paid:', invoice.invoice_number);

    // 2. Reactivate service if suspended
    if (invoice.service_id) {
      const reactivated = await SuspensionHandler.reactivateOnPayment(data.invoiceId);
      
      if (reactivated) {
        console.log('✅ [PaymentWebhook] Service reactivated');
      } else {
        console.log('⚠️ [PaymentWebhook] Service reactivation failed or not needed');
      }
    }

    // 3. Send payment confirmation email
    await sendPaymentConfirmation({
      companyName: invoice.companies?.name || 'Unknown',
      companyEmail: invoice.companies?.email || '',
      invoiceNumber: invoice.invoice_number,
      amount: data.amount,
      paidAt: data.paidAt,
      serviceName: invoice.company_services?.service_name,
    });

    console.log('✅ [PaymentWebhook] Payment processed successfully');
    return true;

  } catch (error) {
    console.error('❌ [PaymentWebhook] Error:', error);
    return false;
  }
}

// =====================================================
// PAYMENT FAILED HANDLER
// =====================================================

export async function handlePaymentFailed(data: {
  invoiceId: string;
  reason: string;
  gateway: string;
}): Promise<boolean> {
  console.log('❌ [PaymentWebhook] Payment failed:', data);

  try {
    // Log the failure
    const { error } = await supabase
      .from('invoices')
      .update({
        notes: `Payment failed: ${data.reason}. Previous notes: ${data.invoiceId}`,
      })
      .eq('id', data.invoiceId);

    if (error) throw error;

    // Send failure notification to company
    const { data: invoice } = await supabase
      .from('invoices')
      .select(`
        *,
        companies(name, email)
      `)
      .eq('id', data.invoiceId)
      .single();

    if (invoice && invoice.companies) {
      await sendPaymentFailureNotification({
        companyName: invoice.companies.name,
        companyEmail: invoice.companies.email,
        invoiceNumber: invoice.invoice_number,
        reason: data.reason,
      });
    }

    return true;

  } catch (error) {
    console.error('❌ [PaymentWebhook] Error handling failure:', error);
    return false;
  }
}

// =====================================================
// WEBHOOK VERIFICATION (PayTR Example)
// =====================================================

export function verifyPayTRWebhook(
  merchantOid: string,
  status: string,
  totalAmount: string,
  hash: string,
  merchantKey: string,
  merchantSalt: string
): boolean {
  // PayTR hash verification
  const crypto = require('crypto');
  const hashStr = `${merchantOid}${merchantSalt}${status}${totalAmount}`;
  const computedHash = crypto
    .createHmac('sha256', merchantKey)
    .update(hashStr)
    .digest('base64');

  return hash === computedHash;
}

// =====================================================
// WEBHOOK VERIFICATION (Stripe Example)
// =====================================================

export function verifyStripeWebhook(
  payload: string,
  signature: string,
  webhookSecret: string
): boolean {
  // Stripe signature verification
  try {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');

    return signature.split(',')[1]?.split('=')[1] === expectedSignature;
  } catch (error) {
    console.error('❌ Stripe webhook verification failed:', error);
    return false;
  }
}

// =====================================================
// NOTIFICATION FUNCTIONS
// =====================================================

async function sendPaymentConfirmation(data: {
  companyName: string;
  companyEmail: string;
  invoiceNumber: string;
  amount: number;
  paidAt: string;
  serviceName?: string;
}): Promise<void> {
  console.log('📧 [PaymentWebhook] Sending payment confirmation:', {
    to: data.companyEmail,
    invoice: data.invoiceNumber,
  });

  // TODO: Implement with Resend API
  /*
  await resend.emails.send({
    from: 'billing@allyncai.com',
    to: data.companyEmail,
    subject: `Payment Received - Invoice ${data.invoiceNumber}`,
    html: `
      <h2>Payment Received! 🎉</h2>
      <p>Dear ${data.companyName},</p>
      <p>We have successfully received your payment.</p>
      <ul>
        <li><strong>Invoice:</strong> ${data.invoiceNumber}</li>
        <li><strong>Amount:</strong> $${data.amount.toFixed(2)}</li>
        <li><strong>Date:</strong> ${new Date(data.paidAt).toLocaleDateString()}</li>
        ${data.serviceName ? `<li><strong>Service:</strong> ${data.serviceName}</li>` : ''}
      </ul>
      ${data.serviceName ? `<p>Your <strong>${data.serviceName}</strong> service is now active! 🚀</p>` : ''}
      <p>Thank you for your business!</p>
    `,
  });
  */
}

async function sendPaymentFailureNotification(data: {
  companyName: string;
  companyEmail: string;
  invoiceNumber: string;
  reason: string;
}): Promise<void> {
  console.log('📧 [PaymentWebhook] Sending payment failure notification:', {
    to: data.companyEmail,
    invoice: data.invoiceNumber,
  });

  // TODO: Implement with Resend API
  /*
  await resend.emails.send({
    from: 'billing@allyncai.com',
    to: data.companyEmail,
    subject: `Payment Failed - Invoice ${data.invoiceNumber}`,
    html: `
      <h2>Payment Failed</h2>
      <p>Dear ${data.companyName},</p>
      <p>We were unable to process your payment for invoice <strong>${data.invoiceNumber}</strong>.</p>
      <p><strong>Reason:</strong> ${data.reason}</p>
      <p>Please try again or contact our support team for assistance.</p>
    `,
  });
  */
}

// =====================================================
// WEBHOOK ENDPOINT HANDLER (Express Example)
// =====================================================

export async function handleWebhookRequest(req: any, res: any) {
  console.log('🔔 [PaymentWebhook] Webhook received');

  try {
    const { gateway, event, data } = req.body;

    // Verify webhook based on gateway
    let isValid = false;

    if (gateway === 'paytr') {
      isValid = verifyPayTRWebhook(
        data.merchant_oid,
        data.status,
        data.total_amount,
        data.hash,
        process.env.PAYTR_MERCHANT_KEY!,
        process.env.PAYTR_MERCHANT_SALT!
      );
    } else if (gateway === 'stripe') {
      isValid = verifyStripeWebhook(
        JSON.stringify(req.body),
        req.headers['stripe-signature'],
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    }

    if (!isValid) {
      console.error('❌ [PaymentWebhook] Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Handle different events
    if (event === 'payment.success' || event === 'charge.succeeded') {
      const webhookData: PaymentWebhookData = {
        invoiceId: data.invoiceId || data.metadata?.invoiceId,
        status: 'success',
        amount: parseFloat(data.amount || data.amount_total),
        paymentGateway: gateway,
        gatewayPaymentId: data.paymentId || data.id,
        paidAt: data.paidAt || new Date().toISOString(),
      };

      const success = await handlePaymentSuccess(webhookData);

      if (success) {
        return res.status(200).json({ message: 'Payment processed' });
      } else {
        return res.status(500).json({ error: 'Processing failed' });
      }
    }

    if (event === 'payment.failed' || event === 'charge.failed') {
      await handlePaymentFailed({
        invoiceId: data.invoiceId || data.metadata?.invoiceId,
        reason: data.failure_reason || 'Unknown',
        gateway,
      });

      return res.status(200).json({ message: 'Failure logged' });
    }

    // Unknown event
    console.log('⚠️ [PaymentWebhook] Unknown event:', event);
    return res.status(200).json({ message: 'Event received' });

  } catch (error) {
    console.error('❌ [PaymentWebhook] Handler error:', error);
    return res.status(500).json({ error: 'Internal error' });
  }
}

// =====================================================
// EXPORTS
// =====================================================

export const PaymentWebhook = {
  handleSuccess: handlePaymentSuccess,
  handleFailed: handlePaymentFailed,
  verifyPayTR: verifyPayTRWebhook,
  verifyStripe: verifyStripeWebhook,
  handleRequest: handleWebhookRequest,
};