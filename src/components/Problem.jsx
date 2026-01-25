import React from "react";
import { motion } from "framer-motion";
import { Clock, DollarSign, MapPin, AlertCircle } from "lucide-react";

const Problem = () => {
  const problems = [
    {
      icon: <Clock size={24} />,
      title: "Endless Searching",
      description:
        "Days wasted calling multiple agencies, driving around locations, just to find available billboard spots.",
      stat: "72 hours",
      statLabel: "avg. time to book",
    },
    {
      icon: <DollarSign size={24} />,
      title: "No Transparency",
      description:
        "What you're quoted depends on who you know. Same billboard, wildly different prices.",
      stat: "40%",
      statLabel: "price variance",
    },
    {
      icon: <MapPin size={24} />,
      title: "Blind Decisions",
      description:
        "Booking locations without reliable traffic data, visibility metrics, or verified photos.",
      stat: "0",
      statLabel: "performance data",
    },
  ];

  return (
    <section className="py-28 md:py-36 bg-[#0a0a0a] relative overflow-hidden">
      {/* Subtle gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-red-500/5 to-transparent rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-6"
          >
            <AlertCircle size={14} className="text-red-400" />
            <span className="text-red-400/90 text-sm font-medium">
              The Problem
            </span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            Billboard booking is
            <br />
            <span className="text-gray-500">broken.</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
            The outdoor advertising industry is fragmented, opaque, and
            frustrating. It's time for a better way.
          </p>
        </motion.div>

        {/* Problem Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className="relative h-full bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-8 lg:p-10 rounded-3xl border border-white/10 hover:border-red-500/30 transition-all duration-500">
                {/* Icon */}
                <div className="w-14 h-14 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-500/20 transition-colors duration-300">
                  {problem.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-3">
                  {problem.title}
                </h3>
                <p className="text-gray-400 leading-relaxed mb-8">
                  {problem.description}
                </p>

                {/* Stat */}
                <div className="pt-6 border-t border-white/10">
                  <div className="text-3xl font-bold text-red-400 mb-1">
                    {problem.stat}
                  </div>
                  <div className="text-sm text-gray-500">
                    {problem.statLabel}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Problem;
