from __future__ import annotations

import unittest

import zornade_geocode_provider as zornade


class ZornadeGeocodeProviderTests(unittest.TestCase):
    def base_row(self, **overrides: str) -> dict[str, str]:
        row = {
            "access_id": "test-1",
            "odonimo_raw": "VIA ALBERT EINSTEIN",
            "civico": "10",
            "esponente": "A",
            "source_lon": "16.3000000",
            "source_lat": "38.9600000",
        }
        row.update(overrides)
        return row

    def test_query_preserves_exponent_and_city_filter(self) -> None:
        variants = zornade.query_variants(self.base_row())
        self.assertEqual(
            variants,
            [("exact_civic_city", "VIA ALBERT EINSTEIN 10/A", "Lamezia Terme")],
        )

    def test_exact_exponent_is_selected_over_sibling_civics(self) -> None:
        payload = {
            "data": [
                {
                    "address_id": 1,
                    "street_name": "Via Albert Einstein",
                    "street_number": "10",
                    "municipality_code": "M208",
                    "municipality_name": "Lamezia Terme",
                    "latitude": 38.9601,
                    "longitude": 16.3001,
                    "formatted_address": "Via Albert Einstein 10, Lamezia Terme, Catanzaro",
                },
                {
                    "address_id": 2,
                    "street_name": "Via Albert Einstein",
                    "street_number": "10/A",
                    "municipality_code": "M208",
                    "municipality_name": "Lamezia Terme",
                    "latitude": 38.9602,
                    "longitude": 16.3002,
                    "formatted_address": "Via Albert Einstein 10/A, Lamezia Terme, Catanzaro",
                },
                {
                    "address_id": 3,
                    "street_name": "Via Albert Einstein",
                    "street_number": "10/B",
                    "municipality_code": "M208",
                    "municipality_name": "Lamezia Terme",
                    "latitude": 38.9603,
                    "longitude": 16.3003,
                    "formatted_address": "Via Albert Einstein 10/B, Lamezia Terme, Catanzaro",
                },
            ],
            "meta": {
                "query": "VIA ALBERT EINSTEIN 10/A",
                "city": "Lamezia Terme",
                "count": 3,
                "zornade_attribution": "Dati elaborati da Zornade",
            },
        }

        rows = zornade.candidate_rows(
            row=self.base_row(),
            payload=payload,
            query="VIA ALBERT EINSTEIN 10/A",
            query_variant="exact_civic_city",
            city="Lamezia Terme",
        )

        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["provider_address_id"], "2")
        self.assertEqual(rows[0]["provider_street_number"], "10/A")
        self.assertEqual(rows[0]["provider_confidence"], "high_exact_civic")
        self.assertEqual(rows[0]["candidate_status"], "candidate_requires_human_review")
        self.assertEqual(rows[0]["provider_result_state"], "match")

    def test_empty_success_response_is_true_no_match(self) -> None:
        payload = {
            "data": [],
            "meta": {
                "query": "VIA ALBERT EINSTEIN 99999",
                "city": "Lamezia Terme",
                "count": 0,
            },
        }

        rows = zornade.candidate_rows(
            row=self.base_row(civico="99999", esponente=""),
            payload=payload,
            query="VIA ALBERT EINSTEIN 99999",
            query_variant="exact_civic_city",
            city="Lamezia Terme",
        )

        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["candidate_status"], "no_match")
        self.assertEqual(rows[0]["provider_result_state"], "no_match")
        self.assertEqual(rows[0]["provider_http_status"], "200")
        self.assertEqual(rows[0].get("candidate_lon", ""), "")

    def test_non_exact_results_are_not_promoted_to_civic_match(self) -> None:
        payload = {
            "data": [
                {
                    "address_id": 1,
                    "street_name": "Via Albert Einstein",
                    "street_number": "10",
                    "municipality_code": "M208",
                    "municipality_name": "Lamezia Terme",
                    "latitude": 38.9601,
                    "longitude": 16.3001,
                    "formatted_address": "Via Albert Einstein 10, Lamezia Terme, Catanzaro",
                }
            ],
            "meta": {
                "query": "VIA ALBERT EINSTEIN 10/A",
                "city": "Lamezia Terme",
                "count": 1,
            },
        }

        rows = zornade.candidate_rows(
            row=self.base_row(),
            payload=payload,
            query="VIA ALBERT EINSTEIN 10/A",
            query_variant="exact_civic_city",
            city="Lamezia Terme",
        )

        self.assertEqual(rows[0]["candidate_status"], "non_exact_results_only")
        self.assertEqual(rows[0]["provider_result_state"], "ambiguous_result")
        self.assertEqual(rows[0].get("candidate_lon", ""), "")

    def test_query_too_broad_is_not_no_match(self) -> None:
        state, code = zornade.classify_http_error(
            400,
            '{"error":{"code":"QUERY_TOO_BROAD","message":"add a house number or city"}}',
        )
        self.assertEqual(state, "query_too_broad")
        self.assertEqual(code, "QUERY_TOO_BROAD")
        self.assertNotEqual(state, "no_match")

    def test_technical_error_is_retryable_and_distinct_from_no_match(self) -> None:
        state, code = zornade.classify_http_error(503, '{"error":"upstream unavailable"}')
        self.assertEqual(state, "technical_error")
        self.assertEqual(code, "")
        self.assertTrue(zornade.is_retryable_provider_state(state))
        self.assertFalse(zornade.is_retryable_provider_state("no_match"))


if __name__ == "__main__":
    unittest.main()
