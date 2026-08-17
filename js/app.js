/**
 * GASTROFEST 2026 - MAIN APP COORDINATOR (100% DYNAMIC)
 * Renders dynamic event info, venue guidelines, sponsors & tab router
 */

const App = {
  currentTab: 'live',
  audioCtx: null,

  init() {
    this.setupTabNavigation();
    this.renderDynamicEventInfo();
    this.renderSponsors();

    // Init submodules
    LiveRadar.init();
    Agenda.init();
    Stands.init();
    Raffle.init();
    PWAController.init();

    // Toggle simulator drawer button
    const simToggle = document.getElementById('btnToggleSimulator');
    const simBox = document.getElementById('timeSimulatorBox');
    if (simToggle && simBox) {
      simToggle.addEventListener('click', () => {
        const isHidden = simBox.style.display === 'none';
        simBox.style.display = isHidden ? 'block' : 'none';
      });
    }

    console.log('🍔 GastroFest Dynamic Mobile App ready!');
  },

  setupTabNavigation() {
    const navItems = document.querySelectorAll('.bottom-nav .nav-item, .desktop-nav-bar .desktop-nav-btn');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const tabId = item.dataset.tab;
        this.switchTab(tabId);
      });
    });
  },

  switchTab(tabId) {
    this.currentTab = tabId;

    const navItems = document.querySelectorAll('.bottom-nav .nav-item, .desktop-nav-bar .desktop-nav-btn');
    navItems.forEach(item => {
      if (item.dataset.tab === tabId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    const panes = document.querySelectorAll('.tab-pane');
    panes.forEach(pane => {
      if (pane.id === `tab-${tabId}`) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.playBeep(800, 0.03);
  },

  renderDynamicEventInfo() {
    if (!GASTRO_DATA.event) return;
    const ev = GASTRO_DATA.event;

    // Header Title
    const brandTitle = document.querySelector('.brand-info h1');
    const brandSpan = document.querySelector('.brand-info span');
    if (brandTitle) brandTitle.textContent = ev.name || "GastroFest '26";
    if (brandSpan) brandSpan.textContent = ev.edition || "Feria Gastronómica";

    // Venue Text
    const venueEl = document.getElementById('venueAddressText');
    if (venueEl) {
      venueEl.textContent = `${ev.venue} — ${ev.address}`;
    }

    // Directions Links
    const gmapsBtn = document.querySelector('.btn-gmaps');
    const wazeBtn = document.querySelector('.btn-waze');
    if (gmapsBtn && ev.mapsUrl) gmapsBtn.href = ev.mapsUrl;
    if (wazeBtn && ev.wazeUrl) wazeBtn.href = ev.wazeUrl;

    // Parking, Payment, First Aid FAQs
    const parkingEl = document.getElementById('infoParkingText');
    const paymentEl = document.getElementById('infoPaymentText');
    const firstAidEl = document.getElementById('infoFirstAidText');
    if (parkingEl && ev.parkingInfo) parkingEl.textContent = ev.parkingInfo;
    if (paymentEl && ev.paymentInfo) paymentEl.textContent = ev.paymentInfo;
    if (firstAidEl && ev.firstAidInfo) firstAidEl.textContent = ev.firstAidInfo;

    // Venue Schematic Zones
    const zonesContainer = document.getElementById('mapZonesGrid');
    if (zonesContainer && GASTRO_DATA.zones) {
      zonesContainer.innerHTML = GASTRO_DATA.zones.map(z => `
        <div class="map-zone-pill">
          <span class="zone-code">${z.code}</span>
          <span class="zone-name">${z.name}</span>
        </div>
      `).join('');
    }
  },

  renderSponsors() {
    const goldGrid = document.getElementById('goldSponsorsGrid');
    const silverGrid = document.getElementById('silverSponsorsGrid');

    const renderSponsorCard = (sp) => `
      <div class="sponsor-logo-box">
        <div class="sponsor-logo-img-wrapper">
          ${sp.logoUrl ? `<img src="${sp.logoUrl}" alt="${sp.name}" class="sponsor-logo-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">` : ''}
          <span class="sponsor-icon" style="${sp.logoUrl ? 'display:none;' : ''}">${sp.icon || '🤝'}</span>
        </div>
        <span class="sponsor-name">${sp.name}</span>
        <span style="font-size:0.65rem; color:var(--accent-secondary); font-weight:800;">${sp.tier}</span>
      </div>
    `;

    if (goldGrid && GASTRO_DATA.sponsors && GASTRO_DATA.sponsors.gold) {
      goldGrid.innerHTML = GASTRO_DATA.sponsors.gold.map(renderSponsorCard).join('');
    }

    if (silverGrid && GASTRO_DATA.sponsors && GASTRO_DATA.sponsors.silver) {
      silverGrid.innerHTML = GASTRO_DATA.sponsors.silver.map(renderSponsorCard).join('');
    }
  },

  showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  },

  getAudioContext() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  },

  playBeep(freq = 440, duration = 0.05) {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  },

  playFanfare() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        setTimeout(() => {
          this.playBeep(freq, 0.2);
        }, i * 110);
      });
    } catch (e) {}
  },

  launchConfetti() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);

    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#FF5E1E', '#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#FEF08A'];
    const particles = [];

    for (let i = 0; i < 75; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height * 0.6,
        vx: (Math.random() - 0.5) * 16,
        vy: -Math.random() * 18 - 6,
        size: Math.random() * 8 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1
      });
    }

    let frames = 0;
    const renderConfetti = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let aliveCount = 0;

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.45;
        p.rotation += p.rotationSpeed;
        if (frames > 40) p.opacity -= 0.015;

        if (p.opacity > 0) {
          aliveCount++;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();
        }
      });

      frames++;
      if (aliveCount > 0 && frames < 140) {
        requestAnimationFrame(renderConfetti);
      } else {
        canvas.remove();
      }
    };

    requestAnimationFrame(renderConfetti);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
