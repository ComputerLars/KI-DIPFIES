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

  const state = {
    build:"dev",
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
    scrollMode:false,
    scrollSnapshot:null,
    keywordIndex:null,
    vector:"BOOT",
    prevWorld:null,
    prevDay:null,
    prevCursor:null,
    coldBooted:false,
    coldBootDay5:false,
  };

  const PRIMARY_WORLD_IDS = ["core","mirror","kopi"];
  const FUTURE_WORLD_ID = "future-2027";

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
  function timeJumpToFuture(){
    const list = playableWorlds();
    const future = list.find(w => w.id === FUTURE_WORLD_ID);
    if(!future) return false;
    if(state.worldId !== FUTURE_WORLD_ID){
      state.prevWorld = state.worldId;
      state.prevDay = state.dayNo;
      state.prevCursor = state.cursor;
    }
    state.worldId = FUTURE_WORLD_ID;
    const days = allDayNos(future);
    state.dayNo = days[0] || 1;
    state.cursor = 0;
    state.buffer = [{ text:"(time jump: 2027)", hackled:false }];
    state.chunkStack = [];
    state.scrollMode = false;
    state.scrollSnapshot = null;
    state.scrollTopNext = true;
    return true;
  }
  function returnFromFuture(){
    if(state.worldId !== FUTURE_WORLD_ID) return false;
    const target = getWorldById(state.prevWorld || state.canonId);
    if(!target) return false;
    state.worldId = target.id;
    const days = allDayNos(target);
    const day = (state.prevDay && days.includes(state.prevDay)) ? state.prevDay : (days[0] || 1);
    state.dayNo = day;
    state.cursor = state.prevCursor || 0;
    state.buffer = [{ text:"(returning from 2027)", hackled:false }];
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
    const list = primaryWorlds();
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
        clicks: state.clicks, worldId: state.worldId, dayNo: state.dayNo, cursor: state.cursor,
        drift: state.drift, buffer: state.buffer.slice(-260),
      }));
    }catch{}
  }
  function restore(){
    try{
      const raw = localStorage.getItem("ki_portal_state"); if(!raw) return;
      const o = JSON.parse(raw);
      if(typeof o.clicks==="number") state.clicks=o.clicks;
      if(typeof o.worldId==="string") state.worldId=o.worldId;
      if(typeof o.dayNo==="number") state.dayNo=o.dayNo;
      if(typeof o.cursor==="number") state.cursor=o.cursor;
      if(typeof o.drift==="number") state.drift=o.drift;
      if(Array.isArray(o.buffer)) state.buffer=o.buffer;
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
    const d = day ? `DAY ${day.day}` : (state.dayNo ? `DAY ${state.dayNo}` : "DAY ?");
    const t = inferTime(world, day);
    const time = t ? `TIME ${t}` : "TIME --";
    const drift = `DRIFT ${Math.round(state.drift*100)}%`;
    const vec = `VECTOR ${state.vector}`;
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
    if(!state.scrollMode){
      state.scrollSnapshot = {
        cursor: state.cursor,
        buffer: state.buffer.slice(),
        chunkStack: state.chunkStack.slice(),
      };
    }
    state.scrollMode = true;
    state.buffer = [{ text:`(DAY ${day.day} — FULL SCROLL)`, hackled:false }]
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
      { text:`(${word} gate opens)`, hackled:false },
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
    state.roleOptions = randomSpeakers(6);
    state.roleMenu = true;
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
      { text:`(${name} corridor opens)`, hackled:false },
      { text: hit.line, hackled:false },
    ];
    if(!state.scrollMode){
      state.chunkStack.push({ cursorStart: state.cursor, cursorEnd: state.cursor, lines: state.buffer.slice(), hackle:false });
    }
    state.scrollTopNext = true;
    state.roleMenu = false;
  }

  function ghostMaybe(){
    const lines = state.ghostLines || [];
    if(!lines.length) return;
    if(Math.random() < 0.10){
      const line = normalizeWS(lines[Math.floor(Math.random()*lines.length)]);
      if(line) state.ghostLine = line;
    }
  }

  function doColdBoot(){
    const boot = [
      { text:"[COLD BOOT]", hackled:false },
      { text:"MEMORY VECTOR RESET", hackled:false },
      { text:"LINKING WORLDLINES...", hackled:false },
      { text:"READY.", hackled:false },
    ];
    state.buffer = boot;
    state.vector = "BOOT";
    state.chunkStack.push({ cursorStart: state.cursor, cursorEnd: state.cursor, lines: boot.slice(), hackle:false });
    state.scrollTopNext = true;
  }
  function coldBootMaybe(reason){
    if(state.scrollMode) return;
    if(reason === "enter"){
      if(state.coldBooted) return;
      state.coldBooted = true;
      doColdBoot();
      return;
    }
    if(reason === "day5"){
      if(state.dayNo !== 5) return;
      if(state.coldBootDay5) return;
      state.coldBootDay5 = true;
      doColdBoot();
    }
  }

  function act(fn, { append=false, echo=true, vector="FLOW" } = {}){
    click();
    if(typeof fn === "function") fn();
    state.vector = vector;
    if(echo && !append && vector === "HACKLE") markovEcho();
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
    for(let i=start;i<end;i++){
      const raw = safeText(blocks[i] || "");
      const rawPlain = plainText(raw);
      if(!rawPlain.trim()) continue;
      const replace = hackle && hasMarkov && (Math.random() < 0.32);
      if(replace){
        const c = classifyLine(rawPlain);
        if(c.kind === "speaker"){
          const g = generate(state.markov, c.txt || seed, 28);
          lines.push({ text: `${c.spk}: ${g || c.txt}`, hackled:true });
        } else {
          const g = generate(state.markov, rawPlain || seed, 28);
          lines.push({ text: g || rawPlain, hackled:true });
        }
      } else {
        lines.push({ text: raw, hackled:false });
      }
    }
    return lines;
  }
  function appendWormhole({ hackle=false } = {}){
    const addedLines = pickWormholeLines({ count: Math.floor(Math.random() * 8) + 6, hackle });
    if(!addedLines.length) return false;
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
    state.buffer = [{ text:`(entering Day ${state.dayNo})`, hackled:false }];
    state.chunkStack = [];
    state.scrollTopNext = true;
    if(state.scrollMode) enterScrollMode();
    if(delta > 0) state.drift = clamp01(state.drift * 0.92);
    else state.drift = clamp01(state.drift + 0.08);
    coldBootMaybe("day5");
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
      state.buffer.push({ text:"(data link lost)", hackled:false });
      state.scrollTopNext = true;
      return;
    }
    const blocks = day.blocks || [];
    if(state.cursor >= blocks.length){
      state.buffer.push({ text:`(end of Day ${day.day})`, hackled:false }); return;
    }

    const step = 14;
    const start = state.cursor;
    let i = start;
    let addedCount = 0;
    let addedLines = [];
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
        const c = classifyLine(rawPlain);
        const replace = hackle && hasMarkov && (pulseHit || Math.random() < 0.32);
        if(c.kind === "speaker" && replace){
          const g = generate(state.markov, c.txt || seed, 34);
          addedLines.push({ text: `${c.spk}: ${g || c.txt}`, hackled:true });
        } else if(replace){
          const g = generate(state.markov, rawPlain || seed, 34);
          addedLines.push({ text: g || rawPlain, hackled:true });
        } else {
          addedLines.push({ text: raw, hackled:false });
        }
        if(pulseHit) pulseArmed = false;
      } else {
        addedLines.push({ text: raw, hackled:false });
      }
      addedCount++;
    }

    state.cursor = i;
    if(addedLines.length === 0){
      addedLines.push({ text:"(silence)", hackled:false });
    }

    if(driftMaybe()){
      const splice = pickWormholeLines({ count: 2 + Math.floor(Math.random()*3) });
      if(splice.length) addedLines = addedLines.concat(splice);
    }

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
    const futureAvailable = hasWorld(FUTURE_WORLD_ID);
    const inFuture = state.worldId === FUTURE_WORLD_ID;
    applyRotation();

    setHUD(world, day);
    renderBuffer();
    renderGhost();

    if(state.scrollMode){
      setQuestion(`SCROLL MODE.`);
      const scrollChoices = [
        { label:"Exit Scroll", onClick: () => act(() => exitScrollMode(), { echo:false, vector:"FLOW" }) },
        { label:"Next World", onClick: () => act(() => gotoDay(+1), { echo:false, vector:"NEXT" }) },
        { label:"Prev World", onClick: () => act(() => gotoDay(-1), { echo:false, vector:"LOOP" }) },
        { label:"Role", onClick: () => act(() => openRoleMenu(), { echo:false, vector:"ROLE" }) },
      ];
      if(futureAvailable){
        const jump = inFuture
          ? { label:"Return 2026", onClick: () => act(() => returnFromFuture(), { echo:false, vector:"JUMP" }) }
          : { label:"Time Jump", onClick: () => act(() => timeJumpToFuture(), { echo:false, vector:"JUMP" }) };
        scrollChoices.push(jump);
      }
      setChoices(scrollChoices);
      return;
    }

    if(state.roleMenu){
      setQuestion("ROLE GATE: SELECT CHARACTER.");
      const btns = state.roleOptions.map(name => ({
        label: shorten(name.toUpperCase()),
        onClick: () => act(() => jumpToSpeaker(name), { echo:false, vector:"ROLE" }),
      }));
      btns.push({
        label: "MORE NAMES",
        onClick: () => act(() => { state.roleOptions = randomSpeakers(6); }, { echo:false, vector:"ROLE" }),
      });
      btns.push({
        label: "EXIT",
        onClick: () => act(() => { state.roleMenu = false; }, { echo:false, vector:"FLOW" }),
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
        state.buffer = [{ text:`(relinking Day ${state.dayNo})`, hackled:false }];
        state.chunkStack = [];
        state.scrollTopNext = true;
        render();
        persist();
        return;
      }
      setQuestion("DATA LINK LOST.");
      setChoices([
        { label:"Reload", onClick: () => { click(); location.reload(); } },
        { label:"Wormhole", onClick: () => act(() => appendWormhole({ hackle:false }), { echo:false, vector:"WORMHOLE" }) },
        { label:"Forward in time", onClick: () => act(() => appendChunk({hackle:false}), { append:true, vector:"FLOW" }) },
      ]);
      return;
    }

    const atEnd = state.cursor >= (day.blocks || []).length;
    if(!state.buffer.length){
      state.buffer.push({ text:`(entering Day ${day.day})`, hackled:false });
    }

    if(atEnd){
      setQuestion(`DAY ${day.day} END. CHOOSE VECTOR.`);
      const endChoices = [
        { label:"Next day/world", onClick: () => act(() => gotoDay(+1), { vector:"NEXT" }) },
        { label:"Prev day/world", onClick: () => act(() => gotoDay(-1), { vector:"LOOP" }) },
        { label:"Back in time", onClick: () => act(() => { if(!rewindChunk()) gotoDay(-1); }, { vector:"BACK" }) },
        { label:"Role", onClick: () => act(() => openRoleMenu(), { echo:false, vector:"ROLE" }) },
        { label:"Wormhole", onClick: () => act(() => appendWormhole({ hackle:false }), { echo:false, vector:"WORMHOLE" }) },
        { label:"Hackle the return", onClick: () => act(() => { if(!rewindChunk()) gotoDay(-1); appendChunk({hackle:true}); }, { append:true, vector:"HACKLE" }) },
      ];
      if(futureAvailable){
        const jump = inFuture
          ? { label:"Return 2026", onClick: () => act(() => returnFromFuture(), { vector:"JUMP" }) }
          : { label:"Time Jump", onClick: () => act(() => timeJumpToFuture(), { vector:"JUMP" }) };
        endChoices.push(jump);
      }
      endChoices.push({ label:"Collect a Day", onClick: () => act(() => enterScrollMode(), { echo:false, vector:"SCROLL" }) });
      setChoices(endChoices);
      return;
    }

    setQuestion(`CHOOSE A VECTOR.`);
    const baseChoices = [
      { label:"Forward in time", onClick: () => act(() => appendChunk({hackle:false}), { append:true, vector:"FLOW" }) },
      { label:"Back in time", onClick: () => act(() => { if(!rewindChunk()) gotoDay(-1); }, { vector:"BACK" }) },
      { label:"Hackle", onClick: () => act(() => appendChunk({hackle:true}), { append:true, vector:"HACKLE" }) },
      { label:"Role", onClick: () => act(() => openRoleMenu(), { echo:false, vector:"ROLE" }) },
      { label:"Wormhole", onClick: () => act(() => appendWormhole({ hackle:false }), { echo:false, vector:"WORMHOLE" }) },
    ];
    if(futureAvailable){
      const jump = inFuture
        ? { label:"Return 2026", onClick: () => act(() => returnFromFuture(), { vector:"JUMP" }) }
        : { label:"Time Jump", onClick: () => act(() => timeJumpToFuture(), { vector:"JUMP" }) };
      baseChoices.push(jump);
    }
    baseChoices.push({ label:"Collect a Day", onClick: () => act(() => enterScrollMode(), { echo:false, vector:"SCROLL" }) });
    setChoices(baseChoices);
  }

  async function boot(){
    lockKeyboard();
    const buf = $("#buffer");
    if(buf){
      buf.addEventListener("click", (e) => {
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
    await bootBuildStamp();
    state.worlds = await fetchJSON("data/drama_worlds.json");
    state.corpus = await fetchJSON("data/corpus.json").catch(()=>({lines:[]}));
    state.ghostLines = await fetch("data/mostdipf_all.txt", { cache:"no-store" })
      .then(r => r.ok ? r.text() : "")
      .then(t => t.split(/\r?\n/).map(s => s.trim()).filter(Boolean))
      .catch(() => []);

    const worlds = state.worlds?.worlds || [];
    state.canonId = state.worlds?.canonical || (worlds[0]?.id || null);

    restore();

    if(!state.worldId){
      state.worldId = localStorage.getItem("ki_world") || state.canonId || (worlds[0]?.id || null);
    }
    const w = ensurePlayableWorld() || getWorldById(state.worldId);
    localStorage.setItem("ki_world", state.worldId || "");

    const days = allDayNos(w);
    if(!days.length) state.dayNo = 1;
    else if(state.dayNo == null || !days.includes(state.dayNo)) state.dayNo = days[0];

    // Markov mix: corpus lines + canonical drama blocks + mostdipf ghost
    const canon = getWorldById(state.canonId);
    const dramaLines = [];
    (canon?.days || []).forEach(d => (d.blocks||[]).slice(0, 2200).forEach(b => dramaLines.push(plainText(b))));

    const ghost = state.ghostLines.slice(0, 3600);
    const mix = (state.corpus.lines || []).slice(0, 3000)
      .concat(dramaLines.slice(0, 2400))
      .concat(ghost);
    state.markov = buildMarkov(mix.length ? mix : dramaLines);
    state.speakerIndex = buildSpeakerIndex();
    state.keywordIndex = buildKeywordIndex();

    if(!state.buffer.length){
      state.buffer = [{ text:`(entering Day ${getDay(w,state.dayNo)?.day || state.dayNo})`, hackled:false }];
      appendChunk({hackle:false});
    }
    state.vector = "FLOW";
    coldBootMaybe("enter");

    render();
    persist();
  }

  boot().catch(err => {
    console.error(err);
    applyRotation();
    $("#state").textContent = "Boot failed.";
    $("#buffer").innerHTML = `<p class="line">${escapeHTML(err.message || String(err))}</p>`;
    setQuestion("Boot failed. Missing JSON or wrong publishing root.");
    setChoices([{ label:"Reload", onClick: () => { click(); location.reload(); } }]);
  });
})();
