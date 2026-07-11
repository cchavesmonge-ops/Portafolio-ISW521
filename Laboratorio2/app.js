// PARTE DEL LABORATORIO: Estado global del módulo
const API_BASE = "https://worldcup26.ir";

let authToken   = null;
let allTeams    = [];           // caché local de los 48 equipos
let activeController = null;   // AbortController activo
const selectedTeams  = [];     // máximo 2 equipos seleccionados

// PARTE DEL LABORATORIO: Datos locales de respaldo
// Se usan si la API no responde (CORS, red, token).
// Incluyen nombre en español para búsqueda bilingüe y datos completos para comparación.
const FALLBACK_TEAMS = [
  { id:"1",  name_en:"Argentina",    name_es:"Argentina",      fifa_code:"ARG", groups:"J", confederation:"CONMEBOL", fifa_ranking:1,  coach:"Lionel Scaloni",     stadium:"Estadio Monumental" },
  { id:"2",  name_en:"Australia",    name_es:"Australia",      fifa_code:"AUS", groups:"H", confederation:"AFC",      fifa_ranking:23, coach:"Tony Popovic",        stadium:"Stadium Australia" },
  { id:"3",  name_en:"Belgium",      name_es:"Bélgica",        fifa_code:"BEL", groups:"E", confederation:"UEFA",     fifa_ranking:3,  coach:"Rudi García",         stadium:"Estadio Rey Balduino" },
  { id:"4",  name_en:"Brazil",       name_es:"Brasil",         fifa_code:"BRA", groups:"C", confederation:"CONMEBOL", fifa_ranking:5,  coach:"Carlo Ancelotti",     stadium:"Estadio do Maracanã" },
  { id:"5",  name_en:"Cameroon",     name_es:"Camerún",        fifa_code:"CMR", groups:"G", confederation:"CAF",      fifa_ranking:43, coach:"Marc Brys",           stadium:"Stade Ahmadou Ahidjo" },
  { id:"6",  name_en:"Canada",       name_es:"Canadá",         fifa_code:"CAN", groups:"A", confederation:"CONCACAF", fifa_ranking:40, coach:"Jesse Marsch",        stadium:"BMO Field" },
  { id:"7",  name_en:"Colombia",     name_es:"Colombia",       fifa_code:"COL", groups:"F", confederation:"CONMEBOL", fifa_ranking:9,  coach:"Néstor Lorenzo",      stadium:"Estadio El Campín" },
  { id:"8",  name_en:"Costa Rica",   name_es:"Costa Rica",     fifa_code:"CRC", groups:"B", confederation:"CONCACAF", fifa_ranking:51, coach:"Claudio Vivas",       stadium:"Estadio Nacional" },
  { id:"9",  name_en:"Croatia",      name_es:"Croacia",        fifa_code:"CRO", groups:"D", confederation:"UEFA",     fifa_ranking:10, coach:"Zlatko Dalić",        stadium:"Estadio Maksimir" },
  { id:"10", name_en:"Ecuador",      name_es:"Ecuador",        fifa_code:"ECU", groups:"I", confederation:"CONMEBOL", fifa_ranking:44, coach:"Sebastián Beccacece", stadium:"Estadio Rodrigo Paz" },
  { id:"11", name_en:"Egypt",        name_es:"Egipto",         fifa_code:"EGY", groups:"K", confederation:"CAF",      fifa_ranking:36, coach:"Hossam Hassan",       stadium:"Estadio Internacional del Cairo" },
  { id:"12", name_en:"England",      name_es:"Inglaterra",     fifa_code:"ENG", groups:"F", confederation:"UEFA",     fifa_ranking:4,  coach:"Lee Carsley",         stadium:"Wembley" },
  { id:"13", name_en:"France",       name_es:"Francia",        fifa_code:"FRA", groups:"E", confederation:"UEFA",     fifa_ranking:2,  coach:"Didier Deschamps",    stadium:"Stade de France" },
  { id:"14", name_en:"Germany",      name_es:"Alemania",       fifa_code:"GER", groups:"C", confederation:"UEFA",     fifa_ranking:12, coach:"Julian Nagelsmann",   stadium:"Allianz Arena" },
  { id:"15", name_en:"Ghana",        name_es:"Ghana",          fifa_code:"GHA", groups:"L", confederation:"CAF",      fifa_ranking:60, coach:"Otto Addo",           stadium:"Estadio Baba Yara" },
  { id:"16", name_en:"Honduras",     name_es:"Honduras",       fifa_code:"HON", groups:"A", confederation:"CONCACAF", fifa_ranking:81, coach:"Reinaldo Rueda",      stadium:"Estadio Olímpico" },
  { id:"17", name_en:"Iran",         name_es:"Irán",           fifa_code:"IRA", groups:"D", confederation:"AFC",      fifa_ranking:22, coach:"Amir Ghalenoei",      stadium:"Estadio Azadi" },
  { id:"18", name_en:"Iraq",         name_es:"Irak",           fifa_code:"IRQ", groups:"B", confederation:"AFC",      fifa_ranking:58, coach:"Jesús Casas",         stadium:"Estadio Al-Shaab" },
  { id:"19", name_en:"Japan",        name_es:"Japón",          fifa_code:"JPN", groups:"G", confederation:"AFC",      fifa_ranking:15, coach:"Hajime Moriyasu",     stadium:"Japan National Stadium" },
  { id:"20", name_en:"South Korea",  name_es:"Corea del Sur",  fifa_code:"KOR", groups:"H", confederation:"AFC",      fifa_ranking:21, coach:"Hong Myung-bo",       stadium:"Estadio de Seúl" },
  { id:"21", name_en:"Saudi Arabia", name_es:"Arabia Saudita", fifa_code:"KSA", groups:"K", confederation:"AFC",      fifa_ranking:56, coach:"Hervé Renard",        stadium:"Estadio Rey Fahd" },
  { id:"22", name_en:"Morocco",      name_es:"Marruecos",      fifa_code:"MAR", groups:"I", confederation:"CAF",      fifa_ranking:14, coach:"Walid Regragui",      stadium:"Stade Mohammed V" },
  { id:"23", name_en:"Mexico",       name_es:"México",         fifa_code:"MEX", groups:"A", confederation:"CONCACAF", fifa_ranking:16, coach:"Javier Aguirre",      stadium:"Estadio Azteca" },
  { id:"24", name_en:"Netherlands",  name_es:"Países Bajos",   fifa_code:"NED", groups:"F", confederation:"UEFA",     fifa_ranking:7,  coach:"Ronald Koeman",       stadium:"Johan Cruyff Arena" },
  { id:"25", name_en:"Nigeria",      name_es:"Nigeria",        fifa_code:"NGA", groups:"L", confederation:"CAF",      fifa_ranking:49, coach:"Eric Chelle",         stadium:"Estadio Nacional de Abuja" },
  { id:"26", name_en:"New Zealand",  name_es:"Nueva Zelanda",  fifa_code:"NZL", groups:"G", confederation:"OFC",      fifa_ranking:92, coach:"Darren Bazeley",      stadium:"Eden Park" },
  { id:"27", name_en:"Panama",       name_es:"Panamá",         fifa_code:"PAN", groups:"B", confederation:"CONCACAF", fifa_ranking:73, coach:"Thomas Christiansen", stadium:"Estadio Rommel Fernández" },
  { id:"28", name_en:"Paraguay",     name_es:"Paraguay",       fifa_code:"PAR", groups:"C", confederation:"CONMEBOL", fifa_ranking:65, coach:"Gustavo Alfaro",      stadium:"Estadio Defensores del Chaco" },
  { id:"29", name_en:"Portugal",     name_es:"Portugal",       fifa_code:"POR", groups:"E", confederation:"UEFA",     fifa_ranking:6,  coach:"Roberto Martínez",    stadium:"Estadio da Luz" },
  { id:"30", name_en:"Qatar",        name_es:"Catar",          fifa_code:"QAT", groups:"L", confederation:"AFC",      fifa_ranking:37, coach:"Bartolomé Márquez",   stadium:"Estadio Internacional Khalifa" },
  { id:"31", name_en:"Romania",      name_es:"Rumanía",        fifa_code:"ROU", groups:"D", confederation:"UEFA",     fifa_ranking:46, coach:"Mircea Lucescu",      stadium:"Arena Națională" },
  { id:"32", name_en:"South Africa", name_es:"Sudáfrica",      fifa_code:"RSA", groups:"J", confederation:"CAF",      fifa_ranking:63, coach:"Hugo Broos",          stadium:"FNB Stadium" },
  { id:"33", name_en:"Senegal",      name_es:"Senegal",        fifa_code:"SEN", groups:"H", confederation:"CAF",      fifa_ranking:20, coach:"Aliou Cissé",         stadium:"Estadio Léopold Sédar Senghor" },
  { id:"34", name_en:"Serbia",       name_es:"Serbia",         fifa_code:"SRB", groups:"D", confederation:"UEFA",     fifa_ranking:33, coach:"Dragan Stojković",    stadium:"Estadio Rajko Mitić" },
  { id:"35", name_en:"Switzerland",  name_es:"Suiza",          fifa_code:"SUI", groups:"I", confederation:"UEFA",     fifa_ranking:19, coach:"Murat Yakin",         stadium:"Estadio de Ginebra" },
  { id:"36", name_en:"Tunisia",      name_es:"Túnez",          fifa_code:"TUN", groups:"K", confederation:"CAF",      fifa_ranking:30, coach:"Mondher Kebaier",     stadium:"Estadio de Rades" },
  { id:"37", name_en:"Ukraine",      name_es:"Ucrania",        fifa_code:"UKR", groups:"J", confederation:"UEFA",     fifa_ranking:24, coach:"Serhiy Rebrov",       stadium:"Olimpiyskiy" },
  { id:"38", name_en:"Uruguay",      name_es:"Uruguay",        fifa_code:"URU", groups:"C", confederation:"CONMEBOL", fifa_ranking:17, coach:"Marcelo Bielsa",      stadium:"Estadio Centenario" },
  { id:"39", name_en:"USA",          name_es:"Estados Unidos", fifa_code:"USA", groups:"A", confederation:"CONCACAF", fifa_ranking:11, coach:"Mauricio Pochettino", stadium:"Rose Bowl" },
  { id:"40", name_en:"Venezuela",    name_es:"Venezuela",      fifa_code:"VEN", groups:"I", confederation:"CONMEBOL", fifa_ranking:47, coach:"Fernando Batista",    stadium:"Estadio Monumental de Maturín" },
  { id:"41", name_en:"Spain",        name_es:"España",         fifa_code:"ESP", groups:"E", confederation:"UEFA",     fifa_ranking:8,  coach:"Luis de la Fuente",   stadium:"Estadio de La Cartuja" },
  { id:"42", name_en:"Turkey",       name_es:"Turquía",        fifa_code:"TUR", groups:"K", confederation:"UEFA",     fifa_ranking:29, coach:"Vincenzo Montella",   stadium:"Estadio Atatürk" },
  { id:"43", name_en:"Ivory Coast",  name_es:"Costa de Marfil",fifa_code:"CIV", groups:"H", confederation:"CAF",      fifa_ranking:11, coach:"Emerse Faé",          stadium:"Estadio FHB" },
  { id:"44", name_en:"DR Congo",     name_es:"Congo RD",       fifa_code:"COD", groups:"L", confederation:"CAF",      fifa_ranking:26, coach:"Sébastien Desabre",   stadium:"Stade des Martyrs" },
  { id:"45", name_en:"Norway",       name_es:"Noruega",        fifa_code:"NOR", groups:"G", confederation:"UEFA",     fifa_ranking:25, coach:"Ståle Solbakken",     stadium:"Estadio Ullevaal" },
  { id:"46", name_en:"Sweden",       name_es:"Suecia",         fifa_code:"SWE", groups:"F", confederation:"UEFA",     fifa_ranking:35, coach:"Jon Dahl Tomasson",   stadium:"Friends Arena" },
  { id:"47", name_en:"Jordan",       name_es:"Jordania",       fifa_code:"JOR", groups:"B", confederation:"AFC",      fifa_ranking:70, coach:"Hussein Ammouta",     stadium:"Estadio Internacional de Amán" },
  { id:"48", name_en:"Uzbekistan",   name_es:"Uzbekistán",     fifa_code:"UZB", groups:"H", confederation:"AFC",      fifa_ranking:66, coach:"Srecko Katanec",      stadium:"Estadio Pakhtakor" },
];

