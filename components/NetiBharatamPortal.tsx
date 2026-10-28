'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Eye,
  MapPin,
  Bell,
  Video,
  ExternalLink,
  Megaphone,
  Smartphone,
  ArrowRight
} from 'lucide-react';
import {
  PortalState,
  createInitialPortalState,
  NewsArticle,
  NewsLevel,
  filterPublicNews,
  filterPublicPrivateAds,
  incrementArticleViews,
  verifyAdminLogin,
  RegisterReporterInput,
  PublishReporterNewsInput,
  SubmitPrivateAdInput,
  AdScope,
  AdFormat,
  PRIVATE_AD_CATEGORIES,
  OFFICIAL_YOUTUBE_CHANNEL,
  OFFICIAL_BANNER_IMAGE,
  MEDIA_DIVISIONS,
  MEDIA_POSTS_CATALOG,
  ACCESS_TIER_CATALOG,
  TELANGANA_OFFICIAL_DIRECTORY_PDF,
  ANDHRA_PRADESH_OFFICIAL_DIRECTORY_PDF,
  SiteConfig
} from '@/lib/news-engine';
import { SupportedLanguage, TRANSLATIONS } from '@/lib/translations';
import { usePWAInstall } from './usePWAInstall';
import { BreakingNewsTicker } from './BreakingNewsTicker';
import { ReporterPortalView } from './ReporterPortalView';
import { MediaStaffOrganizationView } from './MediaStaffOrganizationView';
import { AdminDashboardView } from './AdminDashboardView';
import {
  ArticleReaderModal,
  SubmitPrivateAdModal,
  PlayStoreAppModal
} from './PortalModals';

type MainWorkspaceView = 'news' | 'youtube' | 'reporter' | 'admin';

const AD_SCOPE_BADGE_LABELS: Record<AdScope, string> = {
  home: 'హోమ్ పేజీ యాడ్ · Home Page Ad',
  state: 'రాష్ట్ర స్థాయి యాడ్ · State Wise Ad',
  district: 'జిల్లా స్థాయి యాడ్ · District Wise Ad',
  mandal: 'మండల స్థాయి యాడ్ · Mandal Wise Ad'
};

