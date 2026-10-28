export type SupportedLanguage = 'te' | 'hi' | 'en';

export interface UITranslations {
  brandTitle: string;
  brandSubtitle: string;
  editionLabel: string;
  navAllNews: string;
  navNational: string;
  navState: string;
  navDistrict: string;
  navMandal: string;
  navYoutube: string;
  navReporterPortal: string;
  navAdminPortal: string;
  navPostPvtAd: string;
  searchPlaceholder: string;
  selectState: string;
  selectDistrict: string;
  selectMandal: string;
  allStates: string;
  allDistricts: string;
  allMandals: string;
  openMandalPage: string;
  mandalSpecialPageTitle: string;
  viewsLabel: string;
  breakingTicker: string;
  youtubeSectionTitle: string;
  youtubeChannelCta: string;
  pvtAdsHeading: string;
  pvtAdSubmitBtn: string;
  feedbackHeading: string;
  feedbackSubmitBtn: string;
  installAppBtn: string;
  playStoreBtn: string;
  reporterRegHeading: string;
  reporterLoginHeading: string;
  adminLoginHeading: string;
  mandalLockNotice: string;
  downloadPressId: string;
  pendingApprovalBadge: string;
  approvedBadge: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, UITranslations> = {
  te: {
    brandTitle: 'నేటి భారతం',
    brandSubtitle: 'జాతీయ, రాష్ట్ర, జిల్లా మరియు మండల స్థాయి సమగ్ర వార్తా వేదిక',
    editionLabel: 'భారతదేశ సమగ్ర డిజిటల్ దినపత్రిక · 24x7 లైవ్ అప్‌డేట్స్',
    navAllNews: 'ముఖ్యాంశాలు',
    navNational: 'జాతీయ వార్తలు',
    navState: 'రాష్ట్ర వార్తలు',
    navDistrict: 'జిల్లా వార్తలు',
    navMandal: 'మండల వార్తలు',
    navYoutube: 'వీడియో అప్‌డేట్స్ (YouTube)',
    navReporterPortal: 'రిపోర్టర్ పోర్టల్',
    navAdminPortal: 'అడ్మిన్ లాగిన్',
    navPostPvtAd: 'ప్రైవేట్ యాడ్ ఇవ్వండి',
    searchPlaceholder: 'వార్తలు, మండలం, జిల్లా లేదా అంశం కోసం వెతకండి...',
    selectState: 'రాష్ట్రం ఎంచుకోండి',
    selectDistrict: 'జిల్లా ఎంచుకోండి',
    selectMandal: 'మండలం ఎంచుకోండి',
    allStates: 'అన్ని రాష్ట్రాలు (All India)',
    allDistricts: 'అన్ని జిల్లాలు',
    allMandals: 'అన్ని మండలాలు',
    openMandalPage: 'మండల ప్రత్యేక పేజీ తెరవండి',
    mandalSpecialPageTitle: 'మండల సమగ్ర వార్తా పేజీ',
    viewsLabel: 'వీక్షణలు (Views)',
    breakingTicker: 'తాజా వార్తలు',
    youtubeSectionTitle: 'నేటి భారతం వీడియో అప్‌డేట్స్ (YouTube)',
    youtubeChannelCta: 'అధికారిక యూట్యూబ్ ఛానెల్ వీక్షించండి',
    pvtAdsHeading: 'ప్రైవేట్ ప్రకటనలు (రాష్ట్ర / జిల్లా / మండల వారీగా)',
    pvtAdSubmitBtn: 'కొత్త ప్రకటన (Pvt Ad) బుక్ చేయండి',
    feedbackHeading: 'పాఠకుల అభిప్రాయం & ఫీడ్‌బ్యాక్',
    feedbackSubmitBtn: 'ఫీడ్‌బ్యాక్ పంపండి',
    installAppBtn: 'యాప్ ఇన్‌స్టాల్',
    playStoreBtn: 'Play Store యాప్',
    reporterRegHeading: 'కొత్త రిపోర్టర్ రిజిస్ట్రేషన్ (ఆల్ ఇండియా మండల స్థాయి)',
    reporterLoginHeading: 'రిపోర్టర్ డ్యాష్‌బోర్డ్ లాగిన్',
    adminLoginHeading: 'చీఫ్ ఎడిటర్ & అడ్మిన్ సెక్యూరిటీ లాగిన్',
    mandalLockNotice: 'నిబంధన: రిపోర్టర్ ఏ మండలంలో రిజిస్టర్ అయ్యారో ఆ మండలంలో మాత్రమే వార్తలు ప్రచురించబడతాయి.',
    downloadPressId: 'ప్రెస్ ఐడి కార్డు డౌన్‌లోడ్ (Press ID)',
    pendingApprovalBadge: 'అడ్మిన్ ఆమోదం కోసం వేచి ఉంది',
    approvedBadge: 'అడ్మిన్ ఆమోదించారు (Verified)'
  },
  hi: {
    brandTitle: 'नेटी भारतम (నేటి భారతం)',
    brandSubtitle: 'राष्ट्रीय, राज्य, जिला और मंडल स्तरीय समाचार नेटवर्क',
    editionLabel: 'अखिल भारतीय डिजिटल समाचार पोर्टल · 24x7 लाइव अपडेट्स',
    navAllNews: 'मुख्य समाचार',
    navNational: 'राष्ट्रीय समाचार',
    navState: 'राज्य समाचार',
    navDistrict: 'जिला समाचार',
    navMandal: 'मंडल समाचार',
    navYoutube: 'वीडियो अपडेट्स (YouTube)',
    navReporterPortal: 'रिपोर्टर पोर्टल',
    navAdminPortal: 'एडमिन लॉगिन',
    navPostPvtAd: 'विज्ञापन दें (Pvt Ad)',
    searchPlaceholder: 'समाचार, मंडल, जिला या विषय खोजें...',
    selectState: 'राज्य चुनें',
    selectDistrict: 'जिला चुनें',
    selectMandal: 'मंडल चुनें',
    allStates: 'सभी राज्य (All India)',
    allDistricts: 'सभी जिले',
    allMandals: 'सभी मंडल',
    openMandalPage: 'मंडल विशेष पेज खोलें',
    mandalSpecialPageTitle: 'मंडल विशेष समाचार पृष्ठ',
    viewsLabel: 'व्यूज (Views)',
    breakingTicker: 'ताज़ा खबर',
    youtubeSectionTitle: 'नेटी भारतम वीडियो अपडेट्स (YouTube)',
    youtubeChannelCta: 'आधिकारिक यूट्यूब चैनल देखें',
    pvtAdsHeading: 'प्राइवेट विज्ञापन (राज्य / जिला / मंडल अनुसार)',
    pvtAdSubmitBtn: 'नया विज्ञापन (Pvt Ad) सबमिट करें',
    feedbackHeading: 'पाठक प्रतिक्रिया (User Feedback)',
    feedbackSubmitBtn: 'प्रतिक्रिया भेजें',
    installAppBtn: 'ऐप इंस्टॉल करें',
    playStoreBtn: 'Play Store ऐप',
    reporterRegHeading: 'नया रिपोर्टर पंजीकरण (मंडल अनुसार)',
    reporterLoginHeading: 'रिपोर्टर डैशबोर्ड लॉगिन',
    adminLoginHeading: 'चीफ एडिटर एवं एडमिन सुरक्षा लॉगिन',
    mandalLockNotice: 'नियम: रिपोर्टर जिस मंडल में पंजीकृत है, उसी मंडल में समाचार प्रकाशित होंगे।',
    downloadPressId: 'प्रेस आईडी कार्ड डाउनलोड करें',
    pendingApprovalBadge: 'एडमिन स्वीकृति लंबित',
    approvedBadge: 'एडमिन द्वारा स्वीकृत'
  },
  en: {
    brandTitle: 'Neti Bharatam (నేటి భారతం)',
    brandSubtitle: 'National, State, District & Mandal News Network Across India',
    editionLabel: 'All-India Trilingual Digital Broadsheet · 24x7 Live Desk',
    navAllNews: 'Top Stories',
    navNational: 'National News',
    navState: 'State News',
    navDistrict: 'District News',
    navMandal: 'Mandal News',
    navYoutube: 'Video Updates (YouTube)',
    navReporterPortal: 'Reporter Portal',
    navAdminPortal: 'Admin Console',
    navPostPvtAd: 'Post Pvt Ad',
    searchPlaceholder: 'Search headlines, Mandal, District, or topic...',
    selectState: 'Select State',
    selectDistrict: 'Select District',
    selectMandal: 'Select Mandal',
    allStates: 'All India States',
    allDistricts: 'All Districts',
    allMandals: 'All Mandals',
    openMandalPage: 'Open Mandal Page',
    mandalSpecialPageTitle: 'Dedicated Mandal News Chronicle',
    viewsLabel: 'Views',
    breakingTicker: 'BREAKING',
    youtubeSectionTitle: 'Neti Bharatam Video Updates (YouTube)',
    youtubeChannelCta: 'Visit Official YouTube Channel',
    pvtAdsHeading: 'Private Classifieds & Display Ads (Mandal / District / State)',
    pvtAdSubmitBtn: 'Submit New Private Ad',
    feedbackHeading: 'Reader Feedback & Editorial Desk',
    feedbackSubmitBtn: 'Submit Feedback',
    installAppBtn: 'Install App',
    playStoreBtn: 'Play Store App',
    reporterRegHeading: 'New Reporter Registration (All-India Mandal Level)',
    reporterLoginHeading: 'Reporter Dashboard Login',
    adminLoginHeading: 'Chief Editor & Admin Security Login',
    mandalLockNotice: 'Policy: Approved reporters automatically publish strictly into their assigned Mandal.',
    downloadPressId: 'Download Press ID Card',
    pendingApprovalBadge: 'Pending Admin Approval',
    approvedBadge: 'Approved by Admin'
  }
};
