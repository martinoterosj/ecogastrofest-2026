/**
 * GASTROFEST 2026 - STANDS & MENU DIRECTORY (100% DYNAMIC)
 * Dynamically generated category filters from DB, dietary filters & live stock indicators
 */

const Stands = {
  currentCategory: 'all',
  searchQuery: '',
  activeDietary: null,

  init() {
    this.renderFilters();
    this.setupListeners();
    this.render();
  },

  renderFilters() {
    const wrapper = document.getElementById('standsFilters');
    if (!wrapper || !GASTRO_DATA.standCategories) return;

    let html = `<button class="filter-chip ${this.currentCategory === 'all' ? 'active' : ''}" data-category="all">🍔 Todos</button>`;

    GASTRO_DATA.standCategories.forEach(cat => {
      const isActive = this.currentCategory === cat.id;
      html += `
        <button class="filter-chip ${isActive ? 'active' : ''}" data-category="${cat.id}">
          ${cat.icon || '🍽️'} ${cat.name}
        </button>
      `;
    });

    wrapper.innerHTML = html;
    this.setupFilterListeners();
  },

  setupFilterListeners() {
    const chips = document.querySelectorAll('#standsFilters .filter-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.currentCategory = chip.dataset.category;
        this.render();
      });
    });
  },

  setupListeners() {
    const searchInput = document.getElementById('standsSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.render();
      });
    }

    const closeBtn = document.getElementById('closeStandModal');
    const overlay = document.getElementById('standModalOverlay');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeModal());
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.closeModal();
      });
    }
  },

  setDietaryFilter(type) {
    if (this.activeDietary === type) {
      this.activeDietary = null;
    } else {
      this.activeDietary = type;
    }
    this.render();
  },

  openStandModal(standId) {
    const stand = GASTRO_DATA.stands.find(s => s.id === standId);
    if (!stand) return;

    const modal = document.getElementById('standModalOverlay');
    const content = document.getElementById('standModalContent');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="sheet-handle"></div>
      <button class="btn-close-modal" id="modalCloseActionBtn" onclick="Stands.closeModal()" aria-label="Cerrar">✕</button>
      
      <div style="display: flex; align-items: center; gap: 10px; margin-top: 4px;">
        <span style="font-size: 1.8rem;">${stand.fallbackEmoji || '🍽️'}</span>
        <div>
          <span style="font-size: 0.75rem; color: var(--accent-primary); font-weight: 800; text-transform: uppercase;">${stand.number} • ${stand.zone}</span>
          <h2 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 900; line-height: 1.1;">${stand.name}</h2>
        </div>
      </div>

      <div class="stand-tags" style="margin-top: 4px;">
        <span class="tag-badge" style="background: rgba(255, 94, 30, 0.15); color: var(--accent-primary);">${stand.categoryName}</span>
        ${stand.isGlutenFree ? '<span class="tag-badge tag-gluten-free">🌾 Opciones Sin TACC</span>' : ''}
        ${stand.isVegan ? '<span class="tag-badge tag-vegan">🌱 Opciones Veganas</span>' : ''}
      </div>

      <div style="background: var(--bg-tertiary); border: 1px solid var(--border-subtle); padding: 12px; border-radius: var(--radius-md);">
        <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 800; display: block; margin-bottom: 2px;">Plato Estrella Recomendado</span>
        <strong style="color: var(--text-primary); font-size: 0.95rem;">⭐ ${stand.featuredDish || 'Especialidad'}</strong>
      </div>

      <div>
        <h4 style="font-family: var(--font-heading); font-size: 1.1rem; font-weight: 800; margin-bottom: 10px; color: var(--text-primary);">Menú & Precios de la Feria</h4>
        <div class="menu-list">
          ${stand.menu.map(m => `
            <div class="menu-item-row" style="${m.isSoldOut ? 'opacity: 0.6; border: 1px dashed rgba(239,68,68,0.4);' : ''}">
              <div style="flex: 1; padding-right: 12px;">
                <div class="menu-item-title" style="${m.isSoldOut ? 'text-decoration: line-through;' : ''}">${m.item}</div>
                <div class="menu-item-desc">${m.desc || ''}</div>
              </div>
              <div style="text-align: right;">
                <div class="menu-item-price" style="${m.isSoldOut ? 'color: #ef4444; font-size: 0.8rem;' : ''}">
                  ${m.isSoldOut ? '🔴 AGOTADO' : m.price}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <button class="btn-primary-action" onclick="Stands.voteFavoriteStand('${stand.name}')" style="margin-top: 6px;">
        ❤️ Votar como mi Stand Favorito
      </button>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  closeModal() {
    const modal = document.getElementById('standModalOverlay');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
  },

  voteFavoriteStand(standName) {
    App.showToast(`❤️ ¡Has votado a "${standName}" para el Gran Premio!`);
    App.playBeep(700, 0.1);
    
    const standSelect = document.getElementById('raffleStandSelect');
    if (standSelect) {
      for (let i = 0; i < standSelect.options.length; i++) {
        if (standSelect.options[i].text.includes(standName)) {
          standSelect.selectedIndex = i;
          break;
        }
      }
    }
    this.closeModal();
  },

  render() {
    const container = document.getElementById('standsListContainer');
    if (!container || !GASTRO_DATA.stands) return;

    let items = GASTRO_DATA.stands.filter(st => {
      // Category filter
      if (this.currentCategory !== 'all' && st.category !== this.currentCategory) {
        return false;
      }

      // Dietary filter
      if (this.activeDietary === 'gluten-free' && !st.isGlutenFree) return false;
      if (this.activeDietary === 'vegan' && !st.isVegan) return false;

      // Search
      if (this.searchQuery) {
        const matchName = (st.name || '').toLowerCase().includes(this.searchQuery);
        const matchDish = (st.featuredDish || '').toLowerCase().includes(this.searchQuery);
        const matchCategory = (st.categoryName || '').toLowerCase().includes(this.searchQuery);
        const matchMenu = (st.menu || []).some(m => (m.item || '').toLowerCase().includes(this.searchQuery));
        if (!matchName && !matchDish && !matchCategory && !matchMenu) return false;
      }

      return true;
    });

    const countBadge = document.getElementById('standsCountBadge');
    if (countBadge) {
      countBadge.textContent = `${items.length} stands`;
    }

    if (items.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
          <div style="font-size: 2.5rem; margin-bottom: 8px;">🍽️</div>
          <h4 style="color: var(--text-primary); font-size: 1.05rem;">No encontramos stands con ese criterio</h4>
          <p style="font-size: 0.82rem; margin-top: 4px;">Intenta con otro término de búsqueda o categoría.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(st => {
      const soldOutCount = (st.menu || []).filter(m => m.isSoldOut).length;
      return `
        <article class="stand-card" onclick="Stands.openStandModal('${st.id}')">
          <div class="stand-img-box" style="background-image: url('${st.image}')">
            <span class="stand-location-badge">📍 ${st.number} • ${st.zone}</span>
            ${soldOutCount > 0 ? `<span style="position:absolute; top:10px; right:10px; background:rgba(239,68,68,0.9); color:white; font-size:0.68rem; font-weight:800; padding:3px 8px; border-radius:var(--radius-sm);">⚠️ ${soldOutCount} plato(s) agotado(s)</span>` : ''}
          </div>
          <div class="stand-card-content">
            <div class="stand-card-header">
              <h3>${st.name}</h3>
              <span class="price-indicator">${st.rating}</span>
            </div>

            <div class="stand-tags">
              <span class="tag-badge">${st.categoryName}</span>
              ${st.isGlutenFree ? '<span class="tag-badge tag-gluten-free">🌾 Sin TACC</span>' : ''}
              ${st.isVegan ? '<span class="tag-badge tag-vegan">🌱 Vegano</span>' : ''}
            </div>

            <div class="stand-featured-dish">
              <span>🌟</span>
              <span>Especialidad: <strong>${st.featuredDish}</strong></span>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; padding-top: 6px; border-top: 1px solid var(--border-subtle);">
              <span style="font-size: 0.75rem; color: var(--text-muted);">Toca para ver el menú completo</span>
              <span style="color: var(--accent-primary); font-size: 0.82rem; font-weight: 800;">Ver Menú →</span>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }
};
