/**
 * ECOGASTROFEST 2026 - AUTHENTICATION & USER SESSION MODULE
 * Handles Google Sign-In, Guest Fast Access, Header Profile Badge & Golden Ticket Pre-fill
 */

const Auth = {
  sessionKey: 'gastrofest_user_session',
  currentUser: null,

  init() {
    this.loadSession();
    this.setupUIEvents();
    
    // If no active session, show the welcome auth modal
    if (!this.currentUser) {
      this.openWelcomeModal();
    } else {
      this.updateUI();
      this.prefillRaffleForm();
    }
  },

  loadSession() {
    try {
      const saved = localStorage.getItem(this.sessionKey);
      if (saved) {
        this.currentUser = JSON.parse(saved);
      } else {
        this.currentUser = null;
      }
    } catch (e) {
      this.currentUser = null;
    }
  },

  saveSession(user) {
    this.currentUser = user;
    try {
      localStorage.setItem(this.sessionKey, JSON.stringify(user));
    } catch (e) {
      console.warn('Could not persist user session');
    }
    this.updateUI();
    this.prefillRaffleForm();
  },

  clearSession() {
    this.currentUser = null;
    try {
      localStorage.removeItem(this.sessionKey);
    } catch (e) {}
    this.updateUI();
  },

  setupUIEvents() {
    // Google Login button in welcome modal
    const btnGoogle = document.getElementById('btnAuthGoogle');
    if (btnGoogle) {
      btnGoogle.addEventListener('click', () => this.loginWithGoogle());
    }

    // Guest Login button in welcome modal
    const btnGuest = document.getElementById('btnAuthGuest');
    if (btnGuest) {
      btnGuest.addEventListener('click', () => this.loginAsGuest());
    }

    // Header Profile Chip click -> open profile drawer
    const chip = document.getElementById('userProfileChip');
    if (chip) {
      chip.addEventListener('click', () => this.openProfileDrawer());
    }

    // Close Profile Drawer
    const btnCloseProfile = document.getElementById('btnCloseProfileDrawer');
    if (btnCloseProfile) {
      btnCloseProfile.addEventListener('click', () => this.closeProfileDrawer());
    }

    // Logout from Drawer
    const btnLogout = document.getElementById('btnLogoutAction');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => this.logout());
    }

    // Link Google from Guest profile drawer
    const btnLinkGoogle = document.getElementById('btnLinkGoogleInDrawer');
    if (btnLinkGoogle) {
      btnLinkGoogle.addEventListener('click', () => {
        this.closeProfileDrawer();
        this.loginWithGoogle();
      });
    }
  },

  // --------------------------------------------------------------------------
  // AUTH ACTIONS
  // --------------------------------------------------------------------------
  loginWithGoogle(customProfile = null) {
    let user;
    if (customProfile) {
      user = {
        id: `google-${Date.now()}`,
        name: customProfile.name || 'Visitante Google',
        email: customProfile.email || 'visitante@gmail.com',
        avatar: customProfile.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop',
        type: 'google',
        createdAt: new Date().toISOString()
      };
    } else {
      // Realistic Google profile simulation with instant feedback
      const sampleProfiles = [
        { name: 'Martín Gómez', email: 'martin.gomez.uy@gmail.com', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop' },
        { name: 'Camila Navarro', email: 'camila.navarro@gmail.com', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop' },
        { name: 'Gonzalo Benítez', email: 'gonzalo.benitez26@gmail.com', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop' }
      ];
      const random = sampleProfiles[Math.floor(Math.random() * sampleProfiles.length)];
      user = {
        id: `google-${Math.floor(1000 + Math.random() * 9000)}`,
        name: random.name,
        email: random.email,
        avatar: random.avatar,
        type: 'google',
        createdAt: new Date().toISOString()
      };
    }

    this.saveSession(user);
    this.closeWelcomeModal();
    this.showToast(`🌿 ¡Bienvenido/a, ${user.name.split(' ')[0]}! Has iniciado sesión con Google.`);
  },

  loginAsGuest(customName = null) {
    const guestNumber = Math.floor(100 + Math.random() * 900);
    const user = {
      id: `guest-${guestNumber}`,
      name: customName || `Invitado #${guestNumber}`,
      email: null,
      avatar: null,
      type: 'guest',
      createdAt: new Date().toISOString()
    };

    this.saveSession(user);
    this.closeWelcomeModal();
    this.showToast(`👋 ¡Bienvenido/a! Estás navegando en modo Invitado.`);
  },

  logout() {
    this.clearSession();
    this.closeProfileDrawer();
    this.openWelcomeModal();
    this.showToast('ℹ️ Sesión cerrada. Elige cómo deseas continuar.');
  },

  // --------------------------------------------------------------------------
  // MODAL / DRAWER VISIBILITY
  // --------------------------------------------------------------------------
  openWelcomeModal() {
    const modal = document.getElementById('authWelcomeModal');
    if (modal) {
      modal.classList.add('active');
    }
  },

  closeWelcomeModal() {
    const modal = document.getElementById('authWelcomeModal');
    if (modal) {
      modal.classList.remove('active');
    }
  },

  openProfileDrawer() {
    if (!this.currentUser) {
      this.openWelcomeModal();
      return;
    }

    const drawer = document.getElementById('userProfileDrawer');
    if (!drawer) return;

    const nameEl = document.getElementById('drawerUserName');
    const emailEl = document.getElementById('drawerUserEmail');
    const typeBadge = document.getElementById('drawerUserTypeBadge');
    const avatarEl = document.getElementById('drawerUserAvatar');
    const linkGoogleRow = document.getElementById('drawerLinkGoogleRow');
    const ticketSummary = document.getElementById('drawerTicketSummary');

    if (nameEl) nameEl.textContent = this.currentUser.name;
    if (emailEl) {
      emailEl.textContent = this.currentUser.email || 'Modo exploración local';
      emailEl.style.display = this.currentUser.email ? 'block' : 'none';
    }

    if (typeBadge) {
      if (this.currentUser.type === 'google') {
        typeBadge.innerHTML = '🟢 <span style="color:#34d399;">Cuenta Google Verificada</span>';
      } else {
        typeBadge.innerHTML = '👤 <span style="color:#f59e0b;">Modo Invitado</span>';
      }
    }

    if (avatarEl) {
      if (this.currentUser.avatar) {
        avatarEl.innerHTML = `<img src="${this.currentUser.avatar}" alt="${this.currentUser.name}" class="profile-avatar-img">`;
      } else {
        const initials = this.currentUser.name ? this.currentUser.name.substring(0, 2).toUpperCase() : 'IN';
        avatarEl.innerHTML = `<div class="profile-avatar-placeholder">${initials}</div>`;
      }
    }

    if (linkGoogleRow) {
      linkGoogleRow.style.display = this.currentUser.type === 'guest' ? 'block' : 'none';
    }

    // Check if user already has a Golden Ticket
    if (ticketSummary) {
      const savedTicket = localStorage.getItem('gastrofest_user_ticket');
      if (savedTicket) {
        try {
          const t = JSON.parse(savedTicket);
          ticketSummary.innerHTML = `
            <div class="drawer-ticket-card">
              <span class="ticket-mini-badge">🎟️ Golden Ticket Activo</span>
              <strong>#${t.code}</strong>
              <span>Voto: <em>${t.stand}</em></span>
            </div>
          `;
        } catch (e) {
          ticketSummary.innerHTML = '<p class="drawer-no-ticket">Sin ticket registrado aún.</p>';
        }
      } else {
        ticketSummary.innerHTML = `
          <div class="drawer-no-ticket-box">
            <p>Aún no participas del sorteo.</p>
            <button class="btn-drawer-raffle" onclick="Auth.closeProfileDrawer(); App.switchTab('sorteo');">
              🎟️ Obtener Golden Ticket
            </button>
          </div>
        `;
      }
    }

    drawer.classList.add('active');
  },

  closeProfileDrawer() {
    const drawer = document.getElementById('userProfileDrawer');
    if (drawer) {
      drawer.classList.remove('active');
    }
  },

  // --------------------------------------------------------------------------
  // UI UPDATES & SYNC
  // --------------------------------------------------------------------------
  updateUI() {
    const chip = document.getElementById('userProfileChip');
    const chipAvatar = document.getElementById('userChipAvatar');
    const chipName = document.getElementById('userChipName');

    if (!chip) return;

    if (this.currentUser) {
      chip.style.display = 'flex';
      
      const firstName = this.currentUser.name.split(' ')[0];
      if (chipName) chipName.textContent = firstName;

      if (chipAvatar) {
        if (this.currentUser.avatar) {
          chipAvatar.innerHTML = `<img src="${this.currentUser.avatar}" alt="${this.currentUser.name}" class="chip-avatar-img">`;
        } else {
          const initials = firstName.substring(0, 1).toUpperCase();
          chipAvatar.innerHTML = `<span class="chip-avatar-initial">${initials}</span>`;
        }
      }
      
      if (this.currentUser.type === 'google') {
        chip.classList.add('is-google');
        chip.title = `Conectado como ${this.currentUser.name} (Google)`;
      } else {
        chip.classList.remove('is-google');
        chip.title = `Modo Invitado (${this.currentUser.name})`;
      }
    } else {
      chip.style.display = 'flex';
      if (chipName) chipName.textContent = 'Ingresar';
      if (chipAvatar) chipAvatar.innerHTML = `<span>👤</span>`;
      chip.classList.remove('is-google');
      chip.title = 'Iniciar sesión o entrar como invitado';
    }
  },

  prefillRaffleForm() {
    if (!this.currentUser) return;

    const nameInput = document.getElementById('raffleName') || document.getElementById('raffleNameInput');
    if (nameInput && !nameInput.value) {
      if (this.currentUser.type === 'google' || !this.currentUser.name.startsWith('Invitado #')) {
        nameInput.value = this.currentUser.name;
      }
    }
  },

  showToast(message) {
    if (typeof window.showNotificationToast === 'function') {
      window.showNotificationToast(message, 'info');
      return;
    }
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-notification toast-active';
    toast.style.animation = 'toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
    toast.innerHTML = `
      <div class="toast-content" style="display:flex; align-items:center; gap:8px;">
        <span>${message}</span>
      </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
};

if (typeof window !== 'undefined') {
  window.Auth = Auth;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Auth;
}
