#!/usr/bin/env node

import http from "node:http";
import path from "node:path";
import { promises as fs } from "node:fs";

const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT || 8787);
const DATA_DIR = path.resolve(process.env.TRACE_DATA_DIR || "./runtime/trace");
const EVENTS_FILE = path.join(DATA_DIR, "events.ndjson");
const STATS_FILE = path.join(DATA_DIR, "stats.json");
const MAX_BODY = 128 * 1024;

function nowIso(){
  return new Date().toISOString();
}

function cleanText(value, max = 120){
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function cleanKey(value, max = 96){
  return cleanText(value, max).toLowerCase();
}

function defaultStats(){
  const t = nowIso();
  return {
    version: 1,
    createdAt: t,
    updatedAt: t,
    totals: {
      events: 0,
      choices: 0,
      sessions: 0,
    },
    contexts: {},
    sessions: {},
  };
}

const store = {
  loaded: false,
  stats: defaultStats(),
};

async function ensureLoaded(){
  if(store.loaded) return;
  await fs.mkdir(DATA_DIR, { recursive: true });
  try{
    const raw = await fs.readFile(STATS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if(parsed && typeof parsed === "object"){
      store.stats = parsed;
    }
  }catch{
    store.stats = defaultStats();
  }
  if(!store.stats.totals || typeof store.stats.totals !== "object"){
    store.stats.totals = { events: 0, choices: 0, sessions: 0 };
  }
  if(!store.stats.contexts || typeof store.stats.contexts !== "object"){
    store.stats.contexts = {};
  }
  if(!store.stats.sessions || typeof store.stats.sessions !== "object"){
    store.stats.sessions = {};
  }
  store.loaded = true;
}

function ensureContext(contextKey){
  const key = cleanText(contextKey || "unknown", 180);
  if(!store.stats.contexts[key]){
    store.stats.contexts[key] = {
      total: 0,
      choices: {},
      marks: {},
      updatedAt: nowIso(),
    };
  }
  return store.stats.contexts[key];
}

function ensureSession(seed){
  const key = cleanKey(seed, 64);
  if(!key) return null;
  if(!store.stats.sessions[key]){
    store.stats.sessions[key] = {
      firstSeen: nowIso(),
      lastSeen: nowIso(),
      events: 0,
      choices: 0,
      lastVector: "",
      lastContext: "",
    };
    store.stats.totals.sessions += 1;
  }
  return store.stats.sessions[key];
}

function choiceSummary(ctx){
  const entries = Object.entries(ctx?.choices || {});
  entries.sort((a, b) => Number((b[1] || {}).count || 0) - Number((a[1] || {}).count || 0));
  return entries.map(([key, value]) => ({
    key,
    label: cleanText(value?.label || key, 140),
    count: Number(value?.count || 0),
  }));
}

function summarizeContext(contextKey){
  const key = cleanText(contextKey || "", 180);
  if(!key || !store.stats.contexts[key]) return null;
  const ctx = store.stats.contexts[key];
  const topChoices = choiceSummary(ctx);
  const total = Number(ctx.total || 0);
  const top = topChoices[0] || null;
  return {
    key,
    total,
    variants: topChoices.length,
    top: top ? {
      key: top.key,
      label: top.label,
      count: top.count,
      percent: total > 0 ? Math.round((top.count / total) * 100) : 0,
    } : null,
    choices: topChoices.slice(0, 8).map(item => ({
      ...item,
      percent: total > 0 ? Math.round((item.count / total) * 100) : 0,
    })),
  };
}

function topContexts(limit = 8){
  const out = [];
  for(const key of Object.keys(store.stats.contexts || {})){
    const summary = summarizeContext(key);
    if(summary) out.push(summary);
  }
  out.sort((a, b) => b.total - a.total);
  return out.slice(0, limit);
}

function normalizeEvent(input, req){
  const raw = (input && typeof input === "object" && !Array.isArray(input)) ? input : {};
  const data = (raw.data && typeof raw.data === "object" && !Array.isArray(raw.data)) ? raw.data : {};
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`,
    ts: cleanText(raw.ts || nowIso(), 40),
    type: cleanKey(raw.type || "unknown", 40),
    seed: cleanKey(raw.seed || "", 64),
    lang: cleanKey(raw.lang || "", 8),
    worldId: cleanText(raw.worldId || "", 80),
    era: cleanText(raw.era || "", 20),
    day: Number.isFinite(Number(raw.day)) ? Number(raw.day) : null,
    vector: cleanKey(raw.vector || "", 40),
    data,
    sourceIp: cleanText(req.socket?.remoteAddress || "", 80),
    userAgent: cleanText(req.headers["user-agent"] || "", 220),
    receivedAt: nowIso(),
  };
}

function ingestEvent(event){
  store.stats.totals.events += 1;
  store.stats.updatedAt = nowIso();

  const session = ensureSession(event.seed);
  if(session){
    session.lastSeen = nowIso();
    session.events += 1;
    if(event.vector) session.lastVector = event.vector;
  }

  if(event.type === "choice"){
    store.stats.totals.choices += 1;
    const context = cleanText(event.data?.context || "timeline", 180);
    const label = cleanText(event.data?.label || event.data?.choice || "choice", 140);
    const key = cleanKey(event.data?.choice || label, 120) || "choice";
    const ctx = ensureContext(context);
    if(!ctx.choices[key]){
      ctx.choices[key] = { label, count: 0 };
    }
    ctx.choices[key].label = label;
    ctx.choices[key].count += 1;
    ctx.total += 1;
    ctx.updatedAt = nowIso();
    if(session){
      session.choices += 1;
      session.lastContext = context;
    }
    return;
  }

  if(event.type === "annotation"){
    const context = cleanText(event.data?.context || "timeline", 180);
    const mark = cleanKey(event.data?.mark || "mark", 40) || "mark";
    const ctx = ensureContext(context);
    ctx.marks[mark] = Number(ctx.marks[mark] || 0) + 1;
    ctx.updatedAt = nowIso();
    if(session){
      session.lastContext = context;
    }
  }
}

async function saveStats(){
  const tmp = `${STATS_FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(store.stats, null, 2), "utf8");
  await fs.rename(tmp, STATS_FILE);
}

async function appendEvents(events){
  if(!events.length) return;
  const lines = events.map(event => JSON.stringify(event)).join("\n") + "\n";
  await fs.appendFile(EVENTS_FILE, lines, "utf8");
}

function corsHeaders(){
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type",
    "cache-control": "no-store",
  };
}

function sendJson(res, statusCode, payload){
  res.writeHead(statusCode, {
    ...corsHeaders(),
    "content-type": "application/json; charset=utf-8",
  });
  res.end(JSON.stringify(payload));
}

async function readBody(req){
  const chunks = [];
  let total = 0;
  for await (const chunk of req){
    total += chunk.length;
    if(total > MAX_BODY){
      throw new Error("payload_too_large");
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8").trim();
}

function parsePayload(raw){
  if(!raw) return {};
  try{
    return JSON.parse(raw);
  }catch{
    return { type: "raw", data: { raw: cleanText(raw, 4000) } };
  }
}

function requestUrl(req){
  const host = req.headers.host || `127.0.0.1:${PORT}`;
  return new URL(req.url || "/", `http://${host}`);
}

const server = http.createServer(async (req, res) => {
  await ensureLoaded();

  if(req.method === "OPTIONS"){
    res.writeHead(204, corsHeaders());
    res.end();
    return;
  }

  const url = requestUrl(req);
  const pathname = url.pathname.replace(/\/+$/g, "") || "/";

  if(req.method === "GET" && pathname === "/health"){
    sendJson(res, 200, { ok: true, updatedAt: store.stats.updatedAt, now: nowIso() });
    return;
  }

  if(req.method === "GET" && pathname === "/stats"){
    const context = cleanText(url.searchParams.get("context") || "", 180);
    sendJson(res, 200, {
      ok: true,
      generatedAt: nowIso(),
      totals: {
        events: Number(store.stats.totals.events || 0),
        choices: Number(store.stats.totals.choices || 0),
        sessions: Number(store.stats.totals.sessions || 0),
        contexts: Object.keys(store.stats.contexts || {}).length,
      },
      context: context ? summarizeContext(context) : null,
      topContexts: topContexts(8),
    });
    return;
  }

  if(req.method === "POST" && pathname === "/trace"){
    try{
      const rawBody = await readBody(req);
      const payload = parsePayload(rawBody);
      const rawEvents = Array.isArray(payload) ? payload : [payload];
      const events = rawEvents
        .map(item => normalizeEvent(item, req))
        .filter(event => event && typeof event === "object");
      for(const event of events){
        ingestEvent(event);
      }
      await appendEvents(events);
      await saveStats();
      sendJson(res, 202, {
        ok: true,
        accepted: events.length,
        totals: {
          events: Number(store.stats.totals.events || 0),
          choices: Number(store.stats.totals.choices || 0),
          sessions: Number(store.stats.totals.sessions || 0),
        },
      });
    }catch(error){
      if(String(error?.message || "") === "payload_too_large"){
        sendJson(res, 413, { ok: false, error: "payload_too_large" });
        return;
      }
      sendJson(res, 500, { ok: false, error: "trace_write_failed" });
    }
    return;
  }

  sendJson(res, 404, { ok: false, error: "not_found" });
});

server.listen(PORT, HOST, () => {
  console.log(`[trace-server] listening on http://${HOST}:${PORT}`);
  console.log(`[trace-server] data dir: ${DATA_DIR}`);
});
