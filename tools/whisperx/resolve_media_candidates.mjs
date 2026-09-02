#!/usr/bin/env node
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { URL } from 'node:url';

const MAX_HTML_BYTES = 5 * 1024 * 1024;
const TIMEOUT_MS = 20_000;
const MAX_REDIRECTS = 3;
const MAX_SCRIPT_HINTS = 100;
const MAX_SCRIPT_LITERAL_HINTS = 120;
const MEDIA_EXT = /\.(?:mp3|m4a|aac|wav|ogg|opus|mp4|webm|m3u8|mpd)(?:$|[?#])/i;
const MEDIA_HINT = /(?:youtube\.com|youtu\.be|vimeo\.com|facebook\.com|fb\.watch|player|stream|video|media)/i;
const SCRIPT_ENDPOINT_HINT = /(?:\/api\/|manifest|playlist|m3u8|\.mpd|\.mp4|playback|stream|media|source)/i;
const SCRIPT_LITERAL_HINT = /(?:api|media|stream|source|manifest|playlist|playback|hls|dash|m3u8|mp4|src|url)/i;

function die(message) {
  console.error(message);
  process.exit(2);
}

function normaliseUrl(value, base) {
  try {
    const url = new URL(value, base);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    url.hash = '';
    return url.toString();
  } catch {
    return null;
  }
}

function decodeCandidate(value) {
  return value
    .replace(/\\\//g, '/')
    .replace(/\\u002F/gi, '/')
    .replace(/&amp;/g, '&');
}

function extractResources(text, baseUrl) {
  const found = new Set();
  const patterns = [
    /(?:src|href|content|data-src|data-video-url|data-url)\s*=\s*["']([^"']+)["']/gi,
    /"(?:contentUrl|embedUrl|url)"\s*:\s*"([^"]+)"/gi,
  ];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const url = normaliseUrl(decodeCandidate(match[1]), baseUrl);
      if (!url) continue;
      if (MEDIA_EXT.test(url) || MEDIA_HINT.test(url)) found.add(url);
    }
  }
  return [...found].sort();
}

