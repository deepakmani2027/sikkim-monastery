declare module 'razorpay' {
  interface RazorpayOptions {
    key_id?: string
    key_secret?: string
  }
  interface OrderOptions {
    amount: number
    currency?: string
    receipt?: string
    payment_capture?: number
    notes?: Record<string, any>
  }
  interface Order {
    id: string
    amount: number
    currency: string
    [key: string]: any
  }
  class Razorpay {
    constructor(opts: RazorpayOptions)
    orders: {
      create(opts: OrderOptions): Promise<Order>
    }
  }
  export default Razorpay
}
