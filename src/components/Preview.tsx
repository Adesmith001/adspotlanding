import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Filter, FileText, TrendingUp } from "lucide-react";

const Preview: React.FC = () => {
  const features = [
    {
      icon: <Filter size={18} />,
      title: "Smart filtering",
      description:
        "Filter by traffic, demographics, and price to find the perfect spot.",
    },
    {
      icon: <FileText size={18} />,
      title: "Instant proposals",
      description:
        "Generate professional PDF proposals for clients in seconds.",
    },
    {
      icon: <TrendingUp size={18} />,
      title: "ROI tracking",
      description:
        "Measure campaign impact with real-time analytics dashboards.",
    },
  ];

  return (
    <section className="py-24 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 border border-black/10 mb-6">
            <Sparkles size={14} className="text-gray-700" />
            <span className="text-gray-700 text-sm font-medium">
              Sneak peek
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 mb-4">
            Beautifully designed.
            <br />
            Powerfully simple.
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            An intuitive experience built for fast, confident decisions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl border border-black/5 bg-[#fafafa]"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-white rounded-3xl border border-black/5 shadow-lg p-3">
              <img
                src="/assets/hero_dashboard_1763516844515.png"
                alt="Dashboard Preview"
                className="w-full rounded-2xl"
                loading="lazy"
              />
            </div>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="absolute -bottom-8 -right-4 w-1/3"
            >
              <div className="bg-white rounded-2xl border border-black/5 shadow-lg p-2">
                <img
                  src="/assets/feature_phone_1763516869197.png"
                  alt="Mobile App"
                  className="w-full rounded-xl"
                  loading="lazy"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Preview;
