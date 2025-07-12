"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const AboutUsPage = () => {
  const router = useRouter();
  const handleRedirect = () => {
    // Handle signup logic here
    router.push("/signin");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-transparent via-blue-50 to-blue-100 flex flex-col items-center sm:px-6 lg:px-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="w-full max-w-7xl text-center py-16 sm:py-20 md:py-28"
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-800 mb-4 md:mb-6 leading-tight">
          Welcome to <span className="text-blue-600">MyThriveBuddy.com</span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto">
          Where solopreneurs fuel their mindset, sharpen their tools, get seen, and grow with a tribe. 🌟
        </p>
      </motion.div>

      {/* Quick Highlights */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: { opacity: 0, y: 50 },
          visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.3 } },
        }}
        className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-24"
      >
        {[
          {
            title: "Mindset",
            desc: "Fuel your dreams with resilience, confidence, and joy.",
          },
          {
            title: "Tools",
            desc: "Turn small actions into unstoppable momentum.",
          },
          {
            title: "Visibility",
            desc: "Get seen, get celebrated, grow faster.",
          },
          {
            title: "Supportive Network",
            desc: "Rise higher with a community that’s got your back.",
          },
        ].map((item, idx) => (
          <motion.div
            key={idx}
            className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition hover:scale-105"
          >
            <h3 className="text-2xl font-semibold text-blue-700 mb-4">
              {item.title}
            </h3>
            <p className="text-gray-600">{item.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Our Story */}
      <motion.section
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        className="max-w-5xl text-center mb-20"
      >
        <h2 className="text-4xl font-bold text-gray-800 mb-6">Our Story</h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          At <span className="font-semibold text-blue-600">MyThriveBuddy</span>,
          we believe that thriving as a solopreneur isn’t about doing it all
          alone — it’s about having the right support at every step.
          <br />
          <br />
          Born from a passion for making growth joyful and sustainable, MTB was
          created to help dreamers, doers, and everyday heroes thrive with ease.
          We know that consistent, aligned action creates unstoppable momentum.
          🌟
          <br />
          <br />
          That is why MyThriveBuddy focuses on the four must-haves every
          solopreneur needs: a resilient <strong>Mindset</strong>, practical{" "}
          <strong>Tools</strong>, meaningful <strong>Visibility</strong>, and a{" "}
          <strong>Supportive Network</strong>.
          <br />
          <br />
          With these foundations in place, you do not just chase dreams — you{" "}
          <em>build</em> them, one small win at a time.
        </p>
      </motion.section>

      {/* Vision and Mission */}
      <motion.section
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        className="max-w-5xl text-center mb-20"
      >
        <h2 className="text-4xl font-bold text-gray-800 mb-6">
          Our Vision & Mission
        </h2>
        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
          We envision a world where success is not defined by hustle or
          isolation, but by sustainable growth, daily joy, and authentic
          connections.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left mt-10">
          <div className="p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition">
            <h3 className="text-2xl font-semibold text-blue-700 mb-4">
              Vision
            </h3>
            <p className="text-gray-600">
              To empower individuals to thrive authentically by strengthening
              their mindset, equipping them with tools, amplifying their
              visibility, and surrounding them with a supportive network.
            </p>
          </div>
          <div className="p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition">
            <h3 className="text-2xl font-semibold text-blue-700 mb-4">
              Mission
            </h3>
            <p className="text-gray-600">
              To make solopreneurship easier, more joyful, and more connected by
              celebrating progress, offering powerful tools, creating visibility
              opportunities, and nurturing community support.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Why Choose Us */}
      <motion.section
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        className="max-w-5xl text-center mb-20"
      >
        <h2 className="text-4xl font-bold text-gray-800 mb-6">
          Why Choose Us? 🚀
        </h2>
        <ul className="text-gray-600 text-lg space-y-4">
          <li>
            ✨ A beautifully designed, easy-to-use platform tailored for your
            real journey
          </li>
          <li>
            🌱 Growth powered by community, encouragement, and authentic support
            — not competition
          </li>
          <li>
            🔧 Practical tools and personalized reminders to help you stay
            aligned and make steady progress
          </li>
          <li>
            🌟 Opportunities to gain visibility, be seen, and celebrate your
            wins
          </li>
          <li>
            🧠 Mindset-focused features to help you thrive from the inside out
          </li>
        </ul>
      </motion.section>

      {/* Final CTA */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-bold text-blue-700 mb-4">
          Ready to Thrive?
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Let’s build your dreams — one small, powerful step at a time. 🌿
        </p>
        <button
          onClick={handleRedirect}
          className="bg-blue-600 text-white py-3 px-8 rounded-full text-lg font-semibold hover:bg-blue-700 transition"
        >
          <span>Join Us Now</span>
        </button>
      </motion.section>
    </div>
  );
};

export default AboutUsPage;
