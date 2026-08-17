/**
 * ECOGASTROFEST 2026 - REALTIME LIVE SYNC CLIENT (HYBRID: FIREBASE FIRESTORE / REST)
 * Sincroniza categorías, escenarios, sponsors, stands, agenda y avisos en vivo
 */

const LiveSync = {
  syncInterval: null,
  lastAnnouncementId: null,

  async init() {
    // 1. Initialize Database Adapter (Cloud Firestore or Local)
    if (window.DBAdapter) {
      const isCloud = await DBAdapter.init();
      if (isCloud) {
        console.log('☁️ LiveSync conectado a Firebase Firestore Realtime');
        DBAdapter.subscribe((data) => {
          this.applyUpdates(data);
        });
        return;
      }
    }

    // 2. Fallback: Local Server Polling
    this.syncWithBackend();
    this.startAutoSync();
  },

  async syncWithBackend() {
    try {
      const res = await fetch('./api/sync');
      if (res.ok) {
        const data = await res.json();
        this.applyUpdates(data);
      }
    } catch (e) {
      // Offline fallback: keep local cached data
    }
  },

  applyUpdates(data) {
    if (!data) return;

    // 1. Update global datasets
    if (data.event) GASTRO_DATA.event = data.event;
    if (data.showCategories) GASTRO_DATA.showCategories = data.showCategories;
    if (data.standCategories) GASTRO_DATA.standCategories = data.standCategories;
    if (data.stages) GASTRO_DATA.stages = data.stages;
    if (data.zones) GASTRO_DATA.zones = data.zones;
    if (data.sponsors) GASTRO_DATA.sponsors = data.sponsors;
    if (data.schedule) GASTRO_DATA.schedule = data.schedule;
    if (data.stands) GASTRO_DATA.stands = data.stands;

    // 2. Render Flash Announcements Banner on Visitor App
    if (data.announcements && data.announcements.length > 0) {
      const latestAnn = data.announcements[data.announcements.length - 1];
      this.renderFlashBanner(latestAnn);
    } else {
      this.hideFlashBanner();
    }

    // 3. Refresh Dynamic UI Modules
    if (window.App) {
      App.renderDynamicEventInfo();
      App.renderSponsors();
    }
    if (window.LiveRadar) LiveRadar.update();
    if (window.Agenda) {
      Agenda.renderFilters();
      Agenda.render();
    }
    if (window.Stands) {
      Stands.renderFilters();
      Stands.render();
    }
  },

  renderFlashBanner(ann) {
    let banner = document.getElementById('visitorFlashBanner');
    if (!banner) {
      const main = document.querySelector('main.tab-content-area');
      if (!main) return;
      banner = document.createElement('div');
      banner.id = 'visitorFlashBanner';
      banner.style.cssText = `
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(245, 158, 11, 0.2) 100%);
        border: 1px solid rgba(239, 68, 68, 0.45);
        border-radius: var(--radius-lg);
        padding: 12px 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 4px 16px rgba(239, 68, 68, 0.2);
        animation: fadeInTab 0.3s ease;
      `;
      main.insertBefore(banner, main.firstChild);
    }

    banner.innerHTML = `
      <span style="font-size: 1.8rem;">${ann.icon || '📢'}</span>
      <div style="flex: 1;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 0.72rem; color: #ff6b6b; font-weight: 800; text-transform: uppercase;">Aviso en Vivo (${ann.createdAt || 'Ahora'})</span>
        </div>
        <strong style="font-size: 0.92rem; color: white; display: block;">${ann.title}</strong>
        <p style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">${ann.message}</p>
      </div>
    `;
    banner.style.display = 'flex';

    if (this.lastAnnouncementId !== ann.id) {
      this.lastAnnouncementId = ann.id;
      if (window.App) {
        App.playBeep(880, 0.15);
      }
    }
  },

  hideFlashBanner() {
    const banner = document.getElementById('visitorFlashBanner');
    if (banner) banner.style.display = 'none';
  },

  startAutoSync() {
    if (this.syncInterval) clearInterval(this.syncInterval);
    this.syncInterval = setInterval(() => {
      this.syncWithBackend();
    }, 4000);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  LiveSync.init();
});
