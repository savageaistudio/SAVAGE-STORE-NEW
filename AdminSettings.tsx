import React, { useState, useRef } from 'react';
import { Settings, Save, Check, AlertCircle, Upload, ShieldCheck, Lock, Image as ImageIcon, KeyRound, Sparkles, Key, ExternalLink, RefreshCw } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db, OFFICIAL_LOGO_PATH } from '../../lib/firebase';
import { uploadImageWithFallback } from '../../lib/imageUpload';
import { useStore } from '../../context/StoreContext';
import { SiteSettings } from '../../types';
import { GoogleGenAI } from '@google/genai';

export const AdminSettings: React.FC = () => {
  const { siteSettings } = useStore();

  const [form, setForm] = useState<SiteSettings>({
    storeName: siteSettings.storeName || 'SAVAGE STORE',
    description: siteSettings.description || 'This is a store',
    phone: siteSettings.phone || '01779903110',
    email: siteSettings.email || 'strvboys512@gmail.com',
    address: siteSettings.address || 'Bangladesh khulna',
    whatsapp: siteSettings.whatsapp || '01779903110',
    facebook: siteSettings.facebook || 'https://www.facebook.com/share/18yXhMfd5u/',
    instagram: siteSettings.instagram || 'https://www.instagram.com/savage20.26?obrf=MXRlMmViYXBvczB0eg==',
    tiktok: siteSettings.tiktok || 'tiktok.com/@savage.2245',
    youtube: siteSettings.youtube || 'https://youtube.com/@savage20-26?si=CRoWEnRbKesN0AI8',
    deliveryArea: siteSettings.deliveryArea || 'Khulna',
    currency: siteSettings.currency || '৳',
    announcement: siteSettings.announcement || '⚡ Fast delivery across Khulna & nationwide. Cash on Delivery available!',
    returnPolicyDays: siteSettings.returnPolicyDays || 7,
    logoUrl: siteSettings.logoUrl || OFFICIAL_LOGO_PATH,
    faviconUrl: siteSettings.faviconUrl || OFFICIAL_LOGO_PATH,
    adminPin: siteSettings.adminPin || '202622',
    geminiApiKey: siteSettings.geminiApiKey || (typeof window !== 'undefined' ? localStorage.getItem('SAVAGE_GEMINI_API_KEY') || '' : ''),
  });

  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [testingApiKey, setTestingApiKey] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<{ status: 'idle' | 'success' | 'error'; message: string }>({
    status: 'idle',
    message: ''
  });
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const url = await uploadImageWithFallback(file, 'branding');
      setForm((prev) => ({ ...prev, logoUrl: url }));
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload store logo.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleUploadFavicon = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFavicon(true);
    try {
      const url = await uploadImageWithFallback(file, 'branding');
      setForm((prev) => ({ ...prev, faviconUrl: url }));
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload favicon.');
    } finally {
      setUploadingFavicon(false);
    }
  };

  const handleChange = (field: keyof SiteSettings, val: any) => {
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const handleTestGeminiKey = async () => {
    const key = form.geminiApiKey?.trim();
    if (!key) {
      setApiTestResult({ status: 'error', message: 'অনুগ্রহ করে প্রথমে একটি Gemini API Key ইনপুট দিন।' });
      return;
    }
    setTestingApiKey(true);
    setApiTestResult({ status: 'idle', message: '' });
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const resp = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Test connection for SAVAGE STORE fashion platform. Reply with: SAVAGE_AI_CONNECTED',
      });
      if (resp && resp.text) {
        setApiTestResult({
          status: 'success',
          message: `API Key সফলভাবে সংযুক্ত হয়েছে! AI রেসপন্স: ${resp.text.slice(0, 50)}...`,
        });
        localStorage.setItem('SAVAGE_GEMINI_API_KEY', key);
      } else {
        setApiTestResult({ status: 'error', message: 'API কোনো উত্তর দেয়নি।' });
      }
    } catch (err: any) {
      setApiTestResult({
        status: 'error',
        message: err.message || 'API Key পরীক্ষা ব্যর্থ হয়েছে। কী যাচাই করুন।',
      });
    } finally {
      setTestingApiKey(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccess(false);

    try {
      if (form.geminiApiKey) {
        localStorage.setItem('SAVAGE_GEMINI_API_KEY', form.geminiApiKey.trim());
      }
      await setDoc(doc(db, 'settings', 'store'), form, { merge: true });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Settings save error:', err);
      setErrorMsg(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-red-600">Preferences</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-neutral-900">
          Global Store Settings
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Configure business contacts, social media channels, and announcement banner text.
        </p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Store settings successfully updated in Firestore!</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Store Branding & Imagery */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-red-600" />
            <span>1. Store Logo & Favicon Assets</span>
          </h3>
          <p className="text-xs text-neutral-500">
            Upload custom store branding images with automatic compression and storage sync.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {/* Store Official Logo */}
            <div className="p-4 border border-neutral-200 rounded-2xl space-y-3 bg-neutral-50/50">
              <label className="block text-xs font-bold text-neutral-700 uppercase">
                Official Store Logo
              </label>
              <div className="flex items-center gap-4">
                <img
                  src={form.logoUrl || OFFICIAL_LOGO_PATH}
                  alt="Store Logo Preview"
                  className="w-16 h-16 rounded-full object-cover border-2 border-red-600 shadow-xs bg-white"
                />
                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    ref={logoInputRef}
                    onChange={handleUploadLogo}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadingLogo}
                    className="w-full py-2 px-3 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingLogo ? 'Uploading...' : 'Upload New Logo'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('logoUrl', OFFICIAL_LOGO_PATH)}
                    className="w-full text-center text-[10px] text-neutral-500 hover:text-red-600 font-semibold underline"
                  >
                    Reset to Default SAVAGE Crown
                  </button>
                </div>
              </div>
            </div>

            {/* Store Favicon */}
            <div className="p-4 border border-neutral-200 rounded-2xl space-y-3 bg-neutral-50/50">
              <label className="block text-xs font-bold text-neutral-700 uppercase">
                Browser Tab Favicon
              </label>
              <div className="flex items-center gap-4">
                <img
                  src={form.faviconUrl || OFFICIAL_LOGO_PATH}
                  alt="Favicon Preview"
                  className="w-12 h-12 rounded-lg object-cover border border-neutral-300 shadow-xs bg-white p-1"
                />
                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    ref={faviconInputRef}
                    onChange={handleUploadFavicon}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => faviconInputRef.current?.click()}
                    disabled={uploadingFavicon}
                    className="w-full py-2 px-3 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingFavicon ? 'Uploading...' : 'Upload Favicon'}</span>
                  </button>
                  <p className="text-[10px] text-neutral-400 text-center">
                    Square PNG or ICO recommended
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* General Store Identity */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
            2. Store Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Store Name</label>
              <input
                type="text"
                required
                value={form.storeName}
                onChange={(e) => handleChange('storeName', e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black font-semibold text-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Currency Symbol</label>
              <input
                type="text"
                required
                value={form.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-mono font-bold bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Store Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full p-3 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
              Top Announcement Bar Message
            </label>
            <input
              type="text"
              value={form.announcement}
              onChange={(e) => handleChange('announcement', e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
            />
          </div>
        </div>

        {/* Contact Details */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
            2. Business Contact & Address
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Phone Number</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-mono bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">WhatsApp Number</label>
              <input
                type="text"
                value={form.whatsapp}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-mono bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Official Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Business Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
              />
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
            3. Social Channels
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Facebook Page URL</label>
              <input
                type="url"
                value={form.facebook}
                onChange={(e) => handleChange('facebook', e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-mono bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Instagram URL</label>
              <input
                type="url"
                value={form.instagram}
                onChange={(e) => handleChange('instagram', e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-mono bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">TikTok Handle</label>
              <input
                type="text"
                value={form.tiktok}
                onChange={(e) => handleChange('tiktok', e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-mono bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">YouTube Channel URL</label>
              <input
                type="url"
                value={form.youtube}
                onChange={(e) => handleChange('youtube', e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-mono bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
              />
            </div>
          </div>
        </div>

        {/* Gemini AI Engine & API Key Configuration */}
        <div className="bg-gradient-to-br from-neutral-900 to-black text-white border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-red-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                4. Google Gemini AI Engine & API Key
              </h3>
            </div>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1 underline underline-offset-2"
            >
              Get Gemini API Key <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <p className="text-xs text-neutral-400">
            SAVAGE AI ভার্চুয়াল ট্রাই-অন, ফ্যাশন প্রোডাক্ট কপিরাইটিং ও সেলস অ্যাসিস্ট্যান্টের জন্য আপনার Google Gemini API Key কনফিগার করুন।
          </p>

          <div className="space-y-3 pt-1">
            <label className="block text-xs font-bold text-neutral-300 uppercase">
              Google Gemini API Key
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="password"
                  value={form.geminiApiKey || ''}
                  onChange={(e) => handleChange('geminiApiKey', e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-4 py-2.5 text-xs font-mono bg-neutral-950 border border-neutral-700 rounded-xl focus:outline-none focus:border-red-500 text-white placeholder-neutral-600"
                />
                <Key className="w-4 h-4 text-neutral-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <button
                type="button"
                onClick={handleTestGeminiKey}
                disabled={testingApiKey}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingApiKey ? 'animate-spin' : ''}`} />
                <span>{testingApiKey ? 'Testing...' : 'Test Connection'}</span>
              </button>
            </div>

            {apiTestResult.status === 'success' && (
              <div className="p-3 bg-emerald-950/70 border border-emerald-700 text-emerald-200 rounded-xl text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{apiTestResult.message}</span>
              </div>
            )}

            {apiTestResult.status === 'error' && (
              <div className="p-3 bg-red-950/70 border border-red-700 text-red-200 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{apiTestResult.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Master PIN & Admin Protection System */}
        <div className="bg-neutral-950 text-white border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-red-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                5. Admin Console Protection PIN
              </h3>
            </div>
            <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded">
              DEFENSE-IN-DEPTH
            </span>
          </div>

          <p className="text-xs text-neutral-400">
            Set a 6-digit Master Protection PIN required to unlock and operate the SAVAGE STORE admin console.
            Protects your storefront management against unauthorized physical or session access.
          </p>

          <div className="max-w-xs space-y-2 pt-1">
            <label className="block text-xs font-bold text-neutral-300 uppercase">
              Current Master PIN (6 Digits)
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={6}
                required
                value={form.adminPin || '202622'}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                  handleChange('adminPin', val);
                }}
                className="w-full px-4 py-2.5 text-base font-mono font-bold tracking-widest bg-neutral-900 border border-neutral-700 rounded-xl focus:outline-none focus:border-red-500 text-white"
                placeholder="202622"
              />
              <KeyRound className="w-4 h-4 text-neutral-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <p className="text-[11px] text-neutral-500">
              Default factory PIN: <strong className="text-neutral-300 font-mono">202622</strong>
            </p>
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-md disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Settings...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
