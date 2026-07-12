// PARTE DEL LABORATORIO: Estado global del módulo
const API_BASE = "https://worldcup26.ir";

let authToken   = null;
let allTeams    = [];           // caché local de los 48 equipos
let activeController = null;   // AbortController activo
const selectedTeams  = [];     // máximo 2 equipos seleccionados

// PARTE DEL LABORATORIO: Datos locales de respaldo
// Se usan si la API no responde (CORS, red, token) o si devuelve menos
// selecciones de las 48 reales — nunca deben faltar equipos en pantalla.
// Incluyen nombre en español para búsqueda bilingüe y datos completos para comparación.
const FALLBACK_TEAMS = [
  { id: "1", name_en: "Argentina", name_es: "Argentina", fifa_code: "ARG", groups: "J", confederation: "CONMEBOL", fifa_ranking: 1, coach: "Lionel Scaloni", stadium: "Estadio Monumental" },
  { id: "2", name_en: "Brazil", name_es: "Brasil", fifa_code: "BRA", groups: "C", confederation: "CONMEBOL", fifa_ranking: 5, coach: "Carlo Ancelotti", stadium: "Estadio do Maracana" },
  { id: "3", name_en: "Colombia", name_es: "Colombia", fifa_code: "COL", groups: "F", confederation: "CONMEBOL", fifa_ranking: 9, coach: "Nestor Lorenzo", stadium: "Estadio El Campin" },
  { id: "4", name_en: "Ecuador", name_es: "Ecuador", fifa_code: "ECU", groups: "I", confederation: "CONMEBOL", fifa_ranking: 44, coach: "Sebastian Beccacece", stadium: "Estadio Rodrigo Paz" },
  { id: "5", name_en: "Paraguay", name_es: "Paraguay", fifa_code: "PAR", groups: "D", confederation: "CONMEBOL", fifa_ranking: 65, coach: "Gustavo Alfaro", stadium: "Estadio Defensores del Chaco" },
  { id: "6", name_en: "Uruguay", name_es: "Uruguay", fifa_code: "URU", groups: "C", confederation: "CONMEBOL", fifa_ranking: 17, coach: "Marcelo Bielsa", stadium: "Estadio Centenario" },
  { id: "7", name_en: "Canada", name_es: "Canada", fifa_code: "CAN", groups: "B", confederation: "CONCACAF", fifa_ranking: 40, coach: "Jesse Marsch", stadium: "BMO Field" },
  { id: "8", name_en: "Mexico", name_es: "Mexico", fifa_code: "MEX", groups: "A", confederation: "CONCACAF", fifa_ranking: 16, coach: "Javier Aguirre", stadium: "Estadio Azteca" },
  { id: "9", name_en: "USA", name_es: "Estados Unidos", fifa_code: "USA", groups: "D", confederation: "CONCACAF", fifa_ranking: 11, coach: "Mauricio Pochettino", stadium: "Rose Bowl" },
  { id: "10", name_en: "Panama", name_es: "Panama", fifa_code: "PAN", groups: "B", confederation: "CONCACAF", fifa_ranking: 73, coach: "Thomas Christiansen", stadium: "Estadio Rommel Fernandez" },
  { id: "11", name_en: "Curacao", name_es: "Curazao", fifa_code: "CUW", groups: "K", confederation: "CONCACAF", fifa_ranking: 88, coach: "Remko Bicentini", stadium: "Ergilio Hato Stadium" },
  { id: "12", name_en: "Haiti", name_es: "Haiti", fifa_code: "HAI", groups: "C", confederation: "CONCACAF", fifa_ranking: 80, coach: "Marc Collat", stadium: "Stade Sylvio Cator" },
  { id: "13", name_en: "Australia", name_es: "Australia", fifa_code: "AUS", groups: "D", confederation: "AFC", fifa_ranking: 23, coach: "Tony Popovic", stadium: "Stadium Australia" },
  { id: "14", name_en: "Iraq", name_es: "Irak", fifa_code: "IRQ", groups: "B", confederation: "AFC", fifa_ranking: 58, coach: "Jesus Casas", stadium: "Estadio Al-Shaab" },
  { id: "15", name_en: "IR Iran", name_es: "Iran", fifa_code: "IRI", groups: "G", confederation: "AFC", fifa_ranking: 22, coach: "Amir Ghalenoei", stadium: "Estadio Azadi" },
  { id: "16", name_en: "Japan", name_es: "Japon", fifa_code: "JPN", groups: "H", confederation: "AFC", fifa_ranking: 15, coach: "Hajime Moriyasu", stadium: "Japan National Stadium" },
  { id: "17", name_en: "Jordan", name_es: "Jordania", fifa_code: "JOR", groups: "G", confederation: "AFC", fifa_ranking: 70, coach: "Hussein Ammouta", stadium: "Estadio Internacional de Aman" },
  { id: "18", name_en: "South Korea", name_es: "Corea del Sur", fifa_code: "KOR", groups: "A", confederation: "AFC", fifa_ranking: 21, coach: "Hong Myung-bo", stadium: "Estadio de Seoul" },
  { id: "19", name_en: "Saudi Arabia", name_es: "Arabia Saudita", fifa_code: "KSA", groups: "I", confederation: "AFC", fifa_ranking: 56, coach: "Herve Renard", stadium: "Estadio Rey Fahd" },
  { id: "20", name_en: "Qatar", name_es: "Catar", fifa_code: "QAT", groups: "B", confederation: "AFC", fifa_ranking: 37, coach: "Bartolome Marquez", stadium: "Estadio Internacional Khalifa" },
  { id: "21", name_en: "Uzbekistan", name_es: "Uzbekistan", fifa_code: "UZB", groups: "F", confederation: "AFC", fifa_ranking: 66, coach: "Srecko Katanec", stadium: "Estadio Pakhtakor" },
  { id: "22", name_en: "Algeria", name_es: "Argelia", fifa_code: "ALG", groups: "E", confederation: "CAF", fifa_ranking: 35, coach: "Vladimir Petkovic", stadium: "Stade Mustapha Tchaker" },
  { id: "23", name_en: "Cabo Verde", name_es: "Cabo Verde", fifa_code: "CPV", groups: "L", confederation: "CAF", fifa_ranking: 77, coach: "Bubista", stadium: "Estadio Nacional de Cabo Verde" },
  { id: "24", name_en: "DR Congo", name_es: "Congo RD", fifa_code: "COD", groups: "J", confederation: "CAF", fifa_ranking: 26, coach: "Sebastien Desabre", stadium: "Stade des Martyrs" },
  { id: "25", name_en: "Ivory Coast", name_es: "Costa de Marfil", fifa_code: "CIV", groups: "H", confederation: "CAF", fifa_ranking: 11, coach: "Emerse Fae", stadium: "Estadio FHB" },
  { id: "26", name_en: "Egypt", name_es: "Egipto", fifa_code: "EGY", groups: "K", confederation: "CAF", fifa_ranking: 36, coach: "Hossam Hassan", stadium: "Estadio Internacional del Cairo" },
  { id: "27", name_en: "Ghana", name_es: "Ghana", fifa_code: "GHA", groups: "L", confederation: "CAF", fifa_ranking: 60, coach: "Otto Addo", stadium: "Estadio Baba Yara" },
  { id: "28", name_en: "Morocco", name_es: "Marruecos", fifa_code: "MAR", groups: "H", confederation: "CAF", fifa_ranking: 14, coach: "Walid Regragui", stadium: "Stade Mohammed V" },
  { id: "29", name_en: "Senegal", name_es: "Senegal", fifa_code: "SEN", groups: "F", confederation: "CAF", fifa_ranking: 20, coach: "Aliou Cisse", stadium: "Estadio Leopold Sedar Senghor" },
  { id: "30", name_en: "South Africa", name_es: "Sudafrica", fifa_code: "RSA", groups: "A", confederation: "CAF", fifa_ranking: 63, coach: "Hugo Broos", stadium: "FNB Stadium" },
  { id: "31", name_en: "Tunisia", name_es: "Tunez", fifa_code: "TUN", groups: "K", confederation: "CAF", fifa_ranking: 30, coach: "Mondher Kebaier", stadium: "Estadio de Rades" },
  { id: "32", name_en: "New Zealand", name_es: "Nueva Zelanda", fifa_code: "NZL", groups: "E", confederation: "OFC", fifa_ranking: 92, coach: "Darren Bazeley", stadium: "Eden Park" },
  { id: "33", name_en: "Austria", name_es: "Austria", fifa_code: "AUT", groups: "I", confederation: "UEFA", fifa_ranking: 28, coach: "Ralf Rangnick", stadium: "Ernst Happel Stadion" },
  { id: "34", name_en: "Belgium", name_es: "Belgica", fifa_code: "BEL", groups: "E", confederation: "UEFA", fifa_ranking: 3, coach: "Rudi Garcia", stadium: "Estadio Rey Balduino" },
  { id: "35", name_en: "Bosnia and Herzegovina", name_es: "Bosnia y Herzegovina", fifa_code: "BIH", groups: "L", confederation: "UEFA", fifa_ranking: 62, coach: "Sergej Barbarez", stadium: "Stadion Bilino Polje" },
  { id: "36", name_en: "Croatia", name_es: "Croacia", fifa_code: "CRO", groups: "K", confederation: "UEFA", fifa_ranking: 10, coach: "Zlatko Dalic", stadium: "Estadio Maksimir" },
  { id: "37", name_en: "Czechia", name_es: "Chequia", fifa_code: "CZE", groups: "G", confederation: "UEFA", fifa_ranking: 36, coach: "Ivan Hasek", stadium: "Estadio Eden" },
  { id: "38", name_en: "England", name_es: "Inglaterra", fifa_code: "ENG", groups: "F", confederation: "UEFA", fifa_ranking: 4, coach: "Lee Carsley", stadium: "Wembley" },
  { id: "39", name_en: "France", name_es: "Francia", fifa_code: "FRA", groups: "E", confederation: "UEFA", fifa_ranking: 2, coach: "Didier Deschamps", stadium: "Stade de France" },
  { id: "40", name_en: "Germany", name_es: "Alemania", fifa_code: "GER", groups: "C", confederation: "UEFA", fifa_ranking: 12, coach: "Julian Nagelsmann", stadium: "Allianz Arena" },
  { id: "41", name_en: "Netherlands", name_es: "Paises Bajos", fifa_code: "NED", groups: "J", confederation: "UEFA", fifa_ranking: 7, coach: "Ronald Koeman", stadium: "Johan Cruyff Arena" },
  { id: "42", name_en: "Norway", name_es: "Noruega", fifa_code: "NOR", groups: "G", confederation: "UEFA", fifa_ranking: 25, coach: "Stale Solbakken", stadium: "Estadio Ullevaal" },
  { id: "43", name_en: "Portugal", name_es: "Portugal", fifa_code: "POR", groups: "F", confederation: "UEFA", fifa_ranking: 6, coach: "Roberto Martinez", stadium: "Estadio da Luz" },
  { id: "44", name_en: "Scotland", name_es: "Escocia", fifa_code: "SCO", groups: "C", confederation: "UEFA", fifa_ranking: 38, coach: "Steve Clarke", stadium: "Hampden Park" },
  { id: "45", name_en: "Spain", name_es: "Espana", fifa_code: "ESP", groups: "H", confederation: "UEFA", fifa_ranking: 8, coach: "Luis de la Fuente", stadium: "Estadio de La Cartuja" },
  { id: "46", name_en: "Sweden", name_es: "Suecia", fifa_code: "SWE", groups: "I", confederation: "UEFA", fifa_ranking: 35, coach: "Jon Dahl Tomasson", stadium: "Friends Arena" },
  { id: "47", name_en: "Switzerland", name_es: "Suiza", fifa_code: "SUI", groups: "J", confederation: "UEFA", fifa_ranking: 19, coach: "Murat Yakin", stadium: "Estadio de Ginebra" },
  { id: "48", name_en: "Turkey", name_es: "Turquia", fifa_code: "TUR", groups: "D", confederation: "UEFA", fifa_ranking: 29, coach: "Vincenzo Montella", stadium: "Estadio Ataturk" },
];

