import {
  INITIAL_INDIA_LOCATIONS,
  IndiaLocationHierarchy,
  TELANGANA_OFFICIAL_DIRECTORY_PDF,
  ANDHRA_PRADESH_OFFICIAL_DIRECTORY_PDF
} from './india-locations';
import {
  MediaStaffMember,
  EpaperEditionPage,
  MediaDivisionId,
  MediaAccessTier,
  MEDIA_POSTS_CATALOG,
  MEDIA_DIVISIONS,
  ACCESS_TIER_CATALOG,
  createInitialMediaStaff,
  createInitialEpaperEditions,
  validateUidaiAadhaarNumber
} from './media-organization';

export {
  MEDIA_POSTS_CATALOG,
  MEDIA_DIVISIONS,
  ACCESS_TIER_CATALOG,
  createInitialMediaStaff,
  createInitialEpaperEditions,
  validateUidaiAadhaarNumber,
  TELANGANA_OFFICIAL_DIRECTORY_PDF,
  ANDHRA_PRADESH_OFFICIAL_DIRECTORY_PDF
};
export type { MediaStaffMember, EpaperEditionPage, MediaDivisionId, MediaAccessTier };

export type NewsLevel = 'national' | 'state' | 'district' | 'mandal';

export interface MultilingualText {
  te: string;
  hi: string;
  en: string;
}

export interface NewsArticle {
  id: string;
  level: NewsLevel;
  category: string;
  state: string;
  district: string;
  mandal: string;
  title: MultilingualText;
  summary: MultilingualText;
  content: MultilingualText;
  imageUrl: string;
  youtubeUrl?: string;
  authorName: string;
  reporterId?: string;
  publishedAt: string;
  views: number;
  isBreaking?: boolean;
}

export interface ReporterProfile {
  id: string;
  reporterCode: string;
  fullName: string;
  mobile: string;
  username: string;
  passwordHash: string;
  state: string;
  district: string;
  mandal: string;
  aadhaarNumber: string;
  aadhaarDocumentUrl: string;
  photoUrl: string;
  status: 'pending' | 'approved' | 'blocked';
  idCardGenerated: boolean;
  idCardNumber: string;
  registeredAt: string;
  approvedAt?: string;
}

export type AdScope = 'home' | 'state' | 'district' | 'mandal';
export type AdFormat = 'banner' | 'classified';

export const PRIVATE_AD_CATEGORIES: readonly string[] = [
  'వస్త్ర & జ్యువెలరీ (Textiles & Jewellery)',
  'రియల్ ఎస్టేట్ & ప్లాట్లు (Real Estate, Open Plots & Housing)',
  'వ్యవసాయం & ఆటోమొబైల్స్ (Agriculture & Tractors)',
  'వైద్యం & ఆరోగ్యం (Hospitals & Healthcare)',
  'విద్య & శిక్షణ (Education & Coaching)',
  'ఉద్యోగాలు & కెరీర్ (Jobs & Recruitment Classifieds)',
  'వ్యాపార & వాణిజ్య ప్రకటనలు (Business, Showrooms & Offers)',
  'వివాహ & శుభకార్యాలు (Matrimonial, Greetings & Events)',
  'హోటల్స్, రెస్టారెంట్లు & ట్రావెల్స్ (Hotels, Catering & Travels)',
  'ఇతర క్లాసిఫైడ్స్ & టెండర్లు (General Classifieds, Legal & Tenders)'
] as const;

