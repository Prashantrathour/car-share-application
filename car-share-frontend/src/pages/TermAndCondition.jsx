import { useState } from 'react';
import { motion } from 'framer-motion';

const termsData = [
  {
    title: 'Introduction',
    content: `Welcome to our car-sharing platform. By accessing and using this platform, you agree to be bound by the following terms and conditions.`,
  },
  {
    title: 'User Responsibilities',
    content: `As a user, you are responsible for providing accurate information, respecting other users, and adhering to our guidelines.`,
  },
  {
    title: 'Payment and Fees',
    content: `All payments must be processed through our platform. We charge a small service fee for each successful booking.`,
  },
  {
    title: 'Cancellations and Refunds',
    content: `Cancellations must be made at least 24 hours before the trip. Refunds are processed within 3-5 business days.`,
  },
  {
    title: 'Liability and Disputes',
    content: `We are not liable for any disputes or damages between users. However, we will provide assistance to resolve conflicts.`,
  },
  {
    title: 'Privacy Policy',
    content: `We respect your privacy and protect your personal data according to our privacy policy.`,
  },
];

const TermsAndConditions = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const handleToggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">Terms and Conditions</h1>
      <div className="space-y-4">
        {termsData.map((term, index) => (
          <div key={index} className="border border-gray-300 rounded-lg overflow-hidden">
            {/* Header */}
            <button
              onClick={() => handleToggle(index)}
              className="w-full flex justify-between items-center bg-gray-100 px-4 py-3 hover:bg-gray-200 transition-colors"
            >
              <span className="text-lg font-medium">{term.title}</span>
              <span className="text-gray-600">
                {activeIndex === index ? '−' : '+'}
              </span>
            </button>

            {/* Content */}
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{
                height: activeIndex === index ? 'auto' : 0,
                opacity: activeIndex === index ? 1 : 0,
              }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-4 py-3 bg-white text-gray-700">
                {term.content}
              </div>
            </motion.div>
          </div>
        ))}
      </div>

      {/* Accept Button */}
      <div className="mt-8 flex justify-center">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-all shadow-lg"
          onClick={() => alert('You have accepted the terms and conditions')}
        >
          Accept Terms
        </button>
      </div>
    </div>
  );
};

export default TermsAndConditions;
