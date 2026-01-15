"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Input, Select } from "@/components/ui/Input";
import { ProductImagePlaceholder } from "@/components/ui/ProductImagePlaceholder";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/components/ui/Toast";
import { formatPrice } from "@/lib/utils/format";
import {
  ArrowLeft,
  Lock,
  Truck,
  CreditCard,
  ShieldCheck,
  Tag,
  X,
  Loader2,
  Check,
} from "lucide-react";

const nigerianStates = [
  { value: "", label: "Select State" },
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

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const { showToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Reward code state
  const [rewardCode, setRewardCode] = useState("");
  const [isValidatingReward, setIsValidatingReward] = useState(false);
  const [appliedReward, setAppliedReward] = useState<{
    code: string;
    discountPercent: number;
  } | null>(null);

  const [bankDetails, setBankDetails] = useState<{
    bankName: string;
    bankAccountName: string;
    bankAccountNumber: string;
  } | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const shippingCost = totalPrice >= 50000 ? 0 : 3500;
  const discountAmount = appliedReward
    ? Math.round((totalPrice * appliedReward.discountPercent) / 100)
    : 0;
  const orderTotal = totalPrice - discountAmount + shippingCost;

  // Fetch bank details
  useState(() => {
    const fetchBankDetails = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        if (response.ok) {
          const data = await response.json();
          setBankDetails({
            bankName: data.bankName,
            bankAccountName: data.bankAccountName,
            bankAccountNumber: data.bankAccountNumber,
          });
        }
      } catch (error) {
        console.error("Error fetching bank details:", error);
      }
    };
    fetchBankDetails();
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";

    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (
      !/^(\+234|0)[0-9]{10}$/.test(formData.phone.replace(/\s/g, ""))
    ) {
      newErrors.phone = "Please enter a valid Nigerian phone number";
    }

    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.state) newErrors.state = "State is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const applyRewardCode = async () => {
    if (!rewardCode.trim()) {
      showToast("Please enter a reward code", "error");
      return;
    }

    setIsValidatingReward(true);
    try {
      const response = await fetch("/api/rewards/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: rewardCode.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || "Invalid reward code", "error");
        return;
      }

      setAppliedReward({
        code: data.reward.code,
        discountPercent: data.reward.discountPercent,
      });
      showToast(`${data.reward.discountPercent}% discount applied!`, "success");
    } catch (error) {
      console.error("Error validating reward:", error);
      showToast("Failed to validate reward code", "error");
    } finally {
      setIsValidatingReward(false);
    }
  };

  const removeRewardCode = () => {
    setAppliedReward(null);
    setRewardCode("");
    showToast("Reward code removed", "success");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Get signature
      const timestamp = Math.round(new Date().getTime() / 1000);
      const paramsToSign = {
        timestamp,
        folder: "receipts",
      };

      const signResponse = await fetch("/api/admin/upload/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paramsToSign }),
      });

      const { signature } = await signResponse.json();

      // 2. Upload to Cloudinary
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append(
        "api_key",
        process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || ""
      );
      formDataUpload.append("timestamp", timestamp.toString());
      formDataUpload.append("signature", signature);
      formDataUpload.append("folder", "receipts");

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formDataUpload,
        }
      );

      const uploadData = await uploadResponse.json();
      if (uploadResponse.ok) {
        setReceiptUrl(uploadData.secure_url);
        showToast("Receipt uploaded successfully", "success");
      } else {
        throw new Error(uploadData.error?.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      showToast("Failed to upload receipt", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    if (!receiptUrl) {
      showToast("Please upload your payment receipt", "error");
      return;
    }

    if (items.length === 0) {
      showToast("Your cart is empty", "error");
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare order data
      const orderData = {
        email: formData.email,
        phone: formData.phone,
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        items: items.map((item) => ({
          productSlug: item.product.slug,
          productName: item.product.name,
          size: item.size,
          quantity: item.quantity,
          price: item.product.price,
        })),
        subtotal: totalPrice,
        shippingCost: shippingCost,
        total: orderTotal,
        rewardCode: appliedReward?.code || null,
        discount: appliedReward?.discountPercent || null,
        receiptUrl: receiptUrl,
        paymentMethod: "BANK_TRANSFER",
      };

      // Send order to API
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to place order");
      }

      // Clear cart and show success
      clearCart();
      showToast("Order placed successfully!", "success");

      // Redirect to success page with order number
      router.push(`/checkout/success?order=${data.order.orderNumber}`);
    } catch (error) {
      console.error("Checkout error:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "Payment failed. Please try again.",
        "error"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Redirect if cart is empty
  if (items.length === 0 && typeof window !== "undefined") {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-32 pb-20">
          <div className="container mx-auto px-6 text-center">
            <h1 className="font-display text-4xl text-black mb-4">
              Your cart is empty
            </h1>
            <p className="text-gray-600 mb-8">
              Add some items to your cart to checkout
            </p>
            <Link
              href="/shop"
              className="inline-block bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="pt-24 pb-4 bg-white border-b border-gray-100">
        <div className="container mx-auto px-6">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Cart
          </Link>
        </div>
      </div>

      {/* Checkout Content */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Left Column - Form */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="font-display text-3xl md:text-4xl text-black mb-8">
                  CHECKOUT
                </h1>

                <form
                  id="checkout-form"
                  onSubmit={handleSubmit}
                  className="space-y-8"
                >
                  {/* Contact Information */}
                  <div>
                    <h2 className="font-heading font-semibold text-lg text-black mb-4 flex items-center gap-2">
                      <span className="w-7 h-7 bg-black text-white text-sm rounded-full flex items-center justify-center">
                        1
                      </span>
                      Contact Information
                    </h2>
                    <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
                      <Input
                        label="Email Address"
                        type="email"
                        name="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        error={errors.email}
                        required
                      />
                      <Input
                        label="Phone Number"
                        type="tel"
                        name="phone"
                        placeholder="+234 800 000 0000"
                        value={formData.phone}
                        onChange={handleInputChange}
                        error={errors.phone}
                        helperText="We'll send order updates via SMS"
                        required
                      />
                    </div>
                  </div>

                  {/* Shipping Information */}
                  <div>
                    <h2 className="font-heading font-semibold text-lg text-black mb-4 flex items-center gap-2">
                      <span className="w-7 h-7 bg-black text-white text-sm rounded-full flex items-center justify-center">
                        2
                      </span>
                      Shipping Address
                    </h2>
                    <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="First Name"
                          name="firstName"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          error={errors.firstName}
                          required
                        />
                        <Input
                          label="Last Name"
                          name="lastName"
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          error={errors.lastName}
                          required
                        />
                      </div>
                      <Input
                        label="Street Address"
                        name="address"
                        placeholder="123 Main Street, Apartment 4B"
                        value={formData.address}
                        onChange={handleInputChange}
                        error={errors.address}
                        required
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="City"
                          name="city"
                          placeholder="Lagos"
                          value={formData.city}
                          onChange={handleInputChange}
                          error={errors.city}
                          required
                        />
                        <Select
                          label="State"
                          name="state"
                          options={nigerianStates}
                          value={formData.state}
                          onChange={handleInputChange}
                          error={errors.state}
                          required
                        />
                      </div>
                      <Input
                        label="Postal Code"
                        name="postalCode"
                        placeholder="100001"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        error={errors.postalCode}
                        helperText="Optional"
                      />
                    </div>
                  </div>

                  {/* Payment Section */}
                  <div>
                    <h2 className="font-heading font-semibold text-lg text-black mb-4 flex items-center gap-2">
                      <span className="w-7 h-7 bg-black text-white text-sm rounded-full flex items-center justify-center">
                        3
                      </span>
                      Payment (Bank Transfer)
                    </h2>
                    <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
                      {/* Bank Details */}
                      <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <CreditCard size={16} />
                          Transfer to:
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Bank Name</span>
                            <span className="font-medium text-black">
                              {bankDetails?.bankName || "Loading..."}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Account Name</span>
                            <span className="font-medium text-black">
                              {bankDetails?.bankAccountName || "Loading..."}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">
                              Account Number
                            </span>
                            <span className="font-mono font-bold text-black tracking-wider">
                              {bankDetails?.bankAccountNumber || "Loading..."}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Receipt Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload Payment Receipt
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="receipt-upload"
                            disabled={isUploading}
                          />
                          <label
                            htmlFor="receipt-upload"
                            className={`
                              flex flex-col items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-200 border-dashed rounded-2xl appearance-none cursor-pointer hover:border-black focus:outline-none
                              ${
                                receiptUrl ? "border-green-500 bg-green-50" : ""
                              }
                              ${
                                isUploading
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }
                            `}
                          >
                            {isUploading ? (
                              <div className="flex flex-col items-center gap-2">
                                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                                <span className="text-sm text-gray-500">
                                  Uploading...
                                </span>
                              </div>
                            ) : receiptUrl ? (
                              <div className="flex flex-col items-center gap-2">
                                <Check className="w-8 h-8 text-green-500" />
                                <span className="text-sm font-medium text-green-700">
                                  Receipt Uploaded
                                </span>
                                <span className="text-xs text-green-600 underline">
                                  Change file
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2 text-gray-500">
                                <Truck className="w-8 h-8" />
                                <span className="text-sm">
                                  Click to upload receipt image
                                </span>
                                <span className="text-xs">
                                  PNG, JPG up to 5MB
                                </span>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 flex items-center gap-2">
                        <Lock size={14} />
                        Your payment information is encrypted and secure
                      </p>
                    </div>
                  </div>

                  {/* Submit Button - Mobile */}
                  <div className="lg:hidden">
                    <button
                      type="submit"
                      disabled={isProcessing || isUploading}
                      className={`
                        w-full py-4 px-6 rounded-full font-medium text-base transition-all
                        flex items-center justify-center gap-3
                        ${
                          isProcessing || isUploading
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-black text-white hover:bg-gray-800"
                        }
                      `}
                    >
                      {isProcessing ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Lock size={18} />
                          Pay {formatPrice(orderTotal)}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>

            {/* Right Column - Order Summary */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="lg:sticky lg:top-28"
              >
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="font-heading font-semibold text-lg text-black mb-6">
                    Order Summary
                  </h2>

                  {/* Cart Items */}
                  <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                          {item.product.images && item.product.images[0] ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ProductImagePlaceholder
                              variant={item.product.variant}
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-black text-sm truncate">
                            {item.product.name}
                          </p>
                          {item.size && (
                            <p className="text-xs text-gray-500">
                              Size: {item.size}
                            </p>
                          )}
                        </div>
                        <p className="font-mono text-sm text-black">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Reward Code Section */}
                  <div className="border-t border-gray-100 pt-4 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag size={16} className="text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Reward Code
                      </span>
                    </div>
                    {appliedReward ? (
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100">
                        <div className="flex items-center gap-2">
                          <Check size={16} className="text-green-600" />
                          <div>
                            <p className="text-sm font-medium text-green-800">
                              {appliedReward.discountPercent}% OFF Applied
                            </p>
                            <p className="text-xs text-green-600 font-mono">
                              {appliedReward.code}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={removeRewardCode}
                          className="p-1 text-green-600 hover:text-green-800 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter reward code"
                          value={rewardCode}
                          onChange={(e) =>
                            setRewardCode(e.target.value.toUpperCase())
                          }
                          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 placeholder:text-gray-400 font-mono"
                        />
                        <button
                          type="button"
                          onClick={applyRewardCode}
                          disabled={isValidatingReward || !rewardCode.trim()}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            isValidatingReward || !rewardCode.trim()
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-black text-white hover:bg-gray-800"
                          }`}
                        >
                          {isValidatingReward ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            "Apply"
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Price Summary */}
                  <div className="border-t border-gray-100 pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Subtotal ({totalItems} items)
                      </span>
                      <span className="font-mono text-black">
                        {formatPrice(totalPrice)}
                      </span>
                    </div>
                    {appliedReward && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">
                          Discount ({appliedReward.discountPercent}%)
                        </span>
                        <span className="font-mono text-green-600">
                          -{formatPrice(discountAmount)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-mono text-black">
                        {shippingCost === 0 ? (
                          <span className="text-green-600">Free</span>
                        ) : (
                          formatPrice(shippingCost)
                        )}
                      </span>
                    </div>
                    <div className="border-t border-gray-100 pt-3 flex justify-between">
                      <span className="font-semibold text-black">Total</span>
                      <span className="font-mono text-xl font-semibold text-black">
                        {formatPrice(orderTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Free Shipping Progress */}
                  {totalPrice < 50000 && (
                    <div className="mt-4 p-3 bg-amber-50 rounded-xl">
                      <p className="text-xs text-amber-800">
                        Add {formatPrice(50000 - totalPrice)} more for free
                        shipping
                      </p>
                    </div>
                  )}

                  {/* Submit Button - Desktop */}
                  <div className="hidden lg:block mt-6">
                    <button
                      type="submit"
                      form="checkout-form"
                      disabled={isProcessing || isUploading}
                      className={`
                        w-full py-4 px-6 rounded-full font-medium text-base transition-all
                        flex items-center justify-center gap-3
                        ${
                          isProcessing || isUploading
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-black text-white hover:bg-gray-800"
                        }
                      `}
                    >
                      {isProcessing ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Lock size={18} />
                          Pay {formatPrice(orderTotal)}
                        </>
                      )}
                    </button>
                  </div>

                  {/* Trust Badges */}
                  <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <ShieldCheck size={18} className="text-green-600" />
                      <span>Secure checkout</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Truck size={18} className="text-black" />
                      <span>Delivery within 3-5 business days</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
