import React from "react";
import { motion } from "framer-motion";
import { Clock, DollarSign, MapPin, XCircle } from "lucide-react";

const Problem = () => {
  const problems = [
    {
      icon: <Clock size={28} />,
      title: "Time-Consuming Search",
      description:
        "Hours wasted calling agencies and driving around trying to find available billboard spots.",
      color: "from-red-500/20 to-red-500/5",
    },
    {
      icon: <DollarSign size={28} />,
      title: "Hidden Pricing",
      description:
        "No price transparency. What you're quoted depends on who you know, not market rates.",
      color: "from-orange-500/20 to-orange-500/5",
    },
    {
      icon: <MapPin size={28} />,
      title: "Blind Booking",
      description:
        "Booking locations without reliable traffic data or verified visibility metrics.",
      color: "from-yellow-500/20 to-yellow-500/5",
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-surface-dark relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      <div className="section-container relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16 md:mb-20"
        >
          <span className="inline-block text-accent font-semibold text-sm tracking-widest uppercase mb-4">
            The Problem
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-primary mb-6 text-balance">
            Finding billboards shouldn't be this hard.
          </h2>
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto">
            The traditional outdoor advertising industry is fragmented, opaque,
            and frustrating.
          </p>
        </motion.div>

        {/* Problem Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-b ${problem.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              ></div>

              <div className="relative bg-white p-8 md:p-10 rounded-2xl border border-gray-100 shadow-soft hover:shadow-elevated transition-all duration-500 h-full">
                {/* Icon */}
                <div className="w-14 h-14 bg-red-50 text-red-500 rounded-xl flex items-center justify-center mb-6">
                  {problem.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-primary mb-3">
                  {problem.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {problem.description}
                </p>

                {/* Decorative X */}
                <XCircle className="absolute top-6 right-6 w-5 h-5 text-red-200 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Problem;
