"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { fadeInUp } from "@/animations/variants";

export default function TermsPage() {
  const lastUpdated = new Date().toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header Section */}
      <section className="pt-32 pb-12 bg-white border-b border-gray-100">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="font-display text-4xl md:text-5xl text-black mb-6">
              TERMS OF SERVICE
            </h1>
            <p className="text-gray-500">Last Updated: {lastUpdated}</p>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm"
          >
            <div className="text-gray-600 leading-relaxed text-lg">
              <p className="text-lg md:text-xl text-gray-800 mb-8 font-medium">
                Welcome to JustFits. These Terms of Service ("Terms") enable us
                to provide you with our premium products and services. By
                accessing or using our website, you agree to be bound by these
                Terms and our Privacy Policy.
              </p>

              <h2 className="font-display text-2xl text-black mb-4 mt-8">
                1. Overview and Acceptance
              </h2>
              <p className="mb-4">
                JustFits ("we," "us," or "our") operates this e-commerce
                platform in compliance with the laws of the Federal Republic of
                Nigeria. By using our site and purchasing our products, you
                engage in our "Service" and agree to be bound by the following
                terms and conditions, including those additional terms and
                policies referenced herein.
              </p>

              <h2 className="font-display text-2xl text-black mb-4 mt-8">
                2. Information Accuracy and Complains (FCCPA)
              </h2>
              <p className="mb-4">
                In accordance with the{" "}
                <strong className="text-black font-semibold">
                  Federal Competition and Consumer Protection Act (FCCPA) 2018
                </strong>
                , we are committed to providing clear and accurate information
                about our products, including pricing, availability, and
                descriptions.
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>
                  We reserve the right to modify the contents of this site at
                  any time, but we have no obligation to update any information
                  on our site.
                </li>
                <li>
                  Prices for our products are subject to change without notice.
                </li>
                <li>
                  We shall not be liable to you or to any third-party for any
                  modification, price change, suspension, or discontinuance of
                  the Service.
                </li>
              </ul>
              <p className="mb-4">
                As a consumer, you have the right to be informed. If you believe
                any product description is misleading or inaccurate, please
                contact our support team immediately.
              </p>

              <h2 className="font-display text-2xl text-black mb-4 mt-8">
                3. Returns and Refunds Policy
              </h2>
              <p className="mb-4">
                Our policy aligns with Nigerian consumer protection laws. We do
                not support "No Refund" policies where they violate your
                statutory rights.
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>
                  <strong className="text-black font-semibold">
                    Defective Goods:
                  </strong>{" "}
                  If you receive a product that is defective, damaged, or
                  significantly unlike its description, you are entitled to a
                  return, replacement, or refund. Please report such issues
                  within 7 days of delivery.
                </li>
                <li>
                  <strong className="text-black font-semibold">
                    Exchange:
                  </strong>{" "}
                  We offer exchanges for sizing issues, provided the item is
                  returned in its original, unused condition with all tags
                  attached.
                </li>
                <li>
                  <strong className="text-black font-semibold">Process:</strong>{" "}
                  To initiate a return, contact us at support@justfits.com.
                  Refunds will be processed to the original method of payment
                  within a reasonable timeframe, typically 5-10 business days
                  after we receive and inspect the return.
                </li>
              </ul>

              <h2 className="font-display text-2xl text-black mb-4 mt-8">
                4. Data Protection and Privacy (NDPA 2023)
              </h2>
              <p className="mb-4">
                Your privacy is paramount. We process your personal data in
                strict compliance with the{" "}
                <strong className="text-black font-semibold">
                  Nigeria Data Protection Act (NDPA) 2023
                </strong>
                .
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>
                  <strong className="text-black font-semibold">Consent:</strong>{" "}
                  By using our site, you consent to the collection and use of
                  your personal information as described in our Privacy Policy.
                  You have the right to withdraw this consent at any time.
                </li>
                <li>
                  <strong className="text-black font-semibold">Purpose:</strong>{" "}
                  We only collect data necessary for processing orders,
                  improving our services, and communicating with you (e.g.,
                  shipping details, email address).
                </li>
                <li>
                  <strong className="text-black font-semibold">Rights:</strong>{" "}
                  You have the right to request access to your data, correction
                  of inaccuracies, or deletion of your personal information from
                  our records.
                </li>
              </ul>

              <h2 className="font-display text-2xl text-black mb-4 mt-8">
                5. User Responsibilities
              </h2>
              <p className="mb-4">
                You agree not to reproduce, duplicate, copy, sell, resell or
                exploit any portion of the Service, use of the Service, or
                access to the Service without express written permission by us.
                You must not transmit any worms or viruses or any code of a
                destructive nature.
              </p>

              <h2 className="font-display text-2xl text-black mb-4 mt-8">
                6. Electronic Transactions
              </h2>
              <p className="mb-4">
                By placing an order, you enter into a binding electronic
                contract. We confirm receipt of orders via email, but purchase
                acceptance only takes place when the product is dispatched. We
                reserve the right to refuse any order you place with us (e.g.,
                in cases of suspected fraud or stock shortages).
              </p>

              <h2 className="font-display text-2xl text-black mb-4 mt-8">
                7. Limitation of Liability
              </h2>
              <p className="mb-4">
                To the fullest extent permitted by Nigerian law, JustFits shall
                not be liable for any injury, loss, claim, or any direct,
                indirect, incidental, punitive, special, or consequential
                damages of any kind, including, without limitation lost profits,
                lost revenue, lost savings, loss of data, replacement costs, or
                any similar damages, whether based in contract, tort (including
                negligence), strict liability or otherwise, arising from your
                use of any of the service or any products procured using the
                service.
              </p>

              <h2 className="font-display text-2xl text-black mb-4 mt-8">
                8. Governing Law and Dispute Resolution
              </h2>
              <p className="mb-4">
                These Terms of Service and any separate agreements whereby we
                provide you Services shall be governed by and construed in
                accordance with the laws of the{" "}
                <strong className="text-black font-semibold">
                  Federal Republic of Nigeria
                </strong>
                .
              </p>
              <p className="mb-4">
                Any dispute arising out of or in connection with these Terms,
                including any question regarding their existence, validity, or
                termination, shall be referred to and finally resolved by
                arbitration in Nigeria in accordance with the Arbitration and
                Mediation Act 2023.
              </p>

              <h2 className="font-display text-2xl text-black mb-4 mt-8">
                9. Contact Information
              </h2>
              <p className="mb-4">
                Questions about the Terms of Service should be sent to us at
                support@justfits.com.
              </p>

              <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                <p>
                  &copy; {new Date().getFullYear()} JustFits. All rights
                  reserved.
                </p>
                <p>Designed for Excellence.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
