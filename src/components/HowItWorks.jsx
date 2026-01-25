import React from "react";
import { motion } from "framer-motion";
import { Search, BarChart2, Rocket, ArrowRight } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: <Search size={28} />,
      number: "01",
      title: "Discover",
      description:
        "Browse our curated collection of premium billboards on an interactive map. Filter by location, size, and audience.",
    },
    {
      icon: <BarChart2 size={28} />,
      number: "02",
      title: "Compare",
      description:
        "View detailed analytics, traffic data, and transparent pricing. Make informed decisions with real metrics.",
    },
    {
      icon: <Rocket size={28} />,
      number: "03",
      title: "Launch",
      description:
        "Book instantly, upload your creative, and go live. Your campaign launches in minutes, not weeks.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-28 md:py-36 bg-[#fafafa] relative overflow-hidden"
    >
      {/* Subtle pattern */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      ></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="inline-block text-amber-600 font-semibold text-sm tracking-widest uppercase mb-4">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Three simple steps.
          </h2>
          <p className="text-xl text-gray-500 max-w-xl mx-auto font-light">
            From discovery to launch in minutes, not weeks.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting Line - Desktop */}
          <div className="hidden lg:block absolute top-24 left-[15%] right-[15%] h-px">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative text-center group"
              >
                {/* Icon Container */}
                <div className="relative inline-flex mb-10">
                  {/* Background Circle */}
                  <div className="w-36 h-36 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-lg group-hover:shadow-2xl group-hover:border-amber-200 transition-all duration-500">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform duration-500">
                      {step.icon}
                    </div>
                  </div>

                  {/* Step Number */}
                  <span className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-gray-900 text-white text-sm font-bold flex items-center justify-center shadow-lg">
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-500 leading-relaxed max-w-xs mx-auto font-light">
                  {step.description}
                </p>

                {/* Arrow for mobile */}
                {index < steps.length - 1 && (
                  <div className="md:hidden flex justify-center my-8">
                    <ArrowRight size={24} className="text-gray-300 rotate-90" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
