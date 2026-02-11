import React from "react";
import { motion } from "framer-motion";
import { Map, CreditCard, Calendar, BarChart3, Check } from "lucide-react";

const Solution: React.FC = () => {
  const features: Array<{
    icon: React.ReactNode;
    title: string;
    description: string;
    highlights: string[];
    card: {
      eyebrow: string;
      headline: string;
      subline: string;
      tags: string[];
      stats: Array<{ label: string; value: string }>;
    };
  }> = [
    {
      icon: <Map size={22} />,
      title: "Discover on a live map",
      description:
        "Explore every available billboard with verified photos and audience insights.",
      highlights: ["Live availability", "Traffic insights", "Street view"],
      card: {
        eyebrow: "Discovery",
        headline: "Lekki Expressway LED",
        subline: "High visibility • Verified traffic",
        tags: ["Peak-time", "LED", "12m x 6m"],
        stats: [
          { label: "Daily Impressions", value: "85k" },
          { label: "Availability", value: "Today" },
        ],
      },
    },
    {
      icon: <CreditCard size={22} />,
      title: "Transparent pricing",
      description:
        "Compare rates instantly with no negotiation or hidden fees.",
      highlights: ["Market rates", "No hidden fees", "Instant quotes"],
      card: {
        eyebrow: "Pricing",
        headline: "₦1,200,000 / 4 weeks",
        subline: "All fees included",
        tags: ["Transparent", "Vendor-verified", "Instant quote"],
        stats: [
          { label: "Market Avg.", value: "₦1.35m" },
          { label: "Savings", value: "11%" },
        ],
      },
    },
    {
      icon: <Calendar size={22} />,
      title: "Book in real time",
      description:
        "Lock in dates, upload creatives, and go live in minutes.",
      highlights: ["Live calendar", "Instant confirmation", "Flexible terms"],
      card: {
        eyebrow: "Scheduling",
        headline: "Campaign dates",
        subline: "Mar 18 → Apr 14",
        tags: ["Instant confirm", "Flexible dates", "Auto reminders"],
        stats: [
          { label: "Turnaround", value: "< 10 min" },
          { label: "Slots left", value: "2" },
        ],
      },
    },
    {
      icon: <BarChart3 size={22} />,
      title: "Measure performance",
      description:
        "Track results, renew placements, and manage creatives in one place.",
      highlights: ["ROI tracking", "Performance metrics", "Campaign reports"],
      card: {
        eyebrow: "Analytics",
        headline: "Campaign lift",
        subline: "Week 2 performance",
        tags: ["ROI", "Reach", "Engagement"],
        stats: [
          { label: "Lift", value: "+28%" },
          { label: "Reach", value: "1.4m" },
        ],
      },
    },
  ];

  return (
    <section
      id="features"
      className="py-24 md:py-28 bg-[#0b0b0b] text-white relative overflow-hidden"
    >
      <div className="absolute inset-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-amber-500/10 via-transparent to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[700px] h-[500px] bg-gradient-to-br from-purple-500/10 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-gray-400">
            The solution
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white mt-4">
            One platform, complete control.
          </h2>
          <p className="text-lg text-gray-300 mt-4 max-w-2xl mx-auto">
            Everything you need to plan, book, and manage outdoor campaigns like
            a pro.
          </p>
        </motion.div>

        <div className="space-y-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, margin: "-80px" }}
              className={`flex flex-col ${
                index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              } items-center gap-10 lg:gap-16`}
            >
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex w-12 h-12 rounded-2xl bg-white/10 text-white items-center justify-center mb-6 border border-white/15">
                  {feature.icon}
                </div>
                <h3 className="text-2xl md:text-3xl font-semibold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-300 mb-6 max-w-lg mx-auto lg:mx-0">
                  {feature.description}
                </p>
                <ul className="space-y-3">
                  {feature.highlights.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 justify-center lg:justify-start text-gray-200"
                    >
                      <span className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-black flex items-center justify-center">
                        <Check size={14} />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex-1 w-full">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/10 blur-3xl rounded-full" />
                  <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl border border-white/15 shadow-2xl shadow-black/50 p-6">
                    <div className="flex items-center justify-between mb-5">
                      <span className="text-xs uppercase tracking-widest text-amber-300/80">
                        {feature.card.eyebrow}
                      </span>
                      <span className="text-xs text-gray-300">
                        Verified by Adspot
                      </span>
                    </div>

                    <h4 className="text-2xl font-semibold text-white mb-2">
                      {feature.card.headline}
                    </h4>
                    <p className="text-sm text-gray-300 mb-5">
                      {feature.card.subline}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {feature.card.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-gray-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {feature.card.stats.map((stat) => (
                        <div
                          key={stat.label}
                          className="rounded-2xl bg-[#111111] border border-white/10 p-4"
                        >
                          <div className="text-lg font-semibold text-white">
                            {stat.value}
                          </div>
                          <div className="text-xs text-gray-400">
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Solution;
