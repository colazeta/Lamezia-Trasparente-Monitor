# Maggioli checksum repair report

Date: 2026-06-20

Scope: issue #587, raw Maggioli HTML/XML/XSL checksum coherence for the electoral foundation.

## Summary

- Files with mismatch before repair: 20.
- Files restored from official Maggioli URLs in binary mode: 20.
- Files not restored: 0.
- Remaining checksum mismatches after repair: 0.
- `data/processed/source_documents.csv` was not changed because the registered checksums already match the official downloaded bytes.
- Checksum semantic after repair: `original_download_bytes`.
- No processed electoral values were changed.

## Cause

The affected raw Maggioli files were checked out with LF line endings, while their registered SHA256 values correspond to the original CRLF bytes served by Maggioli. `.gitattributes` already marks `data/raw/comune_lamezia/**` and `data/raw/eligendo/**` as `-text -diff`; the repair rewrites the affected raw files from official binary downloads so the repository bytes match the archived checksums.

## Files verified and repaired

| source_doc_id | format | action | cause | before_sha256 | download_sha256 | after_sha256 | bytes before -> after | URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| maggioli_2025_preferences_section_l01_xml | xml | restored_from_official_url_binary | LF-normalized checkout; registered checksum matches CRLF original-download bytes | `05b52d5e9e278f7e5058323fbb0ebfd84fdcbcabdfdccb2f0ce6802692349e11` | `1e4c31b1b1f418b19da9d1003eff25f0c3739fa162b2189d0d6546b531af79b0` | `1e4c31b1b1f418b19da9d1003eff25f0c3739fa162b2189d0d6546b531af79b0` | 385113 -> 385116 | https://elezionilameziaterme.maggiolicloud.it/web250506/comunali/SEZ_3_79160_L1.xml |
| maggioli_2025_preferences_section_l02_xml | xml | restored_from_official_url_binary | LF-normalized checkout; registered checksum matches CRLF original-download bytes | `2fd0944a322bb97b29dd5b845b0707b01125e1dfd6a90bbdc21bf0ec8de3315b` | `cde8e39039565f8179a6aa7abee6a8a3610d6ed1b10a2e4f9a1f113e893874ba` | `cde8e39039565f8179a6aa7abee6a8a3610d6ed1b10a2e4f9a1f113e893874ba` | 383991 -> 383994 | https://elezionilameziaterme.maggiolicloud.it/web250506/comunali/SEZ_3_79160_L2.xml |
| maggioli_2025_preferences_section_l03_xml | xml | restored_from_official_url_binary | LF-normalized checkout; registered checksum matches CRLF original-download bytes | `31842f8e439315c96093f7ecabca1827a32dfa2c558db51fc234146881054cba` | `2d0becd50791ab003ee31d2346c6ababf0f052dade0b7aa89b86cf64f80f0845` | `2d0becd50791ab003ee31d2346c6ababf0f052dade0b7aa89b86cf64f80f0845` | 384430 -> 384433 | https://elezionilameziaterme.maggiolicloud.it/web250506/comunali/SEZ_3_79160_L3.xml |
| maggioli_2025_preferences_section_l04_xml | xml | restored_from_official_url_binary | LF-normalized checkout; registered checksum matches CRLF original-download bytes | `dfcdafeefe7200385673ab31b8964debf65525631bbd7b3593a171fb2d6e1a13` | `d81843e770416ec006df15c25bc201c3d3b2b92b6fd282241781b19e9bbb6ffb` | `d81843e770416ec006df15c25bc201c3d3b2b92b6fd282241781b19e9bbb6ffb` | 384624 -> 384627 | https://elezionilameziaterme.maggiolicloud.it/web250506/comunali/SEZ_3_79160_L4.xml |
| maggioli_2025_preferences_section_l05_xml | xml | restored_from_official_url_binary | LF-normalized checkout; registered checksum matches CRLF original-download bytes | `0bd33460fc2d4a9aebb79c122f2a41f251db44d4c9763852b2990021d4baead9` | `4fef926e2ac110837cecd6cc52782a8e88f35ac9c3623e96c5719e1bf065ea6e` | `4fef926e2ac110837cecd6cc52782a8e88f35ac9c3623e96c5719e1bf065ea6e` | 383602 -> 383605 | https://elezionilameziaterme.maggiolicloud.it/web250506/comunali/SEZ_3_79160_L5.xml |
| maggioli_2025_preferences_section_l06_xml | xml | restored_from_official_url_binary | LF-normalized checkout; registered checksum matches CRLF original-download bytes | `bd912c48e69a644dc81b9c2b4be08156b1f6439e4f293854d3382fccb29e3488` | `7370e346b9199f0f61078e710300ae6caacc89a1cc5696313944c27dc96b8fc2` | `7370e346b9199f0f61078e710300ae6caacc89a1cc5696313944c27dc96b8fc2` | 385003 -> 385006 | https://elezionilameziaterme.maggiolicloud.it/web250506/comunali/SEZ_3_79160_L6.xml |
| maggioli_2025_preferences_section_l07_xml | xml | restored_from_official_url_binary | LF-normalized checkout; registered checksum matches CRLF original-download bytes | `993553f865be406f9ff9e2009a9e8a35f5a4697ee7de079f13a5cfcaa0ac9494` | `b74c0662163306113ce1b65fd153bbe096315eabe29e9b9ff32fcc1b4045c4c4` | `b74c0662163306113ce1b65fd153bbe096315eabe29e9b9ff32fcc1b4045c4c4` | 342015 -> 342018 | https://elezionilameziaterme.maggiolicloud.it/web250506/comunali/SEZ_3_79160_L7.xml |
| maggioli_2025_preferences_section_l08_xml | xml | restored_from_official_url_binary | LF-normalized checkout; registered checksum matches CRLF original-download bytes | `9ba9b27c06b0eaaa9a469381ae4beba39dbae0b7a15bb5620721eb45b494d9a8` | `d581426b46e58bed60affb932580d510d7e59215682920d116bdbab75e943e16` | `d581426b46e58bed60affb932580d510d7e59215682920d116bdbab75e943e16` | 341770 -> 341773 | https://elezionilameziaterme.maggiolicloud.it/web250506/comunali/SEZ_3_79160_L8.xml |
| maggioli_2025_preferences_section_l09_xml | xml | restored_from_official_url_binary | LF-normalized checkout; registered checksum matches CRLF original-download bytes | `2269f46e95aa4ead7ba38071a31c242b57106ca15065955a1339144603f0bac5` | `77b086fbb4d6831654f39d10eb15b9ddf7be0aa17f1707c602d0bfce5de2f197` | `77b086fbb4d6831654f39d10eb15b9ddf7be0aa17f1707c602d0bfce5de2f197` | 384728 -> 384731 | https://elezionilameziaterme.maggiolicloud.it/web250506/comunali/SEZ_3_79160_L9.xml |
| maggioli_2025_preferences_section_l10_xml | xml | restored_from_official_url_binary | LF-normalized checkout; registered checksum matches CRLF original-download bytes | `5ba818a56bec5bac582c7669dd983c98f26143a7d97d215219864a9fb45c0949` | `73ccbf9471dbfc28ea3d407333557515c9d6aada42794687c6453bff74010fad` | `73ccbf9471dbfc28ea3d407333557515c9d6aada42794687c6453bff74010fad` | 384919 -> 384922 | https://elezionilameziaterme.maggiolicloud.it/web250506/comunali/SEZ_3_79160_L10.xml |
| maggioli_2025_preferences_section_l11_xml | xml | restored_from_official_url_binary | LF-normalized checkout; registered checksum matches CRLF original-download bytes | `6cdfebc641e57c2dfb94ecbb892b726ba38f3b5f77816cab27e68fe0f1171344` | `60f64f3a8ea8876f52d32222f86b521fb57898002c49fc858611104bc9a114c6` | `60f64f3a8ea8876f52d32222f86b521fb57898002c49fc858611104bc9a114c6` | 384449 -> 384452 | https://elezionilameziaterme.maggiolicloud.it/web250506/comunali/SEZ_3_79160_L11.xml |
| maggioli_2025_preferences_section_l12_xml | xml | restored_from_official_url_binary | LF-normalized checkout; registered checksum matches CRLF original-download bytes | `da68a9c5cd8753722d54fc5f7afd7cf643abf82cc175beaf163e8dab950c344f` | `def7276c5379d911a57e665434f6d70b1e58e328d42505a28ffc50eb5ad072dd` | `def7276c5379d911a57e665434f6d70b1e58e328d42505a28ffc50eb5ad072dd` | 384755 -> 384758 | https://elezionilameziaterme.maggiolicloud.it/web250506/comunali/SEZ_3_79160_L12.xml |
| maggioli_2025_preferences_section_l13_xml | xml | restored_from_official_url_binary | LF-normalized checkout; registered checksum matches CRLF original-download bytes | `f2b189476603f9ec7e4f777b555a698ed6a4bf39c6a9a74c3d8520d60d62f5f1` | `eb7061a73f8212157b397b08b3818220d8558230e179f50539c1eb32ad18881c` | `eb7061a73f8212157b397b08b3818220d8558230e179f50539c1eb32ad18881c` | 385020 -> 385023 | https://elezionilameziaterme.maggiolicloud.it/web250506/comunali/SEZ_3_79160_L13.xml |
| maggioli_2025_preferences_section_l14_xml | xml | restored_from_official_url_binary | LF-normalized checkout; registered checksum matches CRLF original-download bytes | `6e54110322ba0b6d116c5bbbb059a3b5cb3d2210206449f6ad489b27a1efe233` | `ba4b7f139737bf0070629a10a334da8b554eee1d54db84cdc2289e1d48c31a2e` | `ba4b7f139737bf0070629a10a334da8b554eee1d54db84cdc2289e1d48c31a2e` | 385054 -> 385057 | https://elezionilameziaterme.maggiolicloud.it/web250506/comunali/SEZ_3_79160_L14.xml |
| maggioli_2025_sections_lists_xml | xml | restored_from_official_url_binary | LF-normalized checkout; registered checksum matches CRLF original-download bytes | `1cc5eebf1ab2ae71e4219b6d1714e9a8263ebf2fe8e536fa19d9bfa5313f7658` | `8e92830f0e840862e3964c9ef561bedc993f1b4c961346ffccd370c8c5429884` | `8e92830f0e840862e3964c9ef561bedc993f1b4c961346ffccd370c8c5429884` | 252774 -> 252777 | https://elezionilameziaterme.maggiolicloud.it/web250506/comunali/SEZ_2_79160.xml |
| maggioli_2025_sections_mayor_xml | xml | restored_from_official_url_binary | LF-normalized checkout; registered checksum matches CRLF original-download bytes | `7ae7b4a95099b2a74af5dbb526bd633c459385d4185fa4c3e9aebc2680d0d8f8` | `8224db8b8a2b6e67de88bfe2c4f0c955ed54b8f9a8b4eab3ae09c74ed7111923` | `8224db8b8a2b6e67de88bfe2c4f0c955ed54b8f9a8b4eab3ae09c74ed7111923` | 158720 -> 158723 | https://elezionilameziaterme.maggiolicloud.it/web250506/comunali/SEZ_1_79160.xml |
| maggioli_2025_totals_lists_xml | xml | restored_from_official_url_binary | LF-normalized checkout; registered checksum matches CRLF original-download bytes | `1876173f6d1236081086e997dbad8e9e6ae98bf25754059f005c032416141693` | `e9eb6583a80805216fb26eb346efaf6e1dd62bdd82db99f4b81d045e58d5792f` | `e9eb6583a80805216fb26eb346efaf6e1dd62bdd82db99f4b81d045e58d5792f` | 11986 -> 11989 | https://elezionilameziaterme.maggiolicloud.it/web250506/comunali/TOT_2_79160.xml |
| maggioli_2025_totals_mayor_xml | xml | restored_from_official_url_binary | LF-normalized checkout; registered checksum matches CRLF original-download bytes | `17062c7cacc4a312ffae1f81ec5829227cd7ef88437638ed0155321eb022e1b8` | `61e7a91832708a3e06691a2d82b45714d96b3fdc87e0634667f6604f88471e77` | `61e7a91832708a3e06691a2d82b45714d96b3fdc87e0634667f6604f88471e77` | 8037 -> 8040 | https://elezionilameziaterme.maggiolicloud.it/web250506/comunali/TOT_1_79160.xml |
| maggioli_2025_trasparenza | html | restored_from_official_url_binary | LF-normalized checkout; registered checksum matches CRLF original-download bytes | `c67c989496d9da7baca1fde383be32d7695f91d6b0c197ae54dce5b6b82098be` | `bd1021a391aa5970bef9e21874e4f8ec7fef609f123621d1dc54955a54905501` | `bd1021a391aa5970bef9e21874e4f8ec7fef609f123621d1dc54955a54905501` | 188847 -> 193019 | https://elezionilameziaterme.maggiolicloud.it/web250506/trasparenza/comunali/ALLE_0_79160.htm |
| maggioli_2025_voticom_xsl | xsl | restored_from_official_url_binary | LF-normalized checkout; registered checksum matches CRLF original-download bytes | `3d7b25713989aae48e325cc34c63fe6fcb4e520f749d3343c78adf4d223a4eb6` | `f26065284d0a01b55ad86d413872128a2f1e62458bc81fe2e3dce5e492116fab` | `f26065284d0a01b55ad86d413872128a2f1e62458bc81fe2e3dce5e492116fab` | 51321 -> 52517 | https://elezionilameziaterme.maggiolicloud.it/web250506/comunali/voticom.xsl |

