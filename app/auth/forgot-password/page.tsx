'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const { showToast } = useToast()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      showToast('Please enter your email', 'error')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Something went wrong')
      }
      setSent(true)
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Something went wrong',
        'error'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto"
          >
            <div className="text-center mb-8">
              <h1 className="font-display text-4xl text-black mb-3">
                FORGOT PASSWORD
              </h1>
              <p className="text-gray-600">
                Enter your email and we&apos;ll send you a reset link
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm">
              {sent ? (
                <div className="text-center py-4">
                  <CheckCircle2
                    size={48}
                    className="text-green-500 mx-auto mb-4"
                  />
                  <h2 className="text-xl font-semibold text-black mb-2">
                    Check your email
                  </h2>
                  <p className="text-gray-600 text-sm mb-6">
                    If an account exists for{' '}
                    <span className="font-medium text-black">{email}</span>,
                    you&apos;ll receive a password reset link shortly. It expires
                    in 1 hour.
                  </p>
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center gap-2 text-black font-medium hover:underline"
                  >
                    <ArrowLeft size={16} /> Back to sign in
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <Input
                      label="Email"
                      type="email"
                      name="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <Mail
                      size={18}
                      className="absolute right-4 top-[42px] text-gray-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-6 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Sending...
                      </>
                    ) : (
                      'Send reset link'
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <Link
                      href="/auth/login"
                      className="inline-flex items-center gap-2 text-gray-600 text-sm hover:text-black"
                    >
                      <ArrowLeft size={16} /> Back to sign in
                    </Link>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