export function NetiBharatamPortal() {
  const [portalState, setPortalState] = useState<PortalState>(() => createInitialPortalState());
  const [lang, setLang] = useState<SupportedLanguage>('te');
  const [activeView, setActiveView] = useState<MainWorkspaceView>('news');

  // News Filtering & Dedicated Mandal Page State
  const [selectedLevel, setSelectedLevel] = useState<'all' | NewsLevel>('all');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedMandal, setSelectedMandal] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDedicatedMandalMode, setIsDedicatedMandalMode] = useState<boolean>(false);

  // Private Ads Filter State (Home Page Wise, State Wise, District Wise, Mandal Wise + Banner/Classified + All Categories)
  const [selectedAdScope, setSelectedAdScope] = useState<'all' | AdScope>('all');
  const [selectedAdFormat, setSelectedAdFormat] = useState<'all' | AdFormat>('all');
  const [selectedAdCategory, setSelectedAdCategory] = useState<string>('ALL');
  const [selectedAdState, setSelectedAdState] = useState<string>('ALL');
  const [selectedAdDistrict, setSelectedAdDistrict] = useState<string>('ALL');
  const [selectedAdMandal, setSelectedAdMandal] = useState<string>('ALL');

  // Modals & Interactive States
  const [readingArticle, setReadingArticle] = useState<NewsArticle | null>(null);
  const [showPostAdModal, setShowPostAdModal] = useState<boolean>(false);
  const [showPlayStoreModal, setShowPlayStoreModal] = useState<boolean>(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState<boolean>(false);

  // Reader Feedback Form State
  const [fbName, setFbName] = useState('');
  const [fbContact, setFbContact] = useState('');
  const [fbLocation, setFbLocation] = useState('');
  const [fbRating, setFbRating] = useState(5);
  const [fbMessage, setFbMessage] = useState('');
  const [fbStatus, setFbStatus] = useState<string | null>(null);

  const { isInstallable, install } = usePWAInstall();
  const t = TRANSLATIONS[lang];

  // Hydrate from server-side persistent database on mount
  useEffect(() => {
    let mounted = true;
    fetch('/api/portal')
      .then((res) => res.json())
      .then((data) => {
        if (mounted && data?.state) {
          setPortalState(data.state);
        }
      })
      .catch(() => {
        // Fallback to initial deterministic state if offline
      });
    return () => {
      mounted = false;
    };
  }, []);

  const syncWithApi = async (action: string, payload: Record<string, unknown>) => {
    const res = await fetch('/api/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Operation failed');
    }
    if (data.state) {
      setPortalState(data.state);
    }
    return data;
  };

  const handleOpenArticle = async (article: NewsArticle) => {
    const { nextState } = incrementArticleViews(portalState, article.id);
    setPortalState(nextState);
    const updated = nextState.articles.find((a) => a.id === article.id) || article;
    setReadingArticle(updated);
    try {
      await syncWithApi('INCREMENT_VIEW', { articleId: article.id });
    } catch {
      // Optimistically updated
    }
  };

  const handleOpenMandalPage = (stateName: string, districtName: string, mandalName: string) => {
    setActiveView('news');
    setSelectedLevel('all');
    setSelectedState(stateName);
    setSelectedDistrict(districtName);
    setSelectedMandal(mandalName);
    setSelectedAdState(stateName);
    setSelectedAdDistrict(districtName);
    setSelectedAdMandal(mandalName);
    setIsDedicatedMandalMode(true);
  };

  const handleResetFilters = () => {
    setSelectedLevel('all');
    setSelectedState('ALL');
    setSelectedDistrict('ALL');
    setSelectedMandal('ALL');
    setSearchQuery('');
    setSelectedAdScope('all');
    setSelectedAdState('ALL');
    setSelectedAdDistrict('ALL');
    setSelectedAdMandal('ALL');
    setIsDedicatedMandalMode(false);
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbName.trim() || !fbMessage.trim()) return;
    await syncWithApi('SUBMIT_FEEDBACK', {
      readerName: fbName,
      mobileOrEmail: fbContact,
      location: fbLocation || (selectedMandal !== 'ALL' ? selectedMandal : 'All India'),
      rating: fbRating,
      message: fbMessage
    });
    setFbStatus('మీ విలువైన అభిప్రాయం నమోదు చేయబడింది. ధన్యవాదాలు!');
    setFbName('');
    setFbContact('');
    setFbLocation('');
    setFbMessage('');
  };

  // Compute cascading dropdown lists for News Filter
  const allStates = Object.keys(portalState.locations);
  const availableDistricts =
    selectedState !== 'ALL' ? Object.keys(portalState.locations[selectedState] || {}) : [];
  const availableMandals =
    selectedState !== 'ALL' && selectedDistrict !== 'ALL'
      ? (portalState.locations[selectedState] &&
          portalState.locations[selectedState][selectedDistrict]) ||
        []
      : [];

  // Compute cascading dropdown lists for Private Ads Filter
  const availableAdDistricts =
    selectedAdState !== 'ALL' ? Object.keys(portalState.locations[selectedAdState] || {}) : [];
  const availableAdMandals =
    selectedAdState !== 'ALL' && selectedAdDistrict !== 'ALL'
      ? (portalState.locations[selectedAdState] &&
          portalState.locations[selectedAdState][selectedAdDistrict]) ||
        []
      : [];

  const filteredArticles = filterPublicNews(portalState, {
    level: selectedLevel,
    state: selectedState,
    district: selectedDistrict,
    mandal: selectedMandal,
    searchQuery
  });

  const filteredAds = filterPublicPrivateAds(portalState, {
    scope: selectedAdScope,
    adFormat: selectedAdFormat,
    category: selectedAdCategory,
    state: selectedAdState,
    district: selectedAdDistrict,
    mandal: selectedAdMandal
  });

  const bannerAds = filteredAds.filter((a) => (a.adFormat || 'banner') === 'banner');
  const classifiedAds = filteredAds.filter((a) => (a.adFormat || 'banner') === 'classified');

  const leadArticle = filteredArticles[0] || null;
  const secondaryArticles = filteredArticles.slice(1);

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-stone-900">
      {/* BREAKING NEWS MULTILINGUAL TICKER AT THE TOP OF THE PORTAL (CYCLES TELUGU, HINDI, ENGLISH) */}
      <BreakingNewsTicker
        articles={portalState.articles}
        onSelectArticle={handleOpenArticle}
      />

      {/* STRICT 3-ZONE TOP BAR CONTRACT */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 bg-white border-b border-stone-200">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveView('news');
            handleResetFilters();
          }}
          className="text-xl font-extrabold tracking-tight text-red-900 whitespace-nowrap shrink-0"
        >
          {t.brandTitle}
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav
          className="hidden md:flex items-center gap-6 text-sm font-semibold text-stone-700"
          aria-label="Primary Navigation"
        >
          <button
            type="button"
            onClick={() => {
              setActiveView('news');
              handleResetFilters();
            }}
            className={`hover:text-red-900 transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'news' && selectedLevel === 'all' && !isDedicatedMandalMode
                ? 'text-red-900 underline underline-offset-4'
                : ''
            }`}
          >
            {t.navAllNews}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveView('news');
              setSelectedLevel('national');
              setIsDedicatedMandalMode(false);
            }}
            className={`hover:text-red-900 transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'news' && selectedLevel === 'national'
                ? 'text-red-900 underline underline-offset-4'
                : ''
            }`}
          >
            {t.navNational}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveView('news');
              setSelectedLevel('mandal');
            }}
            className={`hover:text-red-900 transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'news' && (selectedLevel === 'mandal' || isDedicatedMandalMode)
                ? 'text-red-900 underline underline-offset-4'
                : ''
            }`}
          >
            {t.navMandal}
          </button>
          <button
            type="button"
            onClick={() => setActiveView('youtube')}
            className={`hover:text-red-900 transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'youtube' ? 'text-red-900 underline underline-offset-4' : ''
            }`}
          >
            {t.navYoutube}
          </button>
          <button
            type="button"
            onClick={() => setActiveView('reporter')}
            className={`hover:text-red-900 transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'reporter' ? 'text-red-900 underline underline-offset-4' : ''
            }`}
          >
            {t.navReporterPortal}
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveView('admin')}
            className="px-4 py-2 text-xs font-bold text-white bg-red-900 rounded-lg hover:bg-red-950 transition-colors whitespace-nowrap shrink-0"
          >
            {t.navAdminPortal}
          </button>
        </div>
      </header>

      {/* EDITORIAL MASTHEAD, ATTACHED OFFICIAL BANNER IMAGE, LOGO, MULTILINGUAL SWITCHER & UTILITY BAR */}
      <div className="bg-stone-900 text-stone-100 border-b border-stone-800">
        {/* ATTACHED OFFICIAL NETI BHARATAM BANNER IMAGE DISPLAY (ADMIN CHANGEABLE) */}
        {(portalState.siteConfig?.showBannerImage ?? true) && (
          <div
            className="bg-gradient-to-r from-[#0c1e3e] via-[#132b59] to-[#0c1e3e] border-b border-amber-400/50"
            data-testid="official-masthead-banner"
          >
            <div className="max-w-7xl mx-auto px-2 sm:px-6 py-2">
              <img
                src={
                  portalState.siteConfig?.bannerUrl ||
                  portalState.bannerUrl ||
                  OFFICIAL_BANNER_IMAGE
                }
                alt="నేటి భారతం Official Banner — ఏది నిజం | నిజాన్ని నిర్భయంగా చెప్పడమే మా లక్ష్యం"
                referrerPolicy="no-referrer"
                className="w-full max-h-36 sm:max-h-44 object-contain mx-auto rounded-lg shadow-md"
              />
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          {/* Attached Official Brand Emblem + Masthead Title (Editable from Admin Panel) */}
          <div className="flex items-center gap-4">
            <img
              src={portalState.siteConfig?.logoUrl || portalState.logoUrl || OFFICIAL_BANNER_IMAGE}
              alt="నేటి భారతం Official Logo"
              referrerPolicy="no-referrer"
              className="w-20 h-16 rounded-xl bg-white p-1 object-contain border-2 border-amber-400 shrink-0"
            />
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-amber-400">
                {portalState.siteConfig?.mastheadTagline || t.editionLabel}
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-extrabold tracking-tight text-white">
                {portalState.siteConfig?.mastheadHeading ||
                  'నేటి భారతం · नेटी भारतम · NETI BHARATAM'}
              </h1>
              <p className="text-xs text-stone-300 mt-0.5">
                {portalState.siteConfig?.mastheadSubtitle || t.brandSubtitle}
              </p>
            </div>
          </div>

          {/* Language Switcher (Telugu, Hindi, English), Notifications, App Install & Pvt Ad CTA */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div
              className="flex items-center gap-1 bg-stone-800 p-1 rounded-lg border border-stone-700"
              role="group"
              aria-label="Language Switcher"
            >
              <button
                type="button"
                onClick={() => setLang('te')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  lang === 'te' ? 'bg-amber-400 text-stone-950' : 'text-stone-200 hover:text-white'
                }`}
              >
                తెలుగు
              </button>
              <button
                type="button"
                onClick={() => setLang('hi')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  lang === 'hi' ? 'bg-amber-400 text-stone-950' : 'text-stone-200 hover:text-white'
                }`}
              >
                हिंदी
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  lang === 'en' ? 'bg-amber-400 text-stone-950' : 'text-stone-200 hover:text-white'
                }`}
              >
                English
              </button>
            </div>

            {/* Breaking News Notifications Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotificationsDropdown((prev) => !prev)}
                aria-label="Breaking News Notifications"
                className="flex items-center gap-1.5 rounded-lg bg-stone-800 border border-stone-700 px-3 py-2 text-xs font-semibold text-white hover:bg-stone-700 transition-colors whitespace-nowrap shrink-0"
              >
                <Bell className="w-4 h-4 text-amber-400" />
                <span>నోటిఫికేషన్లు ({portalState.notifications.length})</span>
              </button>

              {showNotificationsDropdown && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white text-stone-900 shadow-2xl border border-stone-200 p-4 z-40">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2 mb-2">
                    <span className="text-xs font-bold text-stone-900">
                      తాజా వార్తా నోటిఫికేషన్లు · Live Alerts
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowNotificationsDropdown(false)}
                      className="text-xs text-stone-500 hover:text-stone-800"
                    >
                      Close
                    </button>
                  </div>
                  <div className="divide-y divide-stone-200 max-h-64 overflow-y-auto">
                    {portalState.notifications.map((n) => (
                      <div key={n.id} className="py-2.5 text-xs">
                        <div className="text-stone-500 font-mono">{n.timestamp}</div>
                        <div className="font-semibold text-stone-900 mt-0.5">{n.title[lang]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Post Private Ad Button */}
            <button
              type="button"
              onClick={() => setShowPostAdModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-extrabold text-stone-950 hover:bg-amber-400 transition-colors whitespace-nowrap shrink-0"
            >
              <Megaphone className="w-4 h-4" />
              <span>{t.navPostPvtAd}</span>
            </button>

            {/* Mobile App / Play Store Button */}
            <button
              type="button"
              onClick={() => setShowPlayStoreModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition-colors whitespace-nowrap shrink-0"
            >
              <Smartphone className="w-4 h-4" />
              <span>{t.playStoreBtn}</span>
            </button>

            {/* Media Staff & E-Paper RBAC Login Button */}
            <button
              type="button"
              onClick={() => setActiveView('reporter')}
              className="flex items-center gap-1.5 rounded-lg bg-red-800 border border-amber-400/60 px-3.5 py-2 text-xs font-extrabold text-amber-200 hover:bg-red-700 transition-colors whitespace-nowrap shrink-0"
            >
              <span>మీడియా సిబ్బంది &amp; ఈ-పేపర్ లాగిన్ (30+ Posts)</span>
            </button>
          </div>
        </div>

        {/* Mobile Quick Section Switcher */}
        <div className="md:hidden flex items-center gap-2 overflow-x-auto px-4 py-2.5 bg-stone-950 border-t border-stone-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveView('news');
              handleResetFilters();
            }}
            className="px-3 py-1.5 rounded bg-stone-800 text-white whitespace-nowrap shrink-0"
          >
            {t.navAllNews}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveView('news');
              setSelectedLevel('mandal');
            }}
            className="px-3 py-1.5 rounded bg-stone-800 text-amber-300 whitespace-nowrap shrink-0"
          >
            {t.navMandal}
          </button>
          <button
            type="button"
            onClick={() => setActiveView('youtube')}
            className="px-3 py-1.5 rounded bg-stone-800 text-white whitespace-nowrap shrink-0"
          >
            YouTube
          </button>
          <button
            type="button"
            onClick={() => setActiveView('reporter')}
            className="px-3 py-1.5 rounded bg-red-900 text-white whitespace-nowrap shrink-0"
          >
            {t.navReporterPortal}
          </button>
          <button
            type="button"
            onClick={() => setActiveView('admin')}
            className="px-3 py-1.5 rounded bg-stone-800 text-white whitespace-nowrap shrink-0"
          >
            Admin
          </button>
        </div>
      </div>

      {/* MAIN WORKSPACE CONTAINER */}
      <main id="top" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-10">
        {activeView === 'reporter' && (
          <div className="space-y-10">
            <MediaStaffOrganizationView
              portalState={portalState}
              initialOpenLoginModal={true}
              onRegisterMediaStaff={async (input) => {
                const data = await syncWithApi(
                  'REGISTER_MEDIA_STAFF',
                  input as unknown as Record<string, unknown>
                );
                return data.staff;
              }}
              onApproveMediaStaff={async (staffId) => {
                await syncWithApi('APPROVE_MEDIA_STAFF', { staffId });
              }}
              onChangeMediaStaffPassword={async (staffId, newPassword) => {
                await syncWithApi('CHANGE_MEDIA_STAFF_PASSWORD', { staffId, newPassword });
              }}
              onSetMediaStaffBlock={async (staffId, blocked) => {
                await syncWithApi('SET_MEDIA_STAFF_BLOCK', { staffId, blocked });
              }}
              onUpdateEpaperPage={async (pageId, updates) => {
                await syncWithApi('UPDATE_EPAPER_PAGE_WORKFLOW', { pageId, updates });
              }}
              onStaffPublishNews={async (newsInput) => {
                await syncWithApi('STAFF_PUBLISH_NEWS', { newsInput });
              }}
              onUpdateArticleHeadline={async (articleId, newTitleTe) => {
                const updated = portalState.articles.map((a) =>
                  a.id === articleId
                    ? { ...a, title: { ...a.title, te: newTitleTe } }
                    : a
                );
                setPortalState({ ...portalState, articles: updated });
              }}
              onApprovePrivateAdByStaff={async (adId) => {
                const updatedAds = portalState.privateAds.map((a) =>
                  a.id === adId ? { ...a, status: 'approved' as const } : a
                );
                setPortalState({ ...portalState, privateAds: updatedAds });
              }}
              onSubmitPrivateAd={async (input: SubmitPrivateAdInput) => {
                await syncWithApi(
                  'SUBMIT_PRIVATE_AD',
                  input as unknown as Record<string, unknown>
                );
              }}
            />

            <ReporterPortalView
              portalState={portalState}
              lang={lang}
              onRegisterReporter={async (input: RegisterReporterInput) => {
                const data = await syncWithApi(
                  'REGISTER_REPORTER',
                  input as unknown as Record<string, unknown>
                );
                return data.reporter;
              }}
              onReporterPublishNews={async (
                reporterId: string,
                newsInput: PublishReporterNewsInput
              ) => {
                await syncWithApi('REPORTER_PUBLISH_NEWS', { reporterId, newsInput });
              }}
              onSubmitPrivateAd={async (input: SubmitPrivateAdInput) => {
                await syncWithApi('SUBMIT_PRIVATE_AD', input as unknown as Record<string, unknown>);
              }}
              onOpenMandalPage={handleOpenMandalPage}
            />
          </div>
        )}

        {activeView === 'admin' && (
          <AdminDashboardView
            portalState={portalState}
            onAdminLogin={async (u, p) => {
              try {
                await syncWithApi('ADMIN_LOGIN', { username: u, password: p });
                return true;
              } catch {
                return verifyAdminLogin(u, p);
              }
            }}
            onApproveReporter={async (reporterId, adminUsername, adminPassword) => {
              await syncWithApi('ADMIN_APPROVE_REPORTER', {
                reporterId,
                adminUsername,
                adminPassword
              });
            }}
            onChangeReporterPassword={async (
              reporterId,
              newPassword,
              adminUsername,
              adminPassword
            ) => {
              await syncWithApi('ADMIN_CHANGE_REPORTER_PASSWORD', {
                reporterId,
                newPassword,
                adminUsername,
                adminPassword
              });
            }}
            onSetReporterBlockStatus={async (
              reporterId,
              blocked,
              adminUsername,
              adminPassword
            ) => {
              await syncWithApi('ADMIN_SET_REPORTER_BLOCK', {
                reporterId,
                blocked,
                adminUsername,
                adminPassword
              });
            }}
            onApprovePrivateAd={async (adId, adminUsername, adminPassword) => {
              await syncWithApi('ADMIN_APPROVE_AD', {
                adId,
                adminUsername,
                adminPassword
              });
            }}
            onAdminCreatePrivateAd={async (input, adminUsername, adminPassword) => {
              await syncWithApi('SUBMIT_PRIVATE_AD', {
                ...input,
                adminUsername,
                adminPassword,
                autoApprove: true
              });
            }}
            onDeletePrivateAd={async (adId, adminUsername, adminPassword) => {
              await syncWithApi('ADMIN_DELETE_AD', {
                adId,
                adminUsername,
                adminPassword
              });
            }}
            onAddLocation={async (
              stateName,
              districtName,
              mandalName,
              adminUsername,
              adminPassword
            ) => {
              await syncWithApi('ADMIN_ADD_LOCATION', {
                stateName,
                districtName,
                mandalName,
                adminUsername,
                adminPassword
              });
            }}
            onAdminPublishNews={async (newsInput, adminUsername, adminPassword) => {
              await syncWithApi('ADMIN_PUBLISH_NEWS', {
                newsInput,
                adminUsername,
                adminPassword
              });
            }}
            onDeleteArticle={async (articleId, adminUsername, adminPassword) => {
              await syncWithApi('ADMIN_DELETE_ARTICLE', {
                articleId,
                adminUsername,
                adminPassword
              });
            }}
            onUpdateArticle={async (articleId, updates, adminUsername, adminPassword) => {
              await syncWithApi('ADMIN_UPDATE_ARTICLE', {
                articleId,
                updates,
                adminUsername,
                adminPassword
              });
            }}
            onAddYoutube={async (videoInput, adminUsername, adminPassword) => {
              await syncWithApi('ADMIN_ADD_YOUTUBE', {
                videoInput,
                adminUsername,
                adminPassword
              });
            }}
            onDeleteYoutube={async (videoId, adminUsername, adminPassword) => {
              await syncWithApi('ADMIN_DELETE_YOUTUBE', {
                videoId,
                adminUsername,
                adminPassword
              });
            }}
            onUpdateAdSense={async (
              publisherId,
              adSlotId,
              dashboardLink,
              adminUsername,
              adminPassword
            ) => {
              await syncWithApi('ADMIN_UPDATE_ADSENSE', {
                publisherId,
                adSlotId,
                dashboardLink,
                adminUsername,
                adminPassword
              });
            }}
            onUpdateLogo={async (logoUrl, adminUsername, adminPassword) => {
              await syncWithApi('ADMIN_UPDATE_LOGO', {
                logoUrl,
                adminUsername,
                adminPassword
              });
            }}
            onUpdateBanner={async (bannerUrl, showBannerImage, adminUsername, adminPassword) => {
              await syncWithApi('ADMIN_UPDATE_BANNER', {
                bannerUrl,
                showBannerImage,
                adminUsername,
                adminPassword
              });
            }}
            onUpdateSiteConfig={async (
              siteConfig: Partial<SiteConfig>,
              adminUsername,
              adminPassword
            ) => {
              await syncWithApi('ADMIN_UPDATE_SITE_CONFIG', {
                siteConfig,
                adminUsername,
                adminPassword
              });
            }}
            onImportDatabase={async (importedState, adminUsername, adminPassword) => {
              await syncWithApi('ADMIN_IMPORT_DATABASE', {
                importedState,
                adminUsername,
                adminPassword
              });
            }}
            onApproveMediaStaff={async (staffId) => {
              await syncWithApi('APPROVE_MEDIA_STAFF', { staffId });
            }}
            onChangeMediaStaffPassword={async (staffId, newPassword) => {
              await syncWithApi('CHANGE_MEDIA_STAFF_PASSWORD', { staffId, newPassword });
            }}
            onSetMediaStaffBlock={async (staffId, blocked) => {
              await syncWithApi('SET_MEDIA_STAFF_BLOCK', { staffId, blocked });
            }}
          />
        )}

        {activeView === 'youtube' && (
          <section className="space-y-6" aria-label="Neti Bharatam YouTube Video Updates">
            <div className="bg-red-900 text-white rounded-xl p-6 lg:p-8 flex flex-wrap items-center justify-between gap-6">
              <div className="space-y-1.5">
                <div className="text-xs font-mono uppercase tracking-widest text-amber-300">
                  OFFICIAL BROADCAST CHANNEL · 24x7 VIDEO BULLETINS
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold">{t.youtubeSectionTitle}</h2>
                <p className="text-xs sm:text-sm text-red-100 font-mono">
                  Channel Link: {OFFICIAL_YOUTUBE_CHANNEL}
                </p>
              </div>
              <a
                href={OFFICIAL_YOUTUBE_CHANNEL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-xs sm:text-sm font-extrabold text-red-900 hover:bg-stone-100 transition-colors whitespace-nowrap shrink-0"
              >
                <Video className="w-4 h-4" />
                {t.youtubeChannelCta}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {portalState.youtubeUpdates.map((vid) => (
                <div
                  key={vid.id}
                  className="bg-white border border-stone-200 rounded-xl overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="relative">
                      <img
                        src={vid.thumbnailUrl}
                        alt={vid.title[lang]}
                        referrerPolicy="no-referrer"
                        className="w-full h-48 object-cover bg-stone-900"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Video className="w-4 h-4 text-red-400" />
                          Watch Bulletin on YouTube
                        </span>
                      </div>
                    </div>
                    <div className="p-5 space-y-2">
                      <div className="text-xs text-stone-500">
                        <span>{vid.locationTag}</span>
                        <span className="mx-1.5">·</span>
                        <span>{vid.publishedAt}</span>
                      </div>
                      <h3 className="text-base font-bold text-stone-900 leading-snug">
                        {vid.title[lang]}
                      </h3>
                    </div>
                  </div>
                  <div className="px-5 py-3.5 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-stone-700 tabular-nums flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-red-800" />
                      {vid.views.toLocaleString('en-IN')} Views
                    </span>
                    <a
                      href={vid.channelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-red-800 hover:underline flex items-center gap-1"
                    >
                      Open Channel
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeView === 'news' && (
          <>
            {/* ALL-INDIA STATE, DISTRICT, MANDAL & NEWS LEVEL FILTER BAR */}
            <section
              aria-label="News Search and All-India Mandal Filter"
              className="bg-white border border-stone-200 rounded-xl p-5 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
                <div
                  className="flex flex-wrap items-center gap-1.5 bg-stone-100 p-1 rounded-lg"
                  role="group"
                  aria-label="News Tier Filter"
                >
                  {(
                    [
                      { id: 'all', label: t.navAllNews },
                      { id: 'national', label: t.navNational },
                      { id: 'state', label: t.navState },
                      { id: 'district', label: t.navDistrict },
                      { id: 'mandal', label: t.navMandal }
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setSelectedLevel(tab.id);
                        if (tab.id !== 'mandal') setIsDedicatedMandalMode(false);
                      }}
                      className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                        selectedLevel === tab.id
                          ? 'bg-red-800 text-white shadow-sm'
                          : 'text-stone-700 hover:text-stone-950'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Live Search Input */}
                <div className="relative flex-1 min-w-[260px] max-w-md">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="search"
                    aria-label="Search News by Headline or Mandal"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="w-full rounded-lg border border-stone-300 bg-stone-50 pl-10 pr-4 py-2 text-xs text-stone-900 focus:border-red-800 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* All-India Cascading State -> District -> Mandal Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">
                    1. {t.selectState} (All India)
                  </label>
                  <select
                    aria-label="Filter News by State"
                    value={selectedState}
                    onChange={(e) => {
                      setSelectedState(e.target.value);
                      setSelectedDistrict('ALL');
                      setSelectedMandal('ALL');
                      setIsDedicatedMandalMode(false);
                    }}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-900"
                  >
                    <option value="ALL">{t.allStates}</option>
                    {allStates.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">
                    2. {t.selectDistrict}{' '}
                    {selectedState !== 'ALL' ? `(${availableDistricts.length})` : ''}
                  </label>
                  <select
                    aria-label="Filter News by District"
                    value={selectedDistrict}
                    disabled={selectedState === 'ALL'}
                    onChange={(e) => {
                      setSelectedDistrict(e.target.value);
                      setSelectedMandal('ALL');
                      setIsDedicatedMandalMode(false);
                    }}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-900 disabled:bg-stone-100 disabled:text-stone-400"
                  >
                    <option value="ALL">
                      {t.allDistricts}
                      {selectedState !== 'ALL' ? ` (${availableDistricts.length} Districts)` : ''}
                    </option>
                    {availableDistricts.map((dt) => (
                      <option key={dt} value={dt}>
                        {dt} ({(portalState.locations[selectedState]?.[dt] || []).length} Mandals)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">
                    3. {t.selectMandal} (మండలం వారీగా పేజీ){' '}
                    {selectedDistrict !== 'ALL' ? `(${availableMandals.length})` : ''}
                  </label>
                  <select
                    aria-label="Filter News by Mandal"
                    value={selectedMandal}
                    disabled={selectedDistrict === 'ALL'}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedMandal(val);
                      setIsDedicatedMandalMode(val !== 'ALL');
                    }}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-bold text-red-900 disabled:bg-stone-100 disabled:text-stone-400"
                  >
                    <option value="ALL">
                      {t.allMandals}
                      {selectedDistrict !== 'ALL' ? ` (${availableMandals.length} Mandals)` : ''}
                    </option>
                    {availableMandals.map((mn) => (
                      <option key={mn} value={mn}>
                        {mn}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleOpenMandalPage(
                        'Telangana (తెలంగాణ)',
                        'Karimnagar (కరీంనగర్)',
                        'Huzurabad (హుజూరాబాద్)'
                      )
                    }
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-stone-900 px-3 py-2 text-xs font-bold text-white hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0"
                  >
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    హుజూరాబాద్ మండల పేజీ
                  </button>
                  {(selectedState !== 'ALL' ||
                    selectedLevel !== 'all' ||
                    searchQuery !== '' ||
                    isDedicatedMandalMode) && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 whitespace-nowrap shrink-0"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Official Telangana (33 Districts) & Andhra Pradesh (26 Districts) Administrative Directory Bar */}
              <div
                className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-200 text-xs text-stone-700"
                data-testid="official-districts-mandals-summary"
              >
                <div className="flex flex-wrap items-center gap-4">
                  <span className="font-bold text-red-900">
                    తెలంగాణ (Telangana):{' '}
                    {Object.keys(portalState.locations['Telangana (తెలంగాణ)'] || {}).length} జిల్లాలు ·{' '}
                    {Object.values(portalState.locations['Telangana (తెలంగాణ)'] || {}).reduce(
                      (acc, arr) => acc + arr.length,
                      0
                    )}{' '}
                    మండలాలు
                  </span>
                  <span className="text-stone-300">|</span>
                  <span className="font-bold text-emerald-900">
                    ఆంధ్రప్రదేశ్ (Andhra Pradesh):{' '}
                    {Object.keys(portalState.locations['Andhra Pradesh (ఆంధ్రప్రదేశ్)'] || {}).length}{' '}
                    జిల్లాలు ·{' '}
                    {Object.values(portalState.locations['Andhra Pradesh (ఆంధ్రప్రదేశ్)'] || {}).reduce(
                      (acc, arr) => acc + arr.length,
                      0
                    )}{' '}
                    మండలాలు
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={TELANGANA_OFFICIAL_DIRECTORY_PDF}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-red-800 hover:underline"
                  >
                    Telangana 33 Districts &amp; Mandals PDF
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="text-stone-300">·</span>
                  <a
                    href={ANDHRA_PRADESH_OFFICIAL_DIRECTORY_PDF}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-emerald-800 hover:underline"
                  >
                    Andhra Pradesh 26 Districts &amp; Mandals PDF
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </section>

            {/* DEDICATED MANDAL PAGE HEADER WHEN A SPECIFIC MANDAL IS ACTIVE */}
            {selectedMandal !== 'ALL' && (
              <div className="bg-red-900 text-white rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-mono uppercase tracking-widest text-amber-300">
                    {t.mandalSpecialPageTitle} · MANDAL SPECIAL EDITION
                  </div>
                  <h2 className="text-2xl font-serif font-bold mt-1">
                    {selectedMandal} — పూర్తి మండల వార్తలు &amp; ప్రకటనలు
                  </h2>
                  <p className="text-xs text-red-100 mt-0.5">
                    జిల్లా: {selectedDistrict} · రాష్ట్రం: {selectedState} · ఈ మండలంలోని రిపోర్టర్లు అప్‌లోడ్ చేసిన అన్ని వార్తలు ఇక్కడ కనిపిస్తాయి.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveView('reporter')}
                    className="rounded-lg bg-white px-4 py-2 text-xs font-extrabold text-red-900 hover:bg-stone-100"
                  >
                    ఈ మండల రిపోర్టర్‌గా వార్త అప్‌లోడ్ చేయండి
                  </button>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="rounded-lg border border-red-300 px-3.5 py-2 text-xs font-semibold text-white hover:bg-red-800"
                  >
                    అన్ని వార్తలు చూడండి
                  </button>
                </div>
              </div>
            )}

            {/* 3-TIER EDITORIAL NEWS FRONT-PAGE LAYOUT */}
            {filteredArticles.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-xl p-12 text-center space-y-3">
                <p className="text-base font-bold text-stone-800">
                  ఎంచుకున్న మండలం / ఫిల్టర్‌లో ప్రస్తుతం వార్తలు లేవు.
                </p>
                <p className="text-xs text-stone-500">
                  రిపోర్టర్ పోర్టల్ ద్వారా ఈ మండలంలో మొదటి వార్తను అప్‌లోడ్ చేయండి లేదా ఫిల్టర్ మార్చండి.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-800 px-5 py-2.5 text-xs font-bold text-white"
                >
                  అన్ని వార్తలు చూపించండి (Show All News)
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left 8 Columns: Lead Story + Secondary Stories */}
                <div className="lg:col-span-8 space-y-8">
                  {leadArticle && (
                    <article className="bg-white border border-stone-200 rounded-xl overflow-hidden">
                      <div className="relative">
                        <img
                          src={leadArticle.imageUrl}
                          alt={leadArticle.title[lang]}
                          referrerPolicy="no-referrer"
                          className="w-full h-72 sm:h-96 object-cover bg-stone-900"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-6 text-white">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-amber-300 font-semibold mb-2">
                            <span>{leadArticle.category}</span>
                            <span aria-hidden="true">·</span>
                            <span>{leadArticle.mandal}</span>
                            <span aria-hidden="true">·</span>
                            <span>{leadArticle.district}</span>
                          </div>
                          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold leading-tight text-balance">
                            {leadArticle.title[lang]}
                          </h2>
                        </div>
                      </div>

                      <div className="p-6 space-y-4">
                        <p className="text-sm sm:text-base text-stone-700 leading-relaxed">
                          {leadArticle.summary[lang]}
                        </p>

                        <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4 text-xs text-stone-500">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-stone-800">
                              {leadArticle.authorName}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{leadArticle.publishedAt}</span>
                            <span aria-hidden="true">·</span>
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenMandalPage(
                                  leadArticle.state,
                                  leadArticle.district,
                                  leadArticle.mandal
                                )
                              }
                              className="font-bold text-red-900 hover:underline"
                            >
                              మండలం: {leadArticle.mandal}
                            </button>
                          </div>

                          <div className="flex items-center gap-4">
                            <span
                              className="inline-flex items-center gap-1.5 font-mono font-bold text-stone-800 tabular-nums"
                              title="Total Views"
                            >
                              <Eye className="w-4 h-4 text-red-800" />
                              {leadArticle.views.toLocaleString('en-IN')} {t.viewsLabel}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleOpenArticle(leadArticle)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-red-800 px-4 py-2 text-xs font-bold text-white hover:bg-red-900 transition-colors"
                            >
                              పూర్తి వార్త చదవండి · Read Full Story
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  )}

                  {/* Secondary Articles Grid */}
                  {secondaryArticles.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {secondaryArticles.map((art) => (
                        <article
                          key={art.id}
                          className="bg-white border border-stone-200 rounded-xl overflow-hidden flex flex-col justify-between"
                        >
                          <div>
                            <img
                              src={art.imageUrl}
                              alt={art.title[lang]}
                              referrerPolicy="no-referrer"
                              className="w-full h-48 object-cover border-b border-stone-200 bg-stone-900"
                            />
                            <div className="p-5 space-y-2.5">
                              <div className="flex items-center gap-1.5 text-xs text-stone-500">
                                <span className="font-bold text-red-900">{art.category}</span>
                                <span aria-hidden="true">·</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleOpenMandalPage(art.state, art.district, art.mandal)
                                  }
                                  className="font-semibold text-stone-800 hover:text-red-900 underline"
                                >
                                  {art.mandal}
                                </button>
                              </div>

                              <h3 className="text-lg font-serif font-bold text-stone-900 leading-snug">
                                {art.title[lang]}
                              </h3>

                              <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                                {art.summary[lang]}
                              </p>
                            </div>
                          </div>

                          <div className="px-5 py-3.5 border-t border-stone-200 bg-stone-50/70 flex items-center justify-between text-xs">
                            <span className="inline-flex items-center gap-1 font-mono font-bold text-stone-700 tabular-nums">
                              <Eye className="w-3.5 h-3.5 text-red-800" />
                              {art.views.toLocaleString('en-IN')} {t.viewsLabel}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleOpenArticle(art)}
                              className="font-bold text-red-800 hover:text-red-950 flex items-center gap-1"
                            >
                              చదవండి · Read
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right 4 Columns: YouTube Video Updates Sidebar + Mandal Quick Directory */}
                <aside className="lg:col-span-4 space-y-6">
                  <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                      <div>
                        <span className="text-xs font-mono uppercase tracking-wider text-red-800 font-bold">
                          LIVE VIDEO DESK
                        </span>
                        <h3 className="text-base font-bold text-stone-900">
                          {t.youtubeSectionTitle}
                        </h3>
                      </div>
                      <Video className="w-5 h-5 text-red-800 shrink-0" />
                    </div>

                    <div className="space-y-4">
                      {portalState.youtubeUpdates.map((yt) => (
                        <div key={yt.id} className="group border-b border-stone-200 pb-3 last:border-b-0 last:pb-0">
                          <div className="flex items-start gap-3">
                            <img
                              src={yt.thumbnailUrl}
                              alt={yt.title[lang]}
                              referrerPolicy="no-referrer"
                              className="w-24 h-16 rounded object-cover border border-stone-200 shrink-0 bg-stone-900"
                            />
                            <div className="space-y-1">
                              <a
                                href={yt.channelUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-bold text-stone-900 group-hover:text-red-800 line-clamp-2 leading-snug"
                              >
                                {yt.title[lang]}
                              </a>
                              <div className="text-xs text-stone-500 font-mono tabular-nums">
                                {yt.views.toLocaleString('en-IN')} views · {yt.publishedAt}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <a
                      href={OFFICIAL_YOUTUBE_CHANNEL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-800 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-900 transition-colors"
                    >
                      <Video className="w-4 h-4" />
                      {t.youtubeChannelCta}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Quick Mandal Pages Directory */}
                  <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-3">
                    <h3 className="text-base font-bold text-stone-900 border-b border-stone-200 pb-2.5">
                      ప్రముఖ మండల వార్తా పేజీలు · Mandal Pages
                    </h3>
                    <p className="text-xs text-stone-600">
                      ఏ మండలంపైనైనా క్లిక్ చేసి ఆ మండలంలోని అన్ని వార్తలు మరియు ప్రకటనలను చూడండి:
                    </p>
                    <div className="divide-y divide-stone-200 text-xs">
                      {[
                        {
                          state: 'Telangana (తెలంగాణ)',
                          district: 'Karimnagar (కరీంనగర్)',
                          mandal: 'Huzurabad (హుజూరాబాద్)'
                        },
                        {
                          state: 'Andhra Pradesh (ఆంధ్రప్రదేశ్)',
                          district: 'Guntur (గుంటూరు)',
                          mandal: 'Mangalagiri (మంగళగిరి)'
                        },
                        {
                          state: 'Telangana (తెలంగాణ)',
                          district: 'Warangal (వరంగల్)',
                          mandal: 'Narsampet (నర్సంపేట)'
                        },
                        {
                          state: 'Andhra Pradesh (ఆంధ్రప్రదేశ్)',
                          district: 'NTR Vijayawada (ఎన్టీఆర్ విజయవాడ)',
                          mandal: 'Vijayawada Central (విజయవాడ సెంట్రల్)'
                        },
                        {
                          state: 'Telangana (తెలంగాణ)',
                          district: 'Hyderabad (హైదరాబాద్)',
                          mandal: 'Secunderabad (సికింద్రాబాద్)'
                        }
                      ].map((item) => (
                        <button
                          key={item.mandal}
                          type="button"
                          onClick={() =>
                            handleOpenMandalPage(item.state, item.district, item.mandal)
                          }
                          className="w-full py-2.5 flex items-center justify-between text-left hover:text-red-900 font-semibold text-stone-800 transition-colors"
                        >
                          <span>{item.mandal}</span>
                          <span className="text-stone-400 text-xs">{item.district} →</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </aside>
              </div>
            )}

            {/* PRIVATE ADS (PVT ADS) SHOWCASE SECTION — BANNER ADS & CLASSIFIEDS SECTION + ALL CATEGORIES */}
            <section
              aria-label="Private Classified and Commercial Advertisements"
              className="bg-white border border-stone-200 rounded-xl p-6 lg:p-8 space-y-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-red-800 font-bold">
                    ADMIN APPROVED PRIVATE ADS · బ్యానర్ యాడ్స్ &amp; క్లాసిఫైడ్స్ విభాగం (అన్ని కేటగిరీలు)
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mt-0.5">
                    ప్రైవేట్ ప్రకటనలు — బ్యానర్ యాడ్స్ &amp; క్లాసిఫైడ్స్ (హోమ్ పేజీ · రాష్ట్ర · జిల్లా · మండల వారీగా)
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Format Switcher: All / Banner Ads / Classifieds */}
                  <div
                    className="flex items-center gap-1 bg-stone-900 p-1 rounded-lg"
                    role="group"
                    aria-label="Private Ad Format Switcher"
                  >
                    {(
                      [
                        { id: 'all', label: 'అన్నీ (All)' },
                        { id: 'banner', label: 'బ్యానర్ యాడ్స్ (Banner Ads)' },
                        { id: 'classified', label: 'క్లాసిఫైడ్స్ (Classifieds)' }
                      ] as const
                    ).map((fmt) => (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => setSelectedAdFormat(fmt.id)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                          selectedAdFormat === fmt.id
                            ? 'bg-amber-400 text-stone-950'
                            : 'text-stone-200 hover:bg-stone-800'
                        }`}
                      >
                        {fmt.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowPostAdModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-800 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-900 transition-colors whitespace-nowrap shrink-0"
                  >
                    <Megaphone className="w-3.5 h-3.5" />
                    {t.pvtAdSubmitBtn}
                  </button>
                </div>
              </div>

              {/* Segmented Tabs for Home Page Wise, State Wise, District Wise, Mandal Wise + All Categories */}
              <div className="space-y-4 bg-stone-50 p-4 rounded-xl border border-stone-200">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div
                    className="flex flex-wrap items-center gap-1.5 bg-stone-200/80 p-1 rounded-lg"
                    role="group"
                    aria-label="Private Ads Tier Filter"
                  >
                    {(
                      [
                        { id: 'all', label: 'అన్నీ (All Ads)' },
                        { id: 'home', label: 'హోమ్ పేజీ వారీగా (Home Page Wise)' },
                        { id: 'state', label: 'రాష్ట్ర వారీగా (State Wise)' },
                        { id: 'district', label: 'జిల్లా వారీగా (District Wise)' },
                        { id: 'mandal', label: 'మండల వారీగా (Mandal Wise)' }
                      ] as const
                    ).map((sc) => (
                      <button
                        key={sc.id}
                        type="button"
                        onClick={() => setSelectedAdScope(sc.id)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                          selectedAdScope === sc.id
                            ? 'bg-red-800 text-white shadow-sm'
                            : 'text-stone-700 hover:bg-white'
                        }`}
                      >
                        {sc.label}
                      </button>
                    ))}
                  </div>

                  <select
                    aria-label="Filter Private Ads by Category"
                    value={selectedAdCategory}
                    onChange={(e) => setSelectedAdCategory(e.target.value)}
                    className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-800"
                  >
                    <option value="ALL">
                      అన్ని కేటగిరీలు (All {PRIVATE_AD_CATEGORIES.length} Categories)
                    </option>
                    {PRIVATE_AD_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location Filters for State Wise, District Wise, and Mandal Wise Private Ads */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-stone-200">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      రాష్ట్రం వారీగా ప్రకటనలు (Ad State Filter)
                    </label>
                    <select
                      aria-label="Filter Private Ads by State"
                      value={selectedAdState}
                      onChange={(e) => {
                        setSelectedAdState(e.target.value);
                        setSelectedAdDistrict('ALL');
                        setSelectedAdMandal('ALL');
                      }}
                      className="w-full rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-900"
                    >
                      <option value="ALL">అన్ని రాష్ట్రాలు (All States)</option>
                      {allStates.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      జిల్లా వారీగా ప్రకటనలు (Ad District Filter)
                    </label>
                    <select
                      aria-label="Filter Private Ads by District"
                      value={selectedAdDistrict}
                      disabled={selectedAdState === 'ALL'}
                      onChange={(e) => {
                        setSelectedAdDistrict(e.target.value);
                        setSelectedAdMandal('ALL');
                      }}
                      className="w-full rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-900 disabled:bg-stone-100 disabled:text-stone-400"
                    >
                      <option value="ALL">అన్ని జిల్లాలు (All Districts)</option>
                      {availableAdDistricts.map((dt) => (
                        <option key={dt} value={dt}>
                          {dt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      మండలం వారీగా ప్రకటనలు (Ad Mandal Filter)
                    </label>
                    <select
                      aria-label="Filter Private Ads by Mandal"
                      value={selectedAdMandal}
                      disabled={selectedAdDistrict === 'ALL'}
                      onChange={(e) => setSelectedAdMandal(e.target.value)}
                      className="w-full rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-bold text-red-900 disabled:bg-stone-100 disabled:text-stone-400"
                    >
                      <option value="ALL">అన్ని మండలాలు (All Mandals)</option>
                      {availableAdMandals.map((mn) => (
                        <option key={mn} value={mn}>
                          {mn}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {filteredAds.length === 0 ? (
                <div className="p-8 text-center text-xs text-stone-500 border border-dashed border-stone-300 rounded-xl">
                  ఈ విభాగంలో ప్రస్తుతం ప్రకటనలు లేవు. కొత్త ప్రైవేట్ యాడ్ బుక్ చేయడానికి పై బటన్‌పై క్లిక్ చేయండి.
                </div>
              ) : (
                <div className="space-y-8">
                  {/* 1. BANNER ADS SHOWCASE */}
                  {bannerAds.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                        <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                          <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-800" />
                          బ్యానర్ ప్రకటనల విభాగం · Commercial Banner Ads ({bannerAds.length})
                        </h3>
                        <span className="text-xs font-semibold text-stone-500">
                          ఇమేజ్ బ్యానర్ + పూర్తి వివరాలు
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {bannerAds.map((ad) => (
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
                                <div className="text-xs text-stone-500 flex flex-wrap items-center gap-1.5">
                                  <span className="px-2 py-0.5 rounded bg-red-100 text-red-900 font-bold text-[10px]">
                                    BANNER AD
                                  </span>
                                  <span className="font-bold text-red-900">
                                    {AD_SCOPE_BADGE_LABELS[ad.scope]}
                                  </span>
                                  <span>·</span>
                                  <span>{ad.scope === 'home' ? 'All India Home' : ad.mandal}</span>
                                </div>
                                <div className="text-[11px] font-bold text-stone-600">
                                  {ad.category}
                                </div>
                                <h4 className="text-sm font-bold text-stone-900 leading-snug">
                                  {ad.title}
                                </h4>
                                <p className="text-xs text-stone-700 leading-relaxed">{ad.matter}</p>
                              </div>
                            </div>

                            <div className="px-4 py-3 border-t border-stone-200 bg-white flex items-center justify-between text-xs">
                              <span className="font-semibold text-stone-700 truncate max-w-[130px]">
                                {ad.advertiserName}
                              </span>
                              <span className="font-mono font-bold text-red-900 tabular-nums shrink-0">
                                Ph: {ad.contactPhone}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2. DEDICATED CLASSIFIEDS SECTION (క్లాసిఫైడ్ ప్రకటనల విభాగం) */}
                  {classifiedAds.length > 0 && (
                    <div
                      className="space-y-4 bg-amber-50/50 border border-amber-200/80 rounded-xl p-5"
                      data-testid="classified-ads-section"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-3">
                        <div>
                          <div className="text-[11px] font-mono uppercase tracking-wider font-bold text-amber-900">
                            NETI BHARATAM CLASSIFIEDS BOARD · క్లాసిఫైడ్ ప్రకటనలు
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-stone-900">
                            క్లాసిఫైడ్స్ విభాగం · Classified Advertisements ({classifiedAds.length})
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowPostAdModal(true)}
                          className="rounded-lg bg-stone-900 px-3.5 py-2 text-xs font-bold text-amber-300 hover:bg-stone-800 transition-colors"
                        >
                          + క్లాసిఫైడ్ యాడ్ ఇవ్వండి (Post Classified)
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {classifiedAds.map((ad) => (
                          <div
                            key={ad.id}
                            className="bg-white border border-amber-300/80 rounded-lg p-4 flex flex-col justify-between shadow-xs"
                          >
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between gap-2 text-[11px]">
                                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-950 font-extrabold border border-amber-300">
                                  CLASSIFIED · {ad.category.split('(')[0].trim()}
                                </span>
                                <span className="font-bold text-red-900">
                                  {ad.scope === 'home' ? 'Home Page' : ad.mandal}
                                </span>
                              </div>

                              <div className="flex items-start gap-3">
                                <img
                                  src={ad.imageUrl}
                                  alt={ad.title}
                                  referrerPolicy="no-referrer"
                                  className="w-20 h-16 rounded object-cover border border-stone-200 shrink-0 bg-stone-900"
                                />
                                <h4 className="text-sm font-bold text-stone-900 leading-snug">
                                  {ad.title}
                                </h4>
                              </div>

                              <p className="text-xs text-stone-700 leading-relaxed">{ad.matter}</p>
                            </div>

                            <div className="mt-3 pt-2.5 border-t border-stone-200 flex items-center justify-between text-xs">
                              <span className="font-semibold text-stone-700 truncate max-w-[150px]">
                                {ad.advertiserName}
                              </span>
                              <span className="font-mono font-bold text-red-900 tabular-nums shrink-0">
                                Ph: {ad.contactPhone}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* PRINT, DIGITAL & E-PAPER 4-DIVISION MEDIA ORGANIZATION & 5-TIER RBAC LOGIN SHOWCASE */}
            <section
              aria-label="Print, Digital and E-Paper Organization & RBAC Login System"
              className="bg-white border border-stone-200 rounded-xl p-6 lg:p-8 space-y-6"
              data-testid="homepage-media-org-showcase"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200 pb-5">
                <div className="space-y-1.5 max-w-3xl">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-red-900">
                    ప్రింట్ మీడియా · డిజిటల్ మీడియా · ఈ-పేపర్ (E-Paper) సంస్థాగత నిర్మాణం
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900">
                    నేటి భారతం — 4 ప్రధాన విభాగాలు, {MEDIA_POSTS_CATALOG.length}+ హోదాలు &amp; 5-స్థాయిల రోల్-బేస్డ్ లాగిన్ పోర్టల్
                  </h2>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    1. ఎడిటోరియల్ &amp; న్యూస్‌రూమ్ · 2. మార్కెటింగ్, అడ్వర్టైజింగ్ &amp; సర్క్యులేషన్ · 3. ప్రింటింగ్, ప్రొడక్షన్, DTP, CTP &amp; IT · 4. అడ్మినిస్ట్రేషన్, HR, ఫైనాన్స్ &amp; RNI లీగల్ — ప్రతి విభాగపు ఉద్యోగికి వారి స్థాయికి తగిన లాగిన్ &amp; పర్మిషన్లు.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveView('reporter')}
                  className="rounded-xl bg-red-900 px-5 py-3 text-xs font-extrabold text-white hover:bg-red-950 transition-colors flex items-center gap-2 shrink-0"
                >
                  <span>అన్ని పోస్టుల రోల్-బేస్డ్ లాగిన్ &amp; ఈ-పేపర్ డెస్క్ తెరవండి</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {MEDIA_DIVISIONS.map((div) => {
                  const postsInDiv = MEDIA_POSTS_CATALOG.filter((p) => p.divisionId === div.id);
                  return (
                    <div
                      key={div.id}
                      className="rounded-xl border border-stone-200 bg-stone-50/70 p-4 flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="rounded bg-red-900 px-2 py-0.5 text-[11px] font-extrabold text-amber-300">
                            విభాగం {div.numberLabel}
                          </span>
                          <span className="text-[11px] font-bold text-stone-500">
                            {postsInDiv.length} పోస్టులు
                          </span>
                        </div>
                        <h3 className="text-sm font-extrabold text-stone-900 leading-snug">
                          {div.titleTe}
                        </h3>
                        <p className="text-xs text-stone-600 leading-relaxed">{div.subtitleTe}</p>
                        <ul className="space-y-1 pt-2 border-t border-stone-200/80 text-xs text-stone-800">
                          {postsInDiv.slice(0, 5).map((p) => (
                            <li key={p.code} className="truncate flex items-center gap-1.5">
                              <span className="text-red-800 font-bold">•</span>
                              <span className="truncate">{p.titleTe.split('(')[0]}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveView('reporter')}
                        className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-bold text-stone-900 hover:bg-stone-900 hover:text-white transition-colors"
                      >
                        ఈ విభాగం లాగిన్ &amp; బాధ్యతలు చూడండి →
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* USER FEEDBACK SYSTEM SECTION */}
            <section
              aria-label="Reader Feedback System"
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white border border-stone-200 rounded-xl p-6 lg:p-8"
            >
              <div className="lg:col-span-5 space-y-4">
                <h2 className="text-xl font-bold text-stone-900">{t.feedbackHeading}</h2>
                <p className="text-xs text-stone-600 leading-relaxed">
                  నేటి భారతం వార్తా వేదికపై మీ అభిప్రాయాలు, సూచనలు లేదా మీ మండల సమస్యలను నేరుగా ఎడిటోరియల్ బృందానికి పంపండి.
                </p>

                {fbStatus && (
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-900">
                    {fbStatus}
                  </div>
                )}

                <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      మీ పేరు · Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fbName}
                      onChange={(e) => setFbName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        మొబైల్ / ఇమెయిల్
                      </label>
                      <input
                        type="text"
                        value={fbContact}
                        onChange={(e) => setFbContact(e.target.value)}
                        placeholder="98480 XXXXX"
                        className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        రేటింగ్ · Rating
                      </label>
                      <select
                        aria-label="Feedback Rating"
                        value={fbRating}
                        onChange={(e) => setFbRating(Number(e.target.value))}
                        className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900"
                      >
                        <option value={5}>5 ★ - అద్భుతం (Excellent)</option>
                        <option value={4}>4 ★ - బాగుంది (Good)</option>
                        <option value={3}>3 ★ - సాధారణం (Average)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      మీ అభిప్రాయం · Feedback Message *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={fbMessage}
                      onChange={(e) => setFbMessage(e.target.value)}
                      placeholder="మీ మండల వార్తలపై లేదా యాప్ పనితీరుపై మీ అభిప్రాయం..."
                      className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-lg bg-stone-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-stone-800 transition-colors"
                  >
                    {t.feedbackSubmitBtn}
                  </button>
                </form>
              </div>

              <div className="lg:col-span-7 space-y-4">
                <h3 className="text-base font-bold text-stone-900 border-b border-stone-200 pb-2.5">
                  పాఠకుల స్పందన · Verified Reader Testimonials ({portalState.feedbackList.length})
                </h3>
                <div className="divide-y divide-stone-200">
                  {portalState.feedbackList.map((fb) => (
                    <div key={fb.id} className="py-3.5 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-stone-900">{fb.readerName}</span>
                        <span className="font-mono font-bold text-amber-700 tabular-nums">
                          {fb.rating}/5 ★ · {fb.location}
                        </span>
                      </div>
                      <p className="text-xs text-stone-700 leading-relaxed">{fb.message}</p>
                      <div className="text-xs text-stone-400">{fb.createdAt}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* CLEAN EDITORIAL FOOTER (ADMIN EDITABLE VIA SITE CONFIG CMS) */}
      <footer className="bg-stone-950 text-stone-400 border-t border-stone-800 py-8 px-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-6 text-xs">
          <div className="flex items-center gap-3">
            <img
              src={portalState.siteConfig?.logoUrl || portalState.logoUrl || OFFICIAL_BANNER_IMAGE}
              alt="Neti Bharatam Logo"
              referrerPolicy="no-referrer"
              className="w-14 h-10 rounded-lg bg-white p-0.5 object-contain"
            />
            <div>
              <div className="font-bold text-white">
                {portalState.siteConfig?.footerCopyright ||
                  'నేటి భారతం (Neti Bharatam) — Multilingual Indian News Network'}
              </div>
              <div>
                {portalState.siteConfig?.officeAddress ||
                  'National · State · District · Mandal News in Telugu, Hindi & English'}{' '}
                · Ph: {portalState.siteConfig?.contactPhone || '+91 98480 12345'} ·{' '}
                {portalState.siteConfig?.contactEmail || 'editor@netibharatam.in'}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a
              href={portalState.siteConfig?.officialYoutubeChannel || OFFICIAL_YOUTUBE_CHANNEL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-300 hover:text-white font-semibold"
            >
              YouTube Channel
            </a>
            <button
              type="button"
              onClick={() => setActiveView('reporter')}
              className="text-stone-300 hover:text-white font-semibold"
            >
              Reporter Registration &amp; Press ID
            </button>
            <button
              type="button"
              onClick={() => setShowPostAdModal(true)}
              className="text-stone-300 hover:text-white font-semibold"
            >
              Book Private Ad
            </button>
            <button
              type="button"
              onClick={() => setActiveView('admin')}
              className="text-stone-300 hover:text-white font-semibold"
            >
              Admin Console
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {readingArticle && (
        <ArticleReaderModal
          article={readingArticle}
          lang={lang}
          onClose={() => setReadingArticle(null)}
          onOpenMandalPage={handleOpenMandalPage}
        />
      )}

      {showPostAdModal && (
        <SubmitPrivateAdModal
          portalState={portalState}
          onClose={() => setShowPostAdModal(false)}
          onSubmitAd={async (input: SubmitPrivateAdInput) => {
            await syncWithApi('SUBMIT_PRIVATE_AD', input as unknown as Record<string, unknown>);
          }}
        />
      )}

      {showPlayStoreModal && (
        <PlayStoreAppModal
          logoUrl={portalState.logoUrl}
          isInstallable={isInstallable}
          onTriggerInstall={install}
          onClose={() => setShowPlayStoreModal(false)}
        />
      )}
    </div>
  );
}