## URL reachability

- `maggioli_2025_preferences_section_l01_xml`: HTTP 200; content type `text/xml`; download bytes 385116.
- `maggioli_2025_preferences_section_l02_xml`: HTTP 200; content type `text/xml`; download bytes 383994.
- `maggioli_2025_preferences_section_l03_xml`: HTTP 200; content type `text/xml`; download bytes 384433.
- `maggioli_2025_preferences_section_l04_xml`: HTTP 200; content type `text/xml`; download bytes 384627.
- `maggioli_2025_preferences_section_l05_xml`: HTTP 200; content type `text/xml`; download bytes 383605.
- `maggioli_2025_preferences_section_l06_xml`: HTTP 200; content type `text/xml`; download bytes 385006.
- `maggioli_2025_preferences_section_l07_xml`: HTTP 200; content type `text/xml`; download bytes 342018.
- `maggioli_2025_preferences_section_l08_xml`: HTTP 200; content type `text/xml`; download bytes 341773.
- `maggioli_2025_preferences_section_l09_xml`: HTTP 200; content type `text/xml`; download bytes 384731.
- `maggioli_2025_preferences_section_l10_xml`: HTTP 200; content type `text/xml`; download bytes 384922.
- `maggioli_2025_preferences_section_l11_xml`: HTTP 200; content type `text/xml`; download bytes 384452.
- `maggioli_2025_preferences_section_l12_xml`: HTTP 200; content type `text/xml`; download bytes 384758.
- `maggioli_2025_preferences_section_l13_xml`: HTTP 200; content type `text/xml`; download bytes 385023.
- `maggioli_2025_preferences_section_l14_xml`: HTTP 200; content type `text/xml`; download bytes 385057.
- `maggioli_2025_sections_lists_xml`: HTTP 200; content type `text/xml`; download bytes 252777.
- `maggioli_2025_sections_mayor_xml`: HTTP 200; content type `text/xml`; download bytes 158723.
- `maggioli_2025_totals_lists_xml`: HTTP 200; content type `text/xml`; download bytes 11989.
- `maggioli_2025_totals_mayor_xml`: HTTP 200; content type `text/xml`; download bytes 8040.
- `maggioli_2025_trasparenza`: HTTP 200; content type `text/html; charset=UTF-8`; download bytes 193019.
- `maggioli_2025_voticom_xsl`: HTTP 200; content type `application/xslt+xml`; download bytes 52517.

