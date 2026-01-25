import React from "react";
import {
  Twitter,
  Linkedin,
  Instagram,
  Facebook,
  Mail,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Platform: [
      { label: "Browse Billboards", href: "#" },
      { label: "List Your Space", href: "#" },
      { label: "Pricing", href: "#" },
      { label: "Case Studies", href: "#" },
    ],
    Company: [
      { label: "About Us", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Contact", href: "#" },
    ],
    Legal: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Policy", href: "#" },
    ],
  };

  const socialLinks = [
    { icon: <Twitter size={18} />, href: "#", label: "Twitter" },
    { icon: <Linkedin size={18} />, href: "#", label: "LinkedIn" },
    { icon: <Instagram size={18} />, href: "#", label: "Instagram" },
    { icon: <Facebook size={18} />, href: "#", label: "Facebook" },
  ];

  return (
    <footer className="bg-[#050505] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-xl">A</span>
              </div>
              <span className="text-white font-bold text-2xl tracking-tight">
                Adspot
              </span>
            </div>

            <p className="text-gray-400 mb-8 max-w-sm leading-relaxed font-light">
              The future of outdoor advertising in Nigeria. Discover, compare,
              and book billboards instantly with complete transparency.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 text-sm mb-8">
              <div className="flex items-center gap-3 text-gray-500">
                <Mail size={16} className="text-amber-400" />
                <span>hello@adspot.ng</span>
              </div>
              <div className="flex items-center gap-3 text-gray-500">
                <MapPin size={16} className="text-amber-400" />
                <span>Lagos, Nigeria</span>
              </div>
            </div>

            {/* Get Started CTA */}
            <Link to="/login">
              <button className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-shadow">
                Get Started
                <ArrowRight size={16} />
              </button>
            </Link>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links], index) => (
            <div key={index}>
              <h3 className="text-white font-semibold mb-6">{title}</h3>
              <ul className="space-y-4">
                {links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-gray-500 hover:text-white text-sm transition-colors duration-300"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social Links */}
        <div className="flex flex-wrap gap-3 mb-12">
          {socialLinks.map((social, index) => (
            <a
              key={index}
              href={social.href}
              aria-label={social.label}
              className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-amber-500/30 hover:bg-amber-500/10 transition-all duration-300"
            >
              {social.icon}
            </a>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © {currentYear} Adspot. All rights reserved.
            </p>
            <p className="text-gray-600 text-sm">
              Designed with precision for the future of advertising.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
