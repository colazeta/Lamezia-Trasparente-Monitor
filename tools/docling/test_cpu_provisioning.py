from __future__ import annotations

import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SCRIPT = ROOT / "tools/docling/provision_cpu_worker.sh"
ACTIVATION_DOC = ROOT / "docs/architecture/docling-worker-activation.md"


class CpuProvisioningPolicyTest(unittest.TestCase):
    def test_provisioning_is_explicit_cpu_only(self) -> None:
        content = SCRIPT.read_text(encoding="utf-8")
        self.assertIn("--torch-backend=cpu", content)
        self.assertIn("torch.version.cuda", content)
        self.assertIn('"nvidia-"', content)
        self.assertIn('"cuda-"', content)
        self.assertNotIn("DOCLING_ENRICHMENT_ENABLED=true", content)

    def test_activation_runbook_keeps_flag_fail_closed(self) -> None:
        content = ACTIVATION_DOC.read_text(encoding="utf-8")
        self.assertIn("DOCLING_ENRICHMENT_ENABLED=false", content)
        self.assertIn("docling:preflight", content)
        self.assertIn("Do not set the enrichment flag in the HTTP/API deployment", content)
        self.assertIn("memory-only", content)


if __name__ == "__main__":
    unittest.main()
