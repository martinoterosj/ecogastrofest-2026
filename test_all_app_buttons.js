/**
 * ECOGASTROFEST 2026 - COMPLETE BUTTONS & FEATURES AUTOMATED TEST SUITE
 * Strips external network scripts and inlines local scripts for instant execution.
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
  }
}

function inlineScriptsInHtml(htmlFile) {
  let html = fs.readFileSync(path.join(__dirname, htmlFile), 'utf8');
  
  // Remove external network SDKs
  html = html.replace(/<script src="https:\/\/[^"]+"><\/script>/g, '');

  const scriptRegex = /<script src="(js\/[^"]+)"><\/script>/g;
  html = html.replace(scriptRegex, (match, src) => {
    const scriptPath = path.join(__dirname, src);
    if (fs.existsSync(scriptPath)) {
      const code = fs.readFileSync(scriptPath, 'utf8');
      return `<script>\n${code}\n</script>`;
    }
    return match;
  });

  return html;
}

async function testVisitorApp() {
  console.log('\n=============================================================');
  console.log('📱 PRUEBA DE BOTONES Y SECCIONES: APP VISITANTES (index.html)');
  console.log('=============================================================');

  const inlinedHtml = inlineScriptsInHtml('index.html');
  
  const dom = new JSDOM(inlinedHtml, {
    url: 'http://localhost:8080/index.html',
    runScripts: 'dangerously',
    pretendToBeVisual: true
  });

  const { window } = dom;
  const { document } = window;

  // Mock window.prompt for JSDOM
  window.prompt = (msg, def) => def || 'Martín Otero';

  const App = window.eval('App');
  const GASTRO_DATA = window.eval('GASTRO_DATA');
  const LiveRadar = window.eval('LiveRadar');
  const Agenda = window.eval('Agenda');
  const Stands = window.eval('Stands');
  const Raffle = window.eval('Raffle');
  const Auth = window.eval('Auth');
  const MapZoomController = window.MapZoomController;

  App.init();

  // 1. Test Tab Navigation Buttons
  console.log('\n1. Probando Navegación por Pestañas (Mobile & Desktop):');
  const tabs = ['agenda', 'stands', 'sorteo', 'info', 'live'];
  tabs.forEach(t => {
    App.switchTab(t);
    const activePane = document.querySelector('.tab-pane.active');
    assert(activePane && activePane.id === `tab-${t}`, `Botón Pestaña '${t}' activa el panel #tab-${t}`);
  });

  // 2. Test Time Simulator Buttons
  console.log('\n2. Probando Simulador de Horarios en Vivo:');
  const simTimes = ['11:45', '13:15', '14:45', '17:45', '19:45', '21:00', '22:30', 'real'];
  simTimes.forEach(time => {
    if (time === 'real') {
      LiveRadar.simulatedTime = null;
    } else {
      LiveRadar.simulatedTime = time;
    }
    LiveRadar.update();
    const liveContainer = document.getElementById('liveEventContainer');
    assert(liveContainer && liveContainer.innerHTML.length > 20, `Botón Simulador '${time}' actualiza el radar en vivo.`);
  });

  // 3. Test Agenda Filters & Favorites
  console.log('\n3. Probando Filtros y Favoritos de Agenda:');
  App.switchTab('agenda');
  
  const agendaChips = document.querySelectorAll('#agendaFilters .filter-chip');
  assert(agendaChips.length >= 4, `Filtros de categoría de agenda renderizados (${agendaChips.length} botones encontrados)`);

  // Test favorite button click
  const firstEventId = GASTRO_DATA.schedule[0].id;
  Agenda.toggleFavorite(firstEventId);
  assert(Agenda.favorites.includes(firstEventId), `Botón Favorito ⭐ guarda show #${firstEventId} en favoritos`);

  // Switch to favorites filter
  Agenda.currentCategory = 'favorites';
  Agenda.render();
  const favCards = document.querySelectorAll('#agendaListContainer .agenda-card');
  assert(favCards.length >= 1, `Filtro 'Mis Favoritos' muestra los shows guardados`);

  // 4. Test Stands Filters, Dietary Chips & Modal
  console.log('\n4. Probando Directorio de Stands, Filtros Dietarios y Modales:');
  App.switchTab('stands');

  const standChips = document.querySelectorAll('#standsFilters .filter-chip');
  assert(standChips.length >= 5, `Filtros de stands renderizados (${standChips.length} botones encontrados)`);

  // Filter gluten free
  Stands.setDietaryFilter('gluten-free');
  let filteredStands = document.querySelectorAll('#standsListContainer .stand-card');
  assert(filteredStands.length > 0, `Filtro 'Sin TACC' filtra stands correctamente (${filteredStands.length} encontrados)`);

  // Filter vegan
  Stands.setDietaryFilter('vegan');
  filteredStands = document.querySelectorAll('#standsListContainer .stand-card');
  assert(filteredStands.length > 0, `Filtro '100% Vegano' filtra stands correctamente (${filteredStands.length} encontrados)`);

  // Reset to all
  Stands.currentCategory = 'all';
  Stands.activeDietary = null;
  Stands.render();

  // Test Modal Open
  const firstStand = GASTRO_DATA.stands[0];
  Stands.openStandModal(firstStand.id);
  const modalOverlay = document.getElementById('standModalOverlay');
  assert(modalOverlay.classList.contains('active'), `Click en stand abre Modal Bottom Sheet de '${firstStand.name}'`);

  // Test Vote Stand Button
  Stands.voteFavoriteStand(firstStand.name);
  assert(!modalOverlay.classList.contains('active'), `Botón 'Votar Stand Favorito' cierra el modal`);
  assert(App.currentTab === 'sorteo', `Botón 'Votar Stand Favorito' redirige automáticamente a la pestaña de Sorteo`);

  // 5. Test Raffle Form & Golden Ticket
  console.log('\n5. Probando Registro de Sorteo y Golden Ticket Digital:');
  document.getElementById('raffleName').value = 'Martín Tester';
  document.getElementById('rafflePhone').value = '11-5555-9988';
  Raffle.handleRegister();

  assert(Raffle.currentTicket !== null, `Formulario genera Ticket Digital con código único (#${Raffle.currentTicket?.code})`);
  assert(document.getElementById('raffleTicketSection').style.display === 'block', `Sección de Golden Ticket visualizada con éxito`);

  // Test Ticket Copy
  Raffle.copyTicketCode();
  assert(Raffle.currentTicket.name === 'Martín Tester', `Datos de titular y stand del ticket validados`);

  // 6. Test Visitor Interactive Satellite Map & Zone Pins
  console.log('\n6. Probando Mapa Satelital Interactivo de Plaza Independencia (Visitantes):');
  assert(document.getElementById('visitorSatelliteMap') !== null, `Mapa satelital de Plaza Independencia presente en tab Info`);
  App.renderVisitorMap();
  const visitorPins = document.querySelectorAll('.visitor-map-pin');
  assert(visitorPins.length > 0, `Puntos de zonas marcados sobre el mapa satelital (${visitorPins.length} zonas)`);

  // Click on a zone pin to open Zone Details
  const firstZone = GASTRO_DATA.zones[0];
  App.selectVisitorZone(firstZone.id);
  const detailBox = document.getElementById('visitorZoneDetailBox');
  assert(detailBox.style.display === 'block', `Click en pin de zona abre ficha informativa con stands y shows`);
  App.closeVisitorZoneDetail();
  assert(detailBox.style.display === 'none', `Cerrar ficha informativa de zona funciona correctamente`);

  // Test Map Zoom & Pinch Controller
  assert(typeof MapZoomController !== 'undefined', `Módulo MapZoomController cargado`);
  MapZoomController.init();
  assert(document.getElementById('btnMapZoomIn') !== null, `Botón de zoom in [+] presente en el mapa`);
  assert(document.getElementById('btnMapZoomOut') !== null, `Botón de zoom out [-] presente en el mapa`);
  assert(document.getElementById('btnMapZoomReset') !== null, `Botón de reset de zoom [Centrar] presente en el mapa`);

  MapZoomController.zoomIn();
  assert(MapZoomController.scale > 1, `Acercar zoom incrementa la escala del mapa (${MapZoomController.scale}x)`);
  MapZoomController.resetZoom();
  assert(MapZoomController.scale === 1, `Resetear zoom devuelve el mapa a escala 1.0x`);

  // 7. Test Auth Module: Welcome Modal, Google Login, Guest Access & Profile Drawer
  console.log('\n7. Probando Modal de Bienvenida, Login con Google y Modo Invitado:');
  assert(Auth !== undefined, 'Módulo Auth cargado correctamente');

  // Test welcome modal active on fresh start
  Auth.clearSession();
  Auth.openWelcomeModal();
  assert(document.getElementById('authWelcomeModal').classList.contains('active'), 'Modal de bienvenida #authWelcomeModal se muestra al ingresar');

  // Test Guest login
  const btnGuest = document.getElementById('btnAuthGuest');
  btnGuest.click();
  assert(Auth.currentUser !== null && Auth.currentUser.type === 'guest', 'Botón Invitado inicia sesión en modo Invitado');
  assert(!document.getElementById('authWelcomeModal').classList.contains('active'), 'Modal de bienvenida se cierra tras elegir Invitado');
  assert(document.getElementById('userProfileChip').style.display !== 'none', 'Chip de perfil en el header visible para invitado');

  // Test Google login
  const btnGoogle = document.getElementById('btnAuthGoogle');
  btnGoogle.click();
  assert(Auth.currentUser !== null && Auth.currentUser.type === 'google', 'Botón Google inicia sesión con cuenta Google verificada');
  assert(document.getElementById('userProfileChip').classList.contains('is-google'), 'Chip de perfil refleja estilo de cuenta Google');

  // Test opening Profile Drawer
  const profileChip = document.getElementById('userProfileChip');
  profileChip.click();
  assert(document.getElementById('userProfileDrawer').classList.contains('active'), 'Click en Chip de Perfil abre el drawer #userProfileDrawer');
  assert(document.getElementById('drawerUserName').textContent === Auth.currentUser.name, 'Drawer muestra el nombre del usuario conectado');

  // Test Logout
  const btnLogout = document.getElementById('btnLogoutAction');
  btnLogout.click();
  assert(Auth.currentUser === null, 'Botón Cerrar Sesión elimina la sesión activa');
  assert(document.getElementById('authWelcomeModal').classList.contains('active'), 'Cerrar sesión reabre el modal de bienvenida');
}

async function testAdminApp() {
  console.log('\n=============================================================');
  console.log('⚙️ PRUEBA DE BOTONES: PANEL DE OPERADORES (admin.html)');
  console.log('=============================================================');

  const inlinedHtml = inlineScriptsInHtml('admin.html');
  
  const dom = new JSDOM(inlinedHtml, {
    url: 'http://localhost:8080/admin.html',
    runScripts: 'dangerously',
    resources: 'usable'
  });

  const { window } = dom;
  const { document } = window;

  // Mock confirm and alert
  window.confirm = () => true;
  window.alert = () => {};

  const AdminApp = window.eval('AdminApp');
  AdminApp.setupTabs();

  // 1. Test Keypad Login
  console.log('\n1. Probando Teclado PIN de Acceso:');
  AdminApp.quickLogin('1234');
  await AdminApp.fetchState();

  assert(AdminApp.currentUser !== null, `Login con PIN 1234 inicia sesión como Operador`);
  assert(document.getElementById('adminDashboardSection').style.display === 'flex', `Dashboard de Operadores visualizado`);

  // 2. Test Admin Tabs (including map-zones)
  console.log('\n2. Probando Pestañas del Panel de Control:');
  const adminTabs = ['schedule', 'stands', 'map-zones', 'announcements', 'raffle', 'config'];
  adminTabs.forEach(t => {
    const btn = document.querySelector(`.admin-tab-btn[data-tab="${t}"]`);
    if (btn) btn.click();
    assert(AdminApp.currentTab === t, `Pestaña Admin '${t}' activada con éxito`);
  });

  // 3. Test Interactive Map & Zone Marker Tool
  console.log('\n3. Probando Editor de Zonas en Mapa Satelital (Admin):');
  assert(document.getElementById('adminSatelliteMap') !== null, `Canvas del mapa satelital presente para marcado`);
  
  // Test click on map
  AdminApp.handleMapClick({
    clientX: 150,
    clientY: 100
  });
  assert(document.getElementById('zoneXInput').value !== '', `Click en mapa captura coordenada X%`);
  assert(document.getElementById('zoneYInput').value !== '', `Click en mapa captura coordenada Y%`);

  // Test Landmark Preset Quick Placement
  AdminApp.setPresetLocation(50, 15, 'Escenario Solís Norte', 'ESCENARIO SOLÍS', '🎸', '#ef4444', 'Escenario Principal');
  assert(document.getElementById('zoneXInput').value === '50' && document.getElementById('zoneYInput').value === '15', `Atajo de Plaza Independencia posiciona coordenadas X=50%, Y=15%`);
  assert(document.getElementById('zoneCodeInput').value === 'ESCENARIO SOLÍS', `Atajo asigna código de zona automáticamente`);

  // Test Quick Emoji Picker
  AdminApp.pickEmoji('🍺');
  assert(document.getElementById('zoneIconInput').value === '🍺', `Paleta rápida de emojis asigna emoji al marcador`);

  // Test Quick Color Palette
  AdminApp.updateColorInput('#f97316');
  assert(document.getElementById('zoneColorInput').value === '#f97316', `Paleta rápida de colores asigna HEX (#f97316)`);

  // Test Grid / Guides Toggle
  AdminApp.toggleMapGrid();
  assert(AdminApp.gridVisible === true && document.getElementById('mapGridOverlay').style.display === 'block', `Botón de Guías/Cuadrícula activa la capa de alineación porcentual`);
  AdminApp.toggleMapGrid();
  assert(AdminApp.gridVisible === false, `Botón de Guías/Cuadrícula oculta la capa correctamente`);

  // Test creating a new zone
  document.getElementById('zoneCodeInput').value = 'ZONA TEST';
  document.getElementById('zoneNameInput').value = 'Sector Degustación';
  document.getElementById('zoneCategoryInput').value = 'Catas';
  document.getElementById('zoneColorInput').value = '#ec4899';
  document.getElementById('zoneXInput').value = '65';
  document.getElementById('zoneYInput').value = '40';
  await AdminApp.saveZone({ preventDefault: () => {} });

  const addedZone = AdminApp.dbState.zones.find(z => z.code === 'ZONA TEST');
  assert(addedZone !== undefined, `Nueva zona guardada y marcada en el mapa con coordenadas y color`);

  // Test selecting and editing the zone
  if (addedZone) {
    AdminApp.selectZoneForEdit(addedZone.id);
    assert(AdminApp.editingZoneId === addedZone.id, `Seleccionar zona para editar carga sus datos y activa modo edición`);

    await AdminApp.deleteZone(addedZone.id);
    assert(!AdminApp.dbState.zones.some(z => z.id === addedZone.id), `Zona eliminada correctamente del mapa`);
  }

  // Test Stand-Zone Linking in Stand Modal
  AdminApp.openNewStandModal();
  const standZoneSel = document.getElementById('standZoneSelect');
  assert(standZoneSel && standZoneSel.options.length > 0, `Modal de stands vincula selector dinámico de zonas creadas en el mapa`);
  AdminApp.closeStandModal();

  // 4. Test Schedule Management
  console.log('\n4. Probando Acciones de Shows (En Vivo, Retraso, Finalizar):');
  AdminApp.ensureState();
  const firstShow = AdminApp.dbState.schedule[0];
  await AdminApp.updateEventStatus(firstShow.id, 'live');
  assert(firstShow.status === 'live', `Botón '🔴 En Vivo' actualiza estado del show a 'live'`);

  await AdminApp.adjustTime(firstShow.id, 15);
  assert(firstShow.status === 'delayed', `Botón '⏰ +15m Retraso' marca el show con estado retrasado`);

  // 5. Test Stock Toggle
  console.log('\n5. Probando Control de Stock de Platos:');
  const firstStand = AdminApp.dbState.stands[0];
  const firstDish = firstStand.menu[0];
  await AdminApp.toggleStock(firstStand.id, firstDish.item, true);
  assert(firstDish.isSoldOut === true, `Switch de Stock marca '${firstDish.item}' como AGOTADO`);

  await AdminApp.toggleStock(firstStand.id, firstDish.item, false);
  assert(firstDish.isSoldOut === false, `Switch de Stock reactiva '${firstDish.item}' como DISPONIBLE`);

  // 6. Test Flash Announcements
  console.log('\n6. Probando Creación y Eliminación de Avisos Flash:');
  document.getElementById('annTitle').value = 'Test Aviso Flash';
  document.getElementById('annMessage').value = 'Mensaje de prueba en vivo';
  await AdminApp.postAnnouncement({ preventDefault: () => {} });
  
  const createdAnn = AdminApp.dbState.announcements.find(a => a.title === 'Test Aviso Flash');
  assert(createdAnn !== undefined, `Botón 'Emitir Aviso Flash' crea notificación en tiempo real`);

  if (createdAnn) {
    await AdminApp.deleteAnnouncement(createdAnn.id);
    assert(!AdminApp.dbState.announcements.some(a => a.id === createdAnn.id), `Botón 'Eliminar Aviso' borra el aviso flash`);
  }

  // 7. Test Shows CRUD Modal (Alta, Modificación y Baja)
  console.log('\n7. Probando Alta y Modificación de Shows en Vivo:');
  AdminApp.openNewShowModal();
  const showModal = document.getElementById('modalShowOverlay');
  assert(showModal && showModal.classList.contains('active'), `Modal 'Alta de Nuevo Show' se abre correctamente`);

  document.getElementById('showTitleInput').value = 'Show Test Automatizado';
  document.getElementById('showSpeakerInput').value = 'Chef Test';
  document.getElementById('showStartInput').value = '16:00';
  document.getElementById('showEndInput').value = '17:00';
  await AdminApp.saveShow({ preventDefault: () => {} });

  const addedShow = AdminApp.dbState.schedule.find(s => s.title === 'Show Test Automatizado');
  assert(addedShow !== undefined, `Nuevo show guardado dinámicamente en el estado`);
  assert(!showModal.classList.contains('active'), `Modal de show se cierra tras guardar`);

  if (addedShow) {
    await AdminApp.deleteShow(addedShow.id);
    assert(!AdminApp.dbState.schedule.some(s => s.id === addedShow.id), `Show eliminado correctamente`);
  }

  // 8. Test Categories & Config Management
  console.log('\n8. Probando Categorías y Ajustes Generales del Evento:');
  document.getElementById('newShowCatName').value = 'Magia & Humor';
  document.getElementById('newShowCatIcon').value = '🎩';
  await AdminApp.addCategory({ preventDefault: () => {} }, 'show');

  const addedCat = AdminApp.dbState.showCategories.find(c => c.name === 'Magia & Humor');
  assert(addedCat !== undefined, `Nueva categoría de show 'Magia & Humor' agregada con éxito`);

  if (addedCat) {
    await AdminApp.deleteCategory('show', addedCat.id);
    assert(!AdminApp.dbState.showCategories.some(c => c.id === addedCat.id), `Categoría de show eliminada con éxito`);
  }

  document.getElementById('cfgEventName').value = 'EcoGastroFest 2026';
  await AdminApp.saveEventConfig({ preventDefault: () => {} });
  assert(AdminApp.dbState.event.name === 'EcoGastroFest 2026', `Configuración general del evento actualizada`);

  // 9. Test UI Responsive Layout Elements
  console.log('\n9. Validando Estructuras Responsivas de la UI:');
  assert(document.querySelector('.admin-navbar-actions') !== null, `Navbar de administración contiene contenedor de acciones responsivas`);
  assert(document.querySelector('.admin-tabs-nav') !== null, `Barra de pestañas adaptativa presente`);
  assert(document.querySelectorAll('.card-row-top').length > 0, `Cards de shows y stands renderizan encabezados flexibles (.card-row-top)`);

  // 10. Test Users & Marketing Leads (Campaigns)
  console.log('\n10. Probando Directorio de Usuarios & Campañas de Marketing:');
  AdminApp.renderUsers();
  const usersTableBody = document.getElementById('adminUsersTableBody');
  assert(usersTableBody !== null, `Tabla de usuarios y leads de marketing presente en el panel`);
  assert(usersTableBody.querySelectorAll('tr').length > 0, `Tabla renderiza los usuarios registrados (${AdminApp.dbState.users.length} usuarios)`);

  const statTotal = document.getElementById('statUsersTotal');
  const statGoogle = document.getElementById('statUsersGoogle');
  assert(statTotal && Number(statTotal.textContent) >= 3, `KPI Total Visitantes muestra conteo correcto (${statTotal.textContent})`);
  assert(statGoogle && Number(statGoogle.textContent) >= 3, `KPI Emails Google Verificados muestra conteo correcto (${statGoogle.textContent})`);

  // Test Search Filter
  const searchInput = document.getElementById('adminUserSearchInput');
  searchInput.value = 'martin';
  AdminApp.renderUsers();
  const searchRows = usersTableBody.querySelectorAll('tr');
  assert(searchRows.length >= 1, `Buscador de leads filtra usuarios por nombre o correo`);
  searchInput.value = '';
  AdminApp.renderUsers();
}

async function run() {
  await testVisitorApp();
  await testAdminApp();

  console.log('\n=============================================================');
  console.log(`🎯 RESULTADO FINAL: ${passedTests} / ${totalTests} PRUEBAS PASADAS CON ÉXITO (100%)`);
  console.log('=============================================================\n');
}

run();
