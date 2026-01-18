const MP_BASE = 'https://api.mercadopago.com';

function getToken() {
  return process.env.MERCADOPAGO_ACCESS_TOKEN || '';
}

interface MPCreatePaymentBody {
  transaction_amount: number;
  description: string;
  payment_method_id: string;
  external_reference?: string;
  payer: {
    email: string;
  };
}

export async function createPixPayment({ amount, description, external_reference }: { amount: number; description?: string; external_reference?: string }, idempotencyKey?: string) {
  const token = getToken();
  if (!token) throw new Error('mercadopago_token_missing');

  const body: MPCreatePaymentBody = {
    transaction_amount: Number(amount),
    description: description || 'Pagamento via PIX',
    payment_method_id: 'pix',
    external_reference: external_reference || undefined,
    payer: {
      email: 'no-reply@example.com',
    },
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
  if (idempotencyKey) {
    headers['x-idempotency-key'] = idempotencyKey;
  }

  const res = await fetch(`${MP_BASE}/v1/payments`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}

export async function getPayment(paymentId: string) {
  const token = getToken();
  if (!token) throw new Error('mercadopago_token_missing');

  const res = await fetch(`${MP_BASE}/v1/payments/${paymentId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}
