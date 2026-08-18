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

  ensureState() {
    if (!this.dbState || !this.dbState.schedule || !this.dbState.stands) {
      const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('gastrofest_db') : null;
      if (saved) {
        try { this.dbState = Object.assign(this.dbState || {}, JSON.parse(saved)); } catch (e) {}
      }
    }
    const defaultData = window.GASTRO_DATA ? GASTRO_DATA : {};
    if (!this.dbState) {
      this.dbState = JSON.parse(JSON.stringify(defaultData));
    }
    if (!this.dbState.event) this.dbState.event = defaultData.event ? { ...defaultData.event } : {};
    if (!this.dbState.schedule || this.dbState.schedule.length === 0) this.dbState.schedule = defaultData.schedule ? JSON.parse(JSON.stringify(defaultData.schedule)) : [];
    if (!this.dbState.stands || this.dbState.stands.length === 0) this.dbState.stands = defaultData.stands ? JSON.parse(JSON.stringify(defaultData.stands)) : [];
    if (!this.dbState.zones || this.dbState.zones.length === 0) this.dbState.zones = defaultData.zones ? JSON.parse(JSON.stringify(defaultData.zones)) : [];
    if (!this.dbState.stages) this.dbState.stages = defaultData.stages ? [...defaultData.stages] : [];
    if (!this.dbState.standCategories) this.dbState.standCategories = defaultData.standCategories ? [...defaultData.standCategories] : [];
    if (!this.dbState.showCategories) this.dbState.showCategories = defaultData.showCategories ? [...defaultData.showCategories] : [];
    if (!this.dbState.sponsors) this.dbState.sponsors = defaultData.sponsors ? { ...defaultData.sponsors } : { gold: [], silver: [] };
    if (!this.dbState.announcements) this.dbState.announcements = defaultData.announcements ? [...defaultData.announcements] : [];
    if (!this.dbState.participants) this.dbState.participants = defaultData.participants ? [...defaultData.participants] : [];
    if (!this.dbState.users) this.dbState.users = defaultData.users ? [...defaultData.users] : [];
    return this.dbState;
  },

  async fetchState() {
    try {
      const res = await fetch('./api/sync');
      if (res.ok) {
        this.dbState = await res.json();
        localStorage.setItem('gastrofest_db', JSON.stringify(this.dbState));
      } else {
        throw new Error('Static host fallback');
      }
    } catch (e) {
      this.ensureState();
    }

    this.ensureState();
    this.renderSchedule();
    this.renderStands();
    this.renderMapEditor();
    this.renderAnnouncements();
    this.renderRaffle();
    this.renderUsers();
    this.renderConfig();
  },

  persistOffline() {
    this.ensureState();
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('gastrofest_db', JSON.stringify(this.dbState));
    }
    if (window.GASTRO_DATA) {
      Object.assign(GASTRO_DATA, this.dbState);
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
        'live': '<span class="card-status-badge" style="color:#ef4444; font-weight:800;">🔴 EN VIVO</span>',
        'scheduled': '<span class="card-status-badge" style="color:#10b981; font-weight:700;">⏰ Programado</span>',
        'delayed': '<span class="card-status-badge" style="color:#f59e0b; font-weight:700;">⚠️ Con Retraso</span>',
        'completed': '<span class="card-status-badge" style="color:#6b7280; font-weight:700;">✅ Finalizado</span>'
      }[ev.status] || ev.status;

      return `
        <div class="admin-item-row" data-id="${ev.id}">
          <!-- Top Row: Stage Tag + Status Badge -->
          <div class="card-row-top">
            <span class="card-tag-stage">🎪 ${ev.stageName} • [${ev.badge || 'Show'}]</span>
            <div>${statusBadge}</div>
          </div>

          <!-- Middle Row: Full Width Show Title + Image thumbnail if present -->
          <div class="card-row-title" style="display:flex; align-items:center; gap:12px;">
            ${ev.image ? `
              <img src="${ev.image}" alt="${ev.speaker}" style="width:48px; height:48px; object-fit:cover; border-radius:var(--radius-sm); border:1px solid var(--admin-border-subtle); flex-shrink:0;">
            ` : ''}
            <div>
              <h4>${ev.speakerAvatar || '👨‍🍳'} ${ev.title}</h4>
              <span style="font-size:0.8rem; color:var(--text-secondary);">👤 ${ev.speaker}</span>
            </div>
          </div>

          <!-- Info Row: Speaker + Time Range Pill -->
          <div class="card-row-meta">
            <span style="font-size:0.75rem; color:var(--text-muted);">${ev.category || 'Música'}</span>
            <span class="card-time-pill">🕒 ${ev.startTime} - ${ev.endTime}</span>
          </div>

          <!-- Action Buttons Toolbar -->
          <div class="admin-quick-actions">
            <button class="btn-admin-action btn-live-now" onclick="AdminApp.updateEventStatus('${ev.id}', 'live')">
              🔴 En Vivo
            </button>
            <button class="btn-admin-action" onclick="AdminApp.adjustTime('${ev.id}', 15)">
              ⏰ +15m
            </button>
            <button class="btn-admin-action" onclick="AdminApp.adjustTime('${ev.id}', -15)">
              ⏰ -15m
            </button>
            <button class="btn-admin-action" onclick="AdminApp.updateEventStatus('${ev.id}', 'completed')">
              ✅ Fin
            </button>
            <button class="btn-admin-action" style="background:rgba(59,130,246,0.2); color:#93c5fd;" onclick="AdminApp.openEditShowModal('${ev.id}')">
              ✏️ Modificar
            </button>
            <button class="btn-admin-action btn-danger" onclick="AdminApp.deleteShow('${ev.id}')">
              🗑️ Baja
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
    if (document.getElementById('showImageInput')) document.getElementById('showImageInput').value = '';
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
    if (document.getElementById('showImageInput')) document.getElementById('showImageInput').value = ev.image || '';
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
      image: document.getElementById('showImageInput') ? document.getElementById('showImageInput').value.trim() : '',
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
        return;
      }
    } catch (err) {}

    // Fallback Offline & Cloud Save
    if (this.editingShowId) {
      const idx = this.dbState.schedule.findIndex(s => s.id === this.editingShowId);
      if (idx > -1) this.dbState.schedule[idx] = { ...this.dbState.schedule[idx], ...payload };
    } else {
      const newShow = { id: `ev-${Date.now()}`, ...payload };
      this.dbState.schedule.push(newShow);
    }
    this.persistOffline();
    this.closeShowModal();
    this.renderSchedule();
    alert('✅ Show guardado con éxito!');
  },

  async deleteShow(id) {
    if (!confirm('¿Deseas dar de baja este show de la agenda?')) return;
    try {
      const res = await fetch(`./api/schedule/${id}`, { method: 'DELETE' });
      if (res.ok) {
        this.fetchState();
        return;
      }
    } catch (err) {}

    this.dbState.schedule = this.dbState.schedule.filter(s => s.id !== id);
    this.persistOffline();
    this.renderSchedule();
  },

  async updateEventStatus(id, status) {
    try {
      const res = await fetch(`./api/schedule/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        this.fetchState();
        return;
      }
    } catch (e) {}

    const ev = this.dbState.schedule.find(s => s.id === id);
    if (ev) {
      ev.status = status;
      this.persistOffline();
      this.renderSchedule();
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
      const res = await fetch(`./api/schedule/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime: newStart,
          endTime: newEnd,
          status: minutes > 0 ? 'delayed' : 'scheduled'
        })
      });
      if (res.ok) {
        this.fetchState();
        return;
      }
    } catch (e) {}

    ev.startTime = newStart;
    ev.endTime = newEnd;
    ev.status = minutes > 0 ? 'delayed' : 'scheduled';
    this.persistOffline();
    this.renderSchedule();
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
        <div class="admin-item-row" style="background:var(--bg-primary); border-color:var(--admin-border);">
          <div class="card-row-top">
            <span class="card-tag-stage">📍 ${stand.number} • ${stand.zone}</span>
            <div style="display:flex; gap:6px;">
              <button class="btn-admin-action" style="background:rgba(59,130,246,0.2); color:#93c5fd;" onclick="AdminApp.openEditStandModal('${stand.id}')">
                ✏️ Modificar
              </button>
              <button class="btn-admin-action btn-danger" onclick="AdminApp.deleteStand('${stand.id}')">
                🗑️ Baja
              </button>
            </div>
          </div>
          <div class="card-row-title">
            <h4>${stand.fallbackEmoji || '🍽️'} ${stand.name}</h4>
          </div>
          <div class="card-row-meta">
            <span>🌟 Especialidad: <strong style="color:var(--text-primary);">${stand.featuredDish || 'Plato Gourmet'}</strong></span>
            <span style="font-size:0.75rem; color:var(--text-muted);">${stand.categoryName || stand.category}</span>
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
        <div class="admin-item-row">
          <div class="card-row-top">
            <strong style="color:var(--text-primary); font-size:0.96rem;">${m.item}</strong>
            <span class="card-time-pill" style="color:var(--color-gold); font-size:0.88rem;">${m.price}</span>
          </div>
          ${m.desc ? `<div style="font-size:0.78rem; color:var(--text-secondary); line-height:1.35;">${m.desc}</div>` : ''}

          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; padding-top:8px; border-top:1px solid var(--admin-border-subtle);">
            <label class="stock-switch-label">
              <span style="font-size:0.75rem;">${isSoldOut ? '🔴 AGOTADO' : '🟢 DISPONIBLE'}</span>
              <label class="stock-switch">
                <input type="checkbox" ${isSoldOut ? 'checked' : ''} onchange="AdminApp.toggleStock('${stand.id}', '${m.item}', this.checked)">
                <span class="slider"></span>
              </label>
            </label>
            <div style="display:flex; gap:6px;">
              <button class="btn-admin-action" onclick="AdminApp.openEditDishModal('${stand.id}', '${m.id || m.item}')" title="Editar Plato">
                ✏️ Editar
              </button>
              <button class="btn-admin-action btn-danger" onclick="AdminApp.deleteDish('${stand.id}', '${m.id || m.item}')" title="Eliminar Plato">
                🗑️ Eliminar
              </button>
            </div>
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

  populateStandZonesSelect(selectedZone) {
    const zoneSel = document.getElementById('standZoneSelect');
    const zoneInput = document.getElementById('standZoneInput');
    if (!zoneSel) return;

    const zones = this.dbState.zones || [];
    let optionsHtml = zones.map(z => `
      <option value="${z.code}">${z.icon || '📍'} ${z.code} - ${z.name}</option>
    `).join('');

    optionsHtml += `<option value="custom">✏️ Otro sector personalizado...</option>`;
    zoneSel.innerHTML = optionsHtml;

    if (selectedZone) {
      const match = zones.find(z => z.code.toLowerCase() === selectedZone.toLowerCase() || z.name.toLowerCase() === selectedZone.toLowerCase());
      if (match) {
        zoneSel.value = match.code;
        if (zoneInput) {
          zoneInput.value = match.code;
          zoneInput.style.display = 'none';
        }
      } else {
        zoneSel.value = 'custom';
        if (zoneInput) {
          zoneInput.value = selectedZone;
          zoneInput.style.display = 'block';
        }
      }
    } else if (zones.length > 0) {
      zoneSel.value = zones[0].code;
      if (zoneInput) {
        zoneInput.value = zones[0].code;
        zoneInput.style.display = 'none';
      }
    }
  },

  handleStandZoneSelectChange(val) {
    const zoneInput = document.getElementById('standZoneInput');
    if (!zoneInput) return;
    if (val === 'custom') {
      zoneInput.style.display = 'block';
      zoneInput.value = '';
      zoneInput.focus();
    } else {
      zoneInput.style.display = 'none';
      zoneInput.value = val;
    }
  },

  openNewStandModal() {
    this.editingStandId = null;
    if (!this.dbState) this.dbState = { stands: [], schedule: [], zones: [] };
    if (!this.dbState.stands) this.dbState.stands = (window.GASTRO_DATA && GASTRO_DATA.stands) ? [...GASTRO_DATA.stands] : [];
    this.populateStandCategoriesSelect();
    this.populateStandZonesSelect();

    document.getElementById('modalStandTitle').textContent = '➕ Alta de Nuevo Stand Gastronómico';
    document.getElementById('standNameInput').value = '';
    const standCount = (this.dbState.stands ? this.dbState.stands.length : 0) + 1;
    document.getElementById('standNumberInput').value = `Stand #${String(standCount).padStart(2, '0')}`;
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
    this.populateStandZonesSelect(stand.zone);

    document.getElementById('modalStandTitle').textContent = '✏️ Modificar Datos del Stand';
    document.getElementById('standNameInput').value = stand.name || '';
    document.getElementById('standNumberInput').value = stand.number || '';
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
        return;
      }
    } catch (err) {}

    // Fallback Offline & Cloud Save
    if (this.editingStandId) {
      const idx = this.dbState.stands.findIndex(s => s.id === this.editingStandId);
      if (idx > -1) this.dbState.stands[idx] = { ...this.dbState.stands[idx], ...payload };
    } else {
      const newStand = {
        id: `st-${Date.now()}`,
        ...payload,
        rating: '5.0 ⭐',
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80',
        menu: []
      };
      this.dbState.stands.push(newStand);
    }
    this.persistOffline();
    this.closeStandModal();
    this.renderStands();
    alert('✅ Stand guardado con éxito!');
  },

  async deleteStand(id) {
    if (!confirm('¿Deseas eliminar este stand y su menú?')) return;
    try {
      const res = await fetch(`./api/stands/${id}`, { method: 'DELETE' });
      if (res.ok) {
        this.fetchState();
        return;
      }
    } catch (err) {}

    this.dbState.stands = this.dbState.stands.filter(s => s.id !== id);
    this.persistOffline();
    this.renderStands();
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
        return;
      }
    } catch (err) {}

    const stand = this.dbState.stands.find(s => s.id === this.editingDishContext.standId);
    if (stand) {
      if (!stand.menu) stand.menu = [];
      if (this.editingDishContext.menuId) {
        const dishIdx = stand.menu.findIndex(m => m.id === this.editingDishContext.menuId || m.item === this.editingDishContext.menuId);
        if (dishIdx > -1) stand.menu[dishIdx] = { ...stand.menu[dishIdx], ...payload };
      } else {
        stand.menu.push({ id: `dish-${Date.now()}`, ...payload });
      }
      this.persistOffline();
      this.closeDishModal();
      this.renderStandMenu();
    }
  },

  async deleteDish(standId, menuId) {
    if (!confirm('¿Deseas eliminar este plato del menú?')) return;
    try {
      const res = await fetch(`./api/stands/${standId}/menu/${menuId}`, { method: 'DELETE' });
      if (res.ok) {
        this.fetchState();
        return;
      }
    } catch (err) {}

    const stand = this.dbState.stands.find(s => s.id === standId);
    if (stand && stand.menu) {
      stand.menu = stand.menu.filter(m => m.id !== menuId && m.item !== menuId);
      this.persistOffline();
      this.renderStandMenu();
    }
  },

  async toggleStock(standId, itemTitle, isSoldOut) {
    try {
      const res = await fetch(`./api/stands/${standId}/menu`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: itemTitle, isSoldOut })
      });
      if (res.ok) {
        this.fetchState();
        return;
      }
    } catch (e) {}

    const stand = this.dbState.stands.find(s => s.id === standId);
    if (stand && stand.menu) {
      const dish = stand.menu.find(m => m.item === itemTitle);
      if (dish) {
        dish.isSoldOut = isSoldOut;
        this.persistOffline();
        this.renderStandMenu();
      }
    }
  },

  // =========================================================================
  // 3. INTERACTIVE MAP & ZONE MARKER TOOL (PLAZA INDEPENDENCIA)
  // =========================================================================
  isDraggingPin: false,
  gridVisible: false,

  renderMapEditor() {
    if (!this.dbState) return;
    if (!this.dbState.zones) {
      this.dbState.zones = window.GASTRO_DATA && GASTRO_DATA.zones ? JSON.parse(JSON.stringify(GASTRO_DATA.zones)) : [];
    }

    const countEl = document.getElementById('adminZoneCount');
    if (countEl) countEl.textContent = this.dbState.zones.length;

    // Render Pins on Map Image
    const pinsContainer = document.getElementById('adminMapPinsContainer');
    if (pinsContainer) {
      pinsContainer.innerHTML = this.dbState.zones.map(z => {
        const isSelected = this.editingZoneId === z.id;
        const color = z.color || '#10b981';
        
        // Count matching stands & shows
        const matchingStands = (this.dbState.stands || []).filter(st => 
          st.zone && (st.zone.toLowerCase().includes(z.code.toLowerCase()) || z.name.toLowerCase().includes(st.zone.toLowerCase()))
        );
        const matchingShows = (this.dbState.schedule || []).filter(ev => 
          ev.stageName && (ev.stageName.toLowerCase().includes(z.name.toLowerCase()) || z.name.toLowerCase().includes(ev.stageName.toLowerCase()))
        );
        const standsCount = matchingStands.length;
        const showsCount = matchingShows.length;

        return `
          <div class="map-zone-pin ${isSelected ? 'is-selected' : ''}" 
               id="adminPin_${z.id}"
               data-id="${z.id}"
               style="left: ${z.x}%; top: ${z.y}%; --pin-color: ${color};" 
               title="${z.code}: ${z.name} (${standsCount} puestos, ${showsCount} shows)">
            <div class="map-zone-pin-head" style="background: ${color};">
              <span>${z.icon || '📍'}</span>
            </div>
            <div class="map-zone-pin-badge" style="border-color: ${color};">
              ${z.code}
            </div>
          </div>
        `;
      }).join('');

      // Setup drag and click listeners on all pins
      this.dbState.zones.forEach(z => {
        const pinEl = document.getElementById(`adminPin_${z.id}`);
        if (pinEl) {
          this.setupPinDrag(pinEl, z.id);
        }
      });
    }

    // Render Cards in Grid Below
    const listGrid = document.getElementById('adminZonesListGrid');
    if (listGrid) {
      if (this.dbState.zones.length === 0) {
        listGrid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 24px; color: var(--text-secondary);">
            📍 Aún no hay zonas marcadas en el mapa. Haz clic en el mapa satelital para ubicar la primera.
          </div>
        `;
        return;
      }

      listGrid.innerHTML = this.dbState.zones.map(z => {
        const isSelected = this.editingZoneId === z.id;
        const color = z.color || '#10b981';

        // Count associated stands and shows
        const matchingStands = (this.dbState.stands || []).filter(st => 
          st.zone && (st.zone.toLowerCase().includes(z.code.toLowerCase()) || z.name.toLowerCase().includes(st.zone.toLowerCase()))
        );
        const matchingShows = (this.dbState.schedule || []).filter(ev => 
          ev.stageName && (ev.stageName.toLowerCase().includes(z.name.toLowerCase()) || z.name.toLowerCase().includes(ev.stageName.toLowerCase()))
        );

        return `
          <div class="admin-zone-card ${isSelected ? 'is-editing' : ''}" style="--zone-color: ${color};">
            <div class="admin-zone-card-top">
              <div class="admin-zone-card-identity">
                <span class="admin-zone-icon-circle" style="background: ${color}25; border-color: ${color}; color: ${color};">
                  ${z.icon || '📍'}
                </span>
                <div>
                  <h4 style="color: white; margin: 0; font-size: 0.95rem;">${z.name}</h4>
                  <span class="admin-zone-code-tag" style="background: ${color}20; color: ${color}; border-color: ${color}60;">
                    ${z.code} ${z.category ? `• ${z.category}` : ''}
                  </span>
                </div>
              </div>
              <div class="admin-zone-coords-pill">
                X: ${z.x}% | Y: ${z.y}%
              </div>
            </div>

            ${z.description ? `<p class="admin-zone-desc">${z.description}</p>` : ''}

            <!-- Associated Entities Summary -->
            <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 2px;">
              ${matchingStands.length > 0 ? `
                <span class="zone-entities-pill" style="border-left: 2px solid #10b981;">
                  🍴 <strong>${matchingStands.length}</strong> ${matchingStands.length === 1 ? 'Puesto' : 'Puestos'} (${matchingStands.map(s => s.name).slice(0, 2).join(', ')}${matchingStands.length > 2 ? '...' : ''})
                </span>
              ` : '<span class="zone-entities-pill" style="opacity: 0.6;">🍴 Sin puestos asignados</span>'}

              ${matchingShows.length > 0 ? `
                <span class="zone-entities-pill" style="border-left: 2px solid #f59e0b;">
                  🎤 <strong>${matchingShows.length}</strong> ${matchingShows.length === 1 ? 'Show' : 'Shows'}
                </span>
              ` : ''}
            </div>

            <div class="admin-zone-actions-bar">
              <button class="btn-admin-action" onclick="AdminApp.selectZoneForEdit('${z.id}')" style="background: rgba(59, 130, 246, 0.2); color: #93c5fd;">
                ✏️ Editar / Mover
              </button>
              <button class="btn-admin-action btn-danger" onclick="AdminApp.deleteZone('${z.id}')">
                🗑️ Eliminar
              </button>
            </div>
          </div>
        `;
      }).join('');
    }
  },

  setupPinDrag(pinEl, zoneId) {
    let startX = 0, startY = 0;
    let hasMoved = false;

    const onStart = (e) => {
      e.stopPropagation();
      this.isDraggingPin = true;
      hasMoved = false;
      
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      startX = clientX;
      startY = clientY;

      pinEl.classList.add('is-dragging');

      const onMove = (moveEvent) => {
        const curX = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX;
        const curY = moveEvent.touches ? moveEvent.touches[0].clientY : moveEvent.clientY;
        
        if (Math.abs(curX - startX) > 3 || Math.abs(curY - startY) > 3) {
          hasMoved = true;
        }

        const mapEl = document.getElementById('adminSatelliteMap');
        if (!mapEl) return;
        const rect = mapEl.getBoundingClientRect();
        
        const clickX = curX - rect.left;
        const clickY = curY - rect.top;

        const xPercent = Math.max(0, Math.min(100, Math.round((clickX / rect.width) * 100)));
        const yPercent = Math.max(0, Math.min(100, Math.round((clickY / rect.height) * 100)));

        pinEl.style.left = `${xPercent}%`;
        pinEl.style.top = `${yPercent}%`;

        // Update form if editing this zone
        if (this.editingZoneId === zoneId || !this.editingZoneId) {
          document.getElementById('zoneXInput').value = xPercent;
          document.getElementById('zoneYInput').value = yPercent;
        }

        const crosshair = document.getElementById('adminCrosshairPin');
        const coordsBadge = document.getElementById('adminCrosshairCoords');
        if (crosshair) {
          crosshair.style.display = 'flex';
          crosshair.style.left = `${xPercent}%`;
          crosshair.style.top = `${yPercent}%`;
          if (coordsBadge) coordsBadge.textContent = `${xPercent}%, ${yPercent}%`;
        }
      };

      const onEnd = () => {
        this.isDraggingPin = false;
        pinEl.classList.remove('is-dragging');
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('touchmove', onMove);
        window.removeEventListener('mouseup', onEnd);
        window.removeEventListener('touchend', onEnd);

        if (hasMoved) {
          const mapEl = document.getElementById('adminSatelliteMap');
          if (mapEl) {
            const rect = mapEl.getBoundingClientRect();
            const leftVal = parseFloat(pinEl.style.left) || 50;
            const topVal = parseFloat(pinEl.style.top) || 50;
            
            const zone = this.dbState.zones.find(z => z.id === zoneId);
            if (zone) {
              zone.x = Math.round(leftVal);
              zone.y = Math.round(topVal);
              this.persistOffline();
              this.renderMapEditor();
              if (this.editingZoneId === zoneId) {
                this.selectZoneForEdit(zoneId);
              }
            }
          }
        } else {
          // It was a click/tap on the pin
          this.selectZoneForEdit(zoneId);
        }
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('touchmove', onMove, { passive: false });
      window.addEventListener('mouseup', onEnd);
      window.addEventListener('touchend', onEnd);
    };

    pinEl.addEventListener('mousedown', onStart);
    pinEl.addEventListener('touchstart', onStart, { passive: true });
  },

  handleMapClick(event) {
    if (this.isDraggingPin) return;

    const mapEl = document.getElementById('adminSatelliteMap');
    if (!mapEl) return;

    const rect = mapEl.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    const xPercent = Math.max(0, Math.min(100, Math.round((clickX / rect.width) * 100)));
    const yPercent = Math.max(0, Math.min(100, Math.round((clickY / rect.height) * 100)));

    document.getElementById('zoneXInput').value = xPercent;
    document.getElementById('zoneYInput').value = yPercent;

    const crosshair = document.getElementById('adminCrosshairPin');
    const coordsBadge = document.getElementById('adminCrosshairCoords');
    const crosshairIcon = document.getElementById('adminCrosshairIcon');
    const currentIcon = document.getElementById('zoneIconInput').value || '📍';

    if (crosshair) {
      crosshair.style.display = 'flex';
      crosshair.style.left = `${xPercent}%`;
      crosshair.style.top = `${yPercent}%`;
      if (coordsBadge) coordsBadge.textContent = `${xPercent}%, ${yPercent}%`;
      if (crosshairIcon) crosshairIcon.textContent = currentIcon;
    }

    if (this.editingZoneId && this.dbState && this.dbState.zones) {
      const activePin = document.getElementById(`adminPin_${this.editingZoneId}`);
      if (activePin) {
        activePin.style.left = `${xPercent}%`;
        activePin.style.top = `${yPercent}%`;
      }
    }
  },

  updatePreviewPin() {
    const x = Number(document.getElementById('zoneXInput').value) || 50;
    const y = Number(document.getElementById('zoneYInput').value) || 50;
    const code = document.getElementById('zoneCodeInput').value.trim() || 'ZONA';
    const icon = document.getElementById('zoneIconInput').value.trim() || '📍';
    const color = document.getElementById('zoneColorInput').value || '#10b981';

    const crosshair = document.getElementById('adminCrosshairPin');
    const coordsBadge = document.getElementById('adminCrosshairCoords');
    const crosshairIcon = document.getElementById('adminCrosshairIcon');

    if (crosshair) {
      crosshair.style.display = 'flex';
      crosshair.style.left = `${x}%`;
      crosshair.style.top = `${y}%`;
      if (coordsBadge) coordsBadge.textContent = `${code} (${x}%, ${y}%)`;
      if (crosshairIcon) crosshairIcon.textContent = icon;
    }

    if (this.editingZoneId) {
      const activePin = document.getElementById(`adminPin_${this.editingZoneId}`);
      if (activePin) {
        activePin.style.left = `${x}%`;
        activePin.style.top = `${y}%`;
        activePin.style.setProperty('--pin-color', color);
        const head = activePin.querySelector('.map-zone-pin-head');
        const badge = activePin.querySelector('.map-zone-pin-badge');
        if (head) {
          head.style.background = color;
          const span = head.querySelector('span');
          if (span) span.textContent = icon;
        }
        if (badge) {
          badge.style.borderColor = color;
          badge.textContent = code;
        }
      }
    }
  },

  pickEmoji(emoji) {
    document.getElementById('zoneIconInput').value = emoji;
    this.updatePreviewPin();
  },

  updateColorInput(hex) {
    document.getElementById('zoneColorInput').value = hex;
    const hexLabel = document.getElementById('zoneColorHex');
    if (hexLabel) hexLabel.textContent = hex;
    this.updatePreviewPin();
  },

  setPresetLocation(x, y, name, code, icon, color, category) {
    document.getElementById('zoneXInput').value = x;
    document.getElementById('zoneYInput').value = y;
    
    // Only overwrite name/code if creating new or empty
    if (!this.editingZoneId || !document.getElementById('zoneCodeInput').value) {
      document.getElementById('zoneNameInput').value = name;
      document.getElementById('zoneCodeInput').value = code;
      document.getElementById('zoneIconInput').value = icon;
      document.getElementById('zoneCategoryInput').value = category || 'General';
      this.updateColorInput(color);
    } else {
      this.updateColorInput(color);
      document.getElementById('zoneIconInput').value = icon;
    }

    this.updatePreviewPin();
  },

  toggleMapGrid() {
    const grid = document.getElementById('mapGridOverlay');
    const btn = document.getElementById('btnToggleGrid');
    if (!grid) return;

    this.gridVisible = !this.gridVisible;
    grid.style.display = this.gridVisible ? 'block' : 'none';
    if (btn) {
      if (this.gridVisible) {
        btn.classList.add('btn-success');
        btn.innerHTML = '📐 Guías Activas ✓';
      } else {
        btn.classList.remove('btn-success');
        btn.innerHTML = '📐 Cuadrícula / Guías';
      }
    }
  },

  selectZoneForEdit(id) {
    if (!this.dbState || !this.dbState.zones) return;
    const zone = this.dbState.zones.find(z => z.id === id);
    if (!zone) return;

    this.editingZoneId = id;
    document.getElementById('zoneFormHeading').textContent = `✏️ Modificar Zona: ${zone.code}`;
    
    const editBadge = document.getElementById('zoneEditBadge');
    if (editBadge) editBadge.style.display = 'inline-block';

    const delBtn = document.getElementById('btnDeleteZoneInForm');
    if (delBtn) delBtn.style.display = 'inline-flex';

    document.getElementById('zoneIdInput').value = zone.id;
    document.getElementById('zoneCodeInput').value = zone.code || '';
    document.getElementById('zoneNameInput').value = zone.name || '';
    document.getElementById('zoneCategoryInput').value = zone.category || '';
    document.getElementById('zoneIconInput').value = zone.icon || '📍';
    document.getElementById('zoneColorInput').value = zone.color || '#10b981';
    document.getElementById('zoneColorHex').textContent = zone.color || '#10b981';
    document.getElementById('zoneXInput').value = zone.x !== undefined ? zone.x : 50;
    document.getElementById('zoneYInput').value = zone.y !== undefined ? zone.y : 50;
    document.getElementById('zoneDescInput').value = zone.description || '';

    // Render Associated Stands and Shows in Form
    const matchingStands = (this.dbState.stands || []).filter(st => 
      st.zone && (st.zone.toLowerCase().includes(zone.code.toLowerCase()) || zone.name.toLowerCase().includes(st.zone.toLowerCase()))
    );
    const matchingShows = (this.dbState.schedule || []).filter(ev => 
      ev.stageName && (ev.stageName.toLowerCase().includes(zone.name.toLowerCase()) || zone.name.toLowerCase().includes(ev.stageName.toLowerCase()))
    );

    const entitiesBox = document.getElementById('zoneAssociatedEntitiesBox');
    if (entitiesBox) {
      entitiesBox.style.display = 'block';
      entitiesBox.innerHTML = `
        <strong style="color: #60a5fa;">📊 Elementos asignados a este sector:</strong>
        <div style="margin-top: 4px; color: var(--text-secondary); line-height: 1.4;">
          ${matchingStands.length > 0 ? `🍴 <strong>${matchingStands.length} Stands:</strong> ${matchingStands.map(s => s.name).join(', ')}<br>` : '🍴 <em>Sin stands asignados aún.</em><br>'}
          ${matchingShows.length > 0 ? `🎤 <strong>${matchingShows.length} Shows:</strong> ${matchingShows.map(s => s.title).join(', ')}` : '🎤 <em>Sin shows programados en este escenario.</em>'}
        </div>
      `;
    }

    this.updatePreviewPin();
    this.renderMapEditor();
  },

  resetZoneForm() {
    this.editingZoneId = null;
    document.getElementById('zoneFormHeading').textContent = '➕ Crear / Modificar Zona';
    
    const editBadge = document.getElementById('zoneEditBadge');
    if (editBadge) editBadge.style.display = 'none';

    const delBtn = document.getElementById('btnDeleteZoneInForm');
    if (delBtn) delBtn.style.display = 'none';

    const entitiesBox = document.getElementById('zoneAssociatedEntitiesBox');
    if (entitiesBox) entitiesBox.style.display = 'none';

    document.getElementById('zoneIdInput').value = '';
    document.getElementById('zoneCodeInput').value = '';
    document.getElementById('zoneNameInput').value = '';
    document.getElementById('zoneCategoryInput').value = '';
    document.getElementById('zoneIconInput').value = '📍';
    document.getElementById('zoneColorInput').value = '#10b981';
    document.getElementById('zoneColorHex').textContent = '#10b981';
    document.getElementById('zoneXInput').value = '50';
    document.getElementById('zoneYInput').value = '50';
    document.getElementById('zoneDescInput').value = '';

    const crosshair = document.getElementById('adminCrosshairPin');
    if (crosshair) crosshair.style.display = 'none';

    this.renderMapEditor();
  },

  async saveZone(e) {
    if (e && e.preventDefault) e.preventDefault();

    const id = document.getElementById('zoneIdInput').value || this.editingZoneId;
    const payload = {
      code: document.getElementById('zoneCodeInput').value.trim().toUpperCase(),
      name: document.getElementById('zoneNameInput').value.trim(),
      category: document.getElementById('zoneCategoryInput').value.trim() || 'General',
      icon: document.getElementById('zoneIconInput').value.trim() || '📍',
      color: document.getElementById('zoneColorInput').value || '#10b981',
      x: Number(document.getElementById('zoneXInput').value) || 50,
      y: Number(document.getElementById('zoneYInput').value) || 50,
      description: document.getElementById('zoneDescInput').value.trim()
    };

    if (!payload.code || !payload.name) {
      alert('Por favor completa el código y nombre de la zona');
      return;
    }

    this.ensureState();

    try {
      const url = id ? `./api/zones/${id}` : './api/zones';
      const method = id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        if (id) {
          const idx = this.dbState.zones.findIndex(z => z.id === id);
          if (idx > -1) this.dbState.zones[idx] = data.zone || Object.assign(this.dbState.zones[idx], payload);
        } else {
          this.dbState.zones.push(data.zone || { id: `zone-${Date.now()}`, ...payload });
        }
      } else {
        throw new Error('Fallback offline save');
      }
    } catch (err) {
      this.ensureState();
      if (id) {
        const idx = this.dbState.zones.findIndex(z => z.id === id);
        if (idx > -1) Object.assign(this.dbState.zones[idx], payload);
      } else {
        this.dbState.zones.push({
          id: `zone-${Math.floor(100 + Math.random() * 900)}`,
          ...payload
        });
      }
    }

    this.persistOffline();
    this.resetZoneForm();
    alert('✅ ¡Zona guardada exitosamente en el mapa de Plaza Independencia!');
  },

  async deleteCurrentZone() {
    if (this.editingZoneId) {
      await this.deleteZone(this.editingZoneId);
    }
  },

  async deleteZone(id) {
    if (!confirm('¿Seguro que deseas eliminar esta zona del mapa?')) return;

    try {
      await fetch(`./api/zones/${id}`, { method: 'DELETE' });
    } catch (e) {}

    if (this.dbState && this.dbState.zones) {
      this.dbState.zones = this.dbState.zones.filter(z => z.id !== id);
    }
    this.persistOffline();
    if (this.editingZoneId === id) this.resetZoneForm();
    else this.renderMapEditor();
  },

  // =========================================================================
  // 4. ANNOUNCEMENTS CRUD
  // =========================================================================
  renderAnnouncements() {
    const list = document.getElementById('adminAnnouncementsList');
    if (!list || !this.dbState) return;

    if (!this.dbState.announcements || this.dbState.announcements.length === 0) {
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

    const newAnn = {
      id: `ann-${Date.now()}`,
      title,
      message,
      icon,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    try {
      const res = await fetch('./api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, icon })
      });
      if (res.ok) {
        document.getElementById('annTitle').value = '';
        document.getElementById('annMessage').value = '';
        this.fetchState();
        return;
      }
    } catch (e) {}

    if (!this.dbState.announcements) this.dbState.announcements = [];
    this.dbState.announcements.push(newAnn);
    this.persistOffline();
    document.getElementById('annTitle').value = '';
    document.getElementById('annMessage').value = '';
    this.renderAnnouncements();
  },

  async deleteAnnouncement(id) {
    try {
      const res = await fetch(`./api/announcements/${id}`, { method: 'DELETE' });
      if (res.ok) {
        this.fetchState();
        return;
      }
    } catch (e) {}

    if (this.dbState.announcements) {
      this.dbState.announcements = this.dbState.announcements.filter(a => a.id !== id);
      this.persistOffline();
      this.renderAnnouncements();
    }
  },

  // =========================================================================
  // 4. RAFFLE CRUD & CSV
  // =========================================================================
  renderRaffle() {
    const countEl = document.getElementById('adminRaffleCount');
    const listEl = document.getElementById('adminRaffleParticipantsList');
    if (!countEl || !this.dbState) return;

    const participants = this.dbState.participants || JSON.parse(localStorage.getItem('gastrofest_participants') || '[]');
    countEl.textContent = `${participants.length} personas registradas`;

    if (listEl) {
      listEl.innerHTML = participants.map(p => `
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
      const res = await fetch(`./api/raffle/participants/${code}`, { method: 'DELETE' });
      if (res.ok) {
        this.fetchState();
        return;
      }
    } catch (e) {}

    let participants = JSON.parse(localStorage.getItem('gastrofest_participants') || '[]');
    participants = participants.filter(p => p.code !== code);
    localStorage.setItem('gastrofest_participants', JSON.stringify(participants));
    this.renderRaffle();
  },

  exportCSV() {
    const participants = this.dbState.participants || JSON.parse(localStorage.getItem('gastrofest_participants') || '[]');
    let csv = "Codigo,Nombre,Telefono,StandFavorito\n";
    participants.forEach(p => {
      csv += `"${p.code}","${p.name}","${p.phone}","${p.stand}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `sorteo_gastrofest_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

    // 2. Render Show Categories
    const showCatList = document.getElementById('adminShowCategoriesList');
    if (showCatList && this.dbState.showCategories) {
      showCatList.innerHTML = this.dbState.showCategories.map(c => `
        <div class="admin-item-row" style="flex-direction:row; justify-content:space-between; align-items:center; padding:8px 12px;">
          <div><span style="font-size:1.2rem;">${c.icon || '🔥'}</span> <strong>${c.name}</strong> <span style="font-size:0.75rem; color:var(--text-muted);">(${c.id})</span></div>
          <button class="btn-admin-action btn-danger" onclick="AdminApp.deleteCategory('show', '${c.id}')">✕</button>
        </div>
      `).join('');
    }

    // 3. Render Stand Categories
    const standCatList = document.getElementById('adminStandCategoriesList');
    if (standCatList && this.dbState.standCategories) {
      standCatList.innerHTML = this.dbState.standCategories.map(c => `
        <div class="admin-item-row" style="flex-direction:row; justify-content:space-between; align-items:center; padding:8px 12px;">
          <div><span style="font-size:1.2rem;">${c.icon || '🍽️'}</span> <strong>${c.name}</strong> <span style="font-size:0.75rem; color:var(--text-muted);">(${c.id})</span></div>
          <button class="btn-admin-action btn-danger" onclick="AdminApp.deleteCategory('stand', '${c.id}')">✕</button>
        </div>
      `).join('');
    }

    // 4. Render Stages
    const stagesList = document.getElementById('adminStagesList');
    if (stagesList && this.dbState.stages) {
      stagesList.innerHTML = this.dbState.stages.map(s => `
        <div class="admin-item-row" style="flex-direction:row; justify-content:space-between; align-items:center; padding:8px 12px;">
          <div><span style="font-size:1.2rem;">${s.icon || '🎤'}</span> <strong>${s.name}</strong></div>
          <button class="btn-admin-action btn-danger" onclick="AdminApp.deleteStage('${s.id}')">✕</button>
        </div>
      `).join('');
    }

    // 5. Render Sponsors
    const sponsorsList = document.getElementById('adminSponsorsList');
    if (sponsorsList && this.dbState.sponsors) {
      let html = '';
      const renderItem = (sp, tier) => `
        <div class="admin-item-row" style="flex-direction:row; justify-content:space-between; align-items:center; padding:8px 12px;">
          <div style="display:flex; align-items:center; gap:8px;">
            ${sp.logoUrl ? `<img src="${sp.logoUrl}" style="width:32px; height:32px; object-fit:contain; border-radius:4px; background:#fff;">` : `<span style="font-size:1.2rem;">${sp.icon || '🤝'}</span>`}
            <div>
              <strong>${sp.name}</strong>
              <div style="font-size:0.72rem; color:var(--admin-accent); font-weight:800;">${tier.toUpperCase()} • ${sp.tier}</div>
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
        this.fetchState();
        alert('✅ ¡Datos generales del evento actualizados con éxito!');
        return;
      }
    } catch (e) {}

    this.dbState.event = { ...this.dbState.event, ...payload };
    this.persistOffline();
    alert('✅ ¡Datos generales del evento actualizados con éxito!');
  },

  async addCategory(e, type) {
    e.preventDefault();
    const iconId = type === 'show' ? 'newShowCatIcon' : 'newStandCatIcon';
    const nameId = type === 'show' ? 'newShowCatName' : 'newStandCatName';

    const icon = document.getElementById(iconId).value.trim() || '✨';
    const name = document.getElementById(nameId).value.trim();
    if (!name) return;

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
        return;
      }
    } catch (e) {}

    const key = type === 'show' ? 'showCategories' : 'standCategories';
    if (!this.dbState[key]) this.dbState[key] = [];
    this.dbState[key].push({ id: cleanId, name, icon });
    this.persistOffline();
    document.getElementById(nameId).value = '';
    this.renderConfig();
  },

  async deleteCategory(type, id) {
    if (!confirm('¿Deseas eliminar esta categoría?')) return;
    try {
      const res = await fetch(`./api/categories/${type}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        this.fetchState();
        return;
      }
    } catch (e) {}

    const key = type === 'show' ? 'showCategories' : 'standCategories';
    if (this.dbState[key]) {
      this.dbState[key] = this.dbState[key].filter(c => c.id !== id);
      this.persistOffline();
      this.renderConfig();
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
        return;
      }
    } catch (e) {}

    if (!this.dbState.stages) this.dbState.stages = [];
    this.dbState.stages.push({ id: `stg-${Date.now()}`, name, icon });
    this.persistOffline();
    document.getElementById('newStageName').value = '';
    this.renderConfig();
  },

  async deleteStage(id) {
    if (!confirm('¿Deseas eliminar este escenario?')) return;
    try {
      const res = await fetch(`./api/stages/${id}`, { method: 'DELETE' });
      if (res.ok) {
        this.fetchState();
        return;
      }
    } catch (e) {}

    if (this.dbState.stages) {
      this.dbState.stages = this.dbState.stages.filter(s => s.id !== id);
      this.persistOffline();
      this.renderConfig();
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
        return;
      }
    } catch (e) {}

    if (!this.dbState.sponsors) this.dbState.sponsors = { gold: [], silver: [] };
    if (!this.dbState.sponsors[tier]) this.dbState.sponsors[tier] = [];
    this.dbState.sponsors[tier].push({
      name,
      tier: tierName,
      logoUrl,
      icon: tier === 'gold' ? '⭐' : '🥈'
    });
    this.persistOffline();
    document.getElementById('newSponsorName').value = '';
    document.getElementById('newSponsorLabel').value = '';
    if (document.getElementById('newSponsorLogo')) document.getElementById('newSponsorLogo').value = '';
    this.renderConfig();
  },

  async deleteSponsor(tier, name) {
    if (!confirm('¿Deseas eliminar este sponsor?')) return;
    try {
      const res = await fetch(`./api/sponsors/${tier}/${name}`, { method: 'DELETE' });
      if (res.ok) {
        this.fetchState();
        return;
      }
    } catch (e) {}

    const decodedName = decodeURIComponent(name);
    if (this.dbState.sponsors && this.dbState.sponsors[tier]) {
      this.dbState.sponsors[tier] = this.dbState.sponsors[tier].filter(s => s.name !== decodedName);
      this.persistOffline();
      this.renderConfig();
    }
  },

  // =========================================================================
  // 6. USERS & MARKETING LEADS (CAMPAIGNS)
  // =========================================================================
  renderUsers() {
    if (!this.dbState) return;
    if (!this.dbState.users) {
      this.dbState.users = window.GASTRO_DATA && GASTRO_DATA.users ? JSON.parse(JSON.stringify(GASTRO_DATA.users)) : [];
    }

    const users = this.dbState.users || [];

    // Update Stats KPIs
    const totalEl = document.getElementById('statUsersTotal');
    const googleEl = document.getElementById('statUsersGoogle');
    const ticketEl = document.getElementById('statUsersWithTicket');

    if (totalEl) totalEl.textContent = users.length;
    if (googleEl) googleEl.textContent = users.filter(u => u.provider === 'google').length;
    if (ticketEl) ticketEl.textContent = users.filter(u => Boolean(u.ticketCode)).length;

    // Filter by search query
    const searchInput = document.getElementById('adminUserSearchInput');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const filteredUsers = query
      ? users.filter(u => 
          (u.name && u.name.toLowerCase().includes(query)) ||
          (u.email && u.email.toLowerCase().includes(query)) ||
          (u.ticketCode && u.ticketCode.toLowerCase().includes(query))
        )
      : users;

    const tbody = document.getElementById('adminUsersTableBody');
    if (!tbody) return;

    if (filteredUsers.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 24px; color: var(--text-muted);">
            ${query ? 'No se encontraron usuarios que coincidan con la búsqueda.' : 'No hay usuarios registrados aún.'}
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filteredUsers.map(u => {
      const isGoogle = u.provider === 'google';
      const formattedDate = u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-UY', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Hoy';
      const initials = u.name ? u.name.substring(0, 2).toUpperCase() : 'US';

      return `
        <tr style="border-bottom: 1px solid var(--admin-border-subtle);">
          <td style="padding: 10px 8px; display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 50%; overflow: hidden; background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; color: var(--accent-secondary); border: 1px solid rgba(52, 211, 153, 0.3);">
              ${u.avatar ? `<img src="${u.avatar}" alt="${u.name}" style="width:100%; height:100%; object-fit:cover;">` : initials}
            </div>
            <strong>${u.name || 'Visitante'}</strong>
          </td>
          <td style="padding: 10px 8px;">
            ${u.email ? `<a href="mailto:${u.email}" style="color: #60a5fa; text-decoration: none; font-size: 0.85rem;">${u.email}</a>` : '<span style="color: var(--text-muted); font-size: 0.8rem;">Sin email</span>'}
          </td>
          <td style="padding: 10px 8px;">
            <span style="font-size: 0.72rem; padding: 2px 8px; border-radius: var(--radius-full); font-weight: 700; ${isGoogle ? 'background: rgba(66, 133, 244, 0.18); color: #93c5fd; border: 1px solid rgba(66, 133, 244, 0.4);' : 'background: rgba(245, 158, 11, 0.18); color: #fde68a; border: 1px solid rgba(245, 158, 11, 0.4);'}">
              ${isGoogle ? '🔵 Google' : '👤 Invitado'}
            </span>
          </td>
          <td style="padding: 10px 8px; font-size: 0.8rem; color: var(--text-secondary);">
            ${formattedDate}
          </td>
          <td style="padding: 10px 8px; font-size: 0.85rem;">
            ${u.ticketCode ? `<strong style="color: var(--color-gold);">#${u.ticketCode}</strong> <span style="font-size: 0.75rem; color: var(--text-muted);">(${u.votedStand || 'General'})</span>` : '<span style="color: var(--text-muted); font-size: 0.78rem;">-</span>'}
          </td>
          <td style="padding: 10px 8px; text-align: right;">
            <button class="btn-admin-action btn-danger" onclick="AdminApp.deleteUser('${u.id}')" title="Eliminar de la lista" style="padding: 4px 8px; font-size: 0.8rem;">
              🗑️
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  exportUsersCSV() {
    const users = this.dbState.users || [];
    if (users.length === 0) {
      alert('⚠️ No hay usuarios registrados para exportar.');
      return;
    }

    let csv = '\uFEFF'; // UTF-8 BOM
    csv += 'ID,Nombre,Email,Proveedor,Fecha Registro,Golden Ticket,Stand Votado\n';

    users.forEach(u => {
      const cleanName = (u.name || '').replace(/"/g, '""');
      const cleanEmail = (u.email || '').replace(/"/g, '""');
      const cleanProvider = (u.provider || '').replace(/"/g, '""');
      const cleanDate = (u.createdAt || '').replace(/"/g, '""');
      const cleanTicket = (u.ticketCode || 'No').replace(/"/g, '""');
      const cleanStand = (u.votedStand || '-').replace(/"/g, '""');

      csv += `"${u.id}","${cleanName}","${cleanEmail}","${cleanProvider}","${cleanDate}","${cleanTicket}","${cleanStand}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads_gastrofest_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  },

  copyAllEmails() {
    const users = this.dbState.users || [];
    const validEmails = users.map(u => u.email).filter(e => e && e.includes('@'));
    const uniqueEmails = Array.from(new Set(validEmails));

    if (uniqueEmails.length === 0) {
      alert('⚠️ No hay correos electrónicos válidos registrados aún.');
      return;
    }

    const emailListStr = uniqueEmails.join(', ');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(emailListStr).then(() => {
        alert(`📋 ¡${uniqueEmails.length} correos electrónicos copiados al portapapeles! Listo para pegar en tu cliente de correo o plataforma de marketing.`);
      });
    } else {
      prompt('Copia la lista de correos:', emailListStr);
    }
  },

  async deleteUser(userId) {
    if (!confirm('¿Deseas eliminar este usuario de la base de leads?')) return;
    try {
      await fetch(`./api/users/${userId}`, { method: 'DELETE' });
    } catch (e) {}

    this.dbState.users = (this.dbState.users || []).filter(u => u.id !== userId);
    this.persistOffline();
    this.renderUsers();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  AdminApp.init();
});
