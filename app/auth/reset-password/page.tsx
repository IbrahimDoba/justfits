'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { Lock, Eye, EyeOff, ArrowLeft, AlertCircle } from 'lucide-react'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useToast()

  const token = searchParams.get('token') || ''
  const email = searchParams.get('email') || ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const invalidLink = !token || !email

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 8) {
      showToast('Password must be at least 8 characters', 'error')
      return
    }
    if (password !== confirm) {
      showToast('Passwords do not match', 'error')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong')
      }
      showToast('Password updated! Please sign in.', 'success')
      router.push('/auth/login')
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
              RESET PASSWORD
            </h1>
            <p className="text-gray-600">Choose a new password for your account</p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm">
            {invalidLink ? (
              <div className="text-center py-4">
                <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-black mb-2">
                  Invalid reset link
                </h2>
                <p className="text-gray-600 text-sm mb-6">
                  This link is missing information or is malformed. Please request
                  a new password reset.
                </p>
                <Link
                  href="/auth/forgot-password"
                  className="inline-flex items-center gap-2 text-black font-medium hover:underline"
                >
                  Request a new link
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Input
                    label="New password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-[42px] text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    label="Confirm password"
                    type={showPassword ? 'text' : 'password'}
                    name="confirm"
                    placeholder="Re-enter your password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
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
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock size={18} /> Update password
                    </>
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
  )
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <Suspense
        fallback={
          <section className="pt-32 pb-20">
            <div className="container mx-auto px-6 max-w-md mx-auto">
              <div className="h-64 bg-white rounded-2xl shadow-sm animate-pulse" />
            </div>
          </section>
        }
      >
        <ResetPasswordForm />
      </Suspense>
      <Footer />
    </main>
  )
}
