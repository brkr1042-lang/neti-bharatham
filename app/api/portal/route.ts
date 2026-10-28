import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import {
  PortalState,
  createInitialPortalState,
  verifyAdminLogin,
  registerReporter,
  approveReporter,
  updateReporterPassword,
  setReporterBlockStatus,
  publishReporterNews,
  submitPrivateAd,
  approvePrivateAd,
  incrementArticleViews,
  addLocationHierarchyNode,
  updateSiteConfig,
  deleteNewsArticle,
  updateNewsArticle,
  deletePrivateAd,
  updatePrivateAd,
  addYoutubeUpdate,
  deleteYoutubeUpdate,
  deleteReporter,
  registerMediaStaff,
  approveMediaStaff,
  updateMediaStaffPassword,
  setMediaStaffBlockStatus,
  deleteMediaStaff,
  updateEpaperPageWorkflow,
  createInitialMediaStaff,
  createInitialEpaperEditions,
  NewsArticle
} from '@/lib/news-engine';

const DB_FILE_PATH = '/tmp/neti-bharatam-portal-db-v8.json';

function readPortalDb(): PortalState {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as PortalState;
      if (!Array.isArray(parsed.mediaStaff)) {
        parsed.mediaStaff = createInitialMediaStaff();
      }
      if (!Array.isArray(parsed.epaperEditions)) {
        parsed.epaperEditions = createInitialEpaperEditions();
      }
      return parsed;
    }
  } catch (err) {
    console.error('Error reading portal DB, reinitializing:', err);
  }
  const initial = createInitialPortalState();
  writePortalDb(initial);
  return initial;
}

function writePortalDb(state: PortalState): void {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing portal DB:', err);
  }
}

