import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Waitlist = () => {
  const stats = [
    { value: "500+", label: "Active Users" },
    { value: "50+", label: "Partner Agencies" },
    { value: "1,000+", label: "Billboards Listed" },
  ];

  return (
    <section className="relative py-28 md:py-36 overflow-hidden bg-[#0a0a0a]">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[900px] bg-gradient-to-br from-amber-500/10 via-transparent to-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 border border-white/5 rounded-full"></div>
      <div className="absolute bottom-20 right-20 w-48 h-48 border border-white/5 rounded-full"></div>
      <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-amber-400 rounded-full"></div>
      <div className="absolute bottom-1/3 left-1/4 w-2 h-2 bg-purple-400 rounded-full"></div>

      <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 mb-8"
          >
            <CheckCircle2 size={14} className="text-green-400" />
            <span className="text-green-400 text-sm font-medium">
              Now Available
            </span>
          </motion.div>

          {/* Headline */}
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-[1.1] tracking-tight">
            Ready to transform
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              your advertising?
            </span>
          </h2>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Join thousands of advertisers and billboard owners already
            revolutionizing outdoor media in Nigeria.
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="relative group w-full sm:w-auto"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-500"></div>
                <div className="relative flex items-center justify-center gap-3 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white px-10 py-5 rounded-2xl font-semibold text-lg shadow-2xl shadow-orange-500/25">
                  Get Started Now
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </div>
              </motion.button>
            </Link>
          </div>

          {/* Trust Text */}
          <p className="text-sm text-gray-500 mb-20">
            Free to get started • No credit card required • Setup in 2 minutes
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-12 md:gap-20">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 uppercase tracking-wider">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Waitlist;
