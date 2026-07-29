import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { MessageSquare, X, Send, Sparkles, Copy, Check, ExternalLink } from 'lucide-react';

const API_BASE = 'http://localhost:5000';

export default function WidgetEmbed() {
  const [searchParams] = useSearchParams();
  const botId = searchParams.get('botId');

  const [isOpen, setIsOpen] = useState(false);
  const [botMeta, setBotMeta] = useState({
    businessName: 'AI Assistant',
    welcomeMessage: 'Hi! How can I help you today?',
    colorScheme: '#3B82F6',
  });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const messagesEndRef = useRef(null);

  // Fetch Bot Metadata
  useEffect(() => {
    if (!botId) return;

    const fetchBotMeta = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/bots/${botId}`);
        if (res.data) {
          const fetchedMeta = {
            businessName: res.data.name || res.data.businessName || 'AI Assistant',
            welcomeMessage: res.data.welcomeMessage || 'Hi! How can I help you today?',
            colorScheme: res.data.colorScheme || '#3B82F6',
          };
          setBotMeta(fetchedMeta);
          setMessages([{ sender: 'bot', text: fetchedMeta.welcomeMessage }]);
        }
      } catch (err) {
        console.warn('RAG Widget: Could not fetch bot metadata, using defaults', err);
        setMessages([{ sender: 'bot', text: 'Hi! How can I help you today?' }]);
      }
    };

    fetchBotMeta();
  }, [botId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Notify parent window whenever isOpen state changes (including initial mount)
  useEffect(() => {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'RAG_WIDGET_STATE', isOpen }, '*');
    }
  }, [isOpen]);

  const toggleWidget = (state) => {
    const newState = state !== undefined ? state : !isOpen;
    setIsOpen(newState);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);
    setLoading(true);

    const chatHistory = messages
      .filter((m) => m.sender === 'user' || m.sender === 'bot')
      .slice(-10)
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

    try {
      const res = await axios.post(`${API_BASE}/api/chat`, {
        botId,
        message: userMessage,
        chatHistory,
      });

      const botReply = res.data.reply || 'Sorry, I encountered an issue. Please try again.';
      setMessages((prev) => [...prev, { sender: 'bot', text: botReply }]);
    } catch (err) {
      console.error('Widget send error:', err);
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: "I'm having trouble connecting right now. Please try again in a moment." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const formatMarkdown = (text) => {
    if (!text) return null;
    let t = String(text).replace(/\r\n/g, '\n');

    const codeBlocks = [];
    t = t.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_, lang, code) => {
      const id = `__CODE_BLOCK_${codeBlocks.length}__`;
      codeBlocks.push({ lang: lang || 'code', code: code.trim() });
      return id;
    });

    const lines = t.split('\n');
    return (
      <div className="space-y-2 text-sm leading-relaxed">
        {lines.map((line, idx) => {
          if (line.includes('__CODE_BLOCK_')) {
            const blockIdx = parseInt(line.replace('__CODE_BLOCK_', '').replace('__', ''), 10);
            const block = codeBlocks[blockIdx];
            if (!block) return null;

            return (
              <div key={idx} className="my-2 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 text-xs shadow-md">
                <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800/80 text-slate-400 font-mono text-[11px]">
                  <span>{block.lang}</span>
                  <button
                    onClick={() => copyCode(block.code, `${idx}-${blockIdx}`)}
                    className="flex items-center space-x-1 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedIndex === `${idx}-${blockIdx}` ? (
                      <Check size={13} className="text-green-400" />
                    ) : (
                      <Copy size={13} />
                    )}
                    <span>{copiedIndex === `${idx}-${blockIdx}` ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 overflow-x-auto text-slate-100 font-mono text-[12px] leading-snug">
                  <code>{block.code}</code>
                </pre>
              </div>
            );
          }

          if (line.startsWith('# ')) {
            return <h1 key={idx} className="text-base font-bold text-slate-900 dark:text-white mt-2 mb-1">{line.replace('# ', '')}</h1>;
          }
          if (line.startsWith('## ')) {
            return <h2 key={idx} className="text-sm font-semibold text-slate-900 dark:text-white mt-2 mb-1">{line.replace('## ', '')}</h2>;
          }
          if (line.startsWith('### ')) {
            return <h3 key={idx} className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">{line.replace('### ', '')}</h3>;
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <li key={idx} className="ml-4 list-disc text-slate-700 dark:text-slate-200">
                {renderInline(line.substring(2))}
              </li>
            );
          }
          if (/^\d+\.\s+/.test(line)) {
            return (
              <li key={idx} className="ml-4 list-decimal text-slate-700 dark:text-slate-200">
                {renderInline(line.replace(/^\d+\.\s+/, ''))}
              </li>
            );
          }

          if (!line.trim()) return <div key={idx} className="h-1" />;

          return (
            <p key={idx} className="text-slate-800 dark:text-slate-100">
              {renderInline(line)}
            </p>
          );
        })}
      </div>
    );
  };

  const renderInline = (text) => {
    if (!text) return null;

    const tokenRegex = /(`[^`]+`|\[[\s\S]*?\]\(https?:\/\/[^\s)]+\)|\*\*[^*]+\*\*|\*[^*]+\*)/g;
    const parts = text.split(tokenRegex);

    return parts.map((part, i) => {
      if (!part) return null;

      // Inline code `code`
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        return (
          <code key={i} className="bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-1.5 py-0.5 rounded text-[12px] font-mono border border-slate-300 dark:border-slate-700">
            {part.slice(1, -1)}
          </code>
        );
      }

      // Markdown Link [Text](URL)
      const linkMatch = part.match(/^\[([\s\S]*)\]\((https?:\/\/[^\s)]+)\)$/);
      if (linkMatch) {
        const [, linkText, linkUrl] = linkMatch;
        return (
          <a
            key={i}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium inline-flex items-center gap-1 cursor-pointer underline-offset-2"
          >
            <span>{renderInline(linkText)}</span>
            <ExternalLink size={12} className="inline shrink-0 opacity-80" />
          </a>
        );
      }

      // Bold **text**
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return (
          <strong key={i} className="font-semibold text-slate-900 dark:text-white">
            {renderInline(part.slice(2, -2))}
          </strong>
        );
      }

      // Italic *text*
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return (
          <em key={i} className="italic">
            {renderInline(part.slice(1, -1))}
          </em>
        );
      }

      return part;
    });
  };

  const primaryColor = botMeta.colorScheme || '#3B82F6';

  return (
    <div className="w-screen h-screen p-0 m-0 overflow-hidden flex flex-col justify-end items-end font-sans bg-transparent">
      {!isOpen ? (
        /* Floating Launcher Button (Fits inside 75x75 iframe) */
        <div className="w-full h-full flex items-end justify-end p-2">
          <button
            onClick={() => toggleWidget(true)}
            style={{ backgroundColor: primaryColor }}
            className="w-14 h-14 rounded-full text-white shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer group"
            title="Chat with us"
          >
            <MessageSquare className="w-7 h-7 transition-transform group-hover:rotate-6" />
          </button>
        </div>
      ) : (
        /* Full Chat Window (Fills 100% width and height of 410x640 iframe) */
        <div className="w-full h-full flex flex-col bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}
            className="p-4 text-white flex items-center justify-between shadow-md flex-shrink-0"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-lg font-bold border border-white/30 shadow-inner">
                🤖
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight drop-shadow-sm">{botMeta.businessName}</h3>
                <div className="flex items-center space-x-1.5 text-xs text-white/90 mt-0.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Online · RAG AI</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => toggleWidget(false)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition-colors cursor-pointer"
              title="Close chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Chat Messages (Fills remaining height flex-1) */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50 dark:bg-slate-950/50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-200`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'text-white rounded-br-none shadow-md font-medium text-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200/80 dark:border-slate-800 shadow-sm'
                  }`}
                  style={msg.sender === 'user' ? { backgroundColor: primaryColor } : {}}
                >
                  {msg.sender === 'user' ? msg.text : formatMarkdown(msg.text)}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex justify-start animate-in fade-in duration-200">
                <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl rounded-bl-none border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area (Stays pinned at bottom) */}
          <div className="p-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
            <form onSubmit={handleSend} className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                disabled={loading}
                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-2.5 rounded-full text-sm outline-none border border-transparent focus:border-blue-500/50 dark:focus:border-blue-500/50 transition-all placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                style={{ backgroundColor: primaryColor }}
                className="w-10 h-10 rounded-full text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer flex-shrink-0"
              >
                <Send size={16} />
              </button>
            </form>
            <div className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-2 font-medium flex items-center justify-center gap-1">
              <Sparkles size={10} /> Powered by RAG AI Assistant
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
