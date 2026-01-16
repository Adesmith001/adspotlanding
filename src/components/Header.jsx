import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How it Works" },
    { href: "#benefits", label: "Benefits" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-primary/80 backdrop-blur-xl py-4 border-b border-white/5"
          : "bg-transparent py-6"
      }`}
    >
      <div className="section-container flex items-center justify-between">
        {/* Logo */}
        <motion.a
          href="#"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 group"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-accent to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-accent/30 transition-shadow duration-300">
            <span className="text-primary font-bold text-xl">A</span>
          </div>
          <span className="text-white font-bold text-2xl tracking-tight">
            Adspot
          </span>
        </motion.a>

        {/* Desktop Navigation */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="hidden md:flex items-center gap-10"
        >
          {navLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="text-gray-400 hover:text-white text-sm font-medium transition-colors duration-300 relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full"></span>
            </a>
          ))}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-accent hover:bg-accent-light text-primary px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 shadow-lg shadow-accent/20 hover:shadow-accent/40"
          >
            Join Waitlist
          </motion.button>
        </motion.nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white p-2 hover:bg-white/5 rounded-lg transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-full left-0 right-0 bg-primary/95 backdrop-blur-xl border-b border-white/5 md:hidden overflow-hidden"
          >
            <nav className="section-container py-6 flex flex-col gap-4">
              {navLinks.map((link, index) => (
                <motion.a
                  key={index}
                  href={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-gray-300 hover:text-white py-3 text-lg font-medium transition-colors border-b border-white/5 last:border-0"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </motion.a>
              ))}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-accent text-primary px-6 py-4 rounded-xl font-semibold mt-2 w-full"
              >
                Join Waitlist
              </motion.button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
