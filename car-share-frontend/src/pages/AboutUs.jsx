import React from "react";
import { motion } from "framer-motion";
import teamImage from "../assets/team.jpg"; // Replace with your team image
import missionImage from "../assets/mission.jpg"; // Replace with your mission image
import visionImage from "../assets/vision.jpg"; // Replace with your vision image
import { Link } from "react-router-dom";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
          About Us
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          Connecting drivers and passengers for smarter, greener, and more
          affordable intercity travel.
        </p>
      </motion.div>

      {/* Our Story Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
      >
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Our Story</h2>
          <p className="mt-4 text-gray-600">
            At <span className="text-blue-600 font-bold">CarShare</span> we believe that travel should be affordable,
            eco-friendly, and hassle-free. The idea for our platform came to life
            during a long road trip, when we realized how many empty seats were
            on the road—and how many people were struggling to find affordable
            intercity travel options. We wanted to create a solution that connects
            drivers and passengers, reduces travel costs, and promotes
            sustainability.
          </p>
        </div>
        <div className="rounded-lg overflow-hidden shadow-lg">
          <img
            src={teamImage}
            alt="Our Team"
            className="w-full h-auto object-cover"
          />
        </div>
      </motion.div>

      {/* Mission Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
      >
        <div className="rounded-lg overflow-hidden shadow-lg">
          <img
            src={missionImage}
            alt="Our Mission"
            className="w-full h-auto object-cover"
          />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
          <p className="mt-4 text-gray-600">
            Our mission is to make intercity travel affordable, sustainable, and
            enjoyable by connecting drivers and passengers who share the same
            destination. We’re committed to reducing traffic, lowering carbon
            emissions, and bringing people closer together.
          </p>
        </div>
      </motion.div>

      {/* Vision Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
      >
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Our Vision</h2>
          <p className="mt-4 text-gray-600">
            We envision a future where every car on the road is full, reducing
            traffic congestion and carbon emissions. By fostering a community of
            like-minded travelers, we aim to create a smarter, greener, and more
            connected world.
          </p>
        </div>
        <div className="rounded-lg overflow-hidden shadow-lg">
          <img
            src={visionImage}
            alt="Our Vision"
            className="w-full h-auto object-cover"
          />
        </div>
      </motion.div>

      {/* Team Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="mt-12 text-center"
      >
        <h2 className="text-3xl font-bold text-gray-900">Meet the Team</h2>
        <p className="mt-4 text-gray-600">
          We’re a team of passionate travelers, tech enthusiasts, and
          sustainability advocates dedicated to making intercity travel better
          for everyone.
        </p>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Team Member 1 */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <img
              src="https://media.licdn.com/dms/image/v2/D5603AQFdXaKUfrpBfg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1722154761916?e=1747872000&v=beta&t=DQvPzqueh9Fu--5Ez4xYc9OZiuYSaE9YbFyuZ4ECCBg"
              alt="Team Member 1"
              className="w-24 h-24 rounded-full mx-auto border-2 border-gray-300"
            />
            <h3 className="mt-4 text-xl font-bold text-gray-900">Prashant Rathour</h3>
            <p className="mt-2 text-gray-600">Co-Founder & CEO</p>
          </div>
          {/* Team Member 2 */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <img
              src="https://media.licdn.com/dms/image/v2/D5603AQFdXaKUfrpBfg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1722154761916?e=1747872000&v=beta&t=DQvPzqueh9Fu--5Ez4xYc9OZiuYSaE9YbFyuZ4ECCBg"
              alt="Team Member 2"
              className="w-24 h-24 rounded-full mx-auto"
            />
            <h3 className="mt-4 text-xl font-bold text-gray-900">Prashant</h3>
            <p className="mt-2 text-gray-600">Co-Founder & CTO</p>
          </div>
          {/* Add more team members as needed */}
        </div>
      </motion.div>

      {/* Call-to-Action Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="mt-12 text-center"
      >
        <h2 className="text-3xl font-bold text-gray-900">Join Us Today</h2>
        <p className="mt-4 text-gray-600">
          Ready to start your journey? Sign up today and experience the future of
          intercity travel.
        </p>
        <div className="flex justify-center">
        <Link to="/register" className="mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300">
          Get Started
        </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default AboutUs;