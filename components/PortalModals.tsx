'use client';

import React, { useState } from 'react';
import {
  X,
  Eye,
  MapPin,
  Share2,
  ExternalLink,
  Megaphone,
  MessageSquare,
  Smartphone,
  Download,
  CheckCircle2,
  Video,
  Copy,
  Check,
  Server,
  FileText,
  FileArchive
} from 'lucide-react';
import {
  NewsArticle,
  PortalState,
  SubmitPrivateAdInput,
  AdScope,
  AdFormat,
  PRIVATE_AD_CATEGORIES
} from '@/lib/news-engine';
import { SupportedLanguage, TRANSLATIONS } from '@/lib/translations';

interface ArticleReaderModalProps {
  article: NewsArticle;
  lang: SupportedLanguage;
  onClose: () => void;
  onOpenMandalPage: (stateName: string, districtName: string, mandalName: string) => void;
}

export function ArticleReaderModal({
  article,
  lang,
  onClose,
  onOpenMandalPage
}: ArticleReaderModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={article.title[lang]}
    >
      <div className="relative w-full max-w-3xl rounded-xl bg-white border border-stone-200 shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
          <div className="text-xs text-stone-600 flex items-center gap-2">
            <span className="font-bold text-red-900">{article.category}</span>
            <span aria-hidden="true">·</span>
            <span>{article.mandal}</span>
            <span aria-hidden="true">·</span>
            <span>{article.district}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Article Reader"
            className="rounded-lg p-1.5 text-stone-600 hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 lg:p-8 space-y-5 max-h-[80vh] overflow-y-auto">
          <h2 className="text-2xl lg:text-3xl font-serif font-bold text-stone-900 leading-snug">
            {article.title[lang]}
          </h2>

          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-stone-500 border-b border-stone-200 pb-4">
            <div>
              <span className="font-semibold text-stone-800">{article.authorName}</span>
              <span className="mx-2" aria-hidden="true">·</span>
              <span>{article.publishedAt}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 font-mono font-bold text-red-900 tabular-nums">
                <Eye className="w-4 h-4" />
                {article.views.toLocaleString('en-IN')} Views
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenMandalPage(article.state, article.district, article.mandal);
                }}
                className="inline-flex items-center gap-1 font-bold text-stone-800 hover:text-red-800 underline"
              >
                <MapPin className="w-3.5 h-3.5 text-red-800" />
                {article.mandal} మండల పేజీ చూడండి
              </button>
            </div>
          </div>

          <img
            src={article.imageUrl}
            alt={article.title[lang]}
            referrerPolicy="no-referrer"
            className="w-full h-72 object-cover rounded-lg border border-stone-200 bg-stone-900"
          />

          <p className="text-base font-semibold text-stone-800 leading-relaxed">
            {article.summary[lang]}
          </p>

          <p className="text-base text-stone-700 leading-relaxed whitespace-pre-line">
            {article.content[lang]}
          </p>

          {article.youtubeUrl && (
            <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700">
                నేటి భారతం వీడియో అప్‌డేట్స్ (YouTube Channel):
              </span>
              <a
                href={article.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-800 px-4 py-2 text-xs font-bold text-white hover:bg-red-900 transition-colors"
              >
                <Video className="w-4 h-4" />
                Watch on YouTube
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface SubmitPrivateAdModalProps {
  portalState: PortalState;
  onClose: () => void;
  onSubmitAd: (input: SubmitPrivateAdInput) => Promise<void>;
}

export function SubmitPrivateAdModal({
  portalState,
  onClose,
  onSubmitAd
}: SubmitPrivateAdModalProps) {
  const statesList = Object.keys(portalState.locations);
  const [title, setTitle] = useState('');
  const [matter, setMatter] = useState('');
  const [imageUrl, setImageUrl] = useState('/images/ad-kanchipuram-silks.svg');
  const [category, setCategory] = useState<string>(PRIVATE_AD_CATEGORIES[0]);
  const [adFormat, setAdFormat] = useState<AdFormat>('banner');
  const [scope, setScope] = useState<AdScope>('mandal');
  const [stateName, setStateName] = useState(statesList[0] || 'Telangana (తెలంగాణ)');
  const districts = Object.keys(portalState.locations[stateName] || {});
  const [districtName, setDistrictName] = useState(districts[0] || '');
  const mandals =
    (portalState.locations[stateName] && portalState.locations[stateName][districtName]) || [];
  const [mandalName, setMandalName] = useState(mandals[0] || '');
  const [advertiserName, setAdvertiserName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [submittedMsg, setSubmittedMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmitAd({
      title,
      matter,
      imageUrl,
      category,
      adFormat,
      scope,
      state: stateName,
      district: districtName,
      mandal: mandalName,
      advertiserName,
      contactPhone
    });
    setSubmittedMsg(
      'మీ ప్రైవేట్ ప్రకటన (బ్యానర్ / క్లాసిఫైడ్ ఫోటో + మేటర్) నమోదు చేయబడింది! అడ్మిన్ ఆమోదం (Admin Approval) వచ్చిన వెంటనే వెబ్‌సైట్‌లో కనిపిస్తుంది.'
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Submit Private Advertisement"
    >
      <div className="relative w-full max-w-2xl rounded-xl bg-white border border-stone-200 shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-900 text-white">
          <div className="flex items-center gap-2.5">
            <Megaphone className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold">
              ప్రైవేట్ యాడ్ బుకింగ్ (బ్యానర్ యాడ్ / క్లాసిఫైడ్ యాడ్ · అన్ని కేటగిరీలు)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Private Ad Modal"
            className="rounded-lg p-1 text-stone-300 hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          {submittedMsg ? (
            <div className="space-y-4 text-center py-6">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <p className="text-sm font-bold text-stone-900">{submittedMsg}</p>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-red-800 px-6 py-2.5 text-xs font-bold text-white"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    యాడ్ రకం · Ad Format *
                  </label>
                  <select
                    value={adFormat}
                    onChange={(e) => setAdFormat(e.target.value as AdFormat)}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-bold text-stone-900 bg-amber-50/60"
                  >
                    <option value="banner">బ్యానర్ యాడ్ (Banner Ad)</option>
                    <option value="classified">క్లాసిఫైడ్ యాడ్ (Classified Ad)</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    కేటగిరీ · All Private Ad Categories *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900"
                  >
                    {PRIVATE_AD_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ప్రకటన శీర్షిక · Ad Headline *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ఉదా: శ్రీ లక్ష్మీ సిల్క్స్ పండుగ ఆఫర్ / DTCP ఓపెన్ ప్లాట్లు అమ్మకానికి"
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ప్రకటన వివరాలు · Advertisement Matter *
                </label>
                <textarea
                  rows={3}
                  required
                  value={matter}
                  onChange={(e) => setMatter(e.target.value)}
                  placeholder="ప్రకటన పూర్తి వివరాలు, ఆఫర్లు, చిరునామా రాయండి..."
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900"
                />
              </div>

              {/* Ad Image Upload + Preview */}
              <div className="bg-stone-50 p-3.5 rounded-lg border border-stone-200">
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  ప్రకటన ఫోటో / బ్యానర్ అప్‌లోడ్ (Ad Image + Matter 둘ూ కనిపిస్తాయి) *
                </label>
                <div className="flex flex-wrap items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="text-xs text-stone-600 file:mr-2 file:rounded file:border-0 file:bg-red-800 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                  />
                  <img
                    src={imageUrl}
                    alt="Ad Banner Preview"
                    referrerPolicy="no-referrer"
                    className="w-28 h-16 rounded object-cover border border-stone-300"
                  />
                </div>
              </div>

              {/* Location & Scope Targeting */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Ad Level</label>
                  <select
                    value={scope}
                    onChange={(e) => setScope(e.target.value as AdScope)}
                    className="w-full rounded-lg border border-stone-300 px-2.5 py-2 text-xs text-stone-900"
                  >
                    <option value="home">హోమ్ పేజీ వారీగా (Home Page Wise)</option>
                    <option value="state">రాష్ట్ర స్థాయి (State Wise)</option>
                    <option value="district">జిల్లా స్థాయి (District Wise)</option>
                    <option value="mandal">మండల స్థాయి (Mandal Wise)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">State</label>
                  <select
                    value={stateName}
                    onChange={(e) => {
                      const st = e.target.value;
                      setStateName(st);
                      const d0 = Object.keys(portalState.locations[st] || {})[0] || '';
                      setDistrictName(d0);
                      const m0 =
                        (portalState.locations[st] && portalState.locations[st][d0]?.[0]) || '';
                      setMandalName(m0);
                    }}
                    className="w-full rounded-lg border border-stone-300 px-2.5 py-2 text-xs text-stone-900"
                  >
                    {statesList.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">District</label>
                  <select
                    value={districtName}
                    onChange={(e) => {
                      const dt = e.target.value;
                      setDistrictName(dt);
                      const m0 =
                        (portalState.locations[stateName] &&
                          portalState.locations[stateName][dt]?.[0]) ||
                        '';
                      setMandalName(m0);
                    }}
                    className="w-full rounded-lg border border-stone-300 px-2.5 py-2 text-xs text-stone-900"
                  >
                    {districts.map((dt) => (
                      <option key={dt} value={dt}>
                        {dt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Mandal</label>
                  <select
                    value={mandalName}
                    onChange={(e) => setMandalName(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 px-2.5 py-2 text-xs text-stone-900"
                  >
                    {mandals.map((mn) => (
                      <option key={mn} value={mn}>
                        {mn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    ప్రకటనదారు పేరు · Advertiser Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={advertiserName}
                    onChange={(e) => setAdvertiserName(e.target.value)}
                    placeholder="Business / Owner Name"
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    సంప్రదించవలసిన నెంబర్ · Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="98480 XXXXX"
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-mono tabular-nums text-stone-900"
                  />
                </div>
              </div>

              <p className="text-xs text-stone-500">
                * నిబంధన: ప్రైవేట్ యాడ్స్ అడ్మిన్ అప్రూవల్ అయిన తర్వాతే వెబ్‌సైట్ మరియు యాప్‌లో ప్రదర్శించబడతాయి.
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-red-800 px-5 py-2 text-xs font-bold text-white hover:bg-red-900 transition-colors"
                >
                  Submit Private Ad for Admin Approval
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

interface PlayStoreAppModalProps {
  logoUrl: string;
  isInstallable: boolean;
  onTriggerInstall: () => void;
  onClose: () => void;
}

export function PlayStoreAppModal({
  logoUrl,
  isInstallable,
  onTriggerInstall,
  onClose
}: PlayStoreAppModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Neti Bharatam Mobile App and Google Play Store"
    >
      <div className="w-full max-w-lg rounded-xl bg-white border border-stone-200 shadow-2xl overflow-hidden">
        <div className="bg-red-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={logoUrl || '/icon.svg'}
              alt="Neti Bharatam App Icon"
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-xl bg-white p-1"
            />
            <div>
              <h3 className="text-lg font-bold">నేటి భారతం మొబైల్ యాప్ · Play Store &amp; PWA</h3>
              <p className="text-xs text-red-100">Android · iOS · Instant Mobile App Experience</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Mobile App Modal"
            className="rounded-lg p-1 text-white hover:bg-white/15"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs text-stone-700">
          <div className="rounded-lg bg-stone-50 border border-stone-200 p-4 space-y-2">
            <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-red-800" />
              1. తక్షణ మొబైల్ యాప్ ఇన్‌స్టాలేషన్ (Direct Mobile App / PWA)
            </h4>
            <p>
              నేటి భారతం వెబ్‌సైట్ పూర్తి స్థాయి <strong>Progressive Web App (PWA)</strong> టెక్నాలజీతో రూపొందించబడింది. మీ ఫోన్ హోమ్ స్క్రీన్‌పై యాప్‌లాగా ఇన్‌స్టాల్ చేసుకుని నోటిఫికేషన్లు పొందవచ్చు.
            </p>
            {isInstallable ? (
              <button
                type="button"
                onClick={onTriggerInstall}
                className="mt-2 inline-flex items-center gap-2 rounded-lg bg-red-800 px-4 py-2 text-xs font-bold text-white hover:bg-red-900"
              >
                <Download className="w-4 h-4" />
                Install నేటి భారతం App Now
              </button>
            ) : (
              <p className="text-emerald-800 font-semibold">
                ✓ Chrome / Safari మెనూలో &quot;Add to Home Screen / Install App&quot; ద్వారా 1-క్లిక్‌తో ఇన్‌స్టాల్ చేసుకోండి.
              </p>
            )}
          </div>

          <div className="rounded-lg bg-stone-50 border border-stone-200 p-4 space-y-2">
            <h4 className="text-sm font-bold text-stone-900">
              2. Google Play Store (Android TWA / AAB Ready)
            </h4>
            <p>
              ఈ యాప్ యొక్క <code>/manifest.webmanifest</code>, <code>192x192</code> మరియు{' '}
              <code>512x512</code> maskable ఐకాన్లు Google Play Store (Trusted Web Activity / PWABuilder) ప్రమాణాలకు అనుగుణంగా సిద్ధంగా ఉన్నాయి.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-stone-900 px-5 py-2 text-xs font-bold text-white"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface HostingerExportModalProps {
  onClose: () => void;
}

export function HostingerExportModal({ onClose }: HostingerExportModalProps) {
  const [activeTab, setActiveTab] = useState<'downloads' | 'guide' | 'credentials'>('downloads');
  const [copied, setCopied] = useState(false);

  const fullGuideText = `================================================================================
నేటి భారతం (NETI BHARATAM) — HOSTINGER UPLOAD & DEPLOYMENT GUIDE (TELUGU & ENGLISH)
================================================================================

మీరు Hostinger లో వెబ్‌సైట్‌ను 2 సులభమైన పద్ధతులలో అప్‌లోడ్ చేయవచ్చు:

--------------------------------------------------------------------------------
పద్ధతి 1 (అత్యంత సులభం - RECOMMENDED): Hostinger Shared Hosting (public_html)
--------------------------------------------------------------------------------
Step 1: "neti-bharatam-hostinger-public_html.zip" (లేదా "index.html" + ".htaccess") డౌన్‌లోడ్ చేసుకోండి.
Step 2: మీ Hostinger hPanel (https://hpanel.hostinger.com) లాగిన్ అవ్వండి.
Step 3: "Websites" -> మీ డొమైన్ పక్కన "Dashboard" -> "File Manager" ఓపెన్ చేసి "public_html" ఫోల్డర్‌లోకి వెళ్ళండి.
Step 4: అక్కడ ఉన్న పాత "default.php" ఫైల్‌ను డిలీట్ చేయండి.
Step 5: మీరు డౌన్‌లోడ్ చేసిన "neti-bharatam-hostinger-public_html.zip" ఫైల్‌ను public_html లో అప్‌లోడ్ చేసి, రైట్-క్లిక్ చేసి "Extract" చేయండి (లేదా నేరుగా index.html మరియు .htaccess ఫైల్స్ అప్‌లోడ్ చేయండి).
Step 6: అంతే! మీ వెబ్‌సైట్ డొమైన్ ఓపెన్ చేయగానే "నేటి భారతం" అధికారిక బ్యానర్, లోగో, తెలుగు/హిందీ/ఇంగ్లీష్ బ్రేకింగ్ న్యూస్ టిక్కర్, మండల వారీగా వార్తలు, రిపోర్టర్ రిజిస్ట్రేషన్ & Press ID కార్డు, ప్రైవేట్ యాడ్స్ (బ్యానర్ యాడ్స్ & క్లాసిఫైడ్స్), మరియు పూర్తి అడ్మిన్ ప్యానెల్ వెంటనే పనిచేస్తాయి!

--------------------------------------------------------------------------------
పద్ధతి 2: Hostinger Cloud / VPS / Node.js Web App Hosting
--------------------------------------------------------------------------------
1. Node.js 20.x లేదా 22.x సెలెక్ట్ చేసి, Startup file గా "server.js" ఇవ్వండి.
2. Terminal లో రన్ చేయండి:
   npm install
   npm run build
   node server.js

--------------------------------------------------------------------------------
అడ్మిన్ లాగిన్ వివరాలు (Admin Credentials):
--------------------------------------------------------------------------------
- Admin Portal   : మీ డొమైన్ ఓపెన్ చేసి టాప్ మెనూలోని "Admin" క్లిక్ చేయండి
- Admin Username : Admin
- Admin Password : Bchakriraju1992@
- అడ్మిన్ ప్యానెల్‌లోని "వెబ్‌సైట్ పూర్తి కంట్రోల్ (CMS)" ద్వారా లోగో, బ్యానర్ ఇమేజ్, వెబ్‌సైట్ టైటిల్, యూట్యూబ్ లింక్, ఫోన్ నెంబర్, రిపోర్టర్ పాస్‌వర్డ్ మార్పు, రిపోర్టర్ బ్లాక్/అన్‌బ్లాక్, ప్రైవేట్ యాడ్స్ (బ్యానర్ & క్లాసిఫైడ్స్), వార్తల ఎడిటింగ్/డిలీటింగ్ అన్నీ ఎప్పుడైనా మార్చుకోవచ్చు!
================================================================================`;

  const handleCopyGuide = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullGuideText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Hostinger Upload Files Download Center"
    >
      <div className="w-full max-w-4xl rounded-2xl bg-white border border-stone-200 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 px-6 py-5 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-900/60 border border-red-700/60 text-amber-400">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
                HOSTINGER DEPLOYMENT PACKAGE &amp; SUPPORT FILES
              </div>
              <h3 className="text-lg sm:text-xl font-bold mt-0.5">
                Hostinger హోస్టింగ్ సపోర్ట్ ఫైల్స్ &amp; అప్‌లోడ్ గైడ్
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Hostinger Files Modal"
            className="rounded-lg p-2 text-stone-300 hover:bg-stone-800 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="bg-stone-100 border-b border-stone-200 px-6 pt-3 flex flex-wrap gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('downloads')}
            className={`px-4 py-2.5 rounded-t-lg transition-colors flex items-center gap-2 ${
              activeTab === 'downloads'
                ? 'bg-white text-red-900 border-t-2 border-red-800 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <Download className="w-4 h-4 text-red-800" />
            <span>1. ఫైల్స్ డౌన్‌లోడ్ (Download Support Files)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2.5 rounded-t-lg transition-colors flex items-center gap-2 ${
              activeTab === 'guide'
                ? 'bg-white text-red-900 border-t-2 border-red-800 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-600" />
            <span>2. స్టెప్-బై-స్టెప్ గైడ్ (Hostinger Upload Steps)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('credentials')}
            className={`px-4 py-2.5 rounded-t-lg transition-colors flex items-center gap-2 ${
              activeTab === 'credentials'
                ? 'bg-white text-red-900 border-t-2 border-red-800 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>3. అడ్మిన్ లాగిన్ &amp; CMS వివరాలు</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-6 text-xs text-stone-700 max-h-[76vh] overflow-y-auto">
          {activeTab === 'downloads' && (
            <div className="space-y-6">
              {/* Primary Recommended: Full ZIP Package */}
              <div className="rounded-2xl bg-gradient-to-br from-amber-50 via-white to-amber-50 border-2 border-amber-400 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-sm">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-block rounded-md bg-stone-950 px-2.5 py-0.5 text-[10px] font-mono font-extrabold text-amber-300 uppercase">
                      RECOMMENDED · ALL-IN-ONE BUNDLE
                    </span>
                    <span className="inline-block rounded-md bg-emerald-100 text-emerald-900 px-2 py-0.5 text-[10px] font-bold">
                      Ready for public_html
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-extrabold text-stone-950 flex items-center gap-2">
                    <FileArchive className="w-5 h-5 text-red-800 shrink-0" />
                    <span>నెట్ భారతం పూర్తి ZIP ప్యాకేజీ (neti-bharatam-hostinger-public_html.zip)</span>
                  </h4>
                  <p className="text-xs text-stone-700 leading-relaxed">
                    ఈ ఒక్క ZIP ఫైల్‌లో <code>index.html</code> (అధికారిక బ్యానర్, లోగో, తెలుగు వార్తలు, బ్రేకింగ్ టిక్కర్, రిపోర్టర్ పోర్టల్, ప్రెస్ ఐడీ, ప్రైవేట్ యాడ్స్), <code>.htaccess</code>, <code>server.js</code>, <code>HOSTINGER_UPLOAD_GUIDE.txt</code> మరియు <code>Database Backup JSON</code> అన్నీ కలిసి ఉంటాయి!
                  </p>
                  <div className="text-[11px] text-amber-950 font-semibold bg-amber-100/70 rounded-lg p-2.5 border border-amber-300">
                    💡 <strong>సులభమైన విధానం:</strong> Hostinger File Manager లోని <code>public_html</code> లో ఈ జిప్ ఫైల్‌ను అప్‌లోడ్ చేసి రైట్-క్లిక్ చేసి <strong>Extract</strong> చేస్తే మీ సైట్ వెంటనే లైవ్ అవుతుంది!
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
                  <a
                    href="/api/hostinger-export?format=zip"
                    download="neti-bharatam-hostinger-public_html.zip"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-800 px-6 py-3.5 text-xs font-extrabold text-white hover:bg-red-900 transition-colors shadow-md hover:shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Full ZIP (3.6 MB)</span>
                  </a>
                  <a
                    href="/hostinger-export/neti-bharatam-hostinger-public_html.zip"
                    download="neti-bharatam-hostinger-public_html.zip"
                    className="text-center text-[11px] text-stone-500 hover:text-stone-800 underline"
                  >
                    Direct Static Link Backup
                  </a>
                </div>
              </div>

              {/* Individual Files Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-stone-900">
                    విడివిడిగా ఫైల్స్ డౌన్‌లోడ్ చేసుకోండి (Individual Support Files):
                  </h4>
                  <button
                    type="button"
                    onClick={handleCopyGuide}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-red-800 hover:underline"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Guide Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Upload Guide</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* index.html */}
                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-4.5 hover:bg-stone-100 transition-colors flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono font-bold text-red-800 uppercase bg-red-100 px-2 py-0.5 rounded">
                        MAIN WEBSITE (STANDALONE)
                      </span>
                      <div className="text-sm font-bold text-stone-900">1. index.html</div>
                      <p className="text-[11px] text-stone-600 leading-relaxed">
                        నేటి భారతం బ్యానర్, లోగో, తెలుగు/హిందీ/ఇంగ్లీష్ వార్తలు, రిపోర్టర్ పోర్టల్, Press ID, ప్రైవేట్ యాడ్స్ మరియు అడ్మిన్ కన్సోల్‌తో కూడిన పూర్తి వెబ్‌సైట్.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-stone-200 flex flex-col gap-1.5">
                      <a
                        href="/api/hostinger-export?format=public_html"
                        download="index.html"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-red-800 hover:underline"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download index.html</span>
                      </a>
                      <a
                        href="/hostinger-export/index.html"
                        download="index.html"
                        className="text-[11px] text-stone-500 hover:text-stone-800 underline"
                      >
                        Static File Mirror
                      </a>
                    </div>
                  </div>

                  {/* .htaccess */}
                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-4.5 hover:bg-stone-100 transition-colors flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono font-bold text-red-800 uppercase bg-red-100 px-2 py-0.5 rounded">
                        APACHE ROUTING &amp; UTF-8
                      </span>
                      <div className="text-sm font-bold text-stone-900">2. .htaccess</div>
                      <p className="text-[11px] text-stone-600 leading-relaxed">
                        Hostinger Apache సర్వర్ కోసం Clean URLs, UTF-8 తెలుగు/హిందీ కారెక్టర్ ఎన్‌కోడింగ్ మరియు సెక్యూరిటీ హెడర్స్.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-stone-200 flex flex-col gap-1.5">
                      <a
                        href="/api/hostinger-export?format=htaccess"
                        download=".htaccess"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-red-800 hover:underline"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download .htaccess</span>
                      </a>
                      <a
                        href="/hostinger-export/.htaccess"
                        download=".htaccess"
                        className="text-[11px] text-stone-500 hover:text-stone-800 underline"
                      >
                        Static File Mirror
                      </a>
                    </div>
                  </div>

                  {/* server.js */}
                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-4.5 hover:bg-stone-100 transition-colors flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase bg-emerald-100 px-2 py-0.5 rounded">
                        NODE.JS SERVER (VPS/CLOUD)
                      </span>
                      <div className="text-sm font-bold text-stone-900">3. server.js</div>
                      <p className="text-[11px] text-stone-600 leading-relaxed">
                        Hostinger Cloud, VPS లేదా Node.js Web App కోసం Next.js ప్రొడక్షన్ సర్వర్ లాంచ్ స్క్రిప్ట్ (Port 3000).
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-stone-200 flex flex-col gap-1.5">
                      <a
                        href="/api/hostinger-export?format=nodejs_server"
                        download="server.js"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:underline"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download server.js</span>
                      </a>
                      <a
                        href="/hostinger-export/server.js"
                        download="server.js"
                        className="text-[11px] text-stone-500 hover:text-stone-800 underline"
                      >
                        Static File Mirror
                      </a>
                    </div>
                  </div>

                  {/* HOSTINGER_UPLOAD_GUIDE.txt */}
                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-4.5 hover:bg-stone-100 transition-colors flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono font-bold text-stone-700 uppercase bg-stone-200 px-2 py-0.5 rounded">
                        OFFICIAL INSTRUCTIONS (.TXT)
                      </span>
                      <div className="text-sm font-bold text-stone-900">4. HOSTINGER_UPLOAD_GUIDE.txt</div>
                      <p className="text-[11px] text-stone-600 leading-relaxed">
                        Hostinger hPanel File Manager లో అప్‌లోడ్ చేయడానికి పూర్తి స్టెప్-బై-స్టెప్ గైడ్ (తెలుగు మరియు ఇంగ్లీష్‌లో).
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-stone-200 flex flex-col gap-1.5">
                      <a
                        href="/api/hostinger-export?format=deploy_guide"
                        download="HOSTINGER_UPLOAD_GUIDE.txt"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-900 hover:underline"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Guide (.TXT)</span>
                      </a>
                      <a
                        href="/hostinger-export/HOSTINGER_UPLOAD_GUIDE.txt"
                        download="HOSTINGER_UPLOAD_GUIDE.txt"
                        className="text-[11px] text-stone-500 hover:text-stone-800 underline"
                      >
                        Static File Mirror
                      </a>
                    </div>
                  </div>

                  {/* neti-bharatam-database-backup.json */}
                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-4.5 hover:bg-stone-100 transition-colors flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono font-bold text-amber-800 uppercase bg-amber-100 px-2 py-0.5 rounded">
                        DATA BACKUP (.JSON)
                      </span>
                      <div className="text-sm font-bold text-stone-900">5. Database JSON Backup</div>
                      <p className="text-[11px] text-stone-600 leading-relaxed">
                        అన్ని వార్తలు, రిపోర్టర్లు, ప్రైవేట్ యాడ్స్, జిల్లాలు, మండలాలు &amp; CMS సెట్టింగ్స్ పూర్తి డేటాబేస్ బ్యాకప్.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-stone-200 flex flex-col gap-1.5">
                      <a
                        href="/api/hostinger-export?format=database_json"
                        download="neti-bharatam-database-backup.json"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:underline"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download DB Backup (.JSON)</span>
                      </a>
                      <a
                        href="/hostinger-export/neti-bharatam-database-backup.json"
                        download="neti-bharatam-database-backup.json"
                        className="text-[11px] text-stone-500 hover:text-stone-800 underline"
                      >
                        Static File Mirror
                      </a>
                    </div>
                  </div>

                  {/* Quick Copy Box */}
                  <div className="rounded-xl border border-stone-200 bg-stone-900 text-white p-4.5 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono font-bold text-amber-300 uppercase bg-stone-800 px-2 py-0.5 rounded">
                        QUICK CLIPBOARD
                      </span>
                      <div className="text-sm font-bold text-white">గైడ్ టెక్స్ట్ కాపీ చేయండి</div>
                      <p className="text-[11px] text-stone-300 leading-relaxed">
                        పూర్తి అప్‌లోడ్ స్టెప్స్ &amp; అడ్మిన్ పాస్‌వర్డ్ మీ క్లిప్‌బోర్డ్‌కి వెంటనే కాపీ చేసుకోండి.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-stone-800">
                      <button
                        type="button"
                        onClick={handleCopyGuide}
                        className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-stone-950 hover:bg-amber-400 transition-colors w-full justify-center"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>కాపీ చేయబడింది! (Copied)</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copy Instructions</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-6">
              {/* Method 1: Hostinger Shared Hosting */}
              <div className="rounded-2xl border-2 border-red-800/40 bg-white p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-md bg-red-800 text-white font-bold text-xs">
                      పద్ధతి 1 (RECOMMENDED)
                    </span>
                    <h4 className="text-base font-bold text-stone-900">
                      Hostinger Shared Hosting లో <code>public_html</code> అప్‌లోడ్ (సులభమైన పద్ధతి)
                    </h4>
                  </div>
                  <span className="text-xs text-emerald-700 font-bold font-mono">No Node.js Required</span>
                </div>

                <div className="space-y-3.5 text-xs text-stone-800">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-red-100 text-red-900 font-bold flex items-center justify-center shrink-0">
                      1
                    </span>
                    <div>
                      <strong>ఫైల్స్ డౌన్‌లోడ్:</strong> పైనున్న <code>neti-bharatam-hostinger-public_html.zip</code> ఫైల్‌ను డౌన్‌లోడ్ చేసుకోండి. (లేదా <code>index.html</code> మరియు <code>.htaccess</code> విడివిడిగా డౌన్‌లోడ్ చేయండి).
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-red-100 text-red-900 font-bold flex items-center justify-center shrink-0">
                      2
                    </span>
                    <div>
                      <strong>Hostinger hPanel లాగిన్:</strong> మీ బ్రౌజర్‌లో{' '}
                      <a
                        href="https://hpanel.hostinger.com"
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-red-800 underline inline-flex items-center gap-1"
                      >
                        hpanel.hostinger.com <ExternalLink className="w-3 h-3" />
                      </a>{' '}
                      ఓపెన్ చేసి లాగిన్ అవ్వండి.
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-red-100 text-red-900 font-bold flex items-center justify-center shrink-0">
                      3
                    </span>
                    <div>
                      <strong>File Manager ఓపెన్ చేయండి:</strong> మీ వెబ్‌సైట్ డొమైన్ పక్కన ఉన్న <strong>&quot;Dashboard&quot;</strong> పై క్లిక్ చేసి, ఎడమ వైపు మెనూలోని <strong>&quot;Files&quot; &rarr; &quot;File Manager&quot;</strong> (లేదా <strong>File Manager of domain</strong>) క్లిక్ చేయండి.
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-red-100 text-red-900 font-bold flex items-center justify-center shrink-0">
                      4
                    </span>
                    <div>
                      <strong>public_html ఫోల్డర్‌లోకి వెళ్ళండి:</strong> ఫైల్ మేనేజర్‌లో <code>public_html</code> ఫోల్డర్ ఓపెన్ చేయండి. అందులో పాత డమ్మీ ఫైల్స్ (ఉదాహరణకు <code>default.php</code>) ఉంటే డిలీట్ చేయండి.
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-red-100 text-red-900 font-bold flex items-center justify-center shrink-0">
                      5
                    </span>
                    <div>
                      <strong>ZIP అప్‌లోడ్ &amp; Extract:</strong> ఫైల్ మేనేజర్ పైన ఉన్న <strong>&quot;Upload&quot;</strong> ఐకాన్ క్లిక్ చేసి <code>neti-bharatam-hostinger-public_html.zip</code> ను అప్‌లోడ్ చేయండి. అప్‌లోడ్ పూర్తయిన తర్వాత ఆ ఫైల్‌పై రైట్-క్లిక్ చేసి <strong>&quot;Extract&quot;</strong> నొక్కి, ఫోల్డర్ పేరు <code>public_html</code> ఇచ్చి అన్‌జిప్ చేయండి.
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center shrink-0">
                      ✓
                    </span>
                    <div className="text-emerald-900 font-bold">
                      <strong>పూర్తయింది!</strong> మీ డొమైన్‌ను బ్రౌజర్‌లో ఓపెన్ చేయండి. అధికారిక నేటి భారతం బ్యానర్, లోగో, తెలుగు వార్తలు, బ్రేకింగ్ టిక్కర్, రిపోర్టర్ పోర్టల్, Press ID కార్డు మరియు అడ్మిన్ ప్యానెల్ వెంటనే ప్రత్యక్షమవుతాయి!
                    </div>
                  </div>
                </div>
              </div>

              {/* Method 2: Node.js VPS / Cloud Hosting */}
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-md bg-stone-900 text-white font-bold text-xs">
                      పద్ధతి 2 (ADVANCED)
                    </span>
                    <h4 className="text-base font-bold text-stone-900">
                      Hostinger Cloud / VPS / Node.js Web App Deployment
                    </h4>
                  </div>
                  <span className="text-xs text-stone-600 font-mono">Next.js Full-Stack</span>
                </div>

                <div className="space-y-3 text-xs text-stone-700">
                  <p>
                    మీరు Hostinger లో Node.js అప్లికేషన్ గా రన్ చేయాలనుకుంటే ప్రాజెక్ట్ ఫైల్స్ అప్‌లోడ్ చేసి కింది కమాండ్స్ రన్ చేయండి:
                  </p>
                  <pre className="bg-stone-900 text-amber-300 p-4 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed">
{`# 1. Install dependencies
npm install

# 2. Build production app
npm run build

# 3. Start custom production server
node server.js`}
                  </pre>
                  <p className="text-[11px] text-stone-600">
                    Hostinger Node.js Application settings లో Node.js Version: <strong>20.x or 22.x</strong> మరియు Startup File: <strong>server.js</strong> గా కాన్ఫిగర్ చేయండి.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'credentials' && (
            <div className="space-y-6">
              <div className="rounded-2xl border-2 border-stone-900 bg-stone-900 text-white p-6 space-y-4 shadow-md">
                <div className="flex items-center gap-2.5 border-b border-stone-800 pb-3">
                  <span className="text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
                    SECURITY &amp; ACCESS
                  </span>
                  <h4 className="text-base font-bold text-white">
                    నేటి భారతం చీఫ్ ఎడిటర్ / అడ్మిన్ లాగిన్ వివరాలు
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-stone-800/80 border border-stone-700 p-4 rounded-xl">
                    <div className="text-stone-400 text-xs mb-1">Admin Username</div>
                    <div className="text-base font-mono font-bold text-amber-300">Admin</div>
                  </div>
                  <div className="bg-stone-800/80 border border-stone-700 p-4 rounded-xl">
                    <div className="text-stone-400 text-xs mb-1">Admin Password</div>
                    <div className="text-base font-mono font-bold text-red-400">Bchakriraju1992@</div>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-stone-300 pt-2 border-t border-stone-800">
                  <div className="font-bold text-white">అడ్మిన్ ప్యానెల్‌లోని పూర్తి కంట్రోల్స్ (CMS Controls):</div>
                  <ul className="list-disc pl-5 space-y-1 text-stone-300">
                    <li><strong>లోగో &amp; బ్యానర్ మార్పు:</strong> మీ కంప్యూటర్ నుండి కొత్త బ్యానర్ లేదా లోగోను 1-క్లిక్‌తో అప్‌లోడ్ చేయవచ్చు.</li>
                    <li><strong>వెబ్‌సైట్ టైటిల్స్:</strong> ప్రధాన శీర్షిక, ఉప శీర్షిక, ట్యాగ్‌లైన్, కాంటాక్ట్ నంబర్, ఇమెయిల్, YouTube లింక్ మార్చుకోవచ్చు.</li>
                    <li><strong>రిపోర్టర్ల మేనేజ్‌మెంట్:</strong> కొత్త రిపోర్టర్లను అప్రూవ్ చేయడం, Press ID కార్డు జారీ చేయడం, పాస్‌వర్డ్ రీసెట్ చేయడం మరియు బ్లాక్/అన్‌బ్లాక్ చేయడం.</li>
                    <li><strong>ప్రైవేట్ యాడ్స్ (Banner Ads &amp; Classifieds):</strong> వినియోగదారులు లేదా వ్యాపారాలు పంపిన యాడ్స్ అప్రూవ్ లేదా డిలీట్ చేయడం.</li>
                    <li><strong>వార్తల నిర్వహణ:</strong> చీఫ్ ఎడిటర్ స్వయంగా వార్తలు పబ్లిష్ చేయడం, ఇప్పటికే ఉన్న వార్తలను ఎడిట్ లేదా డిలీట్ చేయడం.</li>
                  </ul>
                </div>
              </div>

              {/* Database Backup Info */}
              <div className="rounded-xl border border-stone-200 bg-amber-50 p-5 space-y-2">
                <h4 className="text-sm font-bold text-stone-900">
                  డేటాబేస్ బ్యాకప్ &amp; రీస్టోర్ (Full Database Portability):
                </h4>
                <p className="text-xs text-stone-700 leading-relaxed">
                  హోస్టింగర్ లో లైవ్ అయిన తర్వాత కూడా, అడ్మిన్ ప్యానెల్ లోని <strong>&quot;5. Database JSON&quot;</strong> ద్వారా మీ పూర్తి డేటాను ఎప్పుడైనా బ్యాకప్ తీసుకోవచ్చు మరియు కొత్త డేటాను రీస్టోర్ చేసుకోవచ్చు.
                </p>
              </div>
            </div>
          )}

          {/* Footer Close */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-stone-200">
            <div className="text-[11px] text-stone-500">
              Hostinger Support: <code>public_html</code> &bull; Apache .htaccess &bull; UTF-8 Telugu &bull; Node.js VPS
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyGuide}
                className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-bold text-stone-800 hover:bg-stone-100 transition-colors"
              >
                {copied ? 'Copied Guide! ✓' : 'Copy Guide Text'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-stone-900 px-5 py-2 text-xs font-bold text-white hover:bg-stone-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

