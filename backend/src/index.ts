import express, { Request, Response } from 'express'
import Razorpay from 'razorpay'
import cors from 'cors'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'

dotenv.config()

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_SK1f5eUajZ6FJa'
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'NkkooiFN8mpWirA34qzvqM48'

const razorpay = new (Razorpay as any)({
	key_id: RAZORPAY_KEY_ID,
	key_secret: RAZORPAY_KEY_SECRET,
})

const app = express()
app.use(cors())
app.use(bodyParser.json())

app.get('/health', (_req: Request, res: Response) => res.json({ ok: true }))

// Create a Razorpay order. Expects { amount: number } where amount is in rupees.
app.post('/api/razorpay/create-order', async (req: Request, res: Response) => {
	try {
		const { amount, currency = 'INR', receipt, notes } = req.body as any
		if (typeof amount !== 'number') {
			return res.status(400).json({ error: 'amount (number, in rupees) required' })
		}
		const amountPaise = Math.round(amount * 100)
		const options = {
			amount: amountPaise,
			currency,
			receipt: receipt || `rcpt_${Date.now()}`,
			payment_capture: 1,
			notes: notes || {},
		}
		const order = await razorpay.orders.create(options)
		return res.json({ order, key_id: RAZORPAY_KEY_ID })
	} catch (err: any) {
		console.error('Razorpay create-order error:', err)
		return res.status(500).json({ error: err?.message || 'Internal server error' })
	}
})

const port = process.env.PORT ? Number(process.env.PORT) : 4001
app.listen(port, () => {
	console.log(`Backend server running on http://localhost:${port}`)
})
