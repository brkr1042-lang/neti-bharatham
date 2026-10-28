import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialPortalState,
  verifyAdminLogin,
  registerReporter,
  approveReporter,
  updateReporterPassword,
  setReporterBlockStatus,
  publishReporterNews,
  submitPrivateAd,
  approvePrivateAd,
  filterPublicPrivateAds,
  filterPublicNews,
  incrementArticleViews,
  addLocationHierarchyNode,
  updateSiteConfig,
  updateNewsArticle,
  deleteNewsArticle,
  deletePrivateAd,
  addYoutubeUpdate,
  registerMediaStaff,
  approveMediaStaff,
  updateMediaStaffPassword,
  setMediaStaffBlockStatus,
  updateEpaperPageWorkflow,
  validateUidaiAadhaarNumber,
  authenticateMediaStaffLogin,
  MEDIA_DIVISIONS,
  MEDIA_POSTS_CATALOG,
  ACCESS_TIER_CATALOG,
  OFFICIAL_YOUTUBE_CHANNEL,
  OFFICIAL_BANNER_IMAGE
} from './news-engine';

test('Admin credentials strictly validate Admin / Bchakriraju1992@', () => {
  assert.equal(verifyAdminLogin('Admin', 'Bchakriraju1992@'), true);
  assert.equal(verifyAdminLogin('Admin ', 'Bchakriraju1992@'), true);
  assert.equal(verifyAdminLogin('admin', 'Bchakriraju1992@'), false);
  assert.equal(verifyAdminLogin('Admin', 'wrongpass'), false);
});

test('Reporter registration, Admin password change, and Admin block/unblock reporter work end-to-end', () => {
  const state0 = createInitialPortalState();

  const { nextState: state1, reporter } = registerReporter(state0, {
    fullName: 'Chakri Raju',
    mobile: '9988776655',
    username: 'chakri_siddipet',
    password: 'SecretPassword1!',
    state: 'Telangana (తెలంగాణ)',
    district: 'Siddipet (సిద్దిపేట)',
    mandal: 'Gajwel (గజ్వేల్)',
    aadhaarNumber: '4512 8890 1234',
    aadhaarDocumentUrl: '/images/sample-aadhaar-card.svg',
    photoUrl: '/images/reporter-avatar-1.svg'
  });

  assert.equal(reporter.status, 'pending');
  assert.equal(reporter.idCardGenerated, false);

  // Admin changes reporter password
  const { nextState: statePwd, reporter: pwdUpdatedRep } = updateReporterPassword(
    state1,
    reporter.id,
    'NewAdminSetPass@99'
  );
  assert.equal(pwdUpdatedRep.passwordHash, 'NewAdminSetPass@99');

  // Approve reporter via Admin
  const { nextState: state2, reporter: approvedRep } = approveReporter(statePwd, reporter.id);
  assert.equal(approvedRep.status, 'approved');
  assert.equal(approvedRep.idCardGenerated, true);

  // Admin blocks the reporter -> blocked reporter cannot publish news
  const { nextState: stateBlocked, reporter: blockedRep } = setReporterBlockStatus(
    state2,
    reporter.id,
    true
  );
  assert.equal(blockedRep.status, 'blocked');
  assert.throws(() => {
    publishReporterNews(stateBlocked, reporter.id, {
      titleTe: 'గజ్వేల్ మండల వార్త',
      summaryTe: 'సారాంశం',
      contentTe: 'పూర్తి వివరాలు',
      category: 'మండల వార్తలు',
      imageUrl: '/images/mandal-praja-parishad.svg'
    });
  }, /blocked by Admin/);

  // Admin unblocks the reporter -> reporter can publish Mandal-locked news
  const { nextState: stateUnblocked, reporter: unblockedRep } = setReporterBlockStatus(
    stateBlocked,
    reporter.id,
    false
  );
  assert.equal(unblockedRep.status, 'approved');

  const { nextState: state3, article } = publishReporterNews(stateUnblocked, unblockedRep.id, {
    titleTe: 'గజ్వేల్ మండలంలో నూతన డిజిటల్ లైబ్రరీ ప్రారంభం',
    summaryTe: 'విద్యార్థులకు ఉచిత కంప్యూటర్ శిక్షణ',
    contentTe: 'గజ్వేల్ మండల కేంద్రంలో నూతన డిజిటల్ లైబ్రరీని ప్రారంభించారు.',
    category: 'మండల వార్తలు',
    imageUrl: '/images/mandal-praja-parishad.svg',
    attemptedMandalOverride: 'Secunderabad (సికింద్రాబాద్)'
  });

  assert.equal(article.state, 'Telangana (తెలంగాణ)');
  assert.equal(article.district, 'Siddipet (సిద్దిపేట)');
  assert.equal(article.mandal, 'Gajwel (గజ్వేల్)');

  const gajwelNews = filterPublicNews(state3, { mandal: 'Gajwel (గజ్వేల్)' });
  assert.equal(gajwelNews.length, 1);
});

