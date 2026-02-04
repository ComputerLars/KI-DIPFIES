import fs from "fs";
import path from "path";
import mammoth from "mammoth";

const DOCX_SOURCES = [
  { id: "core", name: "CORE TRANSCRIPT", file: "source/drama_versions/Long KI-DIPFIES Gipfeltreffen – Stenographic Transcripts (1).docx", era: "2026" },
  { id: "mirror", name: "MIRROR TRANSCRIPT", file: "source/drama_versions/KI-DIPFIES Mega-Drama – Unified Composite Transcript.docx", era: "2026" },
  { id: "kopi", name: "KOPI VARIANT", file: "source/drama_versions/KI-DIPFIES_Kopi_minimally_fixed.docx", era: "2026" },
];
const DOCX_SOURCES_DE = [
  { id: "core", name: "KERNPROTOKOLL", file: "source/de/drama_versions/Long KI-DIPFIES Gipfeltreffen – Stenographic Transcripts.de.docx", era: "2026" },
  { id: "mirror", name: "SPIEGELPROTOKOLL", file: "source/de/drama_versions/KI-DIPFIES Mega-Drama – Unified Composite Transcript.de.docx", era: "2026" },
  { id: "kopi", name: "KOPI VARIANTE", file: "source/de/drama_versions/KI-DIPFIES_Kopi_minimally_fixed.de.docx", era: "2026" },
];
const FUTURE_SOURCES = [
  { id: "future-2027", name: "FUTURE 2027", file: "source/futures/Gipfeltreffen 2027.docx", era: "2027" },
  { id: "future-2027-mv", name: "FUTURE 2027 // MULTIVERSE", file: "source/futures/Gipfeltreffen 2027 - Multiverse.docx", era: "2027" },
  { id: "future-2050", name: "FUTURE 2050", file: "source/futures/Gipfeltreffen 2050.docx", era: "2050" },
  { id: "future-2050-mv", name: "FUTURE 2050 // MULTIVERSE", file: "source/futures/Gipfeltreffen 2050 - Multiverse.docx", era: "2050" },
];
const FUTURE_SOURCES_DE = [
  { id: "future-2027", name: "ZUKUNFT 2027", file: "source/de/futures/Gipfeltreffen 2027.de.docx", era: "2027" },
  { id: "future-2027-mv", name: "ZUKUNFT 2027 // MULTIVERSUM", file: "source/de/futures/Gipfeltreffen 2027 - Multiverse.de.docx", era: "2027" },
  { id: "future-2050", name: "ZUKUNFT 2050", file: "source/de/futures/Gipfeltreffen 2050.de.docx", era: "2050" },
  { id: "future-2050-mv", name: "ZUKUNFT 2050 // MULTIVERSUM", file: "source/de/futures/Gipfeltreffen 2050 - Multiverse.de.docx", era: "2050" },
];
const THEORY_SOURCES = [
  { id: "theory-tragedy", name: "THEORY TRAGEDY", file: "source/theory/Theory Tragedy - Readers Version.docx", era: "2025", mode: "act" },
];
const THEORY_SOURCES_DE = [
  { id: "theory-tragedy", name: "THEORIE TRAGÖDIE", file: "source/theory/Theory Tragedy - Readers Version.de.docx", era: "2025", mode: "act" },
];
const SAGER_SOURCES = [
  { name: "SAGER", file: "source/sager/syntetische_sager.docx", out: "data/sager.txt" },
];

const stripTags = (html) => html
  .replace(/<br\s*\/?>/gi, "\n")
  .replace(/<[^>]+>/g, "")
  .replace(/&nbsp;/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">")
  .replace(/&quot;/g, "\"")
  .replace(/&#39;/g, "'")
  .trim();
const TRANSLATOR_NOISE = [
  /onlinedoctranslator/i,
  /www\.onlinedoctranslator\.com/i,
  /übersetzt von englisch/i,
  /translated from english/i,
  /translated by/i,
];
const isTranslatorNoise = (text) => {
  if(!text) return false;
  return TRANSLATOR_NOISE.some(re => re.test(text));
};

function extractBlocks(html){
  if(!html) return [];
  const normalized = html.replace(/\r/g, "").trim();
  if(!normalized) return [];
  const blocks = [];
  const rx = /<(p|h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let m;
  while((m = rx.exec(normalized))){
    const inner = (m[2] || "").trim();
    if(inner) blocks.push(inner);
  }
  if(blocks.length){
    const cleaned = blocks.filter((b) => {
      const plain = stripTags(b);
      if(!plain) return false;
      return !isTranslatorNoise(plain);
    });
    if(cleaned.length) return cleaned;
    return blocks;
  }
  return isTranslatorNoise(stripTags(normalized)) ? [] : [normalized];
}

async function docxToBlocks(file){
  const result = await mammoth.convertToHtml({ path: file }, { styleMap: ["u => u"] });
  const html = result.value || "";
  return extractBlocks(html);
}
async function docxToLines(file){
  const blocks = await docxToBlocks(file);
  const lines = [];
  for(const block of blocks){
    const plain = stripTags(block);
    if(!plain) continue;
    plain.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if(trimmed) lines.push(trimmed);
    });
  }
  return lines;
}

