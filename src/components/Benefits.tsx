import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, ShieldCheck, Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Benefits: React.FC = () => {
  const advertiserBenefits = [
    {
      icon: <TrendingUp size={18} />,
      text: "Maximize ROI with targeted placements",
    },
    { icon: <Zap size={18} />, text: "Launch campaigns in minutes" },
    {
      icon: <ShieldCheck size={18} />,
      text: "Verified locations and traffic data",
    },
  ];

  const ownerBenefits = [
    {
      icon: <Users size={18} />,
      text: "Reach thousands of active advertisers",
    },
    { icon: <Zap size={18} />, text: "Automate bookings and payments" },
    {
      icon: <ShieldCheck size={18} />,
      text: "Guaranteed payouts with clear reporting",
    },
  ];

  return (
    <section id="benefits" className="py-24 md:py-28 bg-[#f7f7f7]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-gray-400">
            Who it&apos;s for
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 mt-4">
            Built for everyone in outdoor media.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-black/5 bg-white shadow-sm overflow-hidden"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src="/assets/lifestyle_brand_1763516941658.png"
                alt="For Advertisers"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-white/80 text-gray-900">
                  For advertisers
                </span>
                <h3 className="text-2xl font-semibold text-white mt-3">
                  Your brand deserves to be seen.
                </h3>
              </div>
            </div>
            <div className="p-7">
              <p className="text-gray-600 mb-6">
                Skip the middlemen and book directly with owners. Transparent
                pricing, real-time availability, and instant confirmation.
              </p>
              <ul className="space-y-3 mb-6">
                {advertiserBenefits.map((benefit) => (
                  <li key={benefit.text} className="flex items-start gap-3">
                    <span className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center">
                      {benefit.icon}
                    </span>
                    <span className="text-gray-700 pt-1">{benefit.text}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-gray-900 font-semibold hover:gap-3 transition-all"
              >
                Start advertising <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-black/5 bg-white shadow-sm overflow-hidden"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src="/assets/lifestyle_drone_1763516949532.png"
                alt="For Media Owners"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-white/80 text-gray-900">
                  For media owners
                </span>
                <h3 className="text-2xl font-semibold text-white mt-3">
                  Maximize your inventory.
                </h3>
              </div>
            </div>
            <div className="p-7">
              <p className="text-gray-600 mb-6">
                List your billboards for free, reach active buyers, and get paid
                faster with secure checkout.
              </p>
              <ul className="space-y-3 mb-6">
                {ownerBenefits.map((benefit) => (
                  <li key={benefit.text} className="flex items-start gap-3">
                    <span className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center">
                      {benefit.icon}
                    </span>
                    <span className="text-gray-700 pt-1">{benefit.text}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-gray-900 font-semibold hover:gap-3 transition-all"
              >
                List your billboard <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
