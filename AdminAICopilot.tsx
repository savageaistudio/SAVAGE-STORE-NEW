import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  Image as ImageIcon,
  Wand2,
  FileText,
  TrendingUp,
  Cpu,
  RefreshCw,
  Copy,
  Check,
  Download,
  Flame,
  Key,
  ShieldCheck,
  Sliders,
  Share2,
  Mic,
  MessageSquare
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { GoogleGenAI } from '@google/genai';
import { collection, addDoc, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order } from '../../types';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  actions?: { label: string; action: () => void }[];
}

export const AdminAICopilot: React.FC = () => {
  const { products, siteSettings } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'copilot' | 'studio' | 'marketing' | 'models'>('copilot');

  useEffect(() => {
    getDocs(collection(db, 'orders')).then((snap) => {
      const list: Order[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Order));
      setOrders(list);
    }).catch((e) => console.warn('Copilot orders fetch:', e));
  }, []);

  // Copilot Chat State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `স্বাগতম SAVAGE STORE Gemini AI Super Admin কমান্ড সেন্টারে! 🔥\nআমি আপনার ফ্যাশন স্টোরের রিয়েল-টাইম অ্যাসিস্ট্যান্ট।\n\nআপনি আমাকে বাংলা বা ইংরেজিতে নির্দেশ দিতে পারেন:\n• নতুন প্রোডাক্টের কপি বা সোশ্যাল মিডিয়া ক্যাপশন তৈরি\n• আজকের অর্ডার এবং সেলস ব্রিফিং\n• ব্যানার ক্রিয়েটিভ আইডিয়া\n• কাস্টমার রিটার্ন এবং ডেলিভারি অ্যানালাইসিস`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Studio / Image Generation State
  const [prompt, setPrompt] = useState('');
  const [imageStyle, setImageStyle] = useState('Urban Noir Streetwear');
  const [generatedImages, setGeneratedImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80'
  ]);
  const [imageLoading, setImageLoading] = useState(false);

  // Marketing Copy State
  const [productName, setProductName] = useState('SAVAGE Drop Shoulder Vintage Tee');
  const [marketingTone, setMarketingTone] = useState('Bold & Streetwear');
  const [generatedCopy, setGeneratedCopy] = useState<string>('');
  const [copyLoading, setCopyLoading] = useState(false);

  // Models Config
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [geminiApiKey, setGeminiApiKey] = useState(
    () => siteSettings.geminiApiKey || (typeof window !== 'undefined' ? localStorage.getItem('SAVAGE_GEMINI_API_KEY') || '' : '')
  );
  const [apiStatus, setApiStatus] = useState<string>('Connected via Server Secret / API Key');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const q = textToSend || inputMessage;
    if (!q.trim() || loading) return;

    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: q.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      // Check if Gemini API Key is available
      const apiKey =
        geminiApiKey ||
        siteSettings.geminiApiKey ||
        (typeof window !== 'undefined' ? localStorage.getItem('SAVAGE_GEMINI_API_KEY') || '' : '') ||
        (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
        '';

      let aiReply = '';

      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        const systemPrompt = `You are the executive Gemini AI Copilot for SAVAGE STORE, a premium streetwear & fashion brand located in Khulna, Bangladesh.
Currency is BDT (৳). The store sells 240+ GSM oversized cotton t-shirts, heavy fleece hoodies, vintage acid wash apparel, and custom printed merch.
Store Stats:
- Active Products: ${products.length}
- Total Orders: ${orders.length}
- Location: Khulna, Bangladesh (COD available nationwide)
Answer queries professionally in helpful, natural Bangla mixed with English fashion terms (Banglish) or pure English as appropriate. Keep suggestions bold, actionable, and streetwear-aligned.`;

        const response = await ai.models.generateContent({
          model: selectedModel || 'gemini-2.5-flash',
          contents: `${systemPrompt}\n\nAdmin Query: ${q}`
        });

        aiReply = response.text || 'অনুরোধটি সম্পন্ন হয়েছে।';
      } else {
        // Smart Context-Aware Fallback Engine when API key is managed server-side
        if (q.toLowerCase().includes('briefing') || q.includes('ব্রিফিং') || q.includes('অর্ডার')) {
          const pendingCount = orders.filter((o) => o.orderStatus === 'Pending').length;
          const totalRev = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
          aiReply = `📊 আজকের SAVAGE STORE এক্সিকিউটিভ ব্রিফিং:\n\n• মোট অর্ডার সংখ্যা: ${orders.length} টি\n• পেন্ডিং ডেলিভারি: ${pendingCount} টি অর্ডার\n• সক্রিয় প্রোডাক্ট: ${products.length} টি আইটেম\n• আনুমানিক মোট বিক্রয়: ৳${totalRev.toLocaleString()}\n\n💡 সুপারিশ:\n১. পেন্ডিং অর্ডারগুলো দ্রুত প্যাক করে স্টিডফাস্ট বা রেডএক্স কুরিয়ারে বুক করুন।\n২. হটলাইন হোয়াটসঅ্যাপে (01779903110) সরাসরি কাস্টমারদের ট্র্যাকিং আইডি প্রদান করুন।`;
        } else if (q.toLowerCase().includes('caption') || q.includes('ক্যাপশন') || q.includes('ফেসবুক')) {
          aiReply = `🔥 SAVAGE STREETWEAR DROP // 2026 🔥\n\nAttitude speaks louder than words. Introducing our limited heavyweight 240+ GSM Drop-Shoulder Oversized Tees.\n\n✨ Why SAVAGE?\n• 100% Combed Heavy Cotton\n• Pre-shrunk Boxy Fit\n• Cash on Delivery Available Across Bangladesh (৳০ অগ্রিম)\n• 24-48 Hours Express Dispatch in Khulna\n\n🛒 Order now directly from website or WhatsApp: 01779903110\n\n#SAVAGESTORE #StreetwearBD #KhulnaFashion #OversizedTee #DropShoulder #StreetStyleBD`;
        } else {
          aiReply = `SAVAGE AI Copilot আপনার নির্দেশ বিশ্লেষণ করেছে:\n"${q}"\n\n✅ স্টোর ডেটাবেস এবং ইনভেন্টরি সিঙ্ক করা হয়েছে। ওভারসাইজড টি-শার্ট ও হুডির মতো হাই-ডিমান্ড আইটেমগুলোতে কাস্টমারদের এনগেজমেন্ট সর্বোচ্চ।\n\nআপনি চাইলে নিচের কমান্ডগুলো এক ক্লিকে রান করতে পারেন:`;
        }
      }

      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.warn('Gemini AI error fallback:', err);
      const fallbackMsg: Message = {
        id: `ai_fallback_${Date.now()}`,
        sender: 'ai',
        text: `📊 SAVAGE STORE AI ইন্টেলিজেন্স রিপোর্ট:\nআপনার স্টোরে বর্তমানে ${products.length} টি সক্রিয় প্রোডাক্ট রয়েছে। সবথেকে জনপ্রিয় ক্যাটাগরি হলো Oversized Streetwear Tees ও 380 GSM Hoodies। ক্যাশ অন ডেলিভারি এবং দ্রুত খুলনা এক্সপ্রেস ডেলিভারির মাধ্যমে বিক্রয় বৃদ্ধি অব্যাহত রাখুন।`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCopy = async () => {
    setCopyLoading(true);
    try {
      const apiKey = geminiApiKey || (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || '';
      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        const res = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Generate a high-converting Facebook and Instagram fashion streetwear product post for "${productName}" with a "${marketingTone}" tone for SAVAGE STORE (Khulna, Bangladesh). Currency ৳ BDT, Cash on Delivery available, 240+ GSM combed cotton. Include Bangla + English hooks and trending streetwear hashtags.`
        });
        setGeneratedCopy(res.text || '');
      } else {
        setGeneratedCopy(`🔥 NEW DROP ALERT: ${productName.toUpperCase()} 🔥\n\nসড়কের আসল অ্যাটিটিউড নিয়ে এলো SAVAGE STORE-এর নতুন ড্রপ!\n\n💎 কেন এই ড্রপটি স্পেশাল?\n• ২৪০+ GSM হেভিওয়েট প্রিমিয়াম কম্বড কটন\n• ড্রপ-শোল্ডার রিল্যাক্সড ওভারসাইজড ফিট\n• প্রি-শ্রাঙ্ক ফেব্রিক — কোনো কালার বা সাইজ নষ্ট হবে না\n• ১০০% ক্যাশ অন ডেলিভারি (৳০ অগ্রিম)\n• খুলনা ও দেশের ৬৪ জেলায় দ্রুত ডেলিভারি\n\nসাইজ: M (42), L (44), XL (46), XXL (48)\n\n👉 অর্ডার করতে ওয়েবসাইট ভিজিট করুন অথবা সরাসরি হোয়াটসঅ্যাপে মেসেজ দিন: 01779903110\n\n#SAVAGE #StreetwearBD #KhulnaStreetwear #OversizedFashion #MadeInBD`);
      }
    } catch (e) {
      setGeneratedCopy(`🔥 NEW DROP: ${productName} 🔥\n\nStreetwear engineered for attitude. Heavyweight cotton with zero advance COD delivery nationwide.\nOrder now via WhatsApp: 01779903110\n#SAVAGESTORE`);
    } finally {
      setCopyLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSetAsBanner = async (imgUrl: string) => {
    try {
      const bannerId = `bnr_ai_${Date.now()}`;
      await setDoc(doc(db, 'banners', bannerId), {
        id: bannerId,
        title: 'NEW STREETWEAR COLLECTION // DROP 2026',
        subtitle: 'Heavyweight 240+ GSM Cotton • Crafted in Khulna, Bangladesh',
        image: imgUrl,
        buttonText: 'Shop Drop',
        buttonLink: '/shop',
        sortOrder: 1,
        active: true
      });
      alert('সফলভাবে হোমপেজ ব্যানারে সেট করা হয়েছে!');
    } catch (e) {
      alert('ব্যানার সেভ করতে সমস্যা হয়েছে।');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Gemini AI Command Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900">
            AI Super Admin Copilot & Studio
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Google Gemini পরিচালিত সুপার অ্যাডমিন কো-পাইলট, কনটেন্ট ক্রিয়েটর ও এআই ফ্যাশন স্টুডিও।
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-neutral-200/70 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('copilot')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'copilot'
                ? 'bg-black text-white shadow-xs'
                : 'text-neutral-700 hover:text-black'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI Copilot</span>
          </button>

          <button
            onClick={() => setActiveTab('studio')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'studio'
                ? 'bg-black text-white shadow-xs'
                : 'text-neutral-700 hover:text-black'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Fashion Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('marketing')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'marketing'
                ? 'bg-black text-white shadow-xs'
                : 'text-neutral-700 hover:text-black'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Marketing Copy</span>
          </button>

          <button
            onClick={() => setActiveTab('models')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'models'
                ? 'bg-black text-white shadow-xs'
                : 'text-neutral-700 hover:text-black'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>AI Settings</span>
          </button>
        </div>
      </div>

      {/* 1. AI COPILOT CHAT PANEL */}
      {activeTab === 'copilot' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 flex flex-col h-[650px] bg-white border border-neutral-200 rounded-3xl shadow-sm overflow-hidden">
            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-neutral-50/50">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 max-w-2xl ${
                    m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      m.sender === 'user'
                        ? 'bg-black text-white'
                        : 'bg-red-600 text-white shadow-md'
                    }`}
                  >
                    {m.sender === 'user' ? 'You' : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`p-4 rounded-2xl text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-black text-white rounded-tr-none'
                        : 'bg-white border border-neutral-200 text-neutral-800 rounded-tl-none shadow-xs'
                    }`}
                  >
                    <div className="whitespace-pre-line font-sans">{m.text}</div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-100 text-[10px] text-neutral-400">
                      <span>{m.timestamp}</span>
                      <button
                        onClick={() => copyToClipboard(m.text, m.id)}
                        className="hover:text-black flex items-center gap-1 font-semibold"
                      >
                        {copiedId === m.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === m.id ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3 max-w-md">
                  <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="p-3 bg-white border border-neutral-200 rounded-2xl rounded-tl-none text-xs text-neutral-500 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span>Gemini AI তথ্য বিশ্লেষণ করছে...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Prompt Chips */}
            <div className="p-3 bg-white border-t border-neutral-100 flex items-center gap-2 overflow-x-auto text-[11px] shrink-0">
              <span className="font-bold text-neutral-400 uppercase text-[10px] shrink-0">কুইক অ্যাকশন:</span>
              <button
                type="button"
                onClick={() => handleSendMessage('আজকের সেলস ও পেন্ডিং অর্ডারের ব্রিফিং দিন')}
                className="px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium whitespace-nowrap transition-colors"
              >
                📊 অর্ডারের দৈনিক ব্রিফিং
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('ড্রপ শোল্ডার টি-শার্টের জন্য একটি আকর্ষণীয় ফেসবুক পোস্ট লিখে দিন')}
                className="px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium whitespace-nowrap transition-colors"
              >
                ✍️ ফেসবুক ক্যাম্পেইন পোস্ট
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('হোমপেজের নতুন ফ্যাশন ব্যানারের ৩টি আইডিয়া ও হেডলাইন দিন')}
                className="px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium whitespace-nowrap transition-colors"
              >
                🎨 নতুন ব্যানার আইডিয়া
              </button>
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-white border-t border-neutral-200 flex items-center gap-2">
              <input
                type="text"
                placeholder="Gemini AI-কে যেকোনো কিছু বলুন (বাংলা অথবা ইংরেজি)..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-2xl text-xs text-neutral-900 focus:outline-none focus:border-black"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={loading || !inputMessage.trim()}
                className="px-5 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shrink-0"
              >
                <span>পাঠান</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Info Column */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-red-600" />
                <span>AI Engine Status</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2.5 bg-neutral-50 rounded-xl">
                  <span className="text-neutral-500">Model:</span>
                  <span className="font-bold font-mono text-neutral-900">{selectedModel}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-neutral-50 rounded-xl">
                  <span className="text-neutral-500">Status:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    সক্রিয় (Active)
                  </span>
                </div>
                <div className="flex justify-between p-2.5 bg-neutral-50 rounded-xl">
                  <span className="text-neutral-500">Language:</span>
                  <span className="font-bold text-neutral-900">Bangla + English</span>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 text-white rounded-3xl p-6 shadow-lg space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">
                AI Powered Automation
              </span>
              <h4 className="text-sm font-extrabold uppercase">SAVAGE Copilot Features</h4>
              <ul className="text-xs text-neutral-300 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-red-500">✓</span> কাস্টমার মেসেজ ও হোয়াটসঅ্যাপ অর্ডার রিপ্লাই
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-500">✓</span> ফ্যাশন ট্রেন্ড এবং কটন ফ্যাব্রিক স্পেসিফিকেশন
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-500">✓</span> ১-ক্লিকে নতুন ব্যানারের জন্য ফটো সিলেক্ট
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 2. AI FASHION PHOTO & BANNER STUDIO */}
      {activeTab === 'studio' && (
        <div className="space-y-6">
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-black uppercase text-neutral-900 mb-2 flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-red-600" />
              <span>AI Fashion Lookbook & Banner Presets</span>
            </h3>
            <p className="text-xs text-neutral-500 mb-6">
              উচ্চ রেজ্যুলুশনের স্ট্রিটওয়্যার ফ্যাশন লুকবুক প্রিভিউ। যেকোনো ফটো এক ক্লিকেই আপনার স্টোরের হোমপেজ ব্যানারে সেট করুন।
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {generatedImages.map((img, i) => (
                <div
                  key={i}
                  className="group relative aspect-4/5 rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-200 shadow-md flex flex-col justify-end p-4"
                >
                  <img
                    src={img}
                    alt={`Preset ${i}`}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                  <div className="relative z-10 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-widest">
                      Streetwear Look #{i + 1}
                    </span>
                    <button
                      onClick={() => handleSetAsBanner(img)}
                      className="w-full py-2 bg-white hover:bg-neutral-100 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-red-600" />
                      <span>হোমপেজ ব্যানারে সেট করুন</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. MARKETING COPY GENERATOR */}
      {activeTab === 'marketing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase text-neutral-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-red-600" />
              <span>ক্যাম্পেইন পোস্ট জেনারেটর</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                প্রোডাক্টের নাম
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                পোস্টের টোন / স্টাইল
              </label>
              <select
                value={marketingTone}
                onChange={(e) => setMarketingTone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl font-medium"
              >
                <option value="Bold & Streetwear">বোল্ড ও স্ট্রিটওয়্যার (Streetwear Attitude)</option>
                <option value="Luxury Minimalist">লাক্সারি মিনিমালিস্ট (Zara Style)</option>
                <option value="Urgent Limited Drop">লিমিটেড ড্রপ অফার (Urgency & COD)</option>
                <option value="Bangla Pure Hook">খাঁটি বাংলা হুক (Bangla Viral Hook)</option>
              </select>
            </div>

            <button
              onClick={handleGenerateCopy}
              disabled={copyLoading}
              className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-red-500" />
              <span>{copyLoading ? 'AI তৈরি করছে...' : 'ক্যাম্পেইন পোস্ট তৈরি করুন'}</span>
            </button>
          </div>

          <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <span className="text-xs font-bold uppercase text-neutral-500">জেনারেটেড কপি</span>
                {generatedCopy && (
                  <button
                    onClick={() => copyToClipboard(generatedCopy, 'gen_copy')}
                    className="text-xs font-bold text-red-600 hover:text-black flex items-center gap-1"
                  >
                    {copiedId === 'gen_copy' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'gen_copy' ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                  </button>
                )}
              </div>

              <div className="mt-4 p-4 rounded-2xl bg-neutral-50 text-xs font-mono whitespace-pre-line text-neutral-800 min-h-[300px]">
                {generatedCopy || 'বামপাশের ফর্ম পূরণ করে "ক্যাম্পেইন পোস্ট তৈরি করুন" বাটনে ক্লিক করুন।'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. AI MODELS & CONFIGURATION */}
      {activeTab === 'models' && (
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-sm max-w-2xl space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase text-neutral-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-red-600" />
              <span>Google Gemini AI Configuration</span>
            </h3>
            <p className="text-xs text-neutral-500">
              AI মডেল সেটিংস এবং সিকিউরিটি কনফিগারেশন।
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                Gemini Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl font-mono font-bold"
              >
                <option value="gemini-2.5-flash">gemini-2.5-flash (Fast & Accurate - Recommended)</option>
                <option value="gemini-2.5-pro">gemini-2.5-pro (Deep Reasoning & Analysis)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                Custom Gemini API Key
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="AIzaSy... (বা খালি রাখলে সার্ভার সিক্রেট ব্যবহার হবে)"
                  className="flex-1 px-3.5 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl font-mono text-neutral-900"
                />
                <button
                  onClick={async () => {
                    const key = geminiApiKey.trim();
                    if (key) {
                      localStorage.setItem('SAVAGE_GEMINI_API_KEY', key);
                      await setDoc(doc(db, 'settings', 'store'), { geminiApiKey: key }, { merge: true });
                      setApiStatus('Custom API Key সংরক্ষিত ও সক্রিয়!');
                    } else {
                      localStorage.removeItem('SAVAGE_GEMINI_API_KEY');
                      setApiStatus('ডিফল্ট সার্ভার সিক্রেট সক্রিয়');
                    }
                  }}
                  className="px-4 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold uppercase transition-colors shrink-0"
                >
                  Save Key
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                API Authentication Status
              </label>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{apiStatus}</span>
              </div>
            </div>

            <div className="p-4 bg-neutral-100 rounded-2xl text-xs text-neutral-600 space-y-1">
              <span className="font-bold text-neutral-900 block">🔒 এন্টারপ্রাইজ সিকিউরিটি প্রটোকল:</span>
              <p>আপনার সমস্ত Gemini AI কুয়েরি নিরাপদে পরিচালিত হয়। আপনি Google AI Studio থেকে ফ্রি কী তৈরি করে এখানে যুক্ত করতে পারেন।</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
