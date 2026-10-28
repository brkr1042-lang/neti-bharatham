export type MediaAccessTier =
  | 'base_field'
  | 'middle_newsroom_ops'
  | 'senior_dept_head'
  | 'top_executive'
  | 'it_sysadmin';

export type MediaDivisionId =
  | 'editorial_newsroom'
  | 'business_ads_mktg_circulation'
  | 'printing_production_epaper'
  | 'admin_hr_finance_legal';

export interface AccessTierMeta {
  id: MediaAccessTier;
  tierNumber: number;
  titleTe: string;
  titleEn: string;
  badgeColor: string;
  summaryTe: string;
  summaryEn: string;
  permissionsTe: string[];
  permissionsEn: string[];
}

export interface MediaPostDefinition {
  code: string;
  divisionId: MediaDivisionId;
  departmentNameTe: string;
  departmentNameEn: string;
  subGroupTe: string;
  subGroupEn: string;
  titleTe: string;
  titleEn: string;
  dutyTe: string;
  dutyEn: string;
  accessTier: MediaAccessTier;
  isAdditionalPost?: boolean;
}

export interface MediaDivisionMeta {
  id: MediaDivisionId;
  numberLabel: string;
  titleTe: string;
  titleEn: string;
  subtitleTe: string;
  subtitleEn: string;
}

export interface MediaStaffMember {
  id: string;
  staffCode: string;
  fullName: string;
  mobile: string;
  username: string;
  passwordHash: string;
  divisionId: MediaDivisionId;
  postCode: string;
  postTitleTe: string;
  postTitleEn: string;
  accessTier: MediaAccessTier;
  editionOrUnit: string; // e.g., 'Hyderabad Central Desk', 'Karimnagar Edition', 'Huzurabad Mandal'
  state: string;
  district: string;
  mandal: string;
  aadhaarNumber: string;
  aadhaarDocumentUrl: string;
  photoUrl: string;
  uidaiVerified: boolean;
  idCardGenerated: boolean;
  idCardNumber: string;
  status: 'pending' | 'approved' | 'blocked';
  joinedAt: string;
  approvedAt?: string;
}

export function validateUidaiAadhaarNumber(raw: string): {
  valid: boolean;
  formatted: string;
  digitsOnly: string;
  errorTe?: string;
} {
  const digitsOnly = String(raw || '').replace(/\D/g, '');
  if (digitsOnly.length !== 12) {
    return {
      valid: false,
      formatted: raw,
      digitsOnly,
      errorTe: 'UIDAI ఆధార్ నంబర్ తప్పనిసరిగా 12 అంకెలు (12 Digits) ఉండాలి.'
    };
  }
  if (/^[01]/.test(digitsOnly)) {
    return {
      valid: false,
      formatted: raw,
      digitsOnly,
      errorTe: 'UIDAI నిబంధనల ప్రకారం ఆధార్ నంబర్ 0 లేదా 1 తో ప్రారంభం కాదు (2-9 తో ప్రారంభం కావాలి).'
    };
  }
  const formatted = `${digitsOnly.slice(0, 4)} ${digitsOnly.slice(4, 8)} ${digitsOnly.slice(8, 12)}`;
  return {
    valid: true,
    formatted,
    digitsOnly
  };
}

export interface EpaperEditionPage {
  id: string;
  editionName: string; // e.g. 'Main Edition (మెయిన్ ఎడిషన్)', 'Karimnagar District Tabloid'
  pageNumber: number;
  pageTitleTe: string;
  pageTitleEn: string;
  assignedSubEditor: string;
  assignedDesigner: string;
  leadHeadlineTe: string;
  adSlotsBooked: number;
  status: 'draft' | 'sub_edited' | 'page_designed' | 'news_editor_approved' | 'edition_locked' | 'printed';
  ctpPlateReady: boolean;
  printCopiesOrder: number;
  updatedAt: string;
  updatedByRole: string;
}

export const ACCESS_TIER_CATALOG: Record<MediaAccessTier, AccessTierMeta> = {
  base_field: {
    id: 'base_field',
    tierNumber: 1,
    titleTe: 'స్థాయి 1: బేస్ / ఫీల్డ్ లెవెల్ (Base / Field Level)',
    titleEn: 'Tier 1: Base / Field Level (Reporters, Stringers, Ad Executives)',
    badgeColor: 'bg-sky-100 text-sky-900 border-sky-300',
    summaryTe:
      'రిపోర్టర్లు, స్ట్రింగర్లు, ఫోటో/వీడియో జర్నలిస్టులు, యాడ్ & క్లాసిఫైడ్ ఎగ్జిక్యూటివ్‌లు తమ వార్తలు లేదా ప్రకటనలను మాత్రమే అప్‌లోడ్ చేయగలరు మరియు ఆమోద స్థితిని ట్రాక్ చేయగలరు.',
    summaryEn:
      'Upload news stories, photos, videos, or book display/classified ads and track approval status.',
    permissionsTe: [
      'వార్తలు, ఫోటోలు మరియు వీడియోలను మాత్రమే అప్‌లోడ్ చేయగలరు',
      'డిస్‌ప్లే యాడ్స్ & క్లాసిఫైడ్ ప్రకటనలు బుక్ చేసి RO నంబర్ పొందగలరు',
      'తాము పంపిన వార్త / యాడ్ ఆమోదం పొందిందో లేదో (Status) మాత్రమే చూడగలరు',
      'ఇతరుల వార్తలను ఎడిట్ చేసే లేదా డిలీట్ చేసే పర్మిషన్ ఉండదు'
    ],
    permissionsEn: [
      'Upload field news, photos, and videos to newsroom desk',
      'Book commercial display ads & classifieds for approval',
      'Track approval status and download official Staff / Press ID Card',
      'Cannot edit or delete stories submitted by other staff'
    ]
  },
  middle_newsroom_ops: {
    id: 'middle_newsroom_ops',
    tierNumber: 2,
    titleTe: 'స్థాయి 2: మిడిల్ లెవెల్ - న్యూస్‌రూమ్ & ఆపరేషన్స్ (Middle Level)',
    titleEn: 'Tier 2: Middle Level — Newsroom, DTP, E-Paper & Circulation Ops',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    summaryTe:
      'సబ్-ఎడిటర్లు, పేజీ డిజైనర్లు (DTP), ఈ-పేపర్ కోఆర్డినేటర్లు, సర్క్యులేషన్ సూపర్‌వైజర్లు మరియు ప్రెస్ ఆపరేటర్లు.',
    summaryEn:
      'Proofread reporter stories, design E-Paper pages, enter area print copy indents, and update CTP/Press status.',
    permissionsTe: [
      'రిపోర్టర్లు పంపిన వార్తలను చదవడం, అక్షర దోషాలు సరిదిద్దడం (Sub-Editing & Fact-Check)',
      'ఈ-పేపర్ & ప్రింట్ పేజీల లేఅవుట్ డిజైన్ (DTP InDesign/Quark) అప్‌డేట్ చేయడం',
      'ఏరియా వారీగా ఏజెంట్ల పేపర్ కాపీల సంఖ్య (Print Order), బిల్లింగ్ మరియు చందాలు ఎంటర్ చేయడం',
      'CTP ప్లేట్ మేకింగ్ మరియు రోటరీ ప్రెస్ షిఫ్ట్ స్టేటస్ అప్‌డేట్ చేయడం'
    ],
    permissionsEn: [
      'Edit and proofread incoming reporter news stories',
      'Design E-Paper & Print page layouts and mark pages as Page Designed',
      'Enter area-wise circulation print copy counts and agent billing',
      'Mark Pre-press CTP plates ready for printing'
    ]
  },
  senior_dept_head: {
    id: 'senior_dept_head',
    tierNumber: 3,
    titleTe: 'స్థాయి 3: సీనియర్ లెవెల్ - విభాగాధిపతులు (Department Heads)',
    titleEn: 'Tier 3: Senior Level — Department Heads (News Editor, Ad/Press/Circ Managers)',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    summaryTe:
      'న్యూస్ ఎడిటర్, బ్యూరో చీఫ్, అడ్వర్టైజింగ్/మార్కెటింగ్ మేనేజర్లు, సర్క్యులేషన్ GM మరియు ప్రెస్/ప్రొడక్షన్ మేనేజర్.',
    summaryEn:
      'Final approve news, assign page numbers, lock E-Paper editions, approve Ad ROs, and trigger Rotary Press print runs.',
    permissionsTe: [
      'వార్తలను ఫైనల్ అప్రూవ్ చేయడం మరియు ఏ పేజీలో (Page 1, District Tabloid) రావాలో నిర్ణయించడం',
      'ఈ-పేపర్ (E-Paper) ఎడిషన్‌ను లాక్ చేసి ప్రింటింగ్‌కు పంపడం (Edition Lock)',
      'యాడ్స్ (ROs) ఆమోదించడం, ఏ పేజీలో ఏ యాడ్ వేయాలో డిసైడ్ చేయడం & రెవెన్యూ రిపోర్ట్స్ చూడటం',
      'ఫైనల్ అయిన ఈ-పేపర్ PDF డౌన్‌లోడ్ చేసుకుని రోటరీ ప్రెస్ ప్రింటింగ్ (Print Run) ప్రారంభించడం'
    ],
    permissionsEn: [
      'Final approve news and assign E-Paper page numbers',
      'Lock E-Paper editions for Pre-Press CTP & Digital publishing',
      'Approve Ad Release Orders (ROs), map ad slots, and review revenue',
      'Download print-ready E-Paper PDFs and trigger Rotary Press print runs'
    ]
  },
  top_executive: {
    id: 'top_executive',
    tierNumber: 4,
    titleTe: 'స్థాయి 4: టాప్ లెవెల్ - ఎగ్జిక్యూటివ్ మేనేజ్‌మెంట్ (Executive Management)',
    titleEn: 'Tier 4: Top Level — Executive Management (Editor-in-Chief, RE, MD/Publisher)',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    summaryTe:
      'ఎడిటర్-ఇన్-చీఫ్, రెసిడెంట్ ఎడిటర్, మేనేజింగ్ ఎడిటర్, పబ్లిషర్/చైర్మన్, VP ఆపరేషన్స్, HR, ఫైనాన్స్ & లీగల్ అధిపతులు.',
    summaryEn:
      'Review all editions, approve sensitive stories, view global revenue/circulation analytics, and govern HR/Legal compliance.',
    permissionsTe: [
      'అన్ని ఎడిషన్ల వార్తలను సమీక్షించడం మరియు సున్నితమైన/పరిశోధనాత్మక వార్తలపై తుది నిర్ణయం తీసుకోవడం',
      'సంస్థ మొత్తం ఆదాయ వ్యయాలు (Ad Revenue), సర్క్యులేషన్ గ్రాఫ్స్ మరియు ఎడిటోరియల్ అనలిటిక్స్ చూడటం',
      'RNI & ప్రెస్ కౌన్సిల్ చట్టపరమైన నిబంధనలు, HR సిబ్బంది ఆమోదాలు & స్ట్రింగర్ గౌరవ వేతనాలు పర్యవేక్షించడం'
    ],
    permissionsEn: [
      'Review all state/district editions and approve high-priority investigative stories',
      'Access complete organization revenue, circulation, and readership analytics',
      'Approve HR staff onboarding, RNI legal compliance, and financial audits'
    ]
  },
  it_sysadmin: {
    id: 'it_sysadmin',
    tierNumber: 5,
    titleTe: 'స్థాయి 5: టెక్నికల్ సపోర్ట్ & రూట్ అడ్మిన్ (IT / Systems Administrator)',
    titleEn: 'Tier 5: Technical Support & Root Admin (IT / Systems Administrator)',
    badgeColor: 'bg-red-100 text-red-900 border-red-300',
    summaryTe:
      'IT / సిస్టమ్స్ అడ్మినిస్ట్రేటర్ మరియు చీఫ్ అడ్మిన్ — పోర్టల్ మొత్తానికి పూర్తి రూట్ యాక్సెస్ (Full Access).',
    summaryEn:
      'Full Root Access — Create, modify, block, or reset login IDs for all staff posts, manage servers, CMS & Hostinger Export.',
    permissionsTe: [
      'పోర్టల్ మొత్తానికి 100% ఫుల్ రూట్ యాక్సెస్ (Full Root Access)',
      'అన్ని విభాగాల (Editorial, Ad, Marketing, Circulation, Press, HR/Finance) సిబ్బందికి కొత్త లాగిన్ ఐడిలు క్రియేట్ చేయడం',
      'సిబ్బంది పాస్‌వర్డ్‌లు మార్చడం, ఖాతాలను ఆమోదించడం (Approve) లేదా బ్లాక్ చేయడం',
      'వెబ్‌సైట్ CMS, ఈ-పేపర్ సర్వర్లు మరియు Hostinger Production ప్యాకేజీలను నిర్వహించడం'
    ],
    permissionsEn: [
      'Full Root Access to the entire Neti Bharatam Print, Digital & E-Paper Portal',
      'Create, approve, block, or reset passwords for any staff member across all departments',
      'Manage CMS branding, database backups, and Hostinger deployment packages'
    ]
  }
};

