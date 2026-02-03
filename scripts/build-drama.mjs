import fs from "fs";
import path from "path";
import mammoth from "mammoth";

const DOCX_SOURCES = [
  { id: "core", name: "CORE TRANSCRIPT", file: "source/drama_versions/Long KI-DIPFIES Gipfeltreffen – Stenographic Transcripts (1).docx" },
  { id: "mirror", name: "MIRROR TRANSCRIPT", file: "source/drama_versions/KI-DIPFIES Mega-Drama – Unified Composite Transcript.docx" },
  { id: "kopi", name: "KOPI VARIANT", file: "source/drama_versions/KI-DIPFIES_Kopi_minimally_fixed.docx" },
];
const FUTURE_PATH = "/Users/au528457/Downloads/Gipfeltreffen 2027.docx";
const THEORY_PATH = "/Users/au528457/Downloads/Theory Tragedy_ Post-Farce Protocol (Mao-Dadaist Bureaucratic Edition).txt";

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

function extractParagraphs(html){
  if(!html) return [];
  const normalized = html.replace(/\r/g, "").trim();
  if(!normalized) return [];
  const parts = normalized.split(/<\/p>\s*<p>/i);
  if(parts.length === 1){
    return [normalized.replace(/^<p>/i, "").replace(/<\/p>$/i, "").trim()].filter(Boolean);
  }
  parts[0] = parts[0].replace(/^<p>/i, "");
  parts[parts.length-1] = parts[parts.length-1].replace(/<\/p>$/i, "");
  return parts.map(p => p.trim()).filter(Boolean);
}

async function docxToBlocks(file){
  const result = await mammoth.convertToHtml({ path: file }, { styleMap: ["u => u"] });
  const html = result.value || "";
  return extractParagraphs(html);
}

function splitDays(blocks){
  const days = new Map();
  let current = null;
  const dayRe = /^\s*Day\s+(\d+)\b/i;
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

function parseTheory(file){
  if(!fs.existsSync(file)) return [];
  const text = fs.readFileSync(file, "utf8");
  const raw = text.split(/\r?\n/);
  const days = new Map();
  let current = 1;
  days.set(current, []);
  const actRe = /^\s*Act\s+([IVXLC0-9]+)\b/i;
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
  for(const line of raw){
    const trimmed = line.trim();
    if(!trimmed) continue;
    const m = trimmed.match(actRe);
    if(m){
      current = romanToInt(m[1]);
      if(!days.has(current)) days.set(current, []);
      days.get(current).push(trimmed);
      continue;
    }
    days.get(current).push(trimmed);
  }
  return Array.from(days.entries())
    .sort((a,b)=>a[0]-b[0])
    .map(([day, blocks]) => ({ day, blocks }));
}

async function main(){
  const worlds = [];
  for(const src of DOCX_SOURCES){
    const filePath = path.resolve(src.file);
    if(!fs.existsSync(filePath)){
      console.warn("Missing:", filePath);
      continue;
    }
    const blocks = await docxToBlocks(filePath);
    const days = splitDays(blocks);
    const count = days.reduce((sum, d) => sum + d.blocks.length, 0);
    worlds.push({ id: src.id, name: src.name, days, stats: { days: days.length, blocks: count } });
  }

  if(fs.existsSync(FUTURE_PATH)){
    const blocks = await docxToBlocks(FUTURE_PATH);
    const days = splitDays(blocks);
    const count = days.reduce((sum, d) => sum + d.blocks.length, 0);
    worlds.push({ id: "future-2027", name: "FUTURE 2027", days, stats: { days: days.length, blocks: count } });
  }

  if(fs.existsSync(THEORY_PATH)){
    const days = parseTheory(THEORY_PATH);
    const count = days.reduce((sum, d) => sum + d.blocks.length, 0);
    worlds.push({ id: "theory-tragedy", name: "THEORY TRAGEDY", days, stats: { days: days.length, blocks: count } });
  }

  const out = {
    version: new Date().toISOString().replace(/[-:T]/g, "").slice(0, 15),
    canonical: "core",
    worlds,
  };

  fs.writeFileSync("data/drama_worlds.json", JSON.stringify(out, null, 2));
  console.log("wrote", worlds.length, "worlds");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
