"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Eye, EyeOff, Check } from "lucide-react";

export default function SettingsPage() {
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    storeName: "JUSTFITS",
    storeEmail: "support@justfits.com",
    storePhone: "+234 800 000 0000",
    currency: "NGN",
    taxRate: "0",
    shippingFee: "2500",
    freeShippingThreshold: "50000",
    lowStockThreshold: "5",
    enableGoogleAuth: true,
    enableEmailAuth: true,
  });

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display tracking-tight text-gray-900">
          Settings
        </h1>
        <p className="text-gray-500 mt-1">Configure your store settings</p>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Store Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Store Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Name
              </label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) =>
                  setSettings({ ...settings, storeName: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Support Email
                </label>
                <input
                  type="email"
                  value={settings.storeEmail}
                  onChange={(e) =>
                    setSettings({ ...settings, storeEmail: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={settings.storePhone}
                  onChange={(e) =>
                    setSettings({ ...settings, storePhone: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pricing Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Pricing & Shipping
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) =>
                    setSettings({ ...settings, currency: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white"
                >
                  <option value="NGN">Nigerian Naira (₦)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="GBP">British Pound (£)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  value={settings.taxRate}
                  onChange={(e) =>
                    setSettings({ ...settings, taxRate: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shipping Fee (₦)
                </label>
                <input
                  type="number"
                  value={settings.shippingFee}
                  onChange={(e) =>
                    setSettings({ ...settings, shippingFee: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Free Shipping Threshold (₦)
                </label>
                <input
                  type="number"
                  value={settings.freeShippingThreshold}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      freeShippingThreshold: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Inventory Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Inventory
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Low Stock Alert Threshold
            </label>
            <input
              type="number"
              value={settings.lowStockThreshold}
              onChange={(e) =>
                setSettings({ ...settings, lowStockThreshold: e.target.value })
              }
              className="w-full max-w-xs px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-2">
              Products with stock below this number will show in low stock
              alerts
            </p>
          </div>
        </motion.div>

        {/* API Keys */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            API Configuration
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Google Gemini API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value="••••••••••••••••••••"
                  readOnly
                  className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-xl bg-gray-50"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Configured via GOOGLE_GEMINI_API_KEY environment variable
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cloudinary Status
              </label>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-green-700">Connected</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Configured via CLOUDINARY_URL environment variable
              </p>
            </div>
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              saved
                ? "bg-green-600 text-white"
                : "bg-black text-white hover:bg-gray-800"
            } disabled:opacity-50`}
          >
            {saved ? (
              <>
                <Check size={18} />
                Saved
              </>
            ) : (
              <>
                <Save size={18} />
                {isSaving ? "Saving..." : "Save Settings"}
              </>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
