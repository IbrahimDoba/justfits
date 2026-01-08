'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { User, Mail, Phone, MapPin, Edit2, Save, X } from 'lucide-react'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showToast } = useToast()

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
  })

  // Redirect if not authenticated
  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <section className="pt-32 pb-20">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/3" />
                <div className="h-40 bg-gray-200 rounded-2xl" />
                <div className="h-60 bg-gray-200 rounded-2xl" />
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/auth/login?callbackUrl=/profile')
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    // TODO: Save to database when connected
    showToast('Profile updated successfully!', 'success')
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      name: session?.user?.name || '',
      email: session?.user?.email || '',
      phone: '',
      address: '',
      city: '',
      state: '',
    })
    setIsEditing(false)
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
            className="max-w-2xl mx-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-display text-4xl text-black mb-2">
                  MY PROFILE
                </h1>
                <p className="text-gray-600">
                  Manage your account information
                </p>
              </div>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Save size={16} />
                    Save
                  </button>
                </div>
              )}
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-2xl p-8 shadow-sm mb-6">
              <div className="flex items-center gap-6 mb-8">
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-black text-white flex items-center justify-center text-3xl font-medium">
                    {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-semibold text-black">
                    {session?.user?.name || 'User'}
                  </h2>
                  <p className="text-gray-500">{session?.user?.email}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Member since {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-2xl font-semibold text-black">0</p>
                  <p className="text-sm text-gray-500">Orders</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-black">0</p>
                  <p className="text-sm text-gray-500">Wishlist</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-black">0</p>
                  <p className="text-sm text-gray-500">Reviews</p>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-2xl p-8 shadow-sm mb-6">
              <h3 className="text-lg font-semibold text-black mb-6">
                Personal Information
              </h3>
              <div className="grid gap-4">
                <div className="relative">
                  <Input
                    label="Full Name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                  <User
                    size={18}
                    className="absolute right-4 top-[42px] text-gray-400"
                  />
                </div>
                <div className="relative">
                  <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={true}
                  />
                  <Mail
                    size={18}
                    className="absolute right-4 top-[42px] text-gray-400"
                  />
                </div>
                <div className="relative">
                  <Input
                    label="Phone Number"
                    type="tel"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                  <Phone
                    size={18}
                    className="absolute right-4 top-[42px] text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="text-lg font-semibold text-black mb-6">
                Default Address
              </h3>
              <div className="grid gap-4">
                <div className="relative">
                  <Input
                    label="Street Address"
                    type="text"
                    name="address"
                    placeholder="Enter your street address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                  <MapPin
                    size={18}
                    className="absolute right-4 top-[42px] text-gray-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="City"
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                  <Input
                    label="State"
                    type="text"
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
