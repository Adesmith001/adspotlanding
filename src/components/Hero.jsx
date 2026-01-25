import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play, CheckCircle2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
      {/* Elegant Background */}
      <div className="absolute inset-0">
        {/* Primary gradient orb */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-amber-500/20 via-orange-500/10 to-transparent rounded-full blur-3xl"></div>

        {/* Secondary accent */}
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[400px] bg-gradient-to-t from-purple-500/10 to-transparent rounded-full blur-3xl"></div>

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
          }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 pt-32 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-center lg:text-left"
          >
            {/* Premium Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 mb-8"
            >
              <Sparkles size={14} className="text-amber-400" />
              <span className="text-amber-400/90 text-sm font-medium tracking-wide">
                Nigeria's #1 Billboard Marketplace
              </span>
            </motion.div>

            {/* Main Headline - Steve Jobs Style */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold text-white leading-[0.95] tracking-tight mb-8">
              Outdoor
              <br />
              advertising,
              <br />
              <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                reimagined.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-gray-400 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed font-light">
              Discover premium billboards. Book instantly.
              <span className="text-gray-300">
                {" "}
                No agencies. No hidden fees.
              </span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group w-full sm:w-auto"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-500"></div>
                  <div className="relative flex items-center justify-center gap-3 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-2xl shadow-orange-500/25">
                    Get Started Free
                    <ArrowRight
                      size={20}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </motion.button>
              </Link>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-medium text-lg border border-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Play size={16} className="fill-current ml-0.5" />
                </div>
                Watch Demo
              </motion.button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 justify-center lg:justify-start text-sm">
              {[
                "Free to get started",
                "500+ billboards listed",
                "Instant booking",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-500">
                  <CheckCircle2 size={16} className="text-green-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Visual Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 1.2,
              delay: 0.4,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="relative hidden lg:block"
          >
            {/* Main Dashboard Preview */}
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/30 to-orange-500/20 blur-3xl rounded-3xl transform scale-90"></div>

              {/* Dashboard Image */}
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 p-1.5 rounded-3xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden">
                <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden">
                  <img
                    src="/assets/hero_dashboard_1763516844515.png"
                    alt="Adspot Dashboard"
                    className="w-full rounded-2xl"
                  />
                </div>
              </div>

              {/* Floating Map Card */}
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 6,
                  ease: "easeInOut",
                }}
                className="absolute -top-8 -right-8 w-48"
              >
                <div className="bg-gradient-to-br from-white/10 to-white/5 p-1 rounded-2xl border border-white/10 shadow-2xl shadow-black/50 backdrop-blur-xl">
                  <img
                    src="/assets/hero_map_1763516835466.png"
                    alt="Map View"
                    className="w-full rounded-xl"
                  />
                </div>
              </motion.div>

              {/* Status Card */}
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 5,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute -bottom-6 -left-6"
              >
                <div className="bg-gradient-to-br from-white/10 to-white/5 p-4 rounded-2xl border border-white/10 shadow-2xl shadow-black/50 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">
                        12 Premium Spots
                      </p>
                      <p className="text-gray-400 text-xs">
                        Available in Lagos
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="w-7 h-12 border-2 border-white/20 rounded-full flex justify-center pt-2"
        >
          <div className="w-1.5 h-3 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full"></div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
