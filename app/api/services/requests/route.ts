import { NextResponse } from "next/server"
import Razorpay from 'razorpay'

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_SK1f5eUajZ6FJa'
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'NkkooiFN8mpWirA34qzvqM48'
const razorpay = new (Razorpay as any)({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET })

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const id = `req_${Date.now()}`

    // If a bill total is present, create a Razorpay order and return it
    const total = body?.bill?.total
    if (typeof total === 'number' && total > 0) {
      try {
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
