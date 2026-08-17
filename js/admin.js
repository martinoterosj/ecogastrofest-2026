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
        localStorage.setItem('gastrofest_db', JSON.stringify(this.dbState));
      } else {
        throw new Error('Static host fallback');
      }
    } catch (e) {
      console.log('ℹ️ Usando almacenamiento local/cloud para el panel de administración');
      const saved = localStorage.getItem('gastrofest_db');
      if (saved) {
        this.dbState = JSON.parse(saved);
      } else if (window.GASTRO_DATA) {
        this.dbState = JSON.parse(JSON.stringify(GASTRO_DATA));
      }
    }

    if (this.dbState) {
      this.renderSchedule();
      this.renderStands();
      this.renderAnnouncements();
      this.renderRaffle();
      this.renderConfig();
    }
  },

  persistOffline() {
    if (this.dbState) {
      localStorage.setItem('gastrofest_db', JSON.stringify(this.dbState));
      if (window.GASTRO_DATA) {
        Object.assign(GASTRO_DATA, this.dbState);
      }
      if (window.DBAdapter && DBAdapter.isCloudReady) {
        DBAdapter.saveCloudData(this.dbState);
      }
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
  // 3. ANNOUNCEMENTS CRUD
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
  }
};

document.addEventListener('DOMContentLoaded', () => {
  AdminApp.init();
});
