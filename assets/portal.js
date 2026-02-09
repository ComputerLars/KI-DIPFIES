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
    sessionSeed:"",
    sessionStartedAt:0,
    traceLog:[],
    community:{},
    nextCommunityHintAt:0,
    lastCommunityHintSig:"",
    currentQuestion:"",
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
    mapVisits:0,
    keywordIndex:null,
    visits:{},
    erasSeen:[],
    lastVisitKey:"",
    anomalyMenu:false,
    anomalySnapshot:null,
    nextBreachAt:0,
    anomalyDepth:0,
    anomalyStep:0,
    anomalyCoherence:0,
    anomalyTrail:[],
    tribunalMenu:false,
    tribunalSnapshot:null,
    nextTribunalAt:0,
    counterMenu:false,
    counterSnapshot:null,
    nextCounterAt:0,
    originMenu:false,
    originSnapshot:null,
    nextOriginAt:0,
    actionCount:0,
    originUnlocked:false,
    originSpectacleSeen:false,
    originFirstJumpDone:false,
    tribunalBias:0,
    tribunalBiasTurns:0,
    eventHeat:0,
    paceTickAt:0,
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
  const ORIGIN_WORLD_IDS = ["origin-aleph"];
  const ORIGIN_ERA = "א";
  const AUTO_ORIGIN_REVEAL = true;
  const TRACE_STORE_KEY = "ki_trace_aggregate_v1";
  const MAX_TRACE_LOG = 1200;
  const TRACE_DEFAULT_ENDPOINT = "https://computerlars/trace";
  const TRACE_ENDPOINT = (() => {
    try{
      const qp = new URLSearchParams(location.search || "").get("trace");
      if(qp) return qp.trim();
      const w = (typeof window !== "undefined" && typeof window.KI_TRACE_ENDPOINT === "string") ? window.KI_TRACE_ENDPOINT.trim() : "";
      if(w) return w;
      const ls = localStorage.getItem("ki_trace_endpoint");
      if((ls || "").trim()) return (ls || "").trim();
      return TRACE_DEFAULT_ENDPOINT;
    }catch{
      return TRACE_DEFAULT_ENDPOINT;
    }
  })();
  const I18N = {
    en: {
      lang_label: "LANG",
      day: "DAY",
      year: "YEAR",
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
      seed_capsule: "Seed Capsule",
      stats_pulse: "Stats Pulse",
      seed_capsule_done: "(seed capsule copied + downloaded)",
      seed_capsule_partial: "(seed capsule downloaded; copy blocked)",
      session_link_line: ({ link }) => `(session link: ${link})`,
      community_seen_line: ({ percent, choice, total, count }) => `(${percent}% chose ${choice} (${count}/${total} traces in this corridor))`,
      community_ask_line: "what would you do?",
      stats_context_line: ({ context, total, variants }) => `(stats: ${total} traces in ${context}; ${variants} vectors observed)`,
      stats_top_line: ({ choice, percent, count }) => `(top vector: ${choice} :: ${percent}% (${count}) )`,
      stats_global_line: ({ total, contexts }) => `(global local memory: ${total} traces across ${contexts} contexts)`,
      stats_remote_line: ({ choices, sessions, events }) => `(pi memory: ${choices} choices / ${sessions} sessions / ${events} events)`,
      stats_remote_top_line: ({ choice, percent, count }) => `(pi top: ${choice} :: ${percent}% (${count}) )`,
      sager_idle: "SAGER CHANNEL IDLE // waiting for next contradiction",
      origin_key_locked_line: "ORIGIN KEYSPACE: SEALED (MAP ACCESS ONLY).",
      origin_key_open_line: "ORIGIN KEYSPACE: OPEN.",
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
      anomaly_header: "[CONVERGENCE BREACH]",
      anomaly_detected: "MULTIVERSE COHERENCE BELOW THRESHOLD.",
      anomaly_prompt: ">> STABILIZE OR FOLLOW FRACTURE?",
      anomaly_prompt_final: ">> RESOLVE BREACH.",
      anomaly_question: "CONVERGENCE EVENT.",
      anomaly_stage: ({ step, total }) => `[BREACH ${step}/${total}]`,
      anomaly_trace: ({ trace }) => `(trace ${trace})`,
      stabilize: "Stabilize",
      follow_fracture: "Follow Fracture",
      ride_breach: "Ride the Breach",
      stabilized_line: "(timeline stabilized)",
      anomaly_resolved_stable: "(breach stabilized)",
      anomaly_resolved_fracture: "(fracture selected)",
      anomaly_resolved_spill: "(spillover retained)",
      tribunal_header: "[SAGER TRIBUNAL]",
      tribunal_detected: "SAGER CHANNEL REQUESTS A VERDICT.",
      tribunal_prompt: ">> CHOOSE YOUR TESTIMONY.",
      tribunal_question: "TRIBUNAL EVENT.",
      tribunal_affirm: "Affirm",
      tribunal_refuse: "Refuse",
      tribunal_abstain: "Abstain",
      tribunal_affirm_line: "(coherence covenant accepted)",
      tribunal_refuse_line: "(coherence covenant refused)",
      tribunal_abstain_line: "(judgment deferred)",
      counter_header: "[COUNTERFACTUAL REPLAY]",
      counter_detected: "A WHAT-IF RUN IS AVAILABLE.",
      counter_prompt: ">> PICK A REPLAY VECTOR.",
      counter_question: "COUNTERFACTUAL EVENT.",
      counter_local: "Replay Day",
      counter_parallel: "Parallel World",
      counter_cross_era: "Cross Era",
      counter_hold: "Hold Line",
      counter_local_line: "(counterfactual: same day rerun)",
      counter_parallel_line: "(counterfactual: parallel branch)",
      counter_cross_era_line: "(counterfactual: cross-era branch)",
      counter_hold_line: "(counterfactual deferred)",
      origin_header: "[ALEPH ORIGIN BREACH]",
      origin_detected: "GIPFESIS KEYSPACE HAS APPEARED.",
      origin_prompt: ">> ENTER OR HOLD POSITION?",
      origin_question: "ORIGIN REVEAL EVENT.",
      enter_origin: "Enter א",
      hold_origin: "Hold Position",
      origin_hold_line: "(origin deferred)",
      origin_enter_line: "(origin key accepted)",
      fracture_jump_line: ({ era, day }) => `(fracture jump: ERA ${era}, DAY ${day})`,
      time_jump_line: ({ era }) => `(time jump: ${era})`,
      return_line: ({ era }) => `(returning from ${era})`,
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
      year: "JAHR",
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
      seed_capsule: "Seed-Kapsel",
      stats_pulse: "Statistik-Puls",
      seed_capsule_done: "(Seed-Kapsel kopiert + heruntergeladen)",
      seed_capsule_partial: "(Seed-Kapsel heruntergeladen; Kopieren blockiert)",
      session_link_line: ({ link }) => `(Session-Link: ${link})`,
      community_seen_line: ({ percent, choice, total, count }) => `(${percent}% wählten ${choice} (${count}/${total} Spuren in diesem Korridor))`,
      community_ask_line: "Was würdest du tun?",
      stats_context_line: ({ context, total, variants }) => `(Statistik: ${total} Spuren in ${context}; ${variants} Vektoren beobachtet)`,
      stats_top_line: ({ choice, percent, count }) => `(Top-Vektor: ${choice} :: ${percent}% (${count}) )`,
      stats_global_line: ({ total, contexts }) => `(globale lokale Erinnerung: ${total} Spuren über ${contexts} Kontexte)`,
      stats_remote_line: ({ choices, sessions, events }) => `(Pi-Speicher: ${choices} Entscheidungen / ${sessions} Sessions / ${events} Events)`,
      stats_remote_top_line: ({ choice, percent, count }) => `(Pi-Top: ${choice} :: ${percent}% (${count}) )`,
      sager_idle: "SAGER-KANAL IDLE // wartet auf den nächsten Widerspruch",
      origin_key_locked_line: "ORIGIN-SCHLUESSELRAUM: VERSIEGELT (NUR UEBER KARTE).",
      origin_key_open_line: "ORIGIN-SCHLUESSELRAUM: OFFEN.",
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
      anomaly_header: "[KONVERGENZ-BRUCH]",
      anomaly_detected: "MULTIVERSUM-KOHÄRENZ UNTER GRENZWERT.",
      anomaly_prompt: ">> STABILISIEREN ODER BRUCH FOLGEN?",
      anomaly_prompt_final: ">> BRUCH AUFLÖSEN.",
      anomaly_question: "KONVERGENZ-EREIGNIS.",
      anomaly_stage: ({ step, total }) => `[BRUCH ${step}/${total}]`,
      anomaly_trace: ({ trace }) => `(Spur ${trace})`,
      stabilize: "Stabilisieren",
      follow_fracture: "Bruch folgen",
      ride_breach: "Den Bruch reiten",
      stabilized_line: "(Zeitlinie stabilisiert)",
      anomaly_resolved_stable: "(Bruch stabilisiert)",
      anomaly_resolved_fracture: "(Bruchroute gewählt)",
      anomaly_resolved_spill: "(Überlauf bleibt)",
      tribunal_header: "[SAGER-TRIBUNAL]",
      tribunal_detected: "SAGER-KANAL FORDERT EIN VERDIKT.",
      tribunal_prompt: ">> ZEUGNIS WÄHLEN.",
      tribunal_question: "TRIBUNAL-EREIGNIS.",
      tribunal_affirm: "Bestätigen",
      tribunal_refuse: "Verweigern",
      tribunal_abstain: "Enthalten",
      tribunal_affirm_line: "(Kohärenz-Pakt bestätigt)",
      tribunal_refuse_line: "(Kohärenz-Pakt verweigert)",
      tribunal_abstain_line: "(Urteil vertagt)",
      counter_header: "[KONTRAFAKTISCHER REPLAY]",
      counter_detected: "EIN WAS-WAERE-WENN-LAUF IST VERFUEGBAR.",
      counter_prompt: ">> REPLAY-VEKTOR WAEHLEN.",
      counter_question: "KONTRAFAKTISCHES EREIGNIS.",
      counter_local: "Tag replayen",
      counter_parallel: "Parallele Welt",
      counter_cross_era: "Aerawechsel",
      counter_hold: "Linie halten",
      counter_local_line: "(kontrafaktisch: gleicher Tag erneut)",
      counter_parallel_line: "(kontrafaktisch: paralleler Zweig)",
      counter_cross_era_line: "(kontrafaktisch: aera-uebergreifend)",
      counter_hold_line: "(kontrafaktisch vertagt)",
      origin_header: "[ALEPH ORIGIN BRUCH]",
      origin_detected: "GIPFESIS-SCHLUESSELRAUM IST ERSCHIENEN.",
      origin_prompt: ">> EINTRETEN ODER POSITION HALTEN?",
      origin_question: "ORIGIN-REVEAL-EREIGNIS.",
      enter_origin: "In א gehen",
      hold_origin: "Position halten",
      origin_hold_line: "(origin vertagt)",
      origin_enter_line: "(origin schluessel akzeptiert)",
      fracture_jump_line: ({ era, day }) => `(Bruchsprung: ÄRA ${era}, TAG ${day})`,
      time_jump_line: ({ era }) => `(Zeitsprung: ${era})`,
      return_line: ({ era }) => `(zurück aus ${era})`,
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
      SCROLL:"SCROLL", SHIFT:"SHIFT", GATE:"GATE", BOOT:"BOOT", BREACH:"BREACH",
      TRIB:"TRIBUNAL", REPLAY:"REPLAY", ORIGIN:"ALEPH", TRACE:"TRACE",
    },
    de: {
      FLOW:"FLUSS", BACK:"ZURUECK", NEXT:"VOR", LOOP:"SCHLEIFE", ROLE:"ROLLE",
      WORMHOLE:"WURMLOCH", HACKLE:"HACKLE", JUMP:"SPRUNG", MAP:"KARTE",
      SCROLL:"SCROLL", SHIFT:"WECHSEL", GATE:"GATE", BOOT:"BOOT", BREACH:"BRUCH",
      TRIB:"TRIBUNAL", REPLAY:"REPLAY", ORIGIN:"ALEPH", TRACE:"SPUR",
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
  const slug = (s) => safeText(s)
    .toLowerCase()
    .replace(/[^a-z0-9à-öø-ÿ]+/g, ".")
    .replace(/^\.+|\.+$/g, "")
    .slice(0, 48);
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
    esc = esc.replace(/(^|[^\w])_([^_\n]+)_(?=[^\w]|$)/g, "$1<em>$2</em>");
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

  function randomSessionSeed(){
    const chars = "abcdefghjkmnpqrstuvwxyz23456789";
    let out = "";
    for(let i=0;i<10;i++){
      out += chars[Math.floor(Math.random() * chars.length)];
    }
    return out;
  }
  function readHashState(){
    const raw = safeText(location.hash || "").replace(/^#\??/, "");
    if(!raw) return {};
    try{
      const p = new URLSearchParams(raw);
      const seed = normalizeWS(p.get("seed") || "").toLowerCase();
      const lang = normalizeWS(p.get("lang") || "").toLowerCase();
      const world = normalizeWS(p.get("world") || "");
      const day = Number(p.get("day"));
      const cursor = Number(p.get("cursor"));
      return {
        seed: seed || "",
        lang: (lang === "de" || lang === "en") ? lang : "",
        world: world || "",
        day: Number.isFinite(day) ? day : null,
        cursor: Number.isFinite(cursor) ? cursor : null,
      };
    }catch{
      return {};
    }
  }
  function applyHashState(o = {}){
    if(o.lang === "de" || o.lang === "en"){
      state.lang = o.lang;
    }
    if(o.seed){
      state.sessionSeed = slug(o.seed).replace(/\./g, "") || o.seed;
    }
    if(o.world){
      state.worldId = o.world;
    }
    if(Number.isFinite(o.day) && o.day > 0){
      state.dayNo = Math.floor(o.day);
    }
    if(Number.isFinite(o.cursor) && o.cursor >= 0){
      state.cursor = Math.floor(o.cursor);
    }
  }
  function ensureSessionSeed(){
    if(state.sessionSeed) return state.sessionSeed;
    state.sessionSeed = randomSessionSeed();
    return state.sessionSeed;
  }
  function sessionHash(){
    const p = new URLSearchParams();
    p.set("seed", ensureSessionSeed());
    p.set("lang", state.lang || "en");
    if(state.worldId) p.set("world", state.worldId);
    if(Number.isFinite(state.dayNo)) p.set("day", String(Math.max(1, state.dayNo)));
    if(Number.isFinite(state.cursor)) p.set("cursor", String(Math.max(0, state.cursor)));
    return `#${p.toString()}`;
  }
  function syncSessionHash(){
    const h = sessionHash();
    if(location.hash !== h){
      history.replaceState(null, "", `${location.pathname}${h}`);
    }
  }
  function sessionLink(){
    return `${location.origin}${location.pathname}${sessionHash()}`;
  }
  function readCommunityStore(){
    try{
      const raw = localStorage.getItem(TRACE_STORE_KEY);
      if(!raw) return { contexts:{} };
      const parsed = JSON.parse(raw);
      if(parsed && typeof parsed === "object" && !Array.isArray(parsed)){
        if(!parsed.contexts || typeof parsed.contexts !== "object") parsed.contexts = {};
        return parsed;
      }
    }catch{}
    return { contexts:{} };
  }
  function writeCommunityStore(){
    try{
      localStorage.setItem(TRACE_STORE_KEY, JSON.stringify(state.community || { contexts:{} }));
    }catch{}
  }
  function activeMenuContext(){
    if(state.originMenu) return "origin";
    if(state.anomalyMenu) return "breach";
    if(state.tribunalMenu) return "tribunal";
    if(state.counterMenu) return "replay";
    if(state.mapMenu) return "map";
    if(state.timeMenu) return "jump";
    if(state.roleMenu) return "role";
    if(state.scrollMode) return "scroll";
    const world = getWorldById(state.worldId);
    const day = getDay(world, state.dayNo);
    const blocks = day?.blocks || [];
    const atEnd = state.cursor >= blocks.length;
    return atEnd ? "end" : "timeline";
  }
  function currentContextKey(mode = activeMenuContext()){
    const world = getWorldById(state.worldId);
    const era = worldEra(world) || PRESENT_ERA;
    const day = getDay(world, state.dayNo);
    const dayNo = day?.day || state.dayNo || 1;
    return `${mode}|${era}|${state.worldId || "?"}|D${dayNo}`;
  }
  function ensureContextBucket(key){
    if(!state.community || typeof state.community !== "object" || Array.isArray(state.community)){
      state.community = { contexts:{} };
    }
    if(!state.community.contexts || typeof state.community.contexts !== "object"){
      state.community.contexts = {};
    }
    if(!state.community.contexts[key]){
      state.community.contexts[key] = { total:0, choices:{}, labels:{}, marks:{} };
    }
    const b = state.community.contexts[key];
    if(typeof b.total !== "number") b.total = 0;
    if(!b.choices || typeof b.choices !== "object") b.choices = {};
    if(!b.labels || typeof b.labels !== "object") b.labels = {};
    if(!b.marks || typeof b.marks !== "object") b.marks = {};
    return b;
  }
  function dominantChoice(bucket){
    const entries = Object.entries(bucket?.choices || {});
    if(!entries.length || !(bucket?.total > 0)) return null;
    entries.sort((a,b) => b[1] - a[1]);
    const [key, count] = entries[0];
    const percent = Math.round((count / bucket.total) * 100);
    return { key, count, percent };
  }
  function contextSummary(mode = activeMenuContext()){
    const ctxKey = currentContextKey(mode);
    const bucket = ensureContextBucket(ctxKey);
    const top = dominantChoice(bucket);
    return {
      key: ctxKey,
      bucket,
      top,
      total: bucket.total || 0,
      variants: Object.keys(bucket.choices || {}).length,
    };
  }
  function globalSummary(){
    const contexts = state.community?.contexts || {};
    let total = 0;
    let count = 0;
    for(const key of Object.keys(contexts)){
      const bucket = contexts[key];
      if(!bucket || typeof bucket !== "object") continue;
      total += Number(bucket.total || 0);
      count += 1;
    }
    return { total, contexts: count };
  }
  function postTrace(event){
    if(!TRACE_ENDPOINT) return;
    const payload = JSON.stringify(event);
    try{
      if(navigator.sendBeacon){
        const blob = new Blob([payload], { type:"text/plain;charset=UTF-8" });
        navigator.sendBeacon(TRACE_ENDPOINT, blob);
        return;
      }
    }catch{}
    fetch(TRACE_ENDPOINT, {
      method:"POST",
      mode:"cors",
      keepalive:true,
      headers:{ "content-type":"text/plain;charset=UTF-8" },
      body: payload,
    }).catch(() => {});
  }
  function statsEndpoint(){
    if(!TRACE_ENDPOINT) return "";
    return TRACE_ENDPOINT.replace(/\/trace\/?$/i, "/stats");
  }
  function fetchRemoteStats(contextKey){
    const url = statsEndpoint();
    if(!url) return Promise.resolve(null);
    const u = `${url}${url.includes("?") ? "&" : "?"}context=${encodeURIComponent(contextKey)}`;
    return fetch(u, { cache:"no-store", mode:"cors" })
      .then(r => r.ok ? r.json() : null)
      .then(payload => {
        if(!payload || payload.ok === false) return null;
        return payload;
      })
      .catch(() => null);
  }
  function traceEvent(type, data = {}){
    const world = getWorldById(state.worldId);
    const day = getDay(world, state.dayNo);
    const event = {
      ts: new Date().toISOString(),
      type,
      seed: ensureSessionSeed(),
      lang: state.lang,
      worldId: state.worldId || "",
      era: worldEra(world) || PRESENT_ERA,
      day: day?.day || state.dayNo || 0,
      vector: state.vector || "FLOW",
      data,
    };
    state.traceLog.push(event);
    if(state.traceLog.length > MAX_TRACE_LOG){
      state.traceLog.splice(0, state.traceLog.length - MAX_TRACE_LOG);
    }
    postTrace(event);
  }
  function registerChoice(label, mode){
    const normalizedLabel = normalizeWS(label);
    const choiceKey = slug(normalizedLabel) || `choice.${Date.now().toString(36)}`;
    const ctxKey = currentContextKey(mode);
    const bucket = ensureContextBucket(ctxKey);
    const domBefore = dominantChoice(bucket);
    bucket.total += 1;
    bucket.choices[choiceKey] = (bucket.choices[choiceKey] || 0) + 1;
    bucket.labels[choiceKey] = normalizedLabel;
    writeCommunityStore();
    if(domBefore && bucket.total >= 5){
      if(domBefore.key === choiceKey){
        state.drift = clamp01(state.drift * 0.988);
      } else {
        state.drift = clamp01(state.drift + 0.02);
        spendHeat(0.05);
      }
    }
    traceEvent("choice", {
      context: ctxKey,
      choice: choiceKey,
      label: normalizedLabel,
      priorMajority: domBefore ? (bucket.labels[domBefore.key] || domBefore.key) : null,
      priorMajorityPercent: domBefore ? domBefore.percent : null,
    });
  }
  function maybeEmitCommunityHint(mode){
    if(!["timeline","end","breach","tribunal","replay","origin"].includes(mode)) return false;
    const now = Date.now();
    if(now < (state.nextCommunityHintAt || 0)) return false;
    const ctxKey = currentContextKey(mode);
    const bucket = ensureContextBucket(ctxKey);
    if(bucket.total < 4) return false;
    const top = dominantChoice(bucket);
    if(!top) return false;
    const sig = `${ctxKey}::${bucket.total}`;
    if(state.lastCommunityHintSig === sig) return false;
    const choiceLabel = bucket.labels[top.key] || top.key;
    state.buffer.push({
      text:t("community_seen_line", {
        percent: top.percent,
        choice: choiceLabel,
        total: bucket.total,
        count: top.count,
      }),
      hackled:false,
    });
    state.buffer.push({ text:t("community_ask_line"), hackled:false });
    state.scrollTopNext = true;
    state.lastCommunityHintSig = sig;
    state.nextCommunityHintAt = now + 28000 + Math.floor(Math.random() * 28000);
    return true;
  }
  function showStatsPulse(){
    const ctx = contextSummary();
    const global = globalSummary();
    state.buffer.push({
      text:t("stats_context_line", { context: ctx.key, total: ctx.total, variants: ctx.variants }),
      hackled:false,
    });
    if(ctx.top){
      state.buffer.push({
        text:t("stats_top_line", {
          choice: ctx.bucket.labels[ctx.top.key] || ctx.top.key,
          percent: ctx.top.percent,
          count: ctx.top.count,
        }),
        hackled:false,
      });
    }
    state.buffer.push({
      text:t("stats_global_line", { total: global.total, contexts: global.contexts }),
      hackled:false,
    });
    state.scrollTopNext = true;
    traceEvent("stats_pulse", {
      context: ctx.key,
      total: ctx.total,
      top: ctx.top ? (ctx.bucket.labels[ctx.top.key] || ctx.top.key) : null,
      globalTotal: global.total,
    });
    fetchRemoteStats(ctx.key).then(remote => {
      if(!remote || !remote.totals) return;
      const totals = remote.totals || {};
      state.buffer.push({
        text:t("stats_remote_line", {
          choices: Number(totals.choices || 0),
          sessions: Number(totals.sessions || 0),
          events: Number(totals.events || 0),
        }),
        hackled:false,
      });
      const top = remote.context?.top || null;
      if(top){
        state.buffer.push({
          text:t("stats_remote_top_line", {
            choice: top.label || top.key || "n/a",
            percent: Number(top.percent || 0),
            count: Number(top.count || 0),
          }),
          hackled:false,
        });
      }
      state.scrollTopNext = true;
      render();
      persist();
    });
  }
  function copySessionLinkAsync(){
    const link = sessionLink();
    return new Promise((resolve) => {
      const finish = (copied) => resolve({ copied, link });
      try{
        if(navigator.clipboard && navigator.clipboard.writeText){
          navigator.clipboard.writeText(link).then(() => finish(true)).catch(() => finish(false));
          return;
        }
      }catch{}
      finish(false);
    });
  }
  function downloadSessionLog(linkOverride){
    const world = getWorldById(state.worldId);
    const link = linkOverride || sessionLink();
    const payload = {
      exportedAt: new Date().toISOString(),
      seed: ensureSessionSeed(),
      link,
      startedAt: state.sessionStartedAt ? new Date(state.sessionStartedAt).toISOString() : null,
      lang: state.lang,
      worldId: state.worldId,
      era: worldEra(world) || PRESENT_ERA,
      day: state.dayNo,
      cursor: state.cursor,
      vector: state.vector,
      traceLog: state.traceLog,
      community: state.community,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type:"application/json" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `ki-dipfies-session-${ensureSessionSeed()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(href), 1200);
    traceEvent("session_download", { size: payload.traceLog.length });
    return payload;
  }
  function exportSeedCapsule(){
    copySessionLinkAsync().then(({ copied, link }) => {
      const payload = downloadSessionLog(link);
      state.buffer.push({ text: copied ? t("seed_capsule_done") : t("seed_capsule_partial"), hackled:false });
      state.buffer.push({ text:t("session_link_line", { link }), hackled:false });
      state.scrollTopNext = true;
      traceEvent("seed_capsule", {
        copied,
        link,
        traceCount: payload.traceLog.length,
      });
      render();
      persist();
    });
  }
  function diegeticChoiceLabel(label, idx){
    const cmd = slug(label).replace(/\./g, ".") || `vector.${idx + 1}`;
    const n = String(idx + 1).padStart(2, "0");
    return `[${n}] run ${cmd} :: ${safeText(label).toUpperCase()}`;
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
    state.anomalyMenu = false;
    state.anomalySnapshot = null;
    clearAnomalyChain();
    clearTribunalState();
    clearCounterState();
    clearOriginState();
    state.scrollTopNext = true;
    state.speakerIndex = buildSpeakerIndex();
    state.keywordIndex = buildKeywordIndex();
    rebuildMarkov();
    if(!state.buffer.length){
      state.buffer = [{ text:t("entering_day", { day: getDay(w,state.dayNo)?.day || state.dayNo }), hackled:false }];
      appendChunk({hackle:false});
    }
    markVisit(state.worldId, state.dayNo, 1);
    render();
    persist();
  }

  function isOriginWorldId(id){
    return ORIGIN_WORLD_IDS.includes(id);
  }
  function hasOriginWorld(){
    return (state.worlds?.worlds || []).some(w => isOriginWorldId(w.id) && (w.days || []).length);
  }
  function playableWorlds(){
    const worlds = state.worlds?.worlds || [];
    const live = worlds.filter(w => (w.days || []).length);
    if(state.originUnlocked) return live;
    const filtered = live.filter(w => !isOriginWorldId(w.id));
    return filtered.length ? filtered : live;
  }
  function primaryWorlds(){
    const playable = playableWorlds();
    const pick = playable.filter(w => PRIMARY_WORLD_IDS.includes(w.id));
    return pick.length ? pick : playable.filter(w => w.id !== "theory-tragedy" && !isOriginWorldId(w.id));
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
      if(!map.has(era)) map.set(era, []);
      map.get(era).push(w);
    }
    return map;
  }
  function mapEraGroups(){
    const map = new Map();
    const worlds = (state.worlds?.worlds || []).filter(w => (w.days || []).length);
    for(const w of worlds){
      const era = worldEra(w);
      if(!era) continue;
      if(!map.has(era)) map.set(era, []);
      map.get(era).push(w);
    }
    return map;
  }
  function eraSortKey(era){
    if(era === ORIGIN_ERA) return -10000;
    if(/^\d{4}$/.test(era)) return Number(era);
    return 100000;
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
    markVisit(state.worldId, state.dayNo, 2);
    return true;
  }
  function erasForTimeMenu(){
    const groups = eraGroups();
    const eras = Array.from(groups.keys()).filter(e => e !== PRESENT_ERA);
    eras.sort((a,b) => {
      const da = eraSortKey(a);
      const db = eraSortKey(b);
      if(da !== db) return da - db;
      return a.localeCompare(b);
    });
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
    state.buffer = [{ text:t("time_jump_line", { era }), hackled:false }];
    state.chunkStack = [];
    state.scrollMode = false;
    state.scrollSnapshot = null;
    clearTribunalState();
    clearCounterState();
    state.scrollTopNext = true;
    markVisit(state.worldId, state.dayNo, 2);
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
    state.buffer = [{ text:t("return_line", { era: currentEra }), hackled:false }];
    state.chunkStack = [];
    state.scrollMode = false;
    state.scrollSnapshot = null;
    clearTribunalState();
    clearCounterState();
    state.scrollTopNext = true;
    state.prevWorld = null;
    state.prevDay = null;
    state.prevCursor = null;
    markVisit(state.worldId, state.dayNo, 2);
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
  function getAnyWorldById(id){
    const worlds = state.worlds?.worlds || [];
    return worlds.find(w => w.id === id) || null;
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
  function visitKey(worldId, dayNo){
    return `${safeText(worldId)}::${Number(dayNo) || 1}`;
  }
  function markVisit(worldId = state.worldId, dayNo = state.dayNo, bump = 1){
    if(!worldId) return;
    if(!state.visits || typeof state.visits !== "object" || Array.isArray(state.visits)){
      state.visits = {};
    }
    const key = visitKey(worldId, dayNo);
    const n = Number(bump) || 1;
    state.visits[key] = (state.visits[key] || 0) + Math.max(1, n);
    state.lastVisitKey = key;
    const era = worldEra(getWorldById(worldId));
    if(era && !state.erasSeen.includes(era)){
      state.erasSeen = state.erasSeen.concat(era).slice(-24);
    }
  }
  function listWorldDayTargets(){
    const out = [];
    for(const world of playableWorlds()){
      const era = worldEra(world) || PRESENT_ERA;
      for(const dayNo of allDayNos(world)){
        const key = visitKey(world.id, dayNo);
        out.push({
          worldId: world.id,
          dayNo,
          era,
          visits: state.visits[key] || 0,
        });
      }
    }
    return out;
  }
  function pickLeastVisitedTarget({ excludeCurrent = true } = {}){
    let targets = listWorldDayTargets();
    if(excludeCurrent){
      targets = targets.filter(t => !(t.worldId === state.worldId && t.dayNo === state.dayNo));
    }
    if(!targets.length) return null;
    targets.sort((a,b) => a.visits - b.visits);
    const floor = targets[0].visits;
    const bucket = targets.filter(t => t.visits <= floor + 1);
    return bucket[Math.floor(Math.random() * Math.min(bucket.length, 8))] || targets[0];
  }
  function randomLineFromWorld(world){
    if(!world) return "";
    const days = world.days || [];
    if(!days.length) return "";
    for(let k=0;k<10;k++){
      const day = days[Math.floor(Math.random() * days.length)];
      const pool = (day.blocks || []).filter(b => plainText(b).trim());
      if(!pool.length) continue;
      return pool[Math.floor(Math.random() * pool.length)];
    }
    return "";
  }
  function sampleConvergenceLines(count = 4){
    const current = getWorldById(state.worldId);
    const currentEra = worldEra(current) || PRESENT_ERA;
    const worlds = playableWorlds().slice();
    if(!worlds.length) return [];
    const foreign = worlds.filter(w => (worldEra(w) || PRESENT_ERA) !== currentEra);
    const local = worlds.filter(w => (worldEra(w) || PRESENT_ERA) === currentEra && w.id !== state.worldId);
    let pool = foreign.length ? foreign.concat(local) : worlds.filter(w => w.id !== state.worldId);
    if(!pool.length) pool = worlds;
    for(let i = pool.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const lines = [];
    for(let i=0;i<count;i++){
      const src = pool[i % pool.length];
      const line = randomLineFromWorld(src);
      if(line) lines.push(line);
    }
    return lines;
  }
  function rollCascadeDepth(){
    let depth = 2;
    if(Math.random() < 0.48) depth += 1;
    if(Math.random() < 0.18) depth += 1;
    return Math.min(4, depth);
  }
  function clearAnomalyChain(){
    state.anomalyDepth = 0;
    state.anomalyStep = 0;
    state.anomalyCoherence = 0;
    state.anomalyTrail = [];
  }
  function trailSymbol(choice){
    if(choice === "stabilize") return "S";
    if(choice === "fracture") return "F";
    return "R";
  }
  function buildAnomalyBuffer(){
    const step = Math.max(1, state.anomalyStep || 1);
    const total = Math.max(step, state.anomalyDepth || step);
    const lines = sampleConvergenceLines(4 + Math.floor(Math.random() * 3));
    const trace = (state.anomalyTrail || []).join("-");
    const out = [
      { text:t("anomaly_header"), hackled:false },
      { text:t("anomaly_stage", { step, total }), hackled:false },
      { text:t("anomaly_detected"), hackled:false },
    ];
    if(trace) out.push({ text:t("anomaly_trace", { trace }), hackled:false });
    out.push(...lines.map(line => ({ text: line, hackled: Math.random() < 0.35 })));
    out.push({ text:(step >= total ? t("anomaly_prompt_final") : t("anomaly_prompt")), hackled:false });
    return out;
  }
  function openAnomalyMenu(){
    const lines = sampleConvergenceLines(4);
    if(!lines.length) return false;
    state.anomalySnapshot = {
      worldId: state.worldId,
      dayNo: state.dayNo,
      cursor: state.cursor,
      buffer: state.buffer.slice(),
      chunkStack: state.chunkStack.slice(),
      scrollMode: state.scrollMode,
      scrollSnapshot: state.scrollSnapshot,
    };
    clearCounterState();
    state.anomalyMenu = true;
    state.scrollMode = false;
    state.scrollSnapshot = null;
    state.timeMenu = false;
    state.mapMenu = false;
    state.roleMenu = false;
    state.vector = "BREACH";
    state.anomalyDepth = rollCascadeDepth();
    state.anomalyStep = 1;
    state.anomalyCoherence = 0;
    state.anomalyTrail = [];
    state.buffer = buildAnomalyBuffer();
    state.scrollTopNext = true;
    maybeSprite("WORMHOLE");
    return true;
  }
  function restoreFromAnomalySnapshot(){
    const snap = state.anomalySnapshot;
    if(!snap) return false;
    state.worldId = snap.worldId;
    state.dayNo = snap.dayNo;
    state.cursor = snap.cursor;
    state.buffer = snap.buffer.slice();
    state.chunkStack = snap.chunkStack.slice();
    state.scrollMode = false;
    state.scrollSnapshot = null;
    state.timeMenu = false;
    state.mapMenu = false;
    state.roleMenu = false;
    state.anomalySnapshot = null;
    state.anomalyMenu = false;
    clearAnomalyChain();
    state.scrollTopNext = true;
    return true;
  }
  function applyStabilizeResolution(){
    if(!restoreFromAnomalySnapshot()){
      state.anomalyMenu = false;
      clearAnomalyChain();
      return;
    }
    state.buffer.push({ text:t("anomaly_resolved_stable"), hackled:false });
    state.buffer.push({ text:t("stabilized_line"), hackled:false });
    state.drift = clamp01(state.drift * 0.72);
    markVisit();
  }
  function applyFractureResolution(){
    const target = pickLeastVisitedTarget({ excludeCurrent:true }) || pickLeastVisitedTarget({ excludeCurrent:false });
    state.anomalyMenu = false;
    state.anomalySnapshot = null;
    clearAnomalyChain();
    state.scrollMode = false;
    state.scrollSnapshot = null;
    state.timeMenu = false;
    state.mapMenu = false;
    state.roleMenu = false;
    if(!target){
      appendWormhole({ hackle:true });
      return;
    }
    state.worldId = target.worldId;
    state.dayNo = target.dayNo;
    const world = getWorldById(state.worldId);
    const day = getDay(world, state.dayNo);
    const blocks = day?.blocks || [];
    const maxStart = Math.max(0, blocks.length - 12);
    state.cursor = Math.floor(Math.random() * (maxStart + 1));
    state.chunkStack = [];
    state.buffer = [
      { text:t("anomaly_resolved_fracture"), hackled:false },
      { text:t("fracture_jump_line", { era: target.era, day: state.dayNo }), hackled:false },
    ];
    appendChunk({ hackle: Math.random() < 0.55 });
    state.drift = clamp01(state.drift + 0.12);
    markVisit(state.worldId, state.dayNo, 2);
  }
  function applySpillResolution(){
    const restored = restoreFromAnomalySnapshot();
    if(!restored){
      state.anomalyMenu = false;
      clearAnomalyChain();
      appendWormhole({ hackle:true, replace:false });
      return;
    }
    state.buffer.push({ text:t("anomaly_resolved_spill"), hackled:false });
    appendWormhole({ hackle:true, replace:false });
    state.drift = clamp01(state.drift + 0.08);
    markVisit(state.worldId, state.dayNo, 1);
  }
  function advanceAnomaly(choice){
    if(!state.anomalyMenu){
      if(choice === "stabilize") applyStabilizeResolution();
      else if(choice === "fracture") applyFractureResolution();
      else applySpillResolution();
      return;
    }
    state.anomalyCoherence += (
      choice === "stabilize" ? 1 :
      choice === "fracture" ? -1 :
      (Math.random() < 0.5 ? 1 : -1)
    );
    state.anomalyTrail.push(trailSymbol(choice));
    const finalStep = state.anomalyStep >= state.anomalyDepth;
    if(!finalStep){
      state.anomalyStep += 1;
      state.buffer = buildAnomalyBuffer();
      state.scrollTopNext = true;
      state.drift = clamp01(state.drift + (choice === "fracture" ? 0.06 : 0.03));
      maybeSprite("WORMHOLE");
      return;
    }
    if(state.anomalyCoherence >= 2){
      applyStabilizeResolution();
      return;
    }
    if(state.anomalyCoherence <= -1){
      applyFractureResolution();
      return;
    }
    if(choice === "fracture" && Math.random() < 0.45){
      applyFractureResolution();
      return;
    }
    applySpillResolution();
  }
  function stabilizeTimeline(){
    advanceAnomaly("stabilize");
  }
  function followFracture(){
    advanceAnomaly("fracture");
  }
  function rideBreach(){
    advanceAnomaly("ride");
  }
  function maybeTriggerConvergence(vector){
    if(vector === "BREACH" || vector === "TRIB" || vector === "REPLAY" || vector === "ORIGIN") return false;
    if(state.anomalyMenu || state.tribunalMenu || state.counterMenu || state.originMenu || state.timeMenu || state.mapMenu || state.roleMenu || state.scrollMode) return false;
    if(state.clicks < 3) return false;
    if(eraGroups().size < 2) return false;
    const now = Date.now();
    if(now < state.nextBreachAt) return false;
    if(!canSpendHeat(0.56)) return false;
    const weights = {
      FLOW:0.07,
      HACKLE:0.14,
      WORMHOLE:0.18,
      SHIFT:0.12,
      NEXT:0.10,
      JUMP:0.11,
      BACK:0.05,
      ROLE:0.04,
      MAP:0.03,
      SCROLL:0.02,
      LOOP:0.06,
      GATE:0.08,
    };
    const base = weights[vector] ?? 0.05;
    const bias = Number(state.tribunalBias || 0);
    const p = Math.max(0.01, Math.min(0.34, base + (state.drift * 0.18) - (bias * 0.015)));
    if(Math.random() >= p) return false;
    const opened = openAnomalyMenu();
    if(opened){
      spendHeat(0.56);
      state.nextBreachAt = now + 45000 + Math.floor(Math.random() * 70000);
    }
    return opened;
  }
  function clearTribunalState(){
    state.tribunalMenu = false;
    state.tribunalSnapshot = null;
  }
  function openTribunalMenu(){
    const lines = state.ghostLines || [];
    if(!lines.length) return false;
    const pick = normalizeWS(lines[Math.floor(Math.random() * lines.length)] || "");
    if(!pick) return false;
    state.tribunalSnapshot = {
      worldId: state.worldId,
      dayNo: state.dayNo,
      cursor: state.cursor,
      buffer: state.buffer.slice(),
      chunkStack: state.chunkStack.slice(),
      scrollMode: state.scrollMode,
      scrollSnapshot: state.scrollSnapshot,
    };
    clearCounterState();
    state.tribunalMenu = true;
    state.anomalyMenu = false;
    state.anomalySnapshot = null;
    clearAnomalyChain();
    state.scrollMode = false;
    state.scrollSnapshot = null;
    state.timeMenu = false;
    state.mapMenu = false;
    state.roleMenu = false;
    state.vector = "TRIB";
    state.buffer = [
      { text:t("tribunal_header"), hackled:false },
      { text:t("tribunal_detected"), hackled:false },
      { text:`"${pick}"`, hackled:false },
      { text:t("tribunal_prompt"), hackled:false },
    ];
    state.scrollTopNext = true;
    maybeSprite("KEYWORD");
    return true;
  }
  function restoreFromTribunalSnapshot(){
    const snap = state.tribunalSnapshot;
    if(!snap) return false;
    state.worldId = snap.worldId;
    state.dayNo = snap.dayNo;
    state.cursor = snap.cursor;
    state.buffer = snap.buffer.slice();
    state.chunkStack = snap.chunkStack.slice();
    state.scrollMode = false;
    state.scrollSnapshot = null;
    state.timeMenu = false;
    state.mapMenu = false;
    state.roleMenu = false;
    clearTribunalState();
    clearCounterState();
    state.scrollTopNext = true;
    return true;
  }
  function tickTribunalBias(){
    if(!state.tribunalBiasTurns || state.tribunalBiasTurns <= 0){
      state.tribunalBias = 0;
      state.tribunalBiasTurns = 0;
      return;
    }
    const sign = state.tribunalBias > 0 ? 1 : (state.tribunalBias < 0 ? -1 : 0);
    if(sign > 0) state.drift = clamp01(state.drift - (0.002 * Math.abs(state.tribunalBias)));
    else if(sign < 0) state.drift = clamp01(state.drift + (0.002 * Math.abs(state.tribunalBias)));
    state.tribunalBiasTurns -= 1;
    if(state.tribunalBiasTurns <= 0){
      state.tribunalBias = 0;
      state.tribunalBiasTurns = 0;
    }
  }
  function resolveTribunal(choice){
    const restored = restoreFromTribunalSnapshot();
    if(!restored){
      clearTribunalState();
      clearCounterState();
      return;
    }
    if(choice === "affirm"){
      state.tribunalBias = 2;
      state.tribunalBiasTurns = 12;
      state.drift = clamp01(state.drift * 0.82);
      state.eventHeat = Math.max(0, (state.eventHeat || 0) - 0.35);
      state.buffer.push({ text:t("tribunal_affirm_line"), hackled:false });
    } else if(choice === "refuse"){
      state.tribunalBias = -2;
      state.tribunalBiasTurns = 10;
      state.drift = clamp01(state.drift + 0.12);
      state.buffer.push({ text:t("tribunal_refuse_line"), hackled:false });
      if(Math.random() < 0.40) appendWormhole({ hackle:true, replace:false });
    } else {
      state.tribunalBias = 0;
      state.tribunalBiasTurns = 7;
      state.drift = clamp01(state.drift + 0.03);
      state.buffer.push({ text:t("tribunal_abstain_line"), hackled:false });
    }
    markVisit(state.worldId, state.dayNo, 1);
  }
  function maybeTriggerTribunal(vector){
    if(vector === "BREACH" || vector === "TRIB" || vector === "REPLAY" || vector === "ORIGIN") return false;
    if(state.anomalyMenu || state.tribunalMenu || state.counterMenu || state.originMenu || state.timeMenu || state.mapMenu || state.roleMenu || state.scrollMode) return false;
    if(state.clicks < 5) return false;
    const lines = state.ghostLines || [];
    if(!lines.length) return false;
    const now = Date.now();
    if(now < state.nextTribunalAt) return false;
    if(!canSpendHeat(0.46)) return false;
    const weights = {
      FLOW:0.04,
      HACKLE:0.10,
      WORMHOLE:0.08,
      SHIFT:0.03,
      NEXT:0.03,
      BACK:0.03,
      ROLE:0.02,
      MAP:0.02,
      JUMP:0.03,
      SCROLL:0.01,
      LOOP:0.02,
      GATE:0.05,
    };
    const base = weights[vector] ?? 0.03;
    const driftBonus = Math.max(0, state.drift - 0.18) * 0.22;
    const p = Math.min(0.24, base + driftBonus);
    if(Math.random() >= p) return false;
    const opened = openTribunalMenu();
    if(opened){
      spendHeat(0.46);
      state.nextTribunalAt = now + 90000 + Math.floor(Math.random() * 140000);
    }
    return opened;
  }
  function clearCounterState(){
    state.counterMenu = false;
    state.counterSnapshot = null;
  }
  function openCounterMenu(){
    const world = getWorldById(state.worldId);
    const day = getDay(world, state.dayNo);
    const pool = (day?.blocks || []).filter(b => plainText(b).trim());
    const anchor = pool.length
      ? pool[Math.floor(Math.random() * pool.length)]
      : randomLineFromWorld(world);
    if(!anchor) return false;
    state.counterSnapshot = {
      worldId: state.worldId,
      dayNo: state.dayNo,
      cursor: state.cursor,
      buffer: state.buffer.slice(),
      chunkStack: state.chunkStack.slice(),
      scrollMode: state.scrollMode,
      scrollSnapshot: state.scrollSnapshot,
    };
    state.counterMenu = true;
    state.anomalyMenu = false;
    state.anomalySnapshot = null;
    clearAnomalyChain();
    clearTribunalState();
    state.scrollMode = false;
    state.scrollSnapshot = null;
    state.timeMenu = false;
    state.mapMenu = false;
    state.roleMenu = false;
    state.vector = "REPLAY";
    state.buffer = [
      { text:t("counter_header"), hackled:false },
      { text:t("counter_detected"), hackled:false },
      { text:anchor, hackled:false },
      { text:t("counter_prompt"), hackled:false },
    ];
    state.scrollTopNext = true;
    maybeSprite("KEYWORD");
    return true;
  }
  function restoreFromCounterSnapshot(){
    const snap = state.counterSnapshot;
    if(!snap) return false;
    state.worldId = snap.worldId;
    state.dayNo = snap.dayNo;
    state.cursor = snap.cursor;
    state.buffer = snap.buffer.slice();
    state.chunkStack = snap.chunkStack.slice();
    state.scrollMode = false;
    state.scrollSnapshot = null;
    state.timeMenu = false;
    state.mapMenu = false;
    state.roleMenu = false;
    clearCounterState();
    state.scrollTopNext = true;
    return true;
  }
  function pickCounterTarget(mode){
    const currentWorld = getWorldById(state.worldId);
    const currentEra = worldEra(currentWorld) || PRESENT_ERA;
    const targets = listWorldDayTargets();
    if(!targets.length) return null;
    const choose = (arr) => {
      if(!arr.length) return null;
      arr.sort((a,b) => a.visits - b.visits);
      const floor = arr[0].visits;
      const bucket = arr.filter(t => t.visits <= floor + 1);
      return bucket[Math.floor(Math.random() * Math.min(bucket.length, 8))] || arr[0];
    };
    if(mode === "local"){
      return { worldId: state.worldId, dayNo: state.dayNo, era: currentEra, visits: state.visits[visitKey(state.worldId, state.dayNo)] || 0 };
    }
    if(mode === "parallel"){
      return choose(targets.filter(t => t.era === currentEra && t.worldId !== state.worldId));
    }
    if(mode === "cross"){
      return choose(targets.filter(t => t.era !== currentEra));
    }
    return pickLeastVisitedTarget({ excludeCurrent:true }) || pickLeastVisitedTarget({ excludeCurrent:false });
  }
  function applyCounterResolution(mode){
    const target = pickCounterTarget(mode);
    if(!target) return false;
    state.worldId = target.worldId;
    const world = getWorldById(state.worldId);
    const days = allDayNos(world);
    if(!days.length) return false;
    state.dayNo = days.includes(target.dayNo) ? target.dayNo : days[Math.floor(Math.random() * days.length)];
    const day = getDay(world, state.dayNo);
    const blocks = day?.blocks || [];
    const maxStart = Math.max(0, blocks.length - 10);
    state.cursor = Math.floor(Math.random() * (maxStart + 1));
    state.chunkStack = [];
    state.scrollMode = false;
    state.scrollSnapshot = null;
    state.timeMenu = false;
    state.mapMenu = false;
    state.roleMenu = false;
    const lineKey = (
      mode === "cross" ? "counter_cross_era_line" :
      mode === "parallel" ? "counter_parallel_line" :
      "counter_local_line"
    );
    state.buffer = [
      { text:t(lineKey), hackled:false },
      { text:t("entering_day", { day: state.dayNo }), hackled:false },
    ];
    if(mode === "cross" && Math.random() < 0.33){
      appendWormhole({ hackle:true, replace:false });
    }
    state.scrollTopNext = true;
    state.drift = clamp01(state.drift + (mode === "cross" ? 0.11 : 0.05));
    localStorage.setItem("ki_world", state.worldId || "");
    markVisit(state.worldId, state.dayNo, 2);
    return true;
  }
  function resolveCounter(choice){
    const restored = restoreFromCounterSnapshot();
    if(!restored){
      clearCounterState();
      return;
    }
    if(choice === "hold"){
      state.buffer.push({ text:t("counter_hold_line"), hackled:false });
      state.drift = clamp01(state.drift * 0.97);
      markVisit(state.worldId, state.dayNo, 1);
      return;
    }
    const mode = (
      choice === "parallel" ? "parallel" :
      choice === "cross" ? "cross" :
      "local"
    );
    const ok = applyCounterResolution(mode);
    if(!ok){
      state.buffer.push({ text:t("counter_hold_line"), hackled:false });
      markVisit(state.worldId, state.dayNo, 1);
    }
  }
  function maybeTriggerCounter(vector){
    if(vector === "BREACH" || vector === "TRIB" || vector === "REPLAY" || vector === "ORIGIN") return false;
    if(state.anomalyMenu || state.tribunalMenu || state.counterMenu || state.originMenu || state.timeMenu || state.mapMenu || state.roleMenu || state.scrollMode) return false;
    if(state.clicks < 6) return false;
    const now = Date.now();
    if(now < state.nextCounterAt) return false;
    if(!canSpendHeat(0.40)) return false;
    const world = getWorldById(state.worldId);
    const day = getDay(world, state.dayNo);
    const atEnd = !!day && state.cursor >= (day.blocks || []).length;
    const weights = {
      FLOW:0.03,
      HACKLE:0.07,
      WORMHOLE:0.08,
      SHIFT:0.09,
      NEXT:0.11,
      JUMP:0.08,
      BACK:0.05,
      ROLE:0.02,
      MAP:0.02,
      SCROLL:0.01,
      LOOP:0.08,
      GATE:0.04,
    };
    const base = weights[vector] ?? 0.03;
    const dayEndBonus = atEnd ? 0.07 : 0;
    const driftBonus = Math.max(0, state.drift - 0.30) * 0.12;
    const p = Math.min(0.26, base + dayEndBonus + driftBonus);
    if(Math.random() >= p) return false;
    const opened = openCounterMenu();
    if(opened){
      spendHeat(0.40);
      state.nextCounterAt = now + 95000 + Math.floor(Math.random() * 150000);
    }
    return opened;
  }
  function clearOriginState(){
    state.originMenu = false;
    state.originSnapshot = null;
  }
  function triggerOriginSpectacle(){
    if(state.originSpectacleSeen) return;
    state.originSpectacleSeen = true;
    document.body.classList.add("origin-breach");
    setTimeout(() => document.body.classList.remove("origin-breach"), 1900);
    // Burst three sprite waves on first Aleph reveal for a singular "system rupture" feel.
    spawnSpriteCluster();
    setTimeout(() => spawnSpriteCluster(), 140);
    setTimeout(() => spawnSpriteCluster(), 320);
  }
  function openOriginMenu(){
    const origin = getAnyWorldById(ORIGIN_WORLD_IDS[0]);
    if(!origin || !isOriginWorldId(origin.id)) return false;
    const sample = randomLineFromWorld(origin);
    state.originSnapshot = {
      worldId: state.worldId,
      dayNo: state.dayNo,
      cursor: state.cursor,
      buffer: state.buffer.slice(),
      chunkStack: state.chunkStack.slice(),
      scrollMode: state.scrollMode,
      scrollSnapshot: state.scrollSnapshot,
    };
    state.originMenu = true;
    state.anomalyMenu = false;
    state.anomalySnapshot = null;
    clearAnomalyChain();
    clearTribunalState();
    clearCounterState();
    state.scrollMode = false;
    state.scrollSnapshot = null;
    state.timeMenu = false;
    state.mapMenu = false;
    state.roleMenu = false;
    state.vector = "ORIGIN";
    state.buffer = [
      { text:t("origin_header"), hackled:false },
      { text:t("origin_detected"), hackled:false },
      { text: sample || t("origin_detected"), hackled:false },
      { text:t("origin_prompt"), hackled:false },
    ];
    state.scrollTopNext = true;
    triggerOriginSpectacle();
    return true;
  }
  function restoreFromOriginSnapshot(){
    const snap = state.originSnapshot;
    if(!snap) return false;
    state.worldId = snap.worldId;
    state.dayNo = snap.dayNo;
    state.cursor = snap.cursor;
    state.buffer = snap.buffer.slice();
    state.chunkStack = snap.chunkStack.slice();
    state.scrollMode = false;
    state.scrollSnapshot = null;
    state.timeMenu = false;
    state.mapMenu = false;
    state.roleMenu = false;
    clearOriginState();
    state.scrollTopNext = true;
    return true;
  }
  function jumpToOriginWorld(){
    const origin = getAnyWorldById(ORIGIN_WORLD_IDS[0]);
    if(!origin || !isOriginWorldId(origin.id)) return false;
    state.originUnlocked = true;
    state.originFirstJumpDone = true;
    const days = allDayNos(origin);
    if(!days.length) return false;
    state.worldId = origin.id;
    state.dayNo = days[0];
    state.cursor = 0;
    state.chunkStack = [];
    state.scrollMode = false;
    state.scrollSnapshot = null;
    state.timeMenu = false;
    state.mapMenu = false;
    state.roleMenu = false;
    state.buffer = [
      { text:t("origin_enter_line"), hackled:false },
      { text:t("entering_day", { day: state.dayNo }), hackled:false },
    ];
    state.scrollTopNext = true;
    localStorage.setItem("ki_world", state.worldId || "");
    markVisit(state.worldId, state.dayNo, 2);
    return true;
  }
  function resolveOrigin(choice){
    const restored = restoreFromOriginSnapshot();
    if(!restored){
      clearOriginState();
      return;
    }
    state.originUnlocked = true;
    if(choice === "enter"){
      if(!jumpToOriginWorld()){
        state.buffer.push({ text:t("origin_hold_line"), hackled:false });
      }
      return;
    }
    state.buffer.push({ text:t("origin_hold_line"), hackled:false });
    markVisit(state.worldId, state.dayNo, 1);
  }
  function maybeTriggerOrigin(vector){
    if(!AUTO_ORIGIN_REVEAL) return false;
    if(vector === "BREACH" || vector === "TRIB" || vector === "REPLAY" || vector === "ORIGIN") return false;
    if(state.originUnlocked) return false;
    if(!hasOriginWorld()) return false;
    if(state.anomalyMenu || state.tribunalMenu || state.counterMenu || state.originMenu || state.timeMenu || state.mapMenu || state.roleMenu || state.scrollMode) return false;
    if((state.mapVisits || 0) < 1) return false;
    if(state.clicks < 8) return false;
    if(state.actionCount < 6) return false;
    const now = Date.now();
    if(now < state.nextOriginAt) return false;
    if(!canSpendHeat(0.42)) return false;
    const eligibleVectors = new Set(["WORMHOLE", "REPLAY", "SHIFT", "JUMP", "HACKLE"]);
    const forced = state.actionCount >= 12;
    const p = forced ? 1 : (eligibleVectors.has(vector) ? 0.16 : 0.04);
    if(Math.random() >= p) return false;
    const opened = openOriginMenu();
    if(opened){
      spendHeat(0.42);
      state.nextOriginAt = now + 110000 + Math.floor(Math.random() * 170000);
    }
    return opened;
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
    if(!canSpendHeat(0.16)) return;
    const p = SPRITE_PROB[reason] ?? 0.12;
    if(Math.random() > p) return;
    const spawned = spawnSpriteCluster();
    if(!spawned) return;
    spendHeat(0.10 + Math.min(0.45, spawned / 70));
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
    if(!list.length) return 0;
    const host = $("#sprites");
    if(!host) return 0;
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
    if(total <= 0) return 0;
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
    return chosen.length;
  }
  function spriteTick(){
    if(state.clicks < 2) return;
    if(!state.spriteList || !state.spriteList.length) return;
    const now = Date.now();
    if(!state.nextSpriteAt) state.nextSpriteAt = now + 20000 + Math.random() * 25000;
    if(now < state.nextSpriteAt) return;
    if(!canSpendHeat(0.22)){
      state.nextSpriteAt = now + 12000 + Math.random() * 22000;
      return;
    }
    const spawned = spawnSpriteCluster();
    if(spawned) spendHeat(0.14 + Math.min(0.50, spawned / 60));
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
  function tickPacing(){
    const now = Date.now();
    const last = state.paceTickAt || now;
    const elapsed = Math.max(0, now - last);
    state.paceTickAt = now;
    state.eventHeat = Math.max(0, (state.eventHeat || 0) - (elapsed / 26000));
  }
  function canSpendHeat(cost){
    tickPacing();
    return ((state.eventHeat || 0) + Math.max(0, cost)) <= 1.2;
  }
  function spendHeat(cost){
    tickPacing();
    state.eventHeat = Math.min(2, (state.eventHeat || 0) + Math.max(0, cost));
  }

  function persist(){
    try{
      const now = Date.now();
      localStorage.setItem("ki_portal_state", JSON.stringify({
        sessionSeed: ensureSessionSeed(),
        sessionStartedAt: state.sessionStartedAt,
        lang: state.lang, clicks: state.clicks, worldId: state.worldId, dayNo: state.dayNo, cursor: state.cursor,
        drift: state.drift, buffer: state.buffer.slice(-260),
        visits: state.visits, erasSeen: state.erasSeen.slice(-24), lastVisitKey: state.lastVisitKey,
        nextBreachIn: Math.max(0, (state.nextBreachAt || 0) - now),
        nextTribunalIn: Math.max(0, (state.nextTribunalAt || 0) - now),
        nextCounterIn: Math.max(0, (state.nextCounterAt || 0) - now),
        nextOriginIn: Math.max(0, (state.nextOriginAt || 0) - now),
        actionCount: state.actionCount,
        mapVisits: state.mapVisits,
        originUnlocked: !!state.originUnlocked,
        originSpectacleSeen: !!state.originSpectacleSeen,
        originFirstJumpDone: !!state.originFirstJumpDone,
        tribunalBias: state.tribunalBias,
        tribunalBiasTurns: state.tribunalBiasTurns,
        eventHeat: state.eventHeat,
      }));
    }catch{}
    syncSessionHash();
  }
  function restore(){
    try{
      const raw = localStorage.getItem("ki_portal_state"); if(!raw) return;
      state.hasSaved = true;
      const o = JSON.parse(raw);
      const langMismatch = o.lang && o.lang !== state.lang;
      if(typeof o.sessionSeed==="string" && o.sessionSeed.trim()) state.sessionSeed = o.sessionSeed.trim();
      if(typeof o.sessionStartedAt==="number" && o.sessionStartedAt > 0) state.sessionStartedAt = o.sessionStartedAt;
      if(typeof o.clicks==="number") state.clicks=o.clicks;
      if(typeof o.worldId==="string") state.worldId=o.worldId;
      if(typeof o.dayNo==="number") state.dayNo=o.dayNo;
      if(typeof o.cursor==="number") state.cursor=o.cursor;
      if(typeof o.drift==="number") state.drift=o.drift;
      if(Array.isArray(o.buffer) && !langMismatch) state.buffer=o.buffer;
      if(o.visits && typeof o.visits === "object" && !Array.isArray(o.visits)) state.visits=o.visits;
      if(Array.isArray(o.erasSeen)) state.erasSeen=o.erasSeen.filter(x => typeof x === "string").slice(-24);
      if(typeof o.lastVisitKey==="string") state.lastVisitKey=o.lastVisitKey;
      if(typeof o.nextBreachIn==="number") state.nextBreachAt = Date.now() + Math.max(0, o.nextBreachIn);
      if(typeof o.nextTribunalIn==="number") state.nextTribunalAt = Date.now() + Math.max(0, o.nextTribunalIn);
      if(typeof o.nextCounterIn==="number") state.nextCounterAt = Date.now() + Math.max(0, o.nextCounterIn);
      if(typeof o.nextOriginIn==="number") state.nextOriginAt = Date.now() + Math.max(0, o.nextOriginIn);
      if(typeof o.actionCount==="number") state.actionCount = Math.max(0, Math.min(9999, o.actionCount));
      if(typeof o.mapVisits==="number") state.mapVisits = Math.max(0, Math.min(999, o.mapVisits));
      if(typeof o.originUnlocked==="boolean") state.originUnlocked = o.originUnlocked;
      if(typeof o.originSpectacleSeen==="boolean") state.originSpectacleSeen = o.originSpectacleSeen;
      if(typeof o.originFirstJumpDone==="boolean") state.originFirstJumpDone = o.originFirstJumpDone;
      if(typeof o.tribunalBias==="number") state.tribunalBias = Math.max(-3, Math.min(3, o.tribunalBias));
      if(typeof o.tribunalBiasTurns==="number") state.tribunalBiasTurns = Math.max(0, Math.min(24, o.tribunalBiasTurns));
      if(typeof o.eventHeat==="number") state.eventHeat = Math.max(0, Math.min(2, o.eventHeat));
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
    const era = worldEra(world) || PRESENT_ERA;
    const y = `${t("year")} ${era}`;
    const d = day ? `${t("day")} ${day.day}` : (state.dayNo ? `${t("day")} ${state.dayNo}` : `${t("day")} ?`);
    const tm = inferTime(world, day);
    const time = tm ? `${I18N[state.lang]?.time || "TIME"} ${tm}` : `${I18N[state.lang]?.time || "TIME"} --`;
    const drift = `${I18N[state.lang]?.drift || "DRIFT"} ${Math.round(state.drift*100)}%`;
    const vec = `${I18N[state.lang]?.vector || "VECTOR"} ${vLabel(state.vector)}`;
    $("#state").textContent = `${y} // ${d} // ${time} // ${drift} // ${vec}`;
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
          const tail = parts[1] || "";
          const needsSpace = tail && !/^(\s|&nbsp;)/i.test(tail);
          html.push(`<p class="${cls.join(" ")}"${delay}><span class="spk" data-spk="${escapeHTML(c.spk)}">${escapeHTML(c.spk)}:</span>${needsSpace ? " " : ""}${renderText(tail)}</p>`);
        } else {
          const space = c.txt ? " " : "";
          html.push(`<p class="${cls.join(" ")}"${delay}><span class="spk" data-spk="${escapeHTML(c.spk)}">${escapeHTML(c.spk)}:</span>${space}${renderText(c.txt)}</p>`);
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
    if(!normalizeWS(state.ghostLine)){
      const lines = state.ghostLines || [];
      if(lines.length){
        forceGhost();
      } else {
        state.ghostLine = t("sager_idle");
      }
    }
    box.textContent = state.ghostLine || t("sager_idle");
  }

  function setQuestion(text){ $("#q").textContent = `> ${text}`; }
  function setChoices(btns){
    const mode = activeMenuContext();
    const hinted = maybeEmitCommunityHint(mode);
    if(hinted) renderBuffer();
    const wrap = $("#choices"); wrap.innerHTML = "";
    for(let i=0;i<btns.length;i++){
      const b = btns[i];
      const el = document.createElement("div");
      el.className = "choice";
      el.textContent = diegeticChoiceLabel(b.label, i);
      el.onclick = () => {
        registerChoice(b.label, mode);
        b.onClick();
      };
      wrap.appendChild(el);
    }
  }

  function enterScrollMode(){
    const world = getWorldById(state.worldId);
    const day = getDay(world, state.dayNo);
    if(!world || !day) return;
    state.timeMenu = false;
    state.mapMenu = false;
    clearTribunalState();
    clearCounterState();
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
    clearTribunalState();
    clearCounterState();
    state.buffer = [
      { text:t("gate_opens", { word }), hackled:false },
      { text: hit.line, hackled:false },
    ];
    state.chunkStack.push({ cursorStart: state.cursor, cursorEnd: state.cursor, lines: state.buffer.slice(), hackle:false });
    state.scrollTopNext = true;
    markVisit(state.worldId, state.dayNo, 2);
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
    clearTribunalState();
    clearCounterState();
    state.roleOptions = randomSpeakers(6);
    state.roleMenu = true;
  }
  function sortedEraWorlds(era, groups = eraGroups()){
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
  function buildEraLabelMap(groups = eraGroups()){
    const map = new Map();
    for(const [era, worlds] of groups.entries()){
      const ordered = sortedEraWorlds(era, groups);
      ordered.forEach((w, i) => map.set(w.id, `V.${i+1}`));
    }
    return map;
  }
  function worldLabel(w, labelMap){
    if(!w) return t("unknown");
    if(isOriginWorldId(w.id)) return "א";
    if(labelMap && labelMap.has(w.id)) return labelMap.get(w.id);
    if(w.id === "theory-tragedy") return t("theory_name");
    return (w.name || w.id || t("unknown")).toUpperCase();
  }
  function buildMapBuffer(){
    const groups = mapEraGroups();
    const eras = Array.from(groups.keys()).sort((a,b) => {
      const da = eraSortKey(a);
      const db = eraSortKey(b);
      if(da !== db) return da - db;
      return a.localeCompare(b);
    });
    const labelMap = buildEraLabelMap(groups);
    const node = (w) => {
      const isOrigin = isOriginWorldId(w.id);
      const locked = isOrigin && !state.originUnlocked;
      const cls = ["map-node"];
      if(isOrigin) cls.push("map-origin");
      if(locked) cls.push("map-locked");
      const attrs = [`class="${cls.join(" ")}"`, `data-world="${escapeHTML(w.id)}"`];
      if(locked) attrs.push(`data-origin-locked="1"`);
      const label = isOrigin ? (locked ? "א.LOCK" : "א.KEY") : worldLabel(w, labelMap);
      return `<span ${attrs.join(" ")}>${label}</span>`;
    };
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
    if(eras.includes(ORIGIN_ERA)){
      const originWorlds = sortedEraWorlds(ORIGIN_ERA, groups);
      lines.push({ text:`<span class="map-line map-keyline">${state.originUnlocked ? t("origin_key_open_line") : t("origin_key_locked_line")}</span>`, hackled:false });
      lines.push({ text:`<span class="map-line">&nbsp;&nbsp;${makeRow(originWorlds)}</span>`, hackled:false });
      lines.push({ text:`<span class="map-line">&nbsp;&nbsp;|</span>`, hackled:false });
    }
    const rootEra = eras.includes(PRESENT_ERA) ? PRESENT_ERA : (eras.find(e => e !== ORIGIN_ERA) || ORIGIN_ERA);
    const futureEras = eras.filter(e => e !== rootEra && e !== ORIGIN_ERA);
    const rootWorlds = sortedEraWorlds(rootEra, groups);
    lines.push({ text:`<span class="map-line">ERA ${rootEra}</span>`, hackled:false });
    lines.push({ text:`<span class="map-line">&nbsp;&nbsp;${makeRow(rootWorlds)}</span>`, hackled:false });
    if(futureEras.length){
      lines.push({ text:`<span class="map-line">&nbsp;&nbsp;|</span>`, hackled:false });
      futureEras.forEach((era, idx) => {
        const worlds = sortedEraWorlds(era, groups);
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
    clearTribunalState();
    clearCounterState();
    if(!state.mapMenu){
      state.mapSnapshot = {
        cursor: state.cursor,
        buffer: state.buffer.slice(),
        chunkStack: state.chunkStack.slice(),
        scrollMode: state.scrollMode,
        scrollSnapshot: state.scrollSnapshot,
      };
    }
    state.mapVisits = Math.min(999, (state.mapVisits || 0) + 1);
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
    clearTribunalState();
    clearCounterState();
    state.buffer = [
      { text:t("corridor_opens", { name }), hackled:false },
      { text: hit.line, hackled:false },
    ];
    if(!state.scrollMode){
      state.chunkStack.push({ cursorStart: state.cursor, cursorEnd: state.cursor, lines: state.buffer.slice(), hackle:false });
    }
    state.scrollTopNext = true;
    state.roleMenu = false;
    markVisit(state.worldId, state.dayNo, 2);
  }
  function jumpToWorld(worldId){
    if(isOriginWorldId(worldId) && !state.originUnlocked){
      openOriginMenu();
      return;
    }
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
    clearTribunalState();
    clearCounterState();
    state.scrollTopNext = true;
    localStorage.setItem("ki_world", state.worldId || "");
    markVisit(state.worldId, state.dayNo, 2);
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
    state.actionCount += 1;
    tickPacing();
    tickTribunalBias();
    if(typeof fn === "function") fn();
    state.vector = vector;
    if(maybeTriggerConvergence(vector)){
      ghostMaybe();
      render();
      persist();
      return;
    }
    if(maybeTriggerTribunal(vector)){
      ghostMaybe();
      render();
      persist();
      return;
    }
    if(maybeTriggerCounter(vector)){
      ghostMaybe();
      render();
      persist();
      return;
    }
    if(maybeTriggerOrigin(vector)){
      ghostMaybe();
      render();
      persist();
      return;
    }
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
  function appendWormhole({ hackle=false, replace=true } = {}){
    const cost = hackle ? 0.36 : 0.30;
    const throttled = !canSpendHeat(cost);
    const count = throttled ? (Math.floor(Math.random() * 4) + 3) : (Math.floor(Math.random() * 8) + 6);
    const addedLines = pickWormholeLines({ count, hackle });
    if(!addedLines.length) return false;
    spendHeat(throttled ? cost * 0.5 : cost);
    if(hasHotword(addedLines)) maybeSprite("KEYWORD");
    if(state.scrollMode){
      state.buffer = state.buffer.concat(addedLines);
    } else {
      state.buffer = replace ? addedLines.slice() : state.buffer.concat(addedLines);
      state.chunkStack.push({ cursorStart: state.cursor, cursorEnd: state.cursor, lines: state.buffer.slice(), hackle: !!hackle });
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
    clearTribunalState();
    clearCounterState();
    state.scrollTopNext = true;
    if(state.scrollMode) enterScrollMode();
    if(delta > 0) state.drift = clamp01(state.drift * 0.92);
    else state.drift = clamp01(state.drift + 0.08);
    markVisit(state.worldId, state.dayNo, 1);
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
    clearTribunalState();
    clearCounterState();
    state.scrollTopNext = true;
    localStorage.setItem("ki_world", state.worldId || "");
    markVisit(state.worldId, state.dayNo, 1);
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
    markVisit(world.id, day.day, 1);
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

    if(driftMaybe() && canSpendHeat(0.20)){
      const splice = pickWormholeLines({ count: 2 + Math.floor(Math.random()*3) });
      if(splice.length){
        addedLines = addedLines.concat(splice);
        spendHeat(0.20);
      }
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
  function normalizeModeFlags(){
    if(state.originMenu){
      state.anomalyMenu = false;
      state.tribunalMenu = false;
      state.counterMenu = false;
      state.scrollMode = false;
      state.roleMenu = false;
      state.mapMenu = false;
      state.timeMenu = false;
      return;
    }
    if(state.anomalyMenu){
      state.originMenu = false;
      state.tribunalMenu = false;
      state.counterMenu = false;
      state.scrollMode = false;
      state.roleMenu = false;
      state.mapMenu = false;
      state.timeMenu = false;
      return;
    }
    if(state.tribunalMenu){
      state.originMenu = false;
      state.counterMenu = false;
      state.scrollMode = false;
      state.roleMenu = false;
      state.mapMenu = false;
      state.timeMenu = false;
      return;
    }
    if(state.counterMenu){
      state.originMenu = false;
      state.scrollMode = false;
      state.roleMenu = false;
      state.mapMenu = false;
      state.timeMenu = false;
      return;
    }
    if(state.scrollMode){
      state.originMenu = false;
      state.tribunalMenu = false;
      state.counterMenu = false;
      state.roleMenu = false;
      state.mapMenu = false;
      state.timeMenu = false;
      return;
    }
    if(state.roleMenu){
      state.originMenu = false;
      state.tribunalMenu = false;
      state.counterMenu = false;
      state.mapMenu = false;
      state.timeMenu = false;
      return;
    }
    if(state.mapMenu){
      state.originMenu = false;
      state.tribunalMenu = false;
      state.counterMenu = false;
      state.timeMenu = false;
      return;
    }
    state.originMenu = false;
    state.tribunalMenu = false;
    state.counterMenu = false;
  }

  function render(){
    normalizeModeFlags();
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

    if(state.anomalyMenu){
      setQuestion(t("anomaly_question"));
      setChoices([
        { label:t("stabilize"), onClick: () => act(() => stabilizeTimeline(), { echo:false, vector:"BREACH" }) },
        { label:t("follow_fracture"), onClick: () => act(() => followFracture(), { echo:false, vector:"BREACH" }) },
        { label:t("ride_breach"), onClick: () => act(() => rideBreach(), { echo:false, vector:"BREACH" }) },
      ]);
      return;
    }
    if(state.tribunalMenu){
      setQuestion(t("tribunal_question"));
      setChoices([
        { label:t("tribunal_affirm"), onClick: () => act(() => resolveTribunal("affirm"), { echo:false, vector:"TRIB" }) },
        { label:t("tribunal_refuse"), onClick: () => act(() => resolveTribunal("refuse"), { echo:false, vector:"TRIB" }) },
        { label:t("tribunal_abstain"), onClick: () => act(() => resolveTribunal("abstain"), { echo:false, vector:"TRIB" }) },
      ]);
      return;
    }
    if(state.counterMenu){
      setQuestion(t("counter_question"));
      setChoices([
        { label:t("counter_local"), onClick: () => act(() => resolveCounter("local"), { echo:false, vector:"REPLAY" }) },
        { label:t("counter_parallel"), onClick: () => act(() => resolveCounter("parallel"), { echo:false, vector:"REPLAY" }) },
        { label:t("counter_cross_era"), onClick: () => act(() => resolveCounter("cross"), { echo:false, vector:"REPLAY" }) },
        { label:t("counter_hold"), onClick: () => act(() => resolveCounter("hold"), { echo:false, vector:"REPLAY" }) },
      ]);
      return;
    }
    if(state.originMenu){
      setQuestion(t("origin_question"));
      setChoices([
        { label:t("enter_origin"), onClick: () => act(() => resolveOrigin("enter"), { echo:false, vector:"ORIGIN" }) },
        { label:t("hold_origin"), onClick: () => act(() => resolveOrigin("hold"), { echo:false, vector:"ORIGIN" }) },
      ]);
      return;
    }

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
        { label:t("seed_capsule"), onClick: () => act(() => exportSeedCapsule(), { echo:false, vector:"TRACE" }) },
        { label:t("stats_pulse"), onClick: () => act(() => showStatsPulse(), { echo:false, vector:"TRACE" }) },
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
        markVisit(state.worldId, state.dayNo, 1);
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
    const hashState = readHashState();
    const buf = $("#buffer");
    if(buf){
      buf.addEventListener("click", (e) => {
        const node = e.target.closest(".map-node");
        if(node){
          const id = node.getAttribute("data-world");
          if(!id) return;
          click();
          state.vector = "MAP";
          registerChoice(`MAP NODE ${id.toUpperCase()}`, "map");
          if(isOriginWorldId(id) && node.getAttribute("data-origin-locked") === "1"){
            openOriginMenu();
            render();
            persist();
            return;
          }
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
          registerChoice(`SPEAKER ${name.toUpperCase()}`, "role");
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
          registerChoice(`KEYWORD ${word.toUpperCase()}`, "timeline");
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
    if(hashState.lang) state.lang = hashState.lang;
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

    state.community = readCommunityStore();
    restore();
    applyHashState(hashState);
    ensureSessionSeed();
    if(!state.sessionStartedAt) state.sessionStartedAt = Date.now();
    state.firstVisit = !state.hasSaved;

    if(!state.worldId){
      state.worldId = localStorage.getItem("ki_world") || state.canonId || (worlds[0]?.id || null);
    }
    const w = ensurePlayableWorld() || getWorldById(state.worldId);
    localStorage.setItem("ki_world", state.worldId || "");

    const days = allDayNos(w);
    if(!days.length) state.dayNo = 1;
    else if(state.dayNo == null || !days.includes(state.dayNo)) state.dayNo = days[0];
    markVisit(state.worldId, state.dayNo, 1);

    // Markov mix: corpus lines + canonical drama blocks + mostdipf ghost
    rebuildMarkov();
    state.speakerIndex = buildSpeakerIndex();
    state.keywordIndex = buildKeywordIndex();

    if(!state.buffer.length){
      state.buffer = [{ text:t("entering_day", { day: getDay(w,state.dayNo)?.day || state.dayNo }), hackled:false }];
      appendChunk({hackle:false});
    }
    state.vector = "FLOW";
    forceGhost();
    traceEvent("session_start", {
      firstVisit: !!state.firstVisit,
      traceEndpoint: !!TRACE_ENDPOINT,
    });
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