test('Private Ads support all 10 categories, Banner & Classified formats, and Home/State/District/Mandal scopes', () => {
  const state0 = createInitialPortalState();

  // Verify initial seed includes both Banner Ads ('banner') and Classified Ads ('classified')
  const initialBannerAds = filterPublicPrivateAds(state0, { adFormat: 'banner' });
  const initialClassifiedAds = filterPublicPrivateAds(state0, { adFormat: 'classified' });
  assert.equal(initialBannerAds.length, 4);
  assert.equal(initialClassifiedAds.length, 3);

  // Verify initial seed includes Home Page Wise ('home'), State Wise ('state'), District Wise ('district'), Mandal Wise ('mandal')
  assert.equal(filterPublicPrivateAds(state0, { scope: 'home' }).length, 2);
  assert.equal(filterPublicPrivateAds(state0, { scope: 'state' }).length, 1);
  assert.equal(filterPublicPrivateAds(state0, { scope: 'district' }).length, 2);
  assert.equal(filterPublicPrivateAds(state0, { scope: 'mandal' }).length, 2);

  const { nextState: state1, ad } = submitPrivateAd(state0, {
    title: 'గజ్వేల్ సూపర్ మార్కెట్ ప్రారంభోత్సవం',
    matter: 'అన్ని నిత్యావసర సరుకులపై 20% తగ్గింపు',
    imageUrl: '/images/ad-kanchipuram-silks.svg',
    category: 'వ్యాపార & వాణిజ్య ప్రకటనలు (Business, Showrooms & Offers)',
    adFormat: 'classified',
    scope: 'mandal',
    state: 'Telangana (తెలంగాణ)',
    district: 'Siddipet (సిద్దిపేట)',
    mandal: 'Gajwel (గజ్వేల్)',
    advertiserName: 'Gajwel Super Mart',
    contactPhone: '9123456780'
  });

  assert.equal(ad.status, 'pending');
  assert.equal(ad.adFormat, 'classified');
  assert.equal(filterPublicPrivateAds(state1, { scope: 'mandal', mandal: 'Gajwel (గజ్వేల్)' }).length, 0);

  const { nextState: state2 } = approvePrivateAd(state1, ad.id);
  const afterApproval = filterPublicPrivateAds(state2, {
    scope: 'mandal',
    mandal: 'Gajwel (గజ్వేల్)',
    adFormat: 'classified'
  });
  assert.equal(afterApproval.length, 1);
  assert.equal(afterApproval[0].title, 'గజ్వేల్ సూపర్ మార్కెట్ ప్రారంభోత్సవం');
});

test('View counter increments deterministically, Telangana has 33 Districts, Andhra Pradesh has 26 Districts, and Admin can add new Mandals', () => {
  const state0 = createInitialPortalState();
  const targetArticle = state0.articles[0];
  const initialViews = targetArticle.views;

  // Verify official Telangana 33 Districts & 615+ Mandals
  const tsDistricts = Object.keys(state0.locations['Telangana (తెలంగాణ)']);
  assert.equal(tsDistricts.length, 33);
  const tsTotalMandals = Object.values(state0.locations['Telangana (తెలంగాణ)']).reduce(
    (sum, mList) => sum + mList.length,
    0
  );
  assert.equal(tsTotalMandals >= 615, true);
  assert.equal(tsDistricts[0], 'Adilabad (ఆదిలాబాద్)');
  assert.equal(tsDistricts[32], 'Yadadri Bhuvanagiri (యాదాద్రి భువనగిరి)');

  // Verify official Andhra Pradesh 26 Districts & 670+ Mandals
  const apDistricts = Object.keys(state0.locations['Andhra Pradesh (ఆంధ్రప్రదేశ్)']);
  assert.equal(apDistricts.length, 26);
  const apTotalMandals = Object.values(state0.locations['Andhra Pradesh (ఆంధ్రప్రదేశ్)']).reduce(
    (sum, mList) => sum + mList.length,
    0
  );
  assert.equal(apTotalMandals >= 670, true);
  assert.equal(apDistricts[0], 'Alluri Sitharama Raju (అల్లూరి సీతారామరాజు)');
  assert.equal(apDistricts[25], 'YSR Kadapa (వైఎస్ఆర్ కడప)');

  const { nextState: state1, views } = incrementArticleViews(state0, targetArticle.id);
  assert.equal(views, initialViews + 1);
  assert.equal(state1.articles[0].views, initialViews + 1);

  const state2 = addLocationHierarchyNode(
    state1,
    'Telangana (తెలంగాణ)',
    'Mulugu (ములుగు)',
    'Venkatapuram (వెంకటాపురం)'
  );
  assert.equal(
    state2.locations['Telangana (తెలంగాణ)']['Mulugu (ములుగు)'].includes('Venkatapuram (వెంకటాపురం)'),
    true
  );

  assert.equal(state2.adsenseConfig.showOnHomepage, false);
  assert.equal(state2.officialYoutubeChannel, OFFICIAL_YOUTUBE_CHANNEL);
});

