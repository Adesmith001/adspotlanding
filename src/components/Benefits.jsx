import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, ShieldCheck, Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Benefits = () => {
  const advertiserBenefits = [
    {
      icon: <TrendingUp size={18} />,
      text: "Maximize your ROI with targeted placements",
    },
    { icon: <Zap size={18} />, text: "Launch campaigns in minutes, not weeks" },
    {
      icon: <ShieldCheck size={18} />,
      text: "100% verified locations and traffic data",
    },
  ];

  const ownerBenefits = [
    {
      icon: <Users size={18} />,
      text: "Connect with thousands of potential advertisers",
    },
    { icon: <Zap size={18} />, text: "Automate bookings and payments" },
    {
      icon: <ShieldCheck size={18} />,
      text: "Guaranteed payments and transparent reporting",
    },
  ];

  return (
    <section
      id="benefits"
      className="py-28 md:py-36 bg-[#fafafa] relative overflow-hidden"
    >
      {/* Subtle Pattern */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.02) 1px, transparent 0)",
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
          className="text-center mb-16"
        >
          <span className="inline-block text-amber-600 font-semibold text-sm tracking-widest uppercase mb-4">
            Who It's For
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Built for everyone in
            <br />
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              outdoor media.
            </span>
          </h2>
        </motion.div>

        {/* Benefit Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* For Advertisers */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="group relative"
          >
            <div className="h-full rounded-3xl overflow-hidden bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 p-px">
              <div className="h-full bg-white rounded-[23px] overflow-hidden">
                {/* Image Header */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src="/assets/lifestyle_brand_1763516941658.png"
                    alt="For Advertisers"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium mb-3">
                      For Advertisers
                    </span>
                    <h3 className="text-2xl md:text-3xl font-bold text-white">
                      Your brand deserves
                      <br />
                      to be seen.
                    </h3>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <p className="text-gray-500 text-lg mb-8 leading-relaxed font-light">
                    Skip the middlemen. Find and book billboards directly from
                    owners. Get transparent pricing, real-time availability, and
                    instant confirmation.
                  </p>
                  <ul className="space-y-4 mb-8">
                    {advertiserBenefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-4">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white flex-shrink-0">
                          {benefit.icon}
                        </div>
                        <span className="text-gray-700 pt-1.5">
                          {benefit.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-orange-500 font-semibold hover:gap-3 transition-all"
                  >
                    Start advertising <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* For Media Owners */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            viewport={{ once: true }}
            className="group relative"
          >
            <div className="h-full rounded-3xl overflow-hidden bg-[#0a0a0a]">
              {/* Image Header */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src="/assets/lifestyle_drone_1763516949532.png"
                  alt="For Media Owners"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white text-xs font-medium mb-3">
                    For Media Owners
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold text-white">
                    Maximize your
                    <br />
                    inventory.
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <p className="text-gray-400 text-lg mb-8 leading-relaxed font-light">
                  List your billboards for free. Reach thousands of advertisers
                  actively looking for ad space. Get paid faster with our secure
                  payment system.
                </p>
                <ul className="space-y-4 mb-8">
                  {ownerBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
                        {benefit.icon}
                      </div>
                      <span className="text-gray-300 pt-1.5">
                        {benefit.text}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-amber-400 font-semibold hover:gap-3 transition-all"
                >
                  List your billboard <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
