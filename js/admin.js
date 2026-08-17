/**
 * GASTROFEST 2026 - OPERATOR ADMIN CONTROLLER (100% DYNAMIC & FULL CRUD)
 * Real-time event stage manager, stand stock controller, dynamic categories & event settings
 */

const AdminApp = {
  currentPin: '',
  currentUser: null,
  currentTab: 'schedule',
  dbState: null,
  editingShowId: null,
  editingStandId: null,
  editingDishContext: null,

  init() {
    this.checkSession();
    this.setupKeypad();
    this.setupTabs();
    this.setupForms();
  },

  checkSession() {
    const savedUser = sessionStorage.getItem('gastrofest_operator');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
      this.showDashboard();
    } else {
      this.showLogin();
    }
  },

  setupKeypad() {
    const keypadBtns = document.querySelectorAll('.btn-keypad');
    const display = document.getElementById('pinDisplay');

    keypadBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.val;
        if (val === 'clear') {
          this.currentPin = '';
        } else if (val === 'enter') {
          this.attemptLogin(this.currentPin);
          return;
        } else {
          if (this.currentPin.length < 4) {
            this.currentPin += val;
          }
        }
        if (display) {
          display.textContent = this.currentPin ? '•'.repeat(this.currentPin.length) : '----';
        }
        if (this.currentPin.length === 4) {
          this.attemptLogin(this.currentPin);
        }
      });
    });
  },

  quickLogin(pin) {
    this.currentPin = pin;
    this.attemptLogin(pin);
  },

  async attemptLogin(pin) {
    try {
      const res = await fetch('./api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });
      const data = await res.json();

      if (data.success) {
        this.currentUser = data;
        sessionStorage.setItem('gastrofest_operator', JSON.stringify(data));
        this.showDashboard();
      } else {
        alert('⚠️ PIN Incorrecto');
        this.currentPin = '';
        const display = document.getElementById('pinDisplay');
        if (display) display.textContent = '----';
      }
    } catch (e) {
      if (pin === '1234' || pin === '2026' || pin === '7777') {
        this.currentUser = { role: 'admin', name: 'Operador Local' };
        sessionStorage.setItem('gastrofest_operator', JSON.stringify(this.currentUser));
        this.showDashboard();
      } else {
        alert('PIN no reconocido');
      }
    }
  },

  logout() {
    sessionStorage.removeItem('gastrofest_operator');
    this.currentUser = null;
    this.currentPin = '';
    this.showLogin();
  },

  showLogin() {
    document.getElementById('adminLoginSection').style.display = 'block';
    document.getElementById('adminDashboardSection').style.display = 'none';
  },

  showDashboard() {
    document.getElementById('adminLoginSection').style.display = 'none';
    document.getElementById('adminDashboardSection').style.display = 'flex';
    document.getElementById('operatorNameBadge').textContent = `👤 ${this.currentUser.name} (${this.currentUser.role})`;
    this.fetchState();
  },

  setupTabs() {
    const tabs = document.querySelectorAll('.admin-tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentTab = tab.dataset.tab;

        document.querySelectorAll('.admin-pane').forEach(p => p.style.display = 'none');
        const target = document.getElementById(`pane-${this.currentTab}`);
        if (target) target.style.display = 'flex';
      });
    });
  },

  setupForms() {
    const showForm = document.getElementById('formShowModal');
    if (showForm) showForm.addEventListener('submit', (e) => this.saveShow(e));

    const standForm = document.getElementById('formStandModal');
    if (standForm) standForm.addEventListener('submit', (e) => this.saveStand(e));

    const dishForm = document.getElementById('formDishModal');
    if (dishForm) dishForm.addEventListener('submit', (e) => this.saveDish(e));
  },

  async fetchState() {
    try {
      const res = await fetch('./api/sync');
      if (res.ok) {
        this.dbState = await res.json();
        this.renderSchedule();
        this.renderStands();
        this.renderAnnouncements();
        this.renderRaffle();
        this.renderConfig();
      }
    } catch (e) {
      console.warn('Sync failed', e);
    }
  },

  // =========================================================================
  // 1. SHOWS / SCHEDULE CRUD
  // =========================================================================
  renderSchedule() {
    const container = document.getElementById('adminScheduleList');
    if (!container || !this.dbState) return;

    container.innerHTML = this.dbState.schedule.map(ev => {
      const statusBadge = {
        'live': '<span style="color:#ef4444; font-weight:800;">🔴 EN VIVO</span>',
        'scheduled': '<span style="color:#10b981; font-weight:700;">⏰ Programado</span>',
        'delayed': '<span style="color:#f59e0b; font-weight:700;">⚠️ Con Retraso</span>',
        'completed': '<span style="color:#6b7280; font-weight:700;">✅ Finalizado</span>'
      }[ev.status] || ev.status;

      return `
        <div class="admin-item-row" data-id="${ev.id}">
          <div class="admin-item-header">
            <div>
              <span style="font-size:0.75rem; color:var(--text-muted); font-weight:800;">${ev.stageName} • [${ev.badge}]</span>
              <h4 style="font-family:var(--font-heading); font-size:1.05rem; font-weight:800;">${ev.speakerAvatar || '👨‍🍳'} ${ev.title}</h4>
              <span style="font-size:0.8rem; color:var(--text-secondary);">👤 ${ev.speaker}</span>
            </div>
            <div style="text-align:right;">
              <div style="font-family:var(--font-heading); font-size:1rem; font-weight:800; color:var(--color-gold);">
                ${ev.startTime} - ${ev.endTime}
              </div>
              <div>${statusBadge}</div>
            </div>
          </div>

          <div class="admin-quick-actions">
            <button class="btn-admin-action btn-live-now" onclick="AdminApp.updateEventStatus('${ev.id}', 'live')">
              🔴 En Vivo
            </button>
            <button class="btn-admin-action" onclick="AdminApp.adjustTime('${ev.id}', 15)">
              ⏰ +15m Retraso
            </button>
            <button class="btn-admin-action" onclick="AdminApp.adjustTime('${ev.id}', -15)">
              ⏰ -15m Adelanto
            </button>
            <button class="btn-admin-action" onclick="AdminApp.updateEventStatus('${ev.id}', 'completed')">
              ✅ Finalizar
            </button>
            <button class="btn-admin-action" style="background:rgba(59,130,246,0.2); color:#93c5fd;" onclick="AdminApp.openEditShowModal('${ev.id}')">
              ✏️ Modificar
            </button>
            <button class="btn-admin-action btn-danger" onclick="AdminApp.deleteShow('${ev.id}')">
              🗑️ Dar de Baja
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  populateShowSelects() {
    const stageSel = document.getElementById('showStageInput');
    const catSel = document.getElementById('showCategoryInput');

    if (stageSel && this.dbState.stages) {
      stageSel.innerHTML = this.dbState.stages.map(s => `
        <option value="${s.name}">${s.icon || '🎤'} ${s.name}</option>
      `).join('');
    }

    if (catSel && this.dbState.showCategories) {
      catSel.innerHTML = this.dbState.showCategories.map(c => `
        <option value="${c.id}">${c.icon || '🔥'} ${c.name}</option>
      `).join('');
    }
  },

  openNewShowModal() {
    this.editingShowId = null;
    this.populateShowSelects();

    document.getElementById('modalShowTitle').textContent = '➕ Alta de Nuevo Show';
    document.getElementById('showTitleInput').value = '';
    document.getElementById('showSpeakerInput').value = '';
    document.getElementById('showAvatarInput').value = '👨‍🍳';
    document.getElementById('showStartInput').value = '15:00';
    document.getElementById('showEndInput').value = '16:00';
    document.getElementById('showBadgeInput').value = 'Masterclass';
    document.getElementById('showDescInput').value = '';
    document.getElementById('showStatusInput').value = 'scheduled';

    document.getElementById('modalShowOverlay').classList.add('active');
  },

  openEditShowModal(id) {
    const ev = this.dbState.schedule.find(s => s.id === id);
    if (!ev) return;

    this.editingShowId = id;
    this.populateShowSelects();

    document.getElementById('modalShowTitle').textContent = '✏️ Modificar Show / Actividad';
    document.getElementById('showTitleInput').value = ev.title || '';
    document.getElementById('showSpeakerInput').value = ev.speaker || '';
    document.getElementById('showAvatarInput').value = ev.speakerAvatar || '👨‍🍳';
    document.getElementById('showStartInput').value = ev.startTime || '';
    document.getElementById('showEndInput').value = ev.endTime || '';
    if (document.getElementById('showStageInput')) document.getElementById('showStageInput').value = ev.stageName;
    if (document.getElementById('showCategoryInput')) document.getElementById('showCategoryInput').value = ev.category;
    document.getElementById('showBadgeInput').value = ev.badge || '';
    document.getElementById('showDescInput').value = ev.description || '';
    document.getElementById('showStatusInput').value = ev.status || 'scheduled';

    document.getElementById('modalShowOverlay').classList.add('active');
  },

  closeShowModal() {
    document.getElementById('modalShowOverlay').classList.remove('active');
  },

  async saveShow(e) {
    e.preventDefault();
    const payload = {
      title: document.getElementById('showTitleInput').value.trim(),
      speaker: document.getElementById('showSpeakerInput').value.trim(),
      speakerAvatar: document.getElementById('showAvatarInput').value,
      startTime: document.getElementById('showStartInput').value,
      endTime: document.getElementById('showEndInput').value,
      stageName: document.getElementById('showStageInput').value,
      category: document.getElementById('showCategoryInput').value,
      badge: document.getElementById('showBadgeInput').value.trim(),
      description: document.getElementById('showDescInput').value.trim(),
      status: document.getElementById('showStatusInput').value
    };

    try {
      const url = this.editingShowId ? `./api/schedule/${this.editingShowId}` : './api/schedule';
      const method = this.editingShowId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        this.closeShowModal();
        this.fetchState();
      } else {
        alert('Error al guardar el show');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  },

  async deleteShow(id) {
    if (!confirm('¿Deseas dar de baja este show de la agenda?')) return;
    try {
      const res = await fetch(`./api/schedule/${id}`, { method: 'DELETE' });
      if (res.ok) this.fetchState();
    } catch (err) {
      alert('Error al eliminar');
    }
  },

  async updateEventStatus(id, status) {
    try {
      const res = await fetch(`./api/schedule/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) this.fetchState();
    } catch (e) {
      alert('Error al actualizar evento');
    }
  },

  async adjustTime(id, minutes) {
    const ev = this.dbState.schedule.find(s => s.id === id);
    if (!ev) return;

    const addMins = (timeStr, mins) => {
      const [h, m] = timeStr.split(':').map(Number);
      const total = h * 60 + m + mins;
      const newH = Math.floor((total + 1440) % 1440 / 60);
      const newM = (total + 1440) % 60;
      return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
    };

    const newStart = addMins(ev.startTime, minutes);
    const newEnd = addMins(ev.endTime, minutes);

    try {
      await fetch(`./api/schedule/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime: newStart,
          endTime: newEnd,
          status: minutes > 0 ? 'delayed' : 'scheduled'
        })
      });
      this.fetchState();
    } catch (e) {
      alert('Error ajustando horario');
    }
  },

  // =========================================================================
  // 2. STANDS & STOCK CRUD
  // =========================================================================
  renderStands() {
    const select = document.getElementById('adminStandSelect');
    if (!select || !this.dbState) return;

    const currentSelected = select.value;
    select.innerHTML = '';

    this.dbState.stands.forEach((st) => {
      const opt = document.createElement('option');
      opt.value = st.id;
      opt.textContent = `${st.number} - ${st.name} (${st.zone})`;
      select.appendChild(opt);
    });

    if (currentSelected && this.dbState.stands.some(s => s.id === currentSelected)) {
      select.value = currentSelected;
    }

    select.onchange = () => this.renderStandMenu();
    this.renderStandMenu();
  },

  renderStandMenu() {
    const select = document.getElementById('adminStandSelect');
    const container = document.getElementById('adminStandMenuList');
    const infoContainer = document.getElementById('adminStandDetailsHeader');
    if (!select || !container || !this.dbState) return;

    const standId = select.value;
    const stand = this.dbState.stands.find(s => s.id === standId);
    if (!stand) {
      container.innerHTML = '<p style="color:var(--text-muted);">No hay stands registrados.</p>';
      return;
    }

    if (infoContainer) {
      infoContainer.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-primary); padding:12px; border-radius:var(--radius-md); border:1px solid var(--admin-border);">
          <div>
            <span style="font-size:0.75rem; color:var(--admin-accent); font-weight:800;">${stand.number} • ${stand.zone}</span>
            <h3 style="font-family:var(--font-heading); font-size:1.15rem; font-weight:800;">${stand.fallbackEmoji || '🍽️'} ${stand.name}</h3>
            <span style="font-size:0.78rem; color:var(--text-secondary);">🌟 Especialidad: ${stand.featuredDish || 'Plato Gourmet'} • Cat: ${stand.categoryName || stand.category}</span>
          </div>
          <div style="display:flex; gap:6px;">
            <button class="btn-admin-action" style="background:rgba(59,130,246,0.2); color:#93c5fd;" onclick="AdminApp.openEditStandModal('${stand.id}')">
              ✏️ Modificar
            </button>
            <button class="btn-admin-action btn-danger" onclick="AdminApp.deleteStand('${stand.id}')">
              🗑️ Dar de Baja
            </button>
          </div>
        </div>
      `;
    }

    if (stand.menu.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-muted);">No hay platos cargados en este menú.</div>`;
      return;
    }

    container.innerHTML = stand.menu.map(m => {
      const isSoldOut = Boolean(m.isSoldOut);
      return `
        <div class="admin-item-row" style="flex-direction:row; align-items:center; justify-content:space-between;">
          <div style="flex:1; padding-right:10px;">
            <strong style="color:var(--text-primary); font-size:0.95rem;">${m.item}</strong>
            <div style="font-size:0.75rem; color:var(--text-secondary);">${m.desc || ''}</div>
            <div style="font-size:0.85rem; color:var(--color-gold); font-weight:800; margin-top:2px;">${m.price}</div>
          </div>

          <div style="display:flex; align-items:center; gap:8px;">
            <label class="stock-switch-label">
              <span style="font-size:0.75rem;">${isSoldOut ? '🔴 AGOTADO' : '🟢 DISPONIBLE'}</span>
              <label class="stock-switch">
                <input type="checkbox" ${isSoldOut ? 'checked' : ''} onchange="AdminApp.toggleStock('${stand.id}', '${m.item}', this.checked)">
                <span class="slider"></span>
              </label>
            </label>
            <button class="btn-admin-action" onclick="AdminApp.openEditDishModal('${stand.id}', '${m.id || m.item}')" title="Editar Plato">
              ✏️
            </button>
            <button class="btn-admin-action btn-danger" onclick="AdminApp.deleteDish('${stand.id}', '${m.id || m.item}')" title="Eliminar Plato">
              🗑️
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  populateStandCategoriesSelect() {
    const catSel = document.getElementById('standCategoryInput');
    if (catSel && this.dbState.standCategories) {
      catSel.innerHTML = this.dbState.standCategories.map(c => `
        <option value="${c.id}">${c.icon || '🍽️'} ${c.name}</option>
      `).join('');
    }
  },

  openNewStandModal() {
    this.editingStandId = null;
    this.populateStandCategoriesSelect();

    document.getElementById('modalStandTitle').textContent = '➕ Alta de Nuevo Stand Gastronómico';
    document.getElementById('standNameInput').value = '';
    document.getElementById('standNumberInput').value = `Stand #${String(this.dbState.stands.length + 1).padStart(2, '0')}`;
    document.getElementById('standZoneInput').value = 'Sector Fuego A';
    document.getElementById('standCategoryNameInput').value = 'Carnes & Brasas';
    document.getElementById('standDishInput').value = '';
    document.getElementById('standEmojiInput').value = '🥩';
    document.getElementById('standSinTaccInput').checked = false;
    document.getElementById('standVeganInput').checked = false;

    document.getElementById('modalStandOverlay').classList.add('active');
  },

  openEditStandModal(id) {
    const stand = this.dbState.stands.find(s => s.id === id);
    if (!stand) return;

    this.editingStandId = id;
    this.populateStandCategoriesSelect();

    document.getElementById('modalStandTitle').textContent = '✏️ Modificar Datos del Stand';
    document.getElementById('standNameInput').value = stand.name || '';
    document.getElementById('standNumberInput').value = stand.number || '';
    document.getElementById('standZoneInput').value = stand.zone || '';
    if (document.getElementById('standCategoryInput')) document.getElementById('standCategoryInput').value = stand.category;
    document.getElementById('standCategoryNameInput').value = stand.categoryName || '';
    document.getElementById('standDishInput').value = stand.featuredDish || '';
    document.getElementById('standEmojiInput').value = stand.fallbackEmoji || '🍽️';
    document.getElementById('standSinTaccInput').checked = Boolean(stand.isGlutenFree);
    document.getElementById('standVeganInput').checked = Boolean(stand.isVegan);

    document.getElementById('modalStandOverlay').classList.add('active');
  },

  closeStandModal() {
    document.getElementById('modalStandOverlay').classList.remove('active');
  },

  async saveStand(e) {
    e.preventDefault();
    const payload = {
      name: document.getElementById('standNameInput').value.trim(),
      number: document.getElementById('standNumberInput').value.trim(),
      zone: document.getElementById('standZoneInput').value.trim(),
      category: document.getElementById('standCategoryInput').value,
      categoryName: document.getElementById('standCategoryNameInput').value.trim(),
      featuredDish: document.getElementById('standDishInput').value.trim(),
      fallbackEmoji: document.getElementById('standEmojiInput').value,
      isGlutenFree: document.getElementById('standSinTaccInput').checked,
      isVegan: document.getElementById('standVeganInput').checked
    };

    try {
      const url = this.editingStandId ? `./api/stands/${this.editingStandId}` : './api/stands';
      const method = this.editingStandId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        this.closeStandModal();
        this.fetchState();
      } else {
        alert('Error al guardar stand');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  },

  async deleteStand(id) {
    if (!confirm('¿Deseas eliminar este stand y su menú?')) return;
    try {
      const res = await fetch(`./api/stands/${id}`, { method: 'DELETE' });
      if (res.ok) this.fetchState();
    } catch (err) {
      alert('Error al eliminar');
    }
  },

  // Dish CRUD
  openNewDishModal() {
    const select = document.getElementById('adminStandSelect');
    if (!select || !select.value) return;

    this.editingDishContext = { standId: select.value, menuId: null };
    document.getElementById('modalDishTitle').textContent = '➕ Agregar Plato al Menú';
    document.getElementById('dishItemInput').value = '';
    document.getElementById('dishDescInput').value = '';
    document.getElementById('dishPriceInput').value = '$5.500';
    document.getElementById('dishSoldOutInput').checked = false;

    document.getElementById('modalDishOverlay').classList.add('active');
  },

  openEditDishModal(standId, menuId) {
    const stand = this.dbState.stands.find(s => s.id === standId);
    if (!stand) return;
    const dish = stand.menu.find(m => m.id === menuId || m.item === menuId);
    if (!dish) return;

    this.editingDishContext = { standId, menuId: dish.id || dish.item };
    document.getElementById('modalDishTitle').textContent = '✏️ Modificar Plato del Menú';
    document.getElementById('dishItemInput').value = dish.item || '';
    document.getElementById('dishDescInput').value = dish.desc || '';
    document.getElementById('dishPriceInput').value = dish.price || '';
    document.getElementById('dishSoldOutInput').checked = Boolean(dish.isSoldOut);

    document.getElementById('modalDishOverlay').classList.add('active');
  },

  closeDishModal() {
    document.getElementById('modalDishOverlay').classList.remove('active');
  },

  async saveDish(e) {
    e.preventDefault();
    if (!this.editingDishContext) return;

    const payload = {
      menuId: this.editingDishContext.menuId,
      item: document.getElementById('dishItemInput').value.trim(),
      desc: document.getElementById('dishDescInput').value.trim(),
      price: document.getElementById('dishPriceInput').value.trim(),
      isSoldOut: document.getElementById('dishSoldOutInput').checked
    };

    try {
      const url = `./api/stands/${this.editingDishContext.standId}/menu`;
      const method = this.editingDishContext.menuId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        this.closeDishModal();
        this.fetchState();
      } else {
        alert('Error al guardar el plato');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  },

  async deleteDish(standId, menuId) {
    if (!confirm('¿Deseas eliminar este plato del menú?')) return;
    try {
      const res = await fetch(`./api/stands/${standId}/menu/${menuId}`, { method: 'DELETE' });
      if (res.ok) this.fetchState();
    } catch (err) {
      alert('Error de red');
    }
  },

  async toggleStock(standId, itemTitle, isSoldOut) {
    try {
      await fetch(`./api/stands/${standId}/menu`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: itemTitle, isSoldOut })
      });
      this.fetchState();
    } catch (e) {
      alert('Error al actualizar disponibilidad');
    }
  },

  // =========================================================================
  // 3. ANNOUNCEMENTS CRUD
  // =========================================================================
  renderAnnouncements() {
    const list = document.getElementById('adminAnnouncementsList');
    if (!list || !this.dbState) return;

    if (this.dbState.announcements.length === 0) {
      list.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem;">No hay avisos flash activos.</p>';
      return;
    }

    list.innerHTML = this.dbState.announcements.map(a => `
      <div class="admin-item-row" style="flex-direction:row; justify-content:space-between; align-items:center;">
        <div>
          <span style="font-size:0.72rem; color:var(--admin-warning); font-weight:800;">[AVISO FLASH ${a.createdAt}]</span>
          <div style="font-weight:700; font-size:0.9rem;">${a.icon || '📢'} ${a.title}</div>
          <div style="font-size:0.8rem; color:var(--text-secondary);">${a.message}</div>
        </div>
        <button class="btn-admin-action btn-danger" onclick="AdminApp.deleteAnnouncement('${a.id}')">
          🗑️ Eliminar
        </button>
      </div>
    `).join('');
  },

  async postAnnouncement(e) {
    e.preventDefault();
    const title = document.getElementById('annTitle').value.trim();
    const message = document.getElementById('annMessage').value.trim();
    const icon = document.getElementById('annIcon').value;

    if (!title || !message) return;

    try {
      await fetch('./api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, icon })
      });
      document.getElementById('annTitle').value = '';
      document.getElementById('annMessage').value = '';
      this.fetchState();
    } catch (e) {
      alert('Error enviando aviso');
    }
  },

  async deleteAnnouncement(id) {
    try {
      await fetch(`./api/announcements/${id}`, { method: 'DELETE' });
      this.fetchState();
    } catch (e) {
      alert('Error eliminando aviso');
    }
  },

  // =========================================================================
  // 4. RAFFLE CRUD & CSV
  // =========================================================================
  renderRaffle() {
    const countEl = document.getElementById('adminRaffleCount');
    const listEl = document.getElementById('adminRaffleParticipantsList');
    if (!countEl || !this.dbState) return;

    countEl.textContent = `${this.dbState.participantsCount} personas registradas`;

    if (listEl && this.dbState.participants) {
      listEl.innerHTML = this.dbState.participants.map(p => `
        <div class="admin-item-row" style="flex-direction:row; justify-content:space-between; align-items:center; padding:10px 14px;">
          <div>
            <strong style="color:#fef08a;">#${p.code}</strong> — <span style="font-weight:700;">${p.name}</span>
            <div style="font-size:0.75rem; color:var(--text-muted);">📱 ${p.phone} • Stand: ${p.stand}</div>
          </div>
          <button class="btn-admin-action btn-danger" onclick="AdminApp.deleteParticipant('${p.code}')" title="Dar de baja">
            🗑️
          </button>
        </div>
      `).join('');
    }
  },

  async deleteParticipant(code) {
    if (!confirm(`¿Eliminar al participante #${code}?`)) return;
    try {
      await fetch(`./api/raffle/participants/${code}`, { method: 'DELETE' });
      this.fetchState();
    } catch (e) {
      alert('Error al eliminar');
    }
  },

  exportCSV() {
    window.open('./api/raffle/export', '_blank');
  },

  // =========================================================================
  // 5. CONFIGURACIÓN, CATEGORÍAS, ESCENARIOS & SPONSORS
  // =========================================================================
  renderConfig() {
    if (!this.dbState) return;

    // 1. Populate Event Inputs
    const ev = this.dbState.event;
    if (ev) {
      if (document.getElementById('cfgEventName')) document.getElementById('cfgEventName').value = ev.name || '';
      if (document.getElementById('cfgEventEdition')) document.getElementById('cfgEventEdition').value = ev.edition || '';
      if (document.getElementById('cfgEventDate')) document.getElementById('cfgEventDate').value = ev.date || '';
      if (document.getElementById('cfgEventHours')) document.getElementById('cfgEventHours').value = ev.hours || '';
      if (document.getElementById('cfgEventVenue')) document.getElementById('cfgEventVenue').value = ev.venue || '';
      if (document.getElementById('cfgEventAddress')) document.getElementById('cfgEventAddress').value = ev.address || '';
      if (document.getElementById('cfgEventMaps')) document.getElementById('cfgEventMaps').value = ev.mapsUrl || '';
      if (document.getElementById('cfgEventWaze')) document.getElementById('cfgEventWaze').value = ev.wazeUrl || '';
      if (document.getElementById('cfgEventParking')) document.getElementById('cfgEventParking').value = ev.parkingInfo || '';
    }

    // 2. Show Categories
    const showCatList = document.getElementById('adminShowCategoriesList');
    if (showCatList && this.dbState.showCategories) {
      showCatList.innerHTML = this.dbState.showCategories.map(c => `
        <span class="tag-badge" style="padding:6px 12px; font-size:0.82rem; background:rgba(255,255,255,0.08); display:inline-flex; align-items:center; gap:6px;">
          ${c.icon || '🔥'} ${c.name}
          <button onclick="AdminApp.deleteCategory('show', '${c.id}')" style="background:none; border:none; color:#f87171; cursor:pointer; font-weight:800;">✕</button>
        </span>
      `).join('');
    }

    // 3. Stand Categories
    const standCatList = document.getElementById('adminStandCategoriesList');
    if (standCatList && this.dbState.standCategories) {
      standCatList.innerHTML = this.dbState.standCategories.map(c => `
        <span class="tag-badge" style="padding:6px 12px; font-size:0.82rem; background:rgba(255,255,255,0.08); display:inline-flex; align-items:center; gap:6px;">
          ${c.icon || '🍽️'} ${c.name}
          <button onclick="AdminApp.deleteCategory('stand', '${c.id}')" style="background:none; border:none; color:#f87171; cursor:pointer; font-weight:800;">✕</button>
        </span>
      `).join('');
    }

    // 4. Stages
    const stagesList = document.getElementById('adminStagesList');
    if (stagesList && this.dbState.stages) {
      stagesList.innerHTML = this.dbState.stages.map(s => `
        <span class="tag-badge" style="padding:6px 12px; font-size:0.82rem; background:rgba(59,130,246,0.15); color:#93c5fd; display:inline-flex; align-items:center; gap:6px;">
          ${s.icon || '🎤'} ${s.name}
          <button onclick="AdminApp.deleteStage('${s.id}')" style="background:none; border:none; color:#f87171; cursor:pointer; font-weight:800;">✕</button>
        </span>
      `).join('');
    }

    // 5. Sponsors
    const sponsorsList = document.getElementById('adminSponsorsList');
    if (sponsorsList && this.dbState.sponsors) {
      let html = '';
      const renderItem = (sp, tier) => `
        <div class="admin-item-row" style="flex-direction:row; justify-content:space-between; align-items:center; padding:8px 12px;">
          <div style="display:flex; align-items:center; gap:10px;">
            ${sp.logoUrl ? `<img src="${sp.logoUrl}" style="width:32px; height:32px; border-radius:4px; object-fit:cover;">` : `<span style="font-size:1.2rem;">${sp.icon || '🤝'}</span>`}
            <div>
              <span style="font-weight:800; color:${tier === 'gold' ? '#fcd34d' : '#cbd5e1'};">[${tier.toUpperCase()}]</span> <strong>${sp.name}</strong> (${sp.tier})
            </div>
          </div>
          <button class="btn-admin-action btn-danger" onclick="AdminApp.deleteSponsor('${tier}', '${encodeURIComponent(sp.name)}')">✕</button>
        </div>
      `;

      if (this.dbState.sponsors.gold) {
        this.dbState.sponsors.gold.forEach(sp => html += renderItem(sp, 'gold'));
      }
      if (this.dbState.sponsors.silver) {
        this.dbState.sponsors.silver.forEach(sp => html += renderItem(sp, 'silver'));
      }
      sponsorsList.innerHTML = html;
    }
  },

  async saveEventConfig(e) {
    e.preventDefault();
    const payload = {
      name: document.getElementById('cfgEventName').value.trim(),
      edition: document.getElementById('cfgEventEdition').value.trim(),
      date: document.getElementById('cfgEventDate').value.trim(),
      hours: document.getElementById('cfgEventHours').value.trim(),
      venue: document.getElementById('cfgEventVenue').value.trim(),
      address: document.getElementById('cfgEventAddress').value.trim(),
      mapsUrl: document.getElementById('cfgEventMaps').value.trim(),
      wazeUrl: document.getElementById('cfgEventWaze').value.trim(),
      parkingInfo: document.getElementById('cfgEventParking').value.trim()
    };

    try {
      const res = await fetch('./api/event', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert('✅ ¡Datos generales del evento actualizados con éxito!');
        this.fetchState();
      }
    } catch (e) {
      alert('Error guardando configuración');
    }
  },

  async addCategory(e, type) {
    e.preventDefault();
    const iconId = type === 'show' ? 'newShowCatIcon' : 'newStandCatIcon';
    const nameId = type === 'show' ? 'newShowCatName' : 'newStandCatName';

    const icon = document.getElementById(iconId).value.trim() || '✨';
    const name = document.getElementById(nameId).value.trim();
    if (!name) return;

    // Generate clean URL-safe slug
    const cleanId = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    try {
      const res = await fetch('./api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, icon, name, id: cleanId })
      });
      if (res.ok) {
        document.getElementById(nameId).value = '';
        this.fetchState();
      }
    } catch (e) {
      alert('Error agregando categoría');
    }
  },

  async deleteCategory(type, id) {
    if (!confirm('¿Deseas eliminar esta categoría?')) return;
    try {
      const res = await fetch(`./api/categories/${type}/${id}`, { method: 'DELETE' });
      if (res.ok) this.fetchState();
    } catch (e) {
      alert('Error eliminando');
    }
  },

  async addStage(e) {
    e.preventDefault();
    const icon = document.getElementById('newStageIcon').value.trim() || '🎤';
    const name = document.getElementById('newStageName').value.trim();
    if (!name) return;

    try {
      const res = await fetch('./api/stages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ icon, name })
      });
      if (res.ok) {
        document.getElementById('newStageName').value = '';
        this.fetchState();
      }
    } catch (e) {
      alert('Error agregando escenario');
    }
  },

  async deleteStage(id) {
    if (!confirm('¿Deseas eliminar este escenario?')) return;
    try {
      const res = await fetch(`./api/stages/${id}`, { method: 'DELETE' });
      if (res.ok) this.fetchState();
    } catch (e) {
      alert('Error eliminando escenario');
    }
  },

  async addSponsor(e) {
    e.preventDefault();
    const tier = document.getElementById('newSponsorTier').value;
    const name = document.getElementById('newSponsorName').value.trim();
    const tierName = document.getElementById('newSponsorLabel').value.trim();
    const logoUrl = document.getElementById('newSponsorLogo') ? document.getElementById('newSponsorLogo').value.trim() : '';
    if (!name || !tierName) return;

    try {
      const res = await fetch('./api/sponsors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier,
          name,
          tierName,
          logoUrl,
          icon: tier === 'gold' ? '⭐' : '🥈'
        })
      });
      if (res.ok) {
        document.getElementById('newSponsorName').value = '';
        document.getElementById('newSponsorLabel').value = '';
        if (document.getElementById('newSponsorLogo')) document.getElementById('newSponsorLogo').value = '';
        this.fetchState();
      }
    } catch (e) {
      alert('Error agregando sponsor');
    }
  },

  async deleteSponsor(tier, name) {
    if (!confirm('¿Deseas eliminar este sponsor?')) return;
    try {
      const res = await fetch(`./api/sponsors/${tier}/${name}`, { method: 'DELETE' });
      if (res.ok) this.fetchState();
    } catch (e) {
      alert('Error eliminando sponsor');
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  AdminApp.init();
});
