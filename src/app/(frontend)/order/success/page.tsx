'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

function SuccessInner() {
  const searchParams = useSearchParams()
  const reference = searchParams.get('reference')
  const trxref = searchParams.get('trxref')
  const ref = reference || trxref
  const [msg, setMsg] = useState('Confirming payment…')

  useEffect(() => {
    if (!ref) {
      setMsg('Missing payment reference in URL.')
      return
    }
    fetch(`/api/paystack/verify?reference=${encodeURIComponent(ref)}`)
      .then(async (r) => {
        const data = await r.json()
        if (!r.ok) throw new Error(data.error || 'Verify failed')
        setMsg('Payment successful! Thank you for choosing Fizam Table Water.')
      })
      .catch(() =>
        setMsg(
          'We could not verify this payment automatically. If you were charged, email hello@fizam.ng with your reference.',
        ),
      )
  }, [ref])

  return (
    <div className="container mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-lg text-[#1a1f71]">{msg}</p>
      {ref && <p className="mt-4 text-sm text-gray-500">Reference: {ref}</p>}
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="p-24 text-center text-[#1a1f71]">Loading…</div>}>
      <SuccessInner />
    </Suspense>
  )
}
