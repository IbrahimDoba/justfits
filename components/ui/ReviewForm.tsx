'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Loader2, LogIn } from 'lucide-react'
import { StarRating } from './StarRating'
import { useToast } from './Toast'

interface ReviewFormProps {
  productSlug: string
  onReviewSubmitted: () => void
}

export function ReviewForm({ productSlug, onReviewSubmitted }: ReviewFormProps) {
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
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to submit review',
        'error'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-24 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <LogIn className="w-10 h-10 mx-auto mb-3 text-gray-400" />
        <h4 className="text-lg font-medium text-gray-900 mb-2">
          Sign in to leave a review
        </h4>
        <p className="text-gray-600 mb-4">
          Share your experience with this product
        </p>
        <Link
          href={`/auth/login?callbackUrl=/products/${productSlug}`}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Sign In
        </Link>
      </div>
    )
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="bg-gray-50 rounded-xl p-6"
    >
      <h4 className="text-lg font-medium text-gray-900 mb-4">Write a Review</h4>

      <div className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Rating <span className="text-red-500">*</span>
          </label>
          <StarRating
            rating={rating}
            size="lg"
            interactive
            onChange={setRating}
          />
        </div>

        {/* Title (optional) */}
        <div>
          <label
            htmlFor="review-title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Title (optional)
          </label>
          <input
            id="review-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
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
            placeholder="Tell others about your experience with this product..."
            rows={4}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black resize-none"
            maxLength={1000}
          />
          <p className="text-xs text-gray-500 mt-1 text-right">
            {comment.length}/1000
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
    </motion.form>
  )
}
