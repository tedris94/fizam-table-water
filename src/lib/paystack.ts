const PAYSTACK_API = 'https://api.paystack.co'

function secretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY
  if (!key) {
    throw new Error('PAYSTACK_SECRET_KEY is not set')
  }
  return key
}

export async function paystackInitialize(opts: {
  email: string
  amountKobo: number
  reference: string
  metadata?: Record<string, unknown>
  callbackUrl?: string
}) {
  const res = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: opts.email,
      amount: opts.amountKobo,
      reference: opts.reference,
      metadata: opts.metadata,
      callback_url: opts.callbackUrl,
    }),
  })

  const json = (await res.json()) as {
    status: boolean
    message?: string
    data?: { authorization_url: string; reference: string; access_code?: string }
  }

  if (!res.ok || !json.status || !json.data?.authorization_url) {
    throw new Error(json.message || 'Paystack initialize failed')
  }

  return json.data
}

export async function paystackVerify(reference: string) {
  const res = await fetch(`${PAYSTACK_API}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: {
      Authorization: `Bearer ${secretKey()}`,
    },
    cache: 'no-store',
  })

  const json = (await res.json()) as {
    status: boolean
    message?: string
    data?: {
      status: string
      reference: string
      metadata?: { orderId?: string | number }
      customer?: { email?: string }
      amount?: number
    }
  }

  if (!res.ok || !json.status || !json.data) {
    throw new Error(json.message || 'Paystack verify failed')
  }

  return json.data
}
