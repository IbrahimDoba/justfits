'use client'

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { Product } from '@/lib/types/product'

interface WishlistState {
  items: Product[]
}

type WishlistAction =
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_WISHLIST' }
  | { type: 'LOAD_WISHLIST'; payload: Product[] }

const initialState: WishlistState = {
  items: [],
}

function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const exists = state.items.some((item) => item.id === action.payload.id)
      if (exists) return state
      return {
        ...state,
        items: [...state.items, action.payload],
      }
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      }
    case 'CLEAR_WISHLIST':
      return {
        ...state,
        items: [],
      }
    case 'LOAD_WISHLIST':
      return {
        ...state,
        items: action.payload,
      }
    default:
      return state
  }
}

interface WishlistContextType {
  items: Product[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  clearWishlist: () => void
  isInWishlist: (productId: string) => boolean
  totalItems: number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, initialState)

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('justfits_wishlist')
    if (savedWishlist) {
      try {
        const items = JSON.parse(savedWishlist)
        dispatch({ type: 'LOAD_WISHLIST', payload: items })
      } catch (error) {
        console.error('Failed to load wishlist:', error)
      }
    }
  }, [])

  // Save wishlist to localStorage on change
  useEffect(() => {
    localStorage.setItem('justfits_wishlist', JSON.stringify(state.items))
  }, [state.items])

  const addItem = (product: Product) => {
    dispatch({ type: 'ADD_ITEM', payload: product })
  }

  const removeItem = (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId })
  }

  const clearWishlist = () => {
    dispatch({ type: 'CLEAR_WISHLIST' })
  }

  const isInWishlist = (productId: string) => {
    return state.items.some((item) => item.id === productId)
  }

  const value: WishlistContextType = {
    items: state.items,
    addItem,
    removeItem,
    clearWishlist,
    isInWishlist,
    totalItems: state.items.length,
  }

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