## Final checksum status

All local raw files with registered checksums now match `source_documents.csv`.

## Impact on processed data

No processed CSV values were changed. The repair only restores raw Maggioli bytes and adds this QA report. `scripts/validate_totals.py` passes after the repair and continues to validate the 2025 processed dataset.

## QA executed

- Full checksum check: 28 registered local files checked; 0 mismatches on worktree bytes.
- Staged blob checksum check: 28 registered local files checked; 0 mismatches on bytes prepared for commit.
- `scripts/validate_totals.py`: passed and regenerated `data/interim/qa/validation_report.md`.
- Processed CSV readability/header check: 10 CSV files checked; 0 errors.
- `sources/sources.yml` vs `data/processed/source_documents.csv`: 31 expanded source IDs vs 31 CSV rows; 0 consistency errors.
- `.gitattributes` check: `data/raw/comune_lamezia/**` and `data/raw/eligendo/**` resolve as `text: unset`, `diff: unset`.
- Raw file size review: largest raw remains an existing PDF; repaired XML files remain about 342-385 KB, HTML about 193 KB, XSL about 53 KB.
- `git diff --check` and `git diff --cached --check`: passed.
- No frontend, UI, deploy, map, geometry, processed-value, token, cache, or temporary-file changes were introduced.

## Residual limits

- The repair depends on the official Maggioli URLs remaining reachable at the time of this run.
- Future raw downloads should be stored with binary writes before any text decoding or newline handling.
