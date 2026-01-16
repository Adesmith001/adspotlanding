import React from "react";
import { motion } from "framer-motion";
import { Map, CreditCard, Calendar, BarChart3, Check } from "lucide-react";

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
      className="py-24 md:py-32 bg-primary relative overflow-hidden"
    >
      {/* Background Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-accent/5 rounded-full blur-3xl"></div>

      <div className="section-container relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16 md:mb-24"
        >
          <span className="inline-block text-accent font-semibold text-sm tracking-widest uppercase mb-4">
            The Solution
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 text-balance">
            Everything you need to launch
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Adspot gives you the power to plan, book, and manage outdoor
            campaigns like a pro.
          </p>
        </motion.div>

        {/* Feature Sections */}
        <div className="space-y-24 md:space-y-32">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true, margin: "-100px" }}
              className={`flex flex-col ${
                index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              } items-center gap-12 lg:gap-20`}
            >
              {/* Content Side */}
              <div className="flex-1 text-center lg:text-left">
                {/* Icon */}
                <div className="inline-flex w-14 h-14 bg-accent rounded-xl items-center justify-center text-primary mb-6 shadow-lg shadow-accent/20">
                  {feature.icon}
                </div>

                {/* Title & Description */}
                <h3 className="text-2xl md:text-4xl font-bold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-lg leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
                  {feature.description}
                </p>

                {/* Highlights List */}
                <ul className="space-y-3">
                  {feature.highlights.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 justify-center lg:justify-start"
                    >
                      <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                        <Check size={12} className="text-accent" />
                      </div>
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Image Side */}
              <div className="flex-1 relative">
                {/* Glow Effect */}
                <div
                  className={`absolute inset-0 bg-accent/10 blur-3xl rounded-full transform ${
                    index % 2 === 0 ? "translate-x-10" : "-translate-x-10"
                  }`}
                ></div>

                {/* Image Container */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                  className="relative glass-card p-3 rounded-2xl overflow-hidden"
                >
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full rounded-xl"
                    loading="lazy"
                  />
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
