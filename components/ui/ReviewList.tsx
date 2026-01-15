'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, CheckCircle, Loader2, MessageSquare } from 'lucide-react'
import { StarRating } from './StarRating'
import { useToast } from './Toast'

interface Review {
  id: string
  rating: number
  title: string | null
  comment: string
  isVerified: boolean
  createdAt: string
  user: {
    id: string
    name: string | null
    image: string | null
  }
}

interface ReviewListProps {
  reviews: Review[]
  avgRating: number
  reviewCount: number
  ratingDistribution: number[]
  onReviewDeleted: () => void
}

export function ReviewList({
  reviews,
  avgRating,
  reviewCount,
  ratingDistribution,
  onReviewDeleted,
}: ReviewListProps) {
  const { data: session } = useSession()
  const { showToast } = useToast()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const canDelete = (review: Review) => {
    if (!session?.user) return false
    const isOwner = review.user.id === session.user.id
    const isAdmin =
      session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN'
    return isOwner || isAdmin
  }

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return

    setDeletingId(reviewId)

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete review')
      }

      showToast('Review deleted successfully', 'success')
      onReviewDeleted()
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to delete review',
        'error'
      )
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const maxRatingCount = Math.max(...ratingDistribution, 1)

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Average Rating */}
          <div className="text-center sm:text-left">
            <div className="text-5xl font-bold text-gray-900 mb-1">
              {avgRating.toFixed(1)}
            </div>
            <StarRating rating={avgRating} size="md" />
            <p className="text-sm text-gray-500 mt-2">
              Based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingDistribution[star - 1]

              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-6">{star}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                      style={{
                        width: `${(count / maxRatingCount) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-8 text-right">
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            No reviews yet
          </h4>
          <p className="text-gray-600">
            Be the first to share your experience with this product
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {reviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-xl p-6 border border-gray-100"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    {review.user.image ? (
                      <img
                        src={review.user.image}
                        alt={review.user.name || 'User'}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                        {review.user.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900">
                          {review.user.name || 'Anonymous'}
                        </span>
                        {review.isVerified && (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <StarRating rating={review.rating} size="sm" />
                        <span className="text-sm text-gray-500">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Delete Button */}
                  {canDelete(review) && (
                    <button
                      onClick={() => handleDelete(review.id)}
                      disabled={deletingId === review.id}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1 disabled:opacity-50"
                      title="Delete review"
                    >
                      {deletingId === review.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  )}
                </div>

                {/* Review Content */}
                <div className="mt-4">
                  {review.title && (
                    <h5 className="font-medium text-gray-900 mb-1">
                      {review.title}
                    </h5>
                  )}
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {review.comment}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
