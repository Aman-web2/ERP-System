import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import gsap from 'gsap';
import {
  Package, DollarSign, Settings, Users, ShoppingCart,
  Gavel, BarChart3, ArrowRight, CheckCircle2, Zap, Shield, TrendingUp, X
} from 'lucide-react';

// ─── Floating Feature Icon ─────────────────────────────────────
const FeatureNode = ({ icon: Icon, label, color, delay, position }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.5, type: 'spring', stiffness: 200 }}
    className="absolute flex flex-col items-center gap-1.5 group"
    style={position}
  >
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3 + delay, repeat: Infinity, ease: 'easeInOut' }}
      className="flex flex-col items-center gap-1.5"
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border border-white/50 backdrop-blur-sm"
        style={{ background: `linear-gradient(135deg, ${color}20, ${color}40)`, borderColor: `${color}30` }}
      >
        <Icon size={22} color={color} strokeWidth={1.8} />
      </div>
      <span className="text-[11px] font-bold text-slate-600 whitespace-nowrap tracking-wide">{label}</span>
    </motion.div>
  </motion.div>
);

// ─── Connector Line SVG ────────────────────────────────────────
const ConnectorLines = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 500">
    {[
      { x1: 250, y1: 250, x2: 80, y2: 80 },
      { x1: 250, y1: 250, x2: 420, y2: 80 },
      { x1: 250, y1: 250, x2: 60, y2: 250 },
      { x1: 250, y1: 250, x2: 440, y2: 200 },
      { x1: 250, y1: 250, x2: 100, y2: 420 },
      { x1: 250, y1: 250, x2: 400, y2: 380 },
    ].map((line, i) => (
      <motion.line
        key={i}
        x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
        stroke="#2563eb" strokeWidth="1.5" strokeDasharray="6 4"
        strokeOpacity="0.2"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: 0.5 + i * 0.15, duration: 0.8 }}
      />
    ))}
  </svg>
);

// ─── Feature Nodes Config ──────────────────────────────────────
const featureNodes = [
  { icon: Package,      label: 'Inventory',          color: '#f59e0b', delay: 0.6, position: { top: '4%',    left: '8%'   } },
  { icon: ShoppingCart, label: 'Procurement',         color: '#10b981', delay: 0.8, position: { top: '4%',    right: '8%'  } },
  { icon: Users,        label: 'Vendor Coordination', color: '#8b5cf6', delay: 1.0, position: { top: '38%',   left: '2%'   } },
  { icon: DollarSign,   label: 'Financing',           color: '#ec4899', delay: 1.2, position: { top: '12%',   right: '2%'  } },
  { icon: BarChart3,    label: 'Accounts Payable',    color: '#3b82f6', delay: 1.4, position: { bottom: '12%',right: '4%'  } },
  { icon: Gavel,        label: 'Reverse Auction',     color: '#f97316', delay: 1.6, position: { bottom: '4%', left: '12%'  } },
  { icon: Settings,     label: 'Process Controls',    color: '#06b6d4', delay: 1.8, position: { bottom: '4%', right: '26%' } },
];

// ─── Stats ─────────────────────────────────────────────────────
const stats = [
  { value: '500+', label: 'Active Enterprises' },
  { value: '99.9%', label: 'System Uptime' },
  { value: '40%', label: 'Efficiency Boost' },
  { value: '24/7', label: 'Expert Support' },
];

// ─── Features List ─────────────────────────────────────────────
const features = [
  { icon: Zap,       text: 'Real-time inventory & procurement sync' },
  { icon: Shield,    text: 'Role-based enterprise security' },
  { icon: TrendingUp,text: 'AI-powered analytics & forecasting' },
  { icon: CheckCircle2, text: 'Seamless B2B commercial workflows' },
];

