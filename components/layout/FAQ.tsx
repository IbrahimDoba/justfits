"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "How long does delivery take?",
    answer:
      "For deliveries within Abuja, you can expect your order within 24-48 hours. Orders outside Abuja typically take 3-5 business days depending on your location.",
  },
  {
    question: "Do you offer international shipping?",
    answer:
      "Currently, we focused on providing the best experience within Nigeria. However, we are working on expanding our reach to international car enthusiasts soon. Stay tuned!",
  },
  {
    question: "What is your return policy?",
    answer:
      "We offer a 7-day return policy for items in their original, unworn condition with all tags attached. Please contact our support team to initiate a return.",
  },
  {
    question: "Are the caps limited edition?",
    answer:
      "Yes! Most of our drops are limited edition. Once a specific design is sold out, we rarely restock it to maintain the exclusivity of our premium collection.",
  },
  {
    question: "How do I care for my JustFits cap?",
    answer:
      "To maintain the premium quality and shape of your cap, we recommend spot cleaning with a damp cloth and mild detergent. Avoid machine washing or submerging in water.",
  },
  {
    question: "How can I track my order?",
    answer:
      "Once your order is shipped, you will receive a confirmation email with a tracking number and a link to track your package in real-time.",
  },
  {
    question: "Are these official licensed products?",
    answer:
      "Our products are carefully designed and crafted to ensure high quality and authenticity in style. While they are not official licensed merchandise, we bring you the best automotive-inspired streetwear experience. JustFits is not affiliated with, endorsed by, or sponsored by any automobile manufacturer including BMW, Mercedes-Benz, Porsche, or any other automotive brand. All designs are original creations inspired by automotive culture and heritage.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-4xl md:text-6xl text-black mb-6"
          >
            FREQUENTLY ASKED QUESTIONS
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 text-lg"
          >
            Everything you need to know about our premium collection and
            services.
          </motion.p>
        </div>

        <div className="max-w-4xl mx-auto">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="border-b border-gray-100"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full py-8 flex items-center justify-between text-left hover:text-gray-600 transition-colors group"
              >
                <span className="text-xl md:text-2xl font-medium text-black group-hover:text-gray-600 transition-colors">
                  {faq.question}
                </span>
                <div className="flex-shrink-0 ml-4">
                  {openIndex === index ? (
                    <Minus size={24} className="text-black" />
                  ) : (
                    <Plus size={24} className="text-black" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="pb-8 text-gray-600 text-lg leading-relaxed max-w-3xl">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
