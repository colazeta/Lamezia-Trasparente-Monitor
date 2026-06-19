from __future__ import annotations

import sys

from utils import CSV_HEADERS, INTERIM_TABLES_DIR, PROCESSED_DIR, ensure_processed_csvs, normalize_text, read_csv, slugify, write_csv


ELECTION_ID = "comunali_lamezia_2025"
MUNICIPALITY_ISTAT_CODE = "079160"


def build_id(prefix: str, name: str) -> str:
    return f"{ELECTION_ID}_{prefix}_{slugify(name)}"


def main() -> int:
    ensure_processed_csvs()

    mayor_rows_in = read_csv(INTERIM_TABLES_DIR / "maggioli_2025_mayor_candidates.csv")
    list_rows_in = read_csv(INTERIM_TABLES_DIR / "maggioli_2025_lists.csv")
    council_rows_in = read_csv(INTERIM_TABLES_DIR / "maggioli_2025_council_candidates.csv")

    mayor_number_to_id = {}
    mayor_rows = []
    for row in mayor_rows_in:
        candidate_id = build_id("mayor", row["candidate_name"])
        mayor_number_to_id[row["candidate_number"]] = candidate_id
        mayor_rows.append(
            {
                "mayor_candidate_id": candidate_id,
                "election_id": row["election_id"],
                "round": row["round"],
                "candidate_name": row["candidate_name"],
                "normalised_candidate_name": normalize_text(row["candidate_name"]),
                "coalition_label": "",
                "source_doc_id": row["source_doc_id"],
                "notes": f"maggioli_candidate_number={row['candidate_number']}",
            }
        )

    list_number_to_id = {}
    list_rows = []
    for row in list_rows_in:
        list_id = build_id("list", row["list_name"])
        list_number_to_id[row["list_number"]] = list_id
        list_rows.append(
            {
                "list_id": list_id,
                "election_id": row["election_id"],
                "list_name": row["list_name"],
                "normalised_list_name": normalize_text(row["list_name"]),
                "mayor_candidate_id": mayor_number_to_id.get(row["mayor_candidate_number"], ""),
                "coalition_label": "",
                "source_doc_id": row["source_doc_id"],
                "notes": f"maggioli_list_number={row['list_number']}; mayor_candidate_number={row['mayor_candidate_number']}",
            }
        )

    council_key_to_id = {}
    council_rows = []
    for row in council_rows_in:
        list_id = list_number_to_id.get(row["list_number"], "")
        candidate_id = f"{list_id}_candidate_{slugify(row['candidate_name'])}" if list_id else build_id("council", row["candidate_name"])
        council_key_to_id[(row["list_number"], row["council_candidate_number"])] = candidate_id
        council_rows.append(
            {
                "council_candidate_id": candidate_id,
                "election_id": row["election_id"],
                "list_id": list_id,
                "candidate_name": row["candidate_name"],
                "normalised_candidate_name": normalize_text(row["candidate_name"]),
                "source_doc_id": row["source_doc_id"],
                "notes": f"maggioli_list_number={row['list_number']}; maggioli_council_candidate_number={row['council_candidate_number']}",
            }
        )

    elections = [
        {
            "election_id": ELECTION_ID,
            "year": "2025",
            "election_type": "comunali",
            "election_date_first_round": "2025-05-25",
            "election_date_second_round": "",
            "municipality_name": "Lamezia Terme",
            "municipality_istat_code": MUNICIPALITY_ISTAT_CODE,
            "province": "Catanzaro",
            "region": "Calabria",
            "ordinary_or_special": "ordinaria",
            "notes": "Maggioli XML uses COMUNE_ISTAT=79160; processed code normalizes to six-digit ISTAT 079160.",
            "primary_source_status": "comune_maggioli_xml_downloaded",
            "eligendo_validation_status": "pending",
        }
    ]

    sections = read_csv(INTERIM_TABLES_DIR / "maggioli_2025_sections.csv")
    turnout = read_csv(INTERIM_TABLES_DIR / "maggioli_2025_turnout_section.csv")

    mayor_votes = []
    for row in read_csv(INTERIM_TABLES_DIR / "maggioli_2025_votes_mayor_section.csv"):
        candidate_id = mayor_number_to_id.get(row["candidate_number"], "")
        mayor_votes.append(
            {
                "election_id": row["election_id"],
                "round": row["round"],
                "section_number": row["section_number"],
                "mayor_candidate_id": candidate_id,
                "votes": row["votes"],
                "source_doc_id": row["source_doc_id"],
                "validation_status": "extracted_pending_totals_validation" if candidate_id else "missing_candidate_id",
                "notes": f"maggioli_candidate_number={row['candidate_number']}",
            }
        )

    list_votes = []
    for row in read_csv(INTERIM_TABLES_DIR / "maggioli_2025_votes_list_section.csv"):
        list_id = list_number_to_id.get(row["list_number"], "")
        list_votes.append(
            {
                "election_id": row["election_id"],
                "round": row["round"],
                "section_number": row["section_number"],
                "list_id": list_id,
                "votes": row["votes"],
                "source_doc_id": row["source_doc_id"],
                "validation_status": "extracted_pending_totals_validation" if list_id else "missing_list_id",
                "notes": f"maggioli_list_number={row['list_number']}",
            }
        )

    preferences = []
    for row in read_csv(INTERIM_TABLES_DIR / "maggioli_2025_preferences_section.csv"):
        list_id = list_number_to_id.get(row["list_number"], "")
        council_id = council_key_to_id.get((row["list_number"], row["council_candidate_number"]), "")
        preferences.append(
            {
                "election_id": row["election_id"],
                "section_number": row["section_number"],
                "list_id": list_id,
                "council_candidate_id": council_id,
                "preference_votes": row["preference_votes"],
                "source_doc_id": row["source_doc_id"],
                "validation_status": "extracted_pending_totals_validation" if list_id and council_id else "missing_candidate_or_list_id",
                "notes": f"maggioli_list_number={row['list_number']}; maggioli_council_candidate_number={row['council_candidate_number']}",
            }
        )

    write_csv(PROCESSED_DIR / "elections.csv", elections, CSV_HEADERS["elections.csv"])
    write_csv(PROCESSED_DIR / "mayor_candidates.csv", mayor_rows, CSV_HEADERS["mayor_candidates.csv"])
    write_csv(PROCESSED_DIR / "lists.csv", list_rows, CSV_HEADERS["lists.csv"])
    write_csv(PROCESSED_DIR / "council_candidates.csv", council_rows, CSV_HEADERS["council_candidates.csv"])
    write_csv(PROCESSED_DIR / "sections.csv", sections, CSV_HEADERS["sections.csv"])
    write_csv(PROCESSED_DIR / "turnout_section.csv", turnout, CSV_HEADERS["turnout_section.csv"])
    write_csv(PROCESSED_DIR / "votes_mayor_section.csv", mayor_votes, CSV_HEADERS["votes_mayor_section.csv"])
    write_csv(PROCESSED_DIR / "votes_list_section.csv", list_votes, CSV_HEADERS["votes_list_section.csv"])
    write_csv(PROCESSED_DIR / "preferences_section.csv", preferences, CSV_HEADERS["preferences_section.csv"])

    print(
        "normalised "
        f"mayors={len(mayor_rows)} lists={len(list_rows)} council_candidates={len(council_rows)} "
        f"sections={len(sections)} mayor_votes={len(mayor_votes)} list_votes={len(list_votes)} preferences={len(preferences)}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
