import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'

const socialLinks = [
  {
    href: 'https://facebook.com/goldentraders',
    label: 'Facebook',
    color: '#1877F2',
    bg: 'rgba(24, 119, 242, 0.12)',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
        <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.2c0-.9.3-1.5 1.6-1.5h1.7V2.8c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.2v2.3H7v3.1h3.1v8h3.4Z" />
      </svg>
    ),
  },
  {
    href: 'https://instagram.com/goldentraders',
    label: 'Instagram',
    color: '#E1306C',
    bg: 'rgba(225, 48, 108, 0.12)',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
        <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.2A4.8 4.8 0 1 1 7.2 12 4.8 4.8 0 0 1 12 7.2Zm0 2A2.8 2.8 0 1 0 14.8 12 2.8 2.8 0 0 0 12 9.2Zm5-3.2a1.2 1.2 0 1 1-1.2 1.2A1.2 1.2 0 0 1 17 6Z" />
      </svg>
    ),
  },
  {
    href: 'https://wa.me/1234567890?text=Hello%20Golden%20Traders',
    label: 'WhatsApp',
    color: '#25D366',
    bg: 'rgba(37, 211, 102, 0.12)',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
        <path d="M19.1 4.9A9.5 9.5 0 0 0 4.9 19l-1 3.6 3.7-1a9.5 9.5 0 0 0 11.5-16.7Zm-9.4 2.8c.3 0 .7.1 1 .4.3.2.7.8.9 1.5.2.7.1 1.5-.2 2.2-.1.2-.3.5-.2.8.1.2.2.4.5.7.3.2.8.7 1.4 1.3.9.8 1.5 1.4 1.8 1.8.3.3.5.5.7.7.3.3.5.5.8.6.3.1.6.1 1 .1.4 0 .8-.2 1.2-.5.5-.4 1.3-1.1 1.7-1.5.2-.2.4-.2.7-.2h.7c.1 0 .2.1.3.2.1.1.2.3.2.4.1.3.1.5.1.7 0 .3-.1.7-.4 1.1-.3.4-1.1 1.1-1.8 1.6-.8.5-1.5.8-2.3.9-.8.1-1.7 0-2.7-.1-1.1-.1-2.3-.8-3.3-1.5-1.1-.8-2.3-2.1-3.1-3.5-.7-1.2-1.1-2.3-1.1-3.3 0-.9.3-1.6.8-2.1.4-.5.8-.7 1.2-.7h.8c.2 0 .4.1.6.2.2.1.4.4.5.8.1.4.3 1 .4 1.2.1.2.2.5.1.7-.1.3-.3.5-.5.8-.2.3-.4.5-.5.7-.1.2-.1.4-.1.6.1.2.2.5.5.7.2.2.5.5.8.9.4.4.7.7 1.1 1 .2.1.5.2.7.3.3.1.5.2.6.4.1.2.1.4 0 .7-.1.3-.3.6-.6.8-.3.2-.7.5-1 .7-.4.2-.8.3-1.2.3Z" />
      </svg>
    ),
  },
  {
    href: 'mailto:hello@goldentraders.com',
    label: 'Email',
    color: '#D4AF37',
    bg: 'rgba(212, 175, 55, 0.12)',
    icon: <Mail className="h-4 w-4" />,
  },
]

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 font-display text-xl font-extrabold tracking-tight text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-700 text-white shadow-lg shadow-sky-500/30">
                G
              </span>
              <span className="text-slate-900">Golden Traders</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-6 text-slate-600">
              A modern classifieds & content portal for buying, selling and discovering
              opportunities near you.
            </p>
            <div className="mt-5">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-700">
                Follow us
              </p>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target={social.href.startsWith('http') ? '_blank' : undefined}
                    rel={social.href.startsWith('http') ? 'noreferrer' : undefined}
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-sky-300/40 hover:bg-slate-100"
                    style={{ color: social.color, backgroundColor: social.bg }}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-slate-900">Marketplace</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link to="/listings" className="hover:text-sky-700">Browse Listings</Link></li>
              <li><Link to="/post-ad" className="hover:text-sky-700">Post an Ad</Link></li>
              <li><Link to="/favorites" className="hover:text-sky-700">Saved Items</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-slate-900">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link to="/pages/terms-of-service" className="hover:text-sky-700">Terms of Service</Link></li>
              <li><Link to="/pages/how-to-spot-scam-listings" className="hover:text-sky-700">Safety Tips</Link></li>
              <li><Link to="/admin" className="hover:text-sky-700">CMS Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-slate-900">Account</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link to="/login" className="hover:text-sky-700">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-sky-700">Create Account</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row">
          <p className="text-slate-600">© {new Date().getFullYear()} Golden Traders. All rights reserved.</p>
          <p className="text-sky-700">Designed & built with React, TypeScript and Tailwind CSS.</p>
        </div>
      </div>
    </footer>
  )
}
