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
    <section className="py-24 md:py-32 bg-primary relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      <div className="section-container relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/30 bg-accent/5 mb-6">
            <Sparkles size={16} className="text-accent" />
            <span className="text-accent text-sm font-medium">Coming Soon</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            A sneak peek inside
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Experience the most intuitive billboard booking platform ever built.
          </p>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-6 hover:border-accent/30 transition-all duration-300 group cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-primary transition-all duration-300">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-accent transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
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
            transition={{ duration: 0.7, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Glow */}
            <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-3xl"></div>

            {/* Main Image */}
            <div className="relative">
              <div className="glass-card p-2 rounded-2xl overflow-hidden">
                <img
                  src="/assets/hero_dashboard_1763516844515.png"
                  alt="Dashboard Preview"
                  className="w-full rounded-xl"
                  loading="lazy"
                />
              </div>

              {/* Floating Phone */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: "easeInOut",
                }}
                className="absolute -bottom-8 -right-4 w-1/3 glass-card p-1 rounded-xl"
              >
                <img
                  src="/assets/feature_phone_1763516869197.png"
                  alt="Mobile App"
                  className="w-full rounded-lg"
                  loading="lazy"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Preview;
