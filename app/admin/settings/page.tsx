"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Eye, EyeOff, Check, Loader2, MapPin } from "lucide-react";

const NIGERIAN_STATES = [
  { value: "lagos", label: "Lagos" },
  { value: "abuja", label: "Abuja (FCT)" },
  { value: "rivers", label: "Rivers" },
  { value: "kano", label: "Kano" },
  { value: "oyo", label: "Oyo" },
  { value: "kaduna", label: "Kaduna" },
  { value: "ogun", label: "Ogun" },
  { value: "enugu", label: "Enugu" },
  { value: "delta", label: "Delta" },
  { value: "anambra", label: "Anambra" },
  { value: "edo", label: "Edo" },
  { value: "imo", label: "Imo" },
  { value: "kwara", label: "Kwara" },
  { value: "osun", label: "Osun" },
  { value: "ondo", label: "Ondo" },
  { value: "akwa-ibom", label: "Akwa Ibom" },
  { value: "cross-river", label: "Cross River" },
  { value: "abia", label: "Abia" },
  { value: "ekiti", label: "Ekiti" },
  { value: "other", label: "Other" },
];

interface ShippingZone {
  state: string;
  label: string;
  price: string;
  freeShippingThreshold: string;
  isActive: boolean;
}

export default function SettingsPage() {
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingZones, setIsSavingZones] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [zonesSaved, setZonesSaved] = useState(false);
  const [settings, setSettings] = useState({
    storeName: "JUSTFITS",
    storeEmail: "support@justfits.com",
    storePhone: "+234 800 000 0000",
    bankName: "",
    bankAccountName: "",
    bankAccountNumber: "",
    currency: "NGN",
    taxRate: "0",
    shippingFee: "2500",
    freeShippingThreshold: "50000",
    lowStockThreshold: "5",
  });

  const [zones, setZones] = useState<ShippingZone[]>(
    NIGERIAN_STATES.map((s) => ({
      state: s.value,
      label: s.label,
      price: "2500",
      freeShippingThreshold: "",
      isActive: true,
    }))
  );

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [settingsRes, zonesRes] = await Promise.all([
          fetch("/api/admin/settings"),
          fetch("/api/admin/shipping-zones"),
        ]);

        if (settingsRes.ok) {
          const data = await settingsRes.json();
          setSettings({
            ...data,
            taxRate: (data.taxRate || 0).toString(),
            shippingFee: (data.shippingFee || 0).toString(),
            freeShippingThreshold: (data.freeShippingThreshold || 0).toString(),
            bankName: data.bankName || "",
            bankAccountName: data.bankAccountName || "",
            bankAccountNumber: data.bankAccountNumber || "",
          });
        }

        if (zonesRes.ok) {
          const data = await zonesRes.json();
          if (data.zones && data.zones.length > 0) {
            // Merge saved zones over the defaults
            setZones(
              NIGERIAN_STATES.map((s) => {
                const saved = data.zones.find((z: any) => z.state === s.value);
                return {
                  state: s.value,
                  label: s.label,
                  price: saved ? saved.price.toString() : "2500",
                  freeShippingThreshold: saved?.freeShippingThreshold != null
                    ? saved.freeShippingThreshold.toString()
                    : "",
                  isActive: saved ? saved.isActive : true,
                };
              })
            );
          }
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveZones = async () => {
    setIsSavingZones(true);
    try {
      const response = await fetch("/api/admin/shipping-zones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zones: zones.map((z) => ({
            state: z.state,
            label: z.label,
            price: parseFloat(z.price) || 0,
            freeShippingThreshold: z.freeShippingThreshold
              ? parseFloat(z.freeShippingThreshold)
              : null,
            isActive: z.isActive,
          })),
        }),
      });
      if (response.ok) {
        setZonesSaved(true);
        setTimeout(() => setZonesSaved(false), 2000);
      }
    } catch (error) {
      console.error("Error saving zones:", error);
    } finally {
      setIsSavingZones(false);
    }
  };

  const updateZone = (state: string, field: keyof ShippingZone, value: string | boolean) => {
    setZones((prev) =>
      prev.map((z) => (z.state === state ? { ...z, [field]: value } : z))
    );
  };

  const setAllPrices = (price: string) => {
    setZones((prev) => prev.map((z) => ({ ...z, price })));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

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

        {/* Bank Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Bank Transfer Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                placeholder="e.g. GTBank"
                value={settings.bankName || ""}
                onChange={(e) =>
                  setSettings({ ...settings, bankName: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. JUSTFITS NIGERIA"
                  value={settings.bankAccountName || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, bankAccountName: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 0123456789"
                  value={settings.bankAccountNumber || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, bankAccountNumber: e.target.value })
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
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Pricing & Shipping (Global Defaults)
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Used as fallback when a state has no shipping zone configured.
          </p>
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
                  Default Shipping Fee (₦)
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
                  Free Shipping Above (₦)
                </label>
                <input
                  type="number"
                  value={settings.freeShippingThreshold}
                  onChange={(e) =>
                    setSettings({ ...settings, freeShippingThreshold: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Shipping Zones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-start justify-between gap-4 mb-1 flex-wrap">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MapPin size={18} className="text-gray-500" />
                Shipping Zones
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Set a shipping price per state. Leave <strong>Free Above</strong> blank to use the global threshold.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-gray-500">Set all prices to:</span>
              {["1500", "2000", "2500", "3000", "3500"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAllPrices(p)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors font-mono"
                >
                  ₦{parseInt(p).toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2.5 pr-4 font-medium text-gray-500 w-40">State</th>
                  <th className="text-left py-2.5 pr-4 font-medium text-gray-500">Shipping Price (₦)</th>
                  <th className="text-left py-2.5 pr-4 font-medium text-gray-500">Free Above (₦)</th>
                  <th className="text-center py-2.5 font-medium text-gray-500 w-20">Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {zones.map((zone) => (
                  <tr key={zone.state} className={!zone.isActive ? "opacity-40" : ""}>
                    <td className="py-2.5 pr-4">
                      <span className="font-medium text-gray-800">{zone.label}</span>
                    </td>
                    <td className="py-2 pr-4">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₦</span>
                        <input
                          type="number"
                          value={zone.price}
                          onChange={(e) => updateZone(zone.state, "price", e.target.value)}
                          disabled={!zone.isActive}
                          className="w-full pl-7 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm disabled:bg-gray-50"
                          min="0"
                        />
                      </div>
                    </td>
                    <td className="py-2 pr-4">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₦</span>
                        <input
                          type="number"
                          value={zone.freeShippingThreshold}
                          onChange={(e) => updateZone(zone.state, "freeShippingThreshold", e.target.value)}
                          disabled={!zone.isActive}
                          placeholder={`${parseInt(settings.freeShippingThreshold || "50000").toLocaleString()} (global)`}
                          className="w-full pl-7 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm disabled:bg-gray-50 placeholder:text-gray-300"
                          min="0"
                        />
                      </div>
                    </td>
                    <td className="py-2 text-center">
                      <button
                        type="button"
                        onClick={() => updateZone(zone.state, "isActive", !zone.isActive)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          zone.isActive ? "bg-black" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                            zone.isActive ? "translate-x-4.5" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={handleSaveZones}
              disabled={isSavingZones}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                zonesSaved
                  ? "bg-green-600 text-white"
                  : "bg-black text-white hover:bg-gray-800"
              } disabled:opacity-50`}
            >
              {zonesSaved ? (
                <>
                  <Check size={16} />
                  Zones Saved
                </>
              ) : (
                <>
                  <Save size={16} />
                  {isSavingZones ? "Saving..." : "Save Shipping Zones"}
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Inventory Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
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
              Products with stock below this number will show in low stock alerts
            </p>
          </div>
        </motion.div>

        {/* API Keys */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
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
          transition={{ delay: 0.5 }}
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