export interface PrivateAd {
  id: string;
  title: string;
  matter: string;
  imageUrl: string;
  category: string;
  adFormat: AdFormat;
  scope: AdScope;
  state: string;
  district: string;
  mandal: string;
  advertiserName: string;
  contactPhone: string;
  submittedByReporterId?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface YoutubeUpdate {
  id: string;
  title: MultilingualText;
  channelUrl: string;
  videoUrl: string;
  thumbnailUrl: string;
  publishedAt: string;
  views: number;
  locationTag: string;
}

export interface UserFeedback {
  id: string;
  readerName: string;
  mobileOrEmail: string;
  location: string;
  rating: number;
  message: string;
  createdAt: string;
}

export interface GoogleAdSenseConfig {
  publisherId: string;
  adSlotId: string;
  adsenseScriptUrl: string;
  dashboardLink: string;
  enabledInAdminPreview: boolean;
  showOnHomepage: false;
  updatedAt: string;
}

export interface SiteConfig {
  logoUrl: string;
  bannerUrl: string;
  showBannerImage: boolean;
  brandTitleTe: string;
  brandTitleHi: string;
  brandTitleEn: string;
  mastheadTagline: string;
  mastheadHeading: string;
  mastheadSubtitle: string;
  customTickerAnnouncement: string;
  officialYoutubeChannel: string;
  playStoreAppUrl: string;
  contactPhone: string;
  contactEmail: string;
  officeAddress: string;
  footerCopyright: string;
}

export interface PortalState {
  logoUrl: string;
  bannerUrl: string;
  officialYoutubeChannel: string;
  siteConfig: SiteConfig;
  locations: IndiaLocationHierarchy;
  articles: NewsArticle[];
  reporters: ReporterProfile[];
  privateAds: PrivateAd[];
  youtubeUpdates: YoutubeUpdate[];
  feedbackList: UserFeedback[];
  adsenseConfig: GoogleAdSenseConfig;
  mediaStaff: MediaStaffMember[];
  epaperEditions: EpaperEditionPage[];
  notifications: {
    id: string;
    title: MultilingualText;
    timestamp: string;
    level: NewsLevel;
  }[];
}

export const ADMIN_USERNAME = 'Admin';
export const ADMIN_PASSWORD = 'Bchakriraju1992@';
export const OFFICIAL_YOUTUBE_CHANNEL = 'https://www.youtube.com/channel/UCyfLbWdu0fNqEJdH7Ldi4Fg';
export const OFFICIAL_BANNER_IMAGE = '/assets/aistudio/neti_bharatham.png_49db37a4.jpg';

export function verifyAdminLogin(username: string, password: string): boolean {
  return username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export function createInitialPortalState(): PortalState {
  const initialSiteConfig: SiteConfig = {
    logoUrl: OFFICIAL_BANNER_IMAGE,
    bannerUrl: OFFICIAL_BANNER_IMAGE,
    showBannerImage: true,
    brandTitleTe: 'నేటి భారతం',
    brandTitleHi: 'नेटी भारतम',
    brandTitleEn: 'NETI BHARATAM',
    mastheadTagline: 'భారతదేశ సమగ్ర డిజిటల్ దినపత్రిక · 24x7 లైవ్ అప్‌డేట్స్ · ఏది నిజం',
    mastheadHeading: 'నేటి భారతం · नेटी भारतम · NETI BHARATAM',
    mastheadSubtitle:
      'నిజాన్ని నిర్భయంగా చెప్పడమే మా లక్ష్యం · జ్ఞానాన్ని పెంచే విద్య ఉపాధి చూపే విద్య · ఫ్రీ విద్య ఫ్రీ వైద్యం దేశ అభివృద్ధికి నాంది',
    customTickerAnnouncement:
      'నేటి భారతం (Neti Bharatam): నిజాన్ని నిర్భయంగా చెప్పడమే మా లక్ష్యం — జాతీయ, రాష్ట్ర, జిల్లా మరియు మండల స్థాయి 24x7 వార్తా అప్‌డేట్స్',
    officialYoutubeChannel: OFFICIAL_YOUTUBE_CHANNEL,
    playStoreAppUrl: 'https://play.google.com/store/apps/details?id=in.netibharatam.news',
    contactPhone: '+91 98480 12345',
    contactEmail: 'editor@netibharatam.in',
    officeAddress: 'నేటి భారతం ప్రధాన కార్యాలయం, హైదరాబాద్ & న్యూఢిల్లీ, భారతదేశం',
    footerCopyright:
      '© 2026 నేటి భారతం (Neti Bharatam) — Multilingual Indian News Network. All Rights Reserved.'
  };

  return {
    logoUrl: OFFICIAL_BANNER_IMAGE,
    bannerUrl: OFFICIAL_BANNER_IMAGE,
    officialYoutubeChannel: OFFICIAL_YOUTUBE_CHANNEL,
    siteConfig: initialSiteConfig,
    locations: structuredClone(INITIAL_INDIA_LOCATIONS),
    articles: [
      {
        id: 'art-nat-1',
        level: 'national',
        category: 'జాతీయ విధానాలు · National Policy',
        state: 'Delhi NCR (ఢిల్లీ / दिल्ली)',
        district: 'New Delhi (న్యూఢిల్లీ)',
        mandal: 'Parliament Street (పార్లమెంట్ స్ట్రీట్)',
        title: {
          te: 'గ్రామీణ భారత్ డిజిటల్ మౌలిక సదుపాయాల కోసం కేంద్రం ₹1.25 లక్షల కోట్ల ప్రత్యేక ప్యాకేజీ ప్రకటన',
          hi: 'ग्रामीण भारत डिजिटल बुनियादी ढांचे के लिए केंद्र ने ₹1.25 लाख करोड़ के विशेष पैकेज की घोषणा की',
          en: 'Centre Announces ₹1.25 Lakh Crore Special Package for Rural Bharat Digital & Mandal Infrastructure'
        },
        summary: {
          te: 'దేశంలోని అన్ని రాష్ట్రాలు, జిల్లాలు మరియు మండల కేంద్రాలకు హై-స్పీడ్ ఫైబర్ నెట్‌వర్క్, రైతు సేవా కేంద్రాలు మరియు ఆధునిక రోడ్ల అనుసంధానం.',
          hi: 'देश के सभी राज्यों, जिलों और मंडल केंद्रों में हाई-स्पीड फाइबर नेटवर्क, किसान सेवा केंद्र और आधुनिक सड़क संपर्क का विस्तार।',
          en: 'High-speed optical fiber network, digital Rythu Seva centers, and all-weather road connectivity across every Mandal headquarters in India.'
        },
        content: {
          te: 'న్యూఢిల్లీ: భారతదేశంలోని ప్రతి మండల కేంద్రాన్ని డిజిటల్ మరియు వ్యవసాయ వాణిజ్య హబ్‌గా తీర్చిదిద్దేందుకు కేంద్ర క్యాబినెట్ కీలక నిర్ణయం తీసుకుంది. రాబోయే ఆర్థిక సంవత్సరంలో ₹1.25 లక్షల కోట్ల వ్యయంతో ప్రతి మండలంలో ఆధునిక కోల్డ్ స్టోరేజీలు, ఈ-గవర్నెన్స్ కేంద్రాలు మరియు టెలి-మెడిసిన్ సేవలను అందుబాటులోకి తీసుకురానున్నట్లు అధికారిక ప్రకటనలో తెలిపారు. ఈ పథకం ద్వారా గ్రామీణ యువతకు స్థానికంగానే ఉపాధి అవకాశాలు లభిస్తాయని నిపుణులు విశ్లేషిస్తున్నారు.',
          hi: 'नई दिल्ली: भारत के प्रत्येक मंडल और तहसील केंद्र को डिजिटल और कृषि व्यापार हब बनाने के लिए केंद्रीय मंत्रिमंडल ने महत्वपूर्ण निर्णय लिया है। ₹1.25 लाख करोड़ की लागत से प्रत्येक मंडल में आधुनिक कोल्ड स्टोरेज, ई-गवर्नेंस केंद्र और टेली-मेडिसिन सेवाएं उपलब्ध कराई जाएंगी।',
          en: 'New Delhi: In a landmark structural reform aimed at grass-roots empowerment, the Union Cabinet approved ₹1.25 Lakh Crore for direct Mandal-level infrastructure modernization. Every Mandal headquarters will receive integrated agro-processing units, digital citizen kiosks, and upgraded primary healthcare telemetry.'
        },
        imageUrl: '/images/national-parliament.svg',
        youtubeUrl: OFFICIAL_YOUTUBE_CHANNEL,
        authorName: 'నేటి భారతం నేషనల్ బ్యూరో (National Desk)',
        publishedAt: '2026-10-23 08:30 IST',
        views: 14820,
        isBreaking: true
      },
      {
        id: 'art-state-1',
        level: 'state',
        category: 'సాగునీరు & వ్యవసాయం · Irrigation',
        state: 'Telangana (తెలంగాణ)',
        district: 'Karimnagar (కరీంనగర్)',
        mandal: 'Huzurabad (హుజూరాబాద్)',
        title: {
          te: 'తెలంగాణ వ్యాప్తంగా యాసంగి సాగుకు ప్రాజెక్టుల నుండి పూర్తిస్థాయిలో సాగునీటి విడుదల',
          hi: 'तेलंगाना भर में रबी फसल के लिए प्रमुख सिंचाई परियोजनाओं से पानी छोड़ा गया',
          en: 'Telangana Releases Full-Capacity Irrigation Water Across Major Reservoirs for Yasangi Crop Season'
        },
        summary: {
          te: 'ఉమ్మడి కరీంనగర్, వరంగల్, నల్లగొండ మరియు నిజామాబాద్ జిల్లాల్లోని అన్ని మండలాల ఆయకట్టు రైతులకు వారబందీ విధానంలో నీటి సరఫరా.',
          hi: 'करीमनगर, वारंगल, नलगोंडा और निजामाबाद जिलों के सभी मंडलों के किसानों को सिंचाई जल की आपूर्ति शुरू।',
          en: 'Farmers across Karimnagar, Warangal, Nalgonda, and Nizamabad mandals receive scheduled canal releases covering 42 lakh acres.'
        },
        content: {
          te: 'హైదరాబాద్ / కరీంనగర్: రాష్ట్రంలోని ప్రధాన జలాశయాలు నిండుకుండలా తొణికిసలాడుతుండటంతో రైతాంగానికి సాగునీటి ఇబ్బందులు లేకుండా ప్రభుత్వం కార్యాచరణ చేపట్టింది. ప్రతి మండలంలోని చివరి ఆయకట్టు వరకు కాలువల ద్వారా నీరు చేరేలా ఇంజనీరింగ్ అధికారులు పర్యవేక్షిస్తున్నారు. ధాన్యం కొనుగోలు కేంద్రాలను కూడా మండలాల వారీగా ముందస్తుగానే సిద్ధం చేస్తున్నారు.',
          hi: 'हैदराबाद / करीमनगर: राज्य के प्रमुख जलाशयों में पर्याप्त जल स्तर होने के कारण सरकार ने किसानों के लिए सिंचाई कार्ययोजना लागू की है। प्रत्येक मंडल के अंतिम छोर तक नहरों के माध्यम से पानी पहुंचाया जा रहा है।',
          en: 'Hyderabad / Karimnagar: With major reservoirs reaching full storage capacity, the State Irrigation Department initiated scheduled canal releases to support 42 lakh acres of paddy and commercial crops across all rural mandals.'
        },
        imageUrl: '/images/telangana-irrigation.svg',
        youtubeUrl: OFFICIAL_YOUTUBE_CHANNEL,
        authorName: 'స్టేట్ స్పెషల్ బ్యూరో (State Desk)',
        publishedAt: '2026-10-23 07:45 IST',
        views: 9340,
        isBreaking: true
      },
      {
        id: 'art-state-2',
        level: 'state',
        category: 'పరిశ్రమలు & ఉపాధి · Infrastructure',
        state: 'Andhra Pradesh (ఆంధ్రప్రదేశ్)',
        district: 'NTR Vijayawada (ఎన్టీఆర్ విజయవాడ)',
        mandal: 'Vijayawada Central (విజయవాడ సెంట్రల్)',
        title: {
          te: 'ఆంధ్రప్రదేశ్‌లో జిల్లా మరియు మండల కేంద్రాలను కలుపుతూ కొత్త గ్రీన్‌ఫీల్డ్ ఎక్స్‌ప్రెస్ హైవేల నిర్మాణం',
          hi: 'आंध्र प्रदेश में जिला और मंडल केंद्रों को जोड़ने वाले नए ग्रीनफील्ड एक्सप्रेस हाईवे का निर्माण',
          en: 'Andhra Pradesh Fast-Tracks Greenfield Express Highways Linking District & Mandal Industrial Corridors'
        },
        summary: {
          te: 'విజయవాడ, గుంటూరు, విశాఖపట్నం మరియు తిరుపతి రీజియన్లలో పారిశ్రామిక కారిడార్ల విస్తరణతో 2 లక్షల కొత్త ఉద్యోగాలు.',
          hi: 'विजयवाड़ा, गुंटूर, विशाखापत्तनम और तिरुपति क्षेत्रों में औद्योगिक गलियारों के विस्तार से 2 लाख नए रोजगार।',
          en: 'Industrial logistics corridors connecting Vijayawada, Guntur, Visakhapatnam, and Tirupati mandals projected to create 2 lakh jobs.'
        },
        content: {
          te: 'విజయవాడ: రాష్ట్ర ఆర్థికాభివృద్ధిలో కీలకమైన రవాణా మరియు లాజిస్టిక్స్ రంగాన్ని బలోపేతం చేసేందుకు ప్రభుత్వం కొత్త గ్రీన్‌ఫీల్డ్ రహదారులకు ఆమోదం తెలిపింది. పోర్టులను నేరుగా జిల్లా మరియు మండల ఉత్పత్తి కేంద్రాలతో అనుసంధానించడం ద్వారా రైతులు మరియు చిన్న తరహా పరిశ్రమల ఉత్పత్తులకు అంతర్జాతీయ మార్కెట్ సదుపాయం లభించనుంది.',
          hi: 'विजयवाड़ा: राज्य के आर्थिक विकास में महत्वपूर्ण परिवहन और लॉजिस्टिक्स क्षेत्र को मजबूत करने के लिए सरकार ने नए ग्रीनफील्ड राजमार्गों को मंजूरी दी है।',
          en: 'Vijayawada: Strengthening coastal and hinterland logistics, the state government cleared phase-two arterial highways directly connecting rural Mandal agro-clusters to deep-water ports.'
        },
        imageUrl: '/images/district-collectorate.svg',
        authorName: 'ఎ.పి. స్టేట్ బ్యూరో (AP Desk)',
        publishedAt: '2026-10-23 06:50 IST',
        views: 7615,
        isBreaking: true
      },
      {
        id: 'art-dist-1',
        level: 'district',
        category: 'జిల్లా పరిపాలన · Collectorate',
        state: 'Telangana (తెలంగాణ)',
        district: 'Warangal (వరంగల్)',
        mandal: 'Narsampet (నర్సంపేట)',
        title: {
          te: 'వరంగల్ జిల్లా కలెక్టరేట్‌లో ప్రజావాణికి విశేష స్పందన: భూ రికార్డులు, పెన్షన్ సమస్యలకు తక్షణ పరిష్కారం',
          hi: 'वारंगल जिला कलेक्ट्रेट में प्रजावाणी को भारी प्रतिसाद: भूमि रिकॉर्ड और पेंशन समस्याओं का तत्काल समाधान',
          en: 'Warangal District Collectorate Prajavani Resolves 340+ Land Record & Pension Petitions On The Spot'
        },
        summary: {
          te: 'జిల్లాలోని అన్ని మండలాల తాసిల్దార్లు మరియు ఎంపీడీవోలతో వీడియో కాన్ఫరెన్స్ నిర్వహించిన జిల్లా కలెక్టర్; 7 రోజుల్లో అర్జీల పరిష్కారానికి ఆదేశం.',
          hi: 'जिला कलेक्टर ने सभी मंडलों के तहसीलदारों के साथ वीडियो कॉन्फ्रेंस की; 7 दिनों में याचिकाओं के समाधान का निर्देश।',
          en: 'District Collector holds real-time video conference with all Mandal Tahsildars and MPDOs, mandating 7-day turnaround on citizen petitions.'
        },
        content: {
          te: 'వరంగల్: ప్రజల సమస్యలను వారున్న మండల స్థాయిలోనే పరిష్కరించాలని వరంగల్ జిల్లా కలెక్టర్ అధికారులను ఆదేశించారు. సోమవారం జరిగిన ప్రజావాణి కార్యక్రమంలో వివిధ మండలాల నుండి వచ్చిన 340కి పైగా దరఖాస్తులను పరిశీలించి, ఆన్‌లైన్ డ్యాష్‌బోర్డు ద్వారా సంబంధిత మండల అధికారులకు తక్షణ ఆదేశాలు జారీ చేశారు.',
          hi: 'वारंगल: जिला कलेक्टर ने अधिकारियों को निर्देश दिया कि जनता की समस्याओं का समाधान मंडल स्तर पर ही किया जाए। प्रजावाणी कार्यक्रम में 340 से अधिक आवेदनों की समीक्षा की गई।',
          en: 'Warangal: Emphasizing transparent governance at the Mandal level, the Warangal District Collector reviewed 340 citizen petitions and issued direct digital directives to Mandal Revenue Officers.'
        },
        imageUrl: '/images/district-collectorate.svg',
        authorName: 'వరంగల్ జిల్లా స్టాఫ్ రిపోర్టర్',
        publishedAt: '2026-10-22 19:20 IST',
        views: 5490,
        isBreaking: false
      },
      {
        id: 'art-mandal-1',
        level: 'mandal',
        category: 'మండల ప్రత్యేక వార్త · Mandal Exclusive',
        state: 'Telangana (తెలంగాణ)',
        district: 'Karimnagar (కరీంనగర్)',
        mandal: 'Huzurabad (హుజూరాబాద్)',
        title: {
          te: 'హుజూరాబాద్ మండల పరిషత్ కార్యాలయంలో ఘనంగా గ్రామ సభ: ప్రతి వార్డుకు LED వీధి దీపాలు మరియు సీసీ రోడ్ల మంజూరు',
          hi: 'हुजूराबाद मंडल परिषद कार्यालय में ग्राम सभा आयोजित: प्रत्येक वार्ड के लिए एलईडी स्ट्रीट लाइट और सीसी रोड मंजूर',
          en: 'Huzurabad Mandal Parishad Approves ₹4.8 Cr CC Roads, Solar LED Streetlights & Drinking Water Grid'
        },
        summary: {
          te: 'హుజూరాబాద్ మండలంలోని అన్ని గ్రామ పంచాయతీల్లో మౌలిక వసతుల కల్పనకు ₹4.80 కోట్ల నిధులు విడుదల; పనులను ప్రారంభించిన మండల అధికారులు.',
          hi: 'हुजूराबाद मंडल की सभी ग्राम पंचायतों में बुनियादी सुविधाओं के लिए ₹4.80 करोड़ जारी; मंडल अधिकारियों ने शुरू किया काम।',
          en: 'Mandal Praja Parishad sanctions ₹4.80 Crore for internal CC roads, overhead water tanks, and digital library facilities in Huzurabad Mandal.'
        },
        content: {
          te: 'హుజూరాబాద్ (మండల వార్త): కరీంనగర్ జిల్లా హుజూరాబాద్ మండల ప్రజా పరిషత్ కార్యాలయంలో నిర్వహించిన ప్రత్యేక సర్వసభ్య సమావేశంలో మండల అభివృద్ధికి కీలక తీర్మానాలు చేశారు. మండలంలోని అన్ని గ్రామాల్లో నూతన సీసీ రోడ్లు, డ్రైనేజీ వ్యవస్థ, మరియు రైతు వేదికల ఆధునీకరణకు ₹4.80 కోట్ల నిధులను ఏకగ్రీవంగా ఆమోదించారు. ఈ కార్యక్రమంలో స్థానిక ప్రజాప్రతినిధులు, ఎంపీడీవో, తాసిల్దార్ మరియు గ్రామస్తులు పెద్ద సంఖ్యలో పాల్గొన్నారు.',
          hi: 'हुजूराबाद (मंडल समाचार): करीमनगर जिले के हुजूराबाद मंडल प्रजा परिषद कार्यालय में आयोजित विशेष बैठक में मंडल के विकास के लिए ₹4.80 करोड़ के कार्यों को मंजूरी दी गई।',
          en: 'Huzurabad (Mandal Desk): In a special general body session at the Huzurabad Mandal Praja Parishad office, officials sanctioned ₹4.80 Crore for CC roads, drainage modernization, and Rythu Vedika upgrades across all villages in the mandal.'
        },
        imageUrl: '/images/mandal-praja-parishad.svg',
        authorName: 'కె. వెంకట రమణ రావు (హుజూరాబాద్ మండల రిపోర్టర్)',
        reporterId: 'rep-approved-1',
        publishedAt: '2026-10-23 09:00 IST',
        views: 6825,
        isBreaking: true
      },
      {
        id: 'art-mandal-2',
        level: 'mandal',
        category: 'మండల వార్తలు · Mandal Desk',
        state: 'Andhra Pradesh (ఆంధ్రప్రదేశ్)',
        district: 'Guntur (గుంటూరు)',
        mandal: 'Mangalagiri (మంగళగిరి)',
        title: {
          te: 'మంగళగిరి మండలంలో చేనేత కార్మికులకు ఆధునిక మగ్గాలు మరియు 50% సబ్సిడీతో నూలు పంపిణీ',
          hi: 'मंगलगिरी मंडल में हथकरघा बुनकरों को आधुनिक करघे और 50% सब्सिडी पर सूत का वितरण',
          en: 'Mangalagiri Mandal Launches Handloom Weaver Modernization Drive with 50% Yarn Subsidy & E-Commerce Hub'
        },
        summary: {
          te: 'మంగళగిరి చేనేత వస్త్రాలకు జాతీయ, అంతర్జాతీయ స్థాయిలో ఆన్‌లైన్ మార్కెటింగ్ కల్పించేందుకు మండల కేంద్రంలో డిజిటల్ డిజైన్ స్టూడియో ఏర్పాటు.',
          hi: 'मंगलगिरी हथकरघा वस्त्रों को राष्ट्रीय और अंतर्राष्ट्रीय स्तर पर ऑनलाइन मार्केटिंग दिलाने के लिए मंडल केंद्र में डिजिटल स्टूडियो स्थापित।',
          en: 'Digital jacquard design studio and direct e-commerce export facilitation center inaugurated at Mangalagiri Mandal headquarters.'
        },
        content: {
          te: 'మంగళగిరి (గుంటూరు జిల్లా): ప్రపంచ ప్రసిద్ధి చెందిన మంగళగిరి చేనేత రంగాన్ని మరింత ప్రోత్సహించేందుకు మండల స్థాయిలో ప్రత్యేక డిజిటల్ డిజైన్ మరియు మార్కెటింగ్ కేంద్రాన్ని ప్రారంభించారు. అర్హులైన ప్రతి చేనేత కుటుంబానికి 50 శాతం సబ్సిడీపై నాణ్యమైన నూలు, రంగులు మరియు ఆధునిక మగ్గాల పరికరాలను అందజేస్తున్నట్లు అధికారులు తెలిపారు.',
          hi: 'मंगलगिरी (गुंटूर जिला): विश्व प्रसिद्ध मंगलगिरी हथकरघा क्षेत्र को प्रोत्साहित करने के लिए मंडल स्तर पर विशेष डिजिटल डिजाइन और विपणन केंद्र शुरू किया गया है।',
          en: 'Mangalagiri (Guntur District): Supporting over 4,500 weaver families, the Mandal administration inaugurated a modern jacquard design center and 50% raw silk/cotton yarn subsidy scheme.'
        },
        imageUrl: '/images/mandal-praja-parishad.svg',
        authorName: 'మంగళగిరి మండల డెస్క్',
        publishedAt: '2026-10-22 17:10 IST',
        views: 4290,
        isBreaking: false
      }
    ],
    reporters: [
      {
        id: 'rep-approved-1',
        reporterCode: 'NB-REP-2026-101',
        fullName: 'K. Venkata Ramana Rao (కె. వెంకట రమణ రావు)',
        mobile: '9848054321',
        username: 'ramana_huzurabad',
        passwordHash: 'Reporter@123',
        state: 'Telangana (తెలంగాణ)',
        district: 'Karimnagar (కరీంనగర్)',
        mandal: 'Huzurabad (హుజూరాబాద్)',
        aadhaarNumber: '8492 5103 7741',
        aadhaarDocumentUrl: '/images/sample-aadhaar-card.svg',
        photoUrl: '/images/reporter-avatar-1.svg',
        status: 'approved',
        idCardGenerated: true,
        idCardNumber: 'NB-PRESS-TS-101',
        registeredAt: '2026-10-15 10:15 IST',
        approvedAt: '2026-10-15 14:30 IST'
      },
      {
        id: 'rep-pending-1',
        reporterCode: 'NB-REP-2026-102',
        fullName: 'M. Srinivas Goud (ఎం. శ్రీనివాస్ గౌడ్)',
        mobile: '9440198765',
        username: 'srinivas_mangalagiri',
        passwordHash: 'Srinivas@123',
        state: 'Andhra Pradesh (ఆంధ్రప్రదేశ్)',
        district: 'Guntur (గుంటూరు)',
        mandal: 'Mangalagiri (మంగళగిరి)',
        aadhaarNumber: '6621 9044 3182',
        aadhaarDocumentUrl: '/images/sample-aadhaar-card.svg',
        photoUrl: '/images/reporter-avatar-1.svg',
        status: 'pending',
        idCardGenerated: false,
        idCardNumber: 'PENDING-APPROVAL',
        registeredAt: '2026-10-23 08:10 IST'
      }
    ],
    privateAds: [
      {
        id: 'ad-home-1',
        title: 'భారత్ గోల్డ్ & డైమండ్స్ - ఆల్ ఇండియా గ్రాండ్ జ్యువెలరీ ఎక్స్‌పో (Home Page Special)',
        matter: 'హోమ్ పేజీ ప్రత్యేక ప్రకటన: తరుగు (Wastage) కేవలం 4.9% మాత్రమే! BIS 916 హాల్‌మార్క్ బంగారు ఆభరణాలు మరియు సర్టిఫైడ్ డైమండ్ కలెక్షన్స్ అన్ని ప్రధాన శాఖలలో లభించును.',
        imageUrl: '/images/ad-bharat-gold.svg',
        category: 'వస్త్ర & జ్యువెలరీ (Textiles & Jewellery)',
        adFormat: 'banner',
        scope: 'home',
        state: 'Telangana (తెలంగాణ)',
        district: 'Hyderabad (హైదరాబాద్)',
        mandal: 'Secunderabad (సికింద్రాబాద్)',
        advertiserName: 'Bharat Gold & Diamonds Group',
        contactPhone: '1800-889-9000',
        status: 'approved',
        createdAt: '2026-10-23 07:00 IST'
      },
      {
        id: 'ad-1',
        title: 'శ్రీ లక్ష్మీ వెంకటేశ్వర సిల్క్స్ & జ్యువెలర్స్ - పండుగ మెగా ఆఫర్ (Mandal Ad)',
        matter: 'కంచి పట్టు, ధర్మవరం, గద్వాల్, మంగళగిరి పట్టు చీరలపై 30% ప్రత్యేక తగ్గింపు! ప్రతి కొనుగోలుపై వెండి నాణెం ఉచితం. వివాహ వేడుకలకు ప్రత్యేక హోల్‌సేల్ ధరలు.',
        imageUrl: '/images/ad-kanchipuram-silks.svg',
        category: 'వస్త్ర & జ్యువెలరీ (Textiles & Jewellery)',
        adFormat: 'banner',
        scope: 'mandal',
        state: 'Telangana (తెలంగాణ)',
        district: 'Karimnagar (కరీంనగర్)',
        mandal: 'Huzurabad (హుజూరాబాద్)',
        advertiserName: 'Sri Lakshmi Venkateswara Silks',
        contactPhone: '98480 12345',
        status: 'approved',
        createdAt: '2026-10-21 11:00 IST'
      },
      {
        id: 'ad-2',
        title: 'రైతు మిత్ర ట్రాక్టర్స్ & ఆగ్రో ఏజెన్సీస్ - సబ్సిడీ మేళా (District Ad)',
        matter: 'అన్ని రకాల ఆధునిక ట్రాక్టర్లు, రోటావేటర్లు, డ్రిప్ ఇరిగేషన్ పరికరాలు మరియు సబ్సిడీ విత్తనాలు లభించును. 0% వడ్డీతో తక్షణ బ్యాంకు రుణ సదుపాయం కలదు.',
        imageUrl: '/images/ad-agri-tractors.svg',
        category: 'వ్యవసాయం & ఆటోమొబైల్స్ (Agriculture & Tractors)',
        adFormat: 'banner',
        scope: 'district',
        state: 'Telangana (తెలంగాణ)',
        district: 'Karimnagar (కరీంనగర్)',
        mandal: 'Huzurabad (హుజూరాబాద్)',
        advertiserName: 'Rythu Mithra Agro Agencies',
        contactPhone: '94401 67890',
        status: 'approved',
        createdAt: '2026-10-22 09:30 IST'
      },
      {
        id: 'ad-3',
        title: 'సంజీవని మల్టీ స్పెషాలిటీ హాస్పిటల్ - 24/7 అత్యవసర సేవలు (State Ad)',
        matter: 'ఆరోగ్యశ్రీ మరియు అన్ని ఇన్సూరెన్స్ కార్డులు అంగీకరించబడును. కార్డియాలజీ, ఆర్థోపెడిక్స్, గైనకాలజీ మరియు పిల్లల వైద్య విభాగాలు. ప్రతి ఆదివారం ఉచిత వైద్య శిబిరం.',
        imageUrl: '/images/ad-hospital-care.svg',
        category: 'వైద్యం & ఆరోగ్యం (Hospitals & Healthcare)',
        adFormat: 'banner',
        scope: 'state',
        state: 'Andhra Pradesh (ఆంధ్రప్రదేశ్)',
        district: 'Guntur (గుంటూరు)',
        mandal: 'Mangalagiri (మంగళగిరి)',
        advertiserName: 'Sanjeevani Multi-Specialty Hospital',
        contactPhone: '1800-425-9999',
        status: 'approved',
        createdAt: '2026-10-22 15:45 IST'
      },
      {
        id: 'ad-classified-1',
        title: 'DTCP & RERA అప్రూవ్డ్ ఓపెన్ ప్లాట్లు అమ్మకానికి కలవు — జాతీయ రహదారి సమీపంలో',
        matter: '40 అడుగుల బీటీ రోడ్లు, అండర్ గ్రౌండ్ డ్రైనేజీ, 24 గంటల వాటర్ & ఎలక్ట్రిసిటీ సదుపాయం. గజం ₹8,500 మాత్రమే. 70% బ్యాంకు లోన్ సదుపాయం కలదు.',
        imageUrl: '/images/mandal-praja-parishad.svg',
        category: 'రియల్ ఎస్టేట్ & ప్లాట్లు (Real Estate, Open Plots & Housing)',
        adFormat: 'classified',
        scope: 'district',
        state: 'Telangana (తెలంగాణ)',
        district: 'Karimnagar (కరీంనగర్)',
        mandal: 'Huzurabad (హుజూరాబాద్)',
        advertiserName: 'Suvarna Bhoomi Infra Developers',
        contactPhone: '90001 44556',
        status: 'approved',
        createdAt: '2026-10-23 09:10 IST'
      },
      {
        id: 'ad-classified-2',
        title: 'అర్జంట్ రిక్రూట్‌మెంట్: మండల మరియు జిల్లా స్థాయిలో మార్కెటింగ్ ఎగ్జిక్యూటివ్‌లు & అకౌంటెంట్లు కావలెను',
        matter: 'డిగ్రీ / ఇంటర్ పాసైన అభ్యర్థులకు ఆకర్షణీయమైన జీతం (₹18,000 - ₹28,000) + TA/DA + ఇన్సెంటివ్స్. వెంటనే మీ బయోడేటాతో సంప్రదించండి.',
        imageUrl: '/images/district-collectorate.svg',
        category: 'ఉద్యోగాలు & కెరీర్ (Jobs & Recruitment Classifieds)',
        adFormat: 'classified',
        scope: 'home',
        state: 'Telangana (తెలంగాణ)',
        district: 'Hyderabad (హైదరాబాద్)',
        mandal: 'Secunderabad (సికింద్రాబాద్)',
        advertiserName: 'Pragathi Enterprise HR Solutions',
        contactPhone: '91234 56789',
        status: 'approved',
        createdAt: '2026-10-23 10:05 IST'
      },
      {
        id: 'ad-classified-3',
        title: 'శుభమస్తు మ్యారేజ్ బ్యూరో & కన్వెన్షన్ హాల్ — అన్ని కులాల వధూవరుల సమాచారం',
        matter: 'ఉన్నత విద్యావంతులు, ప్రభుత్వ/ప్రైవేట్ ఉద్యోగులు, సాఫ్ట్‌వేర్ ఇంజనీర్లు మరియు వ్యాపారస్తుల వివాహ సంబంధాలు. AC ఫంక్షన్ హాల్ బుకింగ్‌పై 20% రాయితీ.',
        imageUrl: '/images/ad-kanchipuram-silks.svg',
        category: 'వివాహ & శుభకార్యాలు (Matrimonial, Greetings & Events)',
        adFormat: 'classified',
        scope: 'mandal',
        state: 'Andhra Pradesh (ఆంధ్రప్రదేశ్)',
        district: 'Guntur (గుంటూరు)',
        mandal: 'Mangalagiri (మంగళగిరి)',
        advertiserName: 'Shubhamastu Matrimony & Conventions',
        contactPhone: '98855 22334',
        status: 'approved',
        createdAt: '2026-10-23 10:30 IST'
      },
      {
        id: 'ad-pending-1',
        title: 'నవ్య డిజిటల్ కంప్యూటర్ అకాడమీ - కొత్త బ్యాచ్ అడ్మిషన్లు',
        matter: 'పైథాన్, ఫుల్ స్టాక్ డెవలప్‌మెంట్, టాలీ ప్రైమ్ మరియు డిజిటల్ మార్కెటింగ్ కోర్సులలో శిక్షణ & ప్లేస్‌మెంట్ గ్యారెంటీ.',
        imageUrl: '/images/ad-kanchipuram-silks.svg',
        category: 'విద్య & శిక్షణ (Education & Coaching)',
        adFormat: 'classified',
        scope: 'mandal',
        state: 'Telangana (తెలంగాణ)',
        district: 'Warangal (వరంగల్)',
        mandal: 'Narsampet (నర్సంపేట)',
        advertiserName: 'Navya Digital Academy',
        contactPhone: '99887 76655',
        status: 'pending',
        createdAt: '2026-10-23 08:40 IST'
      }
    ],
    youtubeUpdates: [
      {
        id: 'yt-1',
        title: {
          te: 'నేటి భారతం స్పెషల్ బులెటిన్: జాతీయ మరియు రాష్ట్ర స్థాయి ముఖ్యాంశాలు (Live Updates)',
          hi: 'नेटी भारतम विशेष बुलेटिन: राष्ट्रीय और राज्य स्तरीय मुख्य समाचार',
          en: 'Neti Bharatam Prime Bulletin: National, State & Mandal Ground Reports'
        },
        channelUrl: OFFICIAL_YOUTUBE_CHANNEL,
        videoUrl: OFFICIAL_YOUTUBE_CHANNEL,
        thumbnailUrl: '/images/national-parliament.svg',
        publishedAt: '15 నిమిషాల క్రితం · 15 mins ago',
        views: 19450,
        locationTag: 'National & All States'
      },
      {
        id: 'yt-2',
        title: {
          te: 'మండల స్థాయి ప్రజా సమస్యలపై నేటి భారతం గ్రౌండ్ రిపోర్ట్ - ప్రత్యేక చర్చా కార్యక్రమం',
          hi: 'मंडल स्तरीय जन समस्याओं पर नेटी भारतम ग्राउंड रिपोर्ट - विशेष चर्चा',
          en: 'Mandal Ground Reality: Irrigation, Roads & Rythu Vedika Special Coverage'
        },
        channelUrl: OFFICIAL_YOUTUBE_CHANNEL,
        videoUrl: OFFICIAL_YOUTUBE_CHANNEL,
        thumbnailUrl: '/images/telangana-irrigation.svg',
        publishedAt: '1 గంట క్రితం · 1 hour ago',
        views: 11280,
        locationTag: 'Telangana & AP Mandals'
      },
      {
        id: 'yt-3',
        title: {
          te: 'జిల్లా కలెక్టరేట్ ప్రజావాణి మరియు గ్రామ సభల ప్రత్యక్ష ప్రసార విశేషాలు',
          hi: 'जिला कलेक्ट्रेट प्रजावाणी और ग्राम सभाओं का सीधा प्रसारण',
          en: 'District Collectorate Prajavani & Grama Sabha Live Highlights'
        },
        channelUrl: OFFICIAL_YOUTUBE_CHANNEL,
        videoUrl: OFFICIAL_YOUTUBE_CHANNEL,
        thumbnailUrl: '/images/mandal-praja-parishad.svg',
        publishedAt: '3 గంటల క్రితం · 3 hours ago',
        views: 8740,
        locationTag: 'District & Mandal Bureau'
      }
    ],
    feedbackList: [
      {
        id: 'fb-1',
        readerName: 'డా. పి. రాజేశ్వర్ రావు (Dr. P. Rajeshwar Rao)',
        mobileOrEmail: '98490 11223',
        location: 'Huzurabad (హుజూరాబాద్), Karimnagar',
        rating: 5,
        message: 'మా మండల వార్తలు, గ్రామ సభ వివరాలు వెంటనే తెలుగు, హిందీ, ఇంగ్లీష్ భాషల్లో రావడం చాలా బాగుంది. నేటి భారతం బృందానికి అభినందనలు!',
        createdAt: '2026-10-23 07:30 IST'
      },
      {
        id: 'fb-2',
        readerName: 'Smt. Anitha Devi',
        mobileOrEmail: 'anitha.guntur@example.com',
        location: 'Mangalagiri (మంగళగిరి), Guntur',
        rating: 5,
        message: 'Mandal-wise page filter makes it very easy to track local government schemes and local business ads in our area.',
        createdAt: '2026-10-22 20:15 IST'
      }
    ],
    adsenseConfig: {
      publisherId: 'ca-pub-9823749102837491',
      adSlotId: '7482910384',
      adsenseScriptUrl: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
      dashboardLink: 'https://www.google.com/adsense/new/u/0/pub-9823749102837491/home',
      enabledInAdminPreview: true,
      showOnHomepage: false,
      updatedAt: '2026-10-23 08:00 IST'
    },
    notifications: [
      {
        id: 'notif-1',
        title: {
          te: 'గ్రామీణ భారత్ డిజిటల్ మౌలిక సదుపాయాల కోసం ₹1.25 లక్షల కోట్ల ప్యాకేజీ ప్రకటన',
          hi: 'ग्रामीण भारत डिजिटल बुनियादी ढांचे के लिए ₹1.25 लाख करोड़ का पैकेज',
          en: 'Centre Announces ₹1.25 Lakh Cr Rural & Mandal Infrastructure Package'
        },
        timestamp: 'Just now',
        level: 'national'
      },
      {
        id: 'notif-2',
        title: {
          te: 'హుజూరాబాద్ మండలంలో ₹4.80 కోట్లతో సీసీ రోడ్లు మరియు తాగునీటి పనులకు ఆమోదం',
          hi: 'हुजूराबाद मंडल में ₹4.80 करोड़ के सीसी रोड और पेयजल कार्यों को मंजूरी',
          en: 'Huzurabad Mandal Parishad Approves ₹4.80 Cr CC Roads & Water Grid'
        },
        timestamp: '12 mins ago',
        level: 'mandal'
      }
    ],
    mediaStaff: createInitialMediaStaff(),
    epaperEditions: createInitialEpaperEditions()
  };
}

export interface RegisterReporterInput {
  fullName: string;
  mobile: string;
  username: string;
  password: string;
  state: string;
  district: string;
  mandal: string;
  aadhaarNumber: string;
  aadhaarDocumentUrl: string;
  photoUrl: string;
}

export function registerReporter(
  state: PortalState,
  input: RegisterReporterInput
): { nextState: PortalState; reporter: ReporterProfile } {
  if (
    !input.fullName.trim() ||
    !input.mobile.trim() ||
    !input.username.trim() ||
    !input.password.trim() ||
    !input.state.trim() ||
    !input.district.trim() ||
    !input.mandal.trim() ||
    !input.aadhaarNumber.trim() ||
    !input.photoUrl.trim() ||
    !input.aadhaarDocumentUrl.trim()
  ) {
    throw new Error('All reporter registration fields including Photo, Mandal, and Aadhaar are required.');
  }

  const existing = state.reporters.find(
    (r) => r.username.toLowerCase() === input.username.trim().toLowerCase()
  );
  if (existing) {
    throw new Error('Username is already registered. Please choose another username.');
  }

  const seq = 101 + state.reporters.length;
  const newReporter: ReporterProfile = {
    id: `rep-${Date.now()}-${seq}`,
    reporterCode: `NB-REP-2026-${seq}`,
    fullName: input.fullName.trim(),
    mobile: input.mobile.trim(),
    username: input.username.trim(),
    passwordHash: input.password,
    state: input.state,
    district: input.district,
    mandal: input.mandal,
    aadhaarNumber: input.aadhaarNumber.trim(),
    aadhaarDocumentUrl: input.aadhaarDocumentUrl,
    photoUrl: input.photoUrl,
    status: 'pending',
    idCardGenerated: false,
    idCardNumber: 'PENDING-APPROVAL',
    registeredAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
  };

  return {
    nextState: {
      ...state,
      reporters: [newReporter, ...state.reporters]
    },
    reporter: newReporter
  };
}

export function approveReporter(
  state: PortalState,
  reporterId: string
): { nextState: PortalState; reporter: ReporterProfile } {
  const target = state.reporters.find((r) => r.id === reporterId);
  if (!target) {
    throw new Error('Reporter not found');
  }

  const seqCode = target.reporterCode.split('-').pop() || '109';
  const updatedReporter: ReporterProfile = {
    ...target,
    status: 'approved',
    idCardGenerated: Boolean(target.photoUrl),
    idCardNumber: `NB-PRESS-ID-${seqCode}`,
    approvedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
  };

  return {
    nextState: {
      ...state,
      reporters: state.reporters.map((r) => (r.id === reporterId ? updatedReporter : r))
    },
    reporter: updatedReporter
  };
}

export function updateReporterPassword(
  state: PortalState,
  reporterId: string,
  newPassword: string
): { nextState: PortalState; reporter: ReporterProfile } {
  const cleanPassword = newPassword.trim();
  if (!cleanPassword) {
    throw new Error('New password cannot be empty.');
  }
  const target = state.reporters.find((r) => r.id === reporterId);
  if (!target) {
    throw new Error('Reporter not found');
  }
  const updatedReporter: ReporterProfile = {
    ...target,
    passwordHash: cleanPassword
  };
  return {
    nextState: {
      ...state,
      reporters: state.reporters.map((r) => (r.id === reporterId ? updatedReporter : r))
    },
    reporter: updatedReporter
  };
}

export function setReporterBlockStatus(
  state: PortalState,
  reporterId: string,
  blocked: boolean
): { nextState: PortalState; reporter: ReporterProfile } {
  const target = state.reporters.find((r) => r.id === reporterId);
  if (!target) {
    throw new Error('Reporter not found');
  }
  const seqCode = target.reporterCode.split('-').pop() || '109';
  const updatedReporter: ReporterProfile = {
    ...target,
    status: blocked ? 'blocked' : 'approved',
    idCardGenerated: !blocked && Boolean(target.photoUrl),
    idCardNumber: blocked ? 'BLOCKED-BY-ADMIN' : `NB-PRESS-ID-${seqCode}`
  };
  return {
    nextState: {
      ...state,
      reporters: state.reporters.map((r) => (r.id === reporterId ? updatedReporter : r))
    },
    reporter: updatedReporter
  };
}

export interface PublishReporterNewsInput {
  titleTe: string;
  summaryTe: string;
  contentTe: string;
  titleHi?: string;
  titleEn?: string;
  category: string;
  imageUrl: string;
  youtubeUrl?: string;
  attemptedMandalOverride?: string;
}

export function publishReporterNews(
  state: PortalState,
  reporterId: string,
  input: PublishReporterNewsInput
): { nextState: PortalState; article: NewsArticle } {
  const reporter = state.reporters.find((r) => r.id === reporterId);
  if (!reporter) {
    throw new Error('Reporter account not found.');
  }
  if (reporter.status === 'blocked') {
    throw new Error('Your reporter account has been blocked by Admin.');
  }
  if (reporter.status !== 'approved') {
    throw new Error('Admin approval is mandatory before a reporter can upload news.');
  }
  if (!input.titleTe.trim() || !input.contentTe.trim()) {
    throw new Error('News headline and detailed report are required.');
  }

  const titleText = input.titleTe.trim();
  const summaryText = input.summaryTe.trim() || titleText;
  const contentText = input.contentTe.trim();

  // Strictly enforce that the news item is published into the reporter's registered State, District, and Mandal
  const article: NewsArticle = {
    id: `art-mandal-${Date.now()}`,
    level: 'mandal',
    category: input.category || 'మండల వార్తలు · Mandal Desk',
    state: reporter.state,
    district: reporter.district,
    mandal: reporter.mandal,
    title: {
      te: titleText,
      hi: input.titleHi?.trim() || `${reporter.mandal}: ${titleText}`,
      en: input.titleEn?.trim() || `${reporter.mandal}: ${titleText}`
    },
    summary: {
      te: summaryText,
      hi: summaryText,
      en: summaryText
    },
    content: {
      te: contentText,
      hi: contentText,
      en: contentText
    },
    imageUrl: input.imageUrl || '/images/mandal-praja-parishad.svg',
    youtubeUrl: input.youtubeUrl || undefined,
    authorName: `${reporter.fullName} (${reporter.mandal} రిపోర్టర్)`,
    reporterId: reporter.id,
    publishedAt: 'ఇప్పుడే · Just now',
    views: 1,
    isBreaking: true
  };

  return {
    nextState: {
      ...state,
      articles: [article, ...state.articles],
      notifications: [
        {
          id: `notif-${Date.now()}`,
          title: article.title,
          timestamp: 'Just now',
          level: 'mandal'
        },
        ...state.notifications
      ]
    },
    article
  };
}

export interface SubmitPrivateAdInput {
  title: string;
  matter: string;
  imageUrl: string;
  category: string;
  adFormat?: AdFormat;
  scope: AdScope;
  state: string;
  district: string;
  mandal: string;
  advertiserName: string;
  contactPhone: string;
  submittedByReporterId?: string;
  autoApprove?: boolean;
}

export function submitPrivateAd(
  state: PortalState,
  input: SubmitPrivateAdInput
): { nextState: PortalState; ad: PrivateAd } {
  if (!input.title.trim() || !input.matter.trim() || !input.imageUrl.trim() || !input.contactPhone.trim()) {
    throw new Error('Private Ad requires title, text matter, advertisement image, and contact phone.');
  }

  const ad: PrivateAd = {
    id: `ad-${Date.now()}`,
    title: input.title.trim(),
    matter: input.matter.trim(),
    imageUrl: input.imageUrl.trim(),
    category: input.category || PRIVATE_AD_CATEGORIES[0],
    adFormat: input.adFormat || 'banner',
    scope: input.scope,
    state: input.state,
    district: input.district,
    mandal: input.mandal,
    advertiserName: input.advertiserName.trim() || 'Advertiser',
    contactPhone: input.contactPhone.trim(),
    submittedByReporterId: input.submittedByReporterId,
    status: input.autoApprove ? 'approved' : 'pending',
    createdAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
  };

  return {
    nextState: {
      ...state,
      privateAds: [ad, ...state.privateAds]
    },
    ad
  };
}

export function approvePrivateAd(
  state: PortalState,
  adId: string
): { nextState: PortalState; ad: PrivateAd } {
  const target = state.privateAds.find((a) => a.id === adId);
  if (!target) {
    throw new Error('Private Ad not found');
  }
  const approvedAd: PrivateAd = {
    ...target,
    status: 'approved'
  };
  return {
    nextState: {
      ...state,
      privateAds: state.privateAds.map((a) => (a.id === adId ? approvedAd : a))
    },
    ad: approvedAd
  };
}

export function incrementArticleViews(
  state: PortalState,
  articleId: string
): { nextState: PortalState; views: number } {
  let updatedViews = 0;
  const nextArticles = state.articles.map((art) => {
    if (art.id === articleId) {
      updatedViews = art.views + 1;
      return { ...art, views: updatedViews };
    }
    return art;
  });

  if (updatedViews === 0) {
    throw new Error('Article not found');
  }

  return {
    nextState: {
      ...state,
      articles: nextArticles
    },
    views: updatedViews
  };
}

export function addLocationHierarchyNode(
  state: PortalState,
  stateName: string,
  districtName: string,
  mandalName: string
): PortalState {
  const cleanState = stateName.trim();
  const cleanDistrict = districtName.trim();
  const cleanMandal = mandalName.trim();

  if (!cleanState || !cleanDistrict || !cleanMandal) {
    throw new Error('State, District, and Mandal names are required.');
  }

  const nextLocations = structuredClone(state.locations);
  if (!nextLocations[cleanState]) {
    nextLocations[cleanState] = {};
  }
  if (!nextLocations[cleanState][cleanDistrict]) {
    nextLocations[cleanState][cleanDistrict] = [];
  }
  if (!nextLocations[cleanState][cleanDistrict].includes(cleanMandal)) {
    nextLocations[cleanState][cleanDistrict].push(cleanMandal);
  }

  return {
    ...state,
    locations: nextLocations
  };
}

export interface NewsFilterCriteria {
  level?: 'all' | NewsLevel;
  state?: string;
  district?: string;
  mandal?: string;
  searchQuery?: string;
}

export function filterPublicNews(
  state: PortalState,
  criteria: NewsFilterCriteria
): NewsArticle[] {
  return state.articles.filter((article) => {
    if (criteria.level && criteria.level !== 'all' && article.level !== criteria.level) {
      return false;
    }
    if (criteria.state && criteria.state !== 'ALL' && article.state !== criteria.state) {
      return false;
    }
    if (criteria.district && criteria.district !== 'ALL' && article.district !== criteria.district) {
      return false;
    }
    if (criteria.mandal && criteria.mandal !== 'ALL' && article.mandal !== criteria.mandal) {
      return false;
    }
    if (criteria.searchQuery && criteria.searchQuery.trim() !== '') {
      const q = criteria.searchQuery.trim().toLowerCase();
      const hay = [
        article.title.te,
        article.title.hi,
        article.title.en,
        article.summary.te,
        article.summary.hi,
        article.summary.en,
        article.state,
        article.district,
        article.mandal,
        article.category,
        article.authorName
      ]
        .join(' ')
        .toLowerCase();
      if (!hay.includes(q)) {
        return false;
      }
    }
    return true;
  });
}

export interface AdFilterCriteria {
  state?: string;
  district?: string;
  mandal?: string;
  category?: string;
  scope?: 'all' | AdScope;
  adFormat?: 'all' | AdFormat;
}

export function filterPublicPrivateAds(
  state: PortalState,
  criteria: AdFilterCriteria
): PrivateAd[] {
  return state.privateAds.filter((ad) => {
    // Mandatory Admin Approval for all public Private Ads
    if (ad.status !== 'approved') {
      return false;
    }
    const format: AdFormat = ad.adFormat || 'banner';
    if (criteria.adFormat && criteria.adFormat !== 'all' && format !== criteria.adFormat) {
      return false;
    }
    if (criteria.scope && criteria.scope !== 'all' && ad.scope !== criteria.scope) {
      return false;
    }
    if (criteria.category && criteria.category !== 'ALL' && ad.category !== criteria.category) {
      return false;
    }
    // Home Page ads ('home') are portal-wide unless specifically filtering by State/District/Mandal scope
    if (ad.scope === 'home' && (!criteria.scope || criteria.scope === 'all' || criteria.scope === 'home')) {
      return true;
    }
    if (criteria.state && criteria.state !== 'ALL' && ad.state !== criteria.state) {
      return false;
    }
    if (criteria.district && criteria.district !== 'ALL' && ad.district !== criteria.district) {
      return false;
    }
    if (criteria.mandal && criteria.mandal !== 'ALL' && ad.mandal !== criteria.mandal) {
      return false;
    }
    return true;
  });
}

export function updateSiteConfig(
  state: PortalState,
  updates: Partial<SiteConfig>
): PortalState {
  const mergedConfig: SiteConfig = {
    ...(state.siteConfig || createInitialPortalState().siteConfig),
    ...updates
  };
  return {
    ...state,
    logoUrl: mergedConfig.logoUrl || state.logoUrl,
    bannerUrl: mergedConfig.bannerUrl || state.bannerUrl,
    officialYoutubeChannel:
      mergedConfig.officialYoutubeChannel || state.officialYoutubeChannel,
    siteConfig: mergedConfig
  };
}

export function deleteNewsArticle(state: PortalState, articleId: string): PortalState {
  return {
    ...state,
    articles: state.articles.filter((a) => a.id !== articleId)
  };
}

export function updateNewsArticle(
  state: PortalState,
  articleId: string,
  updates: {
    titleTe?: string;
    titleHi?: string;
    titleEn?: string;
    summaryTe?: string;
    contentTe?: string;
    category?: string;
    imageUrl?: string;
    youtubeUrl?: string;
  }
): PortalState {
  return {
    ...state,
    articles: state.articles.map((art) => {
      if (art.id !== articleId) return art;
      const nextTitleTe = updates.titleTe !== undefined ? updates.titleTe : art.title.te;
      const nextSummaryTe = updates.summaryTe !== undefined ? updates.summaryTe : art.summary.te;
      const nextContentTe = updates.contentTe !== undefined ? updates.contentTe : art.content.te;
      return {
        ...art,
        category: updates.category !== undefined ? updates.category : art.category,
        imageUrl: updates.imageUrl !== undefined ? updates.imageUrl : art.imageUrl,
        youtubeUrl: updates.youtubeUrl !== undefined ? updates.youtubeUrl : art.youtubeUrl,
        title: {
          te: nextTitleTe,
          hi: updates.titleHi !== undefined ? updates.titleHi : art.title.hi,
          en: updates.titleEn !== undefined ? updates.titleEn : art.title.en
        },
        summary: {
          te: nextSummaryTe,
          hi: art.summary.hi,
          en: art.summary.en
        },
        content: {
          te: nextContentTe,
          hi: art.content.hi,
          en: art.content.en
        }
      };
    })
  };
}

export function deletePrivateAd(state: PortalState, adId: string): PortalState {
  return {
    ...state,
    privateAds: state.privateAds.filter((a) => a.id !== adId)
  };
}

export function updatePrivateAd(
  state: PortalState,
  adId: string,
  updates: Partial<PrivateAd>
): PortalState {
  return {
    ...state,
    privateAds: state.privateAds.map((a) => (a.id === adId ? { ...a, ...updates } : a))
  };
}

export function addYoutubeUpdate(
  state: PortalState,
  input: {
    titleTe: string;
    titleHi?: string;
    titleEn?: string;
    videoUrl?: string;
    channelUrl?: string;
    thumbnailUrl?: string;
    locationTag?: string;
  }
): PortalState {
  const resolvedUrl =
    (input.videoUrl || input.channelUrl || '').trim() ||
    state.officialYoutubeChannel ||
    OFFICIAL_YOUTUBE_CHANNEL;
  const newVideo: YoutubeUpdate = {
    id: `yt-${Date.now()}`,
    title: {
      te: input.titleTe.trim(),
      hi: (input.titleHi || input.titleTe).trim(),
      en: (input.titleEn || input.titleTe).trim()
    },
    channelUrl: resolvedUrl,
    videoUrl: resolvedUrl,
    thumbnailUrl: input.thumbnailUrl || OFFICIAL_BANNER_IMAGE,
    publishedAt: 'ఇప్పుడే · Just now',
    views: 1,
    locationTag: input.locationTag || 'National & All States'
  };
  return {
    ...state,
    youtubeUpdates: [newVideo, ...state.youtubeUpdates]
  };
}

export function deleteYoutubeUpdate(state: PortalState, youtubeId: string): PortalState {
  return {
    ...state,
    youtubeUpdates: state.youtubeUpdates.filter((y) => y.id !== youtubeId)
  };
}

export function deleteReporter(state: PortalState, reporterId: string): PortalState {
  return {
    ...state,
    reporters: state.reporters.filter((r) => r.id !== reporterId)
  };
}

export interface RegisterMediaStaffInput {
  fullName: string;
  mobile: string;
  username: string;
  password: string;
  postCode: string;
  editionOrUnit: string;
  state: string;
  district: string;
  mandal: string;
  aadhaarNumber: string;
  aadhaarDocumentUrl?: string;
  photoUrl?: string;
  uidaiConsent?: boolean;
  autoApprove?: boolean;
}

export function registerMediaStaff(
  state: PortalState,
  input: RegisterMediaStaffInput
): { nextState: PortalState; staff: MediaStaffMember } {
  const currentList = state.mediaStaff || createInitialMediaStaff();
  if (
    !input.fullName?.trim() ||
    !input.mobile?.trim() ||
    !input.username?.trim() ||
    !input.password?.trim() ||
    !input.postCode?.trim()
  ) {
    throw new Error('Full Name, Mobile, Login ID, Password, and Position are required.');
  }

  const uidaiCheck = validateUidaiAadhaarNumber(input.aadhaarNumber || '');
  if (!uidaiCheck.valid) {
    throw new Error(
      uidaiCheck.errorTe || 'UIDAI ఆధార్ నంబర్ 12 అంకెల ఫార్మాట్‌లో ఉండాలి (2-9 తో ప్రారంభం కావాలి).'
    );
  }

  const resolvedPhotoUrl = (input.photoUrl || '/images/reporter-avatar-1.svg').trim();
  const resolvedAadhaarDocUrl = (
    input.aadhaarDocumentUrl || '/images/sample-aadhaar-card.svg'
  ).trim();
  if (!resolvedPhotoUrl || !resolvedAadhaarDocUrl) {
    throw new Error('Employee Passport Photo and UIDAI Aadhaar Card Document are required.');
  }

  if (input.uidaiConsent === false) {
    throw new Error('UIDAI ఆధార్ ధృవీకరణ సమ్మతి (UIDAI Verification Consent) తప్పనిసరి.');
  }

  const existing = currentList.find(
    (s) => s.username.toLowerCase() === input.username.trim().toLowerCase()
  );
  if (existing) {
    throw new Error('Staff username is already registered. Please choose another Login ID.');
  }

  const postDef =
    MEDIA_POSTS_CATALOG.find((p) => p.code === input.postCode) || MEDIA_POSTS_CATALOG[0];
  const seq = 701 + currentList.length;
  // Mandatory Admin Approval after Staff Registration Form submission
  const today = new Date().toISOString().slice(0, 10);

  const newStaff: MediaStaffMember = {
    id: `staff-${Date.now()}-${seq}`,
    staffCode: `NB-STF-${seq}`,
    fullName: input.fullName.trim(),
    mobile: input.mobile.trim(),
    username: input.username.trim(),
    passwordHash: input.password.trim(),
    divisionId: postDef.divisionId,
    postCode: postDef.code,
    postTitleTe: postDef.titleTe,
    postTitleEn: postDef.titleEn,
    accessTier: postDef.accessTier,
    editionOrUnit: input.editionOrUnit?.trim() || 'Hyderabad Central Desk',
    state: input.state || 'Telangana (తెలంగాణ)',
    district: input.district || 'Hyderabad (హైదరాబాద్)',
    mandal: input.mandal || 'Khairatabad (ఖైరతాబాద్)',
    aadhaarNumber: uidaiCheck.formatted,
    aadhaarDocumentUrl: resolvedAadhaarDocUrl,
    photoUrl: resolvedPhotoUrl,
    uidaiVerified: true,
    idCardGenerated: false,
    idCardNumber: 'PENDING-ADMIN-APPROVAL',
    status: 'pending',
    joinedAt: today
  };

  return {
    nextState: {
      ...state,
      mediaStaff: [newStaff, ...currentList]
    },
    staff: newStaff
  };
}

export function approveMediaStaff(
  state: PortalState,
  staffId: string
): { nextState: PortalState; staff: MediaStaffMember } {
  const currentList = state.mediaStaff || createInitialMediaStaff();
  const target = currentList.find((s) => s.id === staffId);
  if (!target) {
    throw new Error('Media staff member not found');
  }
  const seqCode = target.staffCode.split('-').pop() || '701';
  const updated: MediaStaffMember = {
    ...target,
    status: 'approved',
    uidaiVerified: true,
    idCardGenerated: true,
    idCardNumber: `NB-STAFF-ID-${seqCode}`,
    approvedAt: new Date().toISOString().slice(0, 10)
  };
  return {
    nextState: {
      ...state,
      mediaStaff: currentList.map((s) => (s.id === staffId ? updated : s))
    },
    staff: updated
  };
}

export function authenticateMediaStaffLogin(
  state: PortalState,
  credentials: {
    postCode: string;
    username: string;
    password: string;
  }
): MediaStaffMember {
  const currentList = state.mediaStaff || createInitialMediaStaff();
  const cleanUser = String(credentials.username || '').trim().toLowerCase();
  const cleanPass = String(credentials.password || '');
  const cleanPost = String(credentials.postCode || '').trim();

  if (!cleanPost || !cleanUser || !cleanPass) {
    throw new Error('దయచేసి హోదా (Position), లాగిన్ ఐడి (Login ID) మరియు పాస్‌వర్డ్ ఎంటర్ చేయండి.');
  }

  const matchedUser = currentList.find(
    (s) => s.username.toLowerCase() === cleanUser && s.passwordHash === cleanPass
  );

  if (!matchedUser) {
    throw new Error('తప్పు లాగిన్ ఐడి లేదా పాస్‌వర్డ్! (Invalid Login ID or Password)');
  }

  if (matchedUser.postCode !== cleanPost) {
    throw new Error(
      `మీ లాగిన్ ఐడి "${matchedUser.postTitleTe}" హోదాకు రిజిస్టర్ అయి ఉంది. దయచేసి డ్రాప్‌డౌన్‌లో సరైన హోదా (Position) ఎంచుకోండి.`
    );
  }

  if (matchedUser.status === 'blocked') {
    throw new Error('మీ ఉద్యోగి ఖాతా అడ్మిన్ ద్వారా బ్లాక్ చేయబడింది (Account Blocked by Admin).');
  }

  if (matchedUser.status !== 'approved') {
    throw new Error(
      'మీ రిజిస్ట్రేషన్ & UIDAI ఆధార్ వివరాలు నమోదయ్యాయి కానీ అడ్మిన్ ఆమోదం (Admin Approval) పెండింగ్‌లో ఉంది! అడ్మిన్ ఆమోదించిన తర్వాతే లాగిన్ యాక్సెస్ లభిస్తుంది.'
    );
  }

  return matchedUser;
}

export function updateMediaStaffPassword(
  state: PortalState,
  staffId: string,
  newPassword: string
): { nextState: PortalState; staff: MediaStaffMember } {
  const clean = newPassword.trim();
  if (!clean) {
    throw new Error('New password cannot be empty.');
  }
  const currentList = state.mediaStaff || createInitialMediaStaff();
  const target = currentList.find((s) => s.id === staffId);
  if (!target) {
    throw new Error('Media staff member not found');
  }
  const updated: MediaStaffMember = {
    ...target,
    passwordHash: clean
  };
  return {
    nextState: {
      ...state,
      mediaStaff: currentList.map((s) => (s.id === staffId ? updated : s))
    },
    staff: updated
  };
}

export function setMediaStaffBlockStatus(
  state: PortalState,
  staffId: string,
  blocked: boolean
): { nextState: PortalState; staff: MediaStaffMember } {
  const currentList = state.mediaStaff || createInitialMediaStaff();
  const target = currentList.find((s) => s.id === staffId);
  if (!target) {
    throw new Error('Media staff member not found');
  }
  const updated: MediaStaffMember = {
    ...target,
    status: blocked ? 'blocked' : 'approved'
  };
  return {
    nextState: {
      ...state,
      mediaStaff: currentList.map((s) => (s.id === staffId ? updated : s))
    },
    staff: updated
  };
}

export function deleteMediaStaff(state: PortalState, staffId: string): PortalState {
  const currentList = state.mediaStaff || createInitialMediaStaff();
  return {
    ...state,
    mediaStaff: currentList.filter((s) => s.id !== staffId)
  };
}

export function updateEpaperPageWorkflow(
  state: PortalState,
  pageId: string,
  updates: Partial<EpaperEditionPage>
): PortalState {
  const currentPages = state.epaperEditions || createInitialEpaperEditions();
  return {
    ...state,
    epaperEditions: currentPages.map((page) =>
      page.id === pageId
        ? {
            ...page,
            ...updates,
            updatedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
          }
        : page
    )
  };
}


