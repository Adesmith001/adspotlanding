import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-primary">
      {/* Subtle Background Gradient */}
      <div className="absolute inset-0 bg-gradient-radial opacity-60"></div>

      {/* Ambient Light Effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-3xl"></div>

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                     linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      ></div>

      <div className="section-container relative z-10 pt-32 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Text Content - Left Side */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/30 bg-accent/5 mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
              <span className="text-accent text-sm font-medium tracking-wide">
                Now in Early Access
              </span>
            </motion.div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6">
              Reinventing
              <br />
              <span className="gradient-text">Outdoor Advertising</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
              Discover, compare, and book billboards near you instantly. One
              platform. Complete transparency. No hidden fees.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary text-base"
              >
                Join the Waitlist
                <ArrowRight size={18} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-secondary text-base"
              >
                <Play size={18} className="fill-current" />
                Watch Demo
              </motion.button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-6 justify-center lg:justify-start text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-accent"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Free early access</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-accent"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>500+ on waitlist</span>
              </div>
            </div>
          </motion.div>

          {/* Visual Content - Right Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="relative hidden lg:block"
          >
            {/* Main Dashboard Preview */}
            <div className="relative">
              {/* Glow Effect Behind */}
              <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-3xl transform scale-90"></div>

              {/* Dashboard Image */}
              <div className="relative glass-card p-2 rounded-2xl overflow-hidden animate-glow">
                <img
                  src="/assets/hero_dashboard_1763516844515.png"
                  alt="Adspot Dashboard"
                  className="w-full rounded-xl"
                />
              </div>

              {/* Floating Map Card */}
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 5,
                  ease: "easeInOut",
                }}
                className="absolute -top-6 -right-6 w-44 glass-card p-2 rounded-xl shadow-2xl"
              >
                <img
                  src="/assets/hero_map_1763516835466.png"
                  alt="Map View"
                  className="w-full rounded-lg"
                />
              </motion.div>

              {/* Status Card */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute -bottom-4 -left-4 glass-card p-4 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="text-white text-sm font-semibold">
                      12 Spots Available
                    </p>
                    <p className="text-gray-400 text-xs">Lagos Island</p>
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
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2"
        >
          <div className="w-1.5 h-3 bg-accent rounded-full"></div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
