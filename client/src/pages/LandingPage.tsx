import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  FileText,
  Bell,
  PackageCheck,
  ClipboardList,
  Bot,
  CheckCircle2,
  ChevronDown,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';
import { statsApi } from '@/lib/services';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
};

const STEPS = [
  { icon: ClipboardList, title: 'Report', desc: 'Report a lost or found item in seconds with photos and details.' },
  { icon: Bot, title: 'AI Match', desc: 'Our AI instantly scans for matching items using visual + text similarity.' },
  { icon: FileText, title: 'Claim', desc: 'Submit an ownership claim and answer verification questions.' },
  { icon: PackageCheck, title: 'Recover', desc: 'Admins review and approve, then the item is reunited with its owner.' },
];

const FEATURES = [
  { icon: Search, title: 'Smart Search & Filters', desc: 'Find items fast with keyword search, category, color, brand, date and location filters.' },
  { icon: Sparkles, title: 'AI Image Matching', desc: 'A vision model compares lost and found photos to surface the best matches with confidence scores.' },
  { icon: Shield, title: 'Secure Ownership Claims', desc: 'Verification questions and admin review prevent fraudulent claims.' },
  { icon: Bell, title: 'Real-time Notifications', desc: 'Get notified the moment a match or claim update is found.' },
  { icon: PackageCheck, title: 'Recovery Tracking', desc: 'Follow every item from reported to recovered with a clear timeline.' },
  { icon: FileText, title: 'Admin Analytics', desc: 'Campus admins get dashboards, charts and exportable reports.' },
];

const TESTIMONIALS = [
  { name: 'Aarav S.', role: 'Engineering Student', quote: 'I lost my calculator before exams and the AI matched it within minutes. Lifesaver!' },
  { name: 'Priya M.', role: 'Design Student', quote: 'The claim process was smooth and the admin review felt genuinely secure.' },
  { name: 'Rohan K.', role: 'Campus Admin', quote: 'The analytics dashboard makes managing campus lost & found effortless.' },
];

const FAQS = [
  { q: 'How does the AI matching work?', a: 'When you report a lost item, our vision model compares its photo and details against all found items, ranking matches by image, title, brand, color, category, location and date similarity.' },
  { q: 'How do I claim a found item?', a: 'Open a match, click "Claim This Item", and answer a few ownership verification questions. A campus admin reviews your claim before approval.' },
  { q: 'Is my data secure?', a: 'Yes. Items are scoped to your college, claims require verification, and only authorized admins can approve returns.' },
  { q: 'What if there is no match yet?', a: 'New items are reported daily. You will be notified automatically as soon as a matching found item appears.' },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card overflow-hidden p-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 p-5 text-left font-medium"
        aria-expanded={open}
      >
        {q}
        <ChevronDown size={18} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="px-5 pb-5 text-sm text-[var(--color-text-secondary)]">{a}</p>}
    </div>
  );
}

