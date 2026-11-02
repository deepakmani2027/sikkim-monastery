import { NextResponse } from "next/server"
import Razorpay from 'razorpay'
import crypto from 'node:crypto'

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET

function getRazorpayClient() {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay is not configured')
  }
  return new (Razorpay as any)({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET })
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const id = `req_${Date.now()}`

    if (body?.action === 'confirm_payment') {
      if (!RAZORPAY_KEY_SECRET) {
        return NextResponse.json({ error: 'payment_verification_unavailable' }, { status: 503 })
      }
      const payment = body?.payment
      if (!body?.requestId || !payment?.razorpay_order_id || !payment?.razorpay_payment_id || !payment?.razorpay_signature) {
        return NextResponse.json({ error: 'invalid_payment_confirmation' }, { status: 400 })
      }
      const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(`${payment.razorpay_order_id}|${payment.razorpay_payment_id}`)
        .digest('hex')
      const receivedSignature = Buffer.from(String(payment.razorpay_signature))
      const expectedSignatureBuffer = Buffer.from(expectedSignature)
      if (
        receivedSignature.length !== expectedSignatureBuffer.length ||
        !crypto.timingSafeEqual(expectedSignatureBuffer, receivedSignature)
      ) {
        return NextResponse.json({ error: 'payment_signature_invalid' }, { status: 400 })
      }
      return NextResponse.json({ confirmed: true, requestId: body.requestId }, { status: 200 })
    }

    // If a bill total is present, create a Razorpay order and return it
    const total = body?.bill?.total
    if (typeof total === 'number' && total > 0) {
      try {
        const razorpay = getRazorpayClient()
        const amountPaise = Math.round(total * 100)
        const options = {
          amount: amountPaise,
          currency: 'INR',
          receipt: `rcpt_${id}`,
          payment_capture: 1,
          notes: { type: body.type || 'service', requestId: id }
        }
        const order = await razorpay.orders.create(options)
        return NextResponse.json({ id, order, key_id: RAZORPAY_KEY_ID, received: body }, { status: 201 })
      } catch (err: any) {
        console.error('Razorpay order creation failed', err)
        return NextResponse.json({ error: 'payment_creation_failed', detail: err?.message || String(err) }, { status: 502 })
      }
    }

    return NextResponse.json({ id, received: body }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 })
  }
}