export const MEDIA_DIVISIONS: MediaDivisionMeta[] = [
  {
    id: 'editorial_newsroom',
    numberLabel: '1',
    titleTe: '1. ఎడిటోరియల్ & న్యూస్‌రూమ్ విభాగం (Editorial, Digital & E-Paper Newsroom)',
    titleEn: '1. Editorial, Newsroom, Digital & Multimedia Division',
    subtitleTe:
      'వార్తల సేకరణ, నిజనిర్ధారణ (Fact-Check), ఎడిటింగ్, పేజీ మేకింగ్, ఫోటో/వీడియో జర్నలిజం మరియు డిజిటల్/ఈ-పేపర్ ప్రచురణ బాధ్యత చూసే ప్రధాన విభాగం.',
    subtitleEn:
      'Core journalism division responsible for field reporting, bureau coverage, copy editing, page making, and digital/e-paper publishing.'
  },
  {
    id: 'business_ads_mktg_circulation',
    numberLabel: '2',
    titleTe: '2. మార్కెటింగ్, అడ్వర్టైజింగ్ & సర్క్యులేషన్ విభాగం (Business, Ads & Circulation)',
    titleEn: '2. Advertising, Brand Marketing & Circulation Logistics Division',
    subtitleTe:
      'పత్రికకు ఆదాయాన్ని సమకూర్చే ప్రకటనలు (Display, Classifieds, DAVP), బ్రాండ్ ప్రమోషన్ మరియు ప్రింటింగ్ ప్రెస్ నుండి పాఠకుల ఇంటికి పేపర్ చేరవేసే విభాగం.',
    subtitleEn:
      'Revenue generation through commercial/government advertising, brand events, readership surveys, and early-morning print distribution.'
  },
  {
    id: 'printing_production_epaper',
    numberLabel: '3',
    titleTe: '3. ప్రింటింగ్, ప్రొడక్షన్ & టెక్నికల్ విభాగం (Printing Press, CTP & IT Systems)',
    titleEn: '3. Printing Press, Pre-Press CTP, E-Paper Engineering & IT Division',
    subtitleTe:
      'DTP పేజీ డిజైన్, కంప్యూటర్-టు-ప్లేట్ (CTP), రోటరీ వెబ్ ఆఫ్‌సెట్ ప్రింటింగ్, క్వాలిటీ కంట్రోల్, బండ్లింగ్ మరియు ఈ-పేపర్/IT సర్వర్ల నిర్వహణ.',
    subtitleEn:
      'Page layout design, CTP plate making, high-speed rotary offset printing, quality inspection, mailroom dispatch, and IT infrastructure.'
  },
  {
    id: 'admin_hr_finance_legal',
    numberLabel: '4',
    titleTe: '4. అడ్మినిస్ట్రేషన్, హెచ్ఆర్, ఫైనాన్స్ & లీగల్ (Governance, HR, Finance & Legal)',
    titleEn: '4. Administration, HR, Finance, RNI Legal & Archival Division',
    subtitleTe:
      'పబ్లిషర్/మేనేజ్‌మెంట్, సిబ్బంది నియామకాలు, ప్రెస్ ఐడి కార్డులు, స్ట్రింగర్ గౌరవ వేతనాలు, GST ఆడిటింగ్ మరియు RNI / ప్రెస్ కౌన్సిల్ చట్టపరమైన వ్యవహారాలు.',
    subtitleEn:
      'Corporate governance, HR & Press ID issuance, accounts & stringer honorariums, RNI statutory declarations, and legal compliance.'
  }
];

