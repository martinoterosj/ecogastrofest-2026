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

  selectedZoneId: null,

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
    const gmapsBtn = document.getElementById('venueMapsBtn') || document.querySelector('.btn-gmaps');
    const wazeBtn = document.getElementById('venueWazeBtn') || document.querySelector('.btn-waze');
    if (gmapsBtn && ev.mapsUrl) gmapsBtn.href = ev.mapsUrl;
    if (wazeBtn && ev.wazeUrl) wazeBtn.href = ev.wazeUrl;

    // Parking, Payment, First Aid FAQs
    const parkingEl = document.getElementById('infoParkingText');
    const paymentEl = document.getElementById('infoPaymentText');
    const firstAidEl = document.getElementById('infoFirstAidText');
    if (parkingEl && ev.parkingInfo) parkingEl.textContent = ev.parkingInfo;
    if (paymentEl && ev.paymentInfo) paymentEl.textContent = ev.paymentInfo;
    if (firstAidEl && ev.firstAidInfo) firstAidEl.textContent = ev.firstAidInfo;

    // Render Satellite Map Pins & Zone Selector
    this.renderVisitorMap();

    // Venue Schematic Zones
    const zonesContainer = document.getElementById('mapZonesGrid');
    if (zonesContainer && GASTRO_DATA.zones) {
      zonesContainer.innerHTML = GASTRO_DATA.zones.map(z => {
        const isSelected = this.selectedZoneId === z.id;
        const color = z.color || '#10b981';
        return `
          <button class="map-zone-pill ${isSelected ? 'active' : ''}" 
                  style="--zone-pill-color: ${color};" 
                  onclick="App.selectVisitorZone('${z.id}')">
            <span class="zone-code" style="color:${color};">${z.icon || '📍'} ${z.code}</span>
            <span class="zone-name">${z.name}</span>
          </button>
        `;
      }).join('');
    }
  },

  renderVisitorMap() {
    const pinsLayer = document.getElementById('visitorMapPinsLayer');
    if (!pinsLayer || !GASTRO_DATA.zones) return;

    pinsLayer.innerHTML = GASTRO_DATA.zones.map(z => {
      const isSelected = this.selectedZoneId === z.id;
      const color = z.color || '#10b981';
      return `
        <div class="visitor-map-pin ${isSelected ? 'is-active' : ''}" 
             style="left: ${z.x}%; top: ${z.y}%; --pin-color: ${color};" 
             onclick="App.selectVisitorZone('${z.id}')"
             title="${z.code}: ${z.name}">
          <div class="visitor-pin-head" style="background: ${color};">
            <span>${z.icon || '📍'}</span>
          </div>
          <div class="visitor-pin-label" style="border-color: ${color};">
            ${z.code}
          </div>
        </div>
      `;
    }).join('');
  },

  selectVisitorZone(zoneId) {
    if (!GASTRO_DATA.zones) return;
    const zone = GASTRO_DATA.zones.find(z => z.id === zoneId);
    if (!zone) return;

    this.selectedZoneId = zoneId;
    this.renderVisitorMap();

    // Update active pill
    const pills = document.querySelectorAll('.map-zone-pill');
    pills.forEach(p => p.classList.remove('active'));

    const detailBox = document.getElementById('visitorZoneDetailBox');
    if (!detailBox) return;

    const color = zone.color || '#10b981';
    
    // Find stands matching this zone code/name
    const matchingStands = (GASTRO_DATA.stands || []).filter(st => 
      (st.zone && (st.zone.toLowerCase().includes(zone.code.toLowerCase()) || zone.name.toLowerCase().includes(st.zone.toLowerCase())))
    );

    // Find shows on this stage if it's a stage zone
    const matchingShows = (GASTRO_DATA.schedule || []).filter(ev => 
      (ev.stageName && (ev.stageName.toLowerCase().includes(zone.name.toLowerCase()) || zone.name.toLowerCase().includes(ev.stageName.toLowerCase())))
    );

    detailBox.innerHTML = `
      <div class="zone-detail-card" style="border-left-color: ${color};">
        <div class="zone-detail-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="zone-detail-icon" style="background: ${color}25; border-color: ${color}; color: ${color};">
              ${zone.icon || '📍'}
            </span>
            <div>
              <h4 style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 800; color: #ffffff; margin: 0;">
                ${zone.name}
              </h4>
              <span style="font-size: 0.7rem; font-weight: 800; color: ${color}; text-transform: uppercase;">
                ${zone.code} ${zone.category ? `• ${zone.category}` : ''}
              </span>
            </div>
          </div>
          <button class="btn-close-zone-detail" onclick="App.closeVisitorZoneDetail()" aria-label="Cerrar">✕</button>
        </div>

        <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.4; margin: 8px 0;">
          ${zone.description || 'Sector oficial de Plaza Independencia acondicionado para el festival.'}
        </p>

        ${matchingStands.length > 0 ? `
          <div style="margin-top: 6px;">
            <span style="font-size: 0.72rem; font-weight: 800; color: #a7d0ba; text-transform: uppercase;">
              🍴 Puestos en este sector (${matchingStands.length}):
            </span>
            <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px;">
              ${matchingStands.map(st => `
                <button type="button" class="zone-stand-chip" onclick="App.navigateToStand('${st.id}')">
                  ${st.number} - ${st.name} ➔
                </button>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${matchingShows.length > 0 ? `
          <div style="margin-top: 8px;">
            <span style="font-size: 0.72rem; font-weight: 800; color: #fde68a; text-transform: uppercase;">
              🎤 Próximos Shows en esta Zona (${matchingShows.length}):
            </span>
            <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 4px;">
              ${matchingShows.slice(0, 2).map(ev => `
                <div style="font-size: 0.78rem; color: var(--text-primary); display:flex; justify-content:space-between; background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: var(--radius-sm);">
                  <span>${ev.speakerAvatar || '👨‍🍳'} <strong>${ev.title}</strong></span>
                  <span style="color: var(--color-gold); font-weight: 700;">🕒 ${ev.startTime}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;

    detailBox.style.display = 'block';
    if (detailBox.scrollIntoView) {
      detailBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  },

  closeVisitorZoneDetail() {
    this.selectedZoneId = null;
    this.renderVisitorMap();
    const detailBox = document.getElementById('visitorZoneDetailBox');
    if (detailBox) detailBox.style.display = 'none';
  },

  navigateToStand(standId) {
    this.switchTab('stands');
    setTimeout(() => {
      if (window.Stands) Stands.openStandModal(standId);
    }, 150);
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    App.init();
  });
} else {
  App.init();
}
