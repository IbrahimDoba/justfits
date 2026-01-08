"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { fadeInUp } from "@/animations/variants";

export default function PrivacyPage() {
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
              PRIVACY POLICY
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
                At JustFits, we value your trust and are committed to protecting
                your privacy. This Privacy Policy outlines how we collect, use,
                process, and safeguard your personal data in strict compliance
                with the Nigeria Data Protection Act (NDPA) 2023 and other
                relevant regulations.
              </p>

              <h2 className="font-display text-2xl text-black mb-4 mt-8">
                1. Information We Collect
              </h2>
              <p className="mb-4">
                We collect personal data that you voluntarily provide to us when
                you use our services. This includes:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>
                  <strong className="text-black font-semibold">
                    Identity Data:
                  </strong>{" "}
                  Name, username, or similar identifiers.
                </li>
                <li>
                  <strong className="text-black font-semibold">
                    Contact Data:
                  </strong>{" "}
                  Billing address, delivery address, email address, and
                  telephone numbers.
                </li>
                <li>
                  <strong className="text-black font-semibold">
                    Financial Data:
                  </strong>{" "}
                  Payment card details (processed securely by our payment
                  partners; we do not store full card details).
                </li>
                <li>
                  <strong className="text-black font-semibold">
                    Transaction Data:
                  </strong>{" "}
                  Details about payments to and from you and other details of
                  products you have purchased from us.
                </li>
                <li>
                  <strong className="text-black font-semibold">
                    Technical Data:
                  </strong>{" "}
                  IP address, browser type and version, time zone setting, and
                  operating system via cookies and analytics tools.
                </li>
              </ul>

              <h2 className="font-display text-2xl text-black mb-4 mt-8">
                2. Lawful Basis for Processing
              </h2>
              <p className="mb-4">
                Under the NDPA 2023, we process your personal data based on the
                following lawful grounds:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>
                  <strong className="text-black font-semibold">Consent:</strong>{" "}
                  Where you have given explicit consent for specific purposes
                  (e.g., subscribing to our newsletter).
                </li>
                <li>
                  <strong className="text-black font-semibold">
                    Contractual Necessity:
                  </strong>{" "}
                  To fulfill the contract of sale when you purchase a product
                  (e.g., delivering your order).
                </li>
                <li>
                  <strong className="text-black font-semibold">
                    Legal Obligation:
                  </strong>{" "}
                  To comply with legal or regulatory requirements (e.g., tax
                  reporting).
                </li>
                <li>
                  <strong className="text-black font-semibold">
                    Legitimate Interest:
                  </strong>{" "}
                  For our legitimate business interests, such as fraud
                  prevention and improving our services, provided these do not
                  override your fundamental rights.
                </li>
              </ul>

              <h2 className="font-display text-2xl text-black mb-4 mt-8">
                3. How We Use Your Information
              </h2>
              <p className="mb-4">We use your personal data to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Process and deliver your orders.</li>
                <li>Manage your account and relationship with us.</li>
                <li>Verify your identity and process payments securely.</li>
                <li>
                  Send you marketing communications (only if you have opted in).
                </li>
                <li>Improve our website, products, and customer service.</li>
              </ul>

              <h2 className="font-display text-2xl text-black mb-4 mt-8">
                4. Data Retention
              </h2>
              <p className="mb-4">
                We will only retain your personal data for as long as primarily
                necessary to fulfill the purposes we collected it for, including
                for the purposes of satisfying any legal, accounting, or
                reporting requirements. When data is no longer needed, it is
                securely deleted or anonymized.
              </p>

              <h2 className="font-display text-2xl text-black mb-4 mt-8">
                5. Data Security
              </h2>
              <p className="mb-4">
                We have implemented appropriate technical and organizational
                measures to prevent your personal data from being accidentally
                lost, used, or accessed in an unauthorized way. Access to your
                personal data is limited to those employees, agents, and third
                parties who have a business need to know.
              </p>

              <h2 className="font-display text-2xl text-black mb-4 mt-8">
                6. Your Rights (Data Subject Rights)
              </h2>
              <p className="mb-4">
                Under the NDPA, you have specific rights regarding your personal
                data:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>
                  <strong className="text-black font-semibold">
                    Right to Access:
                  </strong>{" "}
                  You can request a copy of the personal data we hold about you.
                </li>
                <li>
                  <strong className="text-black font-semibold">
                    Right to Rectification:
                  </strong>{" "}
                  You can ask us to correct inaccuarate or incomplete data.
                </li>
                <li>
                  <strong className="text-black font-semibold">
                    Right to Erasure:
                  </strong>{" "}
                  You can ask us to delete your personal data where there is no
                  good reason for us to continue processing it ("Right to be
                  Forgotten").
                </li>
                <li>
                  <strong className="text-black font-semibold">
                    Right to Withdraw Consent:
                  </strong>{" "}
                  Where we rely on consent to process your data, you may
                  withdraw this consent at any time.
                </li>
                <li>
                  <strong className="text-black font-semibold">
                    Right to Object:
                  </strong>{" "}
                  You can object to the processing of your data for direct
                  marketing purposes.
                </li>
                <li>
                  <strong className="text-black font-semibold">
                    Right to Portability:
                  </strong>{" "}
                  You can request the transfer of your data to you or a third
                  party.
                </li>
              </ul>
              <p className="mb-4">
                To exercise any of these rights, please contact us at
                support@justfits.com, We will respond to your request within 30
                days.
              </p>

              <h2 className="font-display text-2xl text-black mb-4 mt-8">
                7. Third-Party Disclosures
              </h2>
              <p className="mb-4">
                We may share your data with trusted third parties who assist us
                in operating our website and conducting our business, such as:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Payment service providers (to process transactions).</li>
                <li>Logistics and delivery partners (to ship your orders).</li>
                <li>Professional advisers (lawyers, auditors, insurers).</li>
              </ul>
              <p className="mb-4">
                We require all third parties to respect the security of your
                personal data and to treat it in accordance with the law.
              </p>

              <h2 className="font-display text-2xl text-black mb-4 mt-8">
                8. International Transfers
              </h2>
              <p className="mb-4">
                If we transfer your personal data out of Nigeria, we ensure a
                similar degree of protection is afforded to it by ensuring at
                least one of the specific safeguards approved by the Nigeria
                Data Protection Commission (NDPC) is implemented.
              </p>

              <h2 className="font-display text-2xl text-black mb-4 mt-8">
                9. Remedies and Complaints
              </h2>
              <p className="mb-4">
                If you believe your rights under the NDPA have been violated,
                you have the right to lodge a compliant with the{" "}
                <strong className="text-black font-semibold">
                  Nigeria Data Protection Commission (NDPC)
                </strong>{" "}
                at{" "}
                <a
                  href="https://ndpc.gov.ng"
                  className="text-black underline underline-offset-4 decoration-1 hover:decoration-2"
                >
                  ndpc.gov.ng
                </a>
                .
              </p>

              <h2 className="font-display text-2xl text-black mb-4 mt-8">
                10. Contact Us
              </h2>
              <p className="mb-4">
                If you have any questions about this Privacy Policy or our
                privacy practices, please contact our Data Privacy Team at:
              </p>
              <p className="mb-4 font-medium text-black">
                Email: support@justfits.com
                <br />
                Address: Online Store, Abuja, Nigeria
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
