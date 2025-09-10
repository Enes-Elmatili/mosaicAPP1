import React from 'react';
import { testimonials } from '../data/testimonials';

const Testimonials: React.FC = () => {
  const renderStars = (rating: number) => {
    return '★'.repeat(rating);
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ce que disent nos clients
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez les témoignages de propriétaires qui nous font confiance
          </p>
        </div>
        
        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              {/* Rating */}
              <div className="text-yellow-500 text-xl mb-4" aria-label={`Note: ${testimonial.rating} sur 5 étoiles`}>
                {renderStars(testimonial.rating)}
              </div>
              
              {/* Testimonial Content */}
              <blockquote className="text-gray-700 leading-relaxed mb-6">
                "{testimonial.content}"
              </blockquote>
              
              {/* Author */}
              <div className="border-t pt-4">
                <div className="font-semibold text-gray-900">
                  {testimonial.name}
                </div>
                <div className="text-sm text-gray-600">
                  {testimonial.role}
                </div>
                <div className="text-sm text-blue-600 mt-1">
                  📍 {testimonial.location}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-6">
            Rejoignez une communauté de propriétaires satisfaits
          </p>
          <a 
            href="/offers"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors duration-300"
          >
            Découvrir nos services
          </a>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;