/* =====================================================================
 * BUSCADOR Y COMPARADOR DE EQUIPOS — MUNDIAL 2026
 * Refactor: sin datos hardcodeados, equipos e índice de búsqueda
 * construidos dinámicamente desde la API. Organizado en secciones:
 * CONFIG, AUTH, CACHE, API, SEARCH, UI, INIT.
 * ===================================================================== */

/* ============================== CONFIG ============================== */

const API_BASE = "https://worldcup26.ir";

// Nombre en español canónico por código FIFA. Se mantiene como diccionario
// de apoyo porque la API no siempre trae name_es; sirve como fallback,
// no como fuente de los equipos (esos vienen 100% de /get/teams).
const ES_DISPLAY = {
  ARG: "Argentina", BRA: "Brasil", COL: "Colombia", ECU: "Ecuador", PAR: "Paraguay", URU: "Uruguay",
  CAN: "Canadá", MEX: "México", USA: "Estados Unidos", PAN: "Panamá", CUW: "Curazao", HAI: "Haití",
  AUS: "Australia", IRQ: "Irak", IRI: "Irán", JPN: "Japón", JOR: "Jordania", KOR: "Corea del Sur",
  KSA: "Arabia Saudita", QAT: "Catar", UZB: "Uzbekistán",
  ALG: "Argelia", CPV: "Cabo Verde", COD: "Congo RD", CIV: "Costa de Marfil", EGY: "Egipto",
  GHA: "Ghana", MAR: "Marruecos", SEN: "Senegal", RSA: "Sudáfrica", TUN: "Túnez",
  NZL: "Nueva Zelanda",
  AUT: "Austria", BEL: "Bélgica", BIH: "Bosnia y Herzegovina", CRO: "Croacia", CZE: "Chequia",
  ENG: "Inglaterra", FRA: "Francia", GER: "Alemania", NED: "Países Bajos", NOR: "Noruega",
  POR: "Portugal", SCO: "Escocia", ESP: "España", SWE: "Suecia", SUI: "Suiza", TUR: "Turquía",
};

const STORAGE_KEYS = {
  teams: "backup_teams",
  groups: "backup_groups",
  fontSize: "fontSizePreference",
};

// Estado global del módulo
const state = {
  authToken: null,
  allTeams: [],          // caché local de los equipos (desde la API)
  searchIndex: [],       // índice de búsqueda derivado de allTeams
  selectedTeams: [],     // máximo 2 equipos seleccionados
  activeController: null,
  groupStandingsCache: {},
};

/* =============================== AUTH ================================ */

// nota: los parámetros por defecto (email/password) se conservan como
// resguardo interno de la función, pero ya no se usan de forma automática
// al cargar la página — ahora el flujo pasa siempre por la pantalla de
// inicio de sesión (#login-screen), que exige que el usuario escriba
// explícitamente esas credenciales antes de llamar a authenticate().
const authenticate = async (email = null, password = null) => {
  // sin credenciales explícitas: no tiene sentido pegarle a la API con datos
  // de prueba que sabemos que va a rechazar, así que vamos directo al
  // token simulado y evitamos ruido innecesario en la consola.
  if (!email || !password) {
    state.authToken = `sim.${Date.now()}`;
    console.log("[AUTH] Sin credenciales — usando token simulado.");
    return { simulated: true };
  }

  try {
    const res = await fetch(`${API_BASE}/auth/authenticate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      const data = await res.json();
      state.authToken = data.token ?? `sim.${Date.now()}`;
      console.log("[AUTH] Token real obtenido.");
      return { ok: true };
    }
    state.authToken = `sim.${Date.now()}`;
    return { simulated: true };
  } catch {
    state.authToken = `sim.${Date.now()}`;
    console.log("[AUTH] Usando token simulado (CORS o red inaccesible).");
    return { simulated: true };
  }
};

// PARTE DEL LABORATORIO: Mecanismo para corromper el token desde consola
window.__corruptToken = () => {
  state.authToken = "token.invalido.401";
  console.log("[DEBUG] Token corrompido — el próximo apiFetch disparará un 401.");
};

/* =============================== CACHE ================================ */

const cache = {
  saveTeams(teams) {
    localStorage.setItem(STORAGE_KEYS.teams, JSON.stringify(teams));
  },
  loadTeams() {
    const raw = localStorage.getItem(STORAGE_KEYS.teams);
    return raw ? JSON.parse(raw) : null;
  },
  saveGroups(groupStandingsCache) {
    localStorage.setItem(STORAGE_KEYS.groups, JSON.stringify(groupStandingsCache));
  },
  loadGroups() {
    const raw = localStorage.getItem(STORAGE_KEYS.groups);
    return raw ? JSON.parse(raw) : null;
  },
};

/* ================================ API ================================= */

// petición centralizada: agrega el token, maneja 401 (AuthError), HTTP
// errors, y un timeout corto para que un endpoint lento/caído no cuelgue
// la interfaz (se combina con el signal externo del AbortController de
// búsqueda/comparación, si viene uno)
const REQUEST_TIMEOUT_MS = 6000;

const apiFetch = async (url, externalSignal) => {
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), REQUEST_TIMEOUT_MS);

  const onExternalAbort = () => timeoutController.abort();
  externalSignal?.addEventListener("abort", onExternalAbort);

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${state.authToken}` },
      signal: timeoutController.signal,
    });

    if (res.status === 401) {
      ui.showAuthModal();
      const err = new Error("Unauthorized");
      err.name = "AuthError";
      throw err;
    }
    if (!res.ok) {
      const err = new Error(`HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return await res.json();
  } catch (err) {
    // distinguir un timeout nuestro de una cancelación real del usuario
    if (err.name === "AbortError" && !externalSignal?.aborted) {
      const timeoutErr = new Error(`Timeout tras ${REQUEST_TIMEOUT_MS}ms`);
      timeoutErr.name = "TimeoutError";
      throw timeoutErr;
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
    externalSignal?.removeEventListener("abort", onExternalAbort);
  }
};

// una petición con un reintento inmediato — útil para endpoints que a
// veces devuelven 504/500 por sobrecarga del servidor gratuito
const apiFetchWithRetry = async (url, signal, retries = 1) => {
  try {
    return await apiFetch(url, signal);
  } catch (err) {
    if (retries > 0 && (err.name === "TimeoutError" || err.status >= 500)) {
      return apiFetchWithRetry(url, signal, retries - 1);
    }
    throw err;
  }
};

// normaliza cualquier estructura de respuesta de la API a un array plano
const normalizeTeams = (data) => {
  if (Array.isArray(data) && data.length > 0) return data;
  if (data?.teams && Array.isArray(data.teams)) return data.teams;
  if (data?.data && Array.isArray(data.data)) return data.data;
  if (data?.results && Array.isArray(data.results)) return data.results;
  if (data?.name_en || data?.name) return [data]; // objeto único
  return [];
};

// enriquece un equipo crudo de la API con campos derivados/consistentes
// (nombre en español, grupo, pts/gf/ga si vienen incluidos)
const enrichTeamData = (team = {}) => {
  const fifa = team.fifa_code ?? team.code ?? "";
  return {
    ...team,
    fifa_code: fifa,
    name_es: ES_DISPLAY[fifa] ?? team.name_es ?? team.name ?? team.name_en ?? "—",
    groups: team.groups ?? team.group ?? team.group_name ?? team.group_letter ?? "—",
    pts: team.pts ?? team.points ?? team.points_total ?? null,
    gf: team.gf ?? team.goals_for ?? team.goals_scored ?? null,
    ga: team.ga ?? team.goals_against ?? team.goals_received ?? null,
  };
};

// carga TODOS los equipos desde GET /get/teams, los guarda en localStorage
// y reconstruye el índice de búsqueda. Si la API falla, usa el respaldo local.
const loadAllTeams = async () => {
  try {
    const data = await apiFetch(`${API_BASE}/get/teams`);
    const rawTeams = normalizeTeams(data);
    state.allTeams = rawTeams.map(enrichTeamData);

    cache.saveTeams(state.allTeams);
    search.buildIndex(state.allTeams);

    console.log(`[TEAMS] ${state.allTeams.length} equipos cargados.`);
    ui.setFeedback("", false);
  } catch (err) {
    if (err.name === "AuthError") return;

    console.warn("[TEAMS] API no disponible, intentando usar localStorage:", err.message);
    const backup = cache.loadTeams();
    if (backup) {
      state.allTeams = backup;
      search.buildIndex(state.allTeams);
      ui.setFeedback("Usando datos locales de respaldo.", false);
    } else {
      state.allTeams = [];
      search.buildIndex([]);
      ui.setFeedback("Error al cargar equipos y no hay respaldo local.", true);
    }
  }
};

// GET /get/team/?name= — refinamiento remoto de la búsqueda local
// (nota: la ruta documentada es /get/team/ en singular, no /get/teams/)
const fetchTeamsByName = async (query, signal) => {
  const data = await apiFetch(`${API_BASE}/get/team/?name=${encodeURIComponent(query)}`, signal);
  return normalizeTeams(data).map(enrichTeamData);
};

// nota: se eliminó la llamada a /get/team/:id — ese endpoint del servidor
// gratuito responde 504 de forma consistente y, según el README, solo
// devuelve los mismos campos que ya trae /get/teams (id, name_en, name_fa,
// fifa_code, groups, flag). No hay ganancia en pedirlo de nuevo por equipo;
// el detalle de cada equipo seleccionado se arma con lo que ya está en
// memoria (state.allTeams) más las estadísticas de /get/group.

// normaliza cualquier estructura de respuesta de /get/groups a un array
// plano de grupos: [{ group: "G", teams: [...] }, ...]
const normalizeGroupsList = (data) => {
  if (Array.isArray(data) && data.length > 0) return data;
  if (data?.groups && Array.isArray(data.groups)) return data.groups;
  if (data?.data && Array.isArray(data.data)) return data.data;
  if (data?.group && data?.teams) return [data]; // objeto único
  return [];
};

// normaliza un solo grupo ({ group, teams: [...] }) a { teamId: {pts,gf,ga} }
const normalizeGroupStandings = (data) => {
  const groupObj =
    data?.teams ? data
      : data?.group?.teams ? data.group
        : Array.isArray(data) && data[0]?.teams ? data[0]
          : data?.data?.teams ? data.data
            : null;

  const list = groupObj?.teams ?? [];
  const map = {};
  list.forEach((t) => {
    const teamId = t.team_id ?? t.id;
    if (teamId != null) map[String(teamId)] = t;
  });
  return map;
};

// carga TODOS los grupos desde GET /get/groups (bulk, igual que /get/teams)
// y arma de una vez el mapa de estadísticas por letra de grupo. Este
// endpoint bulk es confiable; el endpoint por letra (/get/group/?name=)
// resultó no serlo en este servidor, así que se deja solo como respaldo.
const loadAllGroups = async () => {
  try {
    const data = await apiFetch(`${API_BASE}/get/groups`);
    const rawGroups = normalizeGroupsList(data);

    rawGroups.forEach((g) => {
      const letter = g.group ?? g.name ?? g.group_name ?? g.letter;
      if (!letter) return;
      state.groupStandingsCache[letter] = normalizeGroupStandings(g);
    });

    cache.saveGroups(state.groupStandingsCache);
    console.log(`[GROUPS] ${rawGroups.length} grupos cargados.`);
  } catch (err) {
    if (err.name === "AuthError") return;
    console.warn("[GROUPS] API no disponible, intentando usar localStorage:", err.message);
    const backup = cache.loadGroups();
    if (backup) state.groupStandingsCache = backup;
  }
};

// devuelve las estadísticas de un grupo desde la caché ya cargada; si por
// alguna razón no están (grupo nuevo, caché vacía), intenta la petición
// individual como último recurso
const getGroupStandings = async (groupLetter) => {
  if (!groupLetter || groupLetter === "—") return null;
  if (state.groupStandingsCache[groupLetter]) return state.groupStandingsCache[groupLetter];

  try {
    const raw = await apiFetchWithRetry(`${API_BASE}/get/group/?name=${encodeURIComponent(groupLetter)}`);
    const map = normalizeGroupStandings(raw);
    state.groupStandingsCache[groupLetter] = map;
    return map;
  } catch (err) {
    console.warn(`[STANDINGS] No se pudo cargar la tabla del grupo ${groupLetter}:`, err.message);
    return null;
  }
};

/* ============================== SEARCH ================================ */

const normalizeText = (str) =>
  (str ?? "").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const search = {
  // construye automáticamente el índice de búsqueda a partir de allTeams,
  // precomputando los campos normalizados una sola vez (evita recalcular
  // la normalización en cada tecla presionada)
  buildIndex(teams) {
    state.searchIndex = teams.map((team) => ({
      team,
      es: normalizeText(ES_DISPLAY[team.fifa_code] ?? team.name_es),
      en: normalizeText(team.name_en ?? team.name),
      code: (team.fifa_code ?? "").toLowerCase(),
      conf: (team.confederation ?? "").toLowerCase(),
      group: (team.groups ?? team.group ?? "").toLowerCase(),
    }));
  },

  // filtra el índice local por español, inglés, código FIFA, confederación o grupo
  filterLocal(query) {
    const norm = normalizeText(query);
    return state.searchIndex
      .filter(
        (entry) =>
          entry.es.includes(norm) ||
          entry.en.includes(norm) ||
          entry.code.startsWith(norm) ||
          entry.conf.includes(norm) ||
          entry.group === norm
      )
      .map((entry) => entry.team);
  },

  sortedBySpanishName(teams) {
    return [...teams].sort((a, b) =>
      ui.getDisplayName(a).localeCompare(ui.getDisplayName(b), "es")
    );
  },
};

const debounce = (fn, delay) => {
  let timerId = null;
  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), delay);
  };
};

// PARTE DEL LABORATORIO: Control de Condiciones de Carrera con AbortController
// Cada llamada cancela la anterior con .abort() antes de lanzar la nueva petición.
const searchTeams = async (query) => {
  const input = document.getElementById("search-input");

  if (state.activeController) state.activeController.abort();
  state.activeController = new AbortController();
  const { signal } = state.activeController;

  if (state.allTeams.length === 0) {
    ui.setFeedback("El catálogo no está disponible. Recarga la página.", true);
    return;
  }

  // sin texto: mostrar todos los equipos ordenados en español
  if (!query.trim()) {
    ui.renderSuggestions(search.sortedBySpanishName(state.allTeams));
    input.setAttribute("aria-expanded", "true");
    ui.setFeedback("");
    return;
  }

  // filtrar localmente primero (instantáneo) para no dejar al usuario sin
  // resultados mientras la API responde
  const localResults = search.filterLocal(query);
  if (localResults.length === 0) {
    document.getElementById("suggestions-list").innerHTML = "";
    input.setAttribute("aria-expanded", "false");
    ui.setFeedback("No se encontraron selecciones con ese nombre.", true);
    return;
  }
  ui.setFeedback("");
  ui.renderSuggestions(localResults.slice(0, 48));
  input.setAttribute("aria-expanded", "true");

  try {
    const apiResults = await fetchTeamsByName(query, signal);
    const norm = normalizeText(query);
    const enriched = apiResults.filter((t) => {
      const es = normalizeText(ES_DISPLAY[t.fifa_code] ?? t.name_es);
      const en = normalizeText(t.name_en ?? t.name);
      const code = (t.fifa_code ?? "").toLowerCase();
      return es.includes(norm) || en.includes(norm) || code.startsWith(norm);
    });

    if (enriched.length > 0) {
      ui.setFeedback("");
      ui.renderSuggestions(enriched.slice(0, 48));
      input.setAttribute("aria-expanded", "true");
    }
  } catch (err) {
    if (err.name === "AbortError") {
      console.log("[DEBUG] Petición cancelada intencionalmente por AbortController — no es un error.");
      return;
    }
    if (err.name === "AuthError") return;
    console.warn("[SEARCH] API no disponible, se mantiene el resultado local.");
  }
};

/* ================================ UI =================================== */

const ui = {
  getDisplayName(team) {
    if (team.fifa_code && ES_DISPLAY[team.fifa_code]) return ES_DISPLAY[team.fifa_code];
    return team.name_es ?? team.name_en ?? team.name ?? "—";
  },

  // la API entrega la URL de la bandera directamente en team.flag
  getFlagUrl(team) {
    return team.flag || null;
  },

  setFeedback(msg, isError = false) {
    const el = document.getElementById("search-feedback");
    el.textContent = msg;
    el.className = `search-feedback mt-1 small${isError ? " search-feedback--error" : ""}`;
  },

  // pantalla de inicio de sesión (login inicial, obligatorio al cargar)
  showLoginScreen() {
    const screen = document.getElementById("login-screen");
    screen.classList.add("is-visible");
    screen.setAttribute("aria-hidden", "false");
    document.getElementById("login-email").focus();
  },

  hideLoginScreen() {
    const screen = document.getElementById("login-screen");
    screen.classList.remove("is-visible");
    screen.setAttribute("aria-hidden", "true");
    document.getElementById("search-input").focus();
  },

  // modal de re-autenticación (se dispara ante un 401 en plena sesión)
  showAuthModal() {
    const modal = document.getElementById("auth-modal");
    modal.classList.add("is-visible");
    modal.setAttribute("aria-hidden", "false");
    document.getElementById("modal-email").focus();
  },

  hideAuthModal() {
    const modal = document.getElementById("auth-modal");
    modal.classList.remove("is-visible");
    modal.setAttribute("aria-hidden", "true");
    document.getElementById("search-input").focus();
  },

  renderSuggestions(teams) {
    const dropdown = document.getElementById("suggestions-list");
    dropdown.innerHTML = "";

    teams.forEach((team) => {
      const name = ui.getDisplayName(team);
      const group = team.groups ?? team.group ?? "";

      const li = document.createElement("li");
      li.className = "suggestion-item";
      li.setAttribute("role", "option");
      li.tabIndex = 0;
      li.setAttribute("aria-label", name);

      li.appendChild(ui.buildFlagNode(team, "suggestion-item__flag"));

      const nameSpan = document.createElement("span");
      nameSpan.className = "suggestion-item__name";
      nameSpan.textContent = name;

      const groupSpan = document.createElement("span");
      groupSpan.className = "suggestion-item__group";
      groupSpan.textContent = group ? `Grupo ${group}` : "";

      li.appendChild(nameSpan);
      li.appendChild(groupSpan);

      const doSelect = () => ui.selectTeam({ ...team, _name: name });
      li.addEventListener("click", doSelect);
      li.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          doSelect();
        }
      });

      dropdown.appendChild(li);
    });
  },

  // crea un nodo visual de bandera: <img> si team.flag existe, emoji de
  // respaldo si no (por ejemplo mientras se usa la caché offline).
  // El tamaño se fija inline porque styles.css solo define dimensiones
  // de imagen para .team-card__flag-img (no se puede tocar el CSS).
  buildFlagNode(team, className, sizePx = 22) {
    const flagUrl = ui.getFlagUrl(team);
    if (flagUrl) {
      const img = document.createElement("img");
      img.src = flagUrl;
      img.alt = `Bandera de ${ui.getDisplayName(team)}`;
      img.loading = "lazy";
      img.className = className;
      img.style.width = `${sizePx}px`;
      img.style.height = "auto";
      img.style.borderRadius = "3px";
      img.style.objectFit = "cover";
      img.style.flexShrink = "0";
      img.onerror = () => {
        img.replaceWith(ui.buildFlagFallback(className));
      };
      return img;
    }
    return ui.buildFlagFallback(className);
  },

  buildFlagFallback(className) {
    const span = document.createElement("span");
    span.className = className;
    span.setAttribute("aria-hidden", "true");
    span.textContent = "🏳️";
    return span;
  },

  selectTeam(team) {
    if (state.selectedTeams.length >= 2) {
      ui.setFeedback("Ya hay 2 equipos. Quita uno antes de añadir otro.", true);
      return;
    }

    const duplicate = state.selectedTeams.some(
      (t) => (t.id ?? t._id ?? t.name_en) === (team.id ?? team._id ?? team.name_en)
    );
    if (duplicate) {
      ui.setFeedback("Ese equipo ya está seleccionado.", true);
      return;
    }

    state.selectedTeams.push(team);
    document.getElementById("suggestions-list").innerHTML = "";
    document.getElementById("search-input").value = "";
    document.getElementById("search-input").setAttribute("aria-expanded", "false");
    ui.setFeedback("");

    ui.renderChips();
    if (state.selectedTeams.length === 2) loadComparison();
  },

  renderChips() {
    const chipsEl = document.getElementById("selected-chips");
    chipsEl.innerHTML = "";

    state.selectedTeams.forEach((team, i) => {
      const name = team._name ?? ui.getDisplayName(team);

      const chip = document.createElement("div");
      chip.className = "chip";

      chip.appendChild(ui.buildFlagNode(team, "chip__flag"));

      const nameSpan = document.createElement("span");
      nameSpan.textContent = name;

      const removeBtn = document.createElement("button");
      removeBtn.className = "chip__remove";
      removeBtn.setAttribute("aria-label", `Quitar ${name}`);
      removeBtn.textContent = "✕";
      removeBtn.addEventListener("click", () => {
        state.selectedTeams.splice(i, 1);
        document.getElementById("comparison-container").innerHTML = "";
        ui.setFeedback("");
        ui.renderChips();
      });

      chip.appendChild(nameSpan);
      chip.appendChild(removeBtn);
      chipsEl.appendChild(chip);
    });
  },

  skeletonHTML() {
    return `
      <div class="skeleton" style="height:2rem;width:50%;margin-bottom:1rem"></div>
      <div class="skeleton" style="height:.85rem;width:30%"></div>
      <div class="skeleton" style="height:.85rem;margin-top:.5rem"></div>
      <div class="skeleton" style="height:.85rem;width:75%"></div>
      <div class="skeleton" style="height:.85rem;width:60%"></div>
      <div class="skeleton" style="height:.85rem;width:85%"></div>
    `;
  },

  buildTeamCard(team = {}) {
    const name = team._name || ui.getDisplayName(team) || "Selección";
    const group = team.groups ?? team.group ?? "—";

    const allStats = {
      "Código FIFA": team.fifa_code || "—",
      Grupo: group !== "—" ? `Grupo ${group}` : "—",
      Puntos: team.pts ?? "—",
      "Goles a favor": team.gf ?? "—",
      "Goles en contra": team.ga ?? "—",
    };

    const rows = Object.entries(allStats)
      .map(
        ([key, value]) => `
        <tr>
          <td>${key}</td>
          <td>${value ?? "—"}</td>
        </tr>`
      )
      .join("");

    const col = document.createElement("div");
    col.className = "col-12 col-md-6";

    const card = document.createElement("article");
    card.className = "team-card";
    card.setAttribute("aria-label", `Datos del equipo ${name}`);

    const header = document.createElement("header");
    header.className = "team-card__header";
    header.appendChild(ui.buildFlagNode(team, "team-card__flag-img", 36));

    const infoDiv = document.createElement("div");
    const nameDiv = document.createElement("div");
    nameDiv.className = "team-card__name";
    nameDiv.textContent = name;
    const groupDiv = document.createElement("div");
    groupDiv.className = "team-card__group";
    groupDiv.textContent = group !== "—" ? `Grupo ${group}` : "";
    infoDiv.appendChild(nameDiv);
    infoDiv.appendChild(groupDiv);
    header.appendChild(infoDiv);

    const table = document.createElement("table");
    table.className = "team-stats";
    table.setAttribute("aria-label", `Estadísticas de ${name}`);
    table.innerHTML = `<tbody>${rows}</tbody>`;

    card.appendChild(header);
    card.appendChild(table);

    if (team._liveDataUnavailable) {
      const notice = document.createElement("p");
      notice.className = "text-secondary small mt-2 mb-0";
      notice.textContent = "⚠️ No se pudieron obtener puntos/goles en vivo del servidor; el resto de los datos del equipo sí están disponibles.";
      card.appendChild(notice);
    }

    col.appendChild(card);

    return col;
  },

  setupFontSize() {
    const html = document.documentElement;
    const savedSize = localStorage.getItem(STORAGE_KEYS.fontSize) || "font-size-a";
    html.className = savedSize;

    const setSize = (sizeClass) => {
      html.className = sizeClass;
      localStorage.setItem(STORAGE_KEYS.fontSize, sizeClass);
    };

    const btnA = document.getElementById("btn-font-a");
    const btnAA = document.getElementById("btn-font-aa");
    const btnAAA = document.getElementById("btn-font-aaa");

    if (btnA) btnA.addEventListener("click", () => setSize("font-size-a"));
    if (btnAA) btnAA.addEventListener("click", () => setSize("font-size-aa"));
    if (btnAAA) btnAAA.addEventListener("click", () => setSize("font-size-aaa"));
  },
};

/* PARTE DEL LABORATORIO: Peticiones en Paralelo con Promise.all */
const loadComparison = async () => {
  if (state.selectedTeams.length < 2) return;

  const container = document.getElementById("comparison-container");
  container.innerHTML = `
    <div class="col-12 col-md-6"><div class="team-card" aria-busy="true">${ui.skeletonHTML()}</div></div>
    <div class="col-12 col-md-6"><div class="team-card" aria-busy="true">${ui.skeletonHTML()}</div></div>
  `;

  if (state.activeController) state.activeController.abort();
  state.activeController = new AbortController();

  // el equipo ya viene enriquecido desde allTeams/búsqueda: nombre, bandera,
  // código FIFA y grupo. Solo falta pedir pts/gf/ga a /get/group.
  let detailA = enrichTeamData(state.selectedTeams[0]);
  let detailB = enrichTeamData(state.selectedTeams[1]);

  try {
    const [standingsA, standingsB] = await Promise.all([
      getGroupStandings(detailA.groups),
      getGroupStandings(detailB.groups),
    ]);

    const rowA = standingsA?.[String(detailA.id ?? detailA._id)];
    const rowB = standingsB?.[String(detailB.id ?? detailB._id)];

    if (rowA) detailA = { ...detailA, pts: rowA.pts, gf: rowA.gf, ga: rowA.ga };
    else detailA._liveDataUnavailable = true;

    if (rowB) detailB = { ...detailB, pts: rowB.pts, gf: rowB.gf, ga: rowB.ga };
    else detailB._liveDataUnavailable = true;

    container.innerHTML = "";
    container.appendChild(ui.buildTeamCard(detailA));
    container.appendChild(ui.buildTeamCard(detailB));
  } catch (err) {
    if (err.name === "AuthError") return;
    if (err.name === "AbortError") {
      console.log("[DEBUG] Petición cancelada.");
      return;
    }
    detailA._liveDataUnavailable = true;
    detailB._liveDataUnavailable = true;
    container.innerHTML = "";
    container.appendChild(ui.buildTeamCard(detailA));
    container.appendChild(ui.buildTeamCard(detailB));
  }
};

/* ================================ INIT ================================= */

const init = async () => {
  ui.setupFontSize();

  // los listeners del buscador se registran de una vez; no representan
  // ningún riesgo porque la pantalla de login (#login-screen) cubre toda
  // la interfaz y bloquea la interacción hasta que el usuario se autentique
  const input = document.getElementById("search-input");
  const debouncedSearch = debounce(searchTeams, 300);

  input.addEventListener("input", (e) => debouncedSearch(e.target.value));

  input.addEventListener("focus", () => {
    if (state.allTeams.length > 0) searchTeams(input.value);
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

  // PARTE DEL LABORATORIO: inicio de sesión — la app ya no se autentica
  // sola con credenciales por defecto al cargar; espera a que el usuario
  // las escriba en la pantalla de login y las envíe.
  ui.showLoginScreen();

  const loginBtn = document.getElementById("login-submit");
  const doLogin = async () => {
    const email = document.getElementById("login-email").value.trim();
    const pass = document.getElementById("login-pass").value.trim();
    const errorEl = document.getElementById("login-error");

    if (!email || !pass) {
      errorEl.textContent = "Completa los dos campos.";
      return;
    }

    errorEl.textContent = "";
    loginBtn.textContent = "Ingresando...";
    loginBtn.disabled = true;

    await authenticate(email, pass);
    await Promise.all([loadAllTeams(), loadAllGroups()]);

    loginBtn.textContent = "Ingresar";
    loginBtn.disabled = false;
    ui.hideLoginScreen();
  };

  loginBtn.addEventListener("click", doLogin);
  ["login-email", "login-pass"].forEach((id) => {
    document.getElementById(id).addEventListener("keydown", (e) => {
      if (e.key === "Enter") doLogin();
    });
  });

  // modal de re-autenticación — se dispara si el token queda inválido
  // (401) durante la sesión ya iniciada
  const modalBtn = document.getElementById("modal-submit");
  modalBtn.addEventListener("click", async () => {
    const email = document.getElementById("modal-email").value.trim();
    const pass = document.getElementById("modal-pass").value.trim();
    const errorEl = document.getElementById("modal-error");

    if (!email || !pass) {
      errorEl.textContent = "Completa los dos campos.";
      return;
    }

    errorEl.textContent = "";
    modalBtn.textContent = "Ingresando...";
    modalBtn.disabled = true;

    await authenticate(email, pass);
    await Promise.all([loadAllTeams(), loadAllGroups()]);

    modalBtn.textContent = "Volver a ingresar";
    modalBtn.disabled = false;
    ui.hideAuthModal();

    if (state.selectedTeams.length === 2) loadComparison();
  });

  ["modal-email", "modal-pass"].forEach((id) => {
    document.getElementById(id).addEventListener("keydown", (e) => {
      if (e.key === "Enter") modalBtn.click();
    });
  });
};

init();