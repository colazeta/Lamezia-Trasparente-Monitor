#!/usr/bin/env bash
set -euo pipefail

# Build/provisioning helper for the dedicated ingestion-worker environment only.
# It is deliberately never invoked by application startup or ingestion runtime.

PYTHON_BIN="${DOCLING_PYTHON_BIN:-python3}"
REQUIREMENTS="${1:-tools/docling/requirements.txt}"
ARTIFACTS_DIR="${DOCLING_ARTIFACTS_PATH:-}"

if ! command -v "$PYTHON_BIN" >/dev/null 2>&1; then
  echo "Python interpreter unavailable" >&2
  exit 2
fi

if [[ -z "$ARTIFACTS_DIR" ]]; then
  echo "DOCLING_ARTIFACTS_PATH must be set for offline worker provisioning" >&2
  exit 2
fi

mkdir -p "$ARTIFACTS_DIR"

"$PYTHON_BIN" -m pip install --upgrade uv
"$PYTHON_BIN" -m uv pip install --system --torch-backend=cpu -r "$REQUIREMENTS"

"$PYTHON_BIN" - <<'PY'
from importlib.metadata import PackageNotFoundError, version

EXPECTED_DOCLING = "2.124.0"
FORBIDDEN_PREFIXES = (
    "nvidia-",
    "cuda-",
)

try:
    installed_docling = version("docling")
except PackageNotFoundError as exc:
    raise SystemExit("Docling was not installed") from exc

if installed_docling != EXPECTED_DOCLING:
    raise SystemExit(
        f"Docling version mismatch: expected {EXPECTED_DOCLING}, got {installed_docling}"
    )

import importlib.metadata as metadata

forbidden = sorted(
    dist.metadata["Name"]
    for dist in metadata.distributions()
    if (dist.metadata.get("Name") or "").lower().startswith(FORBIDDEN_PREFIXES)
)
if forbidden:
    raise SystemExit(
        "CPU-only provisioning gate failed; CUDA/NVIDIA packages detected: "
        + ", ".join(forbidden)
    )

import torch

if torch.version.cuda is not None:
    raise SystemExit(f"CPU-only PyTorch expected, found CUDA {torch.version.cuda}")

print(f"Docling CPU dependencies ready: docling={installed_docling}, torch={torch.__version__}")
PY

if ! command -v docling-tools >/dev/null 2>&1; then
  echo "docling-tools unavailable after Docling installation" >&2
  exit 3
fi

# Explicit model prefetch is allowed only during provisioning. Runtime and
# preflight remain offline and never download weights on first document use.
docling-tools models download -o "$ARTIFACTS_DIR" -q >/dev/null

if ! find "$ARTIFACTS_DIR" -type f -print -quit | grep -q .; then
  echo "Docling model prefetch produced no local artifacts" >&2
  exit 4
fi

printf 'Docling CPU worker provisioned with offline model artifacts at %s\n' "$ARTIFACTS_DIR"
