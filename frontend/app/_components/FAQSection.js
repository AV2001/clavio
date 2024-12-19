"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import WordFadeIn from "@/app/_components/shadcn/word-fade-in";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/_components/shadcn/accordion";

const faqItems = [
  {
    question:
      "What's the difference between customer-facing and internal chatbots?",
    answer:
      "Internal chatbots are designed to help your employees access company information, documentation, and internal knowledge bases efficiently. They act as virtual assistants for your team's internal operations. Customer-facing chatbots, on the other hand, are deployed on your public website to assist customers with questions, support issues, and general inquiries about your products or services. Both types can be customized and trained on your specific content using Clavio's platform.",
  },
  {
    question: "How does pricing work?",
    answer:
      "We offer different pricing tiers based on your needs. For internal chatbots, we have Hobby, Startup, and Enterprise plans with varying features. For customer-facing chatbots, pricing is based on message volume. Contact us for a custom quote.",
  },
  {
    question: "Can I customize my chatbot's responses?",
    answer:
      "Yes, you can fully customize your chatbot's responses by training it on your specific documentation, PDFs, and website content. You can also set custom prompts and fine-tune the AI's behavior.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes! When you create an account, you'll automatically get a 7-day free trial with access to our core features. While some features are reserved for paid plans, the trial gives you a great opportunity to experience the main capabilities of our chatbots.",
  },
  {
    question: "How secure is my data?",
    answer:
      "We take security seriously. All data is encrypted in transit and at rest. We follow industry best practices for data protection and comply with relevant security standards.",
  },
];

export default function FAQSection() {
  const faqRef = useRef(null);
  const faqInView = useInView(faqRef, { once: true, amount: 0.2 });

  return (
    <section className="py-20 bg-gray-50" ref={faqRef}>
      <div className="container max-w-5xl mx-auto px-4">
        {faqInView && (
          <>
            <WordFadeIn
              words="Frequently Asked Questions"
              className="text-3xl font-bold text-center mb-12"
            />

            <Accordion
              type="single"
              collapsible
              className="w-full max-w-5xl mx-auto"
            >
              {faqItems.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border-none mb-4"
                >
                  <AccordionTrigger className="text-left text-base px-4 rounded-lg hover:bg-gray-50 hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-4">
                    <p className="text-base tracking-wide leading-relaxed text-gray-700">
                      {item.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </>
        )}
      </div>
    </section>
  );
}
