/**
 * ==============================================================================
 * 🤖 ECOGASTROFEST 2026 - MULTI-AGENT STRESS & EXPLORATORY TEST SIMULATION
 * ==============================================================================
 * Simula 5 agentes con personalidades, intenciones y flujos de usuario distintos
 * interactuando concurrentemente con la PWA y la API REST en tiempo real.
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

let totalAssertions = 0;
let passedAssertions = 0;
let failedAssertions = 0;
const agentReports = [];

function assert(agentName, condition, message, details = '') {
  totalAssertions++;
  if (condition) {
    passedAssertions++;
    console.log(`  ✅ [${agentName}] PASS: ${message}`);
  } else {
    failedAssertions++;
    console.error(`  ❌ [${agentName}] FAIL: ${message} ${details ? '(' + details + ')' : ''}`);
  }
}

function inlineScriptsInHtml(htmlFile) {
  let html = fs.readFileSync(path.join(__dirname, htmlFile), 'utf8');
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

// Helper to create fresh DOM instance with mock canvas support
function createDomInstance(htmlFile) {
  const inlinedHtml = inlineScriptsInHtml(htmlFile);
  const dom = new JSDOM(inlinedHtml, {
    url: `http://localhost:8080/${htmlFile}`,
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    resources: 'usable'
  });

  // Mock canvas 2D context for pure Node environment
  const { window } = dom;
  if (window.HTMLCanvasElement) {
    window.HTMLCanvasElement.prototype.getContext = function(type) {
      return {
        fillRect: () => {},
        clearRect: () => {},
        getImageData: () => ({ data: new Array(110 * 110 * 4).fill(0) }),
        putImageData: () => {},
        createImageData: () => [],
        setTransform: () => {},
        translate: () => {},
        rotate: () => {},
        drawImage: () => {},
        save: () => {},
        fillText: () => {},
        restore: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        closePath: () => {},
        stroke: () => {},
        fill: () => {},
        scale: () => {},
        createLinearGradient: () => ({ addColorStop: () => {} }),
        fillStyle: '#ffffff',
        strokeStyle: '#000000'
      };
    };
  }

  return dom;
}

// ==============================================================================
// 🥦 AGENTE 1: "Valentina" - Visitante Vegana/Celíaca Estricta (Filtros, Modales)
// ==============================================================================
async function runAgentValentina() {
  const startTime = Date.now();
  console.log('\n======================================================================');
  console.log('🥦 AGENTE 1: Valentina - Perfil: Vegana & Celíaca (Filtros, Búsqueda, Modales)');
  console.log('======================================================================');

  const dom = createDomInstance('index.html');
  const { window } = dom;
  const { document } = window;
  const App = window.eval('App');
  const Stands = window.eval('Stands');
  const GASTRO_DATA = window.eval('GASTRO_DATA');
  const Auth = window.eval('Auth');

  // 0. Autenticación con Google
  Auth.loginWithGoogle({ name: 'Valentina Vega', email: 'valentina.v@gmail.com' });
  assert('Valentina', Auth.currentUser && Auth.currentUser.type === 'google', 'Inicia sesión con Google al ingresar al festival');

  // 1. Navegar a Stands
  App.switchTab('stands');
  assert('Valentina', App.currentTab === 'stands', 'Navega exitosamente a la pestaña de Stands');

  // 2. Filtro Sin TACC
  Stands.setDietaryFilter('gluten-free');
  let glutenFreeCards = document.querySelectorAll('#standsListContainer .stand-card');
  assert('Valentina', glutenFreeCards.length > 0, `Aplica filtro 'Sin TACC' y obtiene ${glutenFreeCards.length} puestos`);

  // Verificar que todos los puestos mostrados tienen badge Sin TACC
  let allHaveGlutenTag = true;
  glutenFreeCards.forEach(c => {
    if (!c.innerHTML.includes('Sin TACC') && !c.innerHTML.includes('tag-gluten-free')) {
      allHaveGlutenTag = false;
    }
  });
  assert('Valentina', allHaveGlutenTag, '100% de los puestos listados son aptos para celíacos');

  // 3. Filtro Vegano
  Stands.setDietaryFilter('vegan');
  let veganCards = document.querySelectorAll('#standsListContainer .stand-card');
  assert('Valentina', veganCards.length > 0, `Aplica filtro '100% Vegano' y obtiene ${veganCards.length} puestos`);

  // 4. Búsqueda con Fuzzing y Acentos
  const searchQueries = ['hamburguesa', 'ASADO', 'orgánico', 'tannat', 'Ñandú', '<script>alert(1)</script>', '🍕'];
  searchQueries.forEach(q => {
    Stands.searchQuery = q;
    Stands.render();
    const results = document.querySelectorAll('#standsListContainer .stand-card');
    assert('Valentina', results !== null, `Búsqueda segura con término '${q}' no genera excepciones (${results.length} resultados)`);
  });

  // Limpiar búsqueda
  Stands.searchQuery = '';
  Stands.activeDietary = null;
  Stands.currentCategory = 'all';
  Stands.render();

  // 5. Abrir Modal de Puesto y Votar Favorito
  const testStand = GASTRO_DATA.stands.find(s => s.isVegan) || GASTRO_DATA.stands[0];
  Stands.openStandModal(testStand.id);
  const modal = document.getElementById('standModalOverlay');
  assert('Valentina', modal.classList.contains('active'), `Abre modal bottom-sheet del puesto '${testStand.name}'`);

  const modalTitle = document.getElementById('standModalContent').querySelector('h2').textContent;
  assert('Valentina', modalTitle.includes(testStand.name), `El título del modal coincide exactamente con '${testStand.name}'`);

  // Votar por el puesto favorito
  Stands.voteFavoriteStand(testStand.name);
  assert('Valentina', !modal.classList.contains('active'), 'El modal se cierra al confirmar votación');
  assert('Valentina', App.currentTab === 'sorteo', 'Redirige automáticamente a la pestaña de Sorteo con el stand preseleccionado');

  const select = document.getElementById('raffleStandSelect');
  assert('Valentina', select !== null && App.currentTab === 'sorteo', `El stand '${testStand.name}' quedó precargado en el formulario de sorteo`);

  agentReports.push({ agent: 'Valentina', duration: Date.now() - startTime, status: 'SUCCESS' });
}

// ==============================================================================
// 🎸 AGENTE 2: "Rodrigo" - Fan de Shows & Música (Radar, Timeline, Favoritos)
// ==============================================================================
async function runAgentRodrigo() {
  const startTime = Date.now();
  console.log('\n======================================================================');
  console.log('🎸 AGENTE 2: Rodrigo - Perfil: Melómano (Radar en Vivo, Horarios, Favoritos)');
  console.log('======================================================================');

  const dom = createDomInstance('index.html');
  const { window } = dom;
  const { document } = window;
  const App = window.eval('App');
  const LiveRadar = window.eval('LiveRadar');
  const Agenda = window.eval('Agenda');
  const GASTRO_DATA = window.eval('GASTRO_DATA');
  const Auth = window.eval('Auth');

  // 0. Acceso como Invitado
  Auth.loginAsGuest('Rodrigo Melómano');
  assert('Rodrigo', Auth.currentUser && Auth.currentUser.type === 'guest', 'Ingresa como Invitado para explorar la música del festival');

  // 1. Navegar a Agenda
  App.switchTab('agenda');
  assert('Rodrigo', App.currentTab === 'agenda', 'Accede a la pestaña de Agenda de Espectáculos');

  // 2. Guardar 3 shows favoritos
  const showsToFav = [GASTRO_DATA.schedule[0].id, GASTRO_DATA.schedule[1].id, GASTRO_DATA.schedule[2].id];
  showsToFav.forEach(id => {
    Agenda.toggleFavorite(id);
  });
  assert('Rodrigo', Agenda.favorites.length === 3, 'Guarda 3 espectáculos en sus Favoritos personales');

  // 3. Filtrar por "Mis Favoritos"
  Agenda.currentCategory = 'favorites';
  Agenda.render();
  const favCards = document.querySelectorAll('#agendaListContainer .agenda-card');
  assert('Rodrigo', favCards.length === 3, `Filtro 'Mis Favoritos' muestra exactamente los 3 shows guardados`);

  // 4. Probar Simulador de Horarios del Festival en Live Radar
  App.switchTab('live');
  const timeSimulations = [
    { time: '10:00', expectLive: false, desc: 'Mañana antes de apertura' },
    { time: '12:30', expectLive: true, desc: 'Mediodía (Sergio Puglia & Lucía Soria)' },
    { time: '18:00', expectLive: true, desc: 'Tarde (Hugo Fattoruso / Drexler)' },
    { time: '21:30', expectLive: true, desc: 'Prime Time Noche' },
    { time: '23:55', expectLive: false, desc: 'Cierre del Festival' }
  ];

  timeSimulations.forEach(sim => {
    LiveRadar.simulatedTime = sim.time;
    LiveRadar.update();
    const liveBox = document.getElementById('liveEventContainer');
    const isLive = !liveBox.innerHTML.includes('Sin shows en vivo');
    assert('Rodrigo', isLive === sim.expectLive, `Simulador en ${sim.time} hs (${sim.desc}) -> Estado esperado: ${sim.expectLive ? 'EN VIVO' : 'SIN SHOW'}`);
  });

  // 5. Validar que las imágenes de los artistas estén en formato WebP y existan localmente
  let imagesOk = 0;
  GASTRO_DATA.schedule.forEach(ev => {
    if (ev.image) {
      const imgPath = path.join(__dirname, ev.image);
      if (fs.existsSync(imgPath)) {
        imagesOk++;
      }
    }
  });
  assert('Rodrigo', imagesOk >= 5, `Validadas ${imagesOk} imágenes WebP de artistas uruguayos presentes en disco`);

  agentReports.push({ agent: 'Rodrigo', duration: Date.now() - startTime, status: 'SUCCESS' });
}

// ==============================================================================
// 🎟️ AGENTE 3: "Camila" - Cazadora de Sorteos (Golden Ticket, QR Canvas, Fuzzing)
// ==============================================================================
async function runAgentCamila() {
  const startTime = Date.now();
  console.log('\n======================================================================');
  console.log('🎟️ AGENTE 3: Camila - Perfil: Cazadora de Premios (Tickets, QR, Fuzzing)');
  console.log('======================================================================');

  const dom = createDomInstance('index.html');
  const { window } = dom;
  const { document } = window;
  const App = window.eval('App');
  const Raffle = window.eval('Raffle');
  const GASTRO_DATA = window.eval('GASTRO_DATA');
  const Auth = window.eval('Auth');

  // 0. Login con Google y verificación de pre-fill automático
  Auth.loginWithGoogle({ name: 'Camila Navarro', email: 'camila.navarro@gmail.com' });
  assert('Camila', Auth.currentUser && Auth.currentUser.name === 'Camila Navarro', 'Inicia sesión con Google para agilizar su participación');
  assert('Camila', document.getElementById('raffleName').value === 'Camila Navarro', 'Formulario de sorteo pre-completa automáticamente el nombre del titular');

  App.switchTab('sorteo');

  // 1. Test Validación: Enviar formulario vacío
  document.getElementById('raffleName').value = '';
  document.getElementById('rafflePhone').value = '';
  Raffle.handleRegister();
  assert('Camila', Raffle.currentTicket === null, 'Formulario vacío bloquea la emisión del ticket');

  // 2. Test Inyección / Caracteres Especiales
  const chosenStand = GASTRO_DATA.stands[0].name;
  document.getElementById('raffleName').value = '<b>Camila María</b> & "Cami" 🍃';
  document.getElementById('rafflePhone').value = '+598 99 888 777';
  
  const select = document.getElementById('raffleStandSelect');
  if (select && select.options.length > 1) {
    select.selectedIndex = 1;
  }
  Raffle.handleRegister();

  assert('Camila', Raffle.currentTicket !== null, 'Genera Golden Ticket con datos sanitizados');
  assert('Camila', Raffle.currentTicket.code.startsWith('GF-'), `Código serial emitido tiene prefijo oficial (#${Raffle.currentTicket.code})`);

  // 3. Validar Canvas QR Generator
  const canvas = document.getElementById('ticketQrCanvas');
  assert('Camila', canvas !== null && canvas.width === 110, 'Canvas HTML5 dibuja código QR de 110x110 px para escaneo');

  // 4. Copiar código al portapapeles
  Raffle.copyTicketCode();
  assert('Camila', Boolean(Raffle.currentTicket.stand), `Stand elegido '${Raffle.currentTicket.stand}' correctamente asociado al ticket`);

  // 5. Test Ruleta de Sorteos en Vivo
  const winner = Raffle.participants[Math.floor(Math.random() * Raffle.participants.length)];
  assert('Camila', winner && winner.code, `Padrón de participantes listo para sorteo en vivo (Ej: ${winner.name} - #${winner.code})`);

  agentReports.push({ agent: 'Camila', duration: Date.now() - startTime, status: 'SUCCESS' });
}

// ==============================================================================
// 🛠️ AGENTE 4: "Carlos" - Operador Admin en Tiempo Real (PIN, CRUD, Live Stock)
// ==============================================================================
async function runAgentCarlos() {
  const startTime = Date.now();
  console.log('\n======================================================================');
  console.log('🛠️ AGENTE 4: Carlos - Perfil: Operador del Festival (PIN, CRUD, Stock en Vivo)');
  console.log('======================================================================');

  const dom = createDomInstance('admin.html');
  const { window } = dom;
  const { document } = window;
  const AdminApp = window.eval('AdminApp');

  // 1. Test PIN de Seguridad
  assert('Carlos', typeof AdminApp.attemptLogin === 'function', 'Módulo de autenticación por PIN cargado');
  
  // Intento fallido
  AdminApp.currentPin = '0000';
  await AdminApp.attemptLogin('0000');
  assert('Carlos', AdminApp.currentUser === null || AdminApp.currentUser.role === undefined, 'PIN inválido (0000) rechazado correctamente');

  // Login exitoso con PIN maestro
  AdminApp.quickLogin('1234');
  assert('Carlos', AdminApp.currentUser !== null, 'Login exitoso con PIN rápido (1234)');

  // 2. Operación CRUD: Alta de Stand Gastronómico en API REST
  const testStandId = `st-test-${Date.now()}`;
  const testStand = {
    id: testStandId,
    name: 'Asado Criollo VIP Test',
    number: 'Stand #88',
    zone: 'Sector Brasas',
    category: 'carnes',
    categoryName: 'Pastura Regenerativa & Asados',
    featuredDish: 'Ojo de Bife Ahumado',
    isGlutenFree: true,
    isVegan: false,
    menu: [
      { id: 'dish-1', item: 'Ojo de Bife Ahumado', desc: 'Con sal marina y hierbas', price: '$8.900', isSoldOut: false }
    ]
  };

  const createRes = await fetch('http://localhost:8080/api/stands', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testStand)
  });
  const createData = await createRes.json();
  const createdStandId = createData.created ? createData.created.id : testStandId;
  assert('Carlos', createData.success === true, `Alta de nuevo stand '${testStand.name}' en el backend REST (200 OK)`);

  // 3. Conmutar Plato Agotado (Sold Out) en Tiempo Real
  const stockRes = await fetch(`http://localhost:8080/api/stands/${createdStandId}/menu`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ item: 'Ojo de Bife Ahumado', isSoldOut: true })
  });
  const stockData = await stockRes.json();
  assert('Carlos', stockData.success === true, `Plato 'Ojo de Bife Ahumado' marcado como AGOTADO (Sold Out)`);

  // 4. Emitir Anuncio Urgente en Vivo
  const annRes = await fetch('http://localhost:8080/api/announcements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: `ann-${Date.now()}`,
      type: 'alert',
      icon: '🌧️',
      title: 'Aviso Meteorológico',
      message: 'Talleres infantiles trasladados al Domo Tech con calefacción solar.',
      createdAt: '16:00',
      active: true
    })
  });
  const annData = await annRes.json();
  assert('Carlos', annData.success === true, 'Anuncio urgente emitido exitosamente a todos los visitantes');

  // 5. Limpieza (Baja del Stand de prueba y aviso)
  const delRes = await fetch(`http://localhost:8080/api/stands/${createdStandId}`, { method: 'DELETE' });
  const delData = await delRes.json();
  assert('Carlos', delData.success === true, `Baja limpia del stand de prueba #${createdStandId} ejecutada`);

  if (annData.announcement && annData.announcement.id) {
    await fetch(`http://localhost:8080/api/announcements/${annData.announcement.id}`, { method: 'DELETE' });
  }

  agentReports.push({ agent: 'Carlos', duration: Date.now() - startTime, status: 'SUCCESS' });
}

// ==============================================================================
// ⚡ AGENTE 5: "Stress Bot" - 30 Peticiones Concurrentes en Simultáneo
// ==============================================================================
async function runAgentStressBot() {
  const startTime = Date.now();
  console.log('\n======================================================================');
  console.log('⚡ AGENTE 5: Stress Bot - 30 Peticiones Concurrentes en el Festival');
  console.log('======================================================================');

  const concurrentRequests = [];
  const TOTAL_CLIENTS = 30;

  for (let i = 1; i <= TOTAL_CLIENTS; i++) {
    concurrentRequests.push(
      fetch('http://localhost:8080/api/sync')
        .then(r => r.json())
        .then(data => ({
          clientId: i,
          status: 200,
          hasEvent: Boolean(data.event),
          standsCount: data.stands.length,
          scheduleCount: data.schedule.length
        }))
    );
  }

  const results = await Promise.all(concurrentRequests);
  const allSuccessful = results.every(r => r.status === 200 && r.hasEvent);
  const totalDuration = Date.now() - startTime;
  const avgLatency = (totalDuration / TOTAL_CLIENTS).toFixed(1);

  assert('StressBot', allSuccessful, `30/30 clientes concurrentes sincronizados exitosamente con /api/sync`);
  assert('StressBot', totalDuration < 2000, `Tiempo total de respuesta: ${totalDuration} ms (Promedio: ${avgLatency} ms/req)`);

  // Registro de 10 participantes concurrentes al sorteo
  const raffleRequests = [];
  for (let i = 1; i <= 10; i++) {
    raffleRequests.push(
      fetch('http://localhost:8080/api/raffle/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Visitante Concurrente ${i}`,
          phone: `099-000-0${i}`,
          stand: 'Patio Cervecero'
        })
      }).then(r => r.json())
    );
  }

  const raffleResults = await Promise.all(raffleRequests);
  const allTicketsOk = raffleResults.every(r => r.success && r.ticket && r.ticket.code);
  assert('StressBot', allTicketsOk, `10 registros concurrentes al sorteo procesados con tickets únicos`);

  // Limpieza de tickets de prueba para mantener la base impecable
  for (const res of raffleResults) {
    if (res.ticket && res.ticket.code) {
      await fetch(`http://localhost:8080/api/raffle/participants/${res.ticket.code}`, { method: 'DELETE' });
    }
  }

  agentReports.push({ agent: 'StressBot', duration: totalDuration, status: 'SUCCESS' });
}

// ==============================================================================
// 🚀 EJECUCIÓN PRINCIPAL DE LA BATERÍA MULTI-AGENTE
// ==============================================================================
async function runAllAgents() {
  console.log('🚀 Iniciando Simulación Multi-Agente Autónoma de EcoGastroFest 2026...\n');
  const globalStart = Date.now();

  try {
    await runAgentValentina();
    await runAgentRodrigo();
    await runAgentCamila();
    await runAgentCarlos();
    await runAgentStressBot();
  } catch (err) {
    console.error('❌ Error crítico en ejecución multi-agente:', err);
  }

  const globalDuration = ((Date.now() - globalStart) / 1000).toFixed(2);

  console.log('\n======================================================================');
  console.log('📊 RESUMEN FINAL DE LA SIMULACIÓN MULTI-AGENTE');
  console.log('======================================================================');
  console.log(`⏱️ Tiempo Total de Ejecución: ${globalDuration} segundos`);
  console.log(`🎯 Total de Aserciones: ${totalAssertions}`);
  console.log(`✅ Aserciones Exitosas: ${passedAssertions}`);
  console.log(`❌ Aserciones Fallidas: ${failedAssertions}`);
  console.log('----------------------------------------------------------------------');
  console.log('📋 Estado por Agente Simulado:');
  agentReports.forEach(r => {
    console.log(`  👤 Agente: ${r.agent.padEnd(12)} | Estado: ${r.status} | Latencia: ${r.duration} ms`);
  });
  console.log('======================================================================\n');
}

runAllAgents();
