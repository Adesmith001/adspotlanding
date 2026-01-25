import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Filter, FileText, TrendingUp } from "lucide-react";

const Preview = () => {
  const features = [
    {
      icon: <Filter size={20} />,
      title: "Smart Filtering",
      description:
        "Filter by traffic, demographics, and price to find the perfect spot.",
    },
    {
      icon: <FileText size={20} />,
      title: "Instant Proposals",
      description:
        "Generate professional PDF proposals for your clients in seconds.",
    },
    {
      icon: <TrendingUp size={20} />,
      title: "ROI Tracking",
      description:
        "Measure the impact of your campaigns with advanced analytics.",
    },
  ];

  return (
    <section className="py-28 md:py-36 bg-[#0a0a0a] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[800px] bg-gradient-to-br from-purple-500/10 via-transparent to-amber-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
            <Sparkles size={14} className="text-purple-400" />
            <span className="text-purple-400 text-sm font-medium">
              Sneak Peek
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            Beautifully designed.
            <br />
            <span className="text-gray-500">Powerfully simple.</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
            Experience the most intuitive billboard booking platform ever built.
          </p>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-5"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group p-6 bg-gradient-to-br from-white/[0.08] to-white/[0.02] rounded-2xl border border-white/10 hover:border-purple-500/30 transition-all duration-500 cursor-pointer"
              >
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300 flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed font-light">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-amber-500/20 blur-3xl rounded-3xl"></div>

            {/* Main Image */}
            <div className="relative">
              <div className="bg-gradient-to-br from-white/10 to-white/5 p-1.5 rounded-3xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden">
                <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden">
                  <img
                    src="/assets/hero_dashboard_1763516844515.png"
                    alt="Dashboard Preview"
                    className="w-full rounded-2xl"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Floating Phone */}
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 5,
                  ease: "easeInOut",
                }}
                className="absolute -bottom-10 -right-6 w-1/3"
              >
                <div className="bg-gradient-to-br from-white/10 to-white/5 p-1 rounded-2xl border border-white/10 shadow-2xl shadow-black/50 backdrop-blur-xl">
                  <img
                    src="/assets/feature_phone_1763516869197.png"
                    alt="Mobile App"
                    className="w-full rounded-xl"
                    loading="lazy"
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Preview;
