/**
 * ECOGASTROFEST 2026 - AGENDA & TIMELINE MODULE (100% DYNAMIC & FULLY TESTED)
 * Dynamically generated category filters from DB, search & favorites
 */

const Agenda = {
  currentCategory: 'all',
  searchQuery: '',
  favorites: [],
  currentLiveId: null,

  init() {
    this.loadFavorites();
    this.renderFilters();
    this.setupListeners();
    this.render();
  },

  loadFavorites() {
    try {
      const saved = localStorage.getItem('gastrofest_favorites');
      this.favorites = saved ? JSON.parse(saved) : [];
    } catch (e) {
      this.favorites = [];
    }
  },

  saveFavorites() {
    try {
      localStorage.setItem('gastrofest_favorites', JSON.stringify(this.favorites));
    } catch (e) {
      console.warn('Could not save favorites');
    }
  },

  toggleFavorite(eventId) {
    const idx = this.favorites.indexOf(eventId);
    if (idx > -1) {
      this.favorites.splice(idx, 1);
      App.showToast('⭐ Eliminado de tus favoritos');
    } else {
      this.favorites.push(eventId);
      App.showToast('⭐ ¡Guardado en tus favoritos!');
      App.playBeep(600, 0.08);
    }
    this.saveFavorites();
    this.render();
  },

  renderFilters() {
    const wrapper = document.getElementById('agendaFilters');
    if (!wrapper || !GASTRO_DATA.showCategories) return;

    let html = `
      <button class="filter-chip ${this.currentCategory === 'all' ? 'active' : ''}" data-category="all">✨ Todos</button>
      <button class="filter-chip ${this.currentCategory === 'favorites' ? 'active' : ''}" data-category="favorites">⭐ Mis Favoritos</button>
    `;

    GASTRO_DATA.showCategories.forEach(cat => {
      const isActive = this.currentCategory === cat.id;
      html += `
        <button class="filter-chip ${isActive ? 'active' : ''}" data-category="${cat.id}">
          ${cat.icon || '🔥'} ${cat.name}
        </button>
      `;
    });

    wrapper.innerHTML = html;
    this.setupFilterListeners();
  },

  setupFilterListeners() {
    const chips = document.querySelectorAll('#agendaFilters .filter-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.currentCategory = chip.dataset.category || 'all';
        this.render();
      });
    });
  },

  setupListeners() {
    const searchInput = document.getElementById('agendaSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.render();
      });
    }
  },

  highlightLiveEvent(liveId) {
    this.currentLiveId = liveId;
    const cards = document.querySelectorAll('.agenda-card');
    cards.forEach(card => {
      if (card.dataset.id === liveId) {
        card.classList.add('is-live');
      } else {
        card.classList.remove('is-live');
      }
    });
  },

  render() {
    const container = document.getElementById('agendaListContainer');
    if (!container || !GASTRO_DATA.schedule) return;

    let items = GASTRO_DATA.schedule.filter(ev => {
      // Category filter
      if (this.currentCategory === 'favorites') {
        if (!this.favorites.includes(ev.id)) return false;
      } else if (this.currentCategory !== 'all') {
        if (ev.category !== this.currentCategory) return false;
      }

      // Search filter
      if (this.searchQuery) {
        const matchTitle = (ev.title || '').toLowerCase().includes(this.searchQuery);
        const matchSpeaker = (ev.speaker || '').toLowerCase().includes(this.searchQuery);
        const matchStage = (ev.stageName || '').toLowerCase().includes(this.searchQuery);
        if (!matchTitle && !matchSpeaker && !matchStage) return false;
      }

      return true;
    });

    // Update count badge
    const countBadge = document.getElementById('agendaCountBadge');
    if (countBadge) {
      countBadge.textContent = `${items.length} shows`;
    }

    if (items.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary); grid-column: 1 / -1;">
          <div style="font-size: 2.5rem; margin-bottom: 8px;">🔍</div>
          <h4 style="color: var(--text-primary); font-size: 1.05rem;">No encontramos actividades</h4>
          <p style="font-size: 0.82rem; margin-top: 4px;">
            ${this.currentCategory === 'favorites' 
              ? 'Aún no has agregado shows a favoritos. ¡Toca la estrella ⭐ en cualquier show para guardarlo!' 
              : 'Prueba cambiando los filtros de búsqueda o categoría.'}
          </p>
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(ev => {
      const isFav = this.favorites.includes(ev.id);
      const isLive = ev.id === this.currentLiveId || ev.status === 'live';

      return `
        <article class="agenda-card ${isLive ? 'is-live' : ''}" data-id="${ev.id}">
          <div class="agenda-card-top">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="agenda-time-pill">⏰ ${ev.startTime} - ${ev.endTime}</span>
              ${isLive ? '<span class="live-badge-pulse" style="font-size:0.65rem; padding:2px 6px;"><span class="live-dot"></span> EN VIVO</span>' : ''}
              ${ev.status === 'delayed' ? '<span style="font-size:0.7rem; color:var(--color-gold); font-weight:800;">⚠️ Con Retraso</span>' : ''}
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span class="agenda-stage-tag">${ev.badge || 'Show'}</span>
              <button class="btn-favorite ${isFav ? 'active' : ''}" onclick="Agenda.toggleFavorite('${ev.id}')" aria-label="Favorito">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="${isFav ? '#eab308' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </button>
            </div>
          </div>

          <h4>${ev.title}</h4>
          ${ev.image ? `
            <div class="agenda-artist-banner">
              <img src="${ev.image}" alt="${ev.speaker}" loading="lazy">
            </div>
          ` : ''}
          <p class="desc">${ev.description || ''}</p>

          <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-subtle); padding-top: 8px; margin-top: 2px;">
            <div class="agenda-speaker">
              <span class="speaker-avatar">${ev.speakerAvatar || '👨‍🍳'}</span>
              <span class="speaker-name">${ev.speaker}</span>
            </div>
            <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600;">📍 ${ev.stageName}</span>
          </div>
        </article>
      `;
    }).join('');
  }
};