// PARTE DEL LABORATORIO: Mapa de banderas emoji por código FIFA
const FLAG_EMOJI = {
  ARG:"🇦🇷", AUS:"🇦🇺", BEL:"🇧🇪", BRA:"🇧🇷", CMR:"🇨🇲", CAN:"🇨🇦",
  COL:"🇨🇴", CRC:"🇨🇷", CRO:"🇭🇷", ECU:"🇪🇨", EGY:"🇪🇬", ENG:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  ESP:"🇪🇸", FRA:"🇫🇷", GER:"🇩🇪", GHA:"🇬🇭", HON:"🇭🇳", IRA:"🇮🇷",
  IRQ:"🇮🇶", JPN:"🇯🇵", KOR:"🇰🇷", KSA:"🇸🇦", MAR:"🇲🇦", MEX:"🇲🇽",
  NED:"🇳🇱", NGA:"🇳🇬", NOR:"🇳🇴", NZL:"🇳🇿", PAN:"🇵🇦", PAR:"🇵🇾",
  POR:"🇵🇹", QAT:"🇶🇦", ROU:"🇷🇴", RSA:"🇿🇦", SEN:"🇸🇳", SRB:"🇷🇸",
  SUI:"🇨🇭", TUN:"🇹🇳", TUR:"🇹🇷", UKR:"🇺🇦", URU:"🇺🇾", USA:"🇺🇸",
  VEN:"🇻🇪", CIV:"🇨🇮", COD:"🇨🇩", SWE:"🇸🇪", JOR:"🇯🇴", UZB:"🇺🇿",
};

