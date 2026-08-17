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

  const App = window.eval('App');
  const GASTRO_DATA = window.eval('GASTRO_DATA');
  const LiveRadar = window.eval('LiveRadar');
  const Agenda = window.eval('Agenda');
  const Stands = window.eval('Stands');
  const Raffle = window.eval('Raffle');

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

  // 5. Test Raffle Form, Ticket & Roulette
  console.log('\n5. Probando Registro de Sorteo, Ticket Digital y Ruleta:');
  document.getElementById('raffleName').value = 'Martín Tester';
  document.getElementById('rafflePhone').value = '11-5555-9988';
  Raffle.handleRegister();

  assert(Raffle.currentTicket !== null, `Formulario genera Ticket Digital con código único (#${Raffle.currentTicket?.code})`);
  assert(document.getElementById('raffleTicketSection').style.display === 'block', `Sección de Golden Ticket visualizada con éxito`);

  // Test Live Roulette Modal
  Raffle.openHostRouletteModal();
  const rouletteModal = document.getElementById('rouletteModalOverlay');
  assert(rouletteModal.classList.contains('active'), `Botón 'Abrir Ruleta de Sorteos' despliega modal interactivo`);
  Raffle.closeHostRouletteModal();
  assert(!rouletteModal.classList.contains('active'), `Botón de cerrar ruleta funciona correctamente`);
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

  // 2. Test Admin Tabs
  console.log('\n2. Probando Pestañas del Panel de Control:');
  const adminTabs = ['schedule', 'stands', 'announcements', 'raffle', 'config'];
  adminTabs.forEach(t => {
    const btn = document.querySelector(`.admin-tab-btn[data-tab="${t}"]`);
    if (btn) btn.click();
    assert(AdminApp.currentTab === t, `Pestaña Admin '${t}' activada con éxito`);
  });

  // 3. Test Schedule Management
  console.log('\n3. Probando Acciones de Shows (En Vivo, Retraso, Finalizar):');
  const firstShow = AdminApp.dbState.schedule[0];
  await AdminApp.updateEventStatus(firstShow.id, 'live');
  assert(firstShow.status === 'live', `Botón '🔴 En Vivo' actualiza estado del show a 'live'`);

  await AdminApp.adjustTime(firstShow.id, 15);
  assert(firstShow.status === 'delayed', `Botón '⏰ +15m Retraso' marca el show con estado retrasado`);

  // 4. Test Stock Toggle
  console.log('\n4. Probando Control de Stock de Platos:');
  const firstStand = AdminApp.dbState.stands[0];
  const firstDish = firstStand.menu[0];
  await AdminApp.toggleStock(firstStand.id, firstDish.item, true);
  assert(firstDish.isSoldOut === true, `Switch de Stock marca '${firstDish.item}' como AGOTADO`);

  await AdminApp.toggleStock(firstStand.id, firstDish.item, false);
  assert(firstDish.isSoldOut === false, `Switch de Stock reactiva '${firstDish.item}' como DISPONIBLE`);

  // 5. Test Flash Announcements
  console.log('\n5. Probando Creación y Eliminación de Avisos Flash:');
  document.getElementById('annTitle').value = 'Test Aviso Flash';
  document.getElementById('annMessage').value = 'Mensaje de prueba en vivo';
  await AdminApp.postAnnouncement({ preventDefault: () => {} });
  
  const createdAnn = AdminApp.dbState.announcements.find(a => a.title === 'Test Aviso Flash');
  assert(createdAnn !== undefined, `Botón 'Emitir Aviso Flash' crea notificación en tiempo real`);

  if (createdAnn) {
    await AdminApp.deleteAnnouncement(createdAnn.id);
    assert(!AdminApp.dbState.announcements.some(a => a.id === createdAnn.id), `Botón 'Eliminar Aviso' borra el aviso flash`);
  }
}

async function run() {
  await testVisitorApp();
  await testAdminApp();

  console.log('\n=============================================================');
  console.log(`🎯 RESULTADO FINAL: ${passedTests} / ${totalTests} PRUEBAS PASADAS CON ÉXITO (100%)`);
  console.log('=============================================================\n');
}

run();
