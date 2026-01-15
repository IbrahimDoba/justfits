'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, LogIn, Star } from 'lucide-react'
import { StarRating } from './StarRating'
import { useToast } from './Toast'

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  productSlug: string
  productName: string
  onReviewSubmitted: () => void
}

export function ReviewModal({
  isOpen,
  onClose,
  productSlug,
  productName,
  onReviewSubmitted,
}: ReviewModalProps) {
  const { data: session, status } = useSession()
  const { showToast } = useToast()
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      showToast('Please select a rating', 'error')
      return
    }

    if (!comment.trim()) {
      showToast('Please write a comment', 'error')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/products/${productSlug}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          title: title.trim() || undefined,
          comment: comment.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review')
      }

      showToast('Review submitted successfully!', 'success')
      setRating(0)
      setTitle('')
      setComment('')
      onReviewSubmitted()
      onClose()
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to submit review',
        'error'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">
                      Write a Review
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-1">
                      {productName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {status === 'loading' ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                  </div>
                ) : !session ? (
                  <div className="text-center py-8">
                    <LogIn className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      Sign in to leave a review
                    </h4>
                    <p className="text-gray-600 mb-6">
                      Share your experience with this product
                    </p>
                    <Link
                      href={`/auth/login?callbackUrl=/products/${productSlug}`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
                    >
                      Sign In to Continue
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Rating */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Your Rating <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-4">
                        <StarRating
                          rating={rating}
                          size="lg"
                          interactive
                          onChange={setRating}
                        />
                        {rating > 0 && (
                          <span className="text-sm text-gray-500">
                            {rating === 1 && 'Poor'}
                            {rating === 2 && 'Fair'}
                            {rating === 3 && 'Good'}
                            {rating === 4 && 'Very Good'}
                            {rating === 5 && 'Excellent'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <label
                        htmlFor="review-title"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Review Title{' '}
                        <span className="text-gray-400">(optional)</span>
                      </label>
                      <input
                        id="review-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Summarize your experience"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                        maxLength={100}
                      />
                    </div>

                    {/* Comment */}
                    <div>
                      <label
                        htmlFor="review-comment"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Your Review <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="review-comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="What did you like or dislike about this product?"
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all resize-none text-gray-900 placeholder:text-gray-400"
                        maxLength={1000}
                      />
                      <p className="text-xs text-gray-400 mt-1.5 text-right">
                        {comment.length}/1000
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 py-3 px-4 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          'Submit Review'
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
