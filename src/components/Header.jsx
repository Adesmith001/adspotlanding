import React, { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        isScrolled
          ? "bg-[#0a0a0a]/90 backdrop-blur-2xl py-3 shadow-2xl shadow-black/20"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <motion.a
          href="#"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 group"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl blur-lg opacity-50 group-hover:opacity-80 transition-opacity duration-500"></div>
            <div className="relative w-11 h-11 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-xl tracking-tighter">
                A
              </span>
            </div>
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
          className="hidden md:flex items-center gap-1"
        >
          {navLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="relative px-5 py-2.5 text-gray-400 hover:text-white text-sm font-medium transition-all duration-300 group"
            >
              <span className="relative z-10">{link.label}</span>
              <span className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/5 transition-all duration-300"></span>
            </a>
          ))}

          <div className="w-px h-6 bg-white/10 mx-4"></div>

          <Link
            to="/login"
            className="text-gray-400 hover:text-white text-sm font-medium transition-colors duration-300 px-4 py-2"
          >
            Sign In
          </Link>

          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="relative group ml-2"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full blur-md opacity-50 group-hover:opacity-80 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-2 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white px-6 py-2.5 rounded-full font-semibold text-sm shadow-lg">
                Get Started
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </div>
            </motion.button>
          </Link>
        </motion.nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white p-2.5 hover:bg-white/5 rounded-xl transition-colors"
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
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute top-full left-0 right-0 bg-[#0a0a0a]/98 backdrop-blur-2xl border-b border-white/5 md:hidden overflow-hidden"
          >
            <nav className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-2">
              {navLinks.map((link, index) => (
                <motion.a
                  key={index}
                  href={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-gray-300 hover:text-white py-4 text-lg font-medium transition-colors border-b border-white/5 last:border-0"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </motion.a>
              ))}

              <div className="pt-4 space-y-3">
                <Link
                  to="/login"
                  className="block text-center text-gray-400 hover:text-white py-3 text-lg font-medium transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>

                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white px-6 py-4 rounded-xl font-semibold shadow-lg"
                  >
                    Get Started
                    <ArrowRight size={18} />
                  </motion.button>
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
