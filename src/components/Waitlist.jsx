import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";

const Waitlist = () => {
  const stats = [
    { value: "500+", label: "Waitlist Members" },
    { value: "50+", label: "Partner Agencies" },
    { value: "1000+", label: "Billboards Listed" },
  ];

  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-primary">
      {/* Background with Subtle Gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-primary via-primary-light to-primary"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[800px] bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 border border-accent/10 rounded-full"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 border border-accent/10 rounded-full"></div>

      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/30 bg-accent/10 mb-8">
            <CheckCircle size={16} className="text-accent" />
            <span className="text-accent text-sm font-medium">
              Free Early Access
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Ready to reinvent your
            <br />
            <span className="gradient-text">outdoor advertising?</span>
          </h2>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-xl mx-auto">
            Join the first 500 early users and get exclusive discounts and
            priority access when we launch.
          </p>

          {/* Email Form */}
          <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mb-8">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-grow px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-accent focus:bg-white/10 transition-all duration-300"
              required
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="btn-primary whitespace-nowrap"
            >
              Join Waitlist
              <ArrowRight size={18} />
            </motion.button>
          </form>

          {/* Trust Text */}
          <p className="text-sm text-gray-500 mb-16">
            No spam. Unsubscribe anytime. We respect your privacy.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Waitlist;
