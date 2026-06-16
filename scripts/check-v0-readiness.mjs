#!/usr/bin/env node
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const CONTRACT = "docs/launch-v0/v0-routes.json";
const REPORT = "docs/launch-v0/current-readiness.md";
const JSON_OUT = "artifacts/v0-readiness.json";
const ROUTER = "artifacts/lamezia-trasparente/src/Router.tsx";
const APP = "artifacts/lamezia-trasparente/src/App.tsx";
const PUBLIC = "artifacts/lamezia-trasparente/public";
const REQUIRED = ["/","/convocazioni","/convocazioni/demo-consiglio-comunale-v0","/contratti","/pnrr","/redazione","/healthz.json","/fonti-dati","/metodologia","/note-legali"];
const STATUSES = new Set(["pubblicabile","sperimentale","in-preparazione","riservata","static-marker"]);
const MODES = new Set(["real","fixture","manual","none","mixed"]);
const BAD_COPY = [/corruzione/i, /mafios[oaie]/i, /favoritism|favoritismo/i, /colpevol/i];

async function exists(p){try{await access(path.join(ROOT,p), constants.R_OK);return true;}catch{return false;}}
async function text(p){return readFile(path.join(ROOT,p),"utf8");}
function esc(s){return s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");}
function routeRegex(route){if(route==="/")return /<Route\s+path=["']\/["']/;return new RegExp(`path=["']${esc(route)}["']`);}
function dynamicMatch(route, router){return route.startsWith("/convocazioni/") && /path=["']\/convocazioni\/:id["']/.test(router);}
function add(issues,severity,route,check,message,action){issues.push({severity,route,check,message,action});}
function outcome(counts){if(counts.P0>0)return "NO_GO";if(counts.P1>0||counts.P2>0)return "GO_WITH_LIMITS";return "GO";}
function count(issues){return {P0:issues.filter(i=>i.severity==="P0").length,P1:issues.filter(i=>i.severity==="P1").length,P2:issues.filter(i=>i.severity==="P2").length,INFO:issues.filter(i=>i.severity==="INFO").length};}
function mdTable(rows){return ["| Route | Stato | Controlli | Risultato |","| --- | --- | --- | --- |",...rows.map(r=>`| \`${r.path}\` | ${r.status} | ${r.checks.join("<br>")} | **${r.result}** |`)].join("\n");}
async function main(){
  const contract = JSON.parse(await text(CONTRACT));
  const routes = contract.routes;
  const issues=[];
  if(!Array.isArray(routes)) throw new Error("Route contract must include a routes array.");
  const byPath=new Map(routes.map(r=>[r.path,r]));
  for(const route of REQUIRED){ if(!byPath.has(route)) add(issues,"P0",route,"contract","Route minima assente dal contratto v0.","Aggiungere la route al contratto machine-readable."); }
  for(const r of routes){
    for(const field of ["path","status","expectedDataMode","notes"]){ if(typeof r[field]!=="string" || !r[field].trim()) add(issues,"P0",r.path||"(unknown)","contract",`Campo obbligatorio mancante o vuoto: ${field}.`,`Compilare ${field} nel contratto.`); }
    for(const field of ["v0Critical","mustNotErrorBoundary","requiresSourceAndLimits","humanCheckRequired"]){ if(typeof r[field]!=="boolean") add(issues,"P0",r.path||"(unknown)","contract",`Campo booleano non valido: ${field}.`,`Usare true/false per ${field}.`); }
    if(!STATUSES.has(r.status)) add(issues,"P0",r.path,"contract",`Stato non valido: ${r.status}.`,"Usare uno degli stati ammessi.");
    if(!MODES.has(r.expectedDataMode)) add(issues,"P0",r.path,"contract",`Data mode non valido: ${r.expectedDataMode}.`,"Usare real, fixture, manual, none o mixed.");
    if(BAD_COPY.some(rx=>rx.test(`${r.notes}`))) add(issues,"P1",r.path,"copy","Note da rivedere per linguaggio potenzialmente accusatorio.","Usare termini prudenti come indicatore, segnale, data gap o verifica richiesta.");
  }
  const router = await text(ROUTER); const app = await text(APP);
  const redirectsOk = (await exists(`${PUBLIC}/_redirects`)) && (await text(`${PUBLIC}/_redirects`)).includes("/*") && (await text(`${PUBLIC}/_redirects`)).includes("/index.html");
  const healthzOk = await exists(`${PUBLIC}/healthz.json`);
  let healthzLimitOk=false; if(healthzOk){const h=JSON.parse(await text(`${PUBLIC}/healthz.json`));healthzLimitOk=h.status==="static-fallback-available"&&h.checks?.api==="not-checked"&&Array.isArray(h.limitations)&&h.limitations.length>0;}
  if(!redirectsOk) add(issues,"P0","/*","static-fallback","Fallback SPA Cloudflare `_redirects` assente o incompleto.","Ripristinare `/* /index.html 200`.");
  if(!healthzLimitOk) add(issues,"P0","/healthz.json","static-marker","Marker statico assente o privo di limiti su API/live data.","Mantenere un healthz statico che non certifichi dati live.");
  const rows=[];
  for(const r of routes){
    const checks=[]; let result="PASS";
    const inRouter = r.path==="/healthz.json" ? healthzOk : routeRegex(r.path).test(router) || dynamicMatch(r.path,router);
    checks.push(inRouter?"routing/static presente":"routing/static assente");
    if(!inRouter && r.status==="pubblicabile") { add(issues,"P0",r.path,"routing","Route pubblicabile non presente nel routing/static fallback.","Aggiungere route o cambiare stato nel contratto."); result="FAIL"; }
    if(r.status==="riservata"){ const protectedCopy = app.includes("RedazioneUnavailablePage") && app.includes("/redazione/*?"); checks.push(protectedCopy?"riservata protetta in preview":"riservata da verificare"); if(!protectedCopy){add(issues,"P1",r.path,"reserved","Route riservata non mostra fallback protettivo evidente.","Verificare che non appaia come contenuto pubblico ordinario."); result="LIMIT";} }
    if(r.v0Critical && r.mustNotErrorBoundary){ checks.push("no error-boundary generico richiesto"); }
    if(r.requiresSourceAndLimits){ add(issues,"P1",r.path,"human-review","Verifica manuale fonte/limiti richiesta prima dell'annuncio pubblico.","Confermare in review presenza di fonti, limiti e stato di verifica."); if(result==="PASS") result="LIMIT"; }
    if(["mixed","real"].includes(r.expectedDataMode)){ add(issues,"P2",r.path,"empty-state","Pagina data-driven: controllare empty state prudente e normalizzazione dati API.","Verificare messaggi di dato non disponibile/non verificato/fonte non rilevata."); if(result==="PASS") result="LIMIT"; }
    checks.push(redirectsOk?"fallback SPA documentato":"fallback SPA mancante");
    rows.push({...r,checks,result});
  }
  add(issues,"INFO","/healthz.json","scope","API, worker e dati live non sono richiesti dal detector v0.","Eseguire smoke statico separato con `pnpm run smoke:v0-static-fallback`.");
  const counts=count(issues); const final=outcome(counts);
  const generatedAt=new Date().toISOString();
  const report = `# Current v0 readiness\n\nGenerated: ${generatedAt}\n\nV0 readiness: **${final}**\n\n- P0 blockers: ${counts.P0}\n- P1 issues: ${counts.P1}\n- P2 notes: ${counts.P2}\n- INFO: ${counts.INFO}\n\n## Route table\n\n${mdTable(rows)}\n\n## Issues and recommended actions\n\n${issues.map(i=>`- **${i.severity}** \`${i.route}\` — ${i.check}: ${i.message} Action: ${i.action}`).join("\n")}\n\n## Policy notes\n\n- Questo report misura readiness strutturale, non completezza ufficiale dei dati.\n- Nessun controllo richiede scraping, provider live, backend, worker, DNS, segreti o servizi a pagamento.\n- I risultati P1/P2 sono limitazioni da dichiarare e verificare con linguaggio prudente e documentale.\n`;
  const json={schemaVersion:1,generatedAt,outcome:final,counts,reportPath:REPORT,routeContractPath:CONTRACT,routeResults:rows,issues};
  await mkdir(path.dirname(path.join(ROOT,REPORT)),{recursive:true}); await mkdir(path.dirname(path.join(ROOT,JSON_OUT)),{recursive:true});
  await writeFile(path.join(ROOT,REPORT),report); await writeFile(path.join(ROOT,JSON_OUT),JSON.stringify(json,null,2)+"\n");
  console.log(`V0 readiness: ${final}`); console.log(`P0 blockers: ${counts.P0}`); console.log(`P1 issues: ${counts.P1}`); console.log(`P2 notes: ${counts.P2}`); console.log(`Report: ${REPORT}`); console.log(`JSON: ${JSON_OUT}`);
}
main().catch(e=>{console.error(e instanceof Error?e.message:String(e));process.exitCode=1;});
