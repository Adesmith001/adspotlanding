import React from "react";
import { motion } from "framer-motion";
import { Search, BarChart2, Rocket } from "lucide-react";

const HowItWorks: React.FC = () => {
  const steps: Array<{
    icon: React.ReactNode;
    number: string;
    title: string;
    description: string;
  }> = [
    {
      icon: <Search size={26} />,
      number: "01",
      title: "Discover",
      description:
        "Browse verified billboards on the map and filter by location or audience.",
    },
    {
      icon: <BarChart2 size={26} />,
      number: "02",
      title: "Compare",
      description:
        "Review traffic insights, pricing, and availability in one place.",
    },
    {
      icon: <Rocket size={26} />,
      number: "03",
      title: "Launch",
      description:
        "Book instantly, upload creatives, and go live with confidence.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-gray-400">
            How it works
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 mt-4">
            Three simple steps.
          </h2>
          <p className="text-lg text-gray-600 mt-4 max-w-xl mx-auto">
            From discovery to launch in minutes, not weeks.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="rounded-3xl border border-black/5 bg-[#fafafa] p-7 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center mx-auto mb-6">
                {step.icon}
              </div>
              <div className="text-xs tracking-widest text-gray-400 font-semibold mb-2">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
