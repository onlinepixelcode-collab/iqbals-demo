/* =====================================================================
   PAYMENTS · DEMO MODE
   ---------------------------------------------------------------------
   Nothing is charged. `processPayment()` simulates a gateway response.

   ▶ TO GO LIVE WITH PAYFAST
   PayFast needs a server to sign the payment request and to receive
   the ITN (Instant Transaction Notification). Steps:
     1. Create a merchant account and note merchant_id + merchant_key.
     2. On your server, build the payment data (amount, item_name,
        m_payment_id, return_url, cancel_url, notify_url, customer
        details), generate the MD5 signature with your passphrase,
        and return it to the browser.
     3. Replace the body of `startPayFastPayment()` below with a POST of
        those signed fields to https://www.payfast.co.za/eng/process
        (sandbox: https://sandbox.payfast.co.za/eng/process).
     4. Mark the order paid only when your notify_url (ITN) confirms it.
   Yoco / Ozow (Instant EFT) follow the same pattern: create the
   checkout on your server, redirect, confirm via webhook.
   ===================================================================== */

export const PAYMENT_MODE = 'demo'; // 'demo' | 'live'

/**
 * ⚠️ PLACEHOLDER: real PayFast integration goes here.
 * @param {object} order  the order from store.placeOrder()
 * @returns {Promise<{ok:boolean, reference:string}>}
 */
export async function startPayFastPayment(order) {
  // const res = await fetch('/api/payfast/sign', { method: 'POST', body: JSON.stringify(order) });
  // const { fields, action } = await res.json();
  // const form = Object.assign(document.createElement('form'), { method: 'POST', action });
  // Object.entries(fields).forEach(([k, v]) => form.append(Object.assign(document.createElement('input'), { type: 'hidden', name: k, value: v })));
  // document.body.append(form); form.submit();
  throw new Error('PayFast is not connected yet. See src/lib/payments.js');
}

/** Simulated gateway: always approves after a short delay. */
export async function processPayment({ method, amount }) {
  if (PAYMENT_MODE === 'live' && method === 'card') return startPayFastPayment({ amount });
  await new Promise((r) => setTimeout(r, method === 'cash' ? 500 : 1800));
  return { ok: true, reference: 'TEST-' + Math.random().toString(36).slice(2, 10).toUpperCase() };
}

/* Light-weight card validation for the demo form */
export const luhn = (num) => {
  const d = num.replace(/\D/g, '');
  if (d.length < 12) return false;
  let sum = 0;
  for (let i = 0; i < d.length; i++) {
    let n = +d[d.length - 1 - i];
    if (i % 2) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
  }
  return sum % 10 === 0;
};
