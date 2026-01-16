import React from "react";
import {
  Twitter,
  Linkedin,
  Instagram,
  Facebook,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

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
    <footer className="bg-primary border-t border-white/5">
      <div className="section-container py-16 md:py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-accent to-orange-500 rounded-xl flex items-center justify-center">
                <span className="text-primary font-bold text-xl">A</span>
              </div>
              <span className="text-white font-bold text-2xl tracking-tight">
                Adspot
              </span>
            </div>

            <p className="text-gray-400 mb-6 max-w-sm leading-relaxed">
              The future of outdoor advertising. Discover, compare, and book
              billboards instantly with complete transparency.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-gray-500">
                <Mail size={16} className="text-accent" />
                <span>hello@adspot.ng</span>
              </div>
              <div className="flex items-center gap-3 text-gray-500">
                <MapPin size={16} className="text-accent" />
                <span>Lagos, Nigeria</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3 mt-8">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-accent hover:border-accent/30 hover:bg-accent/5 transition-all duration-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>
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
                      className="text-gray-400 hover:text-white text-sm transition-colors duration-300"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
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