export async function GET() {
  const state = readPortalDb();
  return NextResponse.json({ state });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;
    let state = readPortalDb();

    switch (action) {
      case 'INCREMENT_VIEW': {
        const { nextState, views } = incrementArticleViews(state, payload.articleId);
        writePortalDb(nextState);
        return NextResponse.json({ state: nextState, views });
      }

      case 'REGISTER_REPORTER': {
        const { nextState, reporter } = registerReporter(state, payload);
        writePortalDb(nextState);
        return NextResponse.json({ state: nextState, reporter });
      }

      case 'REPORTER_PUBLISH_NEWS': {
        const { nextState, article } = publishReporterNews(
          state,
          payload.reporterId,
          payload.newsInput
        );
        writePortalDb(nextState);
        return NextResponse.json({ state: nextState, article });
      }

      case 'SUBMIT_PRIVATE_AD': {
        const isAdminDirect =
          Boolean(payload.autoApprove) &&
          verifyAdminLogin(payload.adminUsername || '', payload.adminPassword || '');
        const { nextState, ad } = submitPrivateAd(state, {
          ...payload,
          autoApprove: isAdminDirect
        });
        writePortalDb(nextState);
        return NextResponse.json({ state: nextState, ad });
      }

      case 'SUBMIT_FEEDBACK': {
        const newFeedback = {
          id: `fb-${Date.now()}`,
          readerName: String(payload.readerName || '').trim(),
          mobileOrEmail: String(payload.mobileOrEmail || '').trim(),
          location: String(payload.location || '').trim(),
          rating: Number(payload.rating || 5),
          message: String(payload.message || '').trim(),
          createdAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        };
        if (!newFeedback.readerName || !newFeedback.message) {
          return NextResponse.json(
            { error: 'Name and feedback message are required.' },
            { status: 400 }
          );
        }
        state = {
          ...state,
          feedbackList: [newFeedback, ...state.feedbackList]
        };
        writePortalDb(state);
        return NextResponse.json({ state, feedback: newFeedback });
      }

      case 'ADMIN_LOGIN': {
        const ok = verifyAdminLogin(payload.username || '', payload.password || '');
        if (!ok) {
          return NextResponse.json(
            { error: 'Invalid Admin Username or Password.' },
            { status: 401 }
          );
        }
        return NextResponse.json({ authenticated: true });
      }

      case 'ADMIN_APPROVE_REPORTER': {
        if (!verifyAdminLogin(payload.adminUsername || '', payload.adminPassword || '')) {
          return NextResponse.json({ error: 'Unauthorized Admin Action' }, { status: 403 });
        }
        const { nextState, reporter } = approveReporter(state, payload.reporterId);
        writePortalDb(nextState);
        return NextResponse.json({ state: nextState, reporter });
      }

      case 'ADMIN_CHANGE_REPORTER_PASSWORD': {
        if (!verifyAdminLogin(payload.adminUsername || '', payload.adminPassword || '')) {
          return NextResponse.json({ error: 'Unauthorized Admin Action' }, { status: 403 });
        }
        const { nextState, reporter } = updateReporterPassword(
          state,
          payload.reporterId,
          payload.newPassword
        );
        writePortalDb(nextState);
        return NextResponse.json({ state: nextState, reporter });
      }

      case 'ADMIN_SET_REPORTER_BLOCK': {
        if (!verifyAdminLogin(payload.adminUsername || '', payload.adminPassword || '')) {
          return NextResponse.json({ error: 'Unauthorized Admin Action' }, { status: 403 });
        }
        const { nextState, reporter } = setReporterBlockStatus(
          state,
          payload.reporterId,
          Boolean(payload.blocked)
        );
        writePortalDb(nextState);
        return NextResponse.json({ state: nextState, reporter });
      }

      case 'ADMIN_APPROVE_AD': {
        if (!verifyAdminLogin(payload.adminUsername || '', payload.adminPassword || '')) {
          return NextResponse.json({ error: 'Unauthorized Admin Action' }, { status: 403 });
        }
        const { nextState, ad } = approvePrivateAd(state, payload.adId);
        writePortalDb(nextState);
        return NextResponse.json({ state: nextState, ad });
      }

      case 'ADMIN_ADD_LOCATION': {
        if (!verifyAdminLogin(payload.adminUsername || '', payload.adminPassword || '')) {
          return NextResponse.json({ error: 'Unauthorized Admin Action' }, { status: 403 });
        }
        const nextState = addLocationHierarchyNode(
          state,
          payload.stateName,
          payload.districtName,
          payload.mandalName
        );
        writePortalDb(nextState);
        return NextResponse.json({ state: nextState });
      }

      case 'ADMIN_PUBLISH_NEWS': {
        if (!verifyAdminLogin(payload.adminUsername || '', payload.adminPassword || '')) {
          return NextResponse.json({ error: 'Unauthorized Admin Action' }, { status: 403 });
        }
        const input = payload.newsInput;
        const newArticle: NewsArticle = {
          id: `art-admin-${Date.now()}`,
          level: input.level || 'national',
          category: input.category || 'ప్రత్యేక వార్త · Special Desk',
          state: input.state,
          district: input.district,
          mandal: input.mandal,
          title: {
            te: input.titleTe,
            hi: input.titleHi || input.titleTe,
            en: input.titleEn || input.titleTe
          },
          summary: {
            te: input.summaryTe || input.titleTe,
            hi: input.summaryTe || input.titleTe,
            en: input.summaryTe || input.titleTe
          },
          content: {
            te: input.contentTe,
            hi: input.contentTe,
            en: input.contentTe
          },
          imageUrl: input.imageUrl || '/images/national-parliament.svg',
          youtubeUrl: input.youtubeUrl || undefined,
          authorName: 'చీఫ్ ఎడిటర్ డెస్క్ (Chief Editor)',
          publishedAt: 'ఇప్పుడే · Just now',
          views: 1,
          isBreaking: true
        };
        const nextState: PortalState = {
          ...state,
          articles: [newArticle, ...state.articles],
          notifications: [
            {
              id: `notif-${Date.now()}`,
              title: newArticle.title,
              timestamp: 'Just now',
              level: newArticle.level
            },
            ...state.notifications
          ]
        };
        writePortalDb(nextState);
        return NextResponse.json({ state: nextState, article: newArticle });
      }

      case 'ADMIN_UPDATE_ADSENSE': {
        if (!verifyAdminLogin(payload.adminUsername || '', payload.adminPassword || '')) {
          return NextResponse.json({ error: 'Unauthorized Admin Action' }, { status: 403 });
        }
        const nextState: PortalState = {
          ...state,
          adsenseConfig: {
            ...state.adsenseConfig,
            publisherId: String(payload.publisherId || state.adsenseConfig.publisherId).trim(),
            adSlotId: String(payload.adSlotId || state.adsenseConfig.adSlotId).trim(),
            dashboardLink: String(payload.dashboardLink || state.adsenseConfig.dashboardLink).trim(),
            showOnHomepage: false,
            updatedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
          }
        };
        writePortalDb(nextState);
        return NextResponse.json({ state: nextState });
      }

      case 'ADMIN_UPDATE_LOGO': {
        if (!verifyAdminLogin(payload.adminUsername || '', payload.adminPassword || '')) {
          return NextResponse.json({ error: 'Unauthorized Admin Action' }, { status: 403 });
        }
        const nextState = updateSiteConfig(state, {
          logoUrl: String(payload.logoUrl || state.logoUrl)
        });
        writePortalDb(nextState);
        return NextResponse.json({ state: nextState });
      }

      case 'ADMIN_UPDATE_BANNER': {
        if (!verifyAdminLogin(payload.adminUsername || '', payload.adminPassword || '')) {
          return NextResponse.json({ error: 'Unauthorized Admin Action' }, { status: 403 });
        }
        const nextState = updateSiteConfig(state, {
          bannerUrl: String(payload.bannerUrl || state.bannerUrl),
          showBannerImage:
            payload.showBannerImage !== undefined
              ? Boolean(payload.showBannerImage)
              : state.siteConfig?.showBannerImage ?? true
        });
        writePortalDb(nextState);
        return NextResponse.json({ state: nextState });
      }

      case 'ADMIN_UPDATE_SITE_CONFIG': {
        if (!verifyAdminLogin(payload.adminUsername || '', payload.adminPassword || '')) {
          return NextResponse.json({ error: 'Unauthorized Admin Action' }, { status: 403 });
        }
        const nextState = updateSiteConfig(state, payload.siteConfig || {});
        writePortalDb(nextState);
        return NextResponse.json({ state: nextState });
      }

      case 'ADMIN_DELETE_ARTICLE': {
        if (!verifyAdminLogin(payload.adminUsername || '', payload.adminPassword || '')) {
          return NextResponse.json({ error: 'Unauthorized Admin Action' }, { status: 403 });
        }
        const nextState = deleteNewsArticle(state, String(payload.articleId || ''));
        writePortalDb(nextState);
        return NextResponse.json({ state: nextState });
      }

      case 'ADMIN_UPDATE_ARTICLE': {
        if (!verifyAdminLogin(payload.adminUsername || '', payload.adminPassword || '')) {
          return NextResponse.json({ error: 'Unauthorized Admin Action' }, { status: 403 });
        }
        const nextState = updateNewsArticle(
          state,
          String(payload.articleId || ''),
          payload.updates || {}
        );
        writePortalDb(nextState);
        return NextResponse.json({ state: nextState });
      }

      case 'ADMIN_DELETE_AD': {
        if (!verifyAdminLogin(payload.adminUsername || '', payload.adminPassword || '')) {
          return NextResponse.json({ error: 'Unauthorized Admin Action' }, { status: 403 });
        }
        const nextState = deletePrivateAd(state, String(payload.adId || ''));
        writePortalDb(nextState);
        return NextResponse.json({ state: nextState });
      }

      case 'ADMIN_UPDATE_AD': {
        if (!verifyAdminLogin(payload.adminUsername || '', payload.adminPassword || '')) {
          return NextResponse.json({ error: 'Unauthorized Admin Action' }, { status: 403 });
        }
        const nextState = updatePrivateAd(
          state,
          String(payload.adId || ''),
          payload.updates || {}
        );
        writePortalDb(nextState);
        return NextResponse.json({ state: nextState });
      }

      case 'ADMIN_ADD_YOUTUBE': {
        if (!verifyAdminLogin(payload.adminUsername || '', payload.adminPassword || '')) {
          return NextResponse.json({ error: 'Unauthorized Admin Action' }, { status: 403 });
        }
        const nextState = addYoutubeUpdate(state, payload.youtubeInput);
        writePortalDb(nextState);
        return NextResponse.json({ state: nextState });
      }

      case 'ADMIN_DELETE_YOUTUBE': {
        if (!verifyAdminLogin(payload.adminUsername || '', payload.adminPassword || '')) {
          return NextResponse.json({ error: 'Unauthorized Admin Action' }, { status: 403 });
        }
        const nextState = deleteYoutubeUpdate(state, String(payload.youtubeId || ''));
        writePortalDb(nextState);
        return NextResponse.json({ state: nextState });
      }

      case 'ADMIN_DELETE_REPORTER': {
        if (!verifyAdminLogin(payload.adminUsername || '', payload.adminPassword || '')) {
          return NextResponse.json({ error: 'Unauthorized Admin Action' }, { status: 403 });
        }
        const nextState = deleteReporter(state, String(payload.reporterId || ''));
        writePortalDb(nextState);
        return NextResponse.json({ state: nextState });
      }

      case 'ADMIN_IMPORT_DATABASE': {
        if (!verifyAdminLogin(payload.adminUsername || '', payload.adminPassword || '')) {
          return NextResponse.json({ error: 'Unauthorized Admin Action' }, { status: 403 });
        }
        const importedState = payload.importedState as PortalState;
        if (!importedState || !Array.isArray(importedState.articles)) {
          return NextResponse.json({ error: 'Invalid database backup file' }, { status: 400 });
        }
        writePortalDb(importedState);
        return NextResponse.json({ state: importedState });
      }

      case 'REGISTER_MEDIA_STAFF': {
        const isAdminOrIt =
          Boolean(payload.autoApprove) &&
          (verifyAdminLogin(payload.adminUsername || '', payload.adminPassword || '') ||
            Boolean(payload.byItSysAdmin));
        const { nextState, staff } = registerMediaStaff(state, {
          ...payload,
          autoApprove: isAdminOrIt
        });
        writePortalDb(nextState);
        return NextResponse.json({ state: nextState, staff });
      }

      case 'APPROVE_MEDIA_STAFF': {
        const { nextState, staff } = approveMediaStaff(state, String(payload.staffId || ''));
        writePortalDb(nextState);
        return NextResponse.json({ state: nextState, staff });
      }

      case 'CHANGE_MEDIA_STAFF_PASSWORD': {
        const { nextState, staff } = updateMediaStaffPassword(
          state,
          String(payload.staffId || ''),
          String(payload.newPassword || '')
        );
        writePortalDb(nextState);
        return NextResponse.json({ state: nextState, staff });
      }

      case 'SET_MEDIA_STAFF_BLOCK': {
        const { nextState, staff } = setMediaStaffBlockStatus(
          state,
          String(payload.staffId || ''),
          Boolean(payload.blocked)
        );
        writePortalDb(nextState);
        return NextResponse.json({ state: nextState, staff });
      }

      case 'DELETE_MEDIA_STAFF': {
        const nextState = deleteMediaStaff(state, String(payload.staffId || ''));
        writePortalDb(nextState);
        return NextResponse.json({ state: nextState });
      }

      case 'UPDATE_EPAPER_PAGE_WORKFLOW': {
        const nextState = updateEpaperPageWorkflow(
          state,
          String(payload.pageId || ''),
          payload.updates || {}
        );
        writePortalDb(nextState);
        return NextResponse.json({ state: nextState });
      }

      case 'STAFF_PUBLISH_NEWS': {
        const input = payload.newsInput || {};
        const newArticle: NewsArticle = {
          id: `art-staff-${Date.now()}`,
          level: input.level || 'state',
          category: input.category || 'న్యూస్‌రూమ్ డెస్క్ · Editorial Desk',
          state: input.state || 'Telangana (తెలంగాణ)',
          district: input.district || 'Hyderabad (హైదరాబాద్)',
          mandal: input.mandal || 'Khairatabad (ఖైరతాబాద్)',
          title: {
            te: input.titleTe,
            hi: input.titleHi || input.titleTe,
            en: input.titleEn || input.titleTe
          },
          summary: {
            te: input.summaryTe || input.titleTe,
            hi: input.summaryTe || input.titleTe,
            en: input.summaryTe || input.titleTe
          },
          content: {
            te: input.contentTe || input.summaryTe || input.titleTe,
            hi: input.contentTe || input.summaryTe || input.titleTe,
            en: input.contentTe || input.summaryTe || input.titleTe
          },
          imageUrl: input.imageUrl || '/images/national-parliament.svg',
          youtubeUrl: input.youtubeUrl || undefined,
          authorName: input.authorName || 'నేటి భారతం ఎడిటోరియల్ డెస్క్',
          publishedAt: 'ఇప్పుడే · Just now',
          views: 1,
          isBreaking: true
        };
        const nextState: PortalState = {
          ...state,
          articles: [newArticle, ...state.articles],
          notifications: [
            {
              id: `notif-${Date.now()}`,
              title: newArticle.title,
              timestamp: 'Just now',
              level: newArticle.level
            },
            ...state.notifications
          ]
        };
        writePortalDb(nextState);
        return NextResponse.json({ state: nextState, article: newArticle });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Operation failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