// PARTE DEL LABORATORIO: Bandera a partir del código FIFA -> ISO-3166 alpha-2
// Se genera con los caracteres regionales Unicode en vez de un mapa fijo de
// emojis, para que ninguna selección se quede sin bandera visible.
const FIFA_TO_ISO = {
  ARG: "AR", BRA: "BR", COL: "CO", ECU: "EC", PAR: "PY", URU: "UY",
  CAN: "CA", MEX: "MX", USA: "US", PAN: "PA", CUW: "CW", HAI: "HT",
  AUS: "AU", IRQ: "IQ", IRI: "IR", JPN: "JP", JOR: "JO", KOR: "KR",
  KSA: "SA", QAT: "QA", UZB: "UZ",
  ALG: "DZ", CPV: "CV", COD: "CD", CIV: "CI", EGY: "EG", GHA: "GH",
  MAR: "MA", SEN: "SN", RSA: "ZA", TUN: "TN",
  NZL: "NZ",
  AUT: "AT", BEL: "BE", BIH: "BA", CRO: "HR", CZE: "CZ",
  ENG: "GB", FRA: "FR", GER: "DE", NED: "NL", NOR: "NO",
  POR: "PT", SCO: "GB", ESP: "ES", SWE: "SE", SUI: "CH", TUR: "TR",
};

const getFlag = (team) => {
  const fifa = team?.fifa_code;
  if (!fifa || !FIFA_TO_ISO[fifa]) return "🏳️";
  const iso = FIFA_TO_ISO[fifa];
  return String.fromCodePoint(...iso.split('').map(c => 127397 + c.charCodeAt(0)));
};

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

// carga los equipos desde la API y los enriquece con datos del fallback local.
// El enriquecimiento garantiza que name_es, coach, stadium, etc. siempre estén
// disponibles aunque la API no los devuelva en el listado inicial.
const loadAllTeams = async () => {
  try {
    // el enunciado dice que /get/teams requiere token JWT sin excepción
    const res = await fetch(`${API_BASE}/get/teams`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (res.status === 401) {
      showAuthModal();
      return;
    }

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const apiTeams = normalizeTeams(data);

    // enriquecer cada equipo de la API con los datos completos del fallback
    // cruzando por fifa_code — así name_es, coach, stadium, etc. siempre existen,
    // descartando cualquier código que no pertenezca al catálogo real
    const validCodes = new Set(FALLBACK_TEAMS.map(f => f.fifa_code));
    const enriched = apiTeams
      .filter(t => validCodes.has(t.fifa_code ?? t.code ?? ""))
      .map(t => {
        const local = FALLBACK_TEAMS.find(f => f.fifa_code === (t.fifa_code ?? t.code ?? ""));
        return { ...local, ...t, name_es: local?.name_es ?? t.name_en };
      });

    // si la API devolvió menos de las 48 selecciones, se completa con el
    // fallback para que ninguna selección desaparezca del buscador
    if (enriched.length < 48) {
      const returnedCodes = new Set(enriched.map(t => t.fifa_code));
      const missing = FALLBACK_TEAMS.filter(f => !returnedCodes.has(f.fifa_code));
      allTeams = [...enriched, ...missing];
    } else {
      allTeams = enriched;
    }

    console.log(`[TEAMS] ${allTeams.length} equipos cargados.`);
    setFeedback("", false);

  } catch (err) {
    console.warn("[TEAMS] API no disponible, usando datos locales:", err.message);
    allTeams = FALLBACK_TEAMS;
    setFeedback("", false);
  }
};

// normaliza cualquier estructura de respuesta de la API a un array plano
const normalizeTeams = (data) => {
  if (Array.isArray(data) && data.length > 0)       return data;
  if (data?.teams && Array.isArray(data.teams))       return data.teams;
  if (data?.data  && Array.isArray(data.data))        return data.data;
  if (data?.results && Array.isArray(data.results))   return data.results;
  // si vino un objeto único, envolverlo en array
  if (data?.name_en || data?.name)                    return [data];
  return [];
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
const searchTeams = async (query) => {
  const dropdown = document.getElementById("suggestions-list");
  const input    = document.getElementById("search-input");

  // abortar petición anterior en vuelo — núcleo del AbortController
  if (activeController) activeController.abort();
  activeController = new AbortController();
  const { signal } = activeController;

  if (allTeams.length === 0) {
    setFeedback("El catálogo no está disponible. Recarga la página.", true);
    return;
  }

  // sin texto: mostrar todos los equipos ordenados en español
  if (!query.trim()) {
    const sorted = [...allTeams].sort((a, b) =>
      getDisplayName(a).localeCompare(getDisplayName(b), "es")
    );
    renderSuggestions(sorted);
    input.setAttribute("aria-expanded", "true");
    setFeedback("");
    return;
  }

  const q = query.toLowerCase().trim();

  try {
    // usar la API real con el endpoint del enunciado: GET /get/teams?name={busqueda}
    const res = await fetch(
      `${API_BASE}/get/teams?name=${encodeURIComponent(query)}`,
      { headers: { Authorization: `Bearer ${authToken}` }, signal }
    );

    if (res.status === 401) {
      showAuthModal();
      return;
    }

    // si la API falla, filtrar localmente como fallback
    let results;
    if (res.ok) {
      const data = await res.json();
      const apiResults = normalizeTeams(data);
      // enriquecer con datos del fallback (name_es, coach, etc.)
      results = apiResults.map((t) => enrichWithFallback(t));
    } else {
      // filtro local bilingüe como respaldo
      results = allTeams.filter((t) => {
        const byEs = (t.name_es ?? "").toLowerCase().includes(q);
        const byEn = (t.name_en ?? t.name ?? "").toLowerCase().includes(q);
        const byCode = (t.fifa_code ?? "").toLowerCase().startsWith(q);
        return byEs || byEn || byCode;
      });
    }

    // PARTE DEL LABORATORIO: Gestión de Errores y Resiliencia (404)
    if (results.length === 0) {
      dropdown.innerHTML = "";
      input.setAttribute("aria-expanded", "false");
      setFeedback("No se encontraron selecciones con ese nombre.", true);
      return;
    }

    setFeedback("");
    renderSuggestions(results.slice(0, 10));
    input.setAttribute("aria-expanded", "true");

  } catch (err) {
    // AbortError: cancelación intencional — ignorar en la UI, registrar en consola
    if (err.name === "AbortError") {
      console.log("[DEBUG] Petición cancelada intencionalmente por AbortController — no es un error.");
      return;
    }
    // error de red real — filtrar localmente como respaldo
    const results = allTeams.filter((t) => {
      const byEs = (t.name_es ?? "").toLowerCase().includes(q);
      const byEn = (t.name_en ?? t.name ?? "").toLowerCase().includes(q);
      const byCode = (t.fifa_code ?? "").toLowerCase().startsWith(q);
      return byEs || byEn || byCode;
    });

    if (results.length === 0) {
      setFeedback("No se encontraron selecciones con ese nombre.", true);
      return;
    }
    setFeedback("");
    renderSuggestions(results.slice(0, 10));
    input.setAttribute("aria-expanded", "true");
  }
};

// PARTE DEL LABORATORIO: Estructura de la Interfaz — Renderizado dinámico
const renderSuggestions = (teams) => {
  const dropdown = document.getElementById("suggestions-list");
  dropdown.innerHTML = "";

  teams.forEach((team) => {
    const li    = document.createElement("li");
    const flag  = getFlag(team);
    const name  = getDisplayName(team);
    const group = team.groups ?? team.group ?? "";

    li.className = "suggestion-item";
    li.setAttribute("role", "option");
    li.tabIndex  = 0;
    li.setAttribute("aria-label", name);
    li.innerHTML = `
      <span class="suggestion-item__flag" aria-hidden="true">${flag}</span>
      <span class="suggestion-item__name">${name}</span>
      <span class="suggestion-item__group">${group ? `Grupo ${group}` : ""}</span>
    `;

    const doSelect = () => selectTeam({ ...team, _flag: flag, _name: name });
    li.addEventListener("click", doSelect);
    li.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); doSelect(); }
    });

    dropdown.appendChild(li);
  });
};

const selectTeam = (team) => {
  if (selectedTeams.length >= 2) {
    setFeedback("Ya hay 2 equipos. Quita uno antes de añadir otro.", true);
    return;
  }

  const duplicate = selectedTeams.some(
    (t) => (t.id ?? t.name_en) === (team.id ?? team.name_en)
  );
  if (duplicate) {
    setFeedback("Ese equipo ya está seleccionado.", true);
    return;
  }

  selectedTeams.push(team);
  document.getElementById("suggestions-list").innerHTML = "";
  document.getElementById("search-input").value = "";
  document.getElementById("search-input").setAttribute("aria-expanded", "false");
  setFeedback("");

  renderChips();
  if (selectedTeams.length === 2) loadComparison();
};

const renderChips = () => {
  const chipsEl = document.getElementById("selected-chips");
  chipsEl.innerHTML = "";

  selectedTeams.forEach((team, i) => {
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.innerHTML = `
      <span aria-hidden="true">${team._flag ?? getFlag(team)}</span>
      <span>${team._name ?? team.name_en}</span>
      <button class="chip__remove" aria-label="Quitar ${team._name ?? team.name_en}">✕</button>
    `;
    chip.querySelector(".chip__remove").addEventListener("click", () => {
      selectedTeams.splice(i, 1);
      document.getElementById("comparison-container").innerHTML = "";
      setFeedback("");
      renderChips();
    });
    chipsEl.appendChild(chip);
  });
};

// PARTE DEL LABORATORIO: Peticiones en Paralelo con Promise.all
const loadComparison = async () => {
  if (selectedTeams.length < 2) return;

  const container = document.getElementById("comparison-container");

  container.innerHTML = `
    <div class="col-12 col-md-6">
      <div class="team-card" aria-busy="true">${skeletonHTML()}</div>
    </div>
    <div class="col-12 col-md-6">
      <div class="team-card" aria-busy="true">${skeletonHTML()}</div>
    </div>
  `;

  if (activeController) activeController.abort();
  activeController = new AbortController();
  const { signal } = activeController;

  const fallbackA = enrichWithFallback(selectedTeams[0]);
  const fallbackB = enrichWithFallback(selectedTeams[1]);

  try {
    const idA = selectedTeams[0].id ?? "";
    const idB = selectedTeams[1].id ?? "";

    // Función auxiliar para no usar .catch() encadenado, cumpliendo con la regla del laboratorio.
    // Aísla el fallo de UN equipo para que el otro no pierda sus datos reales de la API.
    const fetchSafe = async (id) => {
      try {
        return await apiFetch(`${API_BASE}/get/team/${id}`, signal);
      } catch (err) {
        if (err.name === "AuthError" || err.name === "AbortError") throw err;
        return null;
      }
    };

    // OBLIGATORIO: ambas peticiones en paralelo — prohibido await secuencial
    const [rawA, rawB] = await Promise.all([
      fetchSafe(idA),
      fetchSafe(idB),
    ]);

    // enriquecer el detalle de la API con datos del fallback (coach, stadium, name_es, etc.)
    const detailA = enrichWithFallback(extractTeam(rawA) ?? fallbackA);
    const detailB = enrichWithFallback(extractTeam(rawB) ?? fallbackB);

    container.innerHTML = "";
    container.appendChild(buildTeamCard(detailA));
    container.appendChild(buildTeamCard(detailB));

  } catch (err) {
    if (err.name === "AuthError") return;
    if (err.name === "AbortError") {
      console.log("[DEBUG] Petición cancelada intencionalmente por AbortController — no es un error.");
      return;
    }
    // fallback: los selectedTeams ya tienen datos enriquecidos del paso de selección
    container.innerHTML = "";
    container.appendChild(buildTeamCard(fallbackA));
    container.appendChild(buildTeamCard(fallbackB));
  }
};

// petición base con Authorization header y manejo centralizado de 401
const apiFetch = async (url, signal) => {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${authToken}` },
    signal,
  });
  if (res.status === 401) {
    showAuthModal();
    const err = new Error("Unauthorized");
    err.name = "AuthError";
    throw err;
  }
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
};

const extractTeam = (raw) => {
  if (!raw)                         return null;
  if (raw.name_en || raw.name)      return raw;
  if (raw.team?.name_en)            return raw.team;
  if (Array.isArray(raw))           return raw[0] ?? null;
  if (raw.data?.name_en)            return raw.data;
  if (Array.isArray(raw.data))      return raw.data[0] ?? null;
  return null;
};

// combina un objeto equipo de la API con los datos completos del FALLBACK_TEAMS
// el dato de la API tiene prioridad; el fallback rellena lo que falte
const enrichWithFallback = (team) => {
  if (!team) return team;
  const local = FALLBACK_TEAMS.find(
    (f) => f.fifa_code === (team.fifa_code ?? team.code ?? "")
  );
  if (!local) return team;
  // local primero para obtener name_es, coach, stadium, confederation, etc.
  // luego team de la API sobreescribe con datos más frescos si los tiene,
  // pero cada campo clave cae de vuelta al fallback si la API lo trae vacío
  return {
    ...local,
    ...team,
    name_es: local.name_es,
    coach: team.coach ?? local.coach,
    stadium: team.stadium ?? local.stadium,
    confederation: team.confederation ?? local.confederation,
    fifa_ranking: team.fifa_ranking ?? team.ranking ?? local.fifa_ranking,
  };
};

const skeletonHTML = () => `
  <div class="skeleton" style="height:2rem;width:50%;margin-bottom:1rem"></div>
  <div class="skeleton" style="height:.85rem;width:30%"></div>
  <div class="skeleton" style="height:.85rem;margin-top:.5rem"></div>
  <div class="skeleton" style="height:.85rem;width:75%"></div>
  <div class="skeleton" style="height:.85rem;width:60%"></div>
  <div class="skeleton" style="height:.85rem;width:85%"></div>
`;

const buildTeamCard = (team) => {
  const flag  = team._flag ?? getFlag(team);
  const name  = team._name ?? getDisplayName(team);
  const group = team.groups ?? team.group ?? "—";

  // filtra las filas que tengan valor real (no "—") para que la tabla
  // no quede llena de guiones cuando la API no devuelve un campo.
  // Se retiran las estadísticas de partidos jugados porque el torneo aún
  // no ha comenzado y siempre llegaban en cero, mostrando datos falsos.
  const allStats = {
    "Código FIFA":    team.fifa_code                       ?? "—",
    "Grupo":          group !== "—" ? `Grupo ${group}` : "—",
    "Confederación":  team.confederation                   ?? "—",
    "Ranking FIFA":   team.fifa_ranking ?? team.ranking    ?? "—",
    "Entrenador":     team.coach        ?? team.manager    ?? "—",
    "Estadio":        team.stadium                         ?? "—",
  };

  const rows = Object.entries(allStats)
    .filter(([, v]) => v !== "—")
    .map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`)
    .join("");

  const flagImg = team.flag
    ? `<img src="${team.flag}" alt="Bandera de ${name}"
           class="team-card__flag-img" loading="lazy"
           onerror="this.style.display='none'">`
    : "";

  const col  = document.createElement("div");
  col.className = "col-12 col-md-6";

  const card = document.createElement("article");
  card.className = "team-card";
  card.setAttribute("aria-label", `Datos del equipo ${name}`);
  card.innerHTML = `
    <header class="team-card__header">
      <span class="team-card__flag" aria-hidden="true">${flag}</span>
      ${flagImg}
      <div>
        <div class="team-card__name">${name}</div>
        <div class="team-card__group">${group !== "—" ? `Grupo ${group}` : ""}</div>
      </div>
    </header>
    <table class="team-stats" aria-label="Estadísticas de ${name}">
      <tbody>${rows}</tbody>
    </table>
  `;

  col.appendChild(card);
  return col;
};

// PARTE DEL LABORATORIO: Inicialización
const init = async () => {
  await authenticate();
  await loadAllTeams();

  const input           = document.getElementById("search-input");
  const debouncedSearch = debounce(searchTeams, 300);

  input.addEventListener("input",   (e) => debouncedSearch(e.target.value));

  // mostrar todos los equipos al hacer foco (aunque el campo esté vacío)
  input.addEventListener("focus", () => {
    if (allTeams.length > 0) searchTeams(input.value);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.getElementById("suggestions-list").innerHTML = "";
      input.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-wrapper")) {
      document.getElementById("suggestions-list").innerHTML = "";
      input.setAttribute("aria-expanded", "false");
    }
  });

  const modalBtn = document.getElementById("modal-submit");
  modalBtn.addEventListener("click", async () => {
    const email   = document.getElementById("modal-email").value.trim();
    const pass    = document.getElementById("modal-pass").value.trim();
    const errorEl = document.getElementById("modal-error");

    if (!email || !pass) { errorEl.textContent = "Completa los dos campos."; return; }

    errorEl.textContent  = "";
    modalBtn.textContent = "Ingresando...";
    modalBtn.disabled    = true;

    await authenticate(email, pass);
    await loadAllTeams();

    modalBtn.textContent = "Volver a ingresar";
    modalBtn.disabled    = false;
    hideAuthModal();

    if (selectedTeams.length === 2) loadComparison();
  });

  ["modal-email", "modal-pass"].forEach((id) => {
    document.getElementById(id).addEventListener("keydown", (e) => {
      if (e.key === "Enter") modalBtn.click();
    });
  });
};

init();