export const MEDIA_POSTS_CATALOG: MediaPostDefinition[] = [
  // ============================================================================
  // 1. EDITORIAL & NEWSROOM DIVISION
  // ============================================================================
  {
    code: 'ED_EIC',
    divisionId: 'editorial_newsroom',
    departmentNameTe: 'ఎడిటోరియల్ టాప్ మేనేజ్‌మెంట్',
    departmentNameEn: 'Editorial Top Management',
    subGroupTe: 'అత్యున్నత స్థాయి (Top Management)',
    subGroupEn: 'Top Management',
    titleTe: 'ఎడిటర్-ఇన్-చీఫ్ / గ్రూప్ ఎడిటర్ (Editor-in-Chief / Group Editor)',
    titleEn: 'Editor-in-Chief / Group Editor',
    dutyTe: 'సంస్థ మొత్తానికి, ప్రింట్, డిజిటల్ మరియు అన్ని రాష్ట్రాల ఈ-పేపర్ ఎడిషన్లకు అత్యున్నత ఎడిటోరియల్ అధిపతి.',
    dutyEn: 'Supreme editorial head overseeing all print, digital, and multi-state E-Paper editions.',
    accessTier: 'top_executive'
  },
  {
    code: 'ED_RE',
    divisionId: 'editorial_newsroom',
    departmentNameTe: 'ఎడిటోరియల్ టాప్ మేనేజ్‌మెంట్',
    departmentNameEn: 'Editorial Top Management',
    subGroupTe: 'అత్యున్నత స్థాయి (Top Management)',
    subGroupEn: 'Top Management',
    titleTe: 'రెసిడెంట్ ఎడిటర్ (Resident Editor - RE)',
    titleEn: 'Resident Editor (RE)',
    dutyTe: 'వేర్వేరు ప్రాంతాలు / రాష్ట్రాల (తెలంగాణ, ఆంధ్రప్రదేశ్, జాతీయ) ఎడిషన్లకు ఎడిటోరియల్ ఇన్‌చార్జ్.',
    dutyEn: 'In-charge of regional or state editions and state-level editorial operations.',
    accessTier: 'top_executive'
  },
  {
    code: 'ED_EXEC',
    divisionId: 'editorial_newsroom',
    departmentNameTe: 'ఎడిటోరియల్ టాప్ మేనేజ్‌మెంట్',
    departmentNameEn: 'Editorial Top Management',
    subGroupTe: 'అత్యున్నత స్థాయి (Top Management)',
    subGroupEn: 'Top Management',
    titleTe: 'ఎగ్జిక్యూటివ్ ఎడిటర్ / మేనేజింగ్ ఎడిటర్ (Executive / Managing Editor)',
    titleEn: 'Executive Editor / Managing Editor',
    dutyTe: 'రోజువారీ న్యూస్‌రూమ్ కార్యకలాపాలు, ప్రత్యేక కథనాలు మరియు ఎడిటోరియల్ నిర్ణయాలు తీసుకునేవారు.',
    dutyEn: 'Directs daily newsroom operations, investigative assignments, and editorial policy.',
    accessTier: 'top_executive'
  },
  {
    code: 'ED_ASSOC',
    divisionId: 'editorial_newsroom',
    departmentNameTe: 'ఎడిటోరియల్ టాప్ మేనేజ్‌మెంట్',
    departmentNameEn: 'Editorial Top Management',
    subGroupTe: 'అత్యున్నత స్థాయి (Top Management)',
    subGroupEn: 'Top Management',
    titleTe: 'అసోసియేట్ ఎడిటర్ / డిప్యూటీ ఎడిటర్ (Associate / Deputy Editor)',
    titleEn: 'Associate Editor / Deputy Editor',
    dutyTe: 'సంపాదకీయ పేజీ (Editorial / Op-Ed), విశ్లేషణాత్మక వ్యాసాలు మరియు సీనియర్ ఎడిటోరియల్ పర్యవేక్షణ.',
    dutyEn: 'Leads editorial columns, op-ed curation, and senior newsroom supervision.',
    accessTier: 'top_executive'
  },
  {
    code: 'ED_OMBUDSMAN',
    divisionId: 'editorial_newsroom',
    departmentNameTe: 'ఎడిటోరియల్ టాప్ మేనేజ్‌మెంట్',
    departmentNameEn: 'Editorial Top Management',
    subGroupTe: 'అత్యున్నత స్థాయి (Top Management)',
    subGroupEn: 'Top Management',
    titleTe: 'రీడర్స్ అంబుడ్స్‌మన్ / ఎడిటోరియల్ స్టాండర్డ్స్ డైరెక్టర్ (Ombudsman)',
    titleEn: 'Readers Ombudsman / Editorial Standards Director',
    dutyTe: 'పాఠకుల ఫిర్యాదుల పరిష్కారం, సవరణలు (Corrigendum) మరియు జర్నలిజం నైతిక విలువల పర్యవేక్షణ.',
    dutyEn: 'Handles reader grievances, public corrections, and journalistic ethics compliance.',
    accessTier: 'top_executive',
    isAdditionalPost: true
  },

  // Middle Management (Editorial)
  {
    code: 'ED_NE',
    divisionId: 'editorial_newsroom',
    departmentNameTe: 'న్యూస్‌రూమ్ మిడిల్ మేనేజ్‌మెంట్',
    departmentNameEn: 'Newsroom Middle Management',
    subGroupTe: 'మధ్య స్థాయి (Middle Management)',
    subGroupEn: 'Middle Management',
    titleTe: 'న్యూస్ ఎడిటర్ (News Editor - NE)',
    titleEn: 'News Editor (NE)',
    dutyTe: 'న్యూస్‌రూమ్ ఇన్‌చార్జ్, మొదటి పేజీ (Page 1) వార్తల ఎంపిక మరియు అన్ని పేజీల మేకింగ్ పర్యవేక్షకులు.',
    dutyEn: 'Newsroom in-charge supervising story selection, Page-1 layout, and edition deadlines.',
    accessTier: 'senior_dept_head'
  },
  {
    code: 'ED_COB',
    divisionId: 'editorial_newsroom',
    departmentNameTe: 'న్యూస్‌రూమ్ మిడిల్ మేనేజ్‌మెంట్',
    departmentNameEn: 'Newsroom Middle Management',
    subGroupTe: 'మధ్య స్థాయి (Middle Management)',
    subGroupEn: 'Middle Management',
    titleTe: 'చీఫ్ ఆఫ్ బ్యూరో (Chief of Bureau - CoB)',
    titleEn: 'Chief of Bureau (CoB)',
    dutyTe: 'సచివాలయం, అసెంబ్లీ, పార్లమెంట్ లేదా రాష్ట్ర/జిల్లా ముఖ్యమైన బ్యూరోల రిపోర్టింగ్ అధిపతి.',
    dutyEn: 'Heads political, secretariat, parliament, or state/regional reporting bureaus.',
    accessTier: 'senior_dept_head'
  },
  {
    code: 'ED_ANE',
    divisionId: 'editorial_newsroom',
    departmentNameTe: 'న్యూస్‌రూమ్ మిడిల్ మేనేజ్‌మెంట్',
    departmentNameEn: 'Newsroom Middle Management',
    subGroupTe: 'మధ్య స్థాయి (Middle Management)',
    subGroupEn: 'Middle Management',
    titleTe: 'అసిస్టెంట్ న్యూస్ ఎడిటర్ (Assistant News Editor - ANE)',
    titleEn: 'Assistant News Editor (ANE)',
    dutyTe: 'న్యూస్ ఎడిటర్‌కు సహాయకుడిగా ఉంటూ జిల్లా ఎడిషన్లు మరియు షిఫ్ట్ డెస్క్‌లను సమన్వయం చేసే అధికారి.',
    dutyEn: 'Assists the News Editor in managing edition desks and regional supplements.',
    accessTier: 'senior_dept_head'
  },
  {
    code: 'ED_CSE',
    divisionId: 'editorial_newsroom',
    departmentNameTe: 'న్యూస్‌రూమ్ మిడిల్ మేనేజ్‌మెంట్',
    departmentNameEn: 'Newsroom Middle Management',
    subGroupTe: 'మధ్య స్థాయి (Middle Management)',
    subGroupEn: 'Middle Management',
    titleTe: 'చీఫ్ సబ్-ఎడిటర్ / సీనియర్ సబ్-ఎడిటర్ (Chief / Senior Sub-Editor)',
    titleEn: 'Chief Sub-Editor / Senior Sub-Editor',
    dutyTe: 'వార్తలను సరిదిద్దే (Editing), ఆకర్షణీయమైన శీర్షికలు (Headlines) పెట్టే సీనియర్ డెస్క్ సిబ్బంది.',
    dutyEn: 'Senior copy-desk editors crafting headlines, verifying facts, and finalizing page stories.',
    accessTier: 'middle_newsroom_ops'
  },
  {
    code: 'ED_SUB',
    divisionId: 'editorial_newsroom',
    departmentNameTe: 'న్యూస్‌రూమ్ మిడిల్ మేనేజ్‌మెంట్',
    departmentNameEn: 'Newsroom Middle Management',
    subGroupTe: 'మధ్య స్థాయి (Middle Management)',
    subGroupEn: 'Middle Management',
    titleTe: 'సబ్-ఎడిటర్ / ట్రైనీ సబ్-ఎడిటర్ (Sub-Editor / Trainee Sub-Editor)',
    titleEn: 'Sub-Editor / Trainee Sub-Editor',
    dutyTe: 'రిపోర్టర్లు పంపిన వార్తల భాషా దోషాలు సరిదిద్దడం, అనువాదం మరియు డెస్క్ ఎడిటింగ్ చేసే సహాయకులు.',
    dutyEn: 'Proofreads reporter copy, translates wire stories, and prepares articles for layout.',
    accessTier: 'middle_newsroom_ops'
  },
  {
    code: 'ED_EPAPER_COORD',
    divisionId: 'editorial_newsroom',
    departmentNameTe: 'న్యూస్‌రూమ్ మిడిల్ మేనేజ్‌మెంట్',
    departmentNameEn: 'Newsroom Middle Management',
    subGroupTe: 'మధ్య స్థాయి (Middle Management)',
    subGroupEn: 'Middle Management',
    titleTe: 'ఈ-పేపర్ ఎడిషన్ కోఆర్డినేటర్ & ఫ్యాక్ట్-చెక్ హెడ్ (E-Paper & Fact-Check Desk)',
    titleEn: 'E-Paper Edition Coordinator & Fact-Check Desk Head',
    dutyTe: 'మెయిన్ & జిల్లా టాబ్లాయిడ్ ఈ-పేపర్ ఎడిషన్ల సమన్వయం మరియు ఫేక్ న్యూస్ నిరోధక ఫ్యాక్ట్-చెక్ విభాగం.',
    dutyEn: 'Coordinates multi-edition E-Paper uploads, article area-clipping, and fact-check verification.',
    accessTier: 'middle_newsroom_ops',
    isAdditionalPost: true
  },

  // Ground / Field Level (Editorial)
  {
    code: 'ED_SPL_CORR',
    divisionId: 'editorial_newsroom',
    departmentNameTe: 'గ్రౌండ్ లెవెల్ రిపోర్టింగ్ (Field Reporting)',
    departmentNameEn: 'Field Level Reporting',
    subGroupTe: 'గ్రౌండ్ లెవెల్ (Field Level)',
    subGroupEn: 'Field Level',
    titleTe: 'స్పెషల్ కరస్పాండెంట్ / చీఫ్ రిపోర్టర్ (Special Correspondent / Chief Reporter)',
    titleEn: 'Special Correspondent / Chief Reporter',
    dutyTe: 'రాష్ట్ర, జాతీయ స్థాయి ముఖ్యమైన రాజకీయ, ప్రభుత్వ విధాన వార్తలు కవర్ చేసే సీనియర్ రిపోర్టర్లు.',
    dutyEn: 'Covers high-impact state/national policy, assembly, and chief reporting assignments.',
    accessTier: 'base_field'
  },
  {
    code: 'ED_BEAT_REP',
    divisionId: 'editorial_newsroom',
    departmentNameTe: 'గ్రౌండ్ లెవెల్ రిపోర్టింగ్ (Field Reporting)',
    departmentNameEn: 'Field Level Reporting',
    subGroupTe: 'గ్రౌండ్ లెవెల్ (Field Level)',
    subGroupEn: 'Field Level',
    titleTe: 'సీనియర్ రిపోర్టర్ / బీట్ రిపోర్టర్ (Senior / Beat Reporter)',
    titleEn: 'Senior Reporter / Beat Reporter (Crime, Politics, Business, Cinema, Agri)',
    dutyTe: 'క్రైమ్, పాలిటిక్స్, బిజినెస్, సినిమా, వ్యవసాయం, కోర్టులు, విద్య వంటి ప్రత్యేక బీట్స్ రిపోర్టర్లు.',
    dutyEn: 'Dedicated beat journalists covering Crime, Politics, Business, Cinema, Courts, and Agriculture.',
    accessTier: 'base_field'
  },
  {
    code: 'ED_REP',
    divisionId: 'editorial_newsroom',
    departmentNameTe: 'గ్రౌండ్ లెవెల్ రిపోర్టింగ్ (Field Reporting)',
    departmentNameEn: 'Field Level Reporting',
    subGroupTe: 'గ్రౌండ్ లెవెల్ (Field Level)',
    subGroupEn: 'Field Level',
    titleTe: 'రిపోర్టర్ / ట్రైనీ రిపోర్టర్ (Staff Reporter / Trainee Reporter)',
    titleEn: 'Reporter / Trainee Reporter',
    dutyTe: 'నగర, జిల్లా స్థాయిలో రోజువారీ ప్రెస్ మీట్లు, ప్రజా సమస్యలు, సాధారణ వార్తలు సేకరించే రిపోర్టర్లు.',
    dutyEn: 'Gathers daily city and district news, press conferences, and civic updates.',
    accessTier: 'base_field'
  },
  {
    code: 'ED_STRINGER',
    divisionId: 'editorial_newsroom',
    departmentNameTe: 'గ్రౌండ్ లెవెల్ రిపోర్టింగ్ (Field Reporting)',
    departmentNameEn: 'Field Level Reporting',
    subGroupTe: 'గ్రౌండ్ లెవెల్ (Field Level)',
    subGroupEn: 'Field Level',
    titleTe: 'కరస్పాండెంట్ / మండల స్ట్రింగర్ (Mandal / Constituency Correspondent / Stringer)',
    titleEn: 'Correspondent / Stringer (District, Constituency & Mandal Level)',
    dutyTe: 'జిల్లా, నియోజకవర్గ, మండల మరియు గ్రామ స్థాయిలో వార్తలు & ఫోటోలు సేకరించే క్షేత్రస్థాయి విలేకరులు.',
    dutyEn: 'Grassroots mandal and constituency stringers covering local governance and village news.',
    accessTier: 'base_field'
  },
  {
    code: 'ED_RTI_REP',
    divisionId: 'editorial_newsroom',
    departmentNameTe: 'గ్రౌండ్ లెవెల్ రిపోర్టింగ్ (Field Reporting)',
    departmentNameEn: 'Field Level Reporting',
    subGroupTe: 'గ్రౌండ్ లెవెల్ (Field Level)',
    subGroupEn: 'Field Level',
    titleTe: 'ఇన్వెస్టిగేటివ్ & RTI డెస్క్ రిపోర్టర్ (Investigative & RTI Correspondent)',
    titleEn: 'Investigative & RTI Desk Correspondent',
    dutyTe: 'సమాచార హక్కు చట్టం (RTI) మరియు గ్రౌండ్ రికార్డుల ఆధారంగా ప్రత్యేక పరిశోధనాత్మక కథనాలు వెలికితీసే విలేకరి.',
    dutyEn: 'Specializes in Right to Information (RTI) filings and investigative public-interest stories.',
    accessTier: 'base_field',
    isAdditionalPost: true
  },

  // Creative & Digital Multimedia
  {
    code: 'ED_PHOTO',
    divisionId: 'editorial_newsroom',
    departmentNameTe: 'క్రియేటివ్ & మల్టీమీడియా (Creative & Digital)',
    departmentNameEn: 'Creative, Multimedia & Digital',
    subGroupTe: 'క్రియేటివ్ & మల్టీమీడియా (Creative & Digital)',
    subGroupEn: 'Creative & Digital',
    titleTe: 'ఫోటో ఎడిటర్ / స్టాఫ్ ఫోటోగ్రాఫర్ (Photo Editor / Staff Photographer)',
    titleEn: 'Photo Editor / Staff Photographer',
    dutyTe: 'వార్తా సంఘటనల హై-రిజల్యూషన్ ఫోటోలు తీయడం మరియు ప్రింట్/ఈ-పేపర్ కోసం ఫోటో సెలక్షన్ చేయడం.',
    dutyEn: 'Captures high-resolution news photography and curates visual stories for print and digital.',
    accessTier: 'base_field'
  },
  {
    code: 'ED_VJ',
    divisionId: 'editorial_newsroom',
    departmentNameTe: 'క్రియేటివ్ & మల్టీమీడియా (Creative & Digital)',
    departmentNameEn: 'Creative, Multimedia & Digital',
    subGroupTe: 'క్రియేటివ్ & మల్టీమీడియా (Creative & Digital)',
    subGroupEn: 'Creative & Digital',
    titleTe: 'వీడియో జర్నలిస్ట్ / వీడియోగ్రాఫర్ (Video Journalist / Videographer)',
    titleEn: 'Video Journalist / Videographer',
    dutyTe: 'వెబ్ పోర్టల్, యూట్యూబ్ ఛానల్ మరియు డిజిటల్ బులెటిన్ల కోసం వీడియో వార్తలు రికార్డు చేసి ఎడిట్ చేసేవారు.',
    dutyEn: 'Shoots and edits video reports for YouTube, digital bulletins, and social media.',
    accessTier: 'base_field'
  },
  {
    code: 'ED_CARTOON',
    divisionId: 'editorial_newsroom',
    departmentNameTe: 'క్రియేటివ్ & మల్టీమీడియా (Creative & Digital)',
    departmentNameEn: 'Creative, Multimedia & Digital',
    subGroupTe: 'క్రియేటివ్ & మల్టీమీడియా (Creative & Digital)',
    subGroupEn: 'Creative & Digital',
    titleTe: 'కార్టూనిస్ట్ / ఇలస్ట్రేటర్ & ఇన్ఫోగ్రాఫిక్స్ డిజైనర్ (Cartoonist / Infographics)',
    titleEn: 'Cartoonist / Illustrator & Data Infographics Designer',
    dutyTe: 'మొదటి పేజీ పాకెట్ కార్టూన్లు, రాజకీయ వ్యంగ్య చిత్రాలు మరియు బడ్జెట్/ఎన్నికల ఇన్ఫోగ్రాఫిక్స్ వేసేవారు.',
    dutyEn: 'Creates editorial cartoons, illustrations, and data-journalism infographics.',
    accessTier: 'middle_newsroom_ops'
  },
  {
    code: 'ED_DIGITAL',
    divisionId: 'editorial_newsroom',
    departmentNameTe: 'క్రియేటివ్ & మల్టీమీడియా (Creative & Digital)',
    departmentNameEn: 'Creative, Multimedia & Digital',
    subGroupTe: 'క్రియేటివ్ & మల్టీమీడియా (Creative & Digital)',
    subGroupEn: 'Creative & Digital',
    titleTe: 'డిజిటల్ కంటెంట్ ప్రొడ్యూసర్ / సోషల్ మీడియా & SEO ఎడిటర్ (Digital & Social Editor)',
    titleEn: 'Digital Content Producer / Social Media & SEO Editor',
    dutyTe: 'వెబ్‌సైట్ బ్రేకింగ్ న్యూస్, గూగుల్ న్యూస్ SEO, వాట్సాప్/యూట్యూబ్/X సోషల్ మీడియా పోస్టులు నిర్వహించే సిబ్బంది.',
    dutyEn: 'Manages breaking web updates, Google News SEO, push notifications, and social channels.',
    accessTier: 'middle_newsroom_ops'
  },

  // ============================================================================
  // 2. ADVERTISING, MARKETING & CIRCULATION DIVISION
  // ============================================================================
  {
    code: 'AD_NAT_HEAD',
    divisionId: 'business_ads_mktg_circulation',
    departmentNameTe: 'అడ్వర్టైజింగ్ / ప్రకటనల విభాగం (Advertising)',
    departmentNameEn: 'Advertising Department',
    subGroupTe: 'అడ్వర్టైజింగ్ విభాగం (Advertising Department)',
    subGroupEn: 'Advertising Department',
    titleTe: 'నేషనల్ అడ్వర్టైజింగ్ హెడ్ / డైరెక్టర్ (National Advertising Head / Director)',
    titleEn: 'National Advertising Head / Director',
    dutyTe: 'దేశవ్యాప్తంగా కార్పొరేట్ కంపెనీలు, జాతీయ ఏజెన్సీల నుండి పత్రికకు ప్రకటనల ఆదాయాన్ని సమీకరించే అధిపతి.',
    dutyEn: 'Heads national corporate advertising strategy, tariff cards, and agency relationships.',
    accessTier: 'senior_dept_head'
  },
  {
    code: 'AD_REG_MGR',
    divisionId: 'business_ads_mktg_circulation',
    departmentNameTe: 'అడ్వర్టైజింగ్ / ప్రకటనల విభాగం (Advertising)',
    departmentNameEn: 'Advertising Department',
    subGroupTe: 'అడ్వర్టైజింగ్ విభాగం (Advertising Department)',
    subGroupEn: 'Advertising Department',
    titleTe: 'బ్రాంచ్ / రీజినల్ అడ్వర్టైజింగ్ మేనేజర్ (Branch / Regional Ad Manager)',
    titleEn: 'Branch / Regional Advertising Manager',
    dutyTe: 'ఒక నిర్దిష్ట ప్రాంతం లేదా బ్రాంచ్ కార్యాలయ ప్రకటనల లక్ష్యాలను (Targets) మరియు యాడ్ స్పేస్‌ను పర్యవేక్షించే మేనేజర్.',
    dutyEn: 'Supervises branch advertising revenue targets, special editions, and client approvals.',
    accessTier: 'senior_dept_head'
  },
  {
    code: 'AD_EXEC',
    divisionId: 'business_ads_mktg_circulation',
    departmentNameTe: 'అడ్వర్టైజింగ్ / ప్రకటనల విభాగం (Advertising)',
    departmentNameEn: 'Advertising Department',
    subGroupTe: 'అడ్వర్టైజింగ్ విభాగం (Advertising Department)',
    subGroupEn: 'Advertising Department',
    titleTe: 'స్పేస్ సెల్లింగ్ ఎగ్జిక్యూటివ్ / యాడ్ ఎగ్జిక్యూటివ్ (Space Selling / Ad Executive)',
    titleEn: 'Space Selling Executive / Advertising Executive',
    dutyTe: 'ప్రైవేట్ సంస్థలు, విద్యాసంస్థలు, ఆసుపత్రులు, జ్యువెలరీ మరియు రియల్ ఎస్టేట్ సంస్థలను కలిసి డిస్‌ప్లే యాడ్స్ బుక్ చేసేవారు.',
    dutyEn: 'Field executives booking commercial display ads across home, state, district, and mandal editions.',
    accessTier: 'base_field'
  },
  {
    code: 'AD_CLASSIFIED',
    divisionId: 'business_ads_mktg_circulation',
    departmentNameTe: 'అడ్వర్టైజింగ్ / ప్రకటనల విభాగం (Advertising)',
    departmentNameEn: 'Advertising Department',
    subGroupTe: 'అడ్వర్టైజింగ్ విభాగం (Advertising Department)',
    subGroupEn: 'Advertising Department',
    titleTe: 'క్లాసిఫైడ్స్ మేనేజర్ & ఎగ్జిక్యూటివ్ (Classifieds Manager & Executive)',
    titleEn: 'Classifieds Manager & Executive',
    dutyTe: 'చిన్న తరహా ప్రకటనలు (ఉద్యోగాలు, పెళ్లి సంబంధాలు, ఆస్తుల అమ్మకాలు, పేరు మార్పు, టెండర్లు) సేకరించే విభాగం.',
    dutyEn: 'Manages line/box classified advertisements (matrimonial, real estate, jobs, public notices).',
    accessTier: 'base_field'
  },
  {
    code: 'AD_DESIGN_RO',
    divisionId: 'business_ads_mktg_circulation',
    departmentNameTe: 'అడ్వర్టైజింగ్ / ప్రకటనల విభాగం (Advertising)',
    departmentNameEn: 'Advertising Department',
    subGroupTe: 'అడ్వర్టైజింగ్ విభాగం (Advertising Department)',
    subGroupEn: 'Advertising Department',
    titleTe: 'యాడ్ డిజైన్ & రిలీజ్ ఆర్డర్ (RO) బిల్లింగ్ కోఆర్డినేటర్ (Ad Design & RO Coordinator)',
    titleEn: 'Creative Ad Designer & Release Order (RO) Billing Coordinator',
    dutyTe: 'క్లయింట్ల ప్రకటనల డిజైన్, రిలీజ్ ఆర్డర్ల (ROs) తనిఖీ, పేజీలలో యాడ్ ప్లేస్‌మెంట్ మరియు బిల్లింగ్ సమన్వయం.',
    dutyEn: 'Designs client ad creatives, verifies Release Orders (ROs), and tracks ad billing & collections.',
    accessTier: 'middle_newsroom_ops'
  },
  {
    code: 'AD_GOVT_DAVP',
    divisionId: 'business_ads_mktg_circulation',
    departmentNameTe: 'అడ్వర్టైజింగ్ / ప్రకటనల విభాగం (Advertising)',
    departmentNameEn: 'Advertising Department',
    subGroupTe: 'అడ్వర్టైజింగ్ విభాగం (Advertising Department)',
    subGroupEn: 'Advertising Department',
    titleTe: 'గవర్నమెంట్ & DAVP / I&PR టెండర్ యాడ్ కోఆర్డినేటర్ (Govt & DAVP Ad Desk)',
    titleEn: 'Government & DAVP / DIPR Tender Ad Coordinator',
    dutyTe: 'కేంద్ర (CBC/DAVP) & రాష్ట్ర సమాచార పౌరసంబంధాల శాఖ (I&PR) ప్రభుత్వ ప్రకటనలు, టెండర్ నోటిఫికేషన్లు మరియు వోచర్ కాపీల సమన్వయం.',
    dutyEn: 'Handles central (DAVP/CBC) and state (I&PR) government release orders, tenders, and voucher copies.',
    accessTier: 'middle_newsroom_ops',
    isAdditionalPost: true
  },

  // Marketing Department
  {
    code: 'MKTG_CMO',
    divisionId: 'business_ads_mktg_circulation',
    departmentNameTe: 'మార్కెటింగ్ & బ్రాండ్ విభాగం (Marketing)',
    departmentNameEn: 'Marketing & Brand Department',
    subGroupTe: 'మార్కెటింగ్ విభాగం (Marketing Department)',
    subGroupEn: 'Marketing Department',
    titleTe: 'చీఫ్ మార్కెటింగ్ ఆఫీసర్ / మార్కెటింగ్ హెడ్ (CMO / Marketing Head)',
    titleEn: 'Chief Marketing Officer (CMO) / Marketing Head',
    dutyTe: 'సంస్థ బ్రాండ్ విలువను పెంచేందుకు, కొత్త ఎడిషన్ల లాంచ్ మరియు స్పాన్సర్‌షిప్ వ్యూహాలు రచించే అధిపతి.',
    dutyEn: 'Leads brand strategy, readership expansion campaigns, and corporate sponsorships.',
    accessTier: 'senior_dept_head'
  },
  {
    code: 'MKTG_BRAND_PR',
    divisionId: 'business_ads_mktg_circulation',
    departmentNameTe: 'మార్కెటింగ్ & బ్రాండ్ విభాగం (Marketing)',
    departmentNameEn: 'Marketing & Brand Department',
    subGroupTe: 'మార్కెటింగ్ విభాగం (Marketing Department)',
    subGroupEn: 'Marketing Department',
    titleTe: 'బ్రాండ్, PR, ఈవెంట్స్ & మార్కెట్ రీసెర్చ్ మేనేజర్ (Brand, PR & Events Manager)',
    titleEn: 'Brand Manager, PR, Events Coordinator & Market Research Analyst',
    dutyTe: 'సండే మ్యాగజైన్, ప్రత్యేక అనుబంధాలు, ఎడ్యుకేషన్/ప్రాపర్టీ షోలు, PR మరియు IRS రీడర్‌షిప్ సర్వేల విశ్లేషణ.',
    dutyEn: 'Manages special supplements, education/property expos, public relations, and readership analytics.',
    accessTier: 'middle_newsroom_ops'
  },

  // Circulation & Logistics Department
  {
    code: 'CIRC_GM',
    divisionId: 'business_ads_mktg_circulation',
    departmentNameTe: 'సర్క్యులేషన్ & లాజిస్టిక్స్ విభాగం (Circulation)',
    departmentNameEn: 'Circulation & Logistics Department',
    subGroupTe: 'సర్క్యులేషన్ & లాజిస్టిక్స్ (Circulation & Distribution)',
    subGroupEn: 'Circulation & Distribution',
    titleTe: 'సర్క్యులేషన్ హెడ్ / జనరల్ మేనేజర్ (GM - Circulation & State Manager)',
    titleEn: 'Circulation Head / General Manager (GM - Circulation)',
    dutyTe: 'పత్రిక పంపిణీ, ప్రింట్ ఆర్డర్ నిర్ధారణ, ఏజెన్సీ నెట్‌వర్క్ మరియు కాపీల పెరుగుదల మొత్తానికి బాధ్యత వహించే అధిపతి.',
    dutyEn: 'Oversees statewide newspaper distribution, daily print orders, and circulation growth.',
    accessTier: 'senior_dept_head'
  },
  {
    code: 'CIRC_EXEC_LOGISTICS',
    divisionId: 'business_ads_mktg_circulation',
    departmentNameTe: 'సర్క్యులేషన్ & లాజిస్టిక్స్ విభాగం (Circulation)',
    departmentNameEn: 'Circulation & Logistics Department',
    subGroupTe: 'సర్క్యులేషన్ & లాజిస్టిక్స్ (Circulation & Distribution)',
    subGroupEn: 'Circulation & Distribution',
    titleTe: 'జిల్లా సర్క్యులేషన్ ఎగ్జిక్యూటివ్, ట్రాన్స్‌పోర్ట్ & ఏజెన్సీ సూపర్‌వైజర్ (Circulation & Logistics)',
    titleEn: 'District Circulation Executive, Transport Coordinator & Agency Supervisor',
    dutyTe: 'జిల్లా/మండల ఏజెంట్ల ఇండెంట్లు, తెల్లవారుజామున పేపర్ వ్యాన్ల రూట్ మ్యాప్, హాకర్ల పర్యవేక్షణ & ఈ-పేపర్ వార్షిక చందాలు.',
    dutyEn: 'Manages agent copy indents, early-morning dispatch vehicle routes, hawkers, and E-Paper subscriptions.',
    accessTier: 'middle_newsroom_ops'
  },

  // ============================================================================
  // 3. PRINTING, PRODUCTION & TECHNICAL DIVISION
  // ============================================================================
  {
    code: 'PROD_VP',
    divisionId: 'printing_production_epaper',
    departmentNameTe: 'ప్రింటింగ్ & ప్రొడక్షన్ విభాగం (Printing & Production)',
    departmentNameEn: 'Printing & Production Department',
    subGroupTe: 'ప్రింటింగ్ & టెక్నికల్ (Production & Technology)',
    subGroupEn: 'Production & Technology',
    titleTe: 'వైస్ ప్రెసిడెంట్ / GM - ఆపరేషన్స్ (VP / GM - Operations & Production Head)',
    titleEn: 'Vice President / GM - Operations (Production Head)',
    dutyTe: 'అన్ని ప్రింటింగ్ యూనిట్ల నిర్వహణ, న్యూస్ ప్రింట్ (పేపర్ రోల్స్), ఇంక్ కొనుగోలు మరియు నాణ్యతను పర్యవేక్షించే అత్యున్నత అధికారి.',
    dutyEn: 'Heads all printing plants, newsprint reel procurement, ink inventory, and production standards.',
    accessTier: 'top_executive'
  },
  {
    code: 'PROD_PRESS_MGR',
    divisionId: 'printing_production_epaper',
    departmentNameTe: 'ప్రింటింగ్ & ప్రొడక్షన్ విభాగం (Printing & Production)',
    departmentNameEn: 'Printing & Production Department',
    subGroupTe: 'ప్రింటింగ్ & టెక్నికల్ (Production & Technology)',
    subGroupEn: 'Production & Technology',
    titleTe: 'ప్రొడక్షన్ మేనేజర్ / ప్రెస్ మేనేజర్ / షిఫ్ట్ ఇన్‌చార్జ్ (Press / Plant Manager)',
    titleEn: 'Production Manager / Press Manager & Night Shift In-charge',
    dutyTe: 'నిర్దిష్ట ప్రింటింగ్ ప్రెస్ యూనిట్ ఇన్‌చార్జ్; ఫైనల్ ఈ-పేపర్ PDF డౌన్‌లోడ్ చేసుకుని రాత్రి షిఫ్ట్ రోటరీ ప్రింటింగ్ ప్రారంభించే అధికారి.',
    dutyEn: 'Plant in-charge managing night-shift rotary printing schedules, edition cut-offs, and dispatch deadlines.',
    accessTier: 'senior_dept_head'
  },
  {
    code: 'PROD_DTP',
    divisionId: 'printing_production_epaper',
    departmentNameTe: 'ప్రింటింగ్ & ప్రొడక్షన్ విభాగం (Printing & Production)',
    departmentNameEn: 'Printing & Production Department',
    subGroupTe: 'ప్రింటింగ్ & టెక్నికల్ (Production & Technology)',
    subGroupEn: 'Production & Technology',
    titleTe: 'పేజీ లేఅవుట్ డిజైనర్ / DTP ఆపరేటర్ (Page Layout Designer / Quark & InDesign)',
    titleEn: 'Page Layout Designer / DTP Operator (Adobe InDesign / QuarkXPress)',
    dutyTe: 'ఎడిటోరియల్ డెస్క్ నుండి వచ్చిన వార్తలు, ఫోటోలు మరియు ప్రకటనలను వార్తాపత్రిక పేజీలుగా డిజైన్ చేసే నిపుణులు.',
    dutyEn: 'Designs newspaper broadsheet and tabloid pages combining editorial copy, photos, and ad slots.',
    accessTier: 'middle_newsroom_ops'
  },
  {
    code: 'PROD_CTP_ROTARY',
    divisionId: 'printing_production_epaper',
    departmentNameTe: 'ప్రింటింగ్ & ప్రొడక్షన్ విభాగం (Printing & Production)',
    departmentNameEn: 'Printing & Production Department',
    subGroupTe: 'ప్రింటింగ్ & టెక్నికల్ (Production & Technology)',
    subGroupEn: 'Production & Technology',
    titleTe: 'CTP ప్లేట్ మేకర్, రోటరీ మెషీన్ ఆపరేటర్, QC & బండ్లింగ్ స్టాఫ్ (CTP, Rotary & Mailroom)',
    titleEn: 'CTP Plate Technician, Rotary Machine Operator, QC Inspector & Dispatch Crew',
    dutyTe: 'కంప్యూటర్-టు-ప్లేట్ (CTP) తయారీ, రోటరీ వెబ్ ఆఫ్‌సెట్ ప్రింటింగ్ (CMYK), క్వాలిటీ తనిఖీ మరియు ఏజెంట్ వారీగా పేపర్ కట్టల ప్యాకింగ్.',
    dutyEn: 'Operates CTP plate makers, high-speed web offset rotary machines, CMYK quality checks, and bundle strapping.',
    accessTier: 'middle_newsroom_ops'
  },
  {
    code: 'PROD_EPAPER_ENG',
    divisionId: 'printing_production_epaper',
    departmentNameTe: 'ప్రింటింగ్ & ప్రొడక్షన్ విభాగం (Printing & Production)',
    departmentNameEn: 'Printing & Production Department',
    subGroupTe: 'ప్రింటింగ్ & టెక్నికల్ (Production & Technology)',
    subGroupEn: 'Production & Technology',
    titleTe: 'ఈ-పేపర్ PDF & డిజిటల్ ఎడిషన్ పబ్లిషింగ్ ఇంజనీర్ (E-Paper Publishing Engineer)',
    titleEn: 'E-Paper PDF & Digital Edition Publishing Engineer',
    dutyTe: 'ప్రింట్ పేజీలను హై-రిజల్యూషన్ వెబ్ ఈ-పేపర్ PDFలుగా, జూమ్ & ఆర్టికల్ క్లిప్పింగ్స్‌గా మార్చి ఉదయాన్నే ఆన్‌లైన్‌లో పబ్లిష్ చేసే ఇంజనీర్.',
    dutyEn: 'Converts print-ready PDFs into interactive E-Paper editions with smart article clipping and archive indexing.',
    accessTier: 'middle_newsroom_ops',
    isAdditionalPost: true
  },
  {
    code: 'IT_SYSADMIN',
    divisionId: 'printing_production_epaper',
    departmentNameTe: 'ఐటీ, సర్వర్ & నెట్‌వర్క్ విభాగం (IT & Systems)',
    departmentNameEn: 'IT, CMS & Systems Administration',
    subGroupTe: 'ప్రింటింగ్ & టెక్నికల్ (Production & Technology)',
    subGroupEn: 'Production & Technology',
    titleTe: 'ఐటీ / సిస్టమ్స్ అడ్మినిస్ట్రేటర్ (IT / Systems Administrator - Full Access)',
    titleEn: 'IT / Systems Administrator (Root Access & Staff Provisioning)',
    dutyTe: 'కంప్యూటర్ నెట్‌వర్క్, CMS సాఫ్ట్‌వేర్, సర్వర్లు మరియు అన్ని విభాగాల సిబ్బందికి రోల్-బేస్డ్ లాగిన్ ఐడిలు క్రియేట్ చేసే రూట్ అడ్మిన్.',
    dutyEn: 'Manages servers, newsroom network, cybersecurity, and provisions role-based login accounts for all staff.',
    accessTier: 'it_sysadmin'
  },

  // ============================================================================
  // 4. ADMINISTRATION, HR, FINANCE & LEGAL DIVISION
  // ============================================================================
  {
    code: 'ADM_PUBLISHER',
    divisionId: 'admin_hr_finance_legal',
    departmentNameTe: 'మేనేజ్‌మెంట్, హెచ్ఆర్, ఫైనాన్స్ & లీగల్',
    departmentNameEn: 'Corporate Governance, HR, Finance & Legal',
    subGroupTe: 'అడ్మినిస్ట్రేషన్, హెచ్ఆర్, ఫైనాన్స్ & లీగల్',
    subGroupEn: 'Administration, HR, Finance & Legal',
    titleTe: 'పబ్లిషర్ / చైర్మన్ / మేనేజింగ్ డైరెక్టర్ (Publisher / Chairman / MD)',
    titleEn: 'Publisher / Chairman / Managing Director',
    dutyTe: 'RNI చట్టపరమైన ప్రచురణకర్త, సంస్థ యాజమాన్యం మరియు విధాన నిర్ణయాలు తీసుకునే అత్యున్నత అధిపతి.',
    dutyEn: 'Statutory RNI Publisher and Managing Director overseeing corporate governance and group strategy.',
    accessTier: 'top_executive'
  },
  {
    code: 'ADM_HR',
    divisionId: 'admin_hr_finance_legal',
    departmentNameTe: 'మేనేజ్‌మెంట్, హెచ్ఆర్, ఫైనాన్స్ & లీగల్',
    departmentNameEn: 'Corporate Governance, HR, Finance & Legal',
    subGroupTe: 'అడ్మినిస్ట్రేషన్, హెచ్ఆర్, ఫైనాన్స్ & లీగల్',
    subGroupEn: 'Administration, HR, Finance & Legal',
    titleTe: 'హెచ్ఆర్ మేనేజర్ / ఎగ్జిక్యూటివ్ (HR Manager & Press ID Coordinator)',
    titleEn: 'HR Manager / Executive (Recruitment, Press ID Cards & Payroll)',
    dutyTe: 'సిబ్బంది నియామకాలు, అక్రిడిటేషన్ & ప్రెస్ ఐడి కార్డుల జారీ, అటెండెన్స్ మరియు జీతభత్యాలు (Payroll) చూసేవారు.',
    dutyEn: 'Manages journalist recruitment, official Press ID card verification, attendance, and payroll.',
    accessTier: 'top_executive'
  },
  {
    code: 'ADM_FINANCE',
    divisionId: 'admin_hr_finance_legal',
    departmentNameTe: 'మేనేజ్‌మెంట్, హెచ్ఆర్, ఫైనాన్స్ & లీగల్',
    departmentNameEn: 'Corporate Governance, HR, Finance & Legal',
    subGroupTe: 'అడ్మినిస్ట్రేషన్, హెచ్ఆర్, ఫైనాన్స్ & లీగల్',
    subGroupEn: 'Administration, HR, Finance & Legal',
    titleTe: 'ఫైనాన్స్, అకౌంట్స్ & స్ట్రింగర్ గౌరవ వేతన మేనేజర్ (Finance & Lineage Manager)',
    titleEn: 'Finance, Accounts & Stringer Honorarium Manager',
    dutyTe: 'సంస్థ ఆదాయ వ్యయాలు, యాడ్ బిల్లింగ్, GST ఆడిటింగ్ మరియు మండల స్ట్రింగర్ల వార్తల లీనియేజ్ (Lineage) గౌరవ వేతనాల చెల్లింపు.',
    dutyEn: 'Oversees ad revenue accounting, GST compliance, newsprint vendor payments, and stringer honorariums.',
    accessTier: 'top_executive',
    isAdditionalPost: true
  },
  {
    code: 'ADM_LEGAL_RNI',
    divisionId: 'admin_hr_finance_legal',
    departmentNameTe: 'మేనేజ్‌మెంట్, హెచ్ఆర్, ఫైనాన్స్ & లీగల్',
    departmentNameEn: 'Corporate Governance, HR, Finance & Legal',
    subGroupTe: 'అడ్మినిస్ట్రేషన్, హెచ్ఆర్, ఫైనాన్స్ & లీగల్',
    subGroupEn: 'Administration, HR, Finance & Legal',
    titleTe: 'లీగల్ అడ్వైజర్ / RNI & ప్రెస్ కౌన్సిల్ కంప్లయన్స్ ఆఫీసర్ (Legal & RNI Officer)',
    titleEn: 'Legal Advisor / RNI & Press Council of India Compliance Officer',
    dutyTe: 'పరువు నష్టం నోటీసులు, RNI వార్షిక స్టేట్‌మెంట్లు, PRB చట్టం మరియు ప్రెస్ కౌన్సిల్ ఆఫ్ ఇండియా నిబంధనలు చూసే న్యాయ నిపుణులు.',
    dutyEn: 'Manages RNI annual statements, Press Council of India compliance, and defamation/legal vetting.',
    accessTier: 'top_executive',
    isAdditionalPost: true
  }
];

