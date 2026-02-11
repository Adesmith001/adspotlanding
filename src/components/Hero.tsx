import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, MapPin, Sparkles, Wallet, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { getAvailableLocations } from "@/services/billboard.service";

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [budget, setBudget] = useState("");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [locations, setLocations] = useState<string[]>([
    "Lagos",
    "Abuja",
    "Port Harcourt",
    "Kano",
    "Ibadan",
    "Benin City",
    "Enugu",
    "Kaduna",
  ]);

  // Load available locations from database
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const availableLocations = await getAvailableLocations();
        if (availableLocations.length > 0) {
          setLocations(availableLocations);
        }
      } catch (error) {
        console.error("Error loading locations:", error);
        // Keep default locations on error
      }
    };
    
    loadLocations();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.append("city", location);
    if (startDate) params.append("startDate", startDate.toISOString());
    if (endDate) params.append("endDate", endDate.toISOString());
    if (budget) params.append("maxPrice", budget);
    
    navigate(`/listings?${params.toString()}`);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0b0b0b]">
      {/* Background image + overlay */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/assets/hero_dashboard_1763516844515.png')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        <div className="absolute inset-0 opacity-[0.05]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
              backgroundSize: "90px 90px",
            }}
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-8 backdrop-blur">
            <Sparkles size={14} className="text-amber-300" />
            <span className="text-amber-100/90 text-sm font-medium tracking-wide">
              Nigeria&apos;s #1 Billboard Marketplace
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-white leading-tight tracking-tight mb-6">
            Find premium billboards
            <br />
            in minutes, not days.
          </h1>

          <p className="text-lg md:text-xl text-gray-200/80 max-w-3xl mx-auto mb-10">
            Book instantly with transparent pricing, real-time availability, and
            zero agency hassle.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link to="/login" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white text-black px-7 py-3.5 rounded-full font-semibold text-base shadow-xl shadow-black/30"
              >
                Get started
                <ArrowRight size={18} />
              </motion.button>
            </Link>
            <Link to="/signup" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white/10 text-white px-7 py-3.5 rounded-full font-semibold text-base border border-white/20 backdrop-blur"
              >
                List your billboard
              </motion.button>
            </Link>
          </div>

          {/* Airbnb-style search card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="mx-auto max-w-4xl"
          >
            <div className="bg-white/95 text-black rounded-3xl shadow-2xl shadow-black/40 border border-white/40 backdrop-blur-xl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
                {/* Location Dropdown */}
                <div className="p-5 md:p-6 border-b md:border-b-0 md:border-r border-black/10 relative">
                  <div className="flex items-center gap-3">
                    <MapPin size={18} className="text-gray-600" />
                    <div className="text-left flex-1">
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        Location
                      </p>
                      <button
                        onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                        className="w-full bg-transparent text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none text-left flex items-center justify-between"
                      >
                        <span className={location ? "" : "text-gray-400"}>
                          {location || "Select location"}
                        </span>
                        <ChevronDown size={16} className="text-gray-400" />
                      </button>
                    </div>
                  </div>
                  {showLocationDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-black/10 z-50 max-h-64 overflow-y-auto">
                      {locations.map((loc) => (
                        <button
                          key={loc}
                          onClick={() => {
                            setLocation(loc);
                            setShowLocationDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm font-medium text-gray-900 first:rounded-t-2xl last:rounded-b-2xl"
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Date Picker */}
                <div className="p-5 md:p-6 border-b md:border-b-0 md:border-r border-black/10 relative">
                  <div className="flex items-center gap-3">
                    <CalendarDays size={18} className="text-gray-600" />
                    <div className="text-left flex-1">
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        Campaign Dates
                      </p>
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => setShowStartDatePicker(!showStartDatePicker)}
                          className="bg-transparent text-xs font-medium text-gray-900 focus:outline-none"
                        >
                          {startDate ? format(startDate, "MMM dd") : "Start"}
                        </button>
                        <span className="text-gray-400">→</span>
                        <button
                          onClick={() => setShowEndDatePicker(!showEndDatePicker)}
                          className="bg-transparent text-xs font-medium text-gray-900 focus:outline-none"
                        >
                          {endDate ? format(endDate, "MMM dd") : "End"}
                        </button>
                      </div>
                    </div>
                  </div>
                  {showStartDatePicker && (
                    <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl border border-black/10 z-50 p-4">
                      <input
                        type="date"
                        value={startDate ? format(startDate, "yyyy-MM-dd") : ""}
                        onChange={(e) => {
                          setStartDate(e.target.value ? new Date(e.target.value) : null);
                          setShowStartDatePicker(false);
                        }}
                        min={format(new Date(), "yyyy-MM-dd")}
                        className="w-full px-3 py-2 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/20"
                      />
                    </div>
                  )}
                  {showEndDatePicker && (
                    <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl border border-black/10 z-50 p-4">
                      <input
                        type="date"
                        value={endDate ? format(endDate, "yyyy-MM-dd") : ""}
                        onChange={(e) => {
                          setEndDate(e.target.value ? new Date(e.target.value) : null);
                          setShowEndDatePicker(false);
                        }}
                        min={startDate ? format(startDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")}
                        className="w-full px-3 py-2 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/20"
                      />
                    </div>
                  )}
                </div>

                {/* Budget Input */}
                <div className="p-5 md:p-6 border-b md:border-b-0 md:border-r border-black/10">
                  <div className="flex items-center gap-3">
                    <Wallet size={18} className="text-gray-600" />
                    <div className="text-left flex-1">
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        Budget
                      </p>
                      <input
                        type="number"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full bg-transparent text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none"
                        placeholder="₦500,000+"
                        aria-label="Budget"
                      />
                    </div>
                  </div>
                </div>

                {/* Search Button */}
                <div className="p-4 md:p-6 flex items-center justify-center">
                  <button
                    onClick={handleSearch}
                    className="w-full inline-flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-2xl font-semibold text-sm hover:bg-black/90 transition-colors"
                  >
                    Search billboards
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-gray-200/80">
              <span className="text-gray-300">Popular:</span>
              {[
                "Lekki LED Screens",
                "Ikeja Airport Rd",
                "Victoria Island",
                "Abuja CBD",
              ].map((item) => (
                <span
                  key={item}
                  className="px-3 py-1 rounded-full bg-white/10 border border-white/15"
                >
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