const romanToInt = (s) => {
  if(/^[0-9]+$/.test(s)) return parseInt(s, 10);
  const roman = { I:1,V:5,X:10,L:50,C:100 };
  let total = 0, prev = 0;
  for(const ch of s.toUpperCase().split("").reverse()){
    const val = roman[ch] || 0;
    total += val < prev ? -val : val;
    prev = val;
  }
  return total || 1;
};

function splitDays(blocks){
  const days = new Map();
  let current = null;
  const dayRe = /^\s*[-–—]*\s*Day\s+(\d+)\b/i;
  for(const block of blocks){
    const plain = stripTags(block);
    const m = plain.match(dayRe);
    if(m){
      current = parseInt(m[1], 10);
      if(!days.has(current)) days.set(current, []);
    }
    if(current == null){
      current = 1;
      if(!days.has(current)) days.set(current, []);
    }
    days.get(current).push(block);
  }
  return Array.from(days.entries())
    .sort((a,b)=>a[0]-b[0])
    .map(([day, blocks]) => ({ day, blocks }));
}

function splitActs(blocks){
  const days = new Map();
  let current = null;
  const actRe = /^\s*[-–—]*\s*Act\s+([IVXLC0-9]+)\b/i;
  for(const block of blocks){
    const plain = stripTags(block);
    const m = plain.match(actRe);
    if(m){
      current = romanToInt(m[1]);
      if(!days.has(current)) days.set(current, []);
    }
    if(current == null){
      current = 1;
      if(!days.has(current)) days.set(current, []);
    }
    days.get(current).push(block);
  }
  return Array.from(days.entries())
    .sort((a,b)=>a[0]-b[0])
    .map(([day, blocks]) => ({ day, blocks }));
}

async function buildWorlds(sources){
  const worlds = [];
  for(const src of sources){
    const filePath = path.resolve(src.file);
    if(!fs.existsSync(filePath)){
      console.warn("Missing:", filePath);
      continue;
    }
    const blocks = await docxToBlocks(filePath);
    const days = (src.mode === "act") ? splitActs(blocks) : splitDays(blocks);
    const count = days.reduce((sum, d) => sum + d.blocks.length, 0);
    worlds.push({ id: src.id, name: src.name, era: src.era, days, stats: { days: days.length, blocks: count } });
  }
  return worlds;
}

async function main(){
  const writeDipfiesManifest = () => {
    const dir = path.resolve("assets/dipfies");
    if(!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith(".png")).sort();
    const manifest = { files: files.map(f => `assets/dipfies/${f}`) };
    fs.writeFileSync("data/dipfies.json", JSON.stringify(manifest, null, 2));
  };
  const worlds = await buildWorlds([...DOCX_SOURCES, ...FUTURE_SOURCES, ...THEORY_SOURCES]);
  const worldsDe = await buildWorlds([...DOCX_SOURCES_DE, ...FUTURE_SOURCES_DE, ...THEORY_SOURCES_DE]);
  for(const sager of SAGER_SOURCES){
    const filePath = path.resolve(sager.file);
    if(!fs.existsSync(filePath)){
      console.warn("Missing:", filePath);
      continue;
    }
    const lines = await docxToLines(filePath);
    const outPath = path.resolve(sager.out);
    fs.writeFileSync(outPath, lines.join("\n"));
  }

  const stamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 15);
  const out = {
    version: stamp,
    canonical: "core",
    worlds,
  };

  fs.writeFileSync("data/drama_worlds.json", JSON.stringify(out, null, 2));
  if(worldsDe.length){
    const outDe = {
      version: stamp,
      canonical: "core",
      worlds: worldsDe,
    };
    fs.writeFileSync("data/drama_worlds.de.json", JSON.stringify(outDe, null, 2));
  }
  fs.writeFileSync("data/build.json", JSON.stringify({ build: stamp }, null, 2));
  writeDipfiesManifest();
  const indexPath = path.resolve("index.html");
  if(fs.existsSync(indexPath)){
    const html = fs.readFileSync(indexPath, "utf8");
    const updated = html
      .replace(/portal\\.css\\?v=[^\"']+/g, `portal.css?v=${stamp}`)
      .replace(/portal\\.js\\?v=[^\"']+/g, `portal.js?v=${stamp}`);
    if(updated !== html) fs.writeFileSync(indexPath, updated);
  }
  console.log("wrote", worlds.length, "worlds");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
