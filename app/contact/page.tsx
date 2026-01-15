"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Phone, Mail, Instagram, MessageCircle } from "lucide-react";

export default function ContactPage() {
  const contactMethods = [
    {
      icon: Phone,
      title: "Phone",
      value: "08149113328",
      href: "tel:+2348149113328",
      description: "Call us during business hours",
    },
    {
      icon: Mail,
      title: "Email",
      value: "support@justfitsng.com",
      href: "mailto:support@justfitsng.com",
      description: "We'll respond within 24 hours",
    },
    {
      icon: Instagram,
      title: "Instagram",
      value: "@justfitsng",
      href: "https://www.instagram.com/justfitsng",
      description: "Follow us for updates",
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <MessageCircle size={16} />
              We're here to help
            </div>
            <h1 className="font-display text-5xl md:text-7xl text-black tracking-tight mb-6">
              GET IN TOUCH
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              Have questions about our products or need assistance?
              <br className="hidden sm:block" />
              Our support team is here to help you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <motion.a
                  key={method.title}
                  href={method.href}
                  target={method.title === "Instagram" ? "_blank" : undefined}
                  rel={
                    method.title === "Instagram"
                      ? "noopener noreferrer"
                      : undefined
                  }
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="group relative bg-white border-2 border-gray-100 rounded-2xl p-8 hover:border-black transition-all duration-300 shadow-sm hover:shadow-xl"
                >
                  {/* Icon */}
                  <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-black text-white group-hover:scale-110 transition-transform duration-300">
                      <Icon size={28} />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-black mb-2">
                    {method.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-500 mb-4">
                    {method.description}
                  </p>

                  {/* Value */}
                  <p className="font-mono text-base text-black group-hover:text-gray-700 transition-colors">
                    {method.value}
                  </p>

                  {/* Hover Arrow */}
                  <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-black"
                    >
                      <path
                        d="M7 17L17 7M17 7H7M17 7V17"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </motion.a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Additional Info */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="font-display text-3xl md:text-4xl text-black mb-6">
              BUSINESS HOURS
            </h2>
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="grid gap-4 text-left max-w-md mx-auto">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-600">Monday - Friday</span>
                  <span className="font-medium text-black">
                    9:00 AM - 6:00 PM
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-600">Saturday</span>
                  <span className="font-medium text-black">
                    10:00 AM - 4:00 PM
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Sunday</span>
                  <span className="font-medium text-black">Closed</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              All times are in West Africa Time (WAT)
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="font-display text-3xl md:text-4xl text-black text-center mb-12">
              QUICK ANSWERS
            </h2>
            <div className="space-y-6">
              {[
                {
                  question: "How long does shipping take?",
                  answer:
                    "We process orders within 1-2 business days. Delivery within Lagos takes 2-3 days, while other locations in Nigeria take 3-5 business days.",
                },
                {
                  question: "What is your return policy?",
                  answer:
                    "We offer a 30-day return policy on all items in their original condition with tags attached. Please contact support to initiate a return.",
                },
                {
                  question: "Do you ship internationally?",
                  answer:
                    "Currently, we only ship within Nigeria. International shipping will be available soon!",
                },
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors"
                >
                  <h3 className="font-semibold text-black mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
