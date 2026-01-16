import React from "react";
import { motion } from "framer-motion";
import { Search, BarChart2, Rocket } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: <Search size={32} />,
      number: "01",
      title: "Search & Discover",
      description:
        "Enter your target location and browse all available billboards on our interactive map.",
    },
    {
      icon: <BarChart2 size={32} />,
      number: "02",
      title: "Compare & Choose",
      description:
        "View detailed analytics, compare prices, and select the perfect spots for your brand.",
    },
    {
      icon: <Rocket size={32} />,
      number: "03",
      title: "Book & Launch",
      description:
        "Upload your artwork, pay securely online, and watch your campaign go live instantly.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-24 md:py-32 bg-white relative overflow-hidden"
    >
      <div className="section-container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16 md:mb-20"
        >
          <span className="inline-block text-accent font-semibold text-sm tracking-widest uppercase mb-4">
            How It Works
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-primary mb-6">
            Three simple steps
          </h2>
          <p className="text-lg md:text-xl text-text-secondary max-w-xl mx-auto">
            Launch your outdoor campaign in minutes, not weeks.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting Line - Desktop */}
          <div className="hidden md:block absolute top-16 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative text-center group"
              >
                {/* Icon Container */}
                <div className="relative inline-flex mb-8">
                  {/* Background Circle */}
                  <div className="w-32 h-32 rounded-full bg-gradient-to-b from-gray-50 to-white border border-gray-100 flex items-center justify-center shadow-soft group-hover:shadow-elevated transition-all duration-500">
                    <div className="w-20 h-20 rounded-full bg-white border-2 border-accent flex items-center justify-center text-primary shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {step.icon}
                    </div>
                  </div>

                  {/* Step Number */}
                  <span className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-accent text-primary text-sm font-bold flex items-center justify-center shadow-lg">
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-xl md:text-2xl font-bold text-primary mb-3">
                  {step.title}
                </h3>
                <p className="text-text-secondary leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
