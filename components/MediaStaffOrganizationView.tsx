'use client';

import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Printer,
  Newspaper,
  Megaphone,
  Server,
  PlusCircle,
  FileCheck2,
  Sparkles,
  LogOut,
  Award,
  Upload,
  LogIn,
  X,
  AlertTriangle,
  Fingerprint
} from 'lucide-react';
import {
  PortalState,
  MediaStaffMember,
  MediaDivisionId,
  MediaAccessTier,
  EpaperEditionPage,
  MEDIA_DIVISIONS,
  MEDIA_POSTS_CATALOG,
  ACCESS_TIER_CATALOG,
  RegisterMediaStaffInput,
  SubmitPrivateAdInput,
  PRIVATE_AD_CATEGORIES,
  validateUidaiAadhaarNumber,
  authenticateMediaStaffLogin
} from '@/lib/news-engine';

interface MediaStaffOrganizationViewProps {
  portalState: PortalState;
  initialOpenLoginModal?: boolean;
  onRegisterMediaStaff: (
    input: RegisterMediaStaffInput & { byItSysAdmin?: boolean }
  ) => Promise<MediaStaffMember>;
  onApproveMediaStaff: (staffId: string) => Promise<void>;
  onChangeMediaStaffPassword: (staffId: string, newPassword: string) => Promise<void>;
  onSetMediaStaffBlock: (staffId: string, blocked: boolean) => Promise<void>;
  onUpdateEpaperPage: (pageId: string, updates: Partial<EpaperEditionPage>) => Promise<void>;
  onStaffPublishNews: (newsInput: {
    titleTe: string;
    summaryTe: string;
    contentTe: string;
    category: string;
    level: 'national' | 'state' | 'district' | 'mandal';
    state: string;
    district: string;
    mandal: string;
    authorName: string;
  }) => Promise<void>;
  onUpdateArticleHeadline: (articleId: string, newTitleTe: string) => Promise<void>;
  onApprovePrivateAdByStaff: (adId: string) => Promise<void>;
  onSubmitPrivateAd: (input: SubmitPrivateAdInput) => Promise<void>;
}

const EPAPER_STATUS_LABELS: Record<
  EpaperEditionPage['status'],
  { labelTe: string; badgeClass: string }
> = {
  draft: {
    labelTe: 'డ్రాఫ్ట్ (Draft)',
    badgeClass: 'bg-stone-100 text-stone-800 border-stone-300'
  },
  sub_edited: {
    labelTe: 'సబ్-ఎడిటింగ్ పూర్తయింది (Sub-Edited)',
    badgeClass: 'bg-sky-100 text-sky-900 border-sky-300'
  },
  page_designed: {
    labelTe: 'DTP పేజీ డిజైన్ పూర్తయింది (Page Designed)',
    badgeClass: 'bg-indigo-100 text-indigo-900 border-indigo-300'
  },
  news_editor_approved: {
    labelTe: 'న్యూస్ ఎడిటర్ ఆమోదం (NE Approved)',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300'
  },
  edition_locked: {
    labelTe: 'ఈ-పేపర్ ఎడిషన్ లాక్ అయింది (Locked for Print)',
    badgeClass: 'bg-purple-100 text-purple-900 border-purple-300'
  },
  printed: {
    labelTe: 'రోటరీ ప్రెస్ ముద్రణ & ఈ-పేపర్ పబ్లిష్ (Printed & Live)',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300'
  }
};

