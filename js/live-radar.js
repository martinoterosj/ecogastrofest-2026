/**
 * GASTROFEST 2026 - LIVE RADAR ENGINE
 * Real-time event tracking, countdowns, and time simulator
 */

const LiveRadar = {
  simulatedTime: null, // "HH:MM" or null for system clock
  intervalId: null,

  init() {
    this.update();
    this.startClock();
    this.setupSimulator();
  },

  getCurrentMinutes() {
    if (this.simulatedTime) {
      const [h, m] = this.simulatedTime.split(':').map(Number);
      return h * 60 + m;
    }
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  },

  getCurrentTimeString() {
    if (this.simulatedTime) {
      return this.simulatedTime;
    }
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  },

  timeToMinutes(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  },

  update() {
    const currentMins = this.getCurrentMinutes();
    const timeStr = this.getCurrentTimeString();

    // Update time label in header & radar
    const timeDisplayEl = document.getElementById('currentTimeDisplay');
    if (timeDisplayEl) {
      timeDisplayEl.innerHTML = `🕒 <strong>${timeStr} hs</strong> ${this.simulatedTime ? '<span style="color:var(--accent-primary)">(Simulado)</span>' : ''}`;
    }

    // Find ongoing live event
    const liveEvent = GASTRO_DATA.schedule.find(ev => {
      const start = this.timeToMinutes(ev.startTime);
      const end = this.timeToMinutes(ev.endTime);
      return currentMins >= start && currentMins < end;
    });

    // Find next upcoming event
    const nextEvent = GASTRO_DATA.schedule.find(ev => {
      const start = this.timeToMinutes(ev.startTime);
      return start > currentMins;
    });

    this.renderLiveBanner(liveEvent, currentMins);
    this.renderNextBanner(nextEvent, currentMins);

    // Also notify Agenda to highlight live cards
    if (window.Agenda) {
      Agenda.highlightLiveEvent(liveEvent ? liveEvent.id : null);
    }
  },

  renderLiveBanner(liveEvent, currentMins) {
    const liveContainer = document.getElementById('liveEventContainer');
    if (!liveContainer) return;

    if (liveEvent) {
      const start = this.timeToMinutes(liveEvent.startTime);
      const end = this.timeToMinutes(liveEvent.endTime);
      const totalDuration = end - start;
      const elapsed = currentMins - start;
      const progressPercent = Math.min(100, Math.max(5, Math.round((elapsed / totalDuration) * 100)));

      liveContainer.innerHTML = `
        <div class="live-show-info">
          ${liveEvent.image ? `
            <div class="live-artist-banner" style="width:100%; height:140px; border-radius:var(--radius-md); overflow:hidden; margin-bottom:10px; border:1px solid rgba(52,211,153,0.3); position:relative;">
              <img src="${liveEvent.image}" alt="${liveEvent.speaker}" style="width:100%; height:100%; object-fit:cover; object-position:center;">
              <div style="position:absolute; inset:0; background:linear-gradient(180deg, transparent 40%, rgba(7,17,12,0.85) 100%);"></div>
            </div>
          ` : ''}
          <h3>${liveEvent.title}</h3>
          <div class="live-meta">
            <span class="meta-item">📍 ${liveEvent.stageName}</span>
            <span class="meta-item">${liveEvent.speakerAvatar} ${liveEvent.speaker}</span>
            <span class="meta-item">⏱️ ${liveEvent.startTime} a ${liveEvent.endTime}</span>
          </div>
          <div class="live-progress-container" title="${progressPercent}% transcurrido">
            <div class="live-progress-bar" style="width: ${progressPercent}%"></div>
          </div>
          <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.35;">${liveEvent.description}</p>
        </div>
      `;
    } else {
      liveContainer.innerHTML = `
        <div class="live-show-info" style="padding: 10px 0;">
          <h3 style="color: var(--text-secondary); font-size: 1.05rem;">Sin shows en vivo en este momento</h3>
          <p style="font-size: 0.82rem; color: var(--text-muted); margin-top: 4px;">
            Disfruta del patio gastronómico, visita los stands y prueba los platos destacados.
          </p>
        </div>
      `;
    }
  },

  renderNextBanner(nextEvent, currentMins) {
    const nextContainer = document.getElementById('nextEventContainer');
    if (!nextContainer) return;

    if (nextEvent) {
      const start = this.timeToMinutes(nextEvent.startTime);
      const diffMins = start - currentMins;
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      const countdownStr = hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;

      nextContainer.innerHTML = `
        <div class="next-up-strip">
          <div class="next-up-left">
            <span class="label">A Continuación (${nextEvent.startTime} hs)</span>
            <span class="title">${nextEvent.title}</span>
            <span style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">📍 ${nextEvent.stageName}</span>
          </div>
          <div class="countdown-box">
            <span class="time">${countdownStr}</span>
            <span class="unit">Comienza en</span>
          </div>
        </div>
      `;
    } else {
      nextContainer.innerHTML = `
        <div class="next-up-strip">
          <div class="next-up-left">
            <span class="label">Fin de Jornada</span>
            <span class="title">¡Gracias por ser parte de GastroFest 2026!</span>
          </div>
        </div>
      `;
    }
  },

  startClock() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      this.update();
    }, 15000); // Check every 15s
  },

  setupSimulator() {
    const simBtns = document.querySelectorAll('.btn-sim-time');
    simBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        simBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const timeVal = btn.dataset.time;
        if (timeVal === 'real') {
          this.simulatedTime = null;
        } else {
          this.simulatedTime = timeVal;
        }
        this.update();
        if (window.App) {
          App.showToast(`🕒 Hora ajustada a: ${timeVal === 'real' ? 'Hora Real' : timeVal + ' hs'}`);
        }
      });
    });
  }
};
