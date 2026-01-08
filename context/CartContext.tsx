'use client'

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { Product } from '@/lib/types/product'

export interface CartItem {
  id: string
  product: Product
  quantity: number
  size: string | null
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number; size: string | null } }
  | { type: 'REMOVE_ITEM'; payload: { id: string; size: string | null } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; size: string | null; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] }

const initialState: CartState = {
  items: [],
  isOpen: false,
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity, size } = action.payload
      const existingItemIndex = state.items.findIndex(
        (item) => item.product.id === product.id && item.size === size
      )

      if (existingItemIndex > -1) {
        const updatedItems = [...state.items]
        updatedItems[existingItemIndex].quantity += quantity
        return { ...state, items: updatedItems, isOpen: true }
      }

      const newItem: CartItem = {
        id: `${product.id}-${size || 'default'}`,
        product,
        quantity,
        size,
      }
      return { ...state, items: [...state.items, newItem], isOpen: true }
    }

    case 'REMOVE_ITEM': {
      const { id, size } = action.payload
      return {
        ...state,
        items: state.items.filter(
          (item) => !(item.product.id === id && item.size === size)
        ),
      }
    }

    case 'UPDATE_QUANTITY': {
      const { id, size, quantity } = action.payload
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(
            (item) => !(item.product.id === id && item.size === size)
          ),
        }
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.product.id === id && item.size === size
            ? { ...item, quantity }
            : item
        ),
      }
    }

    case 'CLEAR_CART':
      return { ...state, items: [] }

    case 'OPEN_CART':
      return { ...state, isOpen: true }

    case 'CLOSE_CART':
      return { ...state, isOpen: false }

    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen }

    case 'LOAD_CART':
      return { ...state, items: action.payload }

    default:
      return state
  }
}

interface CartContextType {
  items: CartItem[]
  isOpen: boolean
  addItem: (product: Product, quantity: number, size: string | null) => void
  removeItem: (id: string, size: string | null) => void
  updateQuantity: (id: string, size: string | null, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'justfits-cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY)
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        dispatch({ type: 'LOAD_CART', payload: parsedCart })
      } catch (e) {
        console.error('Failed to parse cart from localStorage', e)
      }
    }
  }, [])

  // Save cart to localStorage when items change
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items))
  }, [state.items])

  const addItem = (product: Product, quantity: number, size: string | null) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity, size } })
  }

  const removeItem = (id: string, size: string | null) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id, size } })
  }

  const updateQuantity = (id: string, size: string | null, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, size, quantity } })
  }

  const clearCart = () => dispatch({ type: 'CLEAR_CART' })
  const openCart = () => dispatch({ type: 'OPEN_CART' })
  const closeCart = () => dispatch({ type: 'CLOSE_CART' })
  const toggleCart = () => dispatch({ type: 'TOGGLE_CART' })

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = state.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isOpen: state.isOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        openCart,
        closeCart,
        toggleCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
