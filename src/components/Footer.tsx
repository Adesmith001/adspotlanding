import React from "react";
import {
  Twitter,
  Linkedin,
  Instagram,
  Facebook,
  Mail,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks: Record<string, Array<{ label: string; href: string }>> = {
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
    <footer className="bg-white border-t border-black/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center text-white font-bold">
                A
              </div>
              <span className="text-gray-900 font-semibold text-xl tracking-tight">
                Adspot
              </span>
            </div>

            <p className="text-gray-600 mb-6 max-w-sm leading-relaxed">
              The future of outdoor advertising in Nigeria. Discover, compare,
              and book billboards instantly with complete transparency.
            </p>

            <div className="space-y-3 text-sm mb-6">
              <div className="flex items-center gap-3 text-gray-500">
                <Mail size={16} className="text-gray-700" />
                <span>hello@adspot.ng</span>
              </div>
              <div className="flex items-center gap-3 text-gray-500">
                <MapPin size={16} className="text-gray-700" />
                <span>Lagos, Nigeria</span>
              </div>
            </div>

            <Link to="/login">
              <button className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-sm">
                Get Started
              </button>
            </Link>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-gray-900 font-semibold mb-5">{title}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 mb-10">
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.href}
              aria-label={social.label}
              className="w-10 h-10 rounded-xl bg-black/5 border border-black/10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-black/10 transition-all"
            >
              {social.icon}
            </a>
          ))}
        </div>

        <div className="pt-6 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">© {currentYear} Adspot.</p>
          <p className="text-gray-500 text-sm">
            Designed for modern outdoor advertising.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
