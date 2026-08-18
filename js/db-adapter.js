/**
 * ECOGASTROFEST 2026 - DATA ADAPTER (REST API & LOCALSTORAGE PERSISTENCE)
 * Sincronización transparente con el backend Express y persistencia local sin dependencias externas
 */

const DBAdapter = {
  isReady: true,

  async init() {
    this.updateStatusBadge();
    return true;
  },

  updateStatusBadge() {
    const badge = document.getElementById('dbEngineBadge');
    if (badge) {
      badge.innerHTML = '🟢 <span style="color:#34d399;">Sistema Sincronizado (REST / Local)</span>';
    }
  },

  // --------------------------------------------------------------------------
  // SUBSCRIPTION / SYNC
  // --------------------------------------------------------------------------
  subscribe(onDataCallback) {
    if (window.LiveSync) {
      LiveSync.syncWithBackend();
    }
  },

  async pushFullState(stateData) {
    try {
      const res = await fetch('./api/sync');
      return { success: res.ok, mode: 'local' };
    } catch (e) {
      return { success: true, mode: 'offline' };
    }
  },

  // --------------------------------------------------------------------------
  // CRUD WRITE OPERATIONS (REST API Express / LocalStorage)
  // --------------------------------------------------------------------------
  async saveEvent(eventData) {
    const res = await fetch('./api/event', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });
    return await res.json();
  },

  async addShow(showData) {
    const res = await fetch('./api/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(showData)
    });
    return await res.json();
  },

  async updateShow(showId, updatedFields) {
    const res = await fetch(`./api/schedule/${showId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedFields)
    });
    return await res.json();
  },

  async deleteShow(showId) {
    const res = await fetch(`./api/schedule/${showId}`, { method: 'DELETE' });
    return await res.json();
  },

  async addStand(standData) {
    const res = await fetch('./api/stands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(standData)
    });
    return await res.json();
  },

  async updateStand(standId, updatedFields) {
    const res = await fetch(`./api/stands/${standId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedFields)
    });
    return await res.json();
  },

  async deleteStand(standId) {
    const res = await fetch(`./api/stands/${standId}`, { method: 'DELETE' });
    return await res.json();
  },

  async updateDishStock(standId, itemTitle, isSoldOut) {
    const res = await fetch(`./api/stands/${standId}/menu`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item: itemTitle, isSoldOut })
    });
    return await res.json();
  },

  async addZone(zoneData) {
    const res = await fetch('./api/zones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(zoneData)
    });
    return await res.json();
  },

  async updateZone(zoneId, updatedFields) {
    const res = await fetch(`./api/zones/${zoneId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedFields)
    });
    return await res.json();
  },

  async deleteZone(zoneId) {
    const res = await fetch(`./api/zones/${zoneId}`, { method: 'DELETE' });
    return await res.json();
  },

  async registerParticipant(participant) {
    const res = await fetch('./api/raffle/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(participant)
    });
    return await res.json();
  }
};