function extractScriptHints(text, baseUrl) {
  const found = new Set();
  const patterns = [
    /https?:\\?\/\\?\/[^"'`\\\s<>]+/gi,
    /["'`]((?:\/|\.\/|\.\.\/)[^"'`\s]{1,300})["'`]/g,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const raw = decodeCandidate(match[1] || match[0]);
      if (!SCRIPT_ENDPOINT_HINT.test(raw)) continue;
      const url = normaliseUrl(raw, baseUrl);
      if (!url) continue;
      found.add(url);
      if (found.size >= MAX_SCRIPT_HINTS) return [...found].sort();
    }
  }
  return [...found].sort();
}

function extractScriptLiteralHints(text) {
  const found = new Set();
  const literalPattern = /(["'`])((?:\\.|(?!\1).){1,220})\1/g;
  let match;
  while ((match = literalPattern.exec(text)) !== null) {
    const literal = decodeCandidate(match[2]).trim();
    if (!literal || !SCRIPT_LITERAL_HINT.test(literal)) continue;
    if (/\s{3,}/.test(literal)) continue;
    found.add(literal);
    if (found.size >= MAX_SCRIPT_LITERAL_HINTS) break;
  }
  return [...found].sort();
}

function markerPresence(text, markers = []) {
  const lower = text.toLocaleLowerCase('it');
  return Object.fromEntries(markers.map((marker) => [marker, lower.includes(String(marker).toLocaleLowerCase('it'))]));
}

async function boundedFetch(inputUrl) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const initial = new URL(inputUrl);
  let current = initial;

  try {
    for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
      const response = await fetch(current.toString(), {
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'user-agent': 'Lamezia-Trasparente-WhisperX-SourceProbe/1.0 (+public-source-resolution)',
          accept: 'text/html,application/xhtml+xml,application/json,text/javascript,application/javascript;q=0.9,*/*;q=0.1',
        },
      });

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (!location) throw new Error('redirect-without-location');
        if (redirectCount >= MAX_REDIRECTS) throw new Error('too-many-redirects');
        const next = new URL(location, current);
        if (!['http:', 'https:'].includes(next.protocol)) throw new Error('unsupported-redirect-protocol');
        if (next.origin !== initial.origin) throw new Error('cross-origin-redirect');
        current = next;
        continue;
      }

      const contentType = response.headers.get('content-type') || '';
      const contentLength = Number(response.headers.get('content-length') || 0);
      if (contentLength > MAX_HTML_BYTES) throw new Error('response-too-large');
      const bytes = new Uint8Array(await response.arrayBuffer());
      if (bytes.byteLength > MAX_HTML_BYTES) throw new Error('response-too-large');
      return {
        ok: response.ok,
        status: response.status,
        finalUrl: current.toString(),
        contentType,
        bytes,
        text: new TextDecoder('utf-8', { fatal: false }).decode(bytes),
      };
    }
    throw new Error('too-many-redirects');
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const manifestPath = process.argv[2] || 'tools/whisperx/lamezia-media-candidates.public.json';
  const outputPath = process.argv[3] || 'tmp/whisperx-source-resolution/resolution.json';
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  if (!Array.isArray(manifest.candidates) || manifest.candidates.length === 0) die('No approved candidates');

  const results = [];
  for (const candidate of manifest.candidates) {
    const approved = new URL(candidate.url);
    if (approved.protocol !== 'https:') die(`Non-HTTPS candidate: ${candidate.id}`);
    try {
      const response = await boundedFetch(approved.toString());
      const final = new URL(response.finalUrl);
      if (final.origin !== approved.origin) throw new Error('cross-origin-redirect');
      const contentType = response.contentType.split(';')[0];
      const isScript = /(?:javascript|ecmascript)/i.test(contentType) || candidate.role === 'reviewed-player-script-locator';
      const resources = extractResources(response.text, response.finalUrl);
      const scriptHints = isScript ? extractScriptHints(response.text, response.finalUrl) : [];
      const scriptLiteralHints = isScript ? extractScriptLiteralHints(response.text) : [];
      results.push({
        id: candidate.id,
        role: candidate.role,
        requestedUrl: approved.toString(),
        finalUrl: response.finalUrl,
        status: response.status,
        ok: response.ok,
        contentType,
        bodySha256: crypto.createHash('sha256').update(response.bytes).digest('hex'),
        bodyBytes: response.bytes.byteLength,
        markers: markerPresence(response.text, candidate.expectedMarkers),
        discoveredResources: resources,
        discoveredResourceCount: resources.length,
        scriptEndpointHints: scriptHints,
        scriptEndpointHintCount: scriptHints.length,
        scriptLiteralHints,
        scriptLiteralHintCount: scriptLiteralHints.length,
      });
    } catch (error) {
      results.push({
        id: candidate.id,
        role: candidate.role,
        requestedUrl: approved.toString(),
        ok: false,
        error: error instanceof Error ? error.message : 'unknown-error',
        discoveredResources: [],
        discoveredResourceCount: 0,
        scriptEndpointHints: [],
        scriptEndpointHintCount: 0,
        scriptLiteralHints: [],
        scriptLiteralHintCount: 0,
      });
    }
  }

  const output = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    purpose: manifest.purpose,
    session: manifest.session,
    fetchPolicy: {
      allowlistedOnly: true,
      followsDiscoveredResources: false,
      crossOriginRedirectFetchPermitted: false,
      maxRedirects: MAX_REDIRECTS,
      maxResponseBytes: MAX_HTML_BYTES,
      timeoutMs: TIMEOUT_MS,
      maxScriptEndpointHints: MAX_SCRIPT_HINTS,
      maxScriptLiteralHints: MAX_SCRIPT_LITERAL_HINTS,
      secretsUsed: false,
    },
    results,
  };
  const slash = outputPath.lastIndexOf('/');
  if (slash >= 0) await fs.mkdir(outputPath.slice(0, slash), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({
    status: 'ok',
    candidates: results.length,
    reachable: results.filter((item) => item.ok).length,
    discoveredResources: results.reduce((sum, item) => sum + item.discoveredResourceCount, 0),
    scriptEndpointHints: results.reduce((sum, item) => sum + item.scriptEndpointHintCount, 0),
    scriptLiteralHints: results.reduce((sum, item) => sum + item.scriptLiteralHintCount, 0),
  }));
}

main().catch((error) => die(error instanceof Error ? error.message : String(error)));
