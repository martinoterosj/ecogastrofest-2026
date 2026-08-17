/**
 * GASTROFEST 2026 - RAFFLE & DIGITAL TICKET MODULE
 * Fast registration, offline golden ticket with QR generator, and interactive live host roulette
 */

const Raffle = {
  currentTicket: null,
  participants: [],
  isSpinning: false,

  init() {
    this.loadTicket();
    this.loadParticipants();
    this.populateStandSelect();
    this.setupListeners();
    this.render();
  },

  loadTicket() {
    try {
      const saved = localStorage.getItem('gastrofest_user_ticket');
      this.currentTicket = saved ? JSON.parse(saved) : null;
    } catch (e) {
      this.currentTicket = null;
    }
  },

  loadParticipants() {
    try {
      const saved = localStorage.getItem('gastrofest_participants');
      if (saved) {
        this.participants = JSON.parse(saved);
      } else {
        // Seed default participants for live roulette fun demo
        this.participants = [
          { name: "Martín Gómez", phone: "11-4521-9988", code: "GF-8412", stand: "La Fogonera Asados" },
          { name: "Camila Navarro", phone: "11-8844-3211", code: "GF-3904", stand: "Smash Burger Mafia" },
          { name: "Gonzalo Benítez", phone: "11-6632-1100", code: "GF-7721", stand: "Green Garden Plant Based" },
          { name: "Luciana Rossi", phone: "11-9922-4411", code: "GF-1049", stand: "Tokyo Ramen & Bao" },
          { name: "Facundo Morales", phone: "11-3321-8877", code: "GF-5532", stand: "Cervecería Patagonia" }
        ];
        this.saveParticipants();
      }
    } catch (e) {
      this.participants = [];
    }
  },

  saveParticipants() {
    try {
      localStorage.setItem('gastrofest_participants', JSON.stringify(this.participants));
    } catch (e) {
      console.warn('Could not save participants');
    }
  },

  populateStandSelect() {
    const select = document.getElementById('raffleStandSelect');
    if (!select) return;
    select.innerHTML = '<option value="">-- Selecciona tu stand favorito --</option>';
    GASTRO_DATA.stands.forEach(st => {
      const opt = document.createElement('option');
      opt.value = st.name;
      opt.textContent = `${st.number} - ${st.name}`;
      select.appendChild(opt);
    });
  },

  setupListeners() {
    const form = document.getElementById('raffleRegistrationForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleRegister();
      });
    }
  },

  handleRegister() {
    const nameInput = document.getElementById('raffleName');
    const phoneInput = document.getElementById('rafflePhone');
    const standSelect = document.getElementById('raffleStandSelect');

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const stand = standSelect.value || 'GastroFest 2026';

    if (!name || !phone) {
      App.showToast('⚠️ Por favor completa tu nombre y WhatsApp');
      return;
    }

    // Generate random 4-digit serial
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const code = `GF-${randomNum}`;

    const newTicket = {
      code,
      name,
      phone,
      stand,
      issuedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      eventName: GASTRO_DATA.event.name
    };

    this.currentTicket = newTicket;
    localStorage.setItem('gastrofest_user_ticket', JSON.stringify(newTicket));

    // Save into participants list
    this.participants.push(newTicket);
    this.saveParticipants();

    App.playFanfare();
    App.launchConfetti();
    App.showToast(`🎉 ¡Ticket #${code} generado con éxito!`);
    this.render();
  },

  drawQRCode(code) {
    const canvas = document.getElementById('ticketQrCanvas');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const size = 110;
    canvas.width = size;
    canvas.height = size;

    // Draw stylized QR matrix simulation
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = '#111827';
    // Draw corner markers
    const drawMarker = (x, y) => {
      ctx.fillRect(x, y, 24, 24);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 4, y + 4, 16, 16);
      ctx.fillStyle = '#111827';
      ctx.fillRect(x + 8, y + 8, 8, 8);
    };

    drawMarker(6, 6);
    drawMarker(size - 30, 6);
    drawMarker(6, size - 30);

    // Random consistent hash grid based on code
    let hash = 0;
    for (let i = 0; i < code.length; i++) hash = code.charCodeAt(i) + ((hash << 5) - hash);
    
    for (let r = 0; r < 14; r++) {
      for (let c = 0; c < 14; c++) {
        if ((r < 5 && c < 5) || (r < 5 && c > 8) || (r > 8 && c < 5)) continue;
        if (((hash + (r * 13) + (c * 7)) % 3) === 0) {
          ctx.fillRect(8 + c * 7, 8 + r * 7, 5, 5);
        }
      }
    }

    // Draw center brand dot
    ctx.fillStyle = '#ff5e1e';
    ctx.fillRect(size / 2 - 6, size / 2 - 6, 12, 12);
  },

  shareWhatsApp() {
    if (!this.currentTicket) return;
    const text = encodeURIComponent(
      `🎟️ ¡Ya tengo mi Ticket Oficial para los sorteos de ${GASTRO_DATA.event.name}!\n` +
      `📌 Mi número de la suerte: *#${this.currentTicket.code}*\n` +
      `🍔 Mi stand favorito: ${this.currentTicket.stand}\n` +
      `¡Nos vemos en el Parque Central!`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  },

  copyTicketCode() {
    if (!this.currentTicket) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(this.currentTicket.code).then(() => {
        App.showToast('📋 Código de ticket copiado al portapapeles');
      });
    } else {
      App.showToast(`📋 Código: ${this.currentTicket.code}`);
    }
  },

  render() {
    const formSection = document.getElementById('raffleFormSection');
    const ticketSection = document.getElementById('raffleTicketSection');

    if (this.currentTicket) {
      if (formSection) formSection.style.display = 'none';
      if (ticketSection) {
        ticketSection.style.display = 'block';
        
        // Update ticket values
        document.getElementById('ticketSerialDisplay').textContent = `#${this.currentTicket.code}`;
        document.getElementById('ticketHolderName').textContent = this.currentTicket.name;
        document.getElementById('ticketHolderPhone').textContent = this.currentTicket.phone;
        document.getElementById('ticketHolderStand').textContent = this.currentTicket.stand;
        document.getElementById('ticketHolderTime').textContent = this.currentTicket.issuedAt;

        // Render QR
        this.drawQRCode(this.currentTicket.code);
      }
    } else {
      if (formSection) formSection.style.display = 'block';
      if (ticketSection) ticketSection.style.display = 'none';
    }
  }
};