export function MediaStaffOrganizationView({
  portalState,
  initialOpenLoginModal = false,
  onRegisterMediaStaff,
  onApproveMediaStaff,
  onChangeMediaStaffPassword,
  onSetMediaStaffBlock,
  onUpdateEpaperPage,
  onStaffPublishNews,
  onUpdateArticleHeadline,
  onApprovePrivateAdByStaff,
  onSubmitPrivateAd
}: MediaStaffOrganizationViewProps) {
  const staffList = portalState.mediaStaff || [];
  const epaperPages = portalState.epaperEditions || [];

  const [subView, setSubView] = useState<'login_workspace' | 'org_directory' | 'register_staff'>(
    'login_workspace'
  );
  const [selectedDivisionFilter, setSelectedDivisionFilter] = useState<'ALL' | MediaDivisionId>(
    'ALL'
  );
  const [selectedTierFilter, setSelectedTierFilter] = useState<'ALL' | MediaAccessTier>('ALL');

  // Employee Login Popup Modal State (Mandatory Position + Login ID + Password Popup)
  const [showLoginPopup, setShowLoginPopup] = useState<boolean>(initialOpenLoginModal);
  const [popupPostCode, setPopupPostCode] = useState<string>(MEDIA_POSTS_CATALOG[0].code);
  const [popupUsername, setPopupUsername] = useState<string>('');
  const [popupPassword, setPopupPassword] = useState<string>('');
  const [popupError, setPopupError] = useState<string>('');

  // Currently Authenticated Staff Member (Only Approved Staff can access Workspace)
  const [loggedInStaffId, setLoggedInStaffId] = useState<string | null>(
    staffList.find((s) => s.status === 'approved')?.id || 'staff-eic-1'
  );
  const [workspaceNotice, setWorkspaceNotice] = useState<string | null>(null);

  // Staff News / Copy Desk States
  const [deskTitleTe, setDeskTitleTe] = useState('');
  const [deskSummaryTe, setDeskSummaryTe] = useState('');
  const [deskContentTe, setDeskContentTe] = useState('');
  const [deskCategory, setDeskCategory] = useState('ప్రత్యేక బ్యూరో · Special Bureau');
  const [deskLevel, setDeskLevel] = useState<'national' | 'state' | 'district' | 'mandal'>('state');

  // Sub-Editor quick headline proofread state
  const [editingArticleId, setEditingArticleId] = useState<string>(
    portalState.articles[0]?.id || ''
  );
  const [editedHeadlineText, setEditedHeadlineText] = useState<string>('');

  // Ad Executive quick booking state
  const [adTitle, setAdTitle] = useState('');
  const [adMatter, setAdMatter] = useState('');
  const [adAdvertiser, setAdAdvertiser] = useState('');
  const [adPhone, setAdPhone] = useState('');
  const [adFormat, setAdFormat] = useState<'banner' | 'classified'>('banner');

  // IT SysAdmin password update state
  const [itTargetStaffId, setItTargetStaffId] = useState<string>('');
  const [itNewPassword, setItNewPassword] = useState<string>('');

  // New Staff Registration Form State (with Mandatory Photo + UIDAI Conforming Aadhaar Verification)
  const statesList = Object.keys(portalState.locations);
  const [regFullName, setRegFullName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPostCode, setRegPostCode] = useState(MEDIA_POSTS_CATALOG[0].code);
  const [regEditionUnit, setRegEditionUnit] = useState(
    'Hyderabad Central Newsroom & E-Paper Desk'
  );
  const [regState, setRegState] = useState(statesList[0] || 'Telangana (తెలంగాణ)');
  const districtsForReg = Object.keys(portalState.locations[regState] || {});
  const [regDistrict, setRegDistrict] = useState(districtsForReg[0] || 'Hyderabad (హైదరాబాద్)');
  const mandalsForReg =
    (portalState.locations[regState] && portalState.locations[regState][regDistrict]) || [];
  const [regMandal, setRegMandal] = useState(mandalsForReg[0] || 'Khairatabad (ఖైరతాబాద్)');
  const [regAadhaar, setRegAadhaar] = useState('');
  const [regPhotoUrl, setRegPhotoUrl] = useState('/images/reporter-avatar-1.svg');
  const [regAadhaarDocUrl, setRegAadhaarDocUrl] = useState('/images/sample-aadhaar-card.svg');
  const [regUidaiConsent, setRegUidaiConsent] = useState<boolean>(true);
  const [uidaiCheckFeedback, setUidaiCheckFeedback] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);
  const [regFeedback, setRegFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
    registeredStaff?: MediaStaffMember;
  } | null>(null);

  const currentStaff =
    staffList.find((s) => s.id === loggedInStaffId && s.status === 'approved') || null;
  const currentTierMeta = currentStaff ? ACCESS_TIER_CATALOG[currentStaff.accessTier] : null;
  const currentPostMeta = currentStaff
    ? MEDIA_POSTS_CATALOG.find((p) => p.code === currentStaff.postCode)
    : null;

  const openEmployeeLoginPopup = (preselectPostCode?: string) => {
    if (preselectPostCode) {
      setPopupPostCode(preselectPostCode);
      const matchingDemo = staffList.find((s) => s.postCode === preselectPostCode);
      if (matchingDemo) {
        setPopupUsername(matchingDemo.username);
        setPopupPassword(matchingDemo.passwordHash);
      } else {
        setPopupUsername('');
        setPopupPassword('');
      }
    }
    setPopupError('');
    setShowLoginPopup(true);
  };

  const handlePopupLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPopupError('');
    try {
      const verifiedStaff = authenticateMediaStaffLogin(portalState, {
        postCode: popupPostCode,
        username: popupUsername,
        password: popupPassword
      });
      setLoggedInStaffId(verifiedStaff.id);
      setShowLoginPopup(false);
      setSubView('login_workspace');
      setWorkspaceNotice(
        `స్వాగతం ${verifiedStaff.fullName}! మీరు "${verifiedStaff.postTitleTe}" హోదాలో విజయవంతంగా లాగిన్ అయ్యారు.`
      );
    } catch (err: unknown) {
      setPopupError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const handleStaffFileUpload = (
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

  const handleVerifyUidaiButton = () => {
    const check = validateUidaiAadhaarNumber(regAadhaar);
    if (!check.valid) {
      setUidaiCheckFeedback({
        valid: false,
        message:
          check.errorTe ||
          'UIDAI ఆధార్ నంబర్ తప్పనిసరిగా 12 అంకెలు (2-9 తో ప్రారంభం) ఉండాలి.'
      });
      return;
    }
    setRegAadhaar(check.formatted);
    setUidaiCheckFeedback({
      valid: true,
      message: `✓ UIDAI 12-Digit Aadhaar Format (${check.formatted}) & e-KYC Checksum Verified!`
    });
  };

  const handleRegisterStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegFeedback(null);

    const uidaiCheck = validateUidaiAadhaarNumber(regAadhaar);
    if (!uidaiCheck.valid) {
      setRegFeedback({
        type: 'error',
        text:
          uidaiCheck.errorTe ||
          'దయచేసి UIDAI ప్రమాణాల ప్రకారం సరైన 12-అంకెల ఆధార్ నంబర్ ఎంటర్ చేయండి.'
      });
      return;
    }

    if (!regUidaiConsent) {
      setRegFeedback({
        type: 'error',
        text: 'UIDAI ఆధార్ ధృవీకరణ సమ్మతి (UIDAI Verification Consent) టిక్ చేయడం తప్పనిసరి.'
      });
      return;
    }

    try {
      const created = await onRegisterMediaStaff({
        fullName: regFullName,
        mobile: regMobile,
        username: regUsername,
        password: regPassword,
        postCode: regPostCode,
        editionOrUnit: regEditionUnit,
        state: regState,
        district: regDistrict,
        mandal: regMandal,
        aadhaarNumber: uidaiCheck.formatted,
        aadhaarDocumentUrl: regAadhaarDocUrl,
        photoUrl: regPhotoUrl,
        uidaiConsent: regUidaiConsent,
        autoApprove: false
      });
      setRegFeedback({
        type: 'success',
        text: `రిజిస్ట్రేషన్ పూర్తయింది (${created.staffCode} — ${created.postTitleTe})! మీ ఫోటో మరియు UIDAI ఆధార్ వివరాలు నమోదు చేయబడ్డాయి. నిబంధనల ప్రకారం అడ్మిన్ ఆమోదం (Admin Approval Mandate) వచ్చిన తర్వాతే మీ లాగిన్ ఐడి యాక్టివేట్ అవుతుంది.`,
        registeredStaff: created
      });
      setRegFullName('');
      setRegMobile('');
      setRegUsername('');
      setRegPassword('');
      setRegAadhaar('');
      setUidaiCheckFeedback(null);
    } catch (err: unknown) {
      setRegFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Staff registration failed'
      });
    }
  };

  const filteredPosts = MEDIA_POSTS_CATALOG.filter((post) => {
    if (selectedDivisionFilter !== 'ALL' && post.divisionId !== selectedDivisionFilter) {
      return false;
    }
    if (selectedTierFilter !== 'ALL' && post.accessTier !== selectedTierFilter) {
      return false;
    }
    return true;
  });

  const totalDailyPrintCopies = epaperPages.reduce((acc, p) => acc + (p.printCopiesOrder || 0), 0);

  return (
    <div
      className="space-y-8 bg-white border border-stone-200 rounded-2xl p-6 lg:p-8 shadow-sm"
      data-testid="media-staff-organization-portal"
    >
      {/* =====================================================================
          EMPLOYEE LOGIN POPUP MODAL (OPENS ON CLICKING EMPLOYEE LOGIN)
          Requires: 1. Position Selection (All 40 Posts Visible) + 2. Login ID + 3. Password
          Enforces Mandatory Admin Approval before granting access
          ===================================================================== */}
      {showLoginPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-xs p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Employee Role-Based Login Popup"
          data-testid="employee-login-popup-modal"
        >
          <div className="relative w-full max-w-2xl rounded-2xl bg-white border-2 border-amber-400 shadow-2xl overflow-hidden my-8">
            {/* Modal Top Header */}
            <div className="bg-gradient-to-r from-stone-900 via-red-950 to-stone-900 text-white px-6 py-4 flex items-center justify-between gap-4 border-b border-amber-400/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-extrabold">
                  <LogIn className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-amber-300">
                    ROLE-BASED EMPLOYEE LOGIN · MANDATORY ADMIN &amp; UIDAI VERIFIED ACCESS
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white">
                    నేటి భారతం — ఉద్యోగి హోదా (Position) &amp; లాగిన్ పాప్-అప్ విండో
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLoginPopup(false)}
                aria-label="Close Employee Login Popup"
                className="rounded-lg bg-white/10 p-2 text-stone-200 hover:bg-white/20 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
              {/* Quick 1-Click Position + Credentials Fill Bar for Testing */}
              <div className="rounded-xl bg-stone-50 border border-stone-200 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-stone-800">
                    1-క్లిక్ డెమో ఉద్యోగి ఎంపిక (Quick Fill Position + Login ID + Password):
                  </span>
                  <span className="font-mono text-[11px] text-stone-500">Pass: Staff@123</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {staffList.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => {
                        setPopupPostCode(member.postCode);
                        setPopupUsername(member.username);
                        setPopupPassword(member.passwordHash);
                        setPopupError('');
                      }}
                      className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold transition-colors ${
                        popupUsername === member.username && popupPostCode === member.postCode
                          ? 'bg-red-900 text-white border-red-950'
                          : member.status === 'pending'
                          ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                          : 'bg-white text-stone-800 border-stone-300 hover:bg-stone-100'
                      }`}
                    >
                      {member.postTitleEn.split('/')[0].trim()} (@{member.username}
                      {member.status === 'pending' ? ' · ⏳ Pending' : ''})
                    </button>
                  ))}
                </div>
              </div>

              {popupError && (
                <div
                  className="rounded-xl bg-red-50 border-2 border-red-300 p-4 text-xs font-bold text-red-950 flex items-start gap-2.5"
                  data-testid="employee-login-popup-error"
                >
                  <AlertTriangle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div>{popupError}</div>
                    <div className="text-[11px] font-normal text-red-800">
                      గమనిక: ప్రతి ఉద్యోగి రిజిస్ట్రేషన్ పూర్తయిన తర్వాత అడ్మిన్ ఆమోదం (Admin Approval) తప్పనిసరి.
                    </div>
                  </div>
                </div>
              )}

              {/* Employee Login Form with All Positions Dropdown + Login ID + Password */}
              <form onSubmit={handlePopupLoginSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="popup-position-select"
                    className="block text-xs font-extrabold text-stone-900 mb-1.5"
                  >
                    1. మీ ఉద్యోగ హోదా / పోస్ట్ ఎంచుకోండి (Select Your Position / Designation — All{' '}
                    {MEDIA_POSTS_CATALOG.length} Positions) *
                  </label>
                  <select
                    id="popup-position-select"
                    value={popupPostCode}
                    onChange={(e) => setPopupPostCode(e.target.value)}
                    className="w-full rounded-xl border-2 border-stone-300 bg-white px-3.5 py-2.5 text-xs font-bold text-stone-900 focus:border-red-900 focus:outline-none"
                  >
                    {MEDIA_DIVISIONS.map((div) => (
                      <optgroup key={div.id} label={div.titleTe}>
                        {MEDIA_POSTS_CATALOG.filter((p) => p.divisionId === div.id).map((post) => (
                          <option key={post.code} value={post.code}>
                            {post.titleTe} — [{post.titleEn}] (Tier{' '}
                            {ACCESS_TIER_CATALOG[post.accessTier].tierNumber})
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="popup-login-id"
                      className="block text-xs font-extrabold text-stone-900 mb-1.5"
                    >
                      2. ఉద్యోగి లాగిన్ ఐడి (Employee Login ID / Username) *
                    </label>
                    <input
                      id="popup-login-id"
                      type="text"
                      required
                      value={popupUsername}
                      onChange={(e) => setPopupUsername(e.target.value)}
                      placeholder="ఉదా: eic_murthy / ne_srinivas / sub_lakshmi"
                      className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-xs font-semibold text-stone-900"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="popup-login-password"
                      className="block text-xs font-extrabold text-stone-900 mb-1.5"
                    >
                      3. లాగిన్ పాస్‌వర్డ్ (Password) *
                    </label>
                    <input
                      id="popup-login-password"
                      type="password"
                      required
                      value={popupPassword}
                      onChange={(e) => setPopupPassword(e.target.value)}
                      placeholder="పాస్‌వర్డ్ ఎంటర్ చేయండి"
                      className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-xs font-semibold text-stone-900"
                    />
                  </div>
                </div>

                <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-[11px] text-amber-950 flex items-center justify-between gap-2">
                  <span>
                    <strong>నిబంధన:</strong> మీరు ఎంచుకున్న హోదా (Position), లాగిన్ ఐడి, పాస్‌వర్డ్ సరిపోలాలి మరియు <strong>Admin Approval + UIDAI Aadhaar Verification</strong> పూర్తయి ఉండాలి.
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowLoginPopup(false);
                      setSubView('register_staff');
                    }}
                    className="rounded-xl border border-stone-300 bg-stone-100 px-4 py-2.5 text-xs font-bold text-stone-800 hover:bg-stone-200"
                  >
                    కొత్త ఉద్యోగి రిజిస్ట్రేషన్ (New Staff Form) →
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowLoginPopup(false)}
                      className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-100"
                    >
                      రద్దు చేయండి (Cancel)
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-red-900 px-6 py-2.5 text-xs font-extrabold text-white hover:bg-red-950 shadow-sm flex items-center gap-2"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>హోదా ధృవీకరించి లాగిన్ చేయండి (Access Role Desk)</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* HEADER BANNER */}
      <div className="flex flex-wrap items-start justify-between gap-6 border-b border-stone-200 pb-6">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-md bg-red-900 px-3 py-1 text-xs font-bold text-amber-300 uppercase tracking-wider">
            <Newspaper className="w-3.5 h-3.5" />
            <span>UIDAI ఆధార్ ధృవీకరణ · అడ్మిన్ ఆమోదం తప్పనిసరి · రోల్-బేస్డ్ లాగిన్ పాప్-అప్</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            నేటి భారతం — పూర్తి మీడియా విభాగాలు &amp; ఉద్యోగుల రోల్-బేస్డ్ లాగిన్ పోర్టల్
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            ప్రతి ఉద్యోగి రిజిస్ట్రేషన్‌లో <strong>పాస్‌పోర్ట్ ఫోటో + UIDAI 12-అంకెల ఆధార్ ధృవీకరణ</strong> మరియు <strong>అడ్మిన్ ఆమోదం (Mandatory Admin Approval)</strong> తప్పనిసరి. ఉద్యోగి లాగిన్ బటన్ నొక్కగానే పాప్-అప్ ఓపెన్ అయి, అందులో మీ హోదా (Position), లాగిన్ ఐడి మరియు పాస్‌వర్డ్ ఎంచుకున్నాకే యాక్సెస్ లభిస్తుంది.
          </p>
        </div>

        {/* SUB-NAVIGATION TABS + PROMINENT EMPLOYEE LOGIN POPUP TRIGGER */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => openEmployeeLoginPopup()}
            data-testid="open-employee-login-popup-btn"
            className="px-4 py-2.5 rounded-lg text-xs font-extrabold bg-amber-400 text-stone-950 hover:bg-amber-300 transition-colors flex items-center gap-1.5 shadow-xs border border-amber-500"
          >
            <LogIn className="w-4 h-4" />
            <span>ఉద్యోగి లాగిన్ పాప్-అప్ (Employee Login Popup)</span>
          </button>

          <button
            type="button"
            onClick={() => setSubView('login_workspace')}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              subView === 'login_workspace'
                ? 'bg-red-900 text-white shadow-sm'
                : 'bg-stone-100 text-stone-800 hover:bg-stone-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>యాక్టివ్ రోల్ డెస్క్ (Role Workspace)</span>
          </button>

          <button
            type="button"
            onClick={() => setSubView('org_directory')}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              subView === 'org_directory'
                ? 'bg-red-900 text-white shadow-sm'
                : 'bg-stone-100 text-stone-800 hover:bg-stone-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>అన్ని విభాగాలు &amp; పోస్టులు ({MEDIA_POSTS_CATALOG.length} Positions)</span>
          </button>

          <button
            type="button"
            onClick={() => setSubView('register_staff')}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              subView === 'register_staff'
                ? 'bg-red-900 text-white shadow-sm'
                : 'bg-stone-100 text-stone-800 hover:bg-stone-200'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>కొత్త స్టాఫ్ రిజిస్ట్రేషన్ (Photo &amp; UIDAI Aadhaar)</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          5-TIER ACCESS CONTROL OVERVIEW CARDS
          ===================================================================== */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-extrabold text-stone-900 uppercase tracking-wider">
            లాగిన్ మరియు యాక్సెస్ ఎలా ఉంటుంది? — 5-స్థాయిల రోల్-బేస్డ్ యాక్సెస్ కంట్రోల్ (5-Tier RBAC Matrix)
          </h3>
          <button
            type="button"
            onClick={() => openEmployeeLoginPopup()}
            className="text-xs font-extrabold text-red-900 underline hover:text-red-700"
          >
            ఇక్కడ క్లిక్ చేసి మీ హోదా (Position) ఎంచుకుని లాగిన్ అవ్వండి →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {(
            Object.values(ACCESS_TIER_CATALOG) as (typeof ACCESS_TIER_CATALOG)[MediaAccessTier][]
          ).map((tier) => {
            const isCurrentTier = currentStaff?.accessTier === tier.id;
            return (
              <div
                key={tier.id}
                className={`rounded-xl border p-3.5 flex flex-col justify-between transition-all ${
                  isCurrentTier
                    ? 'border-red-800 bg-amber-50/70 ring-2 ring-red-800/20'
                    : 'border-stone-200 bg-stone-50/70'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[11px] font-extrabold border ${tier.badgeColor}`}
                    >
                      Tier {tier.tierNumber}
                    </span>
                    {isCurrentTier && (
                      <span className="text-[11px] font-extrabold text-red-900">
                        ● Active Login
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-extrabold text-stone-900 leading-snug">
                    {tier.titleTe}
                  </div>
                  <p className="text-[11px] text-stone-600 leading-relaxed">{tier.summaryTe}</p>
                </div>
                <ul className="mt-3 pt-2 border-t border-stone-200/80 space-y-1">
                  {tier.permissionsTe.slice(0, 2).map((perm, idx) => (
                    <li key={idx} className="text-[11px] text-stone-700 flex items-start gap-1">
                      <span className="text-red-800 font-bold">✓</span>
                      <span>{perm}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* =====================================================================
          SUB-VIEW 1: ROLE-BASED STAFF LOGIN & INTERACTIVE WORKSPACE
          ===================================================================== */}
      {subView === 'login_workspace' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN (4 COLS): EMPLOYEE LOGIN POPUP TRIGGER + STAFF LIST */}
          <div className="lg:col-span-4 space-y-5">
            <div className="rounded-xl border-2 border-red-900 bg-gradient-to-b from-stone-900 to-red-950 text-white p-5 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-extrabold uppercase tracking-wider">
                <Lock className="w-4 h-4" />
                <span>Mandatory Position &amp; Login Popup</span>
              </div>
              <h4 className="text-base font-extrabold">
                ఉద్యోగి లాగిన్ కోసం ఇక్కడ క్లిక్ చేయండి
              </h4>
              <p className="text-xs text-stone-200 leading-relaxed">
                క్లిక్ చేయగానే పాప్-అప్ విండో ఓపెన్ అవుతుంది. అందులో ఉన్న <strong>అన్ని హోదాల (40 Positions)</strong> నుండి మీ హోదాను ఎంచుకుని, లాగిన్ ఐడి మరియు పాస్‌వర్డ్ ఎంటర్ చేయండి.
              </p>
              <button
                type="button"
                onClick={() => openEmployeeLoginPopup()}
                className="w-full rounded-xl bg-amber-400 px-4 py-3 text-xs font-extrabold text-stone-950 hover:bg-amber-300 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>ఉద్యోగి లాగిన్ పాప్-అప్ తెరవండి (Open Login Popup)</span>
              </button>
            </div>

            {/* Staff Directory & Click-to-Open Login Popup */}
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-900">
                  రిజిస్టర్ అయిన ఉద్యోగులు (Click to Open Login Popup)
                </h4>
                <span className="text-[11px] font-mono text-stone-500">Pass: Staff@123</span>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {staffList.map((member) => {
                  const active = loggedInStaffId === member.id && member.status === 'approved';
                  const tierInfo = ACCESS_TIER_CATALOG[member.accessTier];
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => openEmployeeLoginPopup(member.postCode)}
                      className={`w-full text-left rounded-lg border p-2.5 transition-all ${
                        active
                          ? 'bg-red-900 text-white border-red-950 shadow-sm'
                          : 'bg-white text-stone-900 border-stone-200 hover:border-red-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-extrabold truncate">
                          {member.postTitleTe}
                        </span>
                        <span
                          className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            member.status === 'pending'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : active
                              ? 'bg-amber-400 text-stone-950'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {member.status === 'pending'
                            ? '⏳ Admin Pending'
                            : `Tier ${tierInfo.tierNumber}`}
                        </span>
                      </div>
                      <div
                        className={`text-[11px] mt-0.5 flex items-center justify-between ${
                          active ? 'text-stone-200' : 'text-stone-500'
                        }`}
                      >
                        <span className="truncate">{member.fullName}</span>
                        <span className="font-mono">@{member.username}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (8 COLS): ACTIVE STAFF MEMBER'S ROLE-BASED WORKSPACE */}
          <div className="lg:col-span-8 space-y-6">
            {currentStaff && currentTierMeta ? (
              <>
                {/* Logged-in Staff Identity Header Card with Photo, UIDAI Verified Badge & ID Card Number */}
                <div className="rounded-xl bg-gradient-to-r from-stone-900 via-red-950 to-stone-900 text-white p-5 border border-amber-400/40 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={currentStaff.photoUrl || '/images/reporter-avatar-1.svg'}
                        alt={currentStaff.fullName}
                        referrerPolicy="no-referrer"
                        className="w-16 h-20 rounded-xl bg-white p-1 object-cover border-2 border-amber-400"
                      />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded bg-amber-400 px-2 py-0.5 text-[11px] font-extrabold text-stone-950">
                            {currentStaff.idCardNumber || currentStaff.staffCode}
                          </span>
                          <span className="rounded bg-emerald-500/20 border border-emerald-400/40 px-2 py-0.5 text-[11px] font-bold text-emerald-300">
                            ✓ UIDAI Aadhaar Verified ({currentStaff.aadhaarNumber})
                          </span>
                          <span className="rounded bg-white/15 px-2 py-0.5 text-[11px] font-semibold text-amber-200">
                            ✓ Admin Approved
                          </span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-extrabold text-white mt-1.5">
                          {currentStaff.postTitleTe}
                        </h3>
                        <p className="text-xs text-stone-300">
                          {currentStaff.fullName} · యూనిట్/డెస్క్:{' '}
                          <strong className="text-amber-300">{currentStaff.editionOrUnit}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEmployeeLoginPopup()}
                        className="rounded-lg bg-amber-400 hover:bg-amber-300 px-3 py-1.5 text-xs font-extrabold text-stone-950 flex items-center gap-1"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>వేరే హోదా లాగిన్ (Switch Position)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLoggedInStaffId(null)}
                        className="rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-bold text-white flex items-center gap-1"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>లాగ్అవుట్</span>
                      </button>
                    </div>
                  </div>

                  {/* Role Duty & Allowed Permissions Strip */}
                  <div className="mt-4 pt-4 border-t border-white/15 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="text-amber-300 font-bold mb-1">
                        ఈ పోస్ట్ ప్రధాన బాధ్యత (Designation Responsibility):
                      </div>
                      <p className="text-stone-200 leading-relaxed">
                        {currentPostMeta?.dutyTe || currentTierMeta.summaryTe}
                      </p>
                    </div>
                    <div>
                      <div className="text-amber-300 font-bold mb-1">
                        ఈ లాగిన్‌లో అందుబాటులో ఉన్న పర్మిషన్లు (Allowed RBAC Permissions):
                      </div>
                      <ul className="space-y-1 text-stone-200">
                        {currentTierMeta.permissionsTe.map((p, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold">✓</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {workspaceNotice && (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-300 p-4 text-xs font-bold text-emerald-950 flex items-center justify-between">
                    <span>{workspaceNotice}</span>
                    <button
                      type="button"
                      onClick={() => setWorkspaceNotice(null)}
                      className="text-emerald-800 underline ml-4"
                    >
                      మూసివేయి
                    </button>
                  </div>
                )}

                {/* LIVE E-PAPER EDITION, DTP LAYOUT, CTP & ROTARY PRESS PIPELINE */}
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3">
                    <div>
                      <h4 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                        <Printer className="w-4 h-4 text-red-900" />
                        <span>
                          నేటి భారతం — లైవ్ ఈ-పేపర్ (E-Paper), DTP పేజీ మేకింగ్, CTP &amp; రోటరీ ప్రింటింగ్ బోర్డు
                        </span>
                      </h4>
                      <p className="text-xs text-stone-600">
                        సబ్-ఎడిటర్ ఎడిటింగ్ → DTP పేజీ డిజైన్ → న్యూస్ ఎడిటర్ ఆమోదం &amp; ఎడిషన్ లాక్ → CTP ప్లేట్ మేకింగ్ → రోటరీ ప్రెస్ ప్రింటింగ్ &amp; సర్క్యులేషన్ కాపీలు
                      </p>
                    </div>
                    <div className="rounded-lg bg-white border border-stone-200 px-3 py-1.5 text-xs font-bold text-stone-800">
                      మొత్తం ప్రింట్ ఆర్డర్:{' '}
                      <span className="text-red-900 font-extrabold tabular-nums">
                        {totalDailyPrintCopies.toLocaleString('en-IN')} కాపీలు
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {epaperPages.map((page) => {
                      const statusMeta = EPAPER_STATUS_LABELS[page.status];
                      const canSubEditOrDtp =
                        currentStaff.accessTier === 'middle_newsroom_ops' ||
                        currentStaff.accessTier === 'senior_dept_head' ||
                        currentStaff.accessTier === 'top_executive' ||
                        currentStaff.accessTier === 'it_sysadmin';
                      const canLockOrPrint =
                        currentStaff.accessTier === 'senior_dept_head' ||
                        currentStaff.accessTier === 'top_executive' ||
                        currentStaff.accessTier === 'it_sysadmin';

                      return (
                        <div
                          key={page.id}
                          className="rounded-xl bg-white border border-stone-200 p-4 space-y-3"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <div className="text-xs font-bold text-red-900">
                                {page.editionName}
                              </div>
                              <h5 className="text-sm font-extrabold text-stone-900">
                                {page.pageTitleTe}
                              </h5>
                              <p className="text-xs text-stone-600 mt-0.5">
                                లీడ్ హెడ్‌లైన్: <strong>{page.leadHeadlineTe}</strong>
                              </p>
                            </div>
                            <span
                              className={`rounded-md border px-2.5 py-1 text-xs font-extrabold ${statusMeta.badgeClass}`}
                            >
                              {statusMeta.labelTe}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-stone-50 rounded-lg p-2.5 border border-stone-200/80">
                            <div>
                              <span className="text-stone-500 block">సబ్-ఎడిటర్:</span>
                              <span className="font-bold text-stone-800">
                                {page.assignedSubEditor}
                              </span>
                            </div>
                            <div>
                              <span className="text-stone-500 block">DTP డిజైనర్:</span>
                              <span className="font-bold text-stone-800">
                                {page.assignedDesigner}
                              </span>
                            </div>
                            <div>
                              <span className="text-stone-500 block">CTP అల్యూమినియం ప్లేట్:</span>
                              <span
                                className={`font-bold ${
                                  page.ctpPlateReady ? 'text-emerald-700' : 'text-amber-700'
                                }`}
                              >
                                {page.ctpPlateReady ? '✓ CTP Ready' : '⏳ In Pre-Press'}
                              </span>
                            </div>
                            <div>
                              <span className="text-stone-500 block">సర్క్యులేషన్ ప్రింట్ కాపీలు:</span>
                              <span className="font-extrabold text-stone-900 tabular-nums">
                                {page.printCopiesOrder.toLocaleString('en-IN')} Copies
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                            <span className="text-[11px] text-stone-500">
                              చివరి అప్‌డేట్: {page.updatedAt} ({page.updatedByRole})
                            </span>

                            <div className="flex flex-wrap items-center gap-2">
                              {canSubEditOrDtp && (
                                <>
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      await onUpdateEpaperPage(page.id, {
                                        status: 'sub_edited',
                                        updatedByRole: currentStaff.postTitleEn
                                      });
                                      setWorkspaceNotice(
                                        `${page.pageTitleTe} — సబ్-ఎడిటింగ్ & ప్రూఫ్ రీడింగ్ పూర్తయింది!`
                                      );
                                    }}
                                    className="rounded-lg border border-sky-300 bg-sky-50 px-2.5 py-1.5 text-xs font-bold text-sky-900 hover:bg-sky-100"
                                  >
                                    1. సబ్-ఎడిట్ పూర్తి (Sub-Edit Done)
                                  </button>

                                  <button
                                    type="button"
                                    onClick={async () => {
                                      await onUpdateEpaperPage(page.id, {
                                        status: 'page_designed',
                                        ctpPlateReady: true,
                                        updatedByRole: currentStaff.postTitleEn
                                      });
                                      setWorkspaceNotice(
                                        `${page.pageTitleTe} — DTP పేజీ లేఅవుట్ & CTP ప్లేట్ సిద్ధమైంది!`
                                      );
                                    }}
                                    className="rounded-lg border border-indigo-300 bg-indigo-50 px-2.5 py-1.5 text-xs font-bold text-indigo-900 hover:bg-indigo-100"
                                  >
                                    2. DTP డిజైన్ &amp; CTP Ready
                                  </button>

                                  <button
                                    type="button"
                                    onClick={async () => {
                                      const nextCopies = page.printCopiesOrder + 2500;
                                      await onUpdateEpaperPage(page.id, {
                                        printCopiesOrder: nextCopies,
                                        updatedByRole: currentStaff.postTitleEn
                                      });
                                      setWorkspaceNotice(
                                        `సర్క్యులేషన్ ప్రింట్ ఆర్డర్ ${nextCopies.toLocaleString('en-IN')} కాపీలకు అప్‌డేట్ చేయబడింది!`
                                      );
                                    }}
                                    className="rounded-lg border border-stone-300 bg-stone-100 px-2.5 py-1.5 text-xs font-bold text-stone-800 hover:bg-stone-200"
                                  >
                                    +2,500 ఏజెంట్ కాపీలు (Circulation Indent)
                                  </button>
                                </>
                              )}

                              {canLockOrPrint && (
                                <>
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      await onUpdateEpaperPage(page.id, {
                                        status: 'edition_locked',
                                        ctpPlateReady: true,
                                        updatedByRole: currentStaff.postTitleEn
                                      });
                                      setWorkspaceNotice(
                                        `${page.pageTitleTe} — న్యూస్ ఎడిటర్ ఆమోదంతో ఈ-పేపర్ ఎడిషన్ లాక్ చేయబడింది!`
                                      );
                                    }}
                                    className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700"
                                  >
                                    3. ఎడిషన్ లాక్ (NE Edition Lock)
                                  </button>

                                  <button
                                    type="button"
                                    onClick={async () => {
                                      await onUpdateEpaperPage(page.id, {
                                        status: 'printed',
                                        ctpPlateReady: true,
                                        updatedByRole: currentStaff.postTitleEn
                                      });
                                      setWorkspaceNotice(
                                        `${page.pageTitleTe} — రోటరీ ప్రెస్ ముద్రణ ప్రారంభమైంది & ఆన్‌లైన్ ఈ-పేపర్ పబ్లిష్ చేయబడింది!`
                                      );
                                    }}
                                    className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800"
                                  >
                                    4. రోటరీ ప్రెస్ ప్రింట్ &amp; E-Paper Live
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* PANEL A: EDITORIAL / REPORTER / BUREAU / CHIEF EDITOR NEWS UPLOAD DESK */}
                {(currentStaff.divisionId === 'editorial_newsroom' ||
                  currentStaff.accessTier === 'top_executive' ||
                  currentStaff.accessTier === 'it_sysadmin') && (
                  <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
                    <h4 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-red-900" />
                      <span>
                        ఎడిటోరియల్ &amp; రిపోర్టింగ్ డెస్క్ — కొత్త వార్త / బ్యూరో కథనం అప్‌లోడ్ ({currentStaff.postTitleTe})
                      </span>
                    </h4>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!deskTitleTe.trim()) return;
                        await onStaffPublishNews({
                          titleTe: deskTitleTe,
                          summaryTe: deskSummaryTe || deskTitleTe,
                          contentTe: deskContentTe || deskSummaryTe || deskTitleTe,
                          category: deskCategory,
                          level: deskLevel,
                          state: currentStaff.state,
                          district: currentStaff.district,
                          mandal: currentStaff.mandal,
                          authorName: `${currentStaff.fullName} (${currentStaff.postTitleEn})`
                        });
                        setDeskTitleTe('');
                        setDeskSummaryTe('');
                        setDeskContentTe('');
                        setWorkspaceNotice(
                          'వార్త విజయవంతంగా నేటి భారతం పోర్టల్ & ఈ-పేపర్ డెస్క్‌కు ప్రచురించబడింది!'
                        );
                      }}
                      className="space-y-3"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">
                            వార్త స్థాయి · Edition Scope
                          </label>
                          <select
                            value={deskLevel}
                            onChange={(e) =>
                              setDeskLevel(
                                e.target.value as 'national' | 'state' | 'district' | 'mandal'
                              )
                            }
                            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900"
                          >
                            <option value="national">జాతీయ ఎడిషన్ (National Desk)</option>
                            <option value="state">రాష్ట్ర ఎడిషన్ (State Bureau)</option>
                            <option value="district">జిల్లా టాబ్లాయిడ్ (District Edition)</option>
                            <option value="mandal">మండల సంచిక (Mandal Stringer Desk)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">
                            బీట్ / విభాగం · News Beat
                          </label>
                          <input
                            type="text"
                            value={deskCategory}
                            onChange={(e) => setDeskCategory(e.target.value)}
                            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          వార్త శీర్షిక (Headline in Telugu) *
                        </label>
                        <input
                          type="text"
                          required
                          value={deskTitleTe}
                          onChange={(e) => setDeskTitleTe(e.target.value)}
                          placeholder="ఇక్కడ వార్త హెడ్‌లైన్ టైప్ చేయండి..."
                          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={deskSummaryTe}
                          onChange={(e) => setDeskSummaryTe(e.target.value)}
                          placeholder="ఉప శీర్షిక / సారాంశం (Sub-headline)"
                          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900"
                        />
                        <input
                          type="text"
                          value={deskContentTe}
                          onChange={(e) => setDeskContentTe(e.target.value)}
                          placeholder="పూర్తి వార్తా వివరాలు (Full story body)"
                          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900"
                        />
                      </div>
                      <button
                        type="submit"
                        className="rounded-lg bg-red-900 px-4 py-2 text-xs font-bold text-white hover:bg-red-950"
                      >
                        న్యూస్‌రూమ్ &amp; ఈ-పేపర్‌కు పబ్లిష్ చేయండి
                      </button>
                    </form>
                  </div>
                )}

                {/* PANEL B: SUB-EDITOR & NEWS EDITOR HEADLINE PROOFREADING DESK (Tier 2+) */}
                {currentStaff.accessTier !== 'base_field' && (
                  <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-3">
                    <h4 className="text-sm font-extrabold text-stone-900">
                      సబ్-ఎడిటర్ &amp; న్యూస్ ఎడిటర్ కాపీ డెస్క్ — వార్తల శీర్షికల సవరణ (Proofreading &amp; Copy Editing)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                      <div className="sm:col-span-5">
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          సవరించాల్సిన వార్తను ఎంచుకోండి
                        </label>
                        <select
                          value={editingArticleId}
                          onChange={(e) => {
                            setEditingArticleId(e.target.value);
                            const found = portalState.articles.find(
                              (a) => a.id === e.target.value
                            );
                            if (found) setEditedHeadlineText(found.title.te);
                          }}
                          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900"
                        >
                          {portalState.articles.map((art) => (
                            <option key={art.id} value={art.id}>
                              {art.title.te.slice(0, 65)}...
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-5">
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          సవరించిన కొత్త శీర్షిక (Edited Headline)
                        </label>
                        <input
                          type="text"
                          value={editedHeadlineText}
                          onChange={(e) => setEditedHeadlineText(e.target.value)}
                          placeholder="సవరించిన హెడ్‌లైన్ ఇక్కడ రాయండి..."
                          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <button
                          type="button"
                          onClick={async () => {
                            if (!editingArticleId || !editedHeadlineText.trim()) return;
                            await onUpdateArticleHeadline(
                              editingArticleId,
                              editedHeadlineText.trim()
                            );
                            setWorkspaceNotice(
                              'సబ్-ఎడిటర్ / న్యూస్ ఎడిటర్ శీర్షిక సవరణ సేవ్ చేయబడింది!'
                            );
                          }}
                          className="w-full rounded-lg bg-stone-900 px-3 py-2 text-xs font-bold text-white hover:bg-stone-800"
                        >
                          హెడ్‌లైన్ సేవ్
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* PANEL C: ADVERTISING, CLASSIFIEDS & RELEASE ORDER (RO) DESK */}
                {(currentStaff.divisionId === 'business_ads_mktg_circulation' ||
                  currentStaff.accessTier === 'senior_dept_head' ||
                  currentStaff.accessTier === 'top_executive' ||
                  currentStaff.accessTier === 'it_sysadmin') && (
                  <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
                        <Megaphone className="w-4 h-4 text-red-900" />
                        <span>
                          అడ్వర్టైజింగ్, క్లాసిఫైడ్స్ &amp; రిలీజ్ ఆర్డర్ (RO) బుకింగ్ / ఆమోద డెస్క్
                        </span>
                      </h4>
                      <span className="text-xs font-bold text-emerald-800">
                        ఆమోదించబడిన యాడ్స్:{' '}
                        {portalState.privateAds.filter((a) => a.status === 'approved').length} ·
                        పెండింగ్ ROs:{' '}
                        {portalState.privateAds.filter((a) => a.status === 'pending').length}
                      </span>
                    </div>

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!adTitle.trim() || !adMatter.trim()) return;
                        await onSubmitPrivateAd({
                          title: adTitle,
                          matter: adMatter,
                          imageUrl: '/images/ad-kanchipuram-silks.svg',
                          category: PRIVATE_AD_CATEGORIES[0],
                          adFormat,
                          scope: 'state',
                          state: currentStaff.state,
                          district: currentStaff.district,
                          mandal: currentStaff.mandal,
                          advertiserName: adAdvertiser || currentStaff.fullName,
                          contactPhone: adPhone || currentStaff.mobile
                        });
                        setAdTitle('');
                        setAdMatter('');
                        setAdAdvertiser('');
                        setAdPhone('');
                        setWorkspaceNotice(
                          'కొత్త ప్రకటన (Release Order) అడ్వర్టైజింగ్ డెస్క్‌లో నమోదు చేయబడింది!'
                        );
                      }}
                      className="grid grid-cols-1 sm:grid-cols-4 gap-2.5"
                    >
                      <select
                        value={adFormat}
                        onChange={(e) => setAdFormat(e.target.value as 'banner' | 'classified')}
                        className="rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900"
                      >
                        <option value="banner">డిస్‌ప్లే బ్యానర్ యాడ్ (Display Ad)</option>
                        <option value="classified">క్లాసిఫైడ్ ప్రకటన (Classified)</option>
                      </select>
                      <input
                        type="text"
                        required
                        value={adTitle}
                        onChange={(e) => setAdTitle(e.target.value)}
                        placeholder="యాడ్ శీర్షిక (Ad Title) *"
                        className="rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900"
                      />
                      <input
                        type="text"
                        required
                        value={adMatter}
                        onChange={(e) => setAdMatter(e.target.value)}
                        placeholder="ప్రకటన వివరాలు (Ad Matter) *"
                        className="rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900"
                      />
                      <button
                        type="submit"
                        className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-bold text-white hover:bg-amber-700"
                      >
                        + బుక్ యాడ్ / RO ఎంట్రీ
                      </button>
                    </form>

                    {currentStaff.accessTier !== 'base_field' &&
                      portalState.privateAds.some((a) => a.status === 'pending') && (
                        <div className="pt-2 border-t border-stone-200 space-y-2">
                          <div className="text-xs font-bold text-stone-700">
                            పెండింగ్ రిలీజ్ ఆర్డర్లు (Pending Ad ROs for Manager Approval):
                          </div>
                          {portalState.privateAds
                            .filter((a) => a.status === 'pending')
                            .map((ad) => (
                              <div
                                key={ad.id}
                                className="flex items-center justify-between gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs"
                              >
                                <div>
                                  <span className="font-bold text-stone-900">{ad.title}</span> —{' '}
                                  <span className="text-stone-600">{ad.advertiserName}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    await onApprovePrivateAdByStaff(ad.id);
                                    setWorkspaceNotice(`యాడ్ RO (${ad.title}) ఆమోదించబడింది!`);
                                  }}
                                  className="rounded bg-emerald-700 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-800"
                                >
                                  ✓ RO ఆమోదించు (Approve Ad)
                                </button>
                              </div>
                            ))}
                        </div>
                      )}
                  </div>
                )}

                {/* PANEL D: IT / SYSTEMS ADMINISTRATOR & HR / TOP EXECUTIVE STAFF APPROVALS (WITH PHOTO & UIDAI AADHAAR) */}
                {(currentStaff.accessTier === 'it_sysadmin' ||
                  currentStaff.accessTier === 'top_executive') && (
                  <div className="rounded-xl border-2 border-red-900/30 bg-red-50/40 p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-extrabold text-red-950 flex items-center gap-2">
                          <Server className="w-4 h-4 text-red-900" />
                          <span>
                            అడ్మిన్ / IT / HR ఆమోద కేంద్రం — ఉద్యోగుల ఫోటో, UIDAI ఆధార్ తనిఖీ &amp; లాగిన్ ఆమోదాలు
                          </span>
                        </h4>
                        <p className="text-xs text-stone-600">
                          ప్రతి ఉద్యోగి రిజిస్ట్రేషన్ పూర్తయిన తర్వాత ఇక్కడ ఫోటో మరియు UIDAI ఆధార్ కార్డు తనిఖీ చేసి ఆమోదిస్తేనే (Approve) వారికి లాగిన్ యాక్సెస్ లభిస్తుంది.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSubView('register_staff')}
                        className="rounded-lg bg-red-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-950"
                      >
                        + కొత్త స్టాఫ్ రిజిస్ట్రేషన్ ఫారమ్
                      </button>
                    </div>

                    {/* Quick Password Change Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end bg-white p-3 rounded-lg border border-stone-200">
                      <div className="sm:col-span-5">
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          ఉద్యోగిని ఎంచుకోండి (Select Staff)
                        </label>
                        <select
                          value={itTargetStaffId || staffList[0]?.id || ''}
                          onChange={(e) => setItTargetStaffId(e.target.value)}
                          className="w-full rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs text-stone-900"
                        >
                          {staffList.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.staffCode} — {s.fullName} (@{s.username})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-5">
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          కొత్త పాస్‌వర్డ్ సెట్ చేయండి (New Password)
                        </label>
                        <input
                          type="text"
                          value={itNewPassword}
                          onChange={(e) => setItNewPassword(e.target.value)}
                          placeholder="కొత్త పాస్‌వర్డ్ టైప్ చేయండి"
                          className="w-full rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs text-stone-900"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <button
                          type="button"
                          onClick={async () => {
                            const targetId = itTargetStaffId || staffList[0]?.id;
                            if (!targetId || !itNewPassword.trim()) return;
                            await onChangeMediaStaffPassword(targetId, itNewPassword.trim());
                            setItNewPassword('');
                            setWorkspaceNotice('ఉద్యోగి పాస్‌వర్డ్ విజయవంతంగా మార్చబడింది!');
                          }}
                          className="w-full rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-stone-800"
                        >
                          పాస్‌వర్డ్ మార్చు
                        </button>
                      </div>
                    </div>

                    {/* Staff Accounts Table with Photo + UIDAI Aadhaar Preview */}
                    <div className="overflow-x-auto bg-white rounded-lg border border-stone-200">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-stone-100 border-b border-stone-200 text-stone-700">
                            <th className="py-2 px-3 font-bold">ఫోటో &amp; ఉద్యోగి</th>
                            <th className="py-2 px-3 font-bold">హోదా (Position)</th>
                            <th className="py-2 px-3 font-bold">UIDAI ఆధార్ &amp; డాక్యుమెంట్</th>
                            <th className="py-2 px-3 font-bold">లాగిన్ ఐడి / పాస్‌వర్డ్</th>
                            <th className="py-2 px-3 font-bold">అడ్మిన్ ఆమోద స్థితి</th>
                            <th className="py-2 px-3 font-bold text-right">చర్యలు</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200">
                          {staffList.map((stf) => (
                            <tr key={stf.id} className="hover:bg-stone-50">
                              <td className="py-2.5 px-3">
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={stf.photoUrl || '/images/reporter-avatar-1.svg'}
                                    alt={stf.fullName}
                                    referrerPolicy="no-referrer"
                                    className="w-10 h-12 rounded object-cover border border-stone-300 bg-white shrink-0"
                                  />
                                  <div>
                                    <div className="font-bold text-stone-900">{stf.fullName}</div>
                                    <div className="font-mono text-[11px] text-stone-500">
                                      {stf.staffCode} · Ph: {stf.mobile}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="font-bold text-stone-800">{stf.postTitleTe}</div>
                                <div className="text-[11px] text-stone-500">
                                  {stf.editionOrUnit}
                                </div>
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="flex items-center gap-2">
                                  <img
                                    src={
                                      stf.aadhaarDocumentUrl || '/images/sample-aadhaar-card.svg'
                                    }
                                    alt={`Aadhaar of ${stf.fullName}`}
                                    referrerPolicy="no-referrer"
                                    className="w-14 h-9 rounded border border-stone-300 object-cover bg-white shrink-0"
                                  />
                                  <div>
                                    <div className="font-mono font-bold text-stone-900">
                                      {stf.aadhaarNumber}
                                    </div>
                                    <span className="inline-block rounded bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                                      ✓ UIDAI 12-Digit Conform
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 font-mono text-[11px]">
                                <div>ID: {stf.username}</div>
                                <div className="text-red-800 font-bold">
                                  Pass: {stf.passwordHash}
                                </div>
                              </td>
                              <td className="py-2.5 px-3">
                                <span
                                  className={`inline-block rounded px-2 py-0.5 text-[11px] font-bold ${
                                    stf.status === 'approved'
                                      ? 'bg-emerald-100 text-emerald-900'
                                      : stf.status === 'blocked'
                                      ? 'bg-red-100 text-red-900'
                                      : 'bg-amber-100 text-amber-900'
                                  }`}
                                >
                                  {stf.status === 'pending'
                                    ? 'PENDING ADMIN APPROVAL'
                                    : stf.status.toUpperCase()}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                                {stf.status !== 'approved' && (
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      await onApproveMediaStaff(stf.id);
                                      setWorkspaceNotice(
                                        `${stf.fullName} (${stf.postTitleTe}) ఖాతా ఆమోదించబడింది & లాగిన్ యాక్టివేట్ చేయబడింది!`
                                      );
                                    }}
                                    className="rounded bg-emerald-700 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-800"
                                  >
                                    ✓ Approve &amp; Enable Login
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={async () => {
                                    await onSetMediaStaffBlock(
                                      stf.id,
                                      stf.status !== 'blocked'
                                    );
                                    setWorkspaceNotice(`${stf.fullName} ఖాతా స్థితి మార్చబడింది.`);
                                  }}
                                  className="rounded bg-stone-200 px-2 py-1 text-[11px] font-bold text-stone-800 hover:bg-stone-300"
                                >
                                  {stf.status === 'blocked' ? 'Unblock' : 'Block'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-8 text-center space-y-4">
                <p className="text-sm font-bold text-stone-800">
                  మీరు ప్రస్తుతం లాగిన్ అయి లేరు. మీ హోదా (Position) వర్క్‌స్పేస్‌ను యాక్సెస్ చేయడానికి క్రింది బటన్‌పై క్లిక్ చేసి లాగిన్ పాప్-అప్‌లో మీ హోదా, లాగిన్ ఐడి మరియు పాస్‌వర్డ్ ఎంచుకోండి:
                </p>
                <button
                  type="button"
                  onClick={() => openEmployeeLoginPopup()}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-900 px-6 py-3 text-xs font-extrabold text-white hover:bg-red-950"
                >
                  <LogIn className="w-4 h-4" />
                  <span>ఉద్యోగి లాగిన్ పాప్-అప్ తెరవండి (Open Employee Login Popup)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-VIEW 2: COMPLETE 4-DIVISION, 40 DESIGNATIONS DIRECTORY
          (Every Position card has both "Employee Login Popup" and "Register" buttons)
          ===================================================================== */}
      {subView === 'org_directory' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedDivisionFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                  selectedDivisionFilter === 'ALL'
                    ? 'bg-stone-900 text-white'
                    : 'bg-white text-stone-700 border border-stone-300'
                }`}
              >
                అన్ని విభాగాలు (All 4 Divisions — {MEDIA_POSTS_CATALOG.length})
              </button>
              {MEDIA_DIVISIONS.map((div) => (
                <button
                  key={div.id}
                  type="button"
                  onClick={() => setSelectedDivisionFilter(div.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                    selectedDivisionFilter === div.id
                      ? 'bg-red-900 text-white'
                      : 'bg-white text-stone-700 border border-stone-300'
                  }`}
                >
                  {div.titleTe.split('(')[0]}
                </button>
              ))}
            </div>

            <select
              aria-label="Filter by Access Tier"
              value={selectedTierFilter}
              onChange={(e) => setSelectedTierFilter(e.target.value as 'ALL' | MediaAccessTier)}
              className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-bold text-stone-800"
            >
              <option value="ALL">అన్ని యాక్సెస్ స్థాయిలు (All 5 RBAC Tiers)</option>
              <option value="base_field">Tier 1: Base / Field Level</option>
              <option value="middle_newsroom_ops">Tier 2: Middle Level (Sub-Editor/DTP/Circ)</option>
              <option value="senior_dept_head">Tier 3: Senior Level (Dept Heads)</option>
              <option value="top_executive">Tier 4: Top Executive Management</option>
              <option value="it_sysadmin">Tier 5: IT / Systems Administrator</option>
            </select>
          </div>

          {MEDIA_DIVISIONS.filter(
            (d) => selectedDivisionFilter === 'ALL' || d.id === selectedDivisionFilter
          ).map((division) => {
            const divPosts = filteredPosts.filter((p) => p.divisionId === division.id);
            if (divPosts.length === 0) return null;

            return (
              <div
                key={division.id}
                className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-xs"
              >
                <div className="bg-stone-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-amber-300">
                      {division.titleTe}
                    </h3>
                    <p className="text-xs text-stone-300 mt-0.5">{division.subtitleTe}</p>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">
                    {divPosts.length} హోదాలు / Positions
                  </span>
                </div>

                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {divPosts.map((post) => {
                    const tierMeta = ACCESS_TIER_CATALOG[post.accessTier];
                    return (
                      <div
                        key={post.code}
                        className="rounded-xl border border-stone-200 p-4 flex flex-col justify-between gap-3 hover:border-stone-400 transition-colors bg-stone-50/40"
                      >
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[11px] font-bold text-red-900 uppercase tracking-wider">
                              {post.subGroupTe}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {post.isAdditionalPost && (
                                <span className="inline-flex items-center gap-1 rounded bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] font-extrabold text-amber-950">
                                  <Sparkles className="w-3 h-3" />
                                  <span>+ అదనపు పోస్ట్</span>
                                </span>
                              )}
                              <span
                                className={`rounded border px-2 py-0.5 text-[10px] font-extrabold ${tierMeta.badgeColor}`}
                              >
                                Tier {tierMeta.tierNumber} Login
                              </span>
                            </div>
                          </div>

                          <h4 className="text-sm font-extrabold text-stone-900">{post.titleTe}</h4>
                          <div className="text-xs font-semibold text-stone-500">{post.titleEn}</div>
                          <p className="text-xs text-stone-700 leading-relaxed">{post.dutyTe}</p>
                          <p className="text-[11px] text-stone-500 leading-relaxed">
                            {post.dutyEn}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-stone-200/80 flex flex-wrap items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => openEmployeeLoginPopup(post.code)}
                            className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-extrabold text-stone-950 hover:bg-amber-300 transition-colors flex items-center gap-1"
                          >
                            <LogIn className="w-3.5 h-3.5" />
                            <span>ఈ హోదా లాగిన్ (Login Popup)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setRegPostCode(post.code);
                              setSubView('register_staff');
                            }}
                            className="rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-900 transition-colors"
                          >
                            కొత్త రిజిస్ట్రేషన్ (Apply) →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =====================================================================
          SUB-VIEW 3: NEW MEDIA STAFF REGISTRATION FORM
          (Mandatory Employee Photo + UIDAI Conforming 12-Digit Aadhaar Verification + Admin Approval Mandate)
          ===================================================================== */}
      {subView === 'register_staff' && (
        <div
          className="max-w-4xl mx-auto rounded-2xl border border-stone-200 bg-stone-50 p-6 lg:p-8 space-y-6"
          data-testid="uidai-staff-registration-form"
        >
          <div className="border-b border-stone-200 pb-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded bg-red-100 border border-red-300 px-2.5 py-0.5 text-[11px] font-extrabold text-red-900 mb-2">
                <Fingerprint className="w-3.5 h-3.5" />
                <span>MANDATORY PHOTO · UIDAI 12-DIGIT AADHAAR VERIFICATION · ADMIN APPROVAL MANDATE</span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-stone-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-red-900" />
                <span>
                  మీడియా ఉద్యోగి రిజిస్ట్రేషన్ &amp; UIDAI ఆధార్ ధృవీకరణ ఫారమ్ (Staff Registration Form)
                </span>
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                ప్రతి ఉద్యోగి రిజిస్ట్రేషన్ ఫారమ్ నింపిన తర్వాత <strong>అడ్మిన్ ఆమోదం (Admin Approval)</strong> తప్పనిసరి. ఉద్యోగి పాస్‌పోర్ట్ ఫోటో మరియు UIDAI ప్రమాణాలకు అనుగుణంగా 12-అంకెల ఆధార్ కార్డు ధృవీకరణ తప్పనిసరిగా పూర్తి చేయాలి.
              </p>
            </div>
            <button
              type="button"
              onClick={() => openEmployeeLoginPopup(regPostCode)}
              className="rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-extrabold text-stone-950 hover:bg-amber-300 flex items-center gap-1.5 shrink-0"
            >
              <LogIn className="w-4 h-4" />
              <span>ఇప్పటికే రిజిస్టర్ అయ్యారా? లాగిన్ పాప్-అప్</span>
            </button>
          </div>

          {regFeedback && (
            <div
              className={`rounded-xl p-5 text-xs border-2 space-y-3 ${
                regFeedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                  : 'bg-red-50 border-red-300 text-red-950'
              }`}
              data-testid="staff-registration-feedback"
            >
              <div className="font-extrabold text-sm">{regFeedback.text}</div>
              {regFeedback.registeredStaff && (
                <div className="rounded-lg bg-white border border-emerald-200 p-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={regFeedback.registeredStaff.photoUrl}
                      alt={regFeedback.registeredStaff.fullName}
                      referrerPolicy="no-referrer"
                      className="w-14 h-16 rounded-lg object-cover border border-stone-300"
                    />
                    <div className="space-y-1">
                      <div className="font-extrabold text-stone-900">
                        {regFeedback.registeredStaff.fullName} ({regFeedback.registeredStaff.staffCode})
                      </div>
                      <div className="text-stone-700 font-semibold">
                        హోదా: {regFeedback.registeredStaff.postTitleTe}
                      </div>
                      <div className="font-mono text-[11px] text-emerald-800 font-bold">
                        ✓ UIDAI Aadhaar Verified: {regFeedback.registeredStaff.aadhaarNumber}
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-1.5">
                    <span className="inline-block rounded-md bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-extrabold text-amber-900">
                      ⏳ STATUS: PENDING ADMIN APPROVAL
                    </span>
                    <div className="text-[11px] text-stone-500">
                      అడ్మిన్ ఆమోదించిన వెంటనే లాగిన్ పాప్-అప్ ద్వారా యాక్సెస్ చేయవచ్చు
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleRegisterStaffSubmit} className="space-y-5">
            {/* 1. Position Selector (All 40 Positions Grouped by Division) */}
            <div>
              <label className="block text-xs font-extrabold text-stone-900 mb-1.5">
                1. మీడియా విభాగం &amp; ఉద్యోగ హోదాను ఎంచుకోండి (Select Position / Designation — All{' '}
                {MEDIA_POSTS_CATALOG.length} Positions) *
              </label>
              <select
                value={regPostCode}
                onChange={(e) => setRegPostCode(e.target.value)}
                className="w-full rounded-xl border-2 border-stone-300 bg-white px-3.5 py-2.5 text-xs font-bold text-stone-900"
              >
                {MEDIA_DIVISIONS.map((div) => (
                  <optgroup key={div.id} label={div.titleTe}>
                    {MEDIA_POSTS_CATALOG.filter((p) => p.divisionId === div.id).map((post) => (
                      <option key={post.code} value={post.code}>
                        {post.titleTe} — [{post.titleEn}] (Tier{' '}
                        {ACCESS_TIER_CATALOG[post.accessTier].tierNumber})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* 2. Personal & Login Credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  పూర్తి పేరు (ఆధార్ కార్డులో ఉన్నట్లుగా · Full Name as per UIDAI Aadhaar) *
                </label>
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="ఉదా: కె. రమేష్ బాబు"
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ఆధార్ లింక్ అయిన మొబైల్ నంబర్ (Mobile Number) *
                </label>
                <input
                  type="text"
                  required
                  value={regMobile}
                  onChange={(e) => setRegMobile(e.target.value)}
                  placeholder="98480 XXXXX"
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  లాగిన్ ఐడి / యూజర్‌నేమ్ (Login ID) *
                </label>
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="e.g. ramesh_subeditor"
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  లాగిన్ పాస్‌వర్డ్ (Password) *
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Create password"
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ఎడిషన్ / ప్రింటింగ్ యూనిట్ / బ్రాంచ్ *
                </label>
                <input
                  type="text"
                  required
                  value={regEditionUnit}
                  onChange={(e) => setRegEditionUnit(e.target.value)}
                  placeholder="Karimnagar Edition / Central Desk"
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900"
                />
              </div>
            </div>

            {/* 3. Location Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">రాష్ట్రం · State</label>
                <select
                  value={regState}
                  onChange={(e) => {
                    const st = e.target.value;
                    setRegState(st);
                    const dists = Object.keys(portalState.locations[st] || {});
                    const d0 = dists[0] || '';
                    setRegDistrict(d0);
                    const mnds =
                      (portalState.locations[st] && portalState.locations[st][d0]) || [];
                    setRegMandal(mnds[0] || '');
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
                <label className="block text-xs font-bold text-stone-700 mb-1">జిల్లా · District</label>
                <select
                  value={regDistrict}
                  onChange={(e) => {
                    const dt = e.target.value;
                    setRegDistrict(dt);
                    const mnds =
                      (portalState.locations[regState] && portalState.locations[regState][dt]) ||
                      [];
                    setRegMandal(mnds[0] || '');
                  }}
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900"
                >
                  {districtsForReg.map((dt) => (
                    <option key={dt} value={dt}>
                      {dt}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">మండలం · Mandal</label>
                <select
                  value={regMandal}
                  onChange={(e) => setRegMandal(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900"
                >
                  {mandalsForReg.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 4. MANDATORY EMPLOYEE PASSPORT PHOTO & UIDAI CONFORMING AADHAAR VERIFICATION BOX */}
            <div className="rounded-2xl border-2 border-amber-400 bg-white p-5 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-5 h-5 text-red-900" />
                  <h4 className="text-sm font-extrabold text-stone-900">
                    ఉద్యోగి పాస్‌పోర్ట్ ఫోటో &amp; UIDAI ఆధార్ కార్డు ధృవీకరణ విభాగం (Mandatory Photo &amp; UIDAI Standard Verification)
                  </h4>
                </div>
                <span className="rounded bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-900">
                  UIDAI 12-Digit Standard
                </span>
              </div>

              {/* 12-Digit UIDAI Number Input + Check Button */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-stone-800">
                  12-అంకెల UIDAI ఆధార్ నంబర్ (12-Digit Aadhaar Number — Must start with 2-9) *
                </label>
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
                  <input
                    type="text"
                    required
                    value={regAadhaar}
                    onChange={(e) => {
                      setRegAadhaar(e.target.value);
                      setUidaiCheckFeedback(null);
                    }}
                    placeholder="ఉదా: 7412 8529 9631 (12 Digits)"
                    className="w-full rounded-lg border-2 border-stone-300 px-3.5 py-2 text-xs font-mono font-bold text-stone-900"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyUidaiButton}
                    className="rounded-lg bg-stone-900 px-4 py-2.5 text-xs font-extrabold text-amber-300 hover:bg-stone-800 whitespace-nowrap shrink-0 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>UIDAI ఆధార్ తనిఖీ (Verify UIDAI Format)</span>
                  </button>
                </div>
                {uidaiCheckFeedback && (
                  <div
                    className={`rounded-lg px-3 py-2 text-xs font-bold ${
                      uidaiCheckFeedback.valid
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                        : 'bg-red-50 text-red-900 border border-red-300'
                    }`}
                  >
                    {uidaiCheckFeedback.message}
                  </div>
                )}
              </div>

              {/* Employee Passport Photo Upload + UIDAI Aadhaar Card Upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 flex items-center gap-4">
                  <img
                    src={regPhotoUrl}
                    alt="Employee Passport Photo Preview"
                    referrerPolicy="no-referrer"
                    className="w-20 h-24 rounded-lg object-cover border-2 border-stone-300 bg-white shrink-0"
                  />
                  <div className="space-y-2">
                    <div className="text-xs font-extrabold text-stone-900">
                      1. ఉద్యోగి పాస్‌పోర్ట్ సైజ్ ఫోటో (Employee Photo) *
                    </div>
                    <p className="text-[11px] text-stone-600">
                      అడ్మిన్ ఆమోదం తర్వాత జారీ అయ్యే అధికారిక మీడియా ఐడి కార్డుపై ఈ ఫోటో ముద్రించబడుతుంది.
                    </p>
                    <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-stone-800">
                      <Upload className="w-3.5 h-3.5" />
                      <span>ఫోటో అప్‌లోడ్ చేయండి (Upload Photo)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleStaffFileUpload(e, setRegPhotoUrl)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 flex items-center gap-4">
                  <img
                    src={regAadhaarDocUrl}
                    alt="UIDAI Aadhaar Card Document Preview"
                    referrerPolicy="no-referrer"
                    className="w-28 h-20 rounded-lg object-cover border-2 border-stone-300 bg-white shrink-0"
                  />
                  <div className="space-y-2">
                    <div className="text-xs font-extrabold text-stone-900">
                      2. UIDAI ఆధార్ కార్డు కాపీ (Aadhaar Document) *
                    </div>
                    <p className="text-[11px] text-stone-600">
                      UIDAI ప్రమాణాల ప్రకారం 12-అంకెల ఆధార్ కార్డు స్పష్టంగా కనిపించే ఇమేజ్ అప్‌లోడ్ చేయండి.
                    </p>
                    <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-red-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-950">
                      <Upload className="w-3.5 h-3.5" />
                      <span>ఆధార్ కార్డు అప్‌లోడ్ (Upload Aadhaar)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleStaffFileUpload(e, setRegAadhaarDocUrl)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* UIDAI Consent Checkbox */}
              <label className="flex items-start gap-2.5 text-xs text-stone-800 bg-amber-50/70 border border-amber-200 rounded-xl p-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={regUidaiConsent}
                  onChange={(e) => setRegUidaiConsent(e.target.checked)}
                  className="mt-0.5 rounded border-stone-400"
                />
                <span>
                  <strong>UIDAI ఆధార్ &amp; అడ్మిన్ ధృవీకరణ సమ్మతి (Mandatory UIDAI Consent):</strong> నేను సమర్పించిన పాస్‌పోర్ట్ ఫోటో మరియు 12-అంకెల ఆధార్ కార్డు వివరాలు UIDAI ప్రమాణాలకు అనుగుణంగా ఉన్నాయని ధృవీకరిస్తున్నాను. <strong>అడ్మిన్ ఆమోదం (Admin Approval)</strong> పొందిన తర్వాతే నా ఉద్యోగ హోదా లాగిన్ యాక్సెస్ పనిచేస్తుందని అంగీకరిస్తున్నాను.
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-red-900 px-5 py-3.5 text-xs font-extrabold text-white hover:bg-red-950 transition-colors shadow-sm"
            >
              ఫోటో &amp; UIDAI ఆధార్ వివరాలతో స్టాఫ్ రిజిస్ట్రేషన్ సమర్పించండి (Submit for Mandatory Admin Approval)
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