// ─── MAIN HOME COMPONENT ───────────────────────────────────────
const Home = () => {
  const blobRef1 = useRef(null);
  const blobRef2 = useRef(null);
  const [demoOpen, setDemoOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactStatus, setContactStatus] = useState(null); // 'sending' | 'success' | 'error'

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactStatus('sending');
    try {
      await axios.post('http://localhost:5000/api/contact', contactForm);
      setContactStatus('success');
      setContactForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      setContactStatus('error');
    }
  };

  useEffect(() => {
    gsap.to(blobRef1.current, { x: 30, y: 20, scale: 1.1, duration: 8, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to(blobRef2.current, { x: -20, y: -30, scale: 0.9, duration: 10, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2 });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 overflow-x-hidden">

      {/* ── Background Blobs ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div ref={blobRef1} className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-blue-400/10 blur-3xl" />
        <div ref={blobRef2} className="absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full bg-indigo-400/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-pink-300/5 blur-3xl" />
      </div>

      {/* ── Dot pattern ── */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-30"
        style={{ backgroundImage: 'radial-gradient(circle, #2563eb18 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />

      {/* ══════════════════════ NAVBAR ══════════════════════ */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-50 flex items-center justify-between px-8 lg:px-16 py-5 bg-white/70 backdrop-blur-xl border-b border-slate-100/80 shadow-sm"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <BarChart3 size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-slate-800">Bizee</span>
            <span className="text-xl font-black tracking-tight text-blue-600">ERP</span>
          </div>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          {[['Home', '#'], ['Articles', '#articles'], ['Contact', '#contact']].map(([link, href]) => (
            <a key={link} href={href}
              className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors relative group"
            >
              {link}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full rounded-full" />
            </a>
          ))}
        </div>

        {/* Login button */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5 transition-all duration-200"
          >
            Login
            <ArrowRight size={15} />
          </Link>
        </div>
      </motion.nav>

      {/* ══════════════════════ HERO ══════════════════════ */}
      <section className="relative z-10 min-h-[calc(100vh-80px)] flex items-center px-8 lg:px-16 py-12">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* ── Left: Text ── */}
          <div className="flex flex-col gap-6">

            {/* Badge */}
            <div>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-600 border border-blue-700 text-white text-xs font-bold uppercase tracking-widest shadow-md whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                ERP · Enterprise Resource Planning
              </span>
            </div>

            {/* Sub-headline */}
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-lg font-semibold text-blue-500 tracking-wide"
            >
              Transforming Manufacturing
            </motion.p>

            {/* Main headline */}
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black text-slate-900 leading-tight tracking-tight">
              Unifying Inventory, Procurement, Production &amp; Sales
            </h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              className="text-base text-slate-500 font-medium leading-relaxed max-w-lg"
            >
              An Intuitive Platform for Enterprises to Seamlessly Control Inventory, Procurement, Production & Sales with Simplified Commercial Processes.
            </motion.p>

            {/* Feature list */}
            <motion.ul
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.6 }}
              className="flex flex-col gap-2.5"
            >
              {features.map(({ icon: Icon, text }, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-blue-600" />
                  </div>
                  {text}
                </li>
              ))}
            </motion.ul>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.6 }}
              className="flex flex-wrap gap-4 mt-2"
            >
              <Link
                to="/login"
                className="group flex items-center gap-3 px-7 py-4 bg-gradient-to-r from-slate-900 to-slate-700 text-white font-bold rounded-2xl shadow-xl shadow-slate-200 hover:shadow-slate-300 hover:-translate-y-1 transition-all duration-200"
              >
                <BarChart3 size={18} />
                <span>
                  <span className="block text-[10px] font-medium opacity-70 uppercase tracking-widest">Know More</span>
                  <span className="block text-sm">Get Started Free</span>
                </span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <button
                onClick={() => setDemoOpen(true)}
                className="flex items-center gap-2 px-7 py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:border-blue-300 hover:bg-blue-50 hover:-translate-y-1 transition-all duration-200 shadow-sm"
              >
                Watch Demo
                <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">▶</span>
              </button>
            </motion.div>
          </div>

          {/* ── Right: Animated Ecosystem ── */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full aspect-square max-w-[540px] mx-auto overflow-hidden"
          >
            {/* Connector Lines */}
            <ConnectorLines />

            {/* Feature Nodes */}
            {featureNodes.map((node) => (
              <FeatureNode key={node.label} {...node} />
            ))}

            {/* Center: Illustration */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="relative w-60 h-60"
              >
                {/* Glow ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 blur-xl opacity-80" />
                <div className="absolute inset-4 rounded-full bg-white shadow-2xl shadow-blue-200/50 border border-blue-100/60" />

                {/* Image */}
                <img
                  src="/hero-illustration.png"
                  alt="ERP Enterprise Platform"
                  className="absolute inset-0 w-full h-full object-contain p-5"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />

                {/* Fallback center icon */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="absolute w-44 h-44 rounded-full border-2 border-dashed border-blue-200"
                  />
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-300">
                    <BarChart3 size={36} className="text-white" strokeWidth={1.8} />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════ STATS ══════════════════════ */}
      <motion.section
        id="features"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="relative z-10 px-8 lg:px-16 py-20 bg-white/60 backdrop-blur-sm border-t border-slate-100"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ value, label }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <p className="text-4xl font-black text-slate-900 tracking-tighter">{value}</p>
                <p className="text-sm font-semibold text-slate-500 mt-1 uppercase tracking-widest">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ══════════════════════ ARTICLES ══════════════════════ */}
      <motion.section
        id="articles"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="relative z-10 px-8 lg:px-16 py-20 bg-gradient-to-br from-slate-50 to-blue-50/30 border-t border-slate-100"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest mb-4">
              Latest Insights
            </span>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Articles & Resources</h2>
            <p className="text-slate-500 font-medium mt-3 max-w-xl mx-auto">Stay updated with the latest trends in ERP, manufacturing, and enterprise operations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                tag: 'Inventory',
                title: 'How Real-Time Inventory Sync Reduces Wastage by 40%',
                desc: 'Discover how modern ERP systems eliminate stock discrepancies and improve supply chain efficiency.',
                date: 'Mar 28, 2026',
                color: '#f59e0b',
              },
              {
                tag: 'Finance',
                title: 'Automating Payroll & Invoicing for Growing Enterprises',
                desc: 'A deep dive into how automated finance modules save hours of manual work every month.',
                date: 'Apr 2, 2026',
                color: '#10b981',
              },
              {
                tag: 'Analytics',
                title: 'Using AI-Powered Dashboards to Drive Smarter Decisions',
                desc: 'Learn how predictive analytics in ERP platforms help leadership teams act faster.',
                date: 'Apr 7, 2026',
                color: '#3b82f6',
              },
            ].map((article, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 overflow-hidden group cursor-pointer"
              >
                <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${article.color}, ${article.color}80)` }} />
                <div className="p-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full" style={{ background: `${article.color}15`, color: article.color }}>
                    {article.tag}
                  </span>
                  <h3 className="text-base font-black text-slate-800 mt-3 mb-2 leading-snug group-hover:text-blue-600 transition-colors">{article.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{article.desc}</p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                    <span className="text-xs font-semibold text-slate-400">{article.date}</span>
                    <span className="text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Read more <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ══════════════════════ CONTACT ══════════════════════ */}
      <motion.section
        id="contact"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="relative z-10 px-8 lg:px-16 py-20 bg-white/60 backdrop-blur-sm border-t border-slate-100"
      >
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-widest mb-4">
            Get In Touch
          </span>
          <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-3">Contact Us</h2>
          <p className="text-slate-500 font-medium mb-10 max-w-lg mx-auto">Have questions about BizeeERP? Our team is ready to help you get started.</p>

          <form
            onSubmit={handleContactSubmit}
            className="bg-white rounded-3xl border border-slate-100 shadow-lg p-8 text-left space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Your name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={contactForm.email}
                  onChange={(e) => setContactForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5">Subject</label>
              <input
                type="text"
                required
                placeholder="How can we help?"
                value={contactForm.subject}
                onChange={(e) => setContactForm(f => ({ ...f, subject: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5">Message</label>
              <textarea
                rows={4}
                required
                placeholder="Tell us more about your requirements..."
                value={contactForm.message}
                onChange={(e) => setContactForm(f => ({ ...f, message: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition resize-none"
              />
            </div>

            {/* Status messages */}
            {contactStatus === 'success' && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold">
                <CheckCircle2 size={16} /> Message sent! We'll get back to you soon.
              </div>
            )}
            {contactStatus === 'error' && (
              <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-semibold">
                Something went wrong. Please try again.
              </div>
            )}

            <button
              type="submit"
              disabled={contactStatus === 'sending'}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-md shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {contactStatus === 'sending' ? 'Sending...' : <> Send Message <ArrowRight size={16} /> </>}
            </button>
          </form>
        </div>
      </motion.section>

      {/* ══════════════════════ FOOTER ══════════════════════ */}
      <footer className="relative z-10 px-8 lg:px-16 py-8 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-100 bg-white/50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
            <BarChart3 size={12} className="text-white" />
          </div>
          <span className="text-sm font-bold text-slate-700">BizeeERP</span>
          <span className="text-xs text-slate-400 font-medium">· Enterprise Resource Planning</span>
        </div>
        <p className="text-xs font-medium text-slate-400">
          © {new Date().getFullYear()} BizeeERP. All rights reserved.
        </p>
        <Link
          to="/login"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
        >
          Login to Dashboard →
        </Link>
      </footer>

      {/* ══════════════════════ DEMO MODAL ══════════════════════ */}
      <AnimatePresence>
        {demoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setDemoOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="relative w-full max-w-3xl bg-slate-900 rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                    <BarChart3 size={14} className="text-white" />
                  </div>
                  <span className="text-sm font-bold text-white">BizeeERP — Product Demo</span>
                </div>
                <button
                  onClick={() => setDemoOpen(false)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>

              {/* Video */}
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0"
                  title="BizeeERP Demo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Home;
