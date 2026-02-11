import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const Waitlist: React.FC = () => {
  const stats = [
    { value: "500+", label: "Active users" },
    { value: "50+", label: "Partner agencies" },
    { value: "1,000+", label: "Billboards listed" },
  ];

  return (
    <section className="py-24 md:py-28 bg-[#f7f7f7]">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="rounded-3xl border border-black/5 bg-white p-10 md:p-14 shadow-lg text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 border border-black/10 mb-6">
            <CheckCircle2 size={14} className="text-gray-700" />
            <span className="text-gray-700 text-sm font-medium">
              Now available
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-gray-900 mb-4">
            Ready to transform your advertising?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of advertisers and billboard owners already
            simplifying outdoor media in Nigeria.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-3 bg-black text-white px-8 py-4 rounded-2xl font-semibold text-base"
              >
                Get started
                <ArrowRight size={18} />
              </motion.button>
            </Link>
          </div>

          <p className="text-sm text-gray-500 mb-10">
            Free to get started • No credit card required • Setup in 2 minutes
          </p>

          <div className="flex flex-wrap justify-center gap-10">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-semibold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Waitlist;
