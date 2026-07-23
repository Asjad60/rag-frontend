import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Globe, Building2, ArrowRight, Loader2, MessageSquare, Sparkles } from 'lucide-react';

const steps = [
  { id: 1, label: 'Identity', icon: Building2 },
  { id: 2, label: 'Website', icon: Globe },
  { id: 3, label: 'Launch', icon: Sparkles },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    botName: '',
    businessName: '',
    websiteUrl: '',
    welcomeMessage: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleNext = (e) => {
    e.preventDefault();
    if (step < 3) setStep(step + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userId = localStorage.getItem('userId');

      // 1. Create Bot with full identity
      const botRes = await axios.post('http://localhost:5000/api/bots', {
        userId,
        name: form.botName,
        businessName: form.businessName,
        websiteUrl: form.websiteUrl,
        welcomeMessage:
          form.welcomeMessage ||
          `Hi! I'm the AI assistant for ${form.businessName || form.botName}. How can I help you today?`,
        description: `AI assistant for ${form.businessName || form.botName} — trained on ${form.websiteUrl}`,
      });
      const botId = botRes.data._id;

      // 2. Ingest the website URL (background crawl starts)
      await axios.post('http://localhost:5000/api/bots/ingest', {
        botId,
        url: form.websiteUrl,
      });

      navigate('/dashboard');
    } catch (err) {
      setError('Something went wrong. Please check the URL and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl"
      >
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-3 mb-8 relative z-10">
            {steps.map((s) => {
              const Icon = s.icon;
              const active = step >= s.id;
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <div
                    className={`flex flex-col items-center gap-1 transition-all ${
                      active ? 'opacity-100' : 'opacity-30'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center border-2 ${
                        active
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'border-slate-600 text-slate-500'
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">{s.label}</span>
                  </div>
                  {s.id < steps.length && (
                    <div
                      className={`w-10 h-px mb-4 rounded ${
                        step > s.id ? 'bg-blue-500' : 'bg-slate-700'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step 1: Bot Identity */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative z-10"
            >
              <h1 className="text-2xl font-bold text-white mb-1">Name your assistant</h1>
              <p className="text-slate-400 text-sm mb-6">
                Give your bot an identity. This is what it'll use to introduce itself to visitors.
              </p>
              <form onSubmit={handleNext} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Bot Name</label>
                  <input
                    type="text"
                    value={form.botName}
                    onChange={(e) => update('botName', e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="e.g. Acme Support Bot"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Business / Company Name
                  </label>
                  <input
                    type="text"
                    value={form.businessName}
                    onChange={(e) => update('businessName', e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="e.g. Acme Corporation"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Welcome Message{' '}
                    <span className="text-slate-500 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.welcomeMessage}
                    onChange={(e) => update('welcomeMessage', e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Hi! How can I help you today?"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center"
                >
                  Continue <ArrowRight className="ml-2" size={18} />
                </button>
              </form>
            </motion.div>
          )}

          {/* Step 2: Website URL */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative z-10"
            >
              <h1 className="text-2xl font-bold text-white mb-1">Connect your website</h1>
              <p className="text-slate-400 text-sm mb-6">
                We'll crawl up to <strong className="text-slate-300">15 pages</strong> of your
                website — products, contact info, FAQs, about pages — and train your AI on all of it.
              </p>
              <form onSubmit={handleNext} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Website URL
                  </label>
                  <div className="relative">
                    <Globe
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                      size={20}
                    />
                    <input
                      type="url"
                      value={form.websiteUrl}
                      onChange={(e) => update('websiteUrl', e.target.value)}
                      className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="https://yourwebsite.com"
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Use your homepage — we'll automatically discover and scrape internal pages.
                  </p>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center"
                >
                  Continue <ArrowRight className="ml-2" size={18} />
                </button>
              </form>
            </motion.div>
          )}

          {/* Step 3: Launch */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative z-10"
            >
              <h1 className="text-2xl font-bold text-white mb-1">Ready to launch 🚀</h1>
              <p className="text-slate-400 text-sm mb-6">
                Review your setup and launch. Scraping runs in the background — your bot will be
                ready within a minute.
              </p>

              <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-5 space-y-3 mb-6 text-sm">
                <Row label="Bot Name" value={form.botName} />
                <Row label="Business" value={form.businessName} />
                <Row label="Website" value={form.websiteUrl} />
                <Row
                  label="Welcome"
                  value={
                    form.welcomeMessage ||
                    `Hi! I'm the AI assistant for ${form.businessName}. How can I help you today?`
                  }
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm mb-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}

              <form onSubmit={handleSubmit}>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-slate-900 hover:bg-slate-100 font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={20} />
                      Launching & Training AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2" size={18} />
                      Launch My AI Assistant
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex gap-3">
      <span className="text-slate-500 w-24 shrink-0">{label}</span>
      <span className="text-white truncate">{value || '—'}</span>
    </div>
  );
}
