import React, { useState } from 'react';
import { faqItems } from '../data/faq';

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Questions fréquentes
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tout ce que vous devez savoir sur nos services
          </p>
        </div>
        
        {/* FAQ Items */}
        <div className="max-w-3xl mx-auto">
          {faqItems.map((item, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl mb-4 shadow-sm hover:shadow-md transition-all duration-300"
            >
              {/* Question */}
              <button
                className="w-full px-8 py-6 text-left flex justify-between items-center focus:outline-none"
                onClick={() => toggleFAQ(index)}
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <span className="text-lg font-semibold text-gray-900 pr-4">
                  {item.question}
                </span>
                <span className={`text-2xl transition-transform duration-300 ${
                  openIndex === index ? 'rotate-45' : 'rotate-0'
                }`}>
                  +
                </span>
              </button>
              
              {/* Answer */}
              <div 
                id={`faq-answer-${index}`}
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96 pb-6' : 'max-h-0'
                }`}
              >
                <div className="px-8 text-gray-600 leading-relaxed">
                  {item.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Contact CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Vous avez d'autres questions ?
          </p>
          <a 
            href="/contact"
            className="inline-flex items-center px-6 py-3 text-blue-600 border border-blue-600 rounded-full font-semibold hover:bg-blue-50 transition-colors duration-300"
          >
            Nous contacter
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQ;