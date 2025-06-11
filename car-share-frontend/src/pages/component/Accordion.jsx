import { useState } from 'react';
import { motion } from 'framer-motion';

const Accordion = ({ title, content }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center bg-gray-100 px-4 py-3 hover:bg-gray-200 transition-colors"
      >
        <span className="text-lg font-medium">{title}</span>
        <span className="text-gray-600">
          {isOpen ? '−' : '+'}
        </span>
      </button>

      {/* Content */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="px-4 py-3 bg-white text-gray-700">{content}</div>
      </motion.div>
    </div>
  );
};

export default Accordion;
