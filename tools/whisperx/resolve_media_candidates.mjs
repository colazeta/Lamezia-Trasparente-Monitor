#!/usr/bin/env node
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { URL } from 'node:url';

const MAX_HTML_BYTES = 5 * 1024 * 1024;
const TIMEOUT_MS = 20_000;
const MEDIA_EXT = /\.(?:mp3|m4a|aac|wav|ogg|opus|mp4|webm|m3u8)(?:$|[?#])/i;
const MEDIA_HINT = /(?:youtube\.com|youtu\.be|vimeo\.com|facebook\.com|fb\.watch|player|stream|video|media)/i;

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

function extractResources(html, baseUrl) {
  const found = new Set();
  const patterns = [
    /(?:src|href|content|data-src|data-video-url|data-url)\s*=\s*["']([^"']+)["']/gi,
    /"(?:contentUrl|embedUrl|url)"\s*:\s*"([^"]+)"/gi,
  ];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const decoded = match[1].replace(/\\\//g, '/').replace(/&amp;/g, '&');
      const url = normaliseUrl(decoded, baseUrl);
      if (!url) continue;
      if (MEDIA_EXT.test(url) || MEDIA_HINT.test(url)) found.add(url);
    }
  }
  return [...found].sort();
}

function markerPresence(html, markers = []) {
  const lower = html.toLocaleLowerCase('it');
  return Object.fromEntries(markers.map((marker) => [marker, lower.includes(String(marker).toLocaleLowerCase('it'))]));
}

async function boundedFetch(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': 'Lamezia-Trasparente-WhisperX-SourceProbe/1.0 (+public-source-resolution)',
        accept: 'text/html,application/xhtml+xml,application/json;q=0.8,*/*;q=0.1',
      },
    });
    const contentType = response.headers.get('content-type') || '';
    const contentLength = Number(response.headers.get('content-length') || 0);
    if (contentLength > MAX_HTML_BYTES) throw new Error('response-too-large');
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength > MAX_HTML_BYTES) throw new Error('response-too-large');
    return {
      ok: response.ok,
      status: response.status,
      finalUrl: response.url,
      contentType,
      bytes,
      text: new TextDecoder('utf-8', { fatal: false }).decode(bytes),
    };
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
      const resources = extractResources(response.text, response.finalUrl);
      results.push({
        id: candidate.id,
        role: candidate.role,
        requestedUrl: approved.toString(),
        finalUrl: response.finalUrl,
        status: response.status,
        ok: response.ok,
        contentType: response.contentType.split(';')[0],
        bodySha256: crypto.createHash('sha256').update(response.bytes).digest('hex'),
        bodyBytes: response.bytes.byteLength,
        markers: markerPresence(response.text, candidate.expectedMarkers),
        discoveredResources: resources,
        discoveredResourceCount: resources.length,
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
      maxResponseBytes: MAX_HTML_BYTES,
      timeoutMs: TIMEOUT_MS,
      secretsUsed: false,
    },
    results,
  };
  await fs.mkdir(new URL('.', `file://${process.cwd()}/${outputPath}`).pathname, { recursive: true }).catch(() => {});
  const slash = outputPath.lastIndexOf('/');
  if (slash >= 0) await fs.mkdir(outputPath.slice(0, slash), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({
    status: 'ok',
    candidates: results.length,
    reachable: results.filter((item) => item.ok).length,
    discoveredResources: results.reduce((sum, item) => sum + item.discoveredResourceCount, 0),
  }));
}

main().catch((error) => die(error instanceof Error ? error.message : String(error)));
