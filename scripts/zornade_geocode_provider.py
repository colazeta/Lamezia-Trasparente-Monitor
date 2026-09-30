from __future__ import annotations

import hashlib
import json
import math
import re
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any


ZORNADE_SEARCH_URL = "https://api.zornade.com/api/v2/geocode/search"
ZORNADE_DOCS_URL = "https://zornade.com/documentation"
DEFAULT_CITY = "Lamezia Terme"
LAMEZIA_BBOX = (16.0, 38.75, 16.6, 39.15)


class ZornadeRequestError(RuntimeError):
    def __init__(
        self,
        *,
        result_state: str,
        message: str,
        http_status: int | None = None,
        error_code: str = "",
    ) -> None:
        super().__init__(message)
        self.result_state = result_state
        self.http_status = http_status
        self.error_code = error_code


def as_text(value: Any) -> str:
    if value is None:
        return ""
    text = str(value)
    return "" if text.lower() == "nan" else text.strip()


def as_float(value: Any) -> float:
    text = as_text(value).replace(",", ".")
    try:
        return float(text)
    except ValueError:
        return math.nan


def civic_token(row: dict[str, Any]) -> str:
    civic = as_text(row.get("civico") or row.get("civic"))
    exponent = as_text(row.get("esponente"))
    if civic and exponent:
        return f"{civic}/{exponent}"
    return civic


def query_variants(
    row: dict[str, Any],
    *,
    city: str = DEFAULT_CITY,
) -> list[tuple[str, str, str]]:
    """
    Return exactly one preferred Zornade query.

    When a civic is available, the query is street+civic with an explicit city
    filter. A 200 response with data=[] is therefore meaningful no-match
    evidence and must not be diluted by an automatic street-only fallback.
    """
    street = as_text(row.get("odonimo_raw") or row.get("street"))
    if not street:
        return []
    number = civic_token(row)
    if number:
        return [("exact_civic_city", f"{street} {number}".strip(), city)]
    return [("street_city", street, city)]


def cache_key(query: str, city: str) -> str:
    material = json.dumps(
        {"provider": "zornade", "endpoint": ZORNADE_SEARCH_URL, "q": query, "city": city},
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    )
    return hashlib.sha256(material.encode("utf-8")).hexdigest()


def cached_response(cache_dir: Path, query: str, city: str) -> dict[str, Any] | None:
    path = cache_dir / f"{cache_key(query, city)}.json"
    if not path.exists():
        return None
    payload = json.loads(path.read_text(encoding="utf-8"))
    return payload if isinstance(payload, dict) else None


def write_cache(cache_dir: Path, query: str, city: str, payload: dict[str, Any]) -> None:
    cache_dir.mkdir(parents=True, exist_ok=True)
    path = cache_dir / f"{cache_key(query, city)}.json"
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def _error_code_from_payload(body: str) -> str:
    try:
        payload = json.loads(body)
    except json.JSONDecodeError:
        payload = None

    candidates: list[str] = []
    if isinstance(payload, dict):
        for key in ("code", "error_code"):
            value = payload.get(key)
            if isinstance(value, str):
                candidates.append(value)
        error = payload.get("error")
        if isinstance(error, str):
            candidates.append(error)
        elif isinstance(error, dict):
            for key in ("code", "error_code", "type"):
                value = error.get(key)
                if isinstance(value, str):
                    candidates.append(value)

    text = " ".join(candidates + [body]).upper()
    for known in (
        "QUERY_TOO_BROAD",
        "API_KEY_REQUIRED",
        "INVALID_API_KEY",
        "RATE_LIMITED",
        "INVALID_PARAMS",
    ):
        if known in text:
            return known
    if "TOO GENERIC" in text or "TOO BROAD" in text:
        return "QUERY_TOO_BROAD"
    return candidates[0] if candidates else ""