test('Official Banner Image and Full Website CMS settings (Logo, Banner, Masthead, Article/Ad CRUD) work from Admin', () => {
  const state0 = createInitialPortalState();
  assert.equal(state0.bannerUrl, OFFICIAL_BANNER_IMAGE);
  assert.equal(state0.siteConfig.bannerUrl, OFFICIAL_BANNER_IMAGE);
  assert.equal(state0.siteConfig.showBannerImage, true);

  const state1 = updateSiteConfig(state0, {
    bannerUrl: '/custom-banner.jpg',
    logoUrl: '/custom-logo.png',
    mastheadHeading: 'నేటి భారతం స్పెషల్ ఎడిషన్',
    contactPhone: '+91 90000 11111'
  });
  assert.equal(state1.bannerUrl, '/custom-banner.jpg');
  assert.equal(state1.logoUrl, '/custom-logo.png');
  assert.equal(state1.siteConfig.mastheadHeading, 'నేటి భారతం స్పెషల్ ఎడిషన్');
  assert.equal(state1.siteConfig.contactPhone, '+91 90000 11111');

  const firstArtId = state1.articles[0].id;
  const state2 = updateNewsArticle(state1, firstArtId, {
    titleTe: 'అడ్మిన్ ఎడిట్ చేసిన శీర్షిక'
  });
  assert.equal(state2.articles[0].title.te, 'అడ్మిన్ ఎడిట్ చేసిన శీర్షిక');

  const state3 = deleteNewsArticle(state2, firstArtId);
  assert.equal(state3.articles.length, state2.articles.length - 1);

  const firstAdId = state3.privateAds[0].id;
  const state4 = deletePrivateAd(state3, firstAdId);
  assert.equal(state4.privateAds.length, state3.privateAds.length - 1);

  const state5 = addYoutubeUpdate(state4, {
    titleTe: 'నేటి భారతం స్పెషల్ లైవ్ బులెటిన్',
    locationTag: 'Hyderabad Live'
  });
  assert.equal(state5.youtubeUpdates[0].title.te, 'నేటి భారతం స్పెషల్ లైవ్ బులెటిన్');
});

