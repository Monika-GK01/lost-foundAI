import { Link } from 'react-router-dom';
import { Search, Shield, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 px-4 py-24 text-white sm:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold tracking-tight sm:text-6xl"
          >
            Never Lose an Item Again
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-primary-100"
          >
            AI-powered lost & found for your campus. Report lost items, browse found items,
            and let our matching engine reunite you with your belongings.
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
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { icon: Search, title: 'Smart Search', desc: 'Find items using keyword search, filters, and AI-powered image matching.' },
            { icon: Sparkles, title: 'AI Matching', desc: 'Our OpenCLIP model matches lost items with found items using visual similarity.' },
            { icon: Shield, title: 'Secure Claims', desc: 'Verify ownership through detailed questions before items are returned.' },
          ].map((feature) => (
            <div key={feature.title} className="card text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/40">
                <feature.icon size={24} />
              </div>
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] py-8 text-center text-sm text-[var(--color-text-secondary)]">
        <p>© 2026 Campus Lost & Found AI. Built for students, by students.</p>
      </footer>
    </div>
  );
}