const getFlag = (team) => FLAG_EMOJI[team?.fifa_code] ?? "🏳️";

// devuelve el nombre a mostrar: español si existe, inglés como fallback
const getDisplayName = (team) => team.name_es ?? team.name_en ?? team.name ?? "—";

// PARTE DEL LABORATORIO: Simulación e Integración con la API Rest
const authenticate = async (email = "test@test.com", password = "test123") => {
  try {
    const res = await fetch(`${API_BASE}/auth/authenticate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      const data = await res.json();
      authToken = data.token ?? `sim.${Date.now()}`;
      console.log("[AUTH] Token real obtenido.");
      return { ok: true };
    }
    authToken = `sim.${Date.now()}`;
    return { simulated: true };
  } catch {
    authToken = `sim.${Date.now()}`;
    console.log("[AUTH] Usando token simulado (CORS o red inaccesible).");
    return { simulated: true };
  }
};

// carga inicial de equipos — por ahora solo con el catálogo local;
// la integración real contra /get/teams se implementa en el próximo commit
const loadAllTeams = async () => {
  allTeams = FALLBACK_TEAMS;
  console.log(`[TEAMS] ${allTeams.length} equipos cargados (catálogo local).`);
};

// PARTE DEL LABORATORIO: Mecanismo para corromper el token desde consola
window.__corruptToken = () => {
  authToken = "token.invalido.401";
  console.log("[DEBUG] Token corrompido — el próximo apiFetch disparará un 401.");
};

// PARTE DEL LABORATORIO: Mecanismo de Debounce Propio
const debounce = (fn, delay) => {
  let timerId = null;
  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), delay);
  };
};

// PARTE DEL LABORATORIO: Gestión de Errores y Resiliencia (401)
const showAuthModal = () => {
  const modal = document.getElementById("auth-modal");
  modal.classList.add("is-visible");
  modal.setAttribute("aria-hidden", "false");
  document.getElementById("modal-email").focus();
};

const hideAuthModal = () => {
  const modal = document.getElementById("auth-modal");
  modal.classList.remove("is-visible");
  modal.setAttribute("aria-hidden", "true");
  document.getElementById("search-input").focus();
};

// helper centralizado para el feedback bajo el input
const setFeedback = (msg, isError = false) => {
  const el = document.getElementById("search-feedback");
  el.textContent = msg;
  el.className = `search-feedback mt-1 small${isError ? " search-feedback--error" : ""}`;
};

// PARTE DEL LABORATORIO: Control de Condiciones de Carrera con AbortController
// Cada llamada cancela la anterior con .abort() antes de lanzar la nueva petición.
// Nota: esto es una demostración mínima del mecanismo — la búsqueda real contra
// la API y el renderizado del dropdown de sugerencias llegan en el siguiente commit.
const searchTeams = async (query) => {
  // abortar petición anterior en vuelo — núcleo del AbortController
  if (activeController) activeController.abort();
  activeController = new AbortController();
  const { signal } = activeController;

  if (!query.trim()) {
    setFeedback("");
    return;
  }

  try {
    await fetch(`${API_BASE}/get/teams?name=${encodeURIComponent(query)}`, {
      headers: { Authorization: `Bearer ${authToken}` },
      signal,
    });
    console.log(`[DEBUG] Búsqueda de "${query}" enviada — el renderizado llega en el próximo commit.`);
  } catch (err) {
    if (err.name === "AbortError") {
      console.log("[DEBUG] Petición cancelada intencionalmente por AbortController — no es un error.");
      return;
    }
    console.warn("[SEARCH] API no disponible todavía.");
  }
};

// PARTE DEL LABORATORIO: Inicialización
const init = async () => {
  await authenticate();
  await loadAllTeams();

  const input           = document.getElementById("search-input");
  const debouncedSearch = debounce(searchTeams, 300);

  input.addEventListener("input", (e) => debouncedSearch(e.target.value));
};

init();
