import React from "react";
import { motion } from "framer-motion";
import { Clock, DollarSign, MapPin } from "lucide-react";

const Problem: React.FC = () => {
  const problems: Array<{
    icon: React.ReactNode;
    title: string;
    description: string;
    stat: string;
    statLabel: string;
  }> = [
    {
      icon: <Clock size={22} />,
      title: "Slow discovery",
      description:
        "Teams still call multiple agencies and drive around to find availability.",
      stat: "72 hours",
      statLabel: "avg. time to book",
    },
    {
      icon: <DollarSign size={22} />,
      title: "Unclear pricing",
      description:
        "Rates vary widely with no standard pricing or transparent breakdowns.",
      stat: "40%",
      statLabel: "price variance",
    },
    {
      icon: <MapPin size={22} />,
      title: "Limited insight",
      description:
        "Most bookings happen without reliable traffic data or verified photos.",
      stat: "0",
      statLabel: "verified metrics",
    },
  ];

  return (
    <section className="py-24 md:py-28 bg-white" id="problem">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-gray-400">
            The problem
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 mt-4">
            Billboard booking is fragmented.
          </h2>
          <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
            Adspot replaces guesswork with real-time availability and trusted
            performance data.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="rounded-3xl border border-black/5 bg-[#fafafa] p-7 shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center mb-6">
                {problem.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {problem.title}
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {problem.description}
              </p>
              <div className="pt-4 border-t border-black/5">
                <div className="text-2xl font-semibold text-gray-900">
                  {problem.stat}
                </div>
                <div className="text-sm text-gray-500">
                  {problem.statLabel}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Problem;