export default function LandingPage() {
  const { data } = useQuery({
    queryKey: ['public-stats'],
    queryFn: () => statsApi.getPublic(),
  });
  const stats = data?.data?.data;

  const statCards = [
    { label: 'Lost Items Reported', value: stats?.lostItems ?? '—' },
    { label: 'Found Items', value: stats?.foundItems ?? '—' },
    { label: 'Items Recovered', value: stats?.recovered ?? '—' },
    { label: 'Active Users', value: stats?.activeUsers ?? '—' },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 px-4 py-24 text-white sm:py-32">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="relative mx-auto max-w-4xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur"
          >
            <Sparkles size={14} /> AI-Powered Campus Lost & Found
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl"
          >
            Never Lose an Item Again
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-primary-100"
          >
            Report lost items, browse found items, and let our AI matching engine reunite you with your
            belongings — fast, secure, and built for your campus.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link to="/register" className="btn-primary bg-white px-8 py-3 text-primary-700 hover:bg-primary-50">
              Get Started <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary border-white/30 bg-transparent px-8 py-3 text-white hover:bg-white/10">
              Sign In
            </Link>
            <Link to="/admin/login" className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-6 py-3 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/20">
              <ShieldCheck size={16} /> Admin Login
            </Link>
          </motion.div>
        </div>
      </section>



      {/* How It Works */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold">How It Works</h2>
          <p className="mt-3 text-[var(--color-text-secondary)]">Four simple steps from lost to recovered.</p>
        </motion.div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <motion.div {...fadeUp} transition={{ delay: i * 0.05 }} key={step.title} className="card relative text-center">
              <span className="absolute right-4 top-4 text-3xl font-bold text-gray-100 dark:text-gray-800">{i + 1}</span>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/40">
                <step.icon size={24} />
              </div>
              <h3 className="font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-[var(--color-surface)] py-20">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold">Everything You Need</h2>
            <p className="mt-3 text-[var(--color-text-secondary)]">A complete lost & found platform for modern campuses.</p>
          </motion.div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <motion.div {...fadeUp} key={f.title} className="card">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/40">
                  <f.icon size={22} />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Matching highlight */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <motion.div {...fadeUp}>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
              <Bot size={14} /> AI Matching Engine
            </span>
            <h2 className="mt-4 text-3xl font-bold">Matches found in seconds, not days</h2>
            <p className="mt-4 text-[var(--color-text-secondary)]">
              Our multi-signal matching engine compares images, titles, brands, colors, categories, locations
              and dates to rank the most likely matches — each with a transparent confidence breakdown so you
              know exactly why a match was suggested.
            </p>
            <ul className="mt-6 space-y-3">
              {['Visual image similarity', 'Transparent confidence scores', 'Explainable match reasons'].map((point) => (
                <li key={point} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 size={18} className="text-green-500" /> {point}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div {...fadeUp} className="card space-y-3">
            {[
              { label: 'Image', pct: 88 },
              { label: 'Title', pct: 74 },
              { label: 'Brand', pct: 100 },
              { label: 'Color', pct: 92 },
              { label: 'Location', pct: 65 },
            ].map((bar) => (
              <div key={bar.label}>
                <div className="mb-1 flex justify-between text-xs text-[var(--color-text-secondary)]">
                  <span>{bar.label}</span>
                  <span>{bar.pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${bar.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="h-full rounded-full bg-primary-600"
                  />
                </div>
              </div>
            ))}
            <div className="rounded-xl bg-primary-50 p-4 text-center dark:bg-primary-900/20">
              <p className="text-3xl font-bold text-primary-600">84%</p>
              <p className="text-xs text-[var(--color-text-secondary)]">Overall Confidence</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[var(--color-surface)] py-20">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold">Loved by Students & Admins</h2>
          </motion.div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <motion.div {...fadeUp} key={t.name} className="card">
                <p className="text-sm italic text-[var(--color-text-secondary)]">"{t.quote}"</p>
                <div className="mt-4">
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-20">
        <motion.div {...fadeUp} className="text-center">
          <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
        </motion.div>
        <div className="mt-10 space-y-3">
          {FAQS.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>

      {/* Contact / CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 px-6 py-14 text-center text-white">
          <h2 className="text-3xl font-bold">Ready to reunite with your lost items?</h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-100">
            Join your campus community and let AI do the searching for you.
          </p>
          <Link to="/register" className="btn-primary mt-8 inline-flex bg-white px-8 py-3 text-primary-700 hover:bg-primary-50">
            Create Free Account <ArrowRight size={18} />
          </Link>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 text-sm text-primary-100 sm:flex-row">
            <a href="mailto:support@lostfound.ai" className="inline-flex items-center gap-2 transition-colors hover:text-white"><Mail size={15} /> support@lostfound.ai</a>
            <a href="tel:+919876543210" className="inline-flex items-center gap-2 transition-colors hover:text-white"><Phone size={15} /> +91 98765 43210</a>
            <span className="inline-flex items-center gap-2"><MapPin size={15} /> Campus HQ, India</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] py-8 text-center text-sm text-[var(--color-text-secondary)]">
        <p>© 2026 Campus Lost & Found AI. Built for students, by students.</p>
      </footer>
    </div>
  );
}
