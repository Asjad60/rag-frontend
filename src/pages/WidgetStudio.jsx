import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Code, Copy, Check, Eye, Globe, ExternalLink, Sparkles } from 'lucide-react';

export default function WidgetStudio() {
  const [bots, setBots] = useState([]);
  const [selectedBotId, setSelectedBotId] = useState('');
  const [copied, setCopied] = useState(false);
  const [activePlatform, setActivePlatform] = useState('html');

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
        if (res.data && res.data.length > 0) {
          setSelectedBotId(res.data[0]._id);
        }
      } catch (err) {
        console.error('Failed to fetch bots:', err);
      }
    };
    fetchBots();
  }, [userId, navigate]);

  const scriptOrigin = window.location.origin;
  const embedSnippet = selectedBotId
    ? `<script src="${scriptOrigin}/widget-loader.js" data-bot-id="${selectedBotId}"></script>`
    : '<!-- Select a bot to generate code -->';

  const copySnippet = () => {
    if (!selectedBotId) return;
    navigator.clipboard.writeText(embedSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            className="w-full flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors text-left"
          >
            <MessageSquare size={18} />
            <span className="font-medium">My Bots</span>
          </button>
          <button
            onClick={() => navigate('/widget')}
            className="w-full flex items-center space-x-3 px-4 py-3 bg-blue-500/10 text-blue-400 rounded-xl transition-colors text-left font-medium"
          >
            <Code size={18} />
            <span className="font-medium">Widget Studio</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                Widget Studio <Sparkles className="text-blue-400" size={24} />
              </h1>
              <p className="text-slate-400 mt-1">
                Customize, preview, and embed your production RAG Chatbot widget.
              </p>
            </div>

            {/* Bot Picker */}
            {bots.length > 0 && (
              <div className="flex items-center space-x-3 bg-slate-800/80 border border-slate-700/60 p-2 rounded-2xl backdrop-blur-md">
                <span className="text-xs text-slate-400 font-semibold px-2">Active Bot:</span>
                <select
                  value={selectedBotId}
                  onChange={(e) => setSelectedBotId(e.target.value)}
                  className="bg-slate-900 text-white font-medium text-sm px-3 py-1.5 rounded-xl border border-slate-700 outline-none focus:border-blue-500"
                >
                  {bots.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name || b.businessName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {bots.length === 0 ? (
            <div className="py-16 text-center bg-slate-800/20 rounded-3xl border border-slate-800 border-dashed">
              <MessageSquare size={48} className="mx-auto text-slate-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Bots Found</h3>
              <p className="text-slate-400 max-w-md mx-auto mb-6">
                Create your first AI assistant before configuring the embed widget.
              </p>
              <button
                onClick={() => navigate('/onboarding')}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium transition-all"
              >
                Create Bot
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Embed Code & Platform Setup */}
              <div className="lg:col-span-7 space-y-6">
                {/* Embed Snippet Card */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 backdrop-blur-md shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 text-white font-bold text-lg">
                      <Code size={20} className="text-blue-400" />
                      <span>Production Script Embed</span>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                      Iframe Isolated
                    </span>
                  </div>

                  <p className="text-sm text-slate-400 mb-4">
                    Copy and paste this single script tag into the HTML of your website before the closing{' '}
                    <code className="text-blue-300 font-mono">&lt;/body&gt;</code> tag.
                  </p>

                  <div className="relative group">
                    <pre className="bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-x-auto text-sm text-blue-300 font-mono leading-relaxed select-all">
                      {embedSnippet}
                    </pre>
                    <button
                      onClick={copySnippet}
                      className="absolute top-3 right-3 p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all shadow-md flex items-center space-x-1 text-xs font-semibold"
                    >
                      {copied ? (
                        <>
                          <Check size={14} className="text-green-400" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Platform Integration Guide */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 backdrop-blur-md">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Globe size={18} className="text-purple-400" /> Platform Integration Guide
                  </h3>

                  <div className="flex space-x-2 border-b border-slate-700/60 pb-3 mb-4">
                    {['html', 'react', 'wordpress', 'webflow'].map((plat) => (
                      <button
                        key={plat}
                        onClick={() => setActivePlatform(plat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                          activePlatform === plat
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        {plat}
                      </button>
                    ))}
                  </div>

                  <div className="text-sm text-slate-300 leading-relaxed">
                    {activePlatform === 'html' && (
                      <p>
                        Add the script tag right before the closing <code className="text-blue-300">&lt;/body&gt;</code> tag in your <code className="text-blue-300">index.html</code> file.
                      </p>
                    )}
                    {activePlatform === 'react' && (
                      <p>
                        In Next.js or React, insert the snippet using Next.js <code className="text-blue-300">&lt;Script&gt;</code> component or standard <code className="text-blue-300">useEffect</code> script injection.
                      </p>
                    )}
                    {activePlatform === 'wordpress' && (
                      <p>
                        Use a plugin like "Insert Headers and Footers" or paste the code into your active theme's <code className="text-blue-300">footer.php</code> file.
                      </p>
                    )}
                    {activePlatform === 'webflow' && (
                      <p>
                        Go to Site Settings &rarr; Custom Code &rarr; Footer Code, paste the snippet, and publish your site.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Live Iframe Sandbox Preview */}
              <div className="lg:col-span-5">
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 backdrop-blur-md h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 text-white font-bold text-lg">
                      <Eye size={20} className="text-emerald-400" />
                      <span>Live Sandbox Preview</span>
                    </div>
                    <a
                      href={`${scriptOrigin}/widget-embed?botId=${selectedBotId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                    >
                      Open Full Page <ExternalLink size={12} />
                    </a>
                  </div>

                  <p className="text-xs text-slate-400 mb-4">
                    Interact directly with your bot inside the live preview window below.
                  </p>

                  <div className="flex-1 min-h-[580px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative shadow-2xl flex items-center justify-center">
                    {selectedBotId ? (
                      <iframe
                        src={`${scriptOrigin}/widget-embed?botId=${selectedBotId}`}
                        title="Live Widget Sandbox"
                        className="w-full h-full border-none"
                      />
                    ) : (
                      <div className="text-slate-500 text-sm">Select a bot to load preview</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
