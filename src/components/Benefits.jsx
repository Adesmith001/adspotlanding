import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, ShieldCheck, Zap, ArrowRight } from "lucide-react";

const Benefits = () => {
  const advertiserBenefits = [
    {
      icon: <TrendingUp size={20} />,
      text: "Maximize your ROI with targeted placements",
    },
    { icon: <Zap size={20} />, text: "Launch campaigns in minutes, not weeks" },
    {
      icon: <ShieldCheck size={20} />,
      text: "100% verified locations and traffic data",
    },
  ];

  const ownerBenefits = [
    {
      icon: <Users size={20} />,
      text: "Connect with thousands of potential advertisers",
    },
    { icon: <Zap size={20} />, text: "Automate bookings and payments" },
    {
      icon: <ShieldCheck size={20} />,
      text: "Guaranteed payments and transparent reporting",
    },
  ];

  return (
    <section
      id="benefits"
      className="py-24 md:py-32 bg-surface-dark relative overflow-hidden"
    >
      {/* Subtle Pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.02) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      ></div>

      <div className="section-container relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block text-accent font-semibold text-sm tracking-widest uppercase mb-4">
            Who It's For
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-primary mb-6">
            Built for everyone in outdoor media
          </h2>
        </motion.div>

        {/* Benefit Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* For Advertisers */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="group rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-soft hover:shadow-elevated transition-all duration-500"
          >
            {/* Image Header */}
            <div className="relative h-56 overflow-hidden">
              <img
                src="/assets/lifestyle_brand_1763516941658.png"
                alt="For Advertisers"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h3 className="text-2xl md:text-3xl font-bold text-white">
                  For Advertisers
                </h3>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <p className="text-text-secondary text-lg mb-8 leading-relaxed">
                Stop guessing and start performing. Get access to premium
                inventory and data-driven insights.
              </p>
              <ul className="space-y-4 mb-8">
                {advertiserBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
                      {benefit.icon}
                    </div>
                    <span className="text-text-primary pt-1">
                      {benefit.text}
                    </span>
                  </li>
                ))}
              </ul>
              <button className="inline-flex items-center gap-2 text-accent font-semibold hover:gap-3 transition-all">
                Learn more <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>

          {/* For Media Owners */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            viewport={{ once: true }}
            className="group rounded-3xl overflow-hidden bg-primary border border-gray-800 shadow-soft hover:shadow-elevated transition-all duration-500"
          >
            {/* Image Header */}
            <div className="relative h-56 overflow-hidden">
              <img
                src="/assets/lifestyle_drone_1763516949532.png"
                alt="For Media Owners"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h3 className="text-2xl md:text-3xl font-bold text-white">
                  For Media Owners
                </h3>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Fill your empty inventory and manage your billboard assets
                effortlessly from one platform.
              </p>
              <ul className="space-y-4 mb-8">
                {ownerBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent flex-shrink-0">
                      {benefit.icon}
                    </div>
                    <span className="text-gray-300 pt-1">{benefit.text}</span>
                  </li>
                ))}
              </ul>
              <button className="inline-flex items-center gap-2 text-accent font-semibold hover:gap-3 transition-all">
                Learn more <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