def classify_http_error(http_status: int, body: str) -> tuple[str, str]:
    error_code = _error_code_from_payload(body)
    if http_status == 400 and error_code == "QUERY_TOO_BROAD":
        return "query_too_broad", error_code
    if http_status in {401, 403}:
        return "configuration_error", error_code
    if http_status == 429:
        return "rate_limited", error_code or "RATE_LIMITED"
    if http_status >= 500:
        return "technical_error", error_code
    return "request_error", error_code


def request(
    *,
    query: str,
    city: str,
    api_key: str,
    timeout: float,
    limit: int = 10,
) -> dict[str, Any]:
    params = {"q": query, "city": city, "limit": str(limit)}
    url = f"{ZORNADE_SEARCH_URL}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(
        url,
        headers={
            "x-api-key": api_key,
            "Accept": "application/json",
            "User-Agent": "Lamezia-Trasparente-Monitor/anncsu-coordinate-qa",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            body = response.read().decode("utf-8")
            if response.status != 200:
                state, error_code = classify_http_error(response.status, body)
                raise ZornadeRequestError(
                    result_state=state,
                    http_status=response.status,
                    error_code=error_code,
                    message=f"Zornade returned HTTP {response.status}",
                )
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        state, error_code = classify_http_error(exc.code, body)
        raise ZornadeRequestError(
            result_state=state,
            http_status=exc.code,
            error_code=error_code,
            message=f"Zornade returned HTTP {exc.code}",
        ) from exc
    except (urllib.error.URLError, TimeoutError) as exc:
        raise ZornadeRequestError(
            result_state="technical_error",
            message=f"Zornade request failed: {exc}",
        ) from exc

    try:
        payload = json.loads(body)
    except json.JSONDecodeError as exc:
        raise ZornadeRequestError(
            result_state="technical_error",
            http_status=200,
            message="Zornade returned invalid JSON",
        ) from exc

    if not isinstance(payload, dict) or not isinstance(payload.get("data"), list):
        raise ZornadeRequestError(
            result_state="technical_error",
            http_status=200,
            message="Zornade response is missing the expected data[] array",
        )
    return payload


def _normalise_civic(value: Any) -> str:
    return re.sub(r"\s+", "", as_text(value).upper())


def _within_lamezia_bbox(lon: float, lat: float) -> bool:
    west, south, east, north = LAMEZIA_BBOX
    return west <= lon <= east and south <= lat <= north


def _haversine_m(lon1: float, lat1: float, lon2: float, lat2: float) -> float:
    if any(math.isnan(value) for value in (lon1, lat1, lon2, lat2)):
        return math.nan
    radius = 6_371_000.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)
    a = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    return radius * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _provenance_fields(
    *,
    payload: dict[str, Any],
    query: str,
    city: str,
    query_variant: str,
) -> dict[str, str]:
    meta = payload.get("meta")
    meta = meta if isinstance(meta, dict) else {}
    attribution = as_text(meta.get("zornade_attribution"))
    return {
        "provider": "zornade",
        "provider_endpoint": ZORNADE_SEARCH_URL,
        "provider_city": city,
        "provider_http_status": "200",
        "provider_error_code": "",
        "provider_attribution": attribution,
        "provider_result_count": as_text(meta.get("count")),
        "query": query,
        "query_variant": query_variant,
        "provider_license": "Zornade API v2; preserve provider/source attribution metadata when returned",
        "cache_key": cache_key(query, city),
    }


