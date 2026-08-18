/**
 * ECOGASTROFEST 2026 - UNIVERSAL DATABASE ADAPTER (FIREBASE FIRESTORE & REST FALLBACK)
 * Manages Real-time cloud sync, Offline IndexedDB cache, and CRUD operations
 */

const DBAdapter = {
  isCloudReady: false,
  firestore: null,
  docRef: null,
  unsubscribeSnapshot: null,

  async init() {
    if (typeof isFirebaseConfigured === 'function' && isFirebaseConfigured() && typeof firebase !== 'undefined') {
      try {
        if (!firebase.apps.length) {
          firebase.initializeApp(FIREBASE_CONFIG);
        }
        this.firestore = firebase.firestore();

        // Enable offline persistence in IndexedDB for crowded festival connectivity
        try {
          await this.firestore.enablePersistence({ synchronizeTabs: true });
          console.log('📦 Firestore Offline IndexedDB Persistence activada con éxito');
        } catch (err) {
          if (err.code === 'failed-precondition') {
            console.warn('Persistencia offline múltiple tabs');
          } else if (err.code === 'unimplemented') {
            console.warn('Navegador no soporta persistencia');
          }
        }

        this.docRef = this.firestore.collection('festivals').doc('ecogastrofest_2026');
        this.isCloudReady = true;
        console.log('🔥 Conectado exitosamente a Firebase Firestore en la nube');
        this.updateCloudStatusBadge(true);
        return true;
      } catch (e) {
        console.warn('No se pudo inicializar Firebase, usando fallback local:', e);
        this.isCloudReady = false;
        this.updateCloudStatusBadge(false);
        return false;
      }
    } else {
      console.log('ℹ️ Firebase no configurado aún. Operando en modo Local REST API / LocalStorage.');
      this.isCloudReady = false;
      this.updateCloudStatusBadge(false);
      return false;
    }
  },

  updateCloudStatusBadge(isCloud) {
    const badge = document.getElementById('dbEngineBadge');
    if (badge) {
      if (isCloud) {
        badge.innerHTML = '☁️ <span style="color:#34d399;">Firebase Firestore (Nube)</span>';
      } else {
        badge.innerHTML = '💻 <span style="color:#f59e0b;">Servidor Local / REST</span>';
      }
    }
  },

  // --------------------------------------------------------------------------
  // REAL-TIME SUBSCRIPTION
  // --------------------------------------------------------------------------
  subscribe(onDataCallback) {
    if (this.isCloudReady && this.docRef) {
      if (this.unsubscribeSnapshot) this.unsubscribeSnapshot();

      this.unsubscribeSnapshot = this.docRef.onSnapshot(
        (doc) => {
          if (doc.exists) {
            const data = doc.data();
            onDataCallback(data);
          } else {
            console.warn('El documento no existe en Firestore. Usa el asistente de migración.');
          }
        },
        (error) => {
          console.error('Error en suscripción Firestore:', error);
        }
      );
    } else {
      // Fallback: Poll local backend periodically
      LiveSync.syncWithBackend();
    }
  },

  // --------------------------------------------------------------------------
  // PUSH FULL DATABASE (Used by Migration Tool)
  // --------------------------------------------------------------------------
  async pushFullState(stateData) {
    if (this.isCloudReady && this.docRef) {
      await this.docRef.set(stateData, { merge: true });
      return { success: true, mode: 'firebase' };
    } else {
      // Fallback to local server
      const res = await fetch('./api/sync');
      return { success: true, mode: 'local' };
    }
  },

  // --------------------------------------------------------------------------
  // CRUD WRITE OPERATIONS (Cloud Firestore / REST API)
  // --------------------------------------------------------------------------
  async saveEvent(eventData) {
    if (this.isCloudReady && this.docRef) {
      await this.docRef.update({ event: eventData });
      return { success: true };
    } else {
      const res = await fetch('./api/event', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });
      return await res.json();
    }
  },

  async addShow(showData) {
    if (this.isCloudReady && this.docRef) {
      const doc = await this.docRef.get();
      const current = doc.exists ? doc.data().schedule || [] : [];
      const newId = showData.id || `ev-${Math.floor(100 + Math.random() * 900)}`;
      const showWithId = { ...showData, id: newId };
      current.push(showWithId);
      await this.docRef.update({ schedule: current });
      return { success: true, created: showWithId };
    } else {
      const res = await fetch('./api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(showData)
      });
      return await res.json();
    }
  },

  async updateShow(showId, updatedFields) {
    if (this.isCloudReady && this.docRef) {
      const doc = await this.docRef.get();
      if (!doc.exists) return { success: false };
      const list = doc.data().schedule || [];
      const idx = list.findIndex(s => s.id === showId);
      if (idx > -1) {
        list[idx] = { ...list[idx], ...updatedFields };
        await this.docRef.update({ schedule: list });
        return { success: true, updated: list[idx] };
      }
      return { success: false, message: 'Show no encontrado' };
    } else {
      const res = await fetch(`./api/schedule/${showId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      return await res.json();
    }
  },

  async deleteShow(showId) {
    if (this.isCloudReady && this.docRef) {
      const doc = await this.docRef.get();
      if (!doc.exists) return { success: false };
      const list = (doc.data().schedule || []).filter(s => s.id !== showId);
      await this.docRef.update({ schedule: list });
      return { success: true };
    } else {
      const res = await fetch(`./api/schedule/${showId}`, { method: 'DELETE' });
      return await res.json();
    }
  },

  async addStand(standData) {
    if (this.isCloudReady && this.docRef) {
      const doc = await this.docRef.get();
      const current = doc.exists ? doc.data().stands || [] : [];
      const newId = standData.id || `st-${Math.floor(10 + Math.random() * 90)}`;
      const standWithId = { ...standData, id: newId, menu: standData.menu || [] };
      current.push(standWithId);
      await this.docRef.update({ stands: current });
      return { success: true, created: standWithId };
    } else {
      const res = await fetch('./api/stands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(standData)
      });
      return await res.json();
    }
  },

  async updateStand(standId, updatedFields) {
    if (this.isCloudReady && this.docRef) {
      const doc = await this.docRef.get();
      if (!doc.exists) return { success: false };
      const list = doc.data().stands || [];
      const idx = list.findIndex(s => s.id === standId);
      if (idx > -1) {
        list[idx] = { ...list[idx], ...updatedFields };
        await this.docRef.update({ stands: list });
        return { success: true, updated: list[idx] };
      }
      return { success: false };
    } else {
      const res = await fetch(`./api/stands/${standId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      return await res.json();
    }
  },

  async deleteStand(standId) {
    if (this.isCloudReady && this.docRef) {
      const doc = await this.docRef.get();
      if (!doc.exists) return { success: false };
      const list = (doc.data().stands || []).filter(s => s.id !== standId);
      await this.docRef.update({ stands: list });
      return { success: true };
    } else {
      const res = await fetch(`./api/stands/${standId}`, { method: 'DELETE' });
      return await res.json();
    }
  },

  async updateDishStock(standId, itemTitle, isSoldOut) {
    if (this.isCloudReady && this.docRef) {
      const doc = await this.docRef.get();
      if (!doc.exists) return { success: false };
      const stands = doc.data().stands || [];
      const stand = stands.find(s => s.id === standId);
      if (stand && stand.menu) {
        const dish = stand.menu.find(d => d.item === itemTitle || d.id === itemTitle);
        if (dish) dish.isSoldOut = Boolean(isSoldOut);
        await this.docRef.update({ stands });
        return { success: true };
      }
      return { success: false };
    } else {
      const res = await fetch(`./api/stands/${standId}/menu`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: itemTitle, isSoldOut })
      });
      return await res.json();
    }
  },

  async registerParticipant(participant) {
    if (this.isCloudReady && this.docRef) {
      const doc = await this.docRef.get();
      const current = doc.exists ? doc.data().participants || [] : [];
      current.push(participant);
      await this.docRef.update({ participants: current });
      return { success: true, ticket: participant };
    } else {
      const res = await fetch('./api/raffle/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(participant)
      });
      return await res.json();
    }
  },

  async addZone(zoneData) {
    if (this.isCloudReady && this.docRef) {
      const doc = await this.docRef.get();
      const current = doc.exists ? doc.data().zones || [] : [];
      const newId = zoneData.id || `zone-${Math.floor(100 + Math.random() * 900)}`;
      const zoneWithId = { ...zoneData, id: newId };
      current.push(zoneWithId);
      await this.docRef.update({ zones: current });
      return { success: true, zone: zoneWithId };
    } else {
      const res = await fetch('./api/zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(zoneData)
      });
      return await res.json();
    }
  },

  async updateZone(zoneId, updatedFields) {
    if (this.isCloudReady && this.docRef) {
      const doc = await this.docRef.get();
      if (!doc.exists) return { success: false };
      const list = doc.data().zones || [];
      const idx = list.findIndex(z => z.id === zoneId);
      if (idx > -1) {
        list[idx] = { ...list[idx], ...updatedFields };
        await this.docRef.update({ zones: list });
        return { success: true, zone: list[idx] };
      }
      return { success: false };
    } else {
      const res = await fetch(`./api/zones/${zoneId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      return await res.json();
    }
  },

  async deleteZone(zoneId) {
    if (this.isCloudReady && this.docRef) {
      const doc = await this.docRef.get();
      if (!doc.exists) return { success: false };
      const list = (doc.data().zones || []).filter(z => z.id !== zoneId);
      await this.docRef.update({ zones: list });
      return { success: true };
    } else {
      const res = await fetch(`./api/zones/${zoneId}`, { method: 'DELETE' });
      return await res.json();
    }
  }
};
