import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, MessageSquare, Plus, Check, Copy, Trash2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [bots, setBots] = useState([]);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(null); // botId being deleted
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }
    const fetchBots = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/bots/user/${userId}`);
        setBots(res.data || []);
      } catch (err) {
        console.error('Failed to fetch bots:', err);
      }
    };
    fetchBots();
  }, [userId, navigate]);

  const scriptOrigin = window.location.origin;

  const copySnippet = (botId) => {
    const snippet = `<script src="${scriptOrigin}/widget-loader.js" data-bot-id="${botId}"></script>`;
    navigator.clipboard.writeText(snippet);
    setCopied(botId);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteBot = async (bot) => {
    const confirmed = window.confirm(
      `Delete "${bot.name}"?\n\nThis will permanently remove the bot, all its scraped data, and its Qdrant vector collection. This cannot be undone.`
    );
    if (!confirmed) return;

    setDeleting(bot._id);
    try {
      await axios.delete(`http://localhost:5000/api/bots/${bot._id}`);
      setBots((prev) => prev.filter((b) => b._id !== bot._id));
    } catch (err) {
      console.error('Failed to delete bot:', err);
      alert('Failed to delete bot. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-900 text-white font-sans">
      {/* Sidebar */}
      <div className="w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl p-6 hidden md:block">
        <div className="flex items-center space-x-3 mb-10">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <MessageSquare size={18} className="text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">RAG SaaS</span>
        </div>

        <nav className="space-y-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center space-x-3 px-4 py-3 bg-blue-500/10 text-blue-400 rounded-xl transition-colors text-left font-medium"
          >
            <MessageSquare size={18} />
            <span className="font-medium">My Bots</span>
          </button>
          <button
            onClick={() => navigate('/widget')}
            className="w-full flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors text-left"
          >
            <Code size={18} />
            <span className="font-medium">Widget Studio</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
              <p className="text-slate-400">Manage your AI assistants and embed integrations.</p>
            </div>
            <button
              onClick={() => navigate('/onboarding')}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center font-medium transition-colors shadow-lg shadow-blue-500/20 cursor-pointer"
            >
              <Plus size={18} className="mr-2" />
              New Bot
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatePresence>
              {bots.map((bot, index) => (
                <motion.div
                  key={bot._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 min-w-0 pr-3">
                        <h3 className="text-xl font-bold text-white truncate">{bot.name}</h3>
                        <p className="text-sm text-slate-400 mt-1 line-clamp-2">{bot.description}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-semibold rounded-full border border-green-500/20">
                          Active
                        </div>
                        {/* Delete button */}
                        <button
                          onClick={() => handleDeleteBot(bot)}
                          disabled={deleting === bot._id}
                          title="Delete bot"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {deleting === bot._id ? <span className="text-xs text-slate-400">…</span> : <Trash2 size={15} />}
                        </button>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-slate-300 flex items-center">
                          <Code size={16} className="mr-2 text-slate-400" />
                          Embed Snippet
                        </p>
                        <button
                          onClick={() => navigate('/widget')}
                          className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                        >
                          Widget Studio <ExternalLink size={12} />
                        </button>
                      </div>

                      <div className="relative group">
                        <pre className="bg-slate-900 border border-slate-700 rounded-xl p-4 overflow-x-auto text-xs text-blue-300 font-mono select-all">
                          &lt;script src="{scriptOrigin}/widget-loader.js" data-bot-id="{bot._id}"&gt;&lt;/script&gt;
                        </pre>
                        <button
                          onClick={() => copySnippet(bot._id)}
                          className="absolute top-1/2 -translate-y-1/2 right-3 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                        >
                          {copied === bot._id ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        Paste this snippet before the closing &lt;/body&gt; tag on your website.
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {bots.length === 0 && (
              <div className="col-span-full py-12 text-center bg-slate-800/20 rounded-2xl border border-slate-800 border-dashed">
                <MessageSquare size={48} className="mx-auto text-slate-600 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No bots yet</h3>
                <p className="text-slate-400 max-w-md mx-auto mb-6">
                  Create your first AI assistant to start answering customer queries automatically.
                </p>
                <button
                  onClick={() => navigate('/onboarding')}
                  className="bg-white text-slate-900 px-6 py-2 rounded-xl font-medium hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Create Bot
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
