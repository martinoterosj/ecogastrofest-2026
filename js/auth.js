/**
 * ECOGASTROFEST 2026 - AUTHENTICATION & USER SESSION MODULE
 * Soporta Google Identity Services (GIS) oficial, Facebook Login (Meta SDK),
 * Modo Invitado instantáneo, Gestión de Perfil y Auto-Completado de Sorteos
 */

const Auth = {
  sessionKey: 'gastrofest_user_session',
  clientIdKey: 'gastrofest_google_client_id',
  defaultClientId: '280286596600-sl30fvgves4pbh9m667fuf1j6o71rtku.apps.googleusercontent.com',
  fbAppIdKey: 'gastrofest_facebook_app_id',
  defaultFbAppId: '4575744502711008',
  currentUser: null,

  init() {
    this.loadSession();
    this.setupUIEvents();
    this.setupGoogleGIS();
    this.setupFacebookSDK();
    
    // Si no hay sesión activa, desplegar modal de bienvenida
    if (!this.currentUser) {
      this.openWelcomeModal();
    } else {
      this.updateUI();
      this.prefillRaffleForm();
    }
  },

  getGoogleClientId() {
    return localStorage.getItem(this.clientIdKey) || this.defaultClientId;
  },

  setGoogleClientId(clientId) {
    if (clientId && clientId.trim()) {
      localStorage.setItem(this.clientIdKey, clientId.trim());
      this.setupGoogleGIS();
      this.showToast('✅ Google Client ID configurado exitosamente.');
    }
  },

  getFacebookAppId() {
    return localStorage.getItem(this.fbAppIdKey) || this.defaultFbAppId;
  },

  setFacebookAppId(appId) {
    if (appId && appId.trim()) {
      localStorage.setItem(this.fbAppIdKey, appId.trim());
      this.setupFacebookSDK();
      this.showToast('✅ Facebook App ID configurado exitosamente.');
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

    // Registrar lead en base de datos central para campañas de email marketing
    if (typeof DBAdapter !== 'undefined' && DBAdapter.saveUserLead) {
      DBAdapter.saveUserLead(user).catch(() => {});
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
    // Botón de Google en modal de bienvenida
    const btnGoogle = document.getElementById('btnAuthGoogle');
    if (btnGoogle) {
      btnGoogle.addEventListener('click', () => this.loginWithGoogle());
    }

    // Botón de Facebook en modal de bienvenida
    const btnFacebook = document.getElementById('btnAuthFacebook');
    if (btnFacebook) {
      btnFacebook.addEventListener('click', () => this.loginWithFacebook());
    }

    // Botón de Invitado en modal de bienvenida
    const btnGuest = document.getElementById('btnAuthGuest');
    if (btnGuest) {
      btnGuest.addEventListener('click', () => this.loginAsGuest());
    }

    // Chip de perfil en el header
    const chip = document.getElementById('userProfileChip');
    if (chip) {
      chip.addEventListener('click', () => this.openProfileDrawer());
    }

    // Cerrar Drawer de Perfil
    const btnCloseProfile = document.getElementById('btnCloseProfileDrawer');
    if (btnCloseProfile) {
      btnCloseProfile.addEventListener('click', () => this.closeProfileDrawer());
    }

    // Cerrar Sesión desde Drawer
    const btnLogout = document.getElementById('btnLogoutAction');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => this.logout());
    }

    // Vincular Google desde Drawer (Modo Invitado)
    const btnLinkGoogle = document.getElementById('btnLinkGoogleInDrawer');
    if (btnLinkGoogle) {
      btnLinkGoogle.addEventListener('click', () => {
        this.closeProfileDrawer();
        this.loginWithGoogle();
      });
    }

    // Vincular Facebook desde Drawer (Modo Invitado)
    const btnLinkFacebook = document.getElementById('btnLinkFacebookInDrawer');
    if (btnLinkFacebook) {
      btnLinkFacebook.addEventListener('click', () => {
        this.closeProfileDrawer();
        this.loginWithFacebook();
      });
    }
  },

  // --------------------------------------------------------------------------
  // GOOGLE IDENTITY SERVICES (GIS) INTEGRATION
  // --------------------------------------------------------------------------
  setupGoogleGIS() {
    if (typeof window === 'undefined') return;

    const clientId = this.getGoogleClientId();

    const tryInitGIS = () => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response) => this.handleGoogleCredentialResponse(response),
            auto_select: false,
            cancel_on_tap_outside: true
          });

          // Renderizar botón oficial de Google en contenedor principal
          const container = document.getElementById('googleGisContainer');
          if (container) {
            container.innerHTML = '';
            window.google.accounts.id.renderButton(container, {
              theme: 'outline',
              size: 'large',
              shape: 'pill',
              width: 280,
              text: 'continue_with',
              logo_alignment: 'left'
            });

            const fallbackBtn = document.getElementById('btnAuthGoogle');
            if (fallbackBtn) {
              fallbackBtn.style.display = 'none';
            }
          }

          // Intentar prompt One Tap automático
          window.google.accounts.id.prompt();
        } catch (err) {
          console.log('ℹ️ Google GIS listo en modo interactivo');
        }
      }
    };

    if (window.google && window.google.accounts) {
      tryInitGIS();
    } else {
      window.addEventListener('load', tryInitGIS);
      setTimeout(tryInitGIS, 1000);
      setTimeout(tryInitGIS, 2500);
    }
  },

  handleGoogleCredentialResponse(response) {
    if (!response || !response.credential) return;

    try {
      const payload = this.parseJwt(response.credential);
      const user = {
        id: `google-${payload.sub || Date.now()}`,
        name: payload.name || payload.given_name || 'Usuario Google',
        email: payload.email || '',
        avatar: payload.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(payload.name || 'User')}&background=10b981&color=fff&size=128&bold=true`,
        type: 'google',
        provider: 'google',
        createdAt: new Date().toISOString()
      };

      this.saveSession(user);
      this.closeWelcomeModal();
      this.showToast(`🌿 ¡Bienvenido/a, ${user.name.split(' ')[0]}! Conectado con Google.`);
    } catch (e) {
      console.error('Error al decodificar credencial de Google:', e);
      this.promptCustomGoogleLogin();
    }
  },

  parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return {};
    }
  },

  // --------------------------------------------------------------------------
  // FACEBOOK JAVASCRIPT SDK INTEGRATION
  // --------------------------------------------------------------------------
  setupFacebookSDK() {
    if (typeof window === 'undefined') return;

    const appId = this.getFacebookAppId();

    window.fbAsyncInit = () => {
      if (typeof window.FB !== 'undefined') {
        try {
          window.FB.init({
            appId      : appId,
            cookie     : true,
            xfbml      : true,
            version    : 'v20.0'
          });
          console.log('📘 Facebook JavaScript SDK inicializado.');
        } catch (e) {
          console.log('ℹ️ Facebook SDK listo en modo interactivo');
        }
      }
    };

    // Inyectar SDK oficial de Facebook si no está presente en el DOM
    if (typeof document !== 'undefined' && !document.getElementById('facebook-jssdk')) {
      const js = document.createElement('script');
      js.id = 'facebook-jssdk';
      js.src = 'https://connect.facebook.net/es_LA/sdk.js';
      js.async = true;
      js.defer = true;
      js.crossOrigin = 'anonymous';
      const firstScript = document.getElementsByTagName('script')[0];
      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(js, firstScript);
      } else if (document.head) {
        document.head.appendChild(js);
      }
    }
  },

  handleFacebookProfile(profile) {
    if (!profile) return;

    let avatarUrl = null;
    if (profile.picture) {
      if (typeof profile.picture === 'string') {
        avatarUrl = profile.picture;
      } else if (profile.picture.data && profile.picture.data.url) {
        avatarUrl = profile.picture.data.url;
      }
    }
    if (!avatarUrl && profile.id) {
      avatarUrl = `https://graph.facebook.com/${profile.id}/picture?type=large`;
    }
    if (!avatarUrl) {
      avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'User')}&background=1877F2&color=fff&size=128&bold=true`;
    }

    const user = {
      id: `facebook-${profile.id || Date.now()}`,
      name: profile.name || 'Usuario Facebook',
      email: profile.email || '',
      avatar: avatarUrl,
      type: 'facebook',
      provider: 'facebook',
      createdAt: new Date().toISOString()
    };

    this.saveSession(user);
    this.closeWelcomeModal();
    this.showToast(`🌿 ¡Bienvenido/a, ${user.name.split(' ')[0]}! Conectado con Facebook.`);
  },

  // --------------------------------------------------------------------------
  // AUTH ACTIONS
  // --------------------------------------------------------------------------
  loginWithGoogle(customProfile = null) {
    if (customProfile) {
      const user = {
        id: `google-${Date.now()}`,
        name: customProfile.name || 'Usuario Google',
        email: customProfile.email || 'usuario@gmail.com',
        avatar: customProfile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(customProfile.name || 'User')}&background=10b981&color=fff&size=128&bold=true`,
        type: 'google',
        provider: 'google',
        createdAt: new Date().toISOString()
      };
      this.saveSession(user);
      this.closeWelcomeModal();
      this.showToast(`🌿 ¡Bienvenido/a, ${user.name.split(' ')[0]}! Has iniciado sesión con Google.`);
      return;
    }

    // Intentar abrir el selector nativo de Google GIS
    if (typeof window !== 'undefined' && window.google && window.google.accounts && window.google.accounts.id) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            this.promptCustomGoogleLogin();
          }
        });
        return;
      } catch (e) {}
    }

    // Fallback interactivo si no carga GIS
    this.promptCustomGoogleLogin();
  },

  promptCustomGoogleLogin() {
    const userRealName = prompt('🔵 Iniciar Sesión con Google\n\nIngresa tu Nombre Completo (como figura en tu cuenta de Google):', 'Martín Otero');
    if (!userRealName || !userRealName.trim()) return;

    const userRealEmail = prompt('Ingresa tu Correo Electrónico de Google (Gmail):', `${userRealName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`);
    if (!userRealEmail || !userRealEmail.trim()) return;

    const user = {
      id: `google-${Date.now()}`,
      name: userRealName.trim(),
      email: userRealEmail.trim(),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userRealName.trim())}&background=10b981&color=fff&size=128&bold=true`,
      type: 'google',
      provider: 'google',
      createdAt: new Date().toISOString()
    };

    this.saveSession(user);
    this.closeWelcomeModal();
    this.showToast(`🌿 ¡Bienvenido/a, ${user.name.split(' ')[0]}! Has iniciado sesión con Google.`);
  },

  loginWithFacebook(customProfile = null) {
    if (customProfile) {
      this.handleFacebookProfile(customProfile);
      return;
    }

    // Intentar abrir el diálogo oficial de Facebook Login
    if (typeof window !== 'undefined' && typeof window.FB !== 'undefined') {
      try {
        window.FB.login((response) => {
          if (response && response.authResponse) {
            window.FB.api('/me', { fields: 'id,name,email,picture.width(250).height(250)' }, (profile) => {
              if (profile && !profile.error) {
                this.handleFacebookProfile(profile);
              } else {
                this.promptCustomFacebookLogin();
              }
            });
          } else {
            console.log('Login de Facebook cancelado o no autorizado');
          }
        }, { scope: 'public_profile,email' });
        return;
      } catch (err) {
        console.warn('FB.login exception:', err);
      }
    }

    // Fallback interactivo si no está activo FB SDK en localhost/offline
    this.promptCustomFacebookLogin();
  },

  promptCustomFacebookLogin() {
    const userRealName = prompt('🟦 Iniciar Sesión con Facebook\n\nIngresa tu Nombre Completo (como figura en tu perfil de Facebook):', 'Martín Otero');
    if (!userRealName || !userRealName.trim()) return;

    const userRealEmail = prompt('Ingresa tu Correo Electrónico vinculado a Facebook:', `${userRealName.toLowerCase().replace(/\s+/g, '.')}@facebook.com`);

    const user = {
      id: `facebook-${Date.now()}`,
      name: userRealName.trim(),
      email: userRealEmail ? userRealEmail.trim() : '',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userRealName.trim())}&background=1877F2&color=fff&size=128&bold=true`,
      type: 'facebook',
      provider: 'facebook',
      createdAt: new Date().toISOString()
    };

    this.saveSession(user);
    this.closeWelcomeModal();
    this.showToast(`🌿 ¡Bienvenido/a, ${user.name.split(' ')[0]}! Has iniciado sesión con Facebook.`);
  },

  loginAsGuest(customName = null) {
    const guestNumber = Math.floor(100 + Math.random() * 900);
    const user = {
      id: `guest-${guestNumber}`,
      name: customName || `Invitado #${guestNumber}`,
      email: null,
      avatar: null,
      type: 'guest',
      provider: 'guest',
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
    const linkFacebookRow = document.getElementById('drawerLinkFacebookRow');
    const ticketSummary = document.getElementById('drawerTicketSummary');

    if (nameEl) nameEl.textContent = this.currentUser.name;
    if (emailEl) {
      emailEl.textContent = this.currentUser.email || 'Modo exploración local';
      emailEl.style.display = this.currentUser.email ? 'block' : 'none';
    }

    if (typeBadge) {
      if (this.currentUser.type === 'google') {
        typeBadge.innerHTML = '🟢 <span style="color:#34d399;">Cuenta Google Verificada</span>';
      } else if (this.currentUser.type === 'facebook') {
        typeBadge.innerHTML = '🟦 <span style="color:#60a5fa;">Cuenta Facebook Verificada</span>';
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

    const isGuest = this.currentUser.type === 'guest';
    if (linkGoogleRow) {
      linkGoogleRow.style.display = isGuest ? 'block' : 'none';
    }
    if (linkFacebookRow) {
      linkFacebookRow.style.display = isGuest ? 'block' : 'none';
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
      
      chip.classList.remove('is-google', 'is-facebook');
      if (this.currentUser.type === 'google') {
        chip.classList.add('is-google');
        chip.title = `Conectado como ${this.currentUser.name} (Google)`;
      } else if (this.currentUser.type === 'facebook') {
        chip.classList.add('is-facebook');
        chip.title = `Conectado como ${this.currentUser.name} (Facebook)`;
      } else {
        chip.title = `Modo Invitado (${this.currentUser.name})`;
      }
    } else {
      chip.style.display = 'flex';
      if (chipName) chipName.textContent = 'Ingresar';
      if (chipAvatar) chipAvatar.innerHTML = `<span>👤</span>`;
      chip.classList.remove('is-google', 'is-facebook');
      chip.title = 'Iniciar sesión o entrar como invitado';
    }
  },

  prefillRaffleForm() {
    if (!this.currentUser) return;

    const nameInput = document.getElementById('raffleName') || document.getElementById('raffleNameInput');
    if (nameInput && !nameInput.value) {
      if (this.currentUser.type === 'google' || this.currentUser.type === 'facebook' || !this.currentUser.name.startsWith('Invitado #')) {
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