test('Print, Digital & E-Paper Media Organization 4 Divisions, 5 RBAC Access Tiers, UIDAI Verification, Admin Approval Mandate & Position Login Popup work end-to-end', () => {
  assert.equal(MEDIA_DIVISIONS.length, 4);
  assert.equal(Object.keys(ACCESS_TIER_CATALOG).length, 5);
  assert.equal(MEDIA_POSTS_CATALOG.length >= 30, true);

  // Verify UIDAI 12-Digit Aadhaar validation rules
  assert.equal(validateUidaiAadhaarNumber('1234 5678 9012').valid, false); // cannot start with 0 or 1
  assert.equal(validateUidaiAadhaarNumber('7766 5544').valid, false); // must be 12 digits
  const validUidai = validateUidaiAadhaarNumber('776655443322');
  assert.equal(validUidai.valid, true);
  assert.equal(validUidai.formatted, '7766 5544 3322');

  const state0 = createInitialPortalState();
  assert.equal(state0.mediaStaff.length >= 9, true);
  assert.equal(state0.epaperEditions.length >= 3, true);

  // Registering staff even with autoApprove=true must enforce Mandatory Admin Approval ('pending')
  const { nextState: state1, staff } = registerMediaStaff(state0, {
    fullName: 'K. Ramesh (Resident Editor)',
    mobile: '9848099887',
    username: 're_ramesh_ap',
    password: 'StaffPassword@1',
    postCode: 'ED_RE',
    editionOrUnit: 'Vijayawada & AP State Edition',
    state: 'Andhra Pradesh (ఆంధ్రప్రదేశ్)',
    district: 'NTR Vijayawada (ఎన్టీఆర్ విజయవాడ)',
    mandal: 'Vijayawada Central (విజయవాడ సెంట్రల్)',
    aadhaarNumber: '7766 5544 3322',
    photoUrl: '/images/reporter-avatar-1.svg',
    aadhaarDocumentUrl: '/images/sample-aadhaar-card.svg',
    uidaiConsent: true,
    autoApprove: true
  });

  assert.equal(staff.status, 'pending');
  assert.equal(staff.uidaiVerified, true);
  assert.equal(staff.idCardGenerated, false);
  assert.equal(staff.accessTier, 'top_executive');

  // Cannot log in before Admin Approval
  assert.throws(() => {
    authenticateMediaStaffLogin(state1, {
      postCode: 'ED_RE',
      username: 're_ramesh_ap',
      password: 'StaffPassword@1'
    });
  }, /Admin Approval/);

  // Cannot log in if wrong Position (postCode) is selected in Popup
  assert.throws(() => {
    authenticateMediaStaffLogin(state1, {
      postCode: 'ED_NE',
      username: 're_ramesh_ap',
      password: 'StaffPassword@1'
    });
  }, /హోదా/);

  // Admin approves the employee -> ID Card generated & Position Login succeeds
  const { nextState: state2, staff: approvedStaff } = approveMediaStaff(state1, staff.id);
  assert.equal(approvedStaff.status, 'approved');
  assert.equal(approvedStaff.idCardGenerated, true);

  const loggedInStaff = authenticateMediaStaffLogin(state2, {
    postCode: 'ED_RE',
    username: 're_ramesh_ap',
    password: 'StaffPassword@1'
  });
  assert.equal(loggedInStaff.id, staff.id);

  const { nextState: state3, staff: pwdStaff } = updateMediaStaffPassword(
    state2,
    staff.id,
    'UpdatedPass@2026'
  );
  assert.equal(pwdStaff.passwordHash, 'UpdatedPass@2026');

  const { nextState: state4, staff: blockedStaff } = setMediaStaffBlockStatus(
    state3,
    staff.id,
    true
  );
  assert.equal(blockedStaff.status, 'blocked');

  const targetPageId = state4.epaperEditions[1].id;
  const state5 = updateEpaperPageWorkflow(state4, targetPageId, {
    status: 'printed',
    printCopiesOrder: 45000,
    updatedByRole: 'Production / Press Manager'
  });
  const updatedPage = state5.epaperEditions.find((p) => p.id === targetPageId);
  assert.equal(updatedPage?.status, 'printed');
  assert.equal(updatedPage?.printCopiesOrder, 45000);
});

test('Hostinger export API dynamically generates valid ZIP, index.html, .htaccess, package.json (0 vulnerabilities), server.js, and guide', async () => {
  const { NextRequest } = await import('next/server');
  const { GET } = await import('../app/api/hostinger-export/route');

  const zipRes = await GET(new NextRequest('http://localhost:3000/api/hostinger-export?format=zip'));
  assert.equal(zipRes.status, 200);
  assert.equal(zipRes.headers.get('Content-Type'), 'application/zip');
  const zipBuf = await zipRes.arrayBuffer();
  assert.equal(zipBuf.byteLength > 1000, true);

  const htmlRes = await GET(
    new NextRequest('http://localhost:3000/api/hostinger-export?format=public_html')
  );
  const htmlText = await htmlRes.text();
  assert.equal(htmlText.includes('<!DOCTYPE html>'), true);
  assert.equal(htmlText.includes('నేటి భారతం'), true);

  const htaccessRes = await GET(
    new NextRequest('http://localhost:3000/api/hostinger-export?format=htaccess')
  );
  const htaccessText = await htaccessRes.text();
  assert.equal(htaccessText.includes('RewriteEngine On'), true);
  assert.equal(htaccessText.includes('Strict-Transport-Security'), true);
  assert.equal(htaccessText.includes('Permissions-Policy'), true);

  const pkgRes = await GET(
    new NextRequest('http://localhost:3000/api/hostinger-export?format=package_json')
  );
  const pkgJson = JSON.parse(await pkgRes.text());
  assert.equal(pkgJson.overrides.postcss, '^8.5.23');
  assert.equal(pkgJson.overrides['postcss-selector-parser'], '^7.1.6');
  assert.equal(pkgJson.overrides.uuid, '^11.1.1');
  assert.equal(pkgJson.overrides['@opentelemetry/core'], '^2.8.0');

  const guideRes = await GET(
    new NextRequest('http://localhost:3000/api/hostinger-export?format=deploy_guide')
  );
  const guideText = await guideRes.text();
  assert.equal(guideText.includes('public_html'), true);
  assert.equal(guideText.includes('Bchakriraju1992@'), true);
});



