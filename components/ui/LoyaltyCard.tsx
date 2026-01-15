'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Gift, Stamp, Copy, Check, Clock, Trophy } from 'lucide-react'
import { useToast } from './Toast'

interface LoyaltyData {
  loyaltyCard: {
    stamps: number
    stampsNeeded: number
    stampsRemaining: number
    totalStampsEarned: number
    totalRewardsEarned: number
    progress: number
  }
  rewards: {
    available: Array<{
      id: string
      code: string
      discountPercent: number
      expiresAt: string
    }>
    used: Array<{
      id: string
      code: string
      discountPercent: number
      redeemedAt: string
    }>
    expiredCount: number
  }
}

export function LoyaltyCard() {
  const [data, setData] = useState<LoyaltyData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    fetchLoyaltyData()
  }, [])

  const fetchLoyaltyData = async () => {
    try {
      const res = await fetch('/api/user/loyalty')
      if (res.ok) {
        const loyaltyData = await res.json()
        setData(loyaltyData)
      }
    } catch (error) {
      console.error('Failed to fetch loyalty data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      showToast('Reward code copied!', 'success')
      setTimeout(() => setCopiedCode(null), 2000)
    } catch {
      showToast('Failed to copy code', 'error')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getDaysUntilExpiry = (dateString: string) => {
    const now = new Date()
    const expiry = new Date(dateString)
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-32 bg-gray-200 rounded-xl" />
          <div className="h-20 bg-gray-200 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!data) return null

  const { loyaltyCard, rewards } = data
  const stampsArray = Array.from({ length: loyaltyCard.stampsNeeded }, (_, i) => i)

  return (
    <div className="space-y-6">
      {/* Stamp Card */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
              <Trophy className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">JUSTFITS Loyalty</h3>
              <p className="text-gray-400 text-sm">Collect stamps, earn rewards</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-yellow-400">{loyaltyCard.stamps}</p>
            <p className="text-xs text-gray-400">of {loyaltyCard.stampsNeeded} stamps</p>
          </div>
        </div>

        {/* Stamps Grid */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {stampsArray.map((index) => {
            const isFilled = index < loyaltyCard.stamps
            const isNext = index === loyaltyCard.stamps

            return (
              <motion.div
                key={index}
                initial={false}
                animate={isFilled ? { scale: [1, 1.2, 1] } : {}}
                className={`
                  aspect-square rounded-xl flex items-center justify-center border-2 transition-all
                  ${isFilled
                    ? 'bg-yellow-400 border-yellow-400'
                    : isNext
                    ? 'bg-white/5 border-yellow-400/50 border-dashed'
                    : 'bg-white/5 border-white/10'
                  }
                `}
              >
                {isFilled ? (
                  <Stamp className="w-6 h-6 text-gray-900" />
                ) : isNext ? (
                  <span className="text-yellow-400/50 text-xs font-medium">NEXT</span>
                ) : (
                  <span className="text-white/20 text-sm">{index + 1}</span>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Progress Message */}
        <div className="bg-white/10 rounded-xl p-4">
          {loyaltyCard.stamps === 0 ? (
            <p className="text-sm text-center text-gray-300">
              Make your first purchase to start earning stamps!
            </p>
          ) : loyaltyCard.stampsRemaining === 1 ? (
            <p className="text-sm text-center text-yellow-400 font-medium">
              Just 1 more order until your 30% off reward!
            </p>
          ) : (
            <p className="text-sm text-center text-gray-300">
              <span className="text-yellow-400 font-semibold">{loyaltyCard.stampsRemaining} more orders</span> until your 30% off reward!
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="flex justify-between mt-4 pt-4 border-t border-white/10 text-sm">
          <div>
            <p className="text-gray-400">Total Stamps Earned</p>
            <p className="font-semibold">{loyaltyCard.totalStampsEarned}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400">Rewards Unlocked</p>
            <p className="font-semibold">{loyaltyCard.totalRewardsEarned}</p>
          </div>
        </div>
      </div>

      {/* Available Rewards */}
      {rewards.available.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-gray-900">Available Rewards</h4>
          </div>
          <div className="space-y-3">
            {rewards.available.map((reward) => {
              const daysLeft = getDaysUntilExpiry(reward.expiresAt)

              return (
                <div
                  key={reward.id}
                  className="bg-green-50 rounded-xl p-4 border border-green-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-green-700">
                      {reward.discountPercent}% OFF
                    </span>
                    <button
                      onClick={() => copyCode(reward.code)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      {copiedCode === reward.code ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy Code
                        </>
                      )}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <code className="text-sm font-mono bg-white px-2 py-1 rounded text-green-800">
                      {reward.code}
                    </code>
                    <span className={`text-xs flex items-center gap-1 ${
                      daysLeft <= 7 ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      <Clock className="w-3 h-3" />
                      {daysLeft <= 0 ? 'Expires today' : `${daysLeft} days left`}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Used Rewards */}
      {rewards.used.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-4">Used Rewards</h4>
          <div className="space-y-2">
            {rewards.used.slice(0, 5).map((reward) => (
              <div
                key={reward.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {reward.discountPercent}% OFF
                    </p>
                    <p className="text-xs text-gray-400">{reward.code}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {reward.redeemedAt && formatDate(reward.redeemedAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
