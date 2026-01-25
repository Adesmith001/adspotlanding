import React from "react";
import { motion } from "framer-motion";
import {
  Map,
  CreditCard,
  Calendar,
  BarChart3,
  Check,
  Sparkles,
} from "lucide-react";

const Solution = () => {
  const features = [
    {
      icon: <Map size={24} />,
      title: "Interactive Map Discovery",
      description:
        "Visualize every available billboard on an interactive map. Filter by location, size, type, and audience demographics.",
      highlights: [
        "Real-time availability",
        "Traffic analytics",
        "Street view preview",
      ],
      image: "/assets/feature_phone_1763516869197.png",
    },
    {
      icon: <CreditCard size={24} />,
      title: "Transparent Pricing",
      description:
        "Compare prices instantly across different vendors. What you see is what you pay—no hidden fees or negotiations.",
      highlights: ["Market-rate pricing", "No hidden fees", "Instant quotes"],
      image: "/assets/feature_pricing_1763516879658.png",
    },
    {
      icon: <Calendar size={24} />,
      title: "Real-Time Booking",
      description:
        "See exactly when a billboard is available and book it instantly. No more endless back-and-forth emails.",
      highlights: [
        "Live calendar sync",
        "Instant confirmation",
        "Flexible scheduling",
      ],
      image: "/assets/feature_booking_1763516889068.png",
    },
    {
      icon: <BarChart3 size={24} />,
      title: "Campaign Analytics",
      description:
        "Track your campaign performance with detailed analytics. Manage renewals and creatives from one dashboard.",
      highlights: [
        "ROI tracking",
        "Performance metrics",
        "Creative management",
      ],
      image: "/assets/feature_analytics_1763516900561.png",
    },
  ];

  return (
    <section
      id="features"
      className="py-28 md:py-36 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] relative overflow-hidden"
    >
      {/* Background Gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[800px] bg-gradient-to-br from-amber-500/5 via-transparent to-purple-500/5 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20 lg:mb-28"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 mb-6"
          >
            <Sparkles size={14} className="text-amber-400" />
            <span className="text-amber-400/90 text-sm font-medium">
              The Solution
            </span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            One platform.
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Complete control.
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
            Adspot gives you everything you need to plan, book, and manage
            outdoor campaigns like a pro.
          </p>
        </motion.div>

        {/* Feature Sections */}
        <div className="space-y-32 lg:space-y-48">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-100px" }}
              className={`flex flex-col ${
                index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              } items-center gap-12 lg:gap-20`}
            >
              {/* Content Side */}
              <div className="flex-1 text-center lg:text-left">
                {/* Icon */}
                <div className="inline-flex w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl items-center justify-center text-white mb-8 shadow-lg shadow-orange-500/25">
                  {feature.icon}
                </div>

                {/* Title & Description */}
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-lg text-gray-400 leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0 font-light">
                  {feature.description}
                </p>

                {/* Highlights List */}
                <ul className="space-y-4">
                  {feature.highlights.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-4 justify-center lg:justify-start"
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                        <Check size={14} className="text-white" />
                      </div>
                      <span className="text-gray-300 text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Image Side */}
              <div className="flex-1 relative w-full">
                {/* Glow Effect */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/10 blur-3xl rounded-full transform ${
                    index % 2 === 0 ? "translate-x-10" : "-translate-x-10"
                  }`}
                ></div>

                {/* Image Container */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  <div className="bg-gradient-to-br from-white/10 to-white/5 p-1.5 rounded-3xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden">
                    <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden">
                      <img
                        src={feature.image}
                        alt={feature.title}
                        className="w-full rounded-2xl"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Solution;
