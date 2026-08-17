/**
 * GASTROFEST 2026 - PWA & OFFLINE CONTROLLER
 * Service worker registration, install prompts, and connection state monitor
 */

const PWAController = {
  deferredPrompt: null,

  init() {
    this.registerServiceWorker();
    this.setupNetworkMonitor();
    this.setupInstallPrompt();
  },

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then(registration => {
            console.log('[PWA] Service Worker registrado exitosamente:', registration.scope);
          })
          .catch(err => {
            console.log('[PWA] Fallo en el registro del Service Worker:', err);
          });
      });
    }
  },

  setupNetworkMonitor() {
    const updateOnlineStatus = () => {
      const isOnline = navigator.onLine;
      const statusPill = document.getElementById('networkStatusPill');
      const statusText = document.getElementById('networkStatusText');

      if (statusPill && statusText) {
        if (isOnline) {
          statusPill.className = 'status-pill online';
          statusText.textContent = 'En Vivo';
        } else {
          statusPill.className = 'status-pill offline';
          statusText.textContent = 'Modo Offline';
          if (window.App) {
            App.showToast('📡 Estás sin señal: Todo el festival funciona 100% offline');
          }
        }
      }
    };

    window.addEventListener('online', () => {
      updateOnlineStatus();
      if (window.App) App.showToast('🟢 Conexión restablecida');
    });

    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();
  },

  setupInstallPrompt() {
    const installBanner = document.getElementById('pwaInstallBanner');
    const installBtn = document.getElementById('pwaInstallActionBtn');

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      if (installBanner) {
        installBanner.style.display = 'flex';
      }
    });

    if (installBtn) {
      installBtn.addEventListener('click', async () => {
        if (this.deferredPrompt) {
          this.deferredPrompt.prompt();
          const { outcome } = await this.deferredPrompt.userChoice;
          console.log(`[PWA] Elección de instalación: ${outcome}`);
          this.deferredPrompt = null;
          if (installBanner) installBanner.style.display = 'none';
        } else {
          // iOS Safari detection helper
          const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
          if (isIos) {
            alert("📲 Para instalar en iPhone: Toca el botón 'Compartir' (el cuadrado con la flecha hacia arriba) y selecciona 'Agregar a Inicio ➕'");
          } else {
            alert("📲 Para instalar la app, abre el menú de tu navegador (⋮) y selecciona 'Instalar aplicación' o 'Agregar a la pantalla principal'.");
          }
        }
      });
    }

    window.addEventListener('appinstalled', () => {
      console.log('[PWA] GastroFest fue instalada exitosamente');
      if (installBanner) installBanner.style.display = 'none';
      if (window.App) App.showToast('📱 ¡GastroFest instalada en tu pantalla de inicio!');
    });
  }
};
