import React from 'react';
import { motion } from 'framer-motion';
import {ReactComponent as CarIcon} from '../assets/Car.svg';
import { 
  UserPlusIcon, 
//   CarIcon, 
  ChatBubbleLeftRightIcon, 
  ClipboardDocumentCheckIcon,
  MapPinIcon,
  CalendarIcon,
  ShieldCheckIcon,
  ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline';

const HowItWorks = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const features = [
    {
      title: "Book a Trip",
      description: "Browse available trips, select your preferred route, and book instantly. Our platform makes it easy to find rides that match your schedule.",
      icon: MapPinIcon,
      steps: [
        "Search for trips by destination",
        "View trip details and driver information",
        "Select your preferred seat",
        "Complete the booking process"
      ]
    },
    {
      title: "Register as a Driver",
      description: "Join our community of trusted drivers. Share your journey and earn while you travel.",
      icon: UserPlusIcon,
      steps: [
        "Create your driver account",
        "Complete your profile",
        "Submit required documentation",
        "Get verified and start driving"
      ]
    },
    {
      title: "Create a Trip",
      description: "Plan your journey and share it with others. Set your route, schedule, and pricing.",
      icon: CalendarIcon,
      steps: [
        "Set your route and schedule",
        "Choose your vehicle",
        "Set pricing and seat availability",
        "Publish your trip"
      ]
    },
    {
      title: "Vehicle Authentication",
      description: "Our thorough verification process ensures safety and reliability for all users.",
      icon:CarIcon,
      steps: [
        "Submit vehicle documentation",
        "Provide insurance details",
        "Vehicle inspection verification",
        "Get approved to drive"
      ]
    },
    {
      title: "Real-time Chat",
      description: "Stay connected with your driver or passengers through our built-in messaging system.",
      icon: ChatBubbleLeftRightIcon,
      steps: [
        "Access chat from trip details",
        "Send messages and updates",
        "Share location if needed",
        "Get instant responses"
      ]
    },
    {
      title: "Verification Process",
      description: "We ensure the highest standards of safety and trust through our verification system.",
      icon: ShieldCheckIcon,
      steps: [
        "Identity verification",
        "Document validation",
        "Background checks",
        "Regular compliance updates"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.h1 
            className="text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            How CarShare Works
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Learn everything you need to know about using CarShare, from booking trips to becoming a driver.
          </motion.p>
        </div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              variants={itemVariants}
            >
              <div className="flex items-center mb-4">
                <feature.icon className="h-8 w-8 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
              </div>
              <p className="text-gray-600 mb-4">{feature.description}</p>
              <ul className="space-y-2">
                {feature.steps.map((step, stepIndex) => (
                  <motion.li
                    key={stepIndex}
                    className="flex items-center text-gray-700"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: stepIndex * 0.1 }}
                  >
                    <ClipboardDocumentCheckIcon className="h-5 w-5 text-green-500 mr-2" />
                    {step}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Chat Feature Highlight */}
        <motion.div
          className="mt-16 bg-blue-50 rounded-lg p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Real-time Communication</h3>
              <p className="text-gray-600 mb-4">
                Stay connected with your driver or passengers through our built-in chat system. Share updates, 
                ask questions, and ensure a smooth journey for everyone.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-blue-600 mr-2" />
                  Instant messaging with drivers and passengers
                </li>
                <li className="flex items-center">
                  <ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-blue-600 mr-2" />
                  Share location updates in real-time
                </li>
                <li className="flex items-center">
                  <ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-blue-600 mr-2" />
                  Quick response to any questions or concerns
                </li>
              </ul>
            </div>
            <motion.div
              className="hidden lg:block"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <ChatBubbleLeftRightIcon className="h-24 w-24 text-blue-600" />
            </motion.div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h3>
          <p className="text-gray-600 mb-6">
            Join our community of drivers and passengers today. Experience the future of car sharing.
          </p>
          <motion.div
            className="space-x-4"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <a
              href="/register"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Register Now
            </a>
            <a
              href="/trips"
              className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors"
            >
              Find Trips
            </a>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HowItWorks; 