export function createInitialMediaStaff(): MediaStaffMember[] {
  return [
    {
      id: 'staff-eic-1',
      staffCode: 'NB-EIC-001',
      fullName: 'డా. కె. రామచంద్ర మూర్తి (Dr. K. Ramachandra Murthy)',
      mobile: '9848011101',
      username: 'eic_murthy',
      passwordHash: 'Staff@123',
      divisionId: 'editorial_newsroom',
      postCode: 'ED_EIC',
      postTitleTe: 'ఎడిటర్-ఇన్-చీఫ్ / గ్రూప్ ఎడిటర్ (Editor-in-Chief)',
      postTitleEn: 'Editor-in-Chief / Group Editor',
      accessTier: 'top_executive',
      editionOrUnit: 'All India & All State Editions (Central Desk)',
      state: 'Telangana (తెలంగాణ)',
      district: 'Hyderabad (హైదరాబాద్)',
      mandal: 'Khairatabad (ఖైరతాబాద్)',
      aadhaarNumber: '8811 2233 4401',
      aadhaarDocumentUrl: '/images/sample-aadhaar-card.svg',
      photoUrl: '/images/reporter-avatar-1.svg',
      uidaiVerified: true,
      idCardGenerated: true,
      idCardNumber: 'NB-STAFF-ID-001',
      status: 'approved',
      joinedAt: '2024-01-10',
      approvedAt: '2024-01-10'
    },
    {
      id: 'staff-ne-1',
      staffCode: 'NB-NE-102',
      fullName: 'జి. శ్రీనివాస రావు (G. Srinivasa Rao)',
      mobile: '9848011102',
      username: 'ne_srinivas',
      passwordHash: 'Staff@123',
      divisionId: 'editorial_newsroom',
      postCode: 'ED_NE',
      postTitleTe: 'న్యూస్ ఎడిటర్ (News Editor - NE)',
      postTitleEn: 'News Editor (NE)',
      accessTier: 'senior_dept_head',
      editionOrUnit: 'Main Edition & Telangana State Desk',
      state: 'Telangana (తెలంగాణ)',
      district: 'Hyderabad (హైదరాబాద్)',
      mandal: 'Ameerpet (అమీర్‌పేట)',
      aadhaarNumber: '8811 2233 4402',
      aadhaarDocumentUrl: '/images/sample-aadhaar-card.svg',
      photoUrl: '/images/reporter-avatar-1.svg',
      uidaiVerified: true,
      idCardGenerated: true,
      idCardNumber: 'NB-STAFF-ID-102',
      status: 'approved',
      joinedAt: '2024-03-15',
      approvedAt: '2024-03-15'
    },
    {
      id: 'staff-sub-1',
      staffCode: 'NB-SUB-204',
      fullName: 'పి. లక్ష్మీ నారాయణ (P. Lakshmi Narayana)',
      mobile: '9848011103',
      username: 'sub_lakshmi',
      passwordHash: 'Staff@123',
      divisionId: 'editorial_newsroom',
      postCode: 'ED_CSE',
      postTitleTe: 'చీఫ్ సబ్-ఎడిటర్ & ఈ-పేపర్ డెస్క్ (Chief Sub-Editor)',
      postTitleEn: 'Chief Sub-Editor / Senior Sub-Editor',
      accessTier: 'middle_newsroom_ops',
      editionOrUnit: 'Karimnagar & North Telangana E-Paper Desk',
      state: 'Telangana (తెలంగాణ)',
      district: 'Karimnagar (కరీంనగర్)',
      mandal: 'Karimnagar Urban (కరీంనగర్ అర్బన్)',
      aadhaarNumber: '8811 2233 4403',
      aadhaarDocumentUrl: '/images/sample-aadhaar-card.svg',
      photoUrl: '/images/reporter-avatar-1.svg',
      uidaiVerified: true,
      idCardGenerated: true,
      idCardNumber: 'NB-STAFF-ID-204',
      status: 'approved',
      joinedAt: '2024-05-20',
      approvedAt: '2024-05-20'
    },
    {
      id: 'staff-dtp-1',
      staffCode: 'NB-DTP-305',
      fullName: 'ఎం. రాజేష్ కుమార్ (M. Rajesh Kumar)',
      mobile: '9848011104',
      username: 'dtp_rajesh',
      passwordHash: 'Staff@123',
      divisionId: 'printing_production_epaper',
      postCode: 'PROD_DTP',
      postTitleTe: 'పేజీ లేఅవుట్ డిజైనర్ / DTP ఆపరేటర్ (InDesign / Quark)',
      postTitleEn: 'Page Layout Designer / DTP Operator',
      accessTier: 'middle_newsroom_ops',
      editionOrUnit: 'Central E-Paper & Print Layout Studio',
      state: 'Telangana (తెలంగాణ)',
      district: 'Karimnagar (కరీంనగర్)',
      mandal: 'Huzurabad (హుజూరాబాద్)',
      aadhaarNumber: '8811 2233 4404',
      aadhaarDocumentUrl: '/images/sample-aadhaar-card.svg',
      photoUrl: '/images/reporter-avatar-1.svg',
      uidaiVerified: true,
      idCardGenerated: true,
      idCardNumber: 'NB-STAFF-ID-305',
      status: 'approved',
      joinedAt: '2024-06-01',
      approvedAt: '2024-06-01'
    },
    {
      id: 'staff-press-1',
      staffCode: 'NB-PRS-401',
      fullName: 'కె. వెంకటేశ్వర్లు (K. Venkateswarlu)',
      mobile: '9848011105',
      username: 'press_venkat',
      passwordHash: 'Staff@123',
      divisionId: 'printing_production_epaper',
      postCode: 'PROD_PRESS_MGR',
      postTitleTe: 'ప్రొడక్షన్ మేనేజర్ / ప్రెస్ మేనేజర్ (Press / Plant Manager)',
      postTitleEn: 'Production Manager / Press Manager',
      accessTier: 'senior_dept_head',
      editionOrUnit: 'Hyderabad & Karimnagar Rotary Printing Plant',
      state: 'Telangana (తెలంగాణ)',
      district: 'Karimnagar (కరీంనగర్)',
      mandal: 'Karimnagar Urban (కరీంనగర్ అర్బన్)',
      aadhaarNumber: '8811 2233 4405',
      aadhaarDocumentUrl: '/images/sample-aadhaar-card.svg',
      photoUrl: '/images/reporter-avatar-1.svg',
      uidaiVerified: true,
      idCardGenerated: true,
      idCardNumber: 'NB-STAFF-ID-401',
      status: 'approved',
      joinedAt: '2024-04-12',
      approvedAt: '2024-04-12'
    },
    {
      id: 'staff-ad-1',
      staffCode: 'NB-ADV-502',
      fullName: 'ఎస్. అనిత రెడ్డి (S. Anitha Reddy)',
      mobile: '9848011106',
      username: 'ad_anitha',
      passwordHash: 'Staff@123',
      divisionId: 'business_ads_mktg_circulation',
      postCode: 'AD_EXEC',
      postTitleTe: 'స్పేస్ సెల్లింగ్ ఎగ్జిక్యూటివ్ / యాడ్ ఎగ్జిక్యూటివ్ (Ad Executive)',
      postTitleEn: 'Space Selling Executive / Advertising Executive',
      accessTier: 'base_field',
      editionOrUnit: 'Telangana & AP Commercial Ad Desk',
      state: 'Telangana (తెలంగాణ)',
      district: 'Hyderabad (హైదరాబాద్)',
      mandal: 'Secunderabad (సికింద్రాబాద్)',
      aadhaarNumber: '8811 2233 4406',
      aadhaarDocumentUrl: '/images/sample-aadhaar-card.svg',
      photoUrl: '/images/reporter-avatar-1.svg',
      uidaiVerified: true,
      idCardGenerated: true,
      idCardNumber: 'NB-STAFF-ID-502',
      status: 'approved',
      joinedAt: '2024-07-08',
      approvedAt: '2024-07-08'
    },
    {
      id: 'staff-circ-1',
      staffCode: 'NB-CIR-601',
      fullName: 'బి. నర్సింహులు (B. Narsimhulu)',
      mobile: '9848011107',
      username: 'circ_narsimha',
      passwordHash: 'Staff@123',
      divisionId: 'business_ads_mktg_circulation',
      postCode: 'CIRC_GM',
      postTitleTe: 'సర్క్యులేషన్ హెడ్ / జనరల్ మేనేజర్ (GM - Circulation)',
      postTitleEn: 'Circulation Head / General Manager (GM - Circulation)',
      accessTier: 'senior_dept_head',
      editionOrUnit: 'Telangana & AP State Circulation Network',
      state: 'Andhra Pradesh (ఆంధ్రప్రదేశ్)',
      district: 'NTR Vijayawada (ఎన్టీఆర్ విజయవాడ)',
      mandal: 'Vijayawada Central (విజయవాడ సెంట్రల్)',
      aadhaarNumber: '8811 2233 4407',
      aadhaarDocumentUrl: '/images/sample-aadhaar-card.svg',
      photoUrl: '/images/reporter-avatar-1.svg',
      uidaiVerified: true,
      idCardGenerated: true,
      idCardNumber: 'NB-STAFF-ID-601',
      status: 'approved',
      joinedAt: '2024-02-19',
      approvedAt: '2024-02-19'
    },
    {
      id: 'staff-it-1',
      staffCode: 'NB-ITS-999',
      fullName: 'చక్రి రాజు (B. Chakri Raju - IT & Systems Root Admin)',
      mobile: '9848012345',
      username: 'it_chakri',
      passwordHash: 'Staff@123',
      divisionId: 'printing_production_epaper',
      postCode: 'IT_SYSADMIN',
      postTitleTe: 'ఐటీ / సిస్టమ్స్ అడ్మినిస్ట్రేటర్ (IT / Systems Administrator)',
      postTitleEn: 'IT / Systems Administrator (Root Access)',
      accessTier: 'it_sysadmin',
      editionOrUnit: 'Global Server, E-Paper CMS & Staff Provisioning',
      state: 'Telangana (తెలంగాణ)',
      district: 'Hyderabad (హైదరాబాద్)',
      mandal: 'Khairatabad (ఖైరతాబాద్)',
      aadhaarNumber: '8811 2233 4499',
      aadhaarDocumentUrl: '/images/sample-aadhaar-card.svg',
      photoUrl: '/images/reporter-avatar-1.svg',
      uidaiVerified: true,
      idCardGenerated: true,
      idCardNumber: 'NB-STAFF-ID-999',
      status: 'approved',
      joinedAt: '2024-01-01',
      approvedAt: '2024-01-01'
    },
    {
      id: 'staff-pending-1',
      staffCode: 'NB-STF-709',
      fullName: 'టి. రమేష్ గౌడ్ (T. Ramesh Goud - New Sub-Editor Applicant)',
      mobile: '9848099112',
      username: 'sub_ramesh',
      passwordHash: 'Staff@123',
      divisionId: 'editorial_newsroom',
      postCode: 'ED_SUB',
      postTitleTe: 'సబ్-ఎడిటర్ / ట్రైనీ సబ్-ఎడిటర్ (Sub-Editor / Trainee Sub-Editor)',
      postTitleEn: 'Sub-Editor / Trainee Sub-Editor',
      accessTier: 'middle_newsroom_ops',
      editionOrUnit: 'Warangal & Karimnagar E-Paper Desk',
      state: 'Telangana (తెలంగాణ)',
      district: 'Karimnagar (కరీంనగర్)',
      mandal: 'Huzurabad (హుజూరాబాద్)',
      aadhaarNumber: '7412 8529 9631',
      aadhaarDocumentUrl: '/images/sample-aadhaar-card.svg',
      photoUrl: '/images/reporter-avatar-1.svg',
      uidaiVerified: true,
      idCardGenerated: false,
      idCardNumber: 'PENDING-ADMIN-APPROVAL',
      status: 'pending',
      joinedAt: '2026-10-27'
    }
  ];
}

