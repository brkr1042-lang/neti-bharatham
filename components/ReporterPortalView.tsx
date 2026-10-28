'use client';

import React, { useState } from 'react';
import {
  UserPlus,
  LogIn,
  Upload,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Download,
  Eye,
  MapPin,
  Lock,
  LogOut,
  Ban,
  Megaphone
} from 'lucide-react';
import {
  PortalState,
  ReporterProfile,
  RegisterReporterInput,
  PublishReporterNewsInput,
  SubmitPrivateAdInput,
  AdScope,
  AdFormat,
  PRIVATE_AD_CATEGORIES
} from '@/lib/news-engine';
import { SupportedLanguage, TRANSLATIONS } from '@/lib/translations';
import { PressIdCardModal } from './PressIdCardModal';

interface ReporterPortalViewProps {
  portalState: PortalState;
  lang: SupportedLanguage;
  onRegisterReporter: (input: RegisterReporterInput) => Promise<ReporterProfile>;
  onReporterPublishNews: (reporterId: string, newsInput: PublishReporterNewsInput) => Promise<void>;
  onSubmitPrivateAd: (input: SubmitPrivateAdInput) => Promise<void>;
  onOpenMandalPage: (stateName: string, districtName: string, mandalName: string) => void;
}

export function ReporterPortalView({
  portalState,
  lang,
  onRegisterReporter,
  onReporterPublishNews,
  onSubmitPrivateAd,
  onOpenMandalPage
}: ReporterPortalViewProps) {
  const t = TRANSLATIONS[lang];
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'register'>('dashboard');

  // Reporter Login State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggedInReporterId, setLoggedInReporterId] = useState<string | null>('rep-approved-1');
  const [showIdCardModal, setShowIdCardModal] = useState(false);

  // Registration Form State
  const statesList = Object.keys(portalState.locations);
  const [regFullName, setRegFullName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regState, setRegState] = useState(statesList[0] || 'Telangana (తెలంగాణ)');
  const districtsForRegState = Object.keys(portalState.locations[regState] || {});
  const [regDistrict, setRegDistrict] = useState(districtsForRegState[0] || '');
  const mandalsForRegDistrict =
    (portalState.locations[regState] && portalState.locations[regState][regDistrict]) || [];
  const [regMandal, setRegMandal] = useState(mandalsForRegDistrict[0] || '');
  const [regAadhaarNumber, setRegAadhaarNumber] = useState('');
  const [regPhotoUrl, setRegPhotoUrl] = useState('/images/reporter-avatar-1.svg');
  const [regAadhaarDocUrl, setRegAadhaarDocUrl] = useState('/images/sample-aadhaar-card.svg');
  const [regFeedback, setRegFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // News Upload State (Mandal-locked)
  const [newsTitleTe, setNewsTitleTe] = useState('');
  const [newsTitleHi, setNewsTitleHi] = useState('');
  const [newsTitleEn, setNewsTitleEn] = useState('');
  const [newsSummaryTe, setNewsSummaryTe] = useState('');
  const [newsContentTe, setNewsContentTe] = useState('');
  const [newsCategory, setNewsCategory] = useState('మండల అభివృద్ధి · Mandal Development');
  const [newsImageUrl, setNewsImageUrl] = useState('/images/mandal-praja-parishad.svg');
  const [newsYoutubeUrl, setNewsYoutubeUrl] = useState('');
  const [publishStatus, setPublishStatus] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Reporter Private Ad & Classified Booking State
  const [repAdFormat, setRepAdFormat] = useState<AdFormat>('banner');
  const [repAdCategory, setRepAdCategory] = useState<string>(PRIVATE_AD_CATEGORIES[0]);
  const [repAdScope, setRepAdScope] = useState<AdScope>('mandal');
  const [repAdTitle, setRepAdTitle] = useState('');
  const [repAdMatter, setRepAdMatter] = useState('');
  const [repAdImageUrl, setRepAdImageUrl] = useState('/images/ad-kanchipuram-silks.svg');
  const [repAdAdvertiser, setRepAdAdvertiser] = useState('');
  const [repAdPhone, setRepAdPhone] = useState('');
  const [repAdStatus, setRepAdStatus] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const currentReporter = portalState.reporters.find((r) => r.id === loggedInReporterId) || null;

  const handleStateChange = (newState: string) => {
    setRegState(newState);
    const dists = Object.keys(portalState.locations[newState] || {});
    const firstDist = dists[0] || '';
    setRegDistrict(firstDist);
    const mandals = (portalState.locations[newState] && portalState.locations[newState][firstDist]) || [];
    setRegMandal(mandals[0] || '');
  };

  const handleDistrictChange = (newDist: string) => {
    setRegDistrict(newDist);
    const mandals = (portalState.locations[regState] && portalState.locations[regState][newDist]) || [];
    setRegMandal(mandals[0] || '');
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setter(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const match = portalState.reporters.find(
      (r) =>
        r.username.toLowerCase() === loginUsername.trim().toLowerCase() &&
        r.passwordHash === loginPassword
    );
    if (!match) {
      setLoginError('తప్పు యూజర్‌నేమ్ లేదా పాస్‌వర్డ్! (Demo: ramana_huzurabad / Reporter@123)');
      return;
    }
    if (match.status === 'blocked') {
      setLoginError('మీ రిపోర్టర్ ఖాతాను అడ్మిన్ బ్లాక్ చేశారు (Account Blocked by Admin).');
      return;
    }
    setLoggedInReporterId(match.id);
    setLoginUsername('');
    setLoginPassword('');
  };

  const handleReporterLogout = () => {
    setLoggedInReporterId(null);
    setPublishStatus(null);
    setLoginError('');
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegFeedback(null);
    try {
      const created = await onRegisterReporter({
        fullName: regFullName,
        mobile: regMobile,
        username: regUsername,
        password: regPassword,
        state: regState,
        district: regDistrict,
        mandal: regMandal,
        aadhaarNumber: regAadhaarNumber,
        photoUrl: regPhotoUrl,
        aadhaarDocumentUrl: regAadhaarDocUrl
      });
      setRegFeedback({
        type: 'success',
        text: `రిజిస్ట్రేషన్ పూర్తయింది (${created.reporterCode})! అడ్మిన్ ఆమోదం వచ్చిన వెంటనే మీ ప్రెస్ ఐడి కార్డు ఆటోమేటిక్‌గా క్రియేట్ అవుతుంది మరియు మీరు ${created.mandal} మండల వార్తలు అప్‌లోడ్ చేయవచ్చు.`
      });
      setLoggedInReporterId(created.id);
      setRegFullName('');
      setRegMobile('');
      setRegUsername('');
      setRegPassword('');
      setRegAadhaarNumber('');
    } catch (err: unknown) {
      setRegFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Registration failed'
      });
    }
  };

  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentReporter) return;
    setPublishStatus(null);
    try {
      await onReporterPublishNews(currentReporter.id, {
        titleTe: newsTitleTe,
        titleHi: newsTitleHi,
        titleEn: newsTitleEn,
        summaryTe: newsSummaryTe,
        contentTe: newsContentTe,
        category: newsCategory,
        imageUrl: newsImageUrl,
        youtubeUrl: newsYoutubeUrl
      });
      setPublishStatus({
        type: 'success',
        text: `వార్త విజయవంతంగా మీ మండలం (${currentReporter.mandal}) పేజీలో ప్రచురించబడింది!`
      });
      setNewsTitleTe('');
      setNewsTitleHi('');
      setNewsTitleEn('');
      setNewsSummaryTe('');
      setNewsContentTe('');
      setNewsYoutubeUrl('');
    } catch (err: unknown) {
      setPublishStatus({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to publish news'
      });
    }
  };

  const handleReporterAdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentReporter) return;
    setRepAdStatus(null);
    if (currentReporter.status === 'blocked') {
      setRepAdStatus({
        type: 'error',
        text: 'మీ రిపోర్టర్ ఖాతా అడ్మిన్ ద్వారా బ్లాక్ చేయబడింది.'
      });
      return;
    }
    try {
      await onSubmitPrivateAd({
        title: repAdTitle,
        matter: repAdMatter,
        imageUrl: repAdImageUrl,
        category: repAdCategory,
        adFormat: repAdFormat,
        scope: repAdScope,
        state: currentReporter.state,
        district: currentReporter.district,
        mandal: currentReporter.mandal,
        advertiserName: repAdAdvertiser || `${currentReporter.fullName} (Reporter Desk)`,
        contactPhone: repAdPhone || currentReporter.mobile,
        submittedByReporterId: currentReporter.id
      });
      setRepAdStatus({
        type: 'success',
        text: `మీ ${
          repAdFormat === 'classified' ? 'క్లాసిఫైడ్ యాడ్ (Classified Ad)' : 'బ్యానర్ యాడ్ (Banner Ad)'
        } (${repAdCategory}) విజయవంతంగా నమోదు చేయబడింది! అడ్మిన్ ఆమోదం వచ్చిన వెంటనే పోర్టల్‌లో ప్రచురించబడుతుంది.`
      });
      setRepAdTitle('');
      setRepAdMatter('');
      setRepAdAdvertiser('');
      setRepAdPhone('');
    } catch (err: unknown) {
      setRepAdStatus({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to submit advertisement'
      });
    }
  };

  const reporterArticles = currentReporter
    ? portalState.articles.filter(
        (a) => a.reporterId === currentReporter.id || a.mandal === currentReporter.mandal
      )
    : [];

  const reporterAds = currentReporter
    ? portalState.privateAds.filter(
        (ad) =>
          ad.submittedByReporterId === currentReporter.id || ad.mandal === currentReporter.mandal
      )
    : [];

  return (
    <section className="space-y-8" aria-label="Reporter Registration and Dashboard">
      {/* Sub-navigation bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">{t.navReporterPortal}</h2>
          <p className="text-sm text-stone-600 mt-0.5">{t.mandalLockNotice}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveSubTab('dashboard')}
              className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeSubTab === 'dashboard'
                  ? 'bg-red-800 text-white shadow-sm'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              రిపోర్టర్ డ్యాష్‌బోర్డ్ · Reporter Dashboard
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('register')}
              className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeSubTab === 'register'
                  ? 'bg-red-800 text-white shadow-sm'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              కొత్త రిపోర్టర్ రిజిస్ట్రేషన్ · New Reporter Registration
            </button>
          </div>

          {currentReporter && activeSubTab === 'dashboard' && (
            <button
              type="button"
              onClick={handleReporterLogout}
              className="flex items-center gap-1.5 rounded-lg bg-stone-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0"
            >
              <LogOut className="w-3.5 h-3.5 text-amber-400" />
              రిపోర్టర్ లాగౌట్ · Reporter Logout
            </button>
          )}
        </div>
      </div>

      {activeSubTab === 'register' ? (
        <div className="bg-white border border-stone-200 rounded-xl p-6 lg:p-8 max-w-4xl mx-auto">
          <div className="border-b border-stone-200 pb-4 mb-6">
            <h3 className="text-xl font-bold text-stone-900">{t.reporterRegHeading}</h3>
            <p className="text-sm text-stone-600 mt-1">
              ఫోటో, రాష్ట్రం, జిల్లా, మండలం పేరు, మొబైల్ నెంబర్, యూజర్ నేమ్, పాస్‌వర్డ్ మరియు ఆధార్ కార్డు వివరాలను నమోదు చేయండి. అడ్మిన్ ఆమోదం తర్వాత ఆటోమేటిక్ ప్రెస్ ఐడి కార్డు డౌన్‌లోడ్ చేసుకోవచ్చు.
            </p>
          </div>

          {regFeedback && (
            <div
              className={`mb-6 p-4 rounded-lg border text-sm font-medium ${
                regFeedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              {regFeedback.text}
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  పూర్తి పేరు · Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="ఉదా: Ch. Ramesh Babu"
                  className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 focus:border-red-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  మొబైల్ నెంబర్ · Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={regMobile}
                  onChange={(e) => setRegMobile(e.target.value)}
                  placeholder="10-digit Mobile Number"
                  className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 font-mono tabular-nums focus:border-red-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  యూజర్ నేమ్ · Username *
                </label>
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="e.g. ramesh_mandal"
                  className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 focus:border-red-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  పాస్‌వర్డ్ · Password *
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Create secure password"
                  className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 focus:border-red-800 focus:outline-none"
                />
              </div>
            </div>

            {/* All-India State -> District -> Mandal Selection */}
            <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
              <div className="text-xs font-bold text-red-900 mb-3">
                భారతదేశం రాష్ట్రం · జిల్లా · మండలం ఎంపిక (All-India Mandal Selection) *
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    {t.selectState} *
                  </label>
                  <select
                    aria-label="Select Reporter State"
                    value={regState}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900"
                  >
                    {statesList.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    {t.selectDistrict} *
                  </label>
                  <select
                    aria-label="Select Reporter District"
                    value={regDistrict}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900"
                  >
                    {districtsForRegState.map((dt) => (
                      <option key={dt} value={dt}>
                        {dt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    మండలం పేరు · {t.selectMandal} *
                  </label>
                  <select
                    aria-label="Select Reporter Mandal"
                    value={regMandal}
                    onChange={(e) => setRegMandal(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-red-900"
                  >
                    {mandalsForRegDistrict.map((mn) => (
                      <option key={mn} value={mn}>
                        {mn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Aadhaar Card Number + Photo Upload + Aadhaar Document Upload */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  ఆధార్ కార్డు నెంబర్ · Aadhaar Number *
                </label>
                <input
                  type="text"
                  required
                  value={regAadhaarNumber}
                  onChange={(e) => setRegAadhaarNumber(e.target.value)}
                  placeholder="XXXX XXXX XXXX"
                  className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm font-mono tabular-nums text-stone-900 focus:border-red-800 focus:outline-none"
                />
                <p className="text-xs text-stone-500 mt-1">
                  అడ్మిన్ వెరిఫికేషన్ కోసం 12 అంకెల ఆధార్ సంఖ్య.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  రిపోర్టర్ పాస్‌పోర్ట్ ఫోటో అప్‌లోడ్ · Reporter Photo *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  aria-label="Upload Reporter Photo"
                  onChange={(e) => handleFileUpload(e, setRegPhotoUrl)}
                  className="w-full text-xs text-stone-600 file:mr-3 file:rounded-md file:border-0 file:bg-stone-200 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-stone-800 hover:file:bg-stone-300"
                />
                <div className="mt-2 flex items-center gap-2">
                  <img
                    src={regPhotoUrl}
                    alt="Reporter Photo Preview"
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-md object-cover border border-stone-300"
                  />
                  <span className="text-xs text-stone-500">ID కార్డుపై ఈ ఫోటో ఆటోమేటిక్‌గా వస్తుంది</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  ఆధార్ కార్డు కాపీ అప్‌లోడ్ · Aadhaar Card Upload *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  aria-label="Upload Aadhaar Card Copy"
                  onChange={(e) => handleFileUpload(e, setRegAadhaarDocUrl)}
                  className="w-full text-xs text-stone-600 file:mr-3 file:rounded-md file:border-0 file:bg-stone-200 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-stone-800 hover:file:bg-stone-300"
                />
                <div className="mt-2 flex items-center gap-2">
                  <img
                    src={regAadhaarDocUrl}
                    alt="Aadhaar Document Preview"
                    referrerPolicy="no-referrer"
                    className="w-16 h-10 rounded object-cover border border-stone-300"
                  />
                  <span className="text-xs text-stone-500">అడ్మిన్ డౌన్‌లోడ్ &amp; పరిశీలన కోసం</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg bg-red-800 px-6 py-3 text-sm font-bold text-white hover:bg-red-900 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                రిపోర్టర్‌గా రిజిస్టర్ చేయండి · Submit Reporter Registration
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Reporter Account Switcher / Login & Press ID Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-stone-200 rounded-xl p-5">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <h3 className="text-base font-bold text-stone-900">{t.reporterLoginHeading}</h3>
                {currentReporter && (
                  <button
                    type="button"
                    onClick={handleReporterLogout}
                    className="text-xs font-bold text-red-800 hover:underline flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Logout
                  </button>
                )}
              </div>

              {/* Quick Switch between Sample Approved & Pending or Newly Registered Reporters */}
              <div className="mt-3">
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  Active Reporter Session (Demo / Registered Accounts):
                </label>
                <select
                  aria-label="Switch Active Reporter Account"
                  value={loggedInReporterId || ''}
                  onChange={(e) => setLoggedInReporterId(e.target.value || null)}
                  className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-900"
                >
                  <option value="">-- లాగౌట్ స్థితి (Logged Out) --</option>
                  {portalState.reporters.map((rep) => (
                    <option key={rep.id} value={rep.id}>
                      {rep.fullName} — {rep.mandal} ({rep.status.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <form onSubmit={handleLoginSubmit} className="mt-4 space-y-3 border-t border-stone-100 pt-3">
                <div className="text-xs font-semibold text-stone-500">
                  యూజర్‌నేమ్ &amp; పాస్‌వర్డ్‌తో లాగిన్ అవ్వండి:
                </div>
                {loginError && (
                  <p className="text-xs text-red-700 bg-red-50 p-2 rounded font-semibold">
                    {loginError}
                  </p>
                )}
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Username (e.g. ramana_huzurabad)"
                  aria-label="Reporter Login Username"
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900"
                />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Password (e.g. Reporter@123)"
                  aria-label="Reporter Login Password"
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900"
                />
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-800 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Login to Reporter Desk
                </button>
              </form>
            </div>

            {/* Active Reporter Profile & Press ID Card Status */}
            {currentReporter ? (
              <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={currentReporter.photoUrl}
                    alt={currentReporter.fullName}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-lg object-cover border border-stone-300 shrink-0"
                  />
                  <div>
                    <span className="text-xs font-mono text-stone-500 tabular-nums">
                      {currentReporter.reporterCode}
                    </span>
                    <h4 className="text-base font-bold text-stone-900">
                      {currentReporter.fullName}
                    </h4>
                    <p className="text-xs font-semibold text-red-800">
                      మండలం: {currentReporter.mandal}
                    </p>
                  </div>
                </div>

                <div className="text-xs space-y-1.5 border-t border-b border-stone-200 py-3">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Account Status:</span>
                    {currentReporter.status === 'approved' ? (
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t.approvedBadge}
                      </span>
                    ) : currentReporter.status === 'blocked' ? (
                      <span className="font-bold text-red-700 flex items-center gap-1">
                        <Ban className="w-3.5 h-3.5" />
                        అడ్మిన్ బ్లాక్ చేశారు (Blocked)
                      </span>
                    ) : (
                      <span className="font-bold text-amber-700 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {t.pendingApprovalBadge}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">State &amp; District:</span>
                    <span className="font-medium text-stone-800">
                      {currentReporter.district}, {currentReporter.state}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Press ID Number:</span>
                    <span className="font-mono font-bold text-stone-900 tabular-nums">
                      {currentReporter.idCardNumber}
                    </span>
                  </div>
                </div>

                {currentReporter.status === 'approved' ? (
                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={() => setShowIdCardModal(true)}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-800 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-900 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      {t.downloadPressId}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onOpenMandalPage(
                          currentReporter.state,
                          currentReporter.district,
                          currentReporter.mandal
                        )
                      }
                      className="w-full flex items-center justify-center gap-2 rounded-lg border border-stone-300 bg-stone-50 px-4 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-100 transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5 text-red-800" />
                      నా మండల పేజీ తెరవండి ({currentReporter.mandal})
                    </button>
                  </div>
                ) : currentReporter.status === 'blocked' ? (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-900 font-medium">
                    <strong>హెచ్చరిక:</strong> మీ రిపోర్టర్ ఖాతా అడ్మిన్ ద్వారా బ్లాక్ చేయబడింది. మీరు వార్తలు అప్‌లోడ్ చేయలేరు.
                  </div>
                ) : (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
                    <strong>గమనిక:</strong> మీ ఖాతా ప్రస్తుతం అడ్మిన్ ఆమోదం కోసం వేచి ఉంది. అడ్మిన్ ఆమోదించిన వెంటనే మీ <strong>Press ID Card</strong> ఆటోమేటిక్‌గా జెనరేట్ అవుతుంది మరియు వార్తలు అప్‌లోడ్ చేసే ఆప్షన్ అన్‌లాక్ అవుతుంది.
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleReporterLogout}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  రిపోర్టర్ లాగౌట్ · Logout Reporter
                </button>
              </div>
            ) : (
              <div className="bg-stone-100 border border-stone-200 rounded-xl p-5 text-center space-y-2">
                <p className="text-sm font-bold text-stone-800">
                  మీరు ప్రస్తుతం రిపోర్టర్ డ్యాష్‌బోర్డు నుండి లాగౌట్ అయ్యారు.
                </p>
                <p className="text-xs text-stone-600">
                  వార్తలు అప్‌లోడ్ చేయడానికి లేదా ప్రెస్ ఐడి కార్డు డౌన్‌లోడ్ చేసుకోవడానికి పై ఫారమ్‌లో లాగిన్ అవ్వండి.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Mandal-Locked News Upload Form & Reporter's Published News */}
          <div className="lg:col-span-8 space-y-6">
            {currentReporter ? (
              <>
                <div className="bg-white border border-stone-200 rounded-xl p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-4 mb-5">
                    <div>
                      <h3 className="text-lg font-bold text-stone-900">
                        మండల వార్త అప్‌లోడ్ డెస్క్ · Upload Mandal News
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">
                        రిపోర్టర్ ఏ మండలంలో రిజిస్టర్ అయ్యారో ఆ మండలంలో మాత్రమే వార్త పబ్లిష్ అవుతుంది.
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-red-900 bg-red-50 border border-red-200 px-3 py-1.5 rounded-md">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Locked Mandal: {currentReporter.mandal}</span>
                    </div>
                  </div>

                  {publishStatus && (
                    <div
                      className={`mb-5 p-3.5 rounded-lg border text-xs font-semibold ${
                        publishStatus.type === 'success'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-red-50 border-red-200 text-red-900'
                      }`}
                    >
                      {publishStatus.text}
                    </div>
                  )}

                  <form onSubmit={handlePublishSubmit} className="space-y-4">
                    {/* Locked Jurisdiction Display */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-stone-50 p-3.5 rounded-lg border border-stone-200 text-xs">
                      <div>
                        <span className="text-stone-500 block">రాష్ట్రం (State - Locked)</span>
                        <span className="font-bold text-stone-900">{currentReporter.state}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 block">జిల్లా (District - Locked)</span>
                        <span className="font-bold text-stone-900">{currentReporter.district}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 block">మండలం (Mandal - Locked)</span>
                        <span className="font-bold text-red-800">{currentReporter.mandal}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          వార్త శీర్షిక (Telugu Headline) *
                        </label>
                        <input
                          type="text"
                          required
                          disabled={currentReporter.status !== 'approved'}
                          value={newsTitleTe}
                          onChange={(e) => setNewsTitleTe(e.target.value)}
                          placeholder={`${currentReporter.mandal} మండలంలో...`}
                          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 disabled:bg-stone-100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          కేటగిరీ (Category)
                        </label>
                        <select
                          aria-label="Select News Category"
                          disabled={currentReporter.status !== 'approved'}
                          value={newsCategory}
                          onChange={(e) => setNewsCategory(e.target.value)}
                          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 disabled:bg-stone-100"
                        >
                          <option value="మండల అభివృద్ధి · Mandal Development">
                            మండల అభివృద్ధి · Mandal Development
                          </option>
                          <option value="వ్యవసాయం & రైతు వేదిక · Agriculture">
                            వ్యవసాయం &amp; రైతు వేదిక · Agriculture
                          </option>
                          <option value="స్థానిక పరిపాలన · Grama Sabha">
                            స్థానిక పరిపాలన · Grama Sabha
                          </option>
                          <option value="విద్య & వైద్యం · Education & Health">
                            విద్య &amp; వైద్యం · Education &amp; Health
                          </option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone-600 mb-1">
                          Hindi Headline (Optional - Auto-synced if blank)
                        </label>
                        <input
                          type="text"
                          disabled={currentReporter.status !== 'approved'}
                          value={newsTitleHi}
                          onChange={(e) => setNewsTitleHi(e.target.value)}
                          placeholder="हिंदी शीर्षक (वैकल्पिक)"
                          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900 disabled:bg-stone-100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-600 mb-1">
                          English Headline (Optional - Auto-synced if blank)
                        </label>
                        <input
                          type="text"
                          disabled={currentReporter.status !== 'approved'}
                          value={newsTitleEn}
                          onChange={(e) => setNewsTitleEn(e.target.value)}
                          placeholder="English Headline (Optional)"
                          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900 disabled:bg-stone-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        క్లుప్త సారాంశం (Short Summary)
                      </label>
                      <input
                        type="text"
                        disabled={currentReporter.status !== 'approved'}
                        value={newsSummaryTe}
                        onChange={(e) => setNewsSummaryTe(e.target.value)}
                        placeholder="1-2 వాక్యాలలో ముఖ్యాంశం..."
                        className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 disabled:bg-stone-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        పూర్తి వార్తా వివరాలు (Full News Report) *
                      </label>
                      <textarea
                        rows={4}
                        required
                        disabled={currentReporter.status !== 'approved'}
                        value={newsContentTe}
                        onChange={(e) => setNewsContentTe(e.target.value)}
                        placeholder={`${currentReporter.mandal} మండల పరిధిలో జరిగిన పూర్తి వివరాలను నమోదు చేయండి...`}
                        className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 disabled:bg-stone-100"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          వార్త ఫోటో అప్‌లోడ్ · News Photo Upload
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={currentReporter.status !== 'approved'}
                          onChange={(e) => handleFileUpload(e, setNewsImageUrl)}
                          className="w-full text-xs text-stone-600 file:mr-2 file:rounded file:border-0 file:bg-stone-200 file:px-2.5 file:py-1.5 file:text-xs file:font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          YouTube వీడియో లింక్ (Optional)
                        </label>
                        <input
                          type="url"
                          disabled={currentReporter.status !== 'approved'}
                          value={newsYoutubeUrl}
                          onChange={(e) => setNewsYoutubeUrl(e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900 disabled:bg-stone-100"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={currentReporter.status !== 'approved'}
                        className="flex items-center gap-2 rounded-lg bg-red-800 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Upload className="w-4 h-4" />
                        {currentReporter.status === 'approved'
                          ? `${currentReporter.mandal} మండలంలో వార్త పబ్లిష్ చేయండి`
                          : currentReporter.status === 'blocked'
                          ? 'ఖాతా బ్లాక్ చేయబడింది (Blocked by Admin)'
                          : 'అడ్మిన్ ఆమోదం తర్వాత మాత్రమే అప్‌లోడ్ సాధ్యం'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Reporter Private Ads: Banner Ads & Classifieds Section with All Categories */}
                <div
                  className="bg-white border border-stone-200 rounded-xl p-6"
                  data-testid="reporter-private-ads-section"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-4 mb-5">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
                        <Megaphone className="w-4 h-4 text-red-800" />
                        <span>REPORTER PRIVATE ADS · CLASSIFIEDS &amp; BANNER ADS DESK</span>
                      </div>
                      <h3 className="text-lg font-bold text-stone-900 mt-1">
                        ప్రైవేట్ యాడ్స్ బుకింగ్ (బ్యానర్ యాడ్స్ &amp; క్లాసిఫైడ్స్ — అన్ని కేటగిరీలు)
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">
                        రిపోర్టర్లు తమ మండల / జిల్లా / రాష్ట్ర / హోమ్ పేజీ పరిధిలో అన్ని కేటగిరీల బ్యానర్ ప్రకటనలు మరియు క్లాసిఫైడ్ ప్రకటనలను బుక్ చేయవచ్చు (అడ్మిన్ ఆమోదం తప్పనిసరి).
                      </p>
                    </div>
                  </div>

                  {repAdStatus && (
                    <div
                      className={`mb-5 p-3.5 rounded-lg border text-xs font-semibold ${
                        repAdStatus.type === 'success'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-red-50 border-red-200 text-red-900'
                      }`}
                    >
                      {repAdStatus.text}
                    </div>
                  )}

                  <form onSubmit={handleReporterAdSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          యాడ్ రకం · Ad Format (Banner / Classified) *
                        </label>
                        <select
                          aria-label="Reporter Ad Format"
                          value={repAdFormat}
                          onChange={(e) => setRepAdFormat(e.target.value as AdFormat)}
                          className="w-full rounded-lg border border-stone-300 bg-amber-50/60 px-3 py-2 text-xs font-bold text-stone-900"
                        >
                          <option value="banner">బ్యానర్ యాడ్ · Banner Advertisement</option>
                          <option value="classified">క్లాసిఫైడ్ యాడ్ · Classified Section Ad</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          కేటగిరీ · All Private Ad Categories *
                        </label>
                        <select
                          aria-label="Reporter Private Ad Category"
                          value={repAdCategory}
                          onChange={(e) => setRepAdCategory(e.target.value)}
                          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900"
                        >
                          {PRIVATE_AD_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          ప్రకటన పరిధి · Ad Scope *
                        </label>
                        <select
                          aria-label="Reporter Private Ad Scope"
                          value={repAdScope}
                          onChange={(e) => setRepAdScope(e.target.value as AdScope)}
                          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900"
                        >
                          <option value="mandal">మండల వారీగా ({currentReporter.mandal})</option>
                          <option value="district">జిల్లా వారీగా ({currentReporter.district})</option>
                          <option value="state">రాష్ట్ర వారీగా ({currentReporter.state})</option>
                          <option value="home">హోమ్ పేజీ వారీగా (Home Page Wise)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-1">
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          ప్రకటన శీర్షిక · Ad Headline *
                        </label>
                        <input
                          type="text"
                          required
                          value={repAdTitle}
                          onChange={(e) => setRepAdTitle(e.target.value)}
                          placeholder="ఉదా: శ్రీ లక్ష్మీ జ్యువెలర్స్ / ఓపెన్ ప్లాట్లు అమ్మకానికి"
                          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          వ్యాపార సంస్థ / ప్రకటనదారు పేరు *
                        </label>
                        <input
                          type="text"
                          required
                          value={repAdAdvertiser}
                          onChange={(e) => setRepAdAdvertiser(e.target.value)}
                          placeholder="Advertiser / Business Name"
                          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          సంప్రదించవలసిన ఫోన్ · Contact Phone *
                        </label>
                        <input
                          type="tel"
                          required
                          value={repAdPhone}
                          onChange={(e) => setRepAdPhone(e.target.value)}
                          placeholder="98480 12345"
                          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-mono text-stone-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        ప్రకటన పూర్తి మేటర్ · Advertisement Matter *
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={repAdMatter}
                        onChange={(e) => setRepAdMatter(e.target.value)}
                        placeholder="ప్రకటన పూర్తి వివరాలు, ఆఫర్లు, చిరునామా రాయండి..."
                        className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900"
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 bg-stone-50 p-3.5 rounded-lg border border-stone-200">
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, setRepAdImageUrl)}
                          className="text-xs text-stone-600 file:mr-2 file:rounded file:border-0 file:bg-stone-800 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                        />
                        <img
                          src={repAdImageUrl}
                          alt="Reporter Ad Banner Preview"
                          referrerPolicy="no-referrer"
                          className="w-20 h-12 rounded object-cover border border-stone-300"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={currentReporter.status === 'blocked'}
                        className="flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-xs font-bold text-stone-950 hover:bg-amber-400 transition-colors disabled:opacity-50"
                      >
                        <Megaphone className="w-4 h-4" />
                        ప్రైవేట్ యాడ్ (Banner / Classified) అడ్మిన్ ఆమోదానికి పంపండి
                      </button>
                    </div>
                  </form>

                  {reporterAds.length > 0 && (
                    <div className="mt-5 pt-4 border-t border-stone-200">
                      <h5 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-3">
                        ఈ మండల ప్రైవేట్ యాడ్స్ &amp; క్లాసిఫైడ్స్ స్థితి ({reporterAds.length})
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {reporterAds.map((ad) => (
                          <div
                            key={ad.id}
                            className="flex items-center justify-between gap-3 rounded-lg border border-stone-200 bg-stone-50 p-3 text-xs"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-red-900">
                                  {(ad.adFormat || 'banner') === 'classified'
                                    ? '[CLASSIFIED]'
                                    : '[BANNER AD]'}
                                </span>
                                <span className="text-stone-500 truncate">{ad.category}</span>
                              </div>
                              <div className="font-bold text-stone-900 truncate mt-0.5">
                                {ad.title}
                              </div>
                            </div>
                            <span
                              className={`shrink-0 font-bold px-2 py-0.5 rounded text-[11px] ${
                                ad.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {ad.status === 'approved' ? 'APPROVED' : 'PENDING'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Reporter's Mandal News List & Views */}
                <div className="bg-white border border-stone-200 rounded-xl p-6">
                  <h4 className="text-base font-bold text-stone-900 border-b border-stone-200 pb-3 mb-4">
                    ఈ మండలంలో ప్రచురితమైన వార్తలు &amp; వీక్షణలు ({currentReporter.mandal})
                  </h4>
                  <div className="divide-y divide-stone-200">
                    {reporterArticles.map((art) => (
                      <div key={art.id} className="py-3.5 flex items-center justify-between gap-4">
                        <div>
                          <div className="text-xs text-stone-500">
                            <span>{art.mandal}</span>
                            <span className="mx-1.5">·</span>
                            <span>{art.publishedAt}</span>
                          </div>
                          <h5 className="text-sm font-bold text-stone-900 mt-0.5">
                            {art.title[lang]}
                          </h5>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-stone-700 tabular-nums shrink-0">
                          <Eye className="w-4 h-4 text-red-800" />
                          <span>{art.views.toLocaleString('en-IN')} views</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white border border-stone-200 rounded-xl p-8 text-center space-y-3">
                <h3 className="text-lg font-bold text-stone-900">
                  రిపోర్టర్ డ్యాష్‌బోర్డ్ లాగిన్ అవసరం
                </h3>
                <p className="text-xs text-stone-600 max-w-md mx-auto">
                  మీ మండల వార్తలు అప్‌లోడ్ చేయడానికి లేదా మీ అధికారిక ప్రెస్ ఐడి కార్డును డౌన్‌లోడ్ చేసుకోవడానికి ఎడమవైపు ఉన్న లాగిన్ బాక్స్‌లో మీ యూజర్‌నేమ్ మరియు పాస్‌వర్డ్ నమోదు చేయండి.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {showIdCardModal && currentReporter && (
        <PressIdCardModal
          reporter={currentReporter}
          logoUrl={portalState.logoUrl}
          onClose={() => setShowIdCardModal(false)}
        />
      )}
    </section>
  );
}
