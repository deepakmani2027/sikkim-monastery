import { useState } from "react"
import { Mail, Check } from "lucide-react"
import { HeroButton } from "@/components/ui/hero-button"
import { Input } from "@/components/ui/input"

const Newsletter = () => {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email.trim()) {
      setError("Please enter your email address")
      return
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address")
      return
    }

    setIsLoading(true)

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsSubscribed(true)
      setEmail("")
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubscribed) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="card-gradient rounded-2xl p-8 shadow-soft">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground mb-4">
              Welcome to Our Heritage Community!
            </h3>
            <p className="text-muted-foreground">
              Thank you for subscribing! You'll receive updates about new virtual tours, 
              digital archive additions, festival celebrations, and monastery preservation efforts.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="card-gradient rounded-2xl p-8 md:p-12 shadow-soft text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          
          <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
            Stay Connected to <span className="text-primary">Sacred Heritage</span>
          </h3>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get updates on new virtual tours, digital archive discoveries, festival celebrations, 
            and monastery preservation initiatives. Join our community of heritage enthusiasts.
          </p>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                  disabled={isLoading}
                  aria-label="Email address"
                />
                {error && (
                  <p className="text-destructive text-sm mt-2 text-left" role="alert">
                    {error}
                  </p>
                )}
              </div>
              <HeroButton 
                type="submit" 
                variant="primary" 
                disabled={isLoading}
                className="h-12 px-8"
              >
                {isLoading ? "Subscribing..." : "Subscribe"}
              </HeroButton>
            </div>
          </form>

          <p className="text-xs text-muted-foreground mt-4">
            We respect your privacy. Unsubscribe at any time. No spam, ever.
          </p>

          {/* Newsletter Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 text-sm">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <div className="w-2 h-2 bg-secondary rounded-full" />
              <span>Virtual tour updates</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <div className="w-2 h-2 bg-secondary rounded-full" />
              <span>Archive discoveries</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <div className="w-2 h-2 bg-secondary rounded-full" />
              <span>Festival calendars</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Newsletter