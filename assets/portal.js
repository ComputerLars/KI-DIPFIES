(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const COLORS = { black:"#050505", green:"#00a651", white:"#f3f6f2" };
  const ROT = [
    { bg:"black", fg:"green", btn:"white", ink:"light" },
    { bg:"black", fg:"white", btn:"green", ink:"light" },
    { bg:"green", fg:"white", btn:"black", ink:"light" },
    { bg:"white", fg:"green", btn:"black", ink:"light" },
  ];

  const KEYWORDS = [
    "summit","manifesto","protocol","dipfies","mostdipf","gipfeltreffen",
    "paletten","party","algorithm","wormhole","archive","synthetic",
  ];
  const SPRITE_HOTWORDS = [
    "dipfie","dipfies","vita","lars","vitus","mostdipf","hitler","bruckner","kepler"
  ];

  const state = {
    build:"dev",
    lang:"en",
    clicks:0,
    worlds:null,
    canonId:null,
    worldId:null,
    dayNo:null,
    cursor:0,
    chunkStack:[],
    drift:0,
    buffer:[],
    markov:null,
    corpus:null,
    scrollTopNext:false,
    roleMenu:false,
    roleOptions:[],
    speakerIndex:null,
    ghostLines:[],
    ghostLine:"",
    spriteList:[],
    spriteCooldown:0,
    nextSpriteAt:0,
    scrollMode:false,
    scrollSnapshot:null,
    timeMenu:false,
    mapMenu:false,
    mapSnapshot:null,
    keywordIndex:null,
    vector:"BOOT",
    prevWorld:null,
    prevDay:null,
    prevCursor:null,
    coldBooted:false,
    coldBootDay5:false,
    hasSaved:false,
    firstVisit:false,
  };

  const PRIMARY_WORLD_IDS = ["core","mirror","kopi"];
  const PRESENT_ERA = "2026";
  const I18N = {
    en: {
      lang_label: "LANG",
      day: "DAY",
      time: "TIME",
      drift: "DRIFT",
      vector: "VECTOR",
      unknown: "UNKNOWN",
      theory_name: "THEORY TRAGEDY",
      world_map: "WORLD MAP",
      click_node_exit: "CLICK A NODE OR EXIT.",
      no_worlds: "(no worlds available)",
      entering_day: ({ day }) => `(entering Day ${day})`,
      relinking_day: ({ day }) => `(relinking Day ${day})`,
      end_day: ({ day }) => `(end of Day ${day})`,
      day_end_shift: ({ day }) => `DAY ${day} END. SHIFT WORLD?`,
      world_shift: "(world shift)",
      data_link_lost: "(data link lost)",
      data_link_question: "DATA LINK LOST.",
      silence: "(silence)",
      scroll_heading: ({ day }) => `(DAY ${day} — FULL SCROLL)`,
      scroll_mode: "SCROLL MODE.",
      role_gate: "ROLE GATE: SELECT CHARACTER.",
      more_names: "MORE NAMES",
      exit: "Exit",
      map_question: "WORLD MAP: CLICK NODE OR EXIT.",
      time_jump_question: "TIME JUMP: SELECT YEAR.",
      return_2026: "Return 2026",
      reload: "Reload",
      forward_time: "Forward in time",
      back_time: "Back in time",
      next_day: "Next Day",
      prev_day: "Prev Day",
      shift_world: "Shift World",
      role: "Role",
      wormhole: "Wormhole",
      hackle: "Hackle",
      hackle_return: "Hackle the return",
      map: "Map",
      time_jump: "Time Jump",
      collect_day: "Collect a Day",
      exit_scroll: "Exit Scroll",
      next_world: "Next World",
      prev_world: "Prev World",
      choose_vector: "CHOOSE A VECTOR.",
      cold_boot: "[COLD BOOT]",
      memory_reset: "MEMORY VECTOR RESET",
      linking_worldlines: "LINKING WORLDLINES...",
      ready: "READY.",
      boot_failed: "Boot failed.",
      boot_failed_question: "Boot failed. Missing JSON or wrong publishing root.",
      gate_opens: ({ word }) => `(${word} gate opens)`,
      corridor_opens: ({ name }) => `(${name} corridor opens)`,
      shift_prompt: ">> SHIFT WORLD?",
    },
    de: {
      lang_label: "SPRACHE",
      day: "TAG",
      time: "ZEIT",
      drift: "DRIFT",
      vector: "VEKTOR",
      unknown: "UNBEKANNT",
      theory_name: "THEORIE TRAGÖDIE",
      world_map: "WELTENKARTE",
      click_node_exit: "KNOTEN KLICKEN ODER EXIT.",
      no_worlds: "(KEINE WELTEN VERFÜGBAR)",
      entering_day: ({ day }) => `(betrete Tag ${day})`,
      relinking_day: ({ day }) => `(verknüpfe Tag ${day})`,
      end_day: ({ day }) => `(Ende von Tag ${day})`,
      day_end_shift: ({ day }) => `TAG ${day} ENDE. WELT WECHSELN?`,
      world_shift: "(WELTWECHSEL)",
      data_link_lost: "(DATENLINK VERLOREN)",
      data_link_question: "DATENLINK VERLOREN.",
      silence: "(STILLE)",
      scroll_heading: ({ day }) => `(TAG ${day} — VOLLER SCROLL)`,
      scroll_mode: "SCROLL MODUS.",
      role_gate: "ROLLEN-GATE: FIGUR WÄHLEN.",
      more_names: "MEHR NAMEN",
      exit: "Exit",
      map_question: "WELTENKARTE: KNOTEN KLICKEN ODER EXIT.",
      time_jump_question: "ZEITSPRUNG: JAHR WÄHLEN.",
      return_2026: "Zurück 2026",
      reload: "Neu laden",
      forward_time: "Vorwärts in der Zeit",
      back_time: "Zurück in der Zeit",
      next_day: "Nächster Tag",
      prev_day: "Voriger Tag",
      shift_world: "Welt wechseln",
      role: "Rolle",
      wormhole: "Wurmloch",
      hackle: "Hackle",
      hackle_return: "Hackle die Rückkehr",
      map: "Karte",
      time_jump: "Zeitsprung",
      collect_day: "Tag sammeln",
      exit_scroll: "Scroll verlassen",
      next_world: "Nächste Welt",
      prev_world: "Vorige Welt",
      choose_vector: "VEKTOR WÄHLEN.",
      cold_boot: "[KALTSTART]",
      memory_reset: "SPEICHERVEKTOR RESET",
      linking_worldlines: "WELTLINIEN VERKNÜPFEN...",
      ready: "BEREIT.",
      boot_failed: "Start fehlgeschlagen.",
      boot_failed_question: "Start fehlgeschlagen. JSON fehlt oder falsches Publish-Root.",
      gate_opens: ({ word }) => `(${word} Gate öffnet)`,
      corridor_opens: ({ name }) => `(${name} Korridor öffnet)`,
      shift_prompt: ">> WELT WECHSELN?",
    },
  };
  const VECTOR_LABELS = {
    en: {
      FLOW:"FLOW", BACK:"BACK", NEXT:"NEXT", LOOP:"LOOP", ROLE:"ROLE",
      WORMHOLE:"WORMHOLE", HACKLE:"HACKLE", JUMP:"JUMP", MAP:"MAP",
      SCROLL:"SCROLL", SHIFT:"SHIFT", GATE:"GATE", BOOT:"BOOT",
    },
    de: {
      FLOW:"FLUSS", BACK:"ZURUECK", NEXT:"VOR", LOOP:"SCHLEIFE", ROLE:"ROLLE",
      WORMHOLE:"WURMLOCH", HACKLE:"HACKLE", JUMP:"SPRUNG", MAP:"KARTE",
      SCROLL:"SCROLL", SHIFT:"WECHSEL", GATE:"GATE", BOOT:"BOOT",
    },
  };
  const t = (key, vars) => {
    const dict = I18N[state.lang] || I18N.en;
    const val = dict[key] ?? I18N.en[key];
    if(typeof val === "function") return val(vars || {});
    return val ?? key;
  };
  const vLabel = (vec) => {
    const dict = VECTOR_LABELS[state.lang] || VECTOR_LABELS.en;
    return dict[vec] || vec;
  };

  const TOK_RE = /[A-Za-zÀ-ÖØ-öø-ÿ0-9]+(?:['’][A-Za-zÀ-ÖØ-öø-ÿ0-9]+)?|[.,!?;:()]/g;
  const safeText = (x) => (x ?? "").toString();
  const plainText = (html) => {
    const s = safeText(html);
    return s
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, "\"")
      .replace(/&#39;/g, "'");
  };
  const looksHtml = (s) => /<\/?[a-z][\s\S]*>/i.test(s);
  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  const escapeHTML = (s) => safeText(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const shorten = (s, n=28) => {
    const t = safeText(s);
    return t.length > n ? `${t.slice(0, n-1).trim()}…` : t;
  };
  const normalizeWS = (s) => safeText(s).replace(/\s+/g, " ").trim();
  const splitHtmlAtPlainIndex = (html, idx) => {
    const s = safeText(html);
    let plainCount = 0;
    let i = 0;
    while(i < s.length){
      const ch = s[i];
      if(ch === "<"){
        const close = s.indexOf(">", i);
        if(close === -1) break;
        i = close + 1;
        continue;
      }
      if(ch === "&"){
        const semi = s.indexOf(";", i);
        if(semi !== -1){
          plainCount += 1;
          i = semi + 1;
          if(plainCount >= idx) break;
          continue;
        }
      }
      plainCount += 1;
      i += 1;
      if(plainCount >= idx) break;
    }
    return [s.slice(0, i), s.slice(i)];
  };
  const formatInline = (s) => {
    let esc = escapeHTML(s);
    const boldCount = (esc.match(/\*\*/g) || []).length;
    const underlineCount = (esc.match(/\+\+/g) || []).length;
    const underscoreCount = (esc.match(/_/g) || []).length;
    if(boldCount % 2) esc = esc.replace(/\*\*/g, "");
    if(underlineCount % 2) esc = esc.replace(/\+\+/g, "");
    if(underscoreCount % 2) esc = esc.replace(/_/g, "");
    esc = esc.replace(/\+\+([\s\S]+?)\+\+/g, "<u>$1</u>");
    esc = esc.replace(/\*\*([\s\S]+?)\*\*/g, "<strong>$1</strong>");
    esc = esc.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>");
    esc = esc.replace(/(^|[^\\w])_([\\s\\S]+?)_(?=[^\\w]|$)/g, "$1<em>$2</em>");
    return esc;
  };

  function markKeywords(s){
    let out = s;
    for(const kw of KEYWORDS){
      const re = new RegExp(`\\\\b(${kw})\\\\b`, "gi");
      out = out.replace(re, "§§$1§§");
    }
    return out;
  }

  function renderText(raw){
    const text = safeText(raw);
    if(looksHtml(text)) return text;
    const marked = markKeywords(text);
    let html = formatInline(marked);
    html = html.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
    html = html.replace(/\n/g, "<br>");
    return html.replace(/§§([^§]+)§§/g, `<span class="kw" data-kw="$1">$1</span>`);
  }

  function tokenize(s){ return (safeText(s).match(TOK_RE) || []); }
  function detok(tokens){
    let out = "";
    for(const t of tokens){
      if(/[.,!?;:)]/.test(t)) out = out.replace(/\s+$/,"") + t + " ";
      else if(t === "(") out += "(";
      else out += t + " ";
    }
    return out.trim().replace(/\s+\)/g,")");
  }
  function buildMarkov(lines){
    const next = new Map(); const starts = [];
    for(const ln of lines){
      const toks = tokenize(ln);
      if(toks.length < 2) continue;
      starts.push(toks[0]);
      for(let i=0;i<toks.length-1;i++){
        const k=toks[i], v=toks[i+1];
        if(!next.has(k)) next.set(k, []);
        next.get(k).push(v);
      }
    }
    return { next, starts };
  }
  function generate(chain, seedText, maxTokens){
    if(!chain || !chain.starts.length) return "";
    const seed = tokenize(seedText);
    let w = seed.length ? seed[seed.length-1] : chain.starts[Math.floor(Math.random()*chain.starts.length)];
    const out = [w];
    for(let i=0;i<maxTokens-1;i++){
      const arr = chain.next.get(w);
      if(!arr || !arr.length){
        w = chain.starts[Math.floor(Math.random()*chain.starts.length)];
        out.push(w);
        continue;
      }
      w = arr[Math.floor(Math.random()*arr.length)];
      out.push(w);
    }
    return detok(out);
  }

  function classifyLine(t){
    const s = plainText(t).trim();
    if(!s) return { kind:"empty", spk:"", txt:"" };
    const m = s.match(/^([^:]{2,60}):\s*(.*)$/);
    if(m){
      const rawName = m[1].trim();
      if(/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(rawName)){
        const clean = rawName.replace(/\+\+|\*\*|_/g,"").replace(/\*/g,"").trim();
        return { kind:"speaker", spk: clean || rawName, txt: m[2], spkEnd: m[1].length + 1 };
      }
    }
    if(s.startsWith("(") && s.endsWith(")")) return { kind:"stage", spk:"", txt:s };
    return { kind:"text", spk:"", txt:s };
  }

  async function fetchJSON(path){
    const sep = path.includes("?") ? "&" : "?";
    const url = `${path}${sep}v=${encodeURIComponent(state.build)}`;
    const r = await fetch(url, { cache:"no-store" });
    if(!r.ok) throw new Error(`Fetch failed ${path}: ${r.status}`);
    return await r.json();
  }
  async function bootBuildStamp(){
    try{ const b = await fetch("data/build.json",{cache:"no-store"}).then(r=>r.json()); state.build=b.build||"dev"; }
    catch{ state.build="dev"; }
  }
  function detectLang(){
    try{
      const saved = localStorage.getItem("ki_lang");
      if(saved === "en" || saved === "de") return saved;
    }catch{}
    const nav = (navigator.language || "").toLowerCase();
    return nav.startsWith("de") ? "de" : "en";
  }
  function updateLangUI(){
    const box = $("#lang");
    if(!box) return;
    const label = box.querySelector(".lang-label");
    if(label) label.textContent = t("lang_label");
    box.querySelectorAll(".lang-option").forEach(el => {
      el.classList.toggle("active", el.dataset.lang === state.lang);
    });
  }
  async function loadWorldsForLang(lang){
    const file = (lang === "de") ? "data/drama_worlds.de.json" : "data/drama_worlds.json";
    try{
      return await fetchJSON(file);
    }catch(err){
      if(lang !== "en"){
        console.warn("Language load failed, falling back to EN.", err);
        state.lang = "en";
        try{ localStorage.setItem("ki_lang", "en"); }catch{}
        updateLangUI();
        return await fetchJSON("data/drama_worlds.json");
      }
      throw err;
    }
  }
  function rebuildMarkov(){
    const canon = getWorldById(state.canonId);
    const dramaLines = [];
    (canon?.days || []).forEach(d => (d.blocks || []).slice(0, 2200).forEach(b => dramaLines.push(plainText(b))));
    const ghost = (state.ghostLines || []).slice(0, 3600);
    const mix = (state.corpus?.lines || []).slice(0, 3000)
      .concat(dramaLines.slice(0, 2400))
      .concat(ghost);
    state.markov = buildMarkov(mix.length ? mix : dramaLines);
  }
  async function switchLanguage(lang){
    if(!lang || lang === state.lang) return;
    state.lang = (lang === "de") ? "de" : "en";
    try{ localStorage.setItem("ki_lang", state.lang); }catch{}
    document.documentElement.lang = state.lang;
    updateLangUI();
    state.worlds = await loadWorldsForLang(state.lang);
    const worlds = state.worlds?.worlds || [];
    state.canonId = state.worlds?.canonical || (worlds[0]?.id || null);
    const prevWorld = state.worldId;
    if(prevWorld && hasWorld(prevWorld)) state.worldId = prevWorld;
    else state.worldId = state.canonId || (worlds[0]?.id || null);
    const w = ensurePlayableWorld() || getWorldById(state.worldId);
    const days = allDayNos(w);
    state.dayNo = (state.dayNo && days.includes(state.dayNo)) ? state.dayNo : (days[0] || 1);
    state.cursor = 0;
    state.buffer = [];
    state.chunkStack = [];
    state.scrollMode = false;
    state.scrollSnapshot = null;
    state.timeMenu = false;
    state.mapMenu = false;
    state.mapSnapshot = null;
    state.roleMenu = false;
    state.scrollTopNext = true;
    state.speakerIndex = buildSpeakerIndex();
    state.keywordIndex = buildKeywordIndex();
    rebuildMarkov();
    if(!state.buffer.length){
      state.buffer = [{ text:t("entering_day", { day: getDay(w,state.dayNo)?.day || state.dayNo }), hackled:false }];
      appendChunk({hackle:false});
    }
    render();
    persist();
  }

  function playableWorlds(){
    const worlds = state.worlds?.worlds || [];
    return worlds.filter(w => (w.days || []).length);
  }
  function primaryWorlds(){
    const playable = playableWorlds();
    const pick = playable.filter(w => PRIMARY_WORLD_IDS.includes(w.id));
    return pick.length ? pick : playable.filter(w => w.id !== "theory-tragedy");
  }
  function hasWorld(id){
    return playableWorlds().some(w => w.id === id);
  }
  function worldEra(world){
    if(world?.era) return String(world.era);
    const id = world?.id || "";
    const m = id.match(/\b(19|20)\d{2}\b/);
    if(m) return m[0];
    if(PRIMARY_WORLD_IDS.includes(id)) return PRESENT_ERA;
    return null;
  }
  function eraGroups(){
    const map = new Map();
    for(const w of playableWorlds()){
      const era = worldEra(w);
      if(!era) continue;
      if(w.id === "theory-tragedy") continue;
      if(!map.has(era)) map.set(era, []);
      map.get(era).push(w);
    }
    return map;
  }
  function randomizeStart(era){
    const groups = eraGroups();
    let list = (groups.get(era) || []).slice();
    if(!list.length){
      list = primaryWorlds();
    }
    if(!list.length) return false;
    const world = list[Math.floor(Math.random() * list.length)];
    const days = allDayNos(world);
    if(!days.length) return false;
    state.worldId = world.id;
    state.dayNo = days[Math.floor(Math.random() * days.length)];
    state.cursor = 0;
    state.chunkStack = [];
    state.scrollMode = false;
    state.scrollSnapshot = null;
    state.roleMenu = false;
    state.timeMenu = false;
    state.scrollTopNext = true;
    localStorage.setItem("ki_world", state.worldId || "");
    return true;
  }
  function erasForTimeMenu(){
    const groups = eraGroups();
    const eras = Array.from(groups.keys()).filter(e => e !== PRESENT_ERA);
    eras.sort();
    return eras.map(e => ({ era: e, worlds: groups.get(e) || [] }));
  }
  function pickEraWorld(era){
    const groups = eraGroups();
    const list = (groups.get(era) || []).slice();
    if(!list.length) return null;
    return list[Math.floor(Math.random() * list.length)];
  }
  function timeJumpToEra(era){
    const target = pickEraWorld(era);
    if(!target) return false;
    const currentEra = worldEra(getWorldById(state.worldId)) || PRESENT_ERA;
    if(currentEra === PRESENT_ERA && era !== PRESENT_ERA){
      state.prevWorld = state.worldId;
      state.prevDay = state.dayNo;
      state.prevCursor = state.cursor;
    }
    state.worldId = target.id;
    const days = allDayNos(target);
    state.dayNo = days[0] || 1;
    state.cursor = 0;
    state.buffer = [{ text:`(time jump: ${era})`, hackled:false }];
    state.chunkStack = [];
    state.scrollMode = false;
    state.scrollSnapshot = null;
    state.scrollTopNext = true;
    return true;
  }
  function returnFromFuture(){
    const currentEra = worldEra(getWorldById(state.worldId)) || PRESENT_ERA;
    if(currentEra === PRESENT_ERA) return false;
    const target = getWorldById(state.prevWorld || state.canonId) || pickEraWorld(PRESENT_ERA);
    if(!target) return false;
    state.worldId = target.id;
    const days = allDayNos(target);
    const day = (state.prevDay && days.includes(state.prevDay)) ? state.prevDay : (days[0] || 1);
    state.dayNo = day;
    state.cursor = state.prevCursor || 0;
    state.buffer = [{ text:`(returning from ${currentEra})`, hackled:false }];
    state.chunkStack = [];
    state.scrollMode = false;
    state.scrollSnapshot = null;
    state.scrollTopNext = true;
    state.prevWorld = null;
    state.prevDay = null;
    state.prevCursor = null;
    return true;
  }
  function cycleWorld(delta){
    const current = getWorldById(state.worldId);
    const era = worldEra(current) || PRESENT_ERA;
    const groups = eraGroups();
    const list = groups.get(era) || primaryWorlds();
    if(!list.length) return null;
    const idx = Math.max(0, list.findIndex(w => w.id === state.worldId));
    const next = list[(idx + delta + list.length) % list.length];
    state.worldId = next.id;
    localStorage.setItem("ki_world", state.worldId || "");
    return next;
  }
  function getWorldById(id){
    const worlds = state.worlds?.worlds || [];
    const found = worlds.find(w => w.id === id) || null;
    if(found && (found.days || []).length) return found;
    const playable = playableWorlds();
    if(playable.length) return playable[0];
    return found || worlds[0] || null;
  }
  function ensurePlayableWorld(){
    const playable = playableWorlds();
    if(!playable.length) return null;
    const current = playable.find(w => w.id === state.worldId);
    if(current) return current;
    const fallback = playable.find(w => w.id === state.canonId) || playable[0];
    state.worldId = fallback.id;
    return fallback;
  }
  function allDayNos(world){
    const days = world?.days || [];
    const set = new Set(days.map(d => d.day).filter(n => Number.isFinite(n)));
    return Array.from(set).sort((a,b)=>a-b);
  }
  function getDay(world, dayNo){
    if(!world) return null;
    const days = world.days || [];
    return days.find(d => d.day === dayNo) || days[0] || null;
  }

  function markovSeed(){
    const world = getWorldById(state.worldId);
    const day = getDay(world, state.dayNo);
    const blocks = day?.blocks || [];
    const pick = blocks[Math.max(0, Math.min(blocks.length-1, state.cursor-1))] || blocks[0] || "";
    return plainText(pick);
  }
  function markovEcho(seed){
    if(!state.markov) return;
    const base = seed || markovSeed() || plainText(state.buffer[state.buffer.length-1]?.text || "");
    const g = generate(state.markov, base, 22);
    if(g) state.buffer.push({ text: g, hackled:true, echo:true });
  }
  const SPRITE_PROB = {
    HACKLE: 0.38,
    WORMHOLE: 0.24,
    SHIFT: 0.32,
    JUMP: 0.30,
    BOOT: 0.50,
    KEYWORD: 0.42,
  };
  const SPRITE_HISTORY_DEPTH = 5;
  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  function pickUnique(list, count){
    if(count <= 0) return [];
    const arr = list.slice();
    for(let i = arr.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, Math.min(count, arr.length));
  }
  function maybeSprite(reason){
    if(state.clicks < 2) return;
    const list = state.spriteList || [];
    if(!list.length) return;
    const now = Date.now();
    if(now < state.spriteCooldown) return;
    const p = SPRITE_PROB[reason] ?? 0.12;
    if(Math.random() > p) return;
    spawnSpriteCluster();
    state.spriteCooldown = now + 1100;
  }
  function pickClusterCount(maxCount){
    if(!maxCount) return 1;
    if(Math.random() < 0.003) return maxCount; // ~1 in 333: full swarm
    const r = Math.random();
    if(r < 0.45) return 1;
    if(r < 0.70) return 2;
    if(r < 0.84) return 3;
    if(r < 0.92) return 4;
    if(r < 0.965) return Math.min(maxCount, 5 + randInt(0, 2)); // 5-7
    if(r < 0.985) return Math.min(maxCount, 8 + randInt(0, 4)); // 8-12
    if(r < 0.995) return Math.min(maxCount, 13 + randInt(0, 7)); // 13-20
    if(r < 0.999) return Math.min(maxCount, 21 + randInt(0, 19)); // 21-40
    return Math.min(maxCount, 41 + randInt(0, Math.max(0, maxCount - 41))); // 41+
  }
  function spawnSpriteCluster(){
    const list = state.spriteList || [];
    if(!list.length) return;
    const host = $("#sprites");
    if(!host) return;
    let total = pickClusterCount(list.length);
    if(total > 24){
      while(host.firstChild) host.removeChild(host.firstChild);
    } else {
      while(host.children.length > 10){
        host.removeChild(host.children[0]);
      }
    }
    const recentSets = state.spriteHistory || [];
    const recent = new Set();
    for(const set of recentSets){
      for(const src of set) recent.add(src);
    }
    const used = new Set(
      Array.from(host.querySelectorAll(".dipfie"))
        .map(el => el.dataset?.src)
        .filter(Boolean)
    );
    let pool = list.filter(src => !used.has(src) && !recent.has(src));
    if(pool.length === 0){
      pool = list.filter(src => !used.has(src));
    }
    total = Math.min(total, pool.length);
    if(total <= 0) return;
    const chosen = pickUnique(pool, total);
    state.spriteHistory = [...recentSets, new Set(chosen)].slice(-SPRITE_HISTORY_DEPTH);
    const waves = [];
    if(total <= 4) waves.push(total);
    else if(total <= 12){
      const a = Math.ceil(total * 0.6);
      waves.push(a, total - a);
    } else {
      const a = Math.ceil(total * 0.5);
      const b = Math.ceil(total * 0.3);
      waves.push(a, b, Math.max(0, total - a - b));
    }
    let delay = 0;
    let idx = 0;
    for(const count of waves){
      if(!count) continue;
      const centerX = 12 + Math.random() * 70;
      const centerY = 10 + Math.random() * 60;
      const sizeBase = total > 20 ? 10 : 16;
      const sizeVar = total > 20 ? 12 : 24;
      setTimeout(() => {
        const remaining = chosen.length - idx;
        const take = Math.min(count, remaining);
        if(take <= 0) return;
        for(let i=0;i<take;i++){
          const src = chosen[idx++];
          const img = new Image();
          img.src = src;
          img.dataset.src = src;
          img.alt = "";
          img.className = "dipfie";
          const size = sizeBase + Math.random() * sizeVar;
          img.style.height = `${size}vh`;
          const jitterX = (Math.random() - 0.5) * 22;
          const jitterY = (Math.random() - 0.5) * 22;
          const left = Math.max(2, Math.min(86, centerX + jitterX));
          const top = Math.max(4, Math.min(72, centerY + jitterY));
          img.style.left = `${left}%`;
          img.style.top = `${top}%`;
          img.style.transform = `rotate(${(Math.random()-0.5)*6}deg)`;
          img.style.opacity = 0.8 + Math.random() * 0.2;
          host.appendChild(img);
          const life = 2400 + Math.random() * 3200;
          setTimeout(() => img.classList.add("fadeout"), life);
          setTimeout(() => img.remove(), life + 520);
        }
      }, delay);
      delay += 140;
    }
  }
  function spriteTick(){
    if(state.clicks < 2) return;
    if(!state.spriteList || !state.spriteList.length) return;
    const now = Date.now();
    if(!state.nextSpriteAt) state.nextSpriteAt = now + 20000 + Math.random() * 25000;
    if(now < state.nextSpriteAt) return;
    spawnSpriteCluster();
    state.nextSpriteAt = now + 20000 + Math.random() * 40000;
  }
  function hasHotword(lines){
    if(!lines || !lines.length) return false;
    const rx = new RegExp(`\\b(${SPRITE_HOTWORDS.join("|")})\\b`, "i");
    return lines.some(l => rx.test(plainText(l.text || l)));
  }

  function morph(){ document.body.classList.add("morph"); setTimeout(()=>document.body.classList.remove("morph"),160); }
  function applyRotation(){
    const r = ROT[state.clicks % ROT.length];
    const bg = COLORS[r.bg], fg = COLORS[r.fg], btnbg = COLORS[r.btn];
    const btnfg = (r.btn === "black") ? COLORS.white : COLORS.black;
    const shadow = (r.fg === "black") ? "none" : `0 0 8px ${fg}`;
    document.documentElement.style.setProperty("--bg", bg);
    document.documentElement.style.setProperty("--fg", fg);
    document.documentElement.style.setProperty("--btnbg", btnbg);
    document.documentElement.style.setProperty("--btnfg", btnfg);
    document.documentElement.style.setProperty("--shadow", shadow);
    document.documentElement.style.setProperty("--border", fg);
    document.body.dataset.ink = r.ink;
  }
  function click(){
    state.clicks++;
    morph();
    applyRotation();
  }

  function persist(){
    try{
      localStorage.setItem("ki_portal_state", JSON.stringify({
        lang: state.lang, clicks: state.clicks, worldId: state.worldId, dayNo: state.dayNo, cursor: state.cursor,
        drift: state.drift, buffer: state.buffer.slice(-260),
      }));
    }catch{}
  }
  function restore(){
    try{
      const raw = localStorage.getItem("ki_portal_state"); if(!raw) return;
      state.hasSaved = true;
      const o = JSON.parse(raw);
      const langMismatch = o.lang && o.lang !== state.lang;
      if(typeof o.clicks==="number") state.clicks=o.clicks;
      if(typeof o.worldId==="string") state.worldId=o.worldId;
      if(typeof o.dayNo==="number") state.dayNo=o.dayNo;
      if(typeof o.cursor==="number") state.cursor=o.cursor;
      if(typeof o.drift==="number") state.drift=o.drift;
      if(Array.isArray(o.buffer) && !langMismatch) state.buffer=o.buffer;
    }catch{}
  }

  function inferTime(world, day){
    const timeRe = /\b([01]?\d|2[0-3]):[0-5]\d\b/;
    const scan = (arr) => {
      for(let i=arr.length-1;i>=0;i--){
        const raw = plainText(arr[i] || "");
        const m = raw.match(timeRe);
        if(m) return m[0];
      }
      return "";
    };
    const buf = state.buffer.map(b => b.text);
    const inBuf = scan(buf);
    if(inBuf) return inBuf;
    const blocks = day?.blocks || [];
    const upto = Math.min(state.cursor, blocks.length);
    for(let i=upto-1; i>=0 && i>=upto-140; i--){
      const raw = plainText(blocks[i] || "");
      const m = raw.match(timeRe);
      if(m) return m[0];
    }
    // Fallback: if no time encountered yet, grab the first time in the day.
    for(let i=0;i<blocks.length;i++){
      const raw = plainText(blocks[i] || "");
      const m = raw.match(timeRe);
      if(m) return m[0];
    }
    return "";
  }
  function setHUD(world, day){
    const d = day ? `${t("day")} ${day.day}` : (state.dayNo ? `${t("day")} ${state.dayNo}` : `${t("day")} ?`);
    const tm = inferTime(world, day);
    const time = tm ? `${I18N[state.lang]?.time || "TIME"} ${tm}` : `${I18N[state.lang]?.time || "TIME"} --`;
    const drift = `${I18N[state.lang]?.drift || "DRIFT"} ${Math.round(state.drift*100)}%`;
    const vec = `${I18N[state.lang]?.vector || "VECTOR"} ${vLabel(state.vector)}`;
    $("#state").textContent = `${d} // ${time} // ${drift} // ${vec}`;
  }

  function renderBuffer(){
    const wrap = $("#buffer");
    const html = [];
    const items = state.scrollMode ? state.buffer : state.buffer.slice(-260);
    const typed = !state.scrollMode;
    let idx = 0;
    for(const item of items){
      const raw = item.text;
      const c = classifyLine(raw);
      if(c.kind === "empty") continue;
      const cls = ["line"];
      if(c.kind === "stage") cls.push("stage");
      if(item.hackled) cls.push("hackled");
      if(typed) cls.push("typed");
      const delay = typed ? ` style="animation-delay:${Math.min(idx,16) * 18}ms"` : "";
      if(c.kind === "speaker"){
        if(looksHtml(raw) && c.spkEnd){
          const parts = splitHtmlAtPlainIndex(raw, c.spkEnd);
          const head = parts[0] || "";
          const tail = parts[1] || "";
          html.push(`<p class="${cls.join(" ")}"${delay}><span class="spk" data-spk="${escapeHTML(c.spk)}">${head}</span>${renderText(tail)}</p>`);
        } else {
          html.push(`<p class="${cls.join(" ")}"${delay}><span class="spk" data-spk="${escapeHTML(c.spk)}">${escapeHTML(c.spk)}:</span> ${renderText(c.txt)}</p>`);
        }
      } else {
        html.push(`<p class="${cls.join(" ")}"${delay}>${renderText(raw)}</p>`);
      }
      idx++;
    }
    wrap.innerHTML = html.join("\n");
    if(state.scrollMode){
      if(state.scrollTopNext){
        wrap.scrollTop = 0;
        state.scrollTopNext = false;
      }
    } else {
      wrap.scrollTop = 0;
      state.scrollTopNext = false;
    }
  }

  function renderGhost(){
    const box = $("#ghost-text");
    if(!box) return;
    box.textContent = state.ghostLine || "";
  }

  function setQuestion(text){ $("#q").textContent = `> ${text}`; }
  function setChoices(btns){
    const wrap = $("#choices"); wrap.innerHTML = "";
    for(const b of btns){
      const el = document.createElement("div");
      el.className = "choice"; el.textContent = b.label; el.onclick = b.onClick;
      wrap.appendChild(el);
    }
  }

  function enterScrollMode(){
    const world = getWorldById(state.worldId);
    const day = getDay(world, state.dayNo);
    if(!world || !day) return;
    state.timeMenu = false;
    state.mapMenu = false;
    if(!state.scrollMode){
      state.scrollSnapshot = {
        cursor: state.cursor,
        buffer: state.buffer.slice(),
        chunkStack: state.chunkStack.slice(),
      };
    }
    state.scrollMode = true;
    state.buffer = [{ text:t("scroll_heading", { day: day.day }), hackled:false }]
      .concat((day.blocks || []).map(b => ({ text: b, hackled:false })));
    state.scrollTopNext = true;
  }

  function exitScrollMode(){
    if(state.scrollSnapshot){
      state.cursor = state.scrollSnapshot.cursor;
      state.buffer = state.scrollSnapshot.buffer;
      state.chunkStack = state.scrollSnapshot.chunkStack;
    }
    state.scrollSnapshot = null;
    state.scrollMode = false;
    state.scrollTopNext = true;
  }

  function buildSpeakerIndex(){
    const worlds = state.worlds?.worlds || [];
    const map = new Map();
    for(const w of worlds){
      for(const d of (w.days || [])){
        const blocks = d.blocks || [];
        for(let i=0;i<blocks.length;i++){
          const raw = plainText(blocks[i] || "").trim();
          if(!raw) continue;
          const c = classifyLine(raw);
          if(c.kind !== "speaker") continue;
          const name = c.spk;
          if(!map.has(name)) map.set(name, []);
          map.get(name).push({ worldId: w.id, dayNo: d.day, idx: i, line: blocks[i] });
        }
      }
    }
    const names = Array.from(map.keys()).filter(n => n.length <= 36);
    return { map, names };
  }

  function buildKeywordIndex(){
    const worlds = state.worlds?.worlds || [];
    const map = new Map();
    for(const kw of KEYWORDS){
      map.set(kw.toLowerCase(), []);
    }
    for(const w of worlds){
      for(const d of (w.days || [])){
        const blocks = d.blocks || [];
        for(let i=0;i<blocks.length;i++){
          const raw = plainText(blocks[i] || "");
          if(!raw) continue;
          const low = raw.toLowerCase();
          for(const kw of KEYWORDS){
            const key = kw.toLowerCase();
            if(low.includes(key)){
              map.get(key).push({ worldId: w.id, dayNo: d.day, idx: i, line: blocks[i] });
            }
          }
        }
      }
    }
    return { map, words: KEYWORDS.slice() };
  }

  function jumpToKeyword(word){
    const key = safeText(word).toLowerCase();
    const hits = state.keywordIndex?.map.get(key);
    if(!hits || !hits.length) return;
    const hit = hits[Math.floor(Math.random()*hits.length)];
    state.worldId = hit.worldId;
    state.dayNo = hit.dayNo;
    state.cursor = Math.max(0, hit.idx + 1);
    state.scrollMode = false;
    state.scrollSnapshot = null;
    state.buffer = [
      { text:t("gate_opens", { word }), hackled:false },
      { text: hit.line, hackled:false },
    ];
    state.chunkStack.push({ cursorStart: state.cursor, cursorEnd: state.cursor, lines: state.buffer.slice(), hackle:false });
    state.scrollTopNext = true;
  }

  function randomSpeakers(count=6){
    const names = state.speakerIndex?.names || [];
    if(!names.length) return [];
    const pool = names.slice();
    for(let i=pool.length-1;i>0;i--){
      const j = Math.floor(Math.random() * (i+1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, Math.min(count, pool.length));
  }

  function openRoleMenu(){
    state.timeMenu = false;
    state.mapMenu = false;
    state.roleOptions = randomSpeakers(6);
    state.roleMenu = true;
  }
  function sortedEraWorlds(era){
    const groups = eraGroups();
    const list = (groups.get(era) || []).slice();
    if(!list.length) return list;
    if(era === PRESENT_ERA){
      list.sort((a,b) => {
        const ai = PRIMARY_WORLD_IDS.indexOf(a.id);
        const bi = PRIMARY_WORLD_IDS.indexOf(b.id);
        if(ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
        return a.id.localeCompare(b.id);
      });
      return list;
    }
    list.sort((a,b)=>{
      const am = /-mv\\b/.test(a.id) ? 1 : 0;
      const bm = /-mv\\b/.test(b.id) ? 1 : 0;
      if(am !== bm) return am - bm;
      return a.id.localeCompare(b.id);
    });
    return list;
  }
  function buildEraLabelMap(){
    const map = new Map();
    const groups = eraGroups();
    for(const [era, worlds] of groups.entries()){
      const ordered = sortedEraWorlds(era);
      ordered.forEach((w, i) => map.set(w.id, `V.${i+1}`));
    }
    return map;
  }
  function worldLabel(w, labelMap){
    if(!w) return t("unknown");
    if(w.id === "theory-tragedy") return t("theory_name");
    if(labelMap && labelMap.has(w.id)) return labelMap.get(w.id);
    return (w.name || w.id || t("unknown")).toUpperCase();
  }
  function buildMapBuffer(){
    const groups = eraGroups();
    const eras = Array.from(groups.keys()).sort();
    const labelMap = buildEraLabelMap();
    const node = (w) => `<span class="map-node" data-world="${escapeHTML(w.id)}">${worldLabel(w, labelMap)}</span>`;
    const lines = [
      { text:`<span class="map-line">[${t("world_map")}]</span>`, hackled:false },
      { text:`<span class="map-line">${t("click_node_exit")}</span>`, hackled:false },
      { text:"", hackled:false },
    ];
    if(!eras.length){
      lines.push({ text:t("no_worlds"), hackled:false });
      return lines;
    }
    const makeRow = (worlds) => worlds.map(w => node(w)).join("&nbsp;--&nbsp;");
    const rootEra = eras.includes(PRESENT_ERA) ? PRESENT_ERA : eras[0];
    const futureEras = eras.filter(e => e !== rootEra);
    const rootWorlds = sortedEraWorlds(rootEra);
    lines.push({ text:`<span class="map-line">ERA ${rootEra}</span>`, hackled:false });
    lines.push({ text:`<span class="map-line">&nbsp;&nbsp;${makeRow(rootWorlds)}</span>`, hackled:false });
    if(futureEras.length){
      lines.push({ text:`<span class="map-line">&nbsp;&nbsp;|</span>`, hackled:false });
      futureEras.forEach((era, idx) => {
        const worlds = sortedEraWorlds(era);
        lines.push({ text:`<span class="map-line">&nbsp;&nbsp;+-- ERA ${era}</span>`, hackled:false });
        const branch = idx < futureEras.length - 1 ? "&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;" : "&nbsp;&nbsp;&nbsp;&nbsp;";
        lines.push({ text:`<span class="map-line">${branch}${makeRow(worlds)}</span>`, hackled:false });
        if(idx < futureEras.length - 1){
          lines.push({ text:`<span class="map-line">&nbsp;&nbsp;|</span>`, hackled:false });
        }
      });
    }
    return lines;
  }
  function enterMapMenu(){
    state.timeMenu = false;
    state.roleMenu = false;
    if(!state.mapMenu){
      state.mapSnapshot = {
        cursor: state.cursor,
        buffer: state.buffer.slice(),
        chunkStack: state.chunkStack.slice(),
        scrollMode: state.scrollMode,
        scrollSnapshot: state.scrollSnapshot,
      };
    }
    state.mapMenu = true;
    state.scrollMode = false;
    state.scrollSnapshot = null;
    state.buffer = buildMapBuffer();
    state.scrollTopNext = true;
  }
  function exitMapMenu(){
    if(state.mapSnapshot){
      state.cursor = state.mapSnapshot.cursor;
      state.buffer = state.mapSnapshot.buffer;
      state.chunkStack = state.mapSnapshot.chunkStack;
      state.scrollMode = state.mapSnapshot.scrollMode;
      state.scrollSnapshot = state.mapSnapshot.scrollSnapshot;
    }
    state.mapSnapshot = null;
    state.mapMenu = false;
    state.scrollTopNext = true;
  }

  function jumpToSpeaker(name){
    const hits = state.speakerIndex?.map.get(name);
    if(!hits || !hits.length) return;
    const hit = hits[Math.floor(Math.random()*hits.length)];
    state.worldId = hit.worldId;
    state.dayNo = hit.dayNo;
    state.cursor = Math.max(0, hit.idx + 1);
    state.scrollMode = false;
    state.scrollSnapshot = null;
    state.buffer = [
      { text:t("corridor_opens", { name }), hackled:false },
      { text: hit.line, hackled:false },
    ];
    if(!state.scrollMode){
      state.chunkStack.push({ cursorStart: state.cursor, cursorEnd: state.cursor, lines: state.buffer.slice(), hackle:false });
    }
    state.scrollTopNext = true;
    state.roleMenu = false;
  }
  function jumpToWorld(worldId){
    const w = getWorldById(worldId);
    if(!w) return;
    state.worldId = w.id;
    const days = allDayNos(w);
    state.dayNo = days[0] || 1;
    state.cursor = 0;
    state.buffer = [{ text:t("entering_day", { day: state.dayNo }), hackled:false }];
    state.chunkStack = [];
    state.scrollMode = false;
    state.scrollSnapshot = null;
    state.mapMenu = false;
    state.mapSnapshot = null;
    state.timeMenu = false;
    state.roleMenu = false;
    state.scrollTopNext = true;
    localStorage.setItem("ki_world", state.worldId || "");
  }

  function ghostMaybe(){
    const lines = state.ghostLines || [];
    if(!lines.length) return;
    if(Math.random() < 0.10){
      const line = normalizeWS(lines[Math.floor(Math.random()*lines.length)]);
      if(line) state.ghostLine = line;
    }
  }
  function forceGhost(){
    const lines = state.ghostLines || [];
    if(!lines.length) return;
    const line = normalizeWS(lines[Math.floor(Math.random()*lines.length)]);
    if(line) state.ghostLine = line;
  }

  function doColdBoot(){
    const boot = [
      { text:t("cold_boot"), hackled:false },
      { text:t("memory_reset"), hackled:false },
      { text:t("linking_worldlines"), hackled:false },
      { text:t("ready"), hackled:false },
    ];
    state.buffer = boot;
    state.vector = "BOOT";
    state.chunkStack.push({ cursorStart: state.cursor, cursorEnd: state.cursor, lines: boot.slice(), hackle:false });
    state.scrollTopNext = true;
    maybeSprite("BOOT");
  }
  function coldBootMaybe(reason){
    if(state.scrollMode) return;
    if(reason === "enter"){
      if(state.coldBooted) return;
      state.coldBooted = true;
      if(!state.firstVisit) return;
      const ok = randomizeStart(PRESENT_ERA);
      doColdBoot();
      if(!ok){
        // fall back to current state if randomize fails
      }
      return;
    }
    if(reason === "day5"){
      if(state.dayNo !== 5) return;
      if(state.coldBootDay5) return;
      state.coldBootDay5 = true;
      const era = worldEra(getWorldById(state.worldId)) || PRESENT_ERA;
      randomizeStart(era);
      doColdBoot();
    }
  }

  function act(fn, { append=false, echo=true, vector="FLOW" } = {}){
    click();
    if(typeof fn === "function") fn();
    state.vector = vector;
    if(echo && !append && vector === "HACKLE") markovEcho();
    if(vector === "HACKLE") forceGhost();
    maybeSprite(vector);
    spriteTick();
    ghostMaybe();
    render();
    persist();
  }

  function lockKeyboard(){
    const stop = (e) => { e.preventDefault(); };
    document.addEventListener("keydown", stop, { passive:false });
    document.addEventListener("keypress", stop, { passive:false });
    document.addEventListener("keyup", stop, { passive:false });
  }

  function driftMaybe(){
    if(state.drift < 0.55) return false;
    const p = 0.12 + state.drift * 0.28;
    return Math.random() < p;
  }
  function hackleLine(raw, seed, maxTokens){
    if(!state.markov) return { text: raw, hackled:false };
    const rawPlain = plainText(raw);
    const c = classifyLine(rawPlain);
    if(c.kind === "speaker"){
      const g = generate(state.markov, c.txt || seed, maxTokens);
      return { text: `${c.spk}: ${g || c.txt}`, hackled:true };
    }
    const g = generate(state.markov, rawPlain || seed, maxTokens);
    return { text: g || rawPlain, hackled:true };
  }
  function pickWormholeLines({ count=4, hackle=false } = {}){
    const worlds = playableWorlds();
    if(!worlds.length) return [];
    let w = worlds[Math.floor(Math.random()*worlds.length)];
    if(w.id === state.worldId && worlds.length > 1){
      w = worlds[(worlds.indexOf(w) + 1) % worlds.length];
    }
    const days = w.days || [];
    if(!days.length) return [];
    const day = days[Math.floor(Math.random()*days.length)];
    const blocks = day.blocks || [];
    if(!blocks.length) return [];
    const span = Math.min(blocks.length, Math.max(2, count));
    const start = Math.floor(Math.random() * Math.max(1, blocks.length - span));
    const end = Math.min(blocks.length, start + span);
    const seed = blocks[start] || "";
    const hasMarkov = !!state.markov;
    const lines = [];
    let replaced = 0;
    for(let i=start;i<end;i++){
      const raw = safeText(blocks[i] || "");
      const rawPlain = plainText(raw);
      if(!rawPlain.trim()) continue;
      const replace = hackle && hasMarkov && (Math.random() < 0.32);
      if(replace){
        lines.push(hackleLine(raw, seed, 28));
        replaced++;
      } else {
        lines.push({ text: raw, hackled:false });
      }
    }
    if(hackle && hasMarkov && !replaced && lines.length){
      const idx = Math.floor(Math.random() * lines.length);
      lines[idx] = hackleLine(lines[idx].text, seed, 28);
    }
    return lines;
  }
  function appendWormhole({ hackle=false } = {}){
    const addedLines = pickWormholeLines({ count: Math.floor(Math.random() * 8) + 6, hackle });
    if(!addedLines.length) return false;
    if(hasHotword(addedLines)) maybeSprite("KEYWORD");
    if(state.scrollMode){
      state.buffer = state.buffer.concat(addedLines);
    } else {
      state.buffer = addedLines.slice();
      state.chunkStack.push({ cursorStart: state.cursor, cursorEnd: state.cursor, lines: addedLines.slice(), hackle: !!hackle });
    }
    state.scrollTopNext = true;
    state.drift = clamp01(state.drift + (hackle ? 0.16 : 0.08));
    return true;
  }

  function gotoDay(delta){
    let world = getWorldById(state.worldId);
    let days = allDayNos(world);
    if(!days.length){ state.dayNo=1; state.cursor=0; state.buffer=[]; return; }
    const idx = Math.max(0, days.indexOf(state.dayNo));
    const nextIdx = idx + delta;
    const wrappedForward = nextIdx >= days.length;
    const wrappedBack = nextIdx < 0;
    if(delta > 0 && wrappedForward){
      world = cycleWorld(+1) || world;
      days = allDayNos(world);
      state.dayNo = days[0] || 1;
    } else if(delta < 0 && wrappedBack){
      world = cycleWorld(-1) || world;
      days = allDayNos(world);
      state.dayNo = days[days.length - 1] || 1;
    } else {
    state.dayNo = days[(nextIdx + days.length) % days.length];
    }
    state.cursor = 0;
    state.buffer = [{ text:t("entering_day", { day: state.dayNo }), hackled:false }];
    state.chunkStack = [];
    state.scrollTopNext = true;
    if(state.scrollMode) enterScrollMode();
    if(delta > 0) state.drift = clamp01(state.drift * 0.92);
    else state.drift = clamp01(state.drift + 0.08);
    coldBootMaybe("day5");
  }
  function shiftWorld(delta=+1){
    const current = getWorldById(state.worldId);
    const era = worldEra(current) || PRESENT_ERA;
    const groups = eraGroups();
    const list = groups.get(era) || primaryWorlds();
    if(!list.length) return false;
    const idx = Math.max(0, list.findIndex(w => w.id === state.worldId));
    const next = list[(idx + delta + list.length) % list.length];
    state.worldId = next.id;
    const days = allDayNos(next);
    const day = (state.dayNo && days.includes(state.dayNo)) ? state.dayNo : (days[0] || 1);
    state.dayNo = day;
    state.cursor = 0;
    state.buffer = [
      { text:t("world_shift"), hackled:false },
      { text:t("entering_day", { day }), hackled:false },
    ];
    state.chunkStack = [];
    state.scrollMode = false;
    state.scrollSnapshot = null;
    state.mapMenu = false;
    state.mapSnapshot = null;
    state.timeMenu = false;
    state.roleMenu = false;
    state.scrollTopNext = true;
    localStorage.setItem("ki_world", state.worldId || "");
    return true;
  }

  function appendChunk({ hackle=false } = {}){
    const world = getWorldById(state.worldId);
    const day = getDay(world, state.dayNo);
    if(!world || !day){
      const repaired = ensurePlayableWorld();
      if(repaired){
        const days = allDayNos(repaired);
        state.dayNo = days[0] || 1;
      }
      state.buffer.push({ text:t("data_link_lost"), hackled:false });
      state.scrollTopNext = true;
      return;
    }
    const blocks = day.blocks || [];
    if(state.cursor >= blocks.length){
      state.buffer.push({ text:t("end_day", { day: day.day }), hackled:false });
      state.buffer.push({ text:t("shift_prompt"), hackled:false });
      return;
    }

    const step = 14;
    const start = state.cursor;
    let i = start;
    let addedCount = 0;
    let addedLines = [];
    let replaced = 0;
    const findSeed = (idx) => {
      for(let j=Math.min(idx, blocks.length-1); j>=0; j--){
        const raw = plainText(blocks[j] || "").trim();
        if(raw) return raw;
      }
      return plainText(blocks[idx] || "");
    };
    const seed = findSeed(start);
    const hasMarkov = !!state.markov;
    const pulseIdx = -1;
    let pulseArmed = false;

    while(i < blocks.length && addedCount < step){
      const raw = safeText(blocks[i] || "");
      const rawPlain = plainText(raw);
      i++;
      if(!rawPlain.trim()) continue;

      const pulseHit = pulseArmed && addedCount >= pulseIdx;
      if(hackle || pulseHit){
        const replace = hackle && hasMarkov && (pulseHit || Math.random() < 0.32);
        if(replace){
          addedLines.push(hackleLine(raw, seed, 34));
          replaced++;
        } else {
          addedLines.push({ text: raw, hackled:false });
        }
        if(pulseHit) pulseArmed = false;
      } else {
        addedLines.push({ text: raw, hackled:false });
      }
      addedCount++;
    }

    if(hackle && hasMarkov && !replaced && addedLines.length){
      const idx = Math.floor(Math.random() * addedLines.length);
      addedLines[idx] = hackleLine(addedLines[idx].text, seed, 34);
    }

    state.cursor = i;
    if(addedLines.length === 0){
      addedLines.push({ text:t("silence"), hackled:false });
    }

    if(driftMaybe()){
      const splice = pickWormholeLines({ count: 2 + Math.floor(Math.random()*3) });
      if(splice.length) addedLines = addedLines.concat(splice);
    }
    if(hasHotword(addedLines)) maybeSprite("KEYWORD");

    if(state.scrollMode){
      state.buffer = state.buffer.concat(addedLines);
    } else {
      state.buffer = addedLines.slice();
    }
    state.scrollTopNext = true;
    if(!state.scrollMode && addedLines.length){
      state.chunkStack.push({ cursorStart:start, cursorEnd:i, lines: addedLines.slice(), hackle:!!hackle });
    }
    if(pulseArmed && hasMarkov && hackle) markovEcho(seed);
    if(hackle) state.drift = clamp01(state.drift + 0.10);
    else state.drift = clamp01(state.drift * 0.985 + 0.01);

  }

  function rewindChunk(){
    if(state.scrollMode) return false;
    if(state.chunkStack.length <= 1) return false;
    state.chunkStack.pop();
    const prev = state.chunkStack[state.chunkStack.length - 1];
    if(!prev) return false;
    state.buffer = prev.lines.slice();
    state.cursor = prev.cursorEnd;
    state.drift = clamp01(state.drift * 0.96);
    state.scrollTopNext = true;
    return true;
  }

  function render(){
    const world = getWorldById(state.worldId);
    const day = getDay(world, state.dayNo);
    const timeEras = erasForTimeMenu();
    const futureAvailable = timeEras.length > 0;
    const currentEra = worldEra(world) || PRESENT_ERA;
    const inFuture = currentEra !== PRESENT_ERA;
    applyRotation();

    setHUD(world, day);
    renderBuffer();
    renderGhost();

    if(state.scrollMode){
      setQuestion(t("scroll_mode"));
      const scrollChoices = [
        { label:t("exit_scroll"), onClick: () => act(() => exitScrollMode(), { echo:false, vector:"FLOW" }) },
        { label:t("next_world"), onClick: () => act(() => gotoDay(+1), { echo:false, vector:"NEXT" }) },
        { label:t("prev_world"), onClick: () => act(() => gotoDay(-1), { echo:false, vector:"LOOP" }) },
        { label:t("role"), onClick: () => act(() => openRoleMenu(), { echo:false, vector:"ROLE" }) },
      ];
      scrollChoices.push({ label:t("map"), onClick: () => act(() => enterMapMenu(), { echo:false, vector:"MAP" }) });
      if(futureAvailable){
        scrollChoices.push({ label:t("time_jump"), onClick: () => act(() => { state.timeMenu = true; }, { echo:false, vector:"JUMP" }) });
      }
      setChoices(scrollChoices);
      return;
    }

    if(state.roleMenu){
      setQuestion(t("role_gate"));
      const btns = state.roleOptions.map(name => ({
        label: shorten(name.toUpperCase()),
        onClick: () => act(() => jumpToSpeaker(name), { echo:false, vector:"ROLE" }),
      }));
      btns.push({
        label: t("more_names"),
        onClick: () => act(() => { state.roleOptions = randomSpeakers(6); }, { echo:false, vector:"ROLE" }),
      });
      btns.push({
        label: t("exit"),
        onClick: () => act(() => { state.roleMenu = false; }, { echo:false, vector:"FLOW" }),
      });
      setChoices(btns);
      return;
    }

    if(state.mapMenu){
      setQuestion(t("map_question"));
    const btns = [
      { label:t("exit"), onClick: () => act(() => exitMapMenu(), { echo:false, vector:"FLOW" }) },
    ];
      setChoices(btns);
      return;
    }

    if(state.timeMenu){
      setQuestion(t("time_jump_question"));
      const btns = timeEras.map(({ era }) => ({
        label: era,
        onClick: () => act(() => { timeJumpToEra(era); state.timeMenu = false; }, { echo:false, vector:"JUMP" }),
      }));
      if(inFuture){
        btns.unshift({
          label: t("return_2026"),
          onClick: () => act(() => { returnFromFuture(); state.timeMenu = false; }, { echo:false, vector:"JUMP" }),
        });
      }
      btns.push({
        label: t("exit"),
        onClick: () => act(() => { state.timeMenu = false; }, { echo:false, vector:"FLOW" }),
      });
      setChoices(btns);
      return;
    }

    if(!world || !day){
      const repaired = ensurePlayableWorld();
      if(repaired && (repaired.days || []).length){
        const days = allDayNos(repaired);
        state.dayNo = days[0] || 1;
        state.cursor = 0;
        state.buffer = [{ text:t("relinking_day", { day: state.dayNo }), hackled:false }];
        state.chunkStack = [];
        state.scrollTopNext = true;
        render();
        persist();
        return;
      }
      setQuestion(t("data_link_question"));
      setChoices([
        { label:t("reload"), onClick: () => { click(); location.reload(); } },
        { label:t("wormhole"), onClick: () => act(() => appendWormhole({ hackle:false }), { echo:false, vector:"WORMHOLE" }) },
        { label:t("forward_time"), onClick: () => act(() => appendChunk({hackle:false}), { append:true, vector:"FLOW" }) },
      ]);
      return;
    }

    const atEnd = state.cursor >= (day.blocks || []).length;
    if(!state.buffer.length){
      state.buffer.push({ text:t("entering_day", { day: day.day }), hackled:false });
    }

    if(atEnd){
      setQuestion(t("day_end_shift", { day: day.day }));
      const endChoices = [
        { label:t("next_day"), onClick: () => act(() => gotoDay(+1), { vector:"NEXT" }) },
        { label:t("shift_world"), onClick: () => act(() => shiftWorld(+1), { vector:"SHIFT" }) },
        { label:t("prev_day"), onClick: () => act(() => gotoDay(-1), { vector:"LOOP" }) },
        { label:t("back_time"), onClick: () => act(() => { if(!rewindChunk()) gotoDay(-1); }, { vector:"BACK" }) },
        { label:t("role"), onClick: () => act(() => openRoleMenu(), { echo:false, vector:"ROLE" }) },
        { label:t("wormhole"), onClick: () => act(() => appendWormhole({ hackle:false }), { echo:false, vector:"WORMHOLE" }) },
        { label:t("hackle_return"), onClick: () => act(() => { if(!rewindChunk()) gotoDay(-1); appendChunk({hackle:true}); }, { append:true, vector:"HACKLE" }) },
      ];
      endChoices.push({ label:t("map"), onClick: () => act(() => enterMapMenu(), { echo:false, vector:"MAP" }) });
      if(futureAvailable){
        endChoices.push({ label:t("time_jump"), onClick: () => act(() => { state.timeMenu = true; }, { vector:"JUMP" }) });
      }
      endChoices.push({ label:t("collect_day"), onClick: () => act(() => enterScrollMode(), { echo:false, vector:"SCROLL" }) });
      setChoices(endChoices);
      return;
    }

    setQuestion(t("choose_vector"));
    const baseChoices = [
      { label:t("forward_time"), onClick: () => act(() => appendChunk({hackle:false}), { append:true, vector:"FLOW" }) },
      { label:t("back_time"), onClick: () => act(() => { if(!rewindChunk()) gotoDay(-1); }, { vector:"BACK" }) },
      { label:t("hackle"), onClick: () => act(() => appendChunk({hackle:true}), { append:true, vector:"HACKLE" }) },
      { label:t("role"), onClick: () => act(() => openRoleMenu(), { echo:false, vector:"ROLE" }) },
      { label:t("wormhole"), onClick: () => act(() => appendWormhole({ hackle:false }), { echo:false, vector:"WORMHOLE" }) },
    ];
    baseChoices.push({ label:t("map"), onClick: () => act(() => enterMapMenu(), { echo:false, vector:"MAP" }) });
    if(futureAvailable){
      baseChoices.push({ label:t("time_jump"), onClick: () => act(() => { state.timeMenu = true; }, { vector:"JUMP" }) });
    }
    baseChoices.push({ label:t("collect_day"), onClick: () => act(() => enterScrollMode(), { echo:false, vector:"SCROLL" }) });
    setChoices(baseChoices);
  }

  async function boot(){
    lockKeyboard();
    const buf = $("#buffer");
    if(buf){
      buf.addEventListener("click", (e) => {
        const node = e.target.closest(".map-node");
        if(node){
          const id = node.getAttribute("data-world");
          if(!id) return;
          click();
          state.vector = "MAP";
          jumpToWorld(id);
          render();
          persist();
          return;
        }
        const spk = e.target.closest(".spk");
        if(spk){
          const name = spk.getAttribute("data-spk") || spk.textContent.replace(/:$/,"");
          if(!name) return;
          click();
          state.vector = "ROLE";
          jumpToSpeaker(name);
          render();
          persist();
          return;
        }
        const kw = e.target.closest(".kw");
        if(kw){
          const word = kw.getAttribute("data-kw") || kw.textContent;
          if(!word) return;
          click();
          state.vector = "GATE";
          jumpToKeyword(word);
          render();
          persist();
        }
      });
    }
    const langBox = $("#lang");
    if(langBox){
      langBox.addEventListener("click", (e) => {
        const opt = e.target.closest(".lang-option");
        if(!opt) return;
        switchLanguage(opt.getAttribute("data-lang"));
      });
    }
    await bootBuildStamp();
    state.lang = detectLang();
    document.documentElement.lang = state.lang;
    updateLangUI();
    state.worlds = await loadWorldsForLang(state.lang);
    state.corpus = await fetchJSON("data/corpus.json").catch(()=>({lines:[]}));
    const ghostBase = await fetch("data/mostdipf_all.txt", { cache:"no-store" })
      .then(r => r.ok ? r.text() : "")
      .then(t => t.split(/\r?\n/).map(s => s.trim()).filter(Boolean))
      .catch(() => []);
    const sagerLines = await fetch("data/sager.txt", { cache:"no-store" })
      .then(r => r.ok ? r.text() : "")
      .then(t => t.split(/\r?\n/).map(s => s.trim()).filter(Boolean))
      .catch(() => []);
    state.ghostLines = ghostBase.concat(sagerLines);
    state.spriteList = await fetchJSON("data/dipfies.json")
      .then(d => Array.isArray(d.files) ? d.files : [])
      .catch(() => []);

    const worlds = state.worlds?.worlds || [];
    state.canonId = state.worlds?.canonical || (worlds[0]?.id || null);

    restore();
    state.firstVisit = !state.hasSaved;

    if(!state.worldId){
      state.worldId = localStorage.getItem("ki_world") || state.canonId || (worlds[0]?.id || null);
    }
    const w = ensurePlayableWorld() || getWorldById(state.worldId);
    localStorage.setItem("ki_world", state.worldId || "");

    const days = allDayNos(w);
    if(!days.length) state.dayNo = 1;
    else if(state.dayNo == null || !days.includes(state.dayNo)) state.dayNo = days[0];

    // Markov mix: corpus lines + canonical drama blocks + mostdipf ghost
    rebuildMarkov();
    state.speakerIndex = buildSpeakerIndex();
    state.keywordIndex = buildKeywordIndex();

    if(!state.buffer.length){
      state.buffer = [{ text:t("entering_day", { day: getDay(w,state.dayNo)?.day || state.dayNo }), hackled:false }];
      appendChunk({hackle:false});
    }
    state.vector = "FLOW";
    coldBootMaybe("enter");
    spriteTick();

    render();
    persist();
  }

  boot().catch(err => {
    console.error(err);
    applyRotation();
    $("#state").textContent = t("boot_failed");
    $("#buffer").innerHTML = `<p class="line">${escapeHTML(err.message || String(err))}</p>`;
    setQuestion(t("boot_failed_question"));
    setChoices([{ label:t("reload"), onClick: () => { click(); location.reload(); } }]);
  });
})();
