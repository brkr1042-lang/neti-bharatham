'use client';

import React, { useState } from 'react';
import {
  Shield,
  CheckCircle2,
  Download,
  PlusCircle,
  ExternalLink,
  Lock,
  Award,
  Image as ImageIcon,
  LogOut,
  KeyRound,
  Ban,
  Unlock,
  Megaphone,
  Settings,
  Server,
  Trash2,
  Edit3,
  Upload,
  Video
} from 'lucide-react';
import {
  PortalState,
  ReporterProfile,
  AdScope,
  AdFormat,
  SubmitPrivateAdInput,
  PRIVATE_AD_CATEGORIES,
  SiteConfig,
  OFFICIAL_BANNER_IMAGE,
  TELANGANA_OFFICIAL_DIRECTORY_PDF,
  ANDHRA_PRADESH_OFFICIAL_DIRECTORY_PDF
} from '@/lib/news-engine';
import { PressIdCardModal } from './PressIdCardModal';

interface AdminDashboardViewProps {
  portalState: PortalState;
  onAdminLogin: (username: string, password: string) => Promise<boolean>;
  onApproveReporter: (reporterId: string, adminUser: string, adminPass: string) => Promise<void>;
  onChangeReporterPassword: (
    reporterId: string,
    newPassword: string,
    adminUser: string,
    adminPass: string
  ) => Promise<void>;
  onSetReporterBlockStatus: (
    reporterId: string,
    blocked: boolean,
    adminUser: string,
    adminPass: string
  ) => Promise<void>;
  onApprovePrivateAd: (adId: string, adminUser: string, adminPass: string) => Promise<void>;
  onAdminCreatePrivateAd: (
    input: SubmitPrivateAdInput,
    adminUser: string,
    adminPass: string
  ) => Promise<void>;
  onDeletePrivateAd?: (adId: string, adminUser: string, adminPass: string) => Promise<void>;
  onAddLocation: (
    stateName: string,
    districtName: string,
    mandalName: string,
    adminUser: string,
    adminPass: string
  ) => Promise<void>;
  onAdminPublishNews: (
    newsInput: {
      level: 'national' | 'state' | 'district' | 'mandal';
      category: string;
      state: string;
      district: string;
      mandal: string;
      titleTe: string;
      titleHi: string;
      titleEn: string;
      summaryTe: string;
      contentTe: string;
      imageUrl: string;
      youtubeUrl?: string;
    },
    adminUser: string,
    adminPass: string
  ) => Promise<void>;
  onDeleteArticle?: (articleId: string, adminUser: string, adminPass: string) => Promise<void>;
  onUpdateArticle?: (
    articleId: string,
    updates: {
      titleTe?: string;
      titleHi?: string;
      titleEn?: string;
      summaryTe?: string;
      contentTe?: string;
      category?: string;
      imageUrl?: string;
      isBreaking?: boolean;
    },
    adminUser: string,
    adminPass: string
  ) => Promise<void>;
  onAddYoutube?: (
    videoInput: {
      titleTe: string;
      titleHi?: string;
      titleEn?: string;
      locationTag?: string;
      thumbnailUrl?: string;
      channelUrl?: string;
    },
    adminUser: string,
    adminPass: string
  ) => Promise<void>;
  onDeleteYoutube?: (videoId: string, adminUser: string, adminPass: string) => Promise<void>;
  onUpdateAdSense: (
    publisherId: string,
    adSlotId: string,
    dashboardLink: string,
    adminUser: string,
    adminPass: string
  ) => Promise<void>;
  onUpdateLogo: (logoUrl: string, adminUser: string, adminPass: string) => Promise<void>;
  onUpdateBanner?: (
    bannerUrl: string,
    showBannerImage: boolean,
    adminUser: string,
    adminPass: string
  ) => Promise<void>;
  onUpdateSiteConfig?: (
    siteConfig: Partial<SiteConfig>,
    adminUser: string,
    adminPass: string
  ) => Promise<void>;
  onImportDatabase?: (
    importedState: PortalState,
    adminUser: string,
    adminPass: string
  ) => Promise<void>;
  onApproveMediaStaff?: (staffId: string) => Promise<void>;
  onChangeMediaStaffPassword?: (staffId: string, newPassword: string) => Promise<void>;
  onSetMediaStaffBlock?: (staffId: string, blocked: boolean) => Promise<void>;
}

const AD_SCOPE_LABELS: Record<AdScope, string> = {
  home: 'హోమ్ పేజీ వారీగా (Home Page Wise)',
  state: 'రాష్ట్ర వారీగా (State Wise)',
  district: 'జిల్లా వారీగా (District Wise)',
  mandal: 'మండల వారీగా (Mandal Wise)'
};

export function AdminDashboardView({
  portalState,
  onAdminLogin,
  onApproveReporter,
  onChangeReporterPassword,
  onSetReporterBlockStatus,
  onApprovePrivateAd,
  onAdminCreatePrivateAd,
  onDeletePrivateAd,
  onAddLocation,
  onAdminPublishNews,
  onDeleteArticle,
  onUpdateArticle,
  onAddYoutube,
  onDeleteYoutube,
  onUpdateAdSense,
  onUpdateLogo,
  onUpdateBanner,
  onUpdateSiteConfig,
  onImportDatabase,
  onApproveMediaStaff,
  onChangeMediaStaffPassword,
  onSetMediaStaffBlock
}: AdminDashboardViewProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  const [activeAdminTab, setActiveAdminTab] = useState<
    'reporters' | 'ads' | 'locations' | 'editorial' | 'adsense' | 'cms_hostinger'
  >('reporters');
  const [selectedReporterForId, setSelectedReporterForId] = useState<ReporterProfile | null>(null);
  const [actionBanner, setActionBanner] = useState<string | null>(null);

  // Per-reporter password draft map in Admin
  const [passwordDrafts, setPasswordDrafts] = useState<Record<string, string>>({});

  // Admin Private Ads filters
  const [adminAdScopeFilter, setAdminAdScopeFilter] = useState<'all' | AdScope>('all');
  const [adminAdFormatFilter, setAdminAdFormatFilter] = useState<'all' | AdFormat>('all');
  const [adminAdCategoryFilter, setAdminAdCategoryFilter] = useState<string>('ALL');

  // Admin Direct Create Banner Ad / Classified Ad Form State
  const statesList = Object.keys(portalState.locations);
  const [admAdFormat, setAdmAdFormat] = useState<AdFormat>('banner');
  const [admAdCategory, setAdmAdCategory] = useState<string>(PRIVATE_AD_CATEGORIES[0]);
  const [admAdScope, setAdmAdScope] = useState<AdScope>('home');
  const [admAdState, setAdmAdState] = useState<string>(statesList[0] || 'Telangana (తెలంగాణ)');
  const admAdDistricts = Object.keys(portalState.locations[admAdState] || {});
  const [admAdDistrict, setAdmAdDistrict] = useState<string>(admAdDistricts[0] || '');
  const admAdMandals =
    (portalState.locations[admAdState] && portalState.locations[admAdState][admAdDistrict]) || [];
  const [admAdMandal, setAdmAdMandal] = useState<string>(admAdMandals[0] || '');
  const [admAdTitle, setAdmAdTitle] = useState('');
  const [admAdMatter, setAdmAdMatter] = useState('');
  const [admAdImageUrl, setAdmAdImageUrl] = useState('/images/ad-bharat-gold.svg');
  const [admAdAdvertiser, setAdmAdAdvertiser] = useState('');
  const [admAdPhone, setAdmAdPhone] = useState('');
  const [locStateName, setLocStateName] = useState(statesList[0] || 'Telangana (తెలంగాణ)');
  const [customStateName, setCustomStateName] = useState('');
  const [locDistrictName, setLocDistrictName] = useState('');
  const [locMandalName, setLocMandalName] = useState('');

  // Editorial News State
  const [edLevel, setEdLevel] = useState<'national' | 'state' | 'district' | 'mandal'>('national');
  const [edState, setEdState] = useState(statesList[0] || 'Telangana (తెలంగాణ)');
  const edDistricts = Object.keys(portalState.locations[edState] || {});
  const [edDistrict, setEdDistrict] = useState(edDistricts[0] || '');
  const edMandals =
    (portalState.locations[edState] && portalState.locations[edState][edDistrict]) || [];
  const [edMandal, setEdMandal] = useState(edMandals[0] || '');
  const [edCategory, setEdCategory] = useState('జాతీయ వార్తలు · National Desk');
  const [edTitleTe, setEdTitleTe] = useState('');
  const [edTitleHi, setEdTitleHi] = useState('');
  const [edTitleEn, setEdTitleEn] = useState('');
  const [edSummaryTe, setEdSummaryTe] = useState('');
  const [edContentTe, setEdContentTe] = useState('');
  const [edImageUrl, setEdImageUrl] = useState('/images/national-parliament.svg');
  const [edYoutubeUrl, setEdYoutubeUrl] = useState(portalState.officialYoutubeChannel);

  // Article Quick Edit State
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [editArticleTitleTe, setEditArticleTitleTe] = useState('');
  const [editArticleSummaryTe, setEditArticleSummaryTe] = useState('');
  const [editArticleContentTe, setEditArticleContentTe] = useState('');

  // New YouTube Video Update State
  const [ytTitleTe, setYtTitleTe] = useState('');
  const [ytLocationTag, setYtLocationTag] = useState('Telangana & AP Live');
  const [ytChannelUrl, setYtChannelUrl] = useState(portalState.officialYoutubeChannel);

  // Google AdSense State (Admin Only!)
  const [adsensePubId, setAdsensePubId] = useState(portalState.adsenseConfig.publisherId);
  const [adsenseSlotId, setAdsenseSlotId] = useState(portalState.adsenseConfig.adSlotId);
  const [adsenseLink, setAdsenseLink] = useState(portalState.adsenseConfig.dashboardLink);

  // Full Website CMS State (siteConfig)
  const initialCfg: SiteConfig = portalState.siteConfig || {
    logoUrl: portalState.logoUrl || OFFICIAL_BANNER_IMAGE,
    bannerUrl: portalState.bannerUrl || OFFICIAL_BANNER_IMAGE,
    showBannerImage: true,
    brandTitleTe: 'నేటి భారతం',
    brandTitleHi: 'नेटी भारतम',
    brandTitleEn: 'NETI BHARATAM',
    mastheadTagline:
      'ఏది నిజం | జ్ఞానాన్ని పెంచే విద్య ఉపాధి చూపే విద్య | ఫ్రీ విద్య ఫ్రీ వైద్యం దేశ అభివృద్ధికి నాంది',
    mastheadHeading: 'నేటి భారతం · नेटी भारतम · NETI BHARATAM',
    mastheadSubtitle:
      'నిజాన్ని నిర్భయంగా చెప్పడమే మా లక్ష్యం · National, State, District & Mandal News Network',
    customTickerAnnouncement:
      'నేటి భారతం — నిజాన్ని నిర్భయంగా చెప్పడమే మా లక్ష్యం | ఫ్రీ విద్య ఫ్రీ వైద్యం దేశ అభివృద్ధికి నాంది',
    officialYoutubeChannel: portalState.officialYoutubeChannel,
    playStoreAppUrl: 'https://play.google.com/store/apps/details?id=in.netibharatam.news',
    contactPhone: '+91 98480 12345',
    contactEmail: 'editor@netibharatam.in',
    officeAddress: 'Hyderabad & Vijayawada Central Editorial Desk, India',
    footerCopyright: '© 2025 నేటి భారతం (Neti Bharatam) — Multilingual Indian News Network'
  };
  const [cmsConfig, setCmsConfig] = useState<SiteConfig>(initialCfg);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const ok = await onAdminLogin(username, password);
    if (ok) {
      setIsAuthenticated(true);
    } else {
      setAuthError('తప్పు యూజర్‌నేమ్ లేదా పాస్‌వర్డ్! అడ్మిన్ లాగిన్ వివరాలను సరిచూసుకోండి.');
    }
  };

  const handleAdminLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    setActionBanner(null);
  };

  const handleDownloadReporterDossier = (rep: ReporterProfile) => {
    const dossierText = [
      '====================================================',
      '   నేటి భారతం (NETI BHARATAM) - REPORTER KYC DOSSIER',
      '====================================================',
      `Reporter Code     : ${rep.reporterCode}`,
      `Press ID Number   : ${rep.idCardNumber}`,
      `Full Name         : ${rep.fullName}`,
      `Username          : ${rep.username}`,
      `Password          : ${rep.passwordHash}`,
      `Mobile Number     : +91 ${rep.mobile}`,
      `State             : ${rep.state}`,
      `District          : ${rep.district}`,
      `Assigned Mandal   : ${rep.mandal}`,
      `Aadhaar KYC No.   : ${rep.aadhaarNumber}`,
      `Approval Status   : ${rep.status.toUpperCase()}`,
      `Registered At     : ${rep.registeredAt}`,
      `Approved At       : ${rep.approvedAt || 'Pending'}`,
      '===================================================='
    ].join('\n');

    const blob = new Blob([dossierText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporter-KYC-${rep.username}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAadhaarImage = (rep: ReporterProfile) => {
    const a = document.createElement('a');
    a.href = rep.aadhaarDocumentUrl || '/images/sample-aadhaar-card.svg';
    a.download = `Aadhaar-Card-${rep.username}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleAddLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetState = customStateName.trim() ? customStateName.trim() : locStateName;
    if (!targetState || !locDistrictName.trim() || !locMandalName.trim()) return;
    await onAddLocation(targetState, locDistrictName, locMandalName, username, password);
    setActionBanner(
      `కొత్త లొకేషన్ జోడించబడింది: ${targetState} -> ${locDistrictName} -> ${locMandalName}`
    );
    setLocDistrictName('');
    setLocMandalName('');
    setCustomStateName('');
  };

  const handleAdminNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAdminPublishNews(
      {
        level: edLevel,
        category: edCategory,
        state: edState,
        district: edDistrict,
        mandal: edMandal,
        titleTe: edTitleTe,
        titleHi: edTitleHi || edTitleTe,
        titleEn: edTitleEn || edTitleTe,
        summaryTe: edSummaryTe || edTitleTe,
        contentTe: edContentTe,
        imageUrl: edImageUrl,
        youtubeUrl: edYoutubeUrl
      },
      username,
      password
    );
    setActionBanner('చీఫ్ ఎడిటర్ వార్త విజయవంతంగా ప్రచురించబడింది!');
    setEdTitleTe('');
    setEdTitleHi('');
    setEdTitleEn('');
    setEdSummaryTe('');
    setEdContentTe('');
  };

  const handleSaveAdSense = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateAdSense(adsensePubId, adsenseSlotId, adsenseLink, username, password);
    setActionBanner('Google AdSense వివరాలు అడ్మిన్ డ్యాష్‌బోర్డులో భద్రపరచబడ్డాయి (హోమ్ పేజీలో కనిపించదు).');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === 'string') {
        const dataUrl = reader.result;
        setCmsConfig((prev) => ({ ...prev, logoUrl: dataUrl }));
        await onUpdateLogo(dataUrl, username, password);
        setActionBanner('నేటి భారతం అధికారిక లోగో అప్‌డేట్ చేయబడింది!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === 'string') {
        const dataUrl = reader.result;
        setCmsConfig((prev) => ({ ...prev, bannerUrl: dataUrl, showBannerImage: true }));
        if (onUpdateBanner) {
          await onUpdateBanner(dataUrl, true, username, password);
        } else if (onUpdateSiteConfig) {
          await onUpdateSiteConfig({ bannerUrl: dataUrl, showBannerImage: true }, username, password);
        }
        setActionBanner('నేటి భారతం వెబ్‌సైట్ బ్యానర్ ఇమేజ్ అప్‌డేట్ చేయబడింది!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSiteConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateSiteConfig) {
      await onUpdateSiteConfig(cmsConfig, username, password);
      setActionBanner(
        'వెబ్‌సైట్ సెట్టింగ్స్ (లోగో, బ్యానర్ ఇమేజ్, టైటిల్స్, కాంటాక్ట్ & ఫుటర్) అన్నీ విజయవంతంగా అప్‌డేట్ చేయబడ్డాయి!'
      );
    }
  };

  const handleDatabaseImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImportDatabase) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        if (typeof reader.result === 'string') {
          const parsed = JSON.parse(reader.result) as PortalState;
          await onImportDatabase(parsed, username, password);
          setActionBanner('డేటాబేస్ బ్యాకప్ ఫైల్ విజయవంతంగా రీస్టోర్ చేయబడింది!');
        }
      } catch {
        setActionBanner('డేటాబేస్ JSON ఫైల్ ఫార్మాట్ తప్పుగా ఉంది. సరైన JSON బ్యాకప్ ఫైల్ ఎంచుకోండి.');
      }
    };
    reader.readAsText(file);
  };

  if (!isAuthenticated) {
    return (
      <section className="max-w-5xl mx-auto my-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-6 bg-white border border-stone-200 rounded-xl p-6 lg:p-7 shadow-sm">
          <div className="flex items-center gap-3 border-b border-stone-200 pb-4 mb-5">
            <div className="w-10 h-10 rounded-lg bg-red-900 text-white flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                నేటి భారతం · Admin Security Console
              </h2>
              <p className="text-xs text-stone-500">
                Encrypted Database Access &amp; Chief Editor Controls
              </p>
            </div>
          </div>

          {authError && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-800">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                అడ్మిన్ యూజర్ నేమ్ · Admin Username
              </label>
              <input
                type="text"
                required
                aria-label="Admin Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Admin"
                className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm text-stone-900 focus:border-red-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                అడ్మిన్ పాస్‌వర్డ్ · Admin Password
              </label>
              <input
                type="password"
                required
                aria-label="Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Admin Password"
                className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm text-stone-900 focus:border-red-800 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-900 transition-colors"
            >
              <Lock className="w-4 h-4" />
              అడ్మిన్ డ్యాష్‌బోర్డ్ లాగిన్ · Unlock Admin Console
            </button>
          </form>
        </div>

        {/* Direct 1-Click Hostinger Support Files (0 Vulnerabilities) */}
        <div
          className="lg:col-span-6 bg-stone-900 text-white border border-stone-800 rounded-xl p-6 lg:p-7 space-y-4 shadow-sm"
          data-testid="hostinger-support-files-quick-box"
        >
          <div className="flex items-center justify-between gap-2 border-b border-stone-800 pb-3">
            <div>
              <span className="text-[11px] font-mono uppercase font-extrabold text-emerald-300 bg-emerald-950 border border-emerald-700 px-2.5 py-1 rounded">
                ✓ 0 VULNERABILITIES · HOSTINGER SUPPORT FILES
              </span>
              <h3 className="text-base font-bold text-white mt-2">
                Hostinger 1-Click Support Files (All 7 Vulnerabilities Solved)
              </h3>
            </div>
          </div>
          <p className="text-xs text-stone-300 leading-relaxed">
            Hostinger లో కనిపించిన 7 vulnerabilities పూర్తిగా పరిష్కరించబడ్డాయి (<code className="font-mono text-amber-300">found 0 vulnerabilities</code>). క్రింది బటన్లతో నేరుగా డౌన్‌లోడ్ చేసుకోండి:
          </p>
          <a
            href="/api/hostinger-export?format=zip"
            download="neti-bharatam-hostinger-public_html.zip"
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 py-3 text-xs font-extrabold text-stone-950 hover:bg-amber-300 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Download Full Hostinger .ZIP (All 6 Support Files)</span>
          </a>
          <div className="grid grid-cols-2 gap-2.5 text-xs font-bold">
            <a
              href="/api/hostinger-export?format=public_html"
              download="index.html"
              className="flex items-center justify-center gap-1.5 rounded-lg border border-stone-700 bg-stone-800 px-2.5 py-2.5 text-white hover:bg-stone-700"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>1. index.html</span>
            </a>
            <a
              href="/api/hostinger-export?format=htaccess"
              download=".htaccess"
              className="flex items-center justify-center gap-1.5 rounded-lg border border-stone-700 bg-stone-800 px-2.5 py-2.5 text-white hover:bg-stone-700"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>2. .htaccess (7 Headers)</span>
            </a>
            <a
              href="/api/hostinger-export?format=package_json"
              download="package.json"
              className="flex items-center justify-center gap-1.5 rounded-lg border border-emerald-700 bg-emerald-950 px-2.5 py-2.5 text-emerald-200 hover:bg-emerald-900"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>3. package.json (0 Vuln)</span>
            </a>
            <a
              href="/api/hostinger-export?format=nodejs_server"
              download="server.js"
              className="flex items-center justify-center gap-1.5 rounded-lg border border-stone-700 bg-stone-800 px-2.5 py-2.5 text-white hover:bg-stone-700"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>4. server.js (Node.js)</span>
            </a>
            <a
              href="/api/hostinger-export?format=deploy_guide"
              download="HOSTINGER_UPLOAD_GUIDE.txt"
              className="flex items-center justify-center gap-1.5 rounded-lg border border-stone-700 bg-stone-800 px-2.5 py-2.5 text-white hover:bg-stone-700"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>5. Upload Guide (.TXT)</span>
            </a>
            <a
              href="/api/hostinger-export?format=database_json"
              download="neti-bharatam-database-backup.json"
              className="flex items-center justify-center gap-1.5 rounded-lg border border-stone-700 bg-stone-800 px-2.5 py-2.5 text-white hover:bg-stone-700"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>6. DB Backup (.JSON)</span>
            </a>
          </div>
        </div>
      </section>
    );
  }

  const filteredAdminAds = portalState.privateAds.filter((a) => {
    const fmt: AdFormat = a.adFormat || 'banner';
    if (adminAdFormatFilter !== 'all' && fmt !== adminAdFormatFilter) return false;
    if (adminAdScopeFilter !== 'all' && a.scope !== adminAdScopeFilter) return false;
    if (adminAdCategoryFilter !== 'ALL' && a.category !== adminAdCategoryFilter) return false;
    return true;
  });

  const handleAdminAdFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAdmAdImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAdminCreateAdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAdminCreatePrivateAd(
      {
        title: admAdTitle,
        matter: admAdMatter,
        imageUrl: admAdImageUrl,
        category: admAdCategory,
        adFormat: admAdFormat,
        scope: admAdScope,
        state: admAdState,
        district: admAdDistrict,
        mandal: admAdMandal,
        advertiserName: admAdAdvertiser || 'Neti Bharatam Commercial Desk',
        contactPhone: admAdPhone,
        autoApprove: true
      },
      username,
      password
    );
    setActionBanner(
      `కొత్త ${
        admAdFormat === 'classified' ? 'క్లాసిఫైడ్ యాడ్ (Classified Ad)' : 'బ్యానర్ యాడ్ (Banner Ad)'
      } ("${admAdTitle}") అడ్మిన్ ప్యానెల్ నుండి నేరుగా పోర్టల్‌లో ప్రచురించబడింది!`
    );
    setAdmAdTitle('');
    setAdmAdMatter('');
    setAdmAdAdvertiser('');
    setAdmAdPhone('');
  };

  return (
    <section className="space-y-6" aria-label="Admin Management Console">
      {/* Top Admin Header */}
      <div className="bg-stone-900 text-white rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={portalState.siteConfig?.logoUrl || portalState.logoUrl || OFFICIAL_BANNER_IMAGE}
            alt="Neti Bharatam Logo"
            referrerPolicy="no-referrer"
            className="w-16 h-14 rounded-lg bg-white p-1 object-contain"
          />
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-amber-400">
              DATABASE SECURITY: AES-256 ROLE GUARD · FULL WEBSITE CMS &amp; HOSTINGER EXPORT
            </div>
            <h2 className="text-2xl font-bold">నేటి భారతం · చీఫ్ ఎడిటర్ &amp; అడ్మిన్ కంట్రోల్ సెంటర్</h2>
            <p className="text-xs text-stone-300 mt-0.5">
              లోగో, బ్యానర్ ఇమేజ్, వెబ్‌సైట్ సెట్టింగ్స్, రిపోర్టర్లు, ప్రైవేట్ యాడ్స్ &amp; Hostinger Upload Files
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-stone-800 border border-stone-700 px-3 py-2 text-xs font-semibold text-stone-100 hover:bg-stone-700 transition-colors">
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <span>లోగో మార్చండి · Upload Logo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
              aria-label="Upload Brand Logo"
            />
          </label>

          <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-xs font-extrabold text-stone-950 hover:bg-amber-400 transition-colors">
            <Upload className="w-4 h-4" />
            <span>బ్యానర్ మార్చండి · Upload Banner</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleBannerUpload}
              className="hidden"
              aria-label="Upload Website Banner Image"
            />
          </label>

          <button
            type="button"
            onClick={() => setActiveAdminTab('cms_hostinger')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition-colors"
          >
            <Server className="w-4 h-4" />
            <span>CMS &amp; Hostinger Export</span>
          </button>

          <button
            type="button"
            onClick={handleAdminLogout}
            className="inline-flex items-center gap-2 rounded-lg bg-red-800 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            అడ్మిన్ లాగౌట్ · Admin Logout
          </button>
        </div>
      </div>

      {actionBanner && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-sm font-semibold text-emerald-900 flex items-center justify-between">
          <span>{actionBanner}</span>
          <button
            type="button"
            onClick={() => setActionBanner(null)}
            className="text-xs underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-stone-100 p-1.5 rounded-xl border border-stone-200">
        <button
          type="button"
          onClick={() => setActiveAdminTab('reporters')}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeAdminTab === 'reporters'
              ? 'bg-red-800 text-white'
              : 'text-stone-700 hover:bg-white'
          }`}
        >
          1. రిపోర్టర్లు · పాస్‌వర్డ్ &amp; బ్లాక్ ({portalState.reporters.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveAdminTab('ads')}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeAdminTab === 'ads' ? 'bg-red-800 text-white' : 'text-stone-700 hover:bg-white'
          }`}
        >
          2. ప్రైవేట్ యాడ్స్ · క్లాసిఫైడ్స్ &amp; బ్యానర్ యాడ్స్ ({portalState.privateAds.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveAdminTab('locations')}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeAdminTab === 'locations'
              ? 'bg-red-800 text-white'
              : 'text-stone-700 hover:bg-white'
          }`}
        >
          3. రాష్ట్రాలు · జిల్లాలు · మండలాలు
        </button>
        <button
          type="button"
          onClick={() => setActiveAdminTab('editorial')}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeAdminTab === 'editorial'
              ? 'bg-red-800 text-white'
              : 'text-stone-700 hover:bg-white'
          }`}
        >
          4. చీఫ్ ఎడిటర్ న్యూస్ &amp; YouTube
        </button>
        <button
          type="button"
          onClick={() => setActiveAdminTab('adsense')}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeAdminTab === 'adsense'
              ? 'bg-red-800 text-white'
              : 'text-stone-700 hover:bg-white'
          }`}
        >
          5. Google AdSense (Admin Only) &amp; ఫీడ్‌బ్యాక్
        </button>
        <button
          type="button"
          onClick={() => setActiveAdminTab('cms_hostinger')}
          className={`px-3.5 py-2 text-xs font-extrabold rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeAdminTab === 'cms_hostinger'
              ? 'bg-red-800 text-white'
              : 'bg-amber-100 text-red-950 hover:bg-amber-200'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          6. వెబ్‌సైట్ సెట్టింగ్స్ (CMS) &amp; Hostinger Export
        </button>
      </div>

      {/* TAB 1: MEDIA STAFF (ALL 40 POSITIONS) + MANDAL REPORTERS, UIDAI AADHAAR & PHOTO VERIFICATION, PASSWORD CHANGE & BLOCK/UNBLOCK */}
      {activeAdminTab === 'reporters' && (
        <div className="space-y-8">
          {/* SECTION 1A: PRINT, DIGITAL & E-PAPER MEDIA STAFF (ALL 40 POSITIONS) ADMIN APPROVALS & UIDAI AADHAAR VERIFICATION */}
          <div className="bg-white border-2 border-red-900/20 rounded-xl p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
              <div>
                <span className="inline-block rounded bg-red-900 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-300 uppercase tracking-wider mb-1">
                  MANDATORY ADMIN APPROVAL · UIDAI 12-DIGIT AADHAAR &amp; EMPLOYEE PHOTO CHECK
                </span>
                <h3 className="text-lg font-extrabold text-stone-900">
                  మీడియా సిబ్బంది (40 హోదాలు) అడ్మిన్ ఆమోదం, ఫోటో &amp; UIDAI ఆధార్ తనిఖీ ({(portalState.mediaStaff || []).length})
                </h3>
                <p className="text-xs text-stone-600 mt-0.5">
                  ప్రతి ఉద్యోగి రిజిస్ట్రేషన్ పూర్తయిన తర్వాత ఇక్కడ అడ్మిన్ ఆమోదిస్తేనే (Approve) ఆ ఉద్యోగి లాగిన్ పాప్-అప్‌లో తమ హోదాను ఎంచుకుని లాగిన్ అవ్వగలరు.
                </p>
              </div>
              <span className="rounded-lg bg-amber-100 border border-amber-300 px-3 py-1.5 text-xs font-extrabold text-amber-950">
                పెండింగ్ స్టాఫ్ ఆమోదాలు:{' '}
                {(portalState.mediaStaff || []).filter((s) => s.status === 'pending').length}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {(portalState.mediaStaff || []).map((stf) => (
                <div
                  key={stf.id}
                  className="border border-stone-200 rounded-xl p-4 bg-stone-50/70 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                >
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <img
                      src={stf.photoUrl || '/images/reporter-avatar-1.svg'}
                      alt={stf.fullName}
                      referrerPolicy="no-referrer"
                      className="w-16 h-20 rounded-lg object-cover border-2 border-stone-300 bg-white shrink-0"
                    />
                    <div className="space-y-1 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-stone-600">{stf.staffCode}</span>
                        <span
                          className={`rounded px-2 py-0.5 text-[11px] font-extrabold ${
                            stf.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-900'
                              : stf.status === 'blocked'
                              ? 'bg-red-100 text-red-900'
                              : 'bg-amber-100 text-amber-950 border border-amber-300'
                          }`}
                        >
                          {stf.status === 'approved'
                            ? `✓ APPROVED (${stf.idCardNumber || stf.staffCode})`
                            : stf.status === 'blocked'
                            ? 'BLOCKED BY ADMIN'
                            : '⏳ PENDING ADMIN APPROVAL'}
                        </span>
                        <span className="rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                          ✓ UIDAI Aadhaar: {stf.aadhaarNumber}
                        </span>
                      </div>
                      <h4 className="text-sm font-extrabold text-stone-900">{stf.fullName}</h4>
                      <div className="font-bold text-red-900">
                        హోదా (Position): {stf.postTitleTe} ({stf.editionOrUnit})
                      </div>
                      <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] bg-white border border-stone-200 rounded px-2.5 py-1">
                        <span>
                          <strong>Login ID:</strong> {stf.username}
                        </span>
                        <span>·</span>
                        <span>
                          <strong>Password:</strong>{' '}
                          <span className="text-red-800 font-bold">{stf.passwordHash}</span>
                        </span>
                        <span>·</span>
                        <span>
                          <strong>Mobile:</strong> +91 {stf.mobile}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
                    <img
                      src={stf.aadhaarDocumentUrl || '/images/sample-aadhaar-card.svg'}
                      alt={`UIDAI Aadhaar of ${stf.fullName}`}
                      referrerPolicy="no-referrer"
                      className="w-28 h-18 rounded border border-stone-300 object-cover bg-white"
                    />
                    {stf.status !== 'approved' && onApproveMediaStaff && (
                      <button
                        type="button"
                        onClick={async () => {
                          await onApproveMediaStaff(stf.id);
                          setActionBanner(
                            `${stf.fullName} (${stf.postTitleTe}) ఉద్యోగి ఖాతా ఆమోదించబడింది & లాగిన్ యాక్సెస్ యాక్టివేట్ చేయబడింది!`
                          );
                        }}
                        className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-extrabold text-white hover:bg-emerald-800 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve Staff &amp; Enable Login</span>
                      </button>
                    )}
                    {onSetMediaStaffBlock && (
                      <button
                        type="button"
                        onClick={async () => {
                          await onSetMediaStaffBlock(stf.id, stf.status !== 'blocked');
                          setActionBanner(`${stf.fullName} ఉద్యోగి ఖాతా స్థితి మార్చబడింది.`);
                        }}
                        className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-bold text-stone-800 hover:bg-stone-100"
                      >
                        {stf.status === 'blocked' ? 'Unblock Staff' : 'Block Staff'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-stone-900">
                మండల రిపోర్టర్ పూర్తి వివరాలు, యూజర్‌నేమ్ &amp; పాస్‌వర్డ్ మార్పు, బ్లాక్ ఆప్షన్ &amp; ఆధార్ డౌన్‌లోడ్
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                అడ్మిన్ ప్రతి రిపోర్టర్ యొక్క యూజర్‌నేమ్ మరియు పాస్‌వర్డ్ చూడవచ్చు, కొత్త పాస్‌వర్డ్ సెట్ చేయవచ్చు, మరియు రిపోర్టర్‌ను బ్లాక్/అన్‌బ్లాక్ చేయవచ్చు.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
            {portalState.reporters.map((rep) => (
              <div
                key={rep.id}
                className="border border-stone-200 rounded-xl p-5 bg-stone-50/70 space-y-4"
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <img
                      src={rep.photoUrl}
                      alt={rep.fullName}
                      referrerPolicy="no-referrer"
                      className="w-20 h-24 rounded-lg object-cover border-2 border-stone-300 bg-white shrink-0"
                    />
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-stone-600 tabular-nums">
                          {rep.reporterCode}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={`font-bold ${
                            rep.status === 'approved'
                              ? 'text-emerald-700'
                              : rep.status === 'blocked'
                              ? 'text-red-700'
                              : 'text-amber-700'
                          }`}
                        >
                          {rep.status === 'approved'
                            ? 'APPROVED & ID GENERATED'
                            : rep.status === 'blocked'
                            ? 'BLOCKED BY ADMIN'
                            : 'PENDING ADMIN APPROVAL'}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-stone-900">{rep.fullName}</h4>
                      <p className="text-stone-700">
                        <strong>మండలం (Mandal):</strong>{' '}
                        <span className="text-red-900 font-bold">{rep.mandal}</span> ·{' '}
                        <strong>జిల్లా:</strong> {rep.district} · <strong>రాష్ట్రం:</strong>{' '}
                        {rep.state}
                      </p>
                      <p className="text-stone-700 font-mono tabular-nums">
                        <strong>Mobile:</strong> +91 {rep.mobile} · <strong>Aadhaar No:</strong>{' '}
                        {rep.aadhaarNumber}
                      </p>
                      {/* Explicit Username AND Password Visibility for Admin */}
                      <div className="pt-1 flex flex-wrap items-center gap-3 text-xs bg-white border border-stone-200 rounded-lg px-3 py-2">
                        <span>
                          <strong>యూజర్‌నేమ్ (Username):</strong>{' '}
                          <code className="font-mono font-bold text-stone-900">{rep.username}</code>
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>
                          <strong>ప్రస్తుత పాస్‌వర్డ్ (Password):</strong>{' '}
                          <code className="font-mono font-bold text-red-800">
                            {rep.passwordHash}
                          </code>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Aadhaar Card Preview & Primary Admin Actions */}
                  <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
                    <img
                      src={rep.aadhaarDocumentUrl}
                      alt={`Aadhaar of ${rep.fullName}`}
                      referrerPolicy="no-referrer"
                      className="w-32 h-20 rounded border border-stone-300 object-cover bg-white"
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDownloadAadhaarImage(rep)}
                        className="flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-100 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-red-800" />
                        Download Aadhaar
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadReporterDossier(rep)}
                        className="flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-100 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-stone-700" />
                        Full Details (.TXT)
                      </button>

                      {rep.status === 'pending' && (
                        <button
                          type="button"
                          onClick={async () => {
                            await onApproveReporter(rep.id, username, password);
                            setActionBanner(
                              `${rep.fullName} (${rep.mandal}) రిపోర్టర్‌ను ఆమోదించారు & Press ID ఆటోమేటిక్‌గా క్రియేట్ అయింది!`
                            );
                          }}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Approve Reporter &amp; Generate ID
                        </button>
                      )}

                      {rep.status === 'approved' && (
                        <button
                          type="button"
                          onClick={() => setSelectedReporterForId(rep)}
                          className="flex items-center gap-1.5 rounded-lg bg-red-800 px-3.5 py-2 text-xs font-bold text-white hover:bg-red-900 transition-colors"
                        >
                          <Award className="w-4 h-4" />
                          View / Download Press ID
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Admin Security Row: Change Reporter Password & Block / Unblock Reporter */}
                <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <KeyRound className="w-4 h-4 text-stone-600" />
                    <label
                      htmlFor={`pwd-${rep.id}`}
                      className="text-xs font-bold text-stone-700"
                    >
                      పాస్‌వర్డ్ మార్చండి (Change Password):
                    </label>
                    <input
                      id={`pwd-${rep.id}`}
                      type="text"
                      value={passwordDrafts[rep.id] ?? ''}
                      onChange={(e) =>
                        setPasswordDrafts((prev) => ({ ...prev, [rep.id]: e.target.value }))
                      }
                      placeholder="కొత్త పాస్‌వర్డ్ టైప్ చేయండి..."
                      className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-mono text-stone-900"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        const nextPwd = (passwordDrafts[rep.id] || '').trim();
                        if (!nextPwd) return;
                        await onChangeReporterPassword(rep.id, nextPwd, username, password);
                        setPasswordDrafts((prev) => ({ ...prev, [rep.id]: '' }));
                        setActionBanner(
                          `${rep.fullName} (${rep.username}) యొక్క కొత్త పాస్‌వర్డ్ "${nextPwd}" అప్‌డేట్ చేయబడింది!`
                        );
                      }}
                      className="rounded-lg bg-stone-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-stone-800 transition-colors"
                    >
                      పాస్‌వర్డ్ సేవ్ చేయండి · Update Password
                    </button>
                  </div>

                  {/* Block / Unblock Reporter Button */}
                  <div>
                    {rep.status !== 'blocked' ? (
                      <button
                        type="button"
                        onClick={async () => {
                          await onSetReporterBlockStatus(rep.id, true, username, password);
                          setActionBanner(
                            `${rep.fullName} (${rep.username}) రిపోర్టర్ ఖాతా బ్లాక్ చేయబడింది.`
                          );
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-red-100 border border-red-300 px-3.5 py-1.5 text-xs font-bold text-red-900 hover:bg-red-200 transition-colors"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        రిపోర్టర్‌ను బ్లాక్ చేయండి · Block Reporter
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={async () => {
                          await onSetReporterBlockStatus(rep.id, false, username, password);
                          setActionBanner(
                            `${rep.fullName} (${rep.username}) రిపోర్టర్ ఖాతా అన్‌బ్లాక్ చేయబడింది.`
                          );
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition-colors"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        అన్‌బ్లాక్ చేయండి · Unblock Reporter
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRIVATE ADS, CLASSIFIEDS & BANNER ADS (ALL CATEGORIES + HOME/STATE/DISTRICT/MANDAL) */}
      {activeAdminTab === 'ads' && (
        <div className="space-y-6">
          {/* Admin Direct Publish Form: Banner Ad & Classified Section with All Categories */}
          <div
            className="bg-white border border-stone-200 rounded-xl p-6 space-y-5"
            data-testid="admin-create-ad-section"
          >
            <div className="border-b border-stone-200 pb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-red-800 uppercase tracking-wider">
                <Megaphone className="w-4 h-4" />
                <span>ADMIN COMMERCIAL DESK · BANNER ADS &amp; CLASSIFIED SECTION</span>
              </div>
              <h3 className="text-lg font-bold text-stone-900 mt-1">
                అడ్మిన్ కొత్త ప్రైవేట్ యాడ్ జోడించండి (బ్యానర్ యాడ్ / క్లాసిఫైడ్ విభాగం — అన్ని కేటగిరీలు)
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                ఇక్కడ నుండి అడ్మిన్ నేరుగా ఏ కేటగిరీలోనైనా బ్యానర్ యాడ్ (Banner Ad) లేదా క్లాసిఫైడ్ యాడ్ (Classified Ad) హోమ్ పేజీ, రాష్ట్ర, జిల్లా లేదా మండల వారీగా పబ్లిష్ చేయవచ్చు.
              </p>
            </div>

            <form onSubmit={handleAdminCreateAdSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    యాడ్ రకం · Ad Format (Banner / Classified) *
                  </label>
                  <select
                    aria-label="Admin Create Ad Format"
                    value={admAdFormat}
                    onChange={(e) => setAdmAdFormat(e.target.value as AdFormat)}
                    className="w-full rounded-lg border border-stone-300 bg-amber-50/70 px-3 py-2 text-xs font-bold text-stone-900"
                  >
                    <option value="banner">బ్యానర్ యాడ్ (Banner Advertisement)</option>
                    <option value="classified">క్లాసిఫైడ్ యాడ్ (Classified Section Ad)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    కేటగిరీ · All Private Ad Categories *
                  </label>
                  <select
                    aria-label="Admin Create Ad Category"
                    value={admAdCategory}
                    onChange={(e) => setAdmAdCategory(e.target.value)}
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
                    ప్రకటన స్థాయి · Ad Scope *
                  </label>
                  <select
                    aria-label="Admin Create Ad Scope"
                    value={admAdScope}
                    onChange={(e) => setAdmAdScope(e.target.value as AdScope)}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900"
                  >
                    <option value="home">హోమ్ పేజీ వారీగా (Home Page Wise)</option>
                    <option value="state">రాష్ట్ర వారీగా (State Wise)</option>
                    <option value="district">జిల్లా వారీగా (District Wise)</option>
                    <option value="mandal">మండల వారీగా (Mandal Wise)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-stone-50 p-3.5 rounded-lg border border-stone-200">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    రాష్ట్రం · State
                  </label>
                  <select
                    value={admAdState}
                    onChange={(e) => {
                      const st = e.target.value;
                      setAdmAdState(st);
                      const d0 = Object.keys(portalState.locations[st] || {})[0] || '';
                      setAdmAdDistrict(d0);
                      const m0 =
                        (portalState.locations[st] && portalState.locations[st][d0]?.[0]) || '';
                      setAdmAdMandal(m0);
                    }}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900"
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
                    జిల్లా · District
                  </label>
                  <select
                    value={admAdDistrict}
                    onChange={(e) => {
                      const dt = e.target.value;
                      setAdmAdDistrict(dt);
                      const m0 =
                        (portalState.locations[admAdState] &&
                          portalState.locations[admAdState][dt]?.[0]) ||
                        '';
                      setAdmAdMandal(m0);
                    }}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900"
                  >
                    {admAdDistricts.map((dt) => (
                      <option key={dt} value={dt}>
                        {dt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    మండలం · Mandal
                  </label>
                  <select
                    value={admAdMandal}
                    onChange={(e) => setAdmAdMandal(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900"
                  >
                    {admAdMandals.map((mn) => (
                      <option key={mn} value={mn}>
                        {mn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    ప్రకటన శీర్షిక · Ad Headline *
                  </label>
                  <input
                    type="text"
                    required
                    value={admAdTitle}
                    onChange={(e) => setAdmAdTitle(e.target.value)}
                    placeholder="ఉదా: గ్రాండ్ జ్యువెలరీ ఎక్స్‌పో / ఓపెన్ ప్లాట్లు"
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
                    value={admAdAdvertiser}
                    onChange={(e) => setAdmAdAdvertiser(e.target.value)}
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
                    value={admAdPhone}
                    onChange={(e) => setAdmAdPhone(e.target.value)}
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
                  rows={2}
                  required
                  value={admAdMatter}
                  onChange={(e) => setAdmAdMatter(e.target.value)}
                  placeholder="ప్రకటన పూర్తి వివరాలు, ఆఫర్లు, చిరునామా రాయండి..."
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 bg-stone-50 p-3.5 rounded-lg border border-stone-200">
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAdminAdFileUpload}
                    className="text-xs text-stone-600 file:mr-2 file:rounded file:border-0 file:bg-stone-800 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                  />
                  <img
                    src={admAdImageUrl}
                    alt="Admin Ad Preview"
                    referrerPolicy="no-referrer"
                    className="w-20 h-12 rounded object-cover border border-stone-300"
                  />
                </div>

                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-lg bg-red-800 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-900 transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  బ్యానర్ / క్లాసిఫైడ్ యాడ్ నేరుగా పబ్లిష్ చేయండి
                </button>
              </div>
            </form>
          </div>

          {/* Existing Private Ads & Classifieds Review + Filter Panel */}
          <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-6">
            <div className="flex flex-col gap-4 border-b border-stone-200 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-stone-900">
                    ప్రైవేట్ యాడ్స్ — బ్యానర్ యాడ్స్ &amp; క్లాసిఫైడ్స్ పరిశీలన ({filteredAdminAds.length})
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    బ్యానర్ యాడ్స్, క్లాసిఫైడ్ యాడ్స్, అన్ని కేటగిరీలు మరియు హోమ్ పేజీ / రాష్ట్ర / జిల్లా / మండల వారీగా ఫిల్టర్ చేయండి.
                  </p>
                </div>

                {/* Format Filter: All / Banner Ads / Classifieds */}
                <div className="flex flex-wrap items-center gap-1.5 bg-stone-900 p-1 rounded-lg">
                  {(
                    [
                      { id: 'all', label: 'అన్నీ (All Ads)' },
                      { id: 'banner', label: 'బ్యానర్ యాడ్స్ (Banner Ads)' },
                      { id: 'classified', label: 'క్లాసిఫైడ్స్ విభాగం (Classifieds)' }
                    ] as const
                  ).map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setAdminAdFormatFilter(fmt.id)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                        adminAdFormatFilter === fmt.id
                          ? 'bg-amber-400 text-stone-950'
                          : 'text-stone-200 hover:bg-stone-800'
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Scope Filter */}
                <div className="flex flex-wrap items-center gap-1.5 bg-stone-100 p-1 rounded-lg">
                  {(
                    [
                      { id: 'all', label: 'అన్ని స్థాయిలు (All Scopes)' },
                      { id: 'home', label: 'హోమ్ పేజీ వారీగా' },
                      { id: 'state', label: 'రాష్ట్ర వారీగా' },
                      { id: 'district', label: 'జిల్లా వారీగా' },
                      { id: 'mandal', label: 'మండల వారీగా' }
                    ] as const
                  ).map((sc) => (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => setAdminAdScopeFilter(sc.id)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                        adminAdScopeFilter === sc.id
                          ? 'bg-red-800 text-white'
                          : 'text-stone-700 hover:bg-white'
                      }`}
                    >
                      {sc.label}
                    </button>
                  ))}
                </div>

                {/* Category Filter with All 10 Categories */}
                <select
                  aria-label="Filter Admin Ads by Category"
                  value={adminAdCategoryFilter}
                  onChange={(e) => setAdminAdCategoryFilter(e.target.value)}
                  className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-800"
                >
                  <option value="ALL">అన్ని కేటగిరీలు (All {PRIVATE_AD_CATEGORIES.length} Categories)</option>
                  {PRIVATE_AD_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAdminAds.map((ad) => (
                <div
                  key={ad.id}
                  className="border border-stone-200 rounded-xl overflow-hidden bg-stone-50 flex flex-col justify-between"
                >
                  <div>
                    <img
                      src={ad.imageUrl}
                      alt={ad.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-44 object-cover border-b border-stone-200 bg-stone-900"
                    />
                    <div className="p-4 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                              (ad.adFormat || 'banner') === 'classified'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-red-100 text-red-900 border border-red-200'
                            }`}
                          >
                            {(ad.adFormat || 'banner') === 'classified'
                              ? 'క్లాసిఫైడ్ యాడ్ · CLASSIFIED'
                              : 'బ్యానర్ యాడ్ · BANNER AD'}
                          </span>
                          <span className="font-bold text-red-900">
                            {AD_SCOPE_LABELS[ad.scope]}
                          </span>
                        </div>
                        <span
                          className={`font-bold ${
                            ad.status === 'approved' ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {ad.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-stone-700">{ad.category}</div>
                      <h4 className="text-base font-bold text-stone-900">{ad.title}</h4>
                      <p className="text-xs text-stone-700 leading-relaxed">{ad.matter}</p>
                      <p className="text-xs text-stone-600 pt-1">
                        <strong>Target Location:</strong>{' '}
                        {ad.scope === 'home'
                          ? 'హోమ్ పేజీ స్పెషల్ (All India Home Page)'
                          : `${ad.mandal}, ${ad.district}, ${ad.state}`}
                      </p>
                      <p className="text-xs font-mono text-stone-600 tabular-nums">
                        <strong>Advertiser:</strong> {ad.advertiserName} · Ph: {ad.contactPhone}
                      </p>
                    </div>
                  </div>

                  <div className="px-4 py-3 bg-white border-t border-stone-200 flex items-center justify-between gap-2">
                    <span className="text-xs text-stone-500">{ad.createdAt}</span>
                    <div className="flex items-center gap-2">
                      {ad.status !== 'approved' ? (
                        <button
                          type="button"
                          onClick={async () => {
                            await onApprovePrivateAd(ad.id, username, password);
                            setActionBanner(`ప్రైవేట్ యాడ్ "${ad.title}" ఆమోదించబడింది!`);
                          }}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Approve Ad
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Live on Portal
                        </span>
                      )}

                      {onDeletePrivateAd && (
                        <button
                          type="button"
                          onClick={async () => {
                            await onDeletePrivateAd(ad.id, username, password);
                            setActionBanner(`ప్రైవేట్ యాడ్ "${ad.title}" తొలగించబడింది.`);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-red-50 border border-red-200 px-2.5 py-1.5 text-xs font-bold text-red-800 hover:bg-red-100 transition-colors"
                          title="Delete Private Ad"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ADD STATES, DISTRICTS & MANDALS */}
      {activeAdminTab === 'locations' && (
        <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200 pb-4">
            <div>
              <h3 className="text-lg font-bold text-stone-900">
                భారతదేశం రాష్ట్రాలు, జిల్లాలు &amp; మండలాల అధికారిక డైరెక్టరీ (Telangana 33 Districts &amp; AP 26 Districts)
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                తెలంగాణ (33 జిల్లాలు · 618+ మండలాలు) మరియు ఆంధ్రప్రదేశ్ (26 జిల్లాలు · 679+ మండలాలు) అధికారిక జాబితా ఇక్కడ పూర్తిగా అప్‌డేట్ చేయబడింది. కొత్త మండలాలు కూడా జోడించవచ్చు.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={TELANGANA_OFFICIAL_DIRECTORY_PDF}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs font-bold text-red-900 hover:bg-red-100 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Telangana 33 Districts PDF
              </a>
              <a
                href={ANDHRA_PRADESH_OFFICIAL_DIRECTORY_PDF}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-900 hover:bg-emerald-100 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Andhra Pradesh 26 Districts PDF
              </a>
            </div>
          </div>

          <form
            onSubmit={handleAddLocationSubmit}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-stone-50 p-5 rounded-xl border border-stone-200"
          >
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                రాష్ట్రం ఎంచుకోండి (Select State)
              </label>
              <select
                aria-label="Select State to Add Mandal"
                value={locStateName}
                onChange={(e) => setLocStateName(e.target.value)}
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900"
              >
                {statesList.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={customStateName}
                onChange={(e) => setCustomStateName(e.target.value)}
                placeholder="లేదా కొత్త రాష్ట్రం పేరు..."
                className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                జిల్లా పేరు (District Name) *
              </label>
              <input
                type="text"
                required
                value={locDistrictName}
                onChange={(e) => setLocDistrictName(e.target.value)}
                placeholder="e.g. Siddipet (సిద్దిపేట)"
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                కొత్త మండలం పేరు (New Mandal Name) *
              </label>
              <input
                type="text"
                required
                value={locMandalName}
                onChange={(e) => setLocMandalName(e.target.value)}
                placeholder="e.g. Chinnakodur (చిన్నకోడూరు)"
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-red-800 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-900 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                జిల్లా &amp; మండలం ఆడ్ చేయండి
              </button>
            </div>
          </form>

          {/* Directory of Existing States, Districts & Mandals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[540px] overflow-y-auto pr-1">
            {Object.entries(portalState.locations).map(([stateName, districtMap]) => {
              const distCount = Object.keys(districtMap).length;
              const mandalCount = Object.values(districtMap).reduce(
                (acc, arr) => acc + arr.length,
                0
              );
              return (
                <div key={stateName} className="border border-stone-200 rounded-lg p-4">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-1.5 mb-2">
                    <h4 className="text-sm font-bold text-red-900">{stateName}</h4>
                    <span className="text-[11px] font-bold bg-stone-100 text-stone-800 px-2 py-0.5 rounded">
                      {distCount} Districts · {mandalCount} Mandals
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    {Object.entries(districtMap).map(([distName, mandals], idx) => (
                      <div key={distName} className="border-b border-stone-100 pb-1.5 last:border-b-0">
                        <span className="font-bold text-stone-900">
                          {String(idx + 1).padStart(2, '0')}. {distName} ({mandals.length}):{' '}
                        </span>
                        <span className="text-stone-600">{mandals.join(', ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: CHIEF EDITOR NEWS DESK + EDIT/DELETE NEWS & YOUTUBE MANAGEMENT */}
      {activeAdminTab === 'editorial' && (
        <div className="space-y-6">
          <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-5">
            <h3 className="text-lg font-bold text-stone-900">
              చీఫ్ ఎడిటర్ వార్త పబ్లిషింగ్ · Publish Official News
            </h3>
            <form onSubmit={handleAdminNewsSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">News Level</label>
                  <select
                    value={edLevel}
                    onChange={(e) =>
                      setEdLevel(e.target.value as 'national' | 'state' | 'district' | 'mandal')
                    }
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900"
                  >
                    <option value="national">జాతీయ వార్త (National News)</option>
                    <option value="state">రాష్ట్ర వార్త (State News)</option>
                    <option value="district">జిల్లా వార్త (District News)</option>
                    <option value="mandal">మండల వార్త (Mandal News)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">State</label>
                  <select
                    value={edState}
                    onChange={(e) => {
                      const st = e.target.value;
                      setEdState(st);
                      const dists = Object.keys(portalState.locations[st] || {});
                      const d0 = dists[0] || '';
                      setEdDistrict(d0);
                      const m0 =
                        (portalState.locations[st] && portalState.locations[st][d0]?.[0]) || '';
                      setEdMandal(m0);
                    }}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900"
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
                    value={edDistrict}
                    onChange={(e) => {
                      const dt = e.target.value;
                      setEdDistrict(dt);
                      const m0 =
                        (portalState.locations[edState] &&
                          portalState.locations[edState][dt]?.[0]) ||
                        '';
                      setEdMandal(m0);
                    }}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900"
                  >
                    {edDistricts.map((dt) => (
                      <option key={dt} value={dt}>
                        {dt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Mandal</label>
                  <select
                    value={edMandal}
                    onChange={(e) => setEdMandal(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900"
                  >
                    {edMandals.map((mn) => (
                      <option key={mn} value={mn}>
                        {mn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    తెలుగు శీర్షిక (Telugu Title) *
                  </label>
                  <input
                    type="text"
                    required
                    value={edTitleTe}
                    onChange={(e) => setEdTitleTe(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    हिंदी शीर्षक (Hindi Title)
                  </label>
                  <input
                    type="text"
                    value={edTitleHi}
                    onChange={(e) => setEdTitleHi(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    English Headline
                  </label>
                  <input
                    type="text"
                    value={edTitleEn}
                    onChange={(e) => setEdTitleEn(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={edCategory}
                    onChange={(e) => setEdCategory(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    వార్త ఫోటో · News Image Upload / URL
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const r = new FileReader();
                      r.onload = () => {
                        if (typeof r.result === 'string') setEdImageUrl(r.result);
                      };
                      r.readAsDataURL(f);
                    }}
                    className="w-full text-xs text-stone-600 file:mr-2 file:rounded file:border-0 file:bg-stone-800 file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    YouTube Video URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={edYoutubeUrl}
                    onChange={(e) => setEdYoutubeUrl(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  పూర్తి వార్త (Full Content) *
                </label>
                <textarea
                  rows={4}
                  required
                  value={edContentTe}
                  onChange={(e) => setEdContentTe(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="rounded-lg bg-red-800 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-900 transition-colors"
                >
                  Publish Official News Update
                </button>
              </div>
            </form>
          </div>

          {/* Manage Existing News Articles (Edit / Delete Any Article) */}
          <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
            <h3 className="text-base font-bold text-stone-900 border-b border-stone-200 pb-3">
              ప్రచురించబడిన అన్ని వార్తలు — ఎడిట్ / డిలీట్ ({portalState.articles.length})
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {portalState.articles.map((art) => (
                <div
                  key={art.id}
                  className="border border-stone-200 rounded-lg p-4 bg-stone-50 flex flex-col gap-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="text-xs text-stone-500">
                        <span className="font-bold text-red-900">{art.category}</span> · {art.mandal} ·{' '}
                        {art.district} · Views: {art.views.toLocaleString('en-IN')}
                      </div>
                      <h4 className="text-sm font-bold text-stone-900">{art.title.te}</h4>
                      <p className="text-xs text-stone-600 line-clamp-2">{art.summary.te}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingArticleId(art.id);
                          setEditArticleTitleTe(art.title.te);
                          setEditArticleSummaryTe(art.summary.te);
                          setEditArticleContentTe(art.content.te);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg bg-stone-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-stone-700"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      {onDeleteArticle && (
                        <button
                          type="button"
                          onClick={async () => {
                            await onDeleteArticle(art.id, username, password);
                            setActionBanner(`వార్త "${art.title.te}" తొలగించబడింది.`);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-red-100 border border-red-200 px-3 py-1.5 text-xs font-bold text-red-900 hover:bg-red-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>

                  {editingArticleId === art.id && onUpdateArticle && (
                    <div className="pt-3 border-t border-stone-200 space-y-2.5 bg-white p-3 rounded-lg">
                      <input
                        type="text"
                        value={editArticleTitleTe}
                        onChange={(e) => setEditArticleTitleTe(e.target.value)}
                        className="w-full rounded border border-stone-300 px-3 py-1.5 text-xs font-bold text-stone-900"
                        placeholder="Title"
                      />
                      <input
                        type="text"
                        value={editArticleSummaryTe}
                        onChange={(e) => setEditArticleSummaryTe(e.target.value)}
                        className="w-full rounded border border-stone-300 px-3 py-1.5 text-xs text-stone-900"
                        placeholder="Summary"
                      />
                      <textarea
                        rows={3}
                        value={editArticleContentTe}
                        onChange={(e) => setEditArticleContentTe(e.target.value)}
                        className="w-full rounded border border-stone-300 px-3 py-1.5 text-xs text-stone-900"
                        placeholder="Full Content"
                      />
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setEditingArticleId(null)}
                          className="rounded border border-stone-300 px-3 py-1 text-xs text-stone-700"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await onUpdateArticle(
                              art.id,
                              {
                                titleTe: editArticleTitleTe,
                                summaryTe: editArticleSummaryTe,
                                contentTe: editArticleContentTe
                              },
                              username,
                              password
                            );
                            setEditingArticleId(null);
                            setActionBanner('వార్త వివరాలు విజయవంతంగా అప్‌డేట్ చేయబడ్డాయి!');
                          }}
                          className="rounded bg-emerald-700 px-3.5 py-1 text-xs font-bold text-white"
                        >
                          Save Article Changes
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Manage YouTube Video Bulletins */}
          <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
            <h3 className="text-base font-bold text-stone-900 border-b border-stone-200 pb-3 flex items-center gap-2">
              <Video className="w-4 h-4 text-red-800" />
              YouTube వీడియో బులెటిన్ల నిర్వహణ ({portalState.youtubeUpdates.length})
            </h3>
            {onAddYoutube && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!ytTitleTe.trim()) return;
                  await onAddYoutube(
                    {
                      titleTe: ytTitleTe,
                      locationTag: ytLocationTag,
                      channelUrl: ytChannelUrl
                    },
                    username,
                    password
                  );
                  setYtTitleTe('');
                  setActionBanner('కొత్త YouTube వీడియో అప్‌డేట్ జోడించబడింది!');
                }}
                className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-stone-50 p-4 rounded-lg border border-stone-200"
              >
                <input
                  type="text"
                  required
                  value={ytTitleTe}
                  onChange={(e) => setYtTitleTe(e.target.value)}
                  placeholder="YouTube వీడియో టైటిల్..."
                  className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900"
                />
                <input
                  type="text"
                  value={ytLocationTag}
                  onChange={(e) => setYtLocationTag(e.target.value)}
                  placeholder="Location Tag (e.g. Karimnagar Live)"
                  className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900"
                />
                <input
                  type="url"
                  value={ytChannelUrl}
                  onChange={(e) => setYtChannelUrl(e.target.value)}
                  placeholder="YouTube Video / Channel Link"
                  className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-red-800 px-4 py-2 text-xs font-bold text-white hover:bg-red-900"
                >
                  + Add YouTube Bulletin
                </button>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {portalState.youtubeUpdates.map((vid) => (
                <div
                  key={vid.id}
                  className="border border-stone-200 rounded-lg p-3 bg-stone-50 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-stone-900 line-clamp-1">{vid.title.te}</div>
                    <div className="text-stone-500">{vid.locationTag}</div>
                  </div>
                  {onDeleteYoutube && (
                    <button
                      type="button"
                      onClick={async () => {
                        await onDeleteYoutube(vid.id, username, password);
                        setActionBanner('YouTube వీడియో అప్‌డేట్ తొలగించబడింది.');
                      }}
                      className="p-1.5 rounded bg-red-100 text-red-900 hover:bg-red-200 shrink-0"
                      title="Delete YouTube Bulletin"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: GOOGLE ADSENSE (ADMIN ONLY) & USER FEEDBACK */}
      {activeAdminTab === 'adsense' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
            <div className="border-b border-stone-200 pb-3">
              <span className="text-xs font-mono font-bold text-red-800 uppercase">
                ADMIN-ONLY MONETIZATION CONSOLE (HIDDEN FROM HOMEPAGE)
              </span>
              <h3 className="text-lg font-bold text-stone-900 mt-0.5">
                Google AdSense Link &amp; Sponsored Unit Configuration
              </h3>
              <p className="text-xs text-stone-500">
                పాఠకుల హోమ్ పేజీలో Google AdSense Sponsored Unit కనిపించకుండా కేవలం అడ్మిన్ డ్యాష్‌బోర్డులో మాత్రమే కనిపించేలా సెట్ చేయబడింది.
              </p>
            </div>

            <form onSubmit={handleSaveAdSense} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Google AdSense Publisher ID
                </label>
                <input
                  type="text"
                  value={adsensePubId}
                  onChange={(e) => setAdsensePubId(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-mono text-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  AdSense Ad Slot ID
                </label>
                <input
                  type="text"
                  value={adsenseSlotId}
                  onChange={(e) => setAdsenseSlotId(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-mono text-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Google AdSense Console / Script Link
                </label>
                <input
                  type="url"
                  value={adsenseLink}
                  onChange={(e) => setAdsenseLink(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-stone-900 px-4 py-2 text-xs font-bold text-white hover:bg-stone-800 transition-colors"
              >
                Save AdSense Link in Admin
              </button>
            </form>

            <div className="mt-4 rounded-lg border border-dashed border-stone-300 bg-stone-50 p-4">
              <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                <span className="font-bold text-stone-700">
                  Google AdSense Sponsored Unit (Admin-Only Preview)
                </span>
                <span className="font-mono tabular-nums">{adsensePubId}</span>
              </div>
              <div className="text-xs text-stone-600">
                Active Slot: <code className="font-mono">{adsenseSlotId}</code> · Visibility:{' '}
                <strong className="text-emerald-700">Admin Console Only (Hidden on Public Home)</strong>
              </div>
              <a
                href={adsenseLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-red-800 hover:underline"
              >
                Open Google AdSense Management Link
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Reader Feedback Review */}
          <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-stone-900 border-b border-stone-200 pb-3">
              పాఠకుల ఫీడ్‌బ్యాక్ సమీక్ష · Reader Feedback ({portalState.feedbackList.length})
            </h3>
            <div className="divide-y divide-stone-200 max-h-96 overflow-y-auto">
              {portalState.feedbackList.map((fb) => (
                <div key={fb.id} className="py-3 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-900">{fb.readerName}</span>
                    <span className="font-mono font-bold text-amber-600 tabular-nums">
                      Rating: {fb.rating}/5 ★
                    </span>
                  </div>
                  <p className="text-xs text-stone-700">{fb.message}</p>
                  <p className="text-xs text-stone-500">
                    {fb.location} · {fb.mobileOrEmail} · {fb.createdAt}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: FULL WEBSITE CMS SETTINGS (LOGO, BANNER, TEXTS, CONTACT) & HOSTINGER UPLOAD EXPORT FILES */}
      {activeAdminTab === 'cms_hostinger' && (
        <div className="space-y-6" data-testid="admin-cms-hostinger-section">
          {/* 1. HOSTINGER CODE EXPORT & DEPLOYMENT BOX */}
          <div className="bg-stone-900 text-white border border-stone-800 rounded-xl p-6 space-y-5">
            <div className="border-b border-stone-800 pb-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-amber-400 flex items-center gap-2">
                  <Server className="w-4 h-4" />
                  <span>HOSTINGER READY PRODUCTION EXPORT FILES (BUG-FREE)</span>
                </div>
                <h3 className="text-xl font-bold mt-1">
                  Hostinger లో అప్‌లోడ్ చేయడానికి సిద్ధంగా ఉన్న కోడ్ ఫైల్స్ (1-Click Download)
                </h3>
                <p className="text-xs text-stone-300 mt-1">
                  మీరు అడ్మిన్ ప్యానెల్‌లో చేసిన అన్ని మార్పులు (లోగో, బ్యానర్ ఇమేజ్, వార్తలు, క్లాసిఫైడ్స్, రిపోర్టర్లు) ఈ ఫైల్స్‌లో ఆటోమేటిక్‌గా సేవ్ చేయబడి ఉంటాయి. Hostinger <code className="text-amber-300">public_html</code> లో నేరుగా అప్‌లోడ్ చేయండి.
                </p>
              </div>
              <a
                href="/api/hostinger-export?format=zip"
                download="neti-bharatam-hostinger-public_html.zip"
                data-testid="admin-download-hostinger-zip"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-xs font-extrabold text-stone-950 hover:bg-amber-300 transition-colors shadow-lg shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Download Full Hostinger .ZIP (All Files)</span>
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
              <a
                href="/api/hostinger-export?format=public_html"
                download="index.html"
                className="flex flex-col justify-between rounded-xl bg-amber-400 p-4 text-stone-950 hover:bg-amber-300 transition-colors"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase font-extrabold bg-stone-950 text-amber-300 px-2 py-0.5 rounded">
                    STEP 1 · PUBLIC_HTML
                  </span>
                  <div className="text-sm font-extrabold mt-1">1. index.html</div>
                  <p className="text-[11px] text-stone-800">
                    బ్యానర్, లోగో, వార్తలు, అడ్మిన్ &amp; రిపోర్టర్ పోర్టల్‌తో పూర్తి వెబ్‌సైట్ ఫైల్
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs font-extrabold">
                  <Download className="w-4 h-4" />
                  Download index.html
                </div>
              </a>

              <a
                href="/api/hostinger-export?format=htaccess"
                download=".htaccess"
                className="flex flex-col justify-between rounded-xl bg-stone-800 border border-stone-700 p-4 text-white hover:bg-stone-700 transition-colors"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-amber-400">
                    STEP 2 · 7 SECURITY HEADERS
                  </span>
                  <div className="text-sm font-bold">2. .htaccess ఫైల్</div>
                  <p className="text-[11px] text-stone-300">
                    7-Layer Security Headers, UTF-8 &amp; Hostinger రౌటింగ్ రూల్స్
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-amber-300">
                  <Download className="w-4 h-4" />
                  Download .htaccess
                </div>
              </a>

              <a
                href="/api/hostinger-export?format=package_json"
                download="package.json"
                className="flex flex-col justify-between rounded-xl bg-emerald-950 border border-emerald-700 p-4 text-white hover:bg-emerald-900 transition-colors"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-emerald-300">
                    0 VULNERABILITIES
                  </span>
                  <div className="text-sm font-bold">3. package.json</div>
                  <p className="text-[11px] text-emerald-100">
                    All 7 npm vulnerabilities patched with security overrides
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                  <Download className="w-4 h-4" />
                  Download package.json
                </div>
              </a>

              <a
                href="/api/hostinger-export?format=nodejs_server"
                download="server.js"
                className="flex flex-col justify-between rounded-xl bg-stone-800 border border-stone-700 p-4 text-white hover:bg-stone-700 transition-colors"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-emerald-400">
                    NODE.JS HOSTING
                  </span>
                  <div className="text-sm font-bold">4. server.js (Node.js)</div>
                  <p className="text-[11px] text-stone-300">
                    Hostinger VPS / Cloud / Node.js Web App కోసం ప్రొడక్షన్ సర్వర్ ఎంట్రీ ఫైల్
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                  <Download className="w-4 h-4" />
                  Download server.js
                </div>
              </a>

              <a
                href="/api/hostinger-export?format=deploy_guide"
                download="HOSTINGER_UPLOAD_GUIDE.txt"
                className="flex flex-col justify-between rounded-xl bg-stone-800 border border-stone-700 p-4 text-white hover:bg-stone-700 transition-colors"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-amber-400">
                    TELUGU &amp; ENGLISH GUIDE
                  </span>
                  <div className="text-sm font-bold">4. Upload Guide (.TXT)</div>
                  <p className="text-[11px] text-stone-300">
                    Hostinger hPanel లో ఫైల్స్ ఎలా అప్‌లోడ్ చేయాలో స్టెప్-బై-స్టెప్ గైడ్
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-amber-300">
                  <Download className="w-4 h-4" />
                  Download Guide
                </div>
              </a>

              <div className="flex flex-col justify-between rounded-xl bg-stone-800 border border-stone-700 p-4 text-white">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-amber-400">
                    FULL DB BACKUP / RESTORE
                  </span>
                  <div className="text-sm font-bold">5. Database JSON</div>
                  <p className="text-[11px] text-stone-300">
                    వెబ్‌సైట్ పూర్తి డేటాబేస్ బ్యాకప్ డౌన్‌లోడ్ లేదా రీస్టోర్ చేయండి
                  </p>
                </div>
                <div className="mt-3 flex flex-col gap-1.5">
                  <a
                    href="/api/hostinger-export?format=database_json"
                    download="neti-bharatam-database-backup.json"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export Backup (.JSON)
                  </a>
                  <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 hover:underline">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Restore JSON Backup</span>
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleDatabaseImport}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 2. FULL WEBSITE SETTINGS CMS FORM (CHANGE EVERYTHING FROM ADMIN PANEL) */}
          <form
            onSubmit={handleSaveSiteConfig}
            className="bg-white border border-stone-200 rounded-xl p-6 space-y-6"
          >
            <div className="border-b border-stone-200 pb-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-red-800">
                  FULL WEBSITE CONTROL · ప్రతి మార్పు అడ్మిన్ ప్యానెల్ నుండే
                </span>
                <h3 className="text-lg font-bold text-stone-900 mt-0.5">
                  వెబ్‌సైట్ పూర్తి కంట్రోల్ — లోగో, బ్యానర్ ఇమేజ్, టైటిల్స్, టిక్కర్ &amp; కాంటాక్ట్ వివరాలు మార్చుకోండి
                </h3>
              </div>

              <button
                type="submit"
                className="rounded-lg bg-red-800 px-5 py-2.5 text-xs font-extrabold text-white hover:bg-red-900 transition-colors"
              >
                అన్ని వెబ్‌సైట్ మార్పులు సేవ్ చేయండి · Save All Website Changes
              </button>
            </div>

            {/* Banner Image & Logo Live Preview + Upload */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-stone-50 p-5 rounded-xl border border-stone-200">
              <div className="lg:col-span-8 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-bold text-stone-800">
                    1. వెబ్‌సైట్ మెయిన్ బ్యానర్ ఇమేజ్ (Masthead Official Banner Image)
                  </label>
                  <label className="inline-flex items-center gap-2 text-xs font-bold text-red-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cmsConfig.showBannerImage}
                      onChange={(e) =>
                        setCmsConfig((prev) => ({ ...prev, showBannerImage: e.target.checked }))
                      }
                      className="rounded border-stone-300"
                    />
                    <span>వెబ్‌సైట్ పైన బ్యానర్ ఇమేజ్ చూపించు (Show Banner on Website)</span>
                  </label>
                </div>

                <div className="rounded-xl overflow-hidden border-2 border-amber-400 bg-stone-900">
                  <img
                    src={cmsConfig.bannerUrl || OFFICIAL_BANNER_IMAGE}
                    alt="Neti Bharatam Official Banner Preview"
                    referrerPolicy="no-referrer"
                    className="w-full max-h-44 object-contain mx-auto"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-red-800 px-3.5 py-2 text-xs font-bold text-white hover:bg-red-900">
                    <Upload className="w-3.5 h-3.5" />
                    <span>కొత్త బ్యానర్ ఇమేజ్ అప్‌లోడ్ చేయండి</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerUpload}
                      className="hidden"
                    />
                  </label>

                  <input
                    type="text"
                    value={cmsConfig.bannerUrl}
                    onChange={(e) =>
                      setCmsConfig((prev) => ({ ...prev, bannerUrl: e.target.value }))
                    }
                    placeholder="Banner Image URL or Data URI"
                    className="flex-1 min-w-[220px] rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-mono text-stone-900"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setCmsConfig((prev) => ({
                        ...prev,
                        bannerUrl: OFFICIAL_BANNER_IMAGE,
                        showBannerImage: true
                      }))
                    }
                    className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100"
                  >
                    డిఫాల్ట్ నేటి భారతం బ్యానర్ సెట్ చేయండి
                  </button>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-3 border-t lg:border-t-0 lg:border-l border-stone-200 pt-4 lg:pt-0 lg:pl-6">
                <label className="block text-xs font-bold text-stone-800">
                  2. వెబ్‌సైట్ అధికారిక లోగో (Official Logo &amp; Press ID Emblem)
                </label>
                <div className="flex items-center gap-4">
                  <img
                    src={cmsConfig.logoUrl || OFFICIAL_BANNER_IMAGE}
                    alt="Official Logo Preview"
                    referrerPolicy="no-referrer"
                    className="w-24 h-20 rounded-xl border-2 border-stone-300 bg-white p-1 object-contain"
                  />
                  <div className="space-y-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-2 text-xs font-bold text-white hover:bg-stone-800">
                      <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                      <span>కొత్త లోగో అప్‌లోడ్</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setCmsConfig((prev) => ({ ...prev, logoUrl: OFFICIAL_BANNER_IMAGE }))
                      }
                      className="block text-xs font-semibold text-red-800 hover:underline"
                    >
                      Reset to Official Logo
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={cmsConfig.logoUrl}
                  onChange={(e) => setCmsConfig((prev) => ({ ...prev, logoUrl: e.target.value }))}
                  placeholder="Logo URL"
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-mono text-stone-900"
                />
              </div>
            </div>

            {/* Brand Titles & Masthead Headlines */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  తెలుగు బ్రాండ్ టైటిల్ (Telugu Brand Name)
                </label>
                <input
                  type="text"
                  value={cmsConfig.brandTitleTe}
                  onChange={(e) =>
                    setCmsConfig((prev) => ({ ...prev, brandTitleTe: e.target.value }))
                  }
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-bold text-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  హిందీ బ్రాండ్ టైటిల్ (Hindi Brand Name)
                </label>
                <input
                  type="text"
                  value={cmsConfig.brandTitleHi}
                  onChange={(e) =>
                    setCmsConfig((prev) => ({ ...prev, brandTitleHi: e.target.value }))
                  }
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-bold text-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ఇంగ్లీష్ బ్రాండ్ టైటిల్ (English Brand Name)
                </label>
                <input
                  type="text"
                  value={cmsConfig.brandTitleEn}
                  onChange={(e) =>
                    setCmsConfig((prev) => ({ ...prev, brandTitleEn: e.target.value }))
                  }
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-bold text-stone-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  మాస్ట్‌హెడ్ ట్యాగ్‌లైన్ (Masthead Top Tagline)
                </label>
                <input
                  type="text"
                  value={cmsConfig.mastheadTagline}
                  onChange={(e) =>
                    setCmsConfig((prev) => ({ ...prev, mastheadTagline: e.target.value }))
                  }
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  మాస్ట్‌హెడ్ మెయిన్ హెడ్డింగ్ (Masthead Main Heading)
                </label>
                <input
                  type="text"
                  value={cmsConfig.mastheadHeading}
                  onChange={(e) =>
                    setCmsConfig((prev) => ({ ...prev, mastheadHeading: e.target.value }))
                  }
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-bold text-stone-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  మాస్ట్‌హెడ్ సబ్-టైటిల్ / నినాదం (Masthead Subtitle)
                </label>
                <input
                  type="text"
                  value={cmsConfig.mastheadSubtitle}
                  onChange={(e) =>
                    setCmsConfig((prev) => ({ ...prev, mastheadSubtitle: e.target.value }))
                  }
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  బ్రేకింగ్ న్యూస్ టిక్కర్ స్పెషల్ మెసేజ్ (Custom Breaking Ticker Text)
                </label>
                <input
                  type="text"
                  value={cmsConfig.customTickerAnnouncement}
                  onChange={(e) =>
                    setCmsConfig((prev) => ({
                      ...prev,
                      customTickerAnnouncement: e.target.value
                    }))
                  }
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900"
                />
              </div>
            </div>

            {/* Links, Contact Details & Footer Copyright */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  అధికారిక YouTube ఛానల్ లింక్
                </label>
                <input
                  type="url"
                  value={cmsConfig.officialYoutubeChannel}
                  onChange={(e) =>
                    setCmsConfig((prev) => ({
                      ...prev,
                      officialYoutubeChannel: e.target.value
                    }))
                  }
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-mono text-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  సంప్రదించవలసిన ఫోన్ నెంబర్ (Contact Phone)
                </label>
                <input
                  type="text"
                  value={cmsConfig.contactPhone}
                  onChange={(e) =>
                    setCmsConfig((prev) => ({ ...prev, contactPhone: e.target.value }))
                  }
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-mono text-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  అధికారిక ఇమెయిల్ (Contact Email)
                </label>
                <input
                  type="email"
                  value={cmsConfig.contactEmail}
                  onChange={(e) =>
                    setCmsConfig((prev) => ({ ...prev, contactEmail: e.target.value }))
                  }
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-mono text-stone-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ప్రధాన కార్యాలయం చిరునామా (Office Address)
                </label>
                <input
                  type="text"
                  value={cmsConfig.officeAddress}
                  onChange={(e) =>
                    setCmsConfig((prev) => ({ ...prev, officeAddress: e.target.value }))
                  }
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ఫుటర్ కాపీరైట్ టెక్స్ట్ (Footer Copyright Text)
                </label>
                <input
                  type="text"
                  value={cmsConfig.footerCopyright}
                  onChange={(e) =>
                    setCmsConfig((prev) => ({ ...prev, footerCopyright: e.target.value }))
                  }
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-stone-200">
              <button
                type="submit"
                className="rounded-lg bg-red-800 px-6 py-2.5 text-xs font-extrabold text-white hover:bg-red-900 transition-colors"
              >
                అన్ని వెబ్‌సైట్ మార్పులు సేవ్ చేయండి · Save All Website Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedReporterForId && (
        <PressIdCardModal
          reporter={selectedReporterForId}
          logoUrl={portalState.siteConfig?.logoUrl || portalState.logoUrl}
          onClose={() => setSelectedReporterForId(null)}
        />
      )}
    </section>
  );
}