def candidate_rows(
    *,
    row: dict[str, Any],
    payload: dict[str, Any],
    query: str,
    query_variant: str,
    city: str,
) -> list[dict[str, Any]]:
    provenance = _provenance_fields(
        payload=payload,
        query=query,
        city=city,
        query_variant=query_variant,
    )
    data = payload.get("data")
    data = data if isinstance(data, list) else []
    source_lon = as_float(row.get("source_lon"))
    source_lat = as_float(row.get("source_lat"))
    requested_civic = _normalise_civic(civic_token(row))

    if not data:
        return [
            {
                "access_id": as_text(row.get("access_id")),
                **provenance,
                "candidate_rank": "",
                "candidate_status": "no_match",
                "provider_result_state": "no_match",
            }
        ]

    candidates = [item for item in data if isinstance(item, dict)]
    if requested_civic:
        exact = [
            item
            for item in candidates
            if _normalise_civic(item.get("street_number")) == requested_civic
        ]
        if not exact:
            return [
                {
                    "access_id": as_text(row.get("access_id")),
                    **provenance,
                    "candidate_rank": "",
                    "candidate_status": "non_exact_results_only",
                    "provider_result_state": "ambiguous_result",
                    "provider_confidence": "no_exact_civic_match",
                }
            ]
        candidates = exact

    out: list[dict[str, Any]] = []
    for index, candidate in enumerate(candidates, start=1):
        lon = as_float(candidate.get("longitude"))
        lat = as_float(candidate.get("latitude"))
        municipality_name = as_text(candidate.get("municipality_name"))
        municipality_ok = municipality_name.casefold() == city.casefold()
        distance = _haversine_m(source_lon, source_lat, lon, lat)

        if not municipality_ok:
            confidence = "reject_municipality_mismatch"
            status = "rejected_context"
            result_state = "match_rejected"
        elif requested_civic:
            confidence = "high_exact_civic"
            status = "candidate_requires_human_review"
            result_state = "match"
        else:
            confidence = "low_street_level"
            status = "candidate_requires_human_review"
            result_state = "match"

        out.append(
            {
                "access_id": as_text(row.get("access_id")),
                **provenance,
                "candidate_rank": index,
                "candidate_lon": "" if math.isnan(lon) else f"{lon:.7f}",
                "candidate_lat": "" if math.isnan(lat) else f"{lat:.7f}",
                "candidate_display_name": as_text(candidate.get("formatted_address")),
                "candidate_class": "address",
                "candidate_type": "address",
                "candidate_importance": "",
                "candidate_place_rank": "",
                "candidate_has_house_number": "true" if as_text(candidate.get("street_number")) else "false",
                "within_lamezia_bbox": "true" if _within_lamezia_bbox(lon, lat) else "false",
                "distance_from_source_m": "" if math.isnan(distance) else f"{distance:.1f}",
                "provider_confidence": confidence,
                "candidate_status": status,
                "provider_result_state": result_state,
                "provider_address_id": as_text(candidate.get("address_id")),
                "provider_street_name": as_text(candidate.get("street_name")),
                "provider_street_number": as_text(candidate.get("street_number")),
                "provider_municipality_code": as_text(candidate.get("municipality_code")),
                "provider_municipality_name": municipality_name,
            }
        )
    return out


def error_row(
    *,
    row: dict[str, Any],
    query: str,
    query_variant: str,
    city: str,
    error: ZornadeRequestError,
) -> dict[str, Any]:
    status = f"provider_{error.result_state}"
    return {
        "access_id": as_text(row.get("access_id")),
        "provider": "zornade",
        "provider_endpoint": ZORNADE_SEARCH_URL,
        "provider_city": city,
        "provider_http_status": "" if error.http_status is None else str(error.http_status),
        "provider_error_code": error.error_code,
        "provider_attribution": "",
        "provider_result_count": "",
        "query": query,
        "query_variant": query_variant,
        "candidate_rank": "",
        "provider_confidence": "",
        "candidate_status": status,
        "provider_result_state": error.result_state,
        "provider_license": "Zornade API v2; preserve provider/source attribution metadata when returned",
        "cache_key": cache_key(query, city),
    }


def is_retryable_provider_state(result_state: str) -> bool:
    return result_state in {
        "technical_error",
        "configuration_error",
        "rate_limited",
        "query_too_broad",
        "request_error",
    }
