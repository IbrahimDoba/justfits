import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  RotateCcw,
  Package,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Returns & Exchanges | JustFits",
  description:
    "Learn about our return and exchange policy for premium caps. Easy returns within 14 days.",
};

export default function ReturnsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-display text-5xl md:text-7xl text-black tracking-tight mb-6">
              Returns & Exchanges
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              We want you to love your JustFits cap. If you're not completely
              satisfied, we're here to help.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 space-y-12">
            {/* Return Policy Overview */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-black/5 rounded-lg">
                  <RotateCcw className="text-black" size={24} />
                </div>
                <h2 className="font-display text-3xl text-black">
                  14-Day Return Policy
                </h2>
              </div>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  We offer a <strong>14-day return policy</strong> from the date
                  you receive your order. If you're not satisfied with your
                  purchase, you can return it for a full refund or exchange.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800">
                    <strong>Important:</strong> Items must be unworn, unwashed,
                    and in their original condition with all tags attached.
                  </p>
                </div>
              </div>
            </div>

            {/* Eligibility Criteria */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-black/5 rounded-lg">
                  <CheckCircle className="text-black" size={24} />
                </div>
                <h2 className="font-display text-3xl text-black">
                  Return Eligibility
                </h2>
              </div>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  To be eligible for a return, your item must meet the following
                  conditions:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold mt-1 text-xl">
                      ✓
                    </span>
                    <span>Item must be in its original, unworn condition</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold mt-1 text-xl">
                      ✓
                    </span>
                    <span>All original tags must be attached</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold mt-1 text-xl">
                      ✓
                    </span>
                    <span>
                      Item must be unwashed and free from any wear, odors, or
                      damage
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold mt-1 text-xl">
                      ✓
                    </span>
                    <span>
                      Return must be initiated within 14 days of delivery
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold mt-1 text-xl">
                      ✓
                    </span>
                    <span>
                      Original packaging is preferred but not required
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Items Not Eligible */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-red-50 rounded-lg">
                  <AlertCircle className="text-red-600" size={24} />
                </div>
                <h2 className="font-display text-3xl text-black">
                  Non-Returnable Items
                </h2>
              </div>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  For hygiene and quality reasons, the following items cannot be
                  returned:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-red-600 font-bold mt-1 text-xl">
                      ✗
                    </span>
                    <span>Items that have been worn or washed</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-600 font-bold mt-1 text-xl">
                      ✗
                    </span>
                    <span>Items with removed or damaged tags</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-600 font-bold mt-1 text-xl">
                      ✗
                    </span>
                    <span>Sale or clearance items (unless defective)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-600 font-bold mt-1 text-xl">
                      ✗
                    </span>
                    <span>Custom or personalized items</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Return Process */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-black/5 rounded-lg">
                  <Package className="text-black" size={24} />
                </div>
                <h2 className="font-display text-3xl text-black">
                  How to Return an Item
                </h2>
              </div>
              <div className="space-y-6 text-gray-700 leading-relaxed">
                <div>
                  <h3 className="font-semibold text-black mb-2">
                    Step 1: Contact Us
                  </h3>
                  <p>
                    Email us at{" "}
                    <a
                      href="mailto:support@justfits.com"
                      className="text-black underline hover:no-underline"
                    >
                      support@justfits.com
                    </a>{" "}
                    with your order number and reason for return. Include photos
                    if the item is defective or damaged.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-black mb-2">
                    Step 2: Receive Return Authorization
                  </h3>
                  <p>
                    Our team will review your request and provide you with a
                    Return Authorization (RA) number and return shipping
                    instructions within 24-48 hours.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-black mb-2">
                    Step 3: Pack Your Item
                  </h3>
                  <p>
                    Securely pack the item in its original packaging (if
                    available) along with the RA number. Make sure all tags are
                    attached.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-black mb-2">
                    Step 4: Ship Your Return
                  </h3>
                  <p>
                    Send the package to the address provided in your return
                    authorization email. We recommend using a trackable shipping
                    service.
                  </p>
                  <p className="text-sm text-gray-600 italic mt-2">
                    *Return shipping costs are the responsibility of the
                    customer unless the item is defective or we made an error.
                  </p>
                </div>
              </div>
            </div>

            {/* Exchange Policy */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-black/5 rounded-lg">
                  <RotateCcw className="text-black" size={24} />
                </div>
                <h2 className="font-display text-3xl text-black">Exchanges</h2>
              </div>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  We're happy to exchange your item for a different size or
                  style, subject to availability. The exchange process follows
                  the same steps as returns.
                </p>
                <p>
                  If the replacement item is of higher value, you'll be charged
                  the difference. If it's of lower value, we'll refund the
                  difference to your original payment method.
                </p>
              </div>
            </div>

            {/* Refund Processing */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-black/5 rounded-lg">
                  <CheckCircle className="text-black" size={24} />
                </div>
                <h2 className="font-display text-3xl text-black">
                  Refund Processing
                </h2>
              </div>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Once we receive and inspect your returned item, we'll send you
                  an email confirmation. If your return is approved:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <span className="text-black font-bold mt-1">•</span>
                    <span>
                      Refunds will be processed to your original payment method
                      within 5-7 business days
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-black font-bold mt-1">•</span>
                    <span>
                      Depending on your bank, it may take an additional 3-5
                      business days for the refund to appear in your account
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-black font-bold mt-1">•</span>
                    <span>
                      Original shipping costs are non-refundable (except in
                      cases of defective products or our error)
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Damaged or Defective Items */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <h3 className="font-semibold text-black mb-3 flex items-center gap-2">
                <AlertCircle size={20} />
                Received a Damaged or Defective Item?
              </h3>
              <p className="text-gray-700 mb-3">
                We're sorry if your item arrived damaged or defective. Please
                contact us immediately at{" "}
                <a
                  href="mailto:support@justfits.com"
                  className="text-black underline hover:no-underline"
                >
                  support@justfits.com
                </a>{" "}
                with photos of the damage.
              </p>
              <p className="text-gray-700">
                We'll arrange for a replacement or full refund, including return
                shipping costs, at no additional charge to you.
              </p>
            </div>

            {/* Contact */}
            <div className="border-t border-gray-200 pt-8">
              <h2 className="font-display text-2xl text-black mb-4">
                Questions About Returns?
              </h2>
              <p className="text-gray-700 mb-6">
                Our customer service team is here to help with any questions
                about returns or exchanges:
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

            {/* Consumer Rights */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-black mb-3">
                Your Consumer Rights
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                This returns policy does not affect your statutory rights under
                the{" "}
                <strong>
                  Federal Competition and Consumer Protection Act (FCCPA) 2018
                </strong>{" "}
                and the <strong>Nigeria Data Protection Act (NDPA) 2023</strong>
                . You are entitled to a refund, repair, or replacement if goods
                are faulty or not as described.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
