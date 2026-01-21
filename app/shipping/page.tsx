import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Truck, Package, MapPin, Clock, Phone, Mail } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Shipping Information | JustFits",
  description:
    "Learn about our shipping policies, delivery times, and shipping costs across Nigeria.",
};

export default function ShippingPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-display text-5xl md:text-7xl text-black tracking-tight mb-6">
              Shipping Information
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              We deliver premium caps across Nigeria with care and efficiency.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 space-y-12">
            {/* Shipping Zones & Costs */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-black/5 rounded-lg">
                  <MapPin className="text-black" size={24} />
                </div>
                <h2 className="font-display text-3xl text-black">
                  Shipping Zones & Costs
                </h2>
              </div>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  We currently ship to all states within Nigeria. Shipping costs
                  are calculated based on your delivery location:
                </p>
                <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      Abuja
                    </span>
                    <span className="font-semibold">₦3,500</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      Lagos (Mainland & Island)
                    </span>
                    <span className="font-semibold">₦7,500</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Other States</span>
                    <span className="font-semibold">₦4,000</span>
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                  <p className="text-green-800 font-medium">
                    🎉 Free Shipping on orders above ₦60,000!
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery Times */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-black/5 rounded-lg">
                  <Clock className="text-black" size={24} />
                </div>
                <h2 className="font-display text-3xl text-black">
                  Delivery Timeframes
                </h2>
              </div>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  After your order is confirmed and payment is verified, here
                  are the estimated delivery times:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-black font-bold mt-1">•</span>
                    <span>
                      <strong>Lagos:</strong> 2-3 business days
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-black font-bold mt-1">•</span>
                    <span>
                      <strong>Abuja, Port Harcourt, Ibadan:</strong> 2 business days
                      business days
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-black font-bold mt-1">•</span>
                    <span>
                      <strong>Other Locations:</strong> 2-4 business days
                    </span>
                  </li>
                </ul>
                <p className="text-sm text-gray-600 italic">
                  *Business days exclude weekends and public holidays. Delivery
                  times may vary during peak periods or due to unforeseen
                  circumstances.
                </p>
              </div>
            </div>

            {/* Order Processing */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-black/5 rounded-lg">
                  <Package className="text-black" size={24} />
                </div>
                <h2 className="font-display text-3xl text-black">
                  Order Processing
                </h2>
              </div>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  All orders are processed within 1-2 business days after
                  payment confirmation. You will receive an email notification
                  when your order has been shipped with tracking information.
                </p>
                <p>
                  Orders placed on weekends or public holidays will be processed
                  on the next business day.
                </p>
              </div>
            </div>

            {/* Tracking */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-black/5 rounded-lg">
                  <Truck className="text-black" size={24} />
                </div>
                <h2 className="font-display text-3xl text-black">
                  Order Tracking
                </h2>
              </div>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Once your order ships, you'll receive a confirmation email
                  with a tracking number. You can track your package through:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <span className="text-black font-bold mt-1">•</span>
                    <span>
                      Your account dashboard at{" "}
                      <Link
                        href="/profile"
                        className="text-black underline hover:no-underline"
                      >
                        justfits.com/profile
                      </Link>
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-black font-bold mt-1">•</span>
                    <span>
                      The tracking link provided in your shipping confirmation
                      email
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Shipping Partners */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-black/5 rounded-lg">
                  <Truck className="text-black" size={24} />
                </div>
                <h2 className="font-display text-3xl text-black">
                  Our Shipping Partners
                </h2>
              </div>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  We work with trusted logistics partners to ensure your orders
                  arrive safely and on time:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <span className="text-black font-bold mt-1">•</span>
                    <span>GIG Logistics</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-black font-bold mt-1">•</span>
                    <span>DHL Express</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-black font-bold mt-1">•</span>
                    <span>Kwik Delivery</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact */}
            <div className="border-t border-gray-200 pt-8">
              <h2 className="font-display text-2xl text-black mb-4">
                Need Help?
              </h2>
              <p className="text-gray-700 mb-6">
                If you have questions about shipping or need assistance with
                your order, please contact us:
              </p>
              <div className="space-y-3">
                <a
                  href="mailto:support@justfits.com"
                  className="flex items-center gap-3 text-gray-700 hover:text-black transition-colors"
                >
                  <Mail size={20} />
                  <span>support@justfits.com</span>
                </a>
                <a
                  href="tel:+2348149113328"
                  className="flex items-center gap-3 text-gray-700 hover:text-black transition-colors"
                >
                  <Phone size={20} />
                  <span>+234 814 911 3328</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
