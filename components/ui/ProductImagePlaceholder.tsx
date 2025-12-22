'use client'

interface ProductImagePlaceholderProps {
  className?: string
  variant?: 1 | 2 | 3
}

export function ProductImagePlaceholder({
  className = '',
  variant = 1
}: ProductImagePlaceholderProps) {
  const colors = {
    1: 'from-gray-800 to-gray-900',
    2: 'from-gray-900 to-black',
    3: 'from-gray-700 to-gray-800',
  }

  return (
    <div className={`w-full h-full bg-gradient-to-br ${colors[variant]} flex items-center justify-center ${className}`}>
      <div className="text-center">
        <div className="font-display text-6xl md:text-8xl font-black text-white/10 mb-4">
          JUSTFITS
        </div>
        <p className="text-white/30 text-sm font-heading uppercase tracking-wider">
          Product {variant}
        </p>
      </div>
    </div>
  )
}