export function createInitialEpaperEditions(): EpaperEditionPage[] {
  return [
    {
      id: 'epage-1',
      editionName: 'మెయిన్ ఎడిషన్ (Main Broadsheet Edition - 16 Pages)',
      pageNumber: 1,
      pageTitleTe: 'పేజీ 1 — ప్రధాన వార్తలు & జాతీయ/రాష్ట్ర పతాక శీర్షికలు (Front Page)',
      pageTitleEn: 'Page 1 — Front Page Lead & Breaking Headlines',
      assignedSubEditor: 'పి. లక్ష్మీ నారాయణ (Chief Sub-Editor)',
      assignedDesigner: 'ఎం. రాజేష్ కుమార్ (DTP InDesign)',
      leadHeadlineTe: 'గ్రామీణ మౌలిక వసతుల కల్పనకు కేంద్ర-రాష్ట్ర ప్రభుత్వాల భారీ కార్యాచరణ',
      adSlotsBooked: 2,
      status: 'edition_locked',
      ctpPlateReady: true,
      printCopiesOrder: 85000,
      updatedAt: 'Today, 03:45 AM',
      updatedByRole: 'News Editor (NE)'
    },
    {
      id: 'epage-2',
      editionName: 'కరీంనగర్ & హుజూరాబాద్ జిల్లా టాబ్లాయిడ్ (District Pullout)',
      pageNumber: 2,
      pageTitleTe: 'పేజీ 2 — జిల్లా & మండల ప్రత్యేక సంచిక (District & Mandal Pullout)',
      pageTitleEn: 'Page 2 — District & Mandal Special Tabloid',
      assignedSubEditor: 'పి. లక్ష్మీ నారాయణ (Chief Sub-Editor)',
      assignedDesigner: 'ఎం. రాజేష్ కుమార్ (DTP InDesign)',
      leadHeadlineTe: 'హుజూరాబాద్ మండలంలో ధాన్యం కొనుగోలు కేంద్రాల ప్రారంభం — రైతులకు మద్దతు ధర',
      adSlotsBooked: 4,
      status: 'page_designed',
      ctpPlateReady: true,
      printCopiesOrder: 32500,
      updatedAt: 'Today, 04:10 AM',
      updatedByRole: 'Page Layout Designer (DTP)'
    },
    {
      id: 'epage-3',
      editionName: 'వాణిజ్య & క్లాసిఫైడ్స్ అనుబంధం (Business & Classifieds)',
      pageNumber: 3,
      pageTitleTe: 'పేజీ 3 — వ్యాపార, రియల్ ఎస్టేట్ & క్లాసిఫైడ్ ప్రకటనల పేజీ',
      pageTitleEn: 'Page 3 — Commercial Display Ads & Classifieds Pullout',
      assignedSubEditor: 'పి. లక్ష్మీ నారాయణ (Chief Sub-Editor)',
      assignedDesigner: 'ఎం. రాజేష్ కుమార్ (DTP InDesign)',
      leadHeadlineTe: 'నేటి భారతం క్లాసిఫైడ్స్ & వాణిజ్య ప్రకటనల ప్రత్యేక పేజీ',
      adSlotsBooked: 9,
      status: 'sub_edited',
      ctpPlateReady: false,
      printCopiesOrder: 85000,
      updatedAt: 'Today, 04:20 AM',
      updatedByRole: 'Chief Sub-Editor'
    }
  ];
}
