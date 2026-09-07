# Dizionario fisico PostgreSQL

Rilevazione: 2026-09-07T17:47:58.557Z. Database: `neondb`; PostgreSQL 18.6 (c5250a2).

Estratto dal catalogo PostgreSQL effettivo. Le tabelle sono fisicamente nello schema `public`; i namespace tematici del contratto architetturale sono ancora target logici. Questo documento non è una migrazione. Gli oggetti elencati non attestano la completezza dei flussi.

## Indice delle tabelle

| Tabella | Righe esatte | Colonne | FK | Indici |
|---|---:|---:|---:|---:|
| [accesso_civico_requests](#accesso_civico_requests) | 0 | 21 | 2 | 7 |
| [acts](#acts) | 0 | 8 | 1 | 2 |
| [attuazione_pnrr_projects](#attuazione_pnrr_projects) | 0 | 19 | 0 | 6 |
| [bandi](#bandi) | 0 | 18 | 0 | 6 |
| [bando_matches](#bando_matches) | 0 | 11 | 4 | 5 |
| [canonical_subjects](#canonical_subjects) | 0 | 4 | 0 | 2 |
| [categories](#categories) | 0 | 4 | 0 | 2 |
| [change_sentinel_events](#change_sentinel_events) | 0 | 14 | 0 | 3 |
| [confiscated_assets](#confiscated_assets) | 0 | 23 | 0 | 6 |
| [contracts](#contracts) | 0 | 30 | 1 | 8 |
| [conversations](#conversations) | 0 | 3 | 0 | 1 |
| [crime_event_cluster_members](#crime_event_cluster_members) | 0 | 3 | 2 | 2 |
| [crime_event_cluster_sources](#crime_event_cluster_sources) | 0 | 3 | 2 | 2 |
| [crime_event_clusters](#crime_event_clusters) | 0 | 7 | 0 | 2 |
| [crime_event_locations](#crime_event_locations) | 26 | 20 | 2 | 3 |
| [crime_event_offences](#crime_event_offences) | 29 | 15 | 2 | 4 |
| [crime_event_sources](#crime_event_sources) | 257 | 4 | 2 | 2 |
| [crime_events](#crime_events) | 19 | 13 | 0 | 3 |
| [crime_public_events](#crime_public_events) | 0 | 7 | 1 | 2 |
| [crime_sources](#crime_sources) | 62 | 11 | 0 | 3 |
| [demographic_observations](#demographic_observations) | 0 | 14 | 2 | 4 |
| [demographic_releases](#demographic_releases) | 0 | 12 | 1 | 3 |
| [demographic_series](#demographic_series) | 0 | 13 | 0 | 3 |
| [feed_status](#feed_status) | 0 | 10 | 0 | 2 |
| [fundamental_acts](#fundamental_acts) | 0 | 14 | 2 | 3 |
| [helper_overrides](#helper_overrides) | 0 | 5 | 0 | 2 |
| [italiadomani_projects](#italiadomani_projects) | 0 | 16 | 0 | 5 |
| [legacy_subject_map](#legacy_subject_map) | 0 | 9 | 1 | 4 |
| [legality_areas](#legality_areas) | 0 | 8 | 0 | 2 |
| [legality_overview](#legality_overview) | 0 | 3 | 0 | 1 |
| [legality_requirements](#legality_requirements) | 0 | 10 | 1 | 2 |
| [messages](#messages) | 0 | 5 | 1 | 1 |
| [monitoring_reports](#monitoring_reports) | 0 | 19 | 2 | 5 |
| [official_activities](#official_activities) | 0 | 6 | 1 | 2 |
| [official_declarations](#official_declarations) | 0 | 7 | 1 | 2 |
| [official_remunerations](#official_remunerations) | 0 | 7 | 1 | 2 |
| [official_votes](#official_votes) | 0 | 6 | 3 | 4 |
| [officials](#officials) | 0 | 11 | 0 | 4 |
| [opendata_datasets](#opendata_datasets) | 0 | 17 | 0 | 2 |
| [opendata_resources](#opendata_resources) | 0 | 11 | 1 | 2 |
| [opendata_snapshots](#opendata_snapshots) | 0 | 11 | 1 | 3 |
| [organi](#organi) | 0 | 8 | 0 | 2 |
| [organi_members](#organi_members) | 0 | 11 | 2 | 4 |
| [oversight_opinion_documents](#oversight_opinion_documents) | 0 | 6 | 1 | 1 |
| [oversight_opinions](#oversight_opinions) | 0 | 12 | 0 | 1 |
| [page_blocks](#page_blocks) | 0 | 10 | 0 | 3 |
| [performance_categories](#performance_categories) | 0 | 5 | 0 | 2 |
| [performance_indicator_values](#performance_indicator_values) | 0 | 9 | 1 | 3 |
| [performance_indicators](#performance_indicators) | 0 | 14 | 1 | 3 |
| [publications](#publications) | 0 | 29 | 0 | 7 |
| [questions](#questions) | 0 | 11 | 0 | 1 |
| [reports](#reports) | 0 | 24 | 0 | 8 |
| [sedute](#sedute) | 0 | 8 | 2 | 4 |
| [session_interventions](#session_interventions) | 0 | 6 | 1 | 2 |
| [session_reports](#session_reports) | 0 | 6 | 2 | 3 |
| [shares](#shares) | 0 | 5 | 1 | 3 |
| [site_strings](#site_strings) | 0 | 8 | 0 | 3 |
| [theme_documents](#theme_documents) | 0 | 6 | 1 | 2 |
| [theme_emails](#theme_emails) | 0 | 8 | 1 | 2 |
| [theme_followers](#theme_followers) | 0 | 5 | 1 | 4 |
| [theme_metrics](#theme_metrics) | 0 | 5 | 1 | 2 |
| [theme_posts](#theme_posts) | 0 | 7 | 1 | 2 |
| [theme_relevance_events](#theme_relevance_events) | 0 | 4 | 1 | 3 |
| [themes](#themes) | 0 | 11 | 1 | 4 |

## accesso_civico_requests

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('accesso_civico_requests_id_seq'::regclass) |
| oggetto | text | no | — | — |
| tipo | text | no | — | 'generalizzato'::text |
| ente | text | no | — | 'Comune di Lamezia Terme'::text |
| descrizione | text | no | — | ''::text |
| request_text | text | no | — | ''::text |
| requester_name | text | sì | — | — |
| request_date | timestamp with time zone | sì | — | — |
| stato | text | no | — | 'in-attesa'::text |
| esito_note | text | no | — | ''::text |
| response_date | timestamp with time zone | sì | — | — |
| response_url | text | sì | — | — |
| response_label | text | sì | — | — |
| theme_id | integer | sì | — | — |
| pnrr_project_id | integer | sì | — | — |
| status | text | no | — | 'pending'::text |
| created_at | timestamp with time zone | no | — | now() |
| updated_at | timestamp with time zone | no | — | now() |
| origine | text | no | — | 'cittadino'::text |
| deduplica_key | text | sì | — | — |
| fonte_url | text | sì | — | — |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `accesso_civico_origine_check`: `CHECK ((origine = ANY (ARRAY['cittadino'::text, 'registro-ufficiale'::text])))`; validato.
- `accesso_civico_requests_pkey`: `PRIMARY KEY (id)`; validato.
- `accesso_civico_requests_pnrr_project_id_attuazione_pnrr_project`: `FOREIGN KEY (pnrr_project_id) REFERENCES attuazione_pnrr_projects(id) ON DELETE SET NULL`; validato.
- `accesso_civico_requests_theme_id_themes_id_fk`: `FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE SET NULL`; validato.
- `accesso_civico_stato_check`: `CHECK ((stato = ANY (ARRAY['in-attesa'::text, 'accolta'::text, 'rifiutata'::text])))`; validato.
- `accesso_civico_status_check`: `CHECK ((status = ANY (ARRAY['pending'::text, 'published'::text])))`; validato.
- `accesso_civico_tipo_check`: `CHECK ((tipo = ANY (ARRAY['generalizzato'::text, 'semplice'::text, 'documentale'::text])))`; validato.

Indici:

- `accesso_civico_deduplica_key_idx`: `CREATE UNIQUE INDEX accesso_civico_deduplica_key_idx ON public.accesso_civico_requests USING btree (deduplica_key) WHERE (deduplica_key IS NOT NULL)`; valido.
- `accesso_civico_origine_idx`: `CREATE INDEX accesso_civico_origine_idx ON public.accesso_civico_requests USING btree (origine)`; valido.
- `accesso_civico_requests_pkey`: `CREATE UNIQUE INDEX accesso_civico_requests_pkey ON public.accesso_civico_requests USING btree (id)`; valido.
- `accesso_civico_stato_idx`: `CREATE INDEX accesso_civico_stato_idx ON public.accesso_civico_requests USING btree (stato)`; valido.
- `accesso_civico_status_idx`: `CREATE INDEX accesso_civico_status_idx ON public.accesso_civico_requests USING btree (status)`; valido.
- `accesso_civico_theme_id_idx`: `CREATE INDEX accesso_civico_theme_id_idx ON public.accesso_civico_requests USING btree (theme_id)`; valido.
- `accesso_civico_tipo_idx`: `CREATE INDEX accesso_civico_tipo_idx ON public.accesso_civico_requests USING btree (tipo)`; valido.

## acts

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('acts_id_seq'::regclass) |
| title | text | no | — | — |
| type | text | no | — | — |
| number | text | no | — | — |
| summary | text | no | — | — |
| publish_date | timestamp with time zone | no | — | now() |
| end_date | timestamp with time zone | no | — | now() |
| theme_id | integer | sì | — | — |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `acts_pkey`: `PRIMARY KEY (id)`; validato.
- `acts_theme_id_themes_id_fk`: `FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE SET NULL`; validato.

Indici:

- `acts_pkey`: `CREATE UNIQUE INDEX acts_pkey ON public.acts USING btree (id)`; valido.
- `acts_theme_id_idx`: `CREATE INDEX acts_theme_id_idx ON public.acts USING btree (theme_id)`; valido.

## attuazione_pnrr_projects

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('attuazione_pnrr_projects_id_seq'::regclass) |
| source_id | text | no | — | — |
| url | text | no | — | — |
| title | text | no | — | — |
| mission | text | sì | — | — |
| component | text | sì | — | — |
| investment | text | sì | — | — |
| intervention | text | sì | — | — |
| holder | text | sì | — | — |
| attuatore | text | sì | — | — |
| cup | text | sì | — | — |
| importo_finanziato | numeric(14,2) | sì | — | — |
| status | text | sì | — | — |
| start_date | timestamp with time zone | sì | — | — |
| end_date | timestamp with time zone | sì | — | — |
| published_at | timestamp with time zone | sì | — | — |
| attachments | jsonb | no | — | '[]'::jsonb |
| first_seen_at | timestamp with time zone | no | — | now() |
| last_seen_at | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `attuazione_pnrr_projects_pkey`: `PRIMARY KEY (id)`; validato.
- `attuazione_pnrr_projects_source_id_unique`: `UNIQUE (source_id)`; validato.

Indici:

- `attuazione_pnrr_projects_cup_idx`: `CREATE INDEX attuazione_pnrr_projects_cup_idx ON public.attuazione_pnrr_projects USING btree (cup)`; valido.
- `attuazione_pnrr_projects_last_seen_at_idx`: `CREATE INDEX attuazione_pnrr_projects_last_seen_at_idx ON public.attuazione_pnrr_projects USING btree (last_seen_at)`; valido.
- `attuazione_pnrr_projects_pkey`: `CREATE UNIQUE INDEX attuazione_pnrr_projects_pkey ON public.attuazione_pnrr_projects USING btree (id)`; valido.
- `attuazione_pnrr_projects_published_at_idx`: `CREATE INDEX attuazione_pnrr_projects_published_at_idx ON public.attuazione_pnrr_projects USING btree (published_at)`; valido.
- `attuazione_pnrr_projects_source_id_unique`: `CREATE UNIQUE INDEX attuazione_pnrr_projects_source_id_unique ON public.attuazione_pnrr_projects USING btree (source_id)`; valido.
- `attuazione_pnrr_projects_status_idx`: `CREATE INDEX attuazione_pnrr_projects_status_idx ON public.attuazione_pnrr_projects USING btree (status)`; valido.

## bandi

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('bandi_id_seq'::regclass) |
| slug | text | no | — | — |
| title | text | no | — | — |
| ente_erogatore | text | no | — | ''::text |
| description | text | no | — | ''::text |
| eligibility | text | no | — | ''::text |
| importo_stanziato | numeric(14,2) | sì | — | — |
| importo_medio_aggiudicato | numeric(14,2) | sì | — | — |
| scadenza | timestamp with time zone | sì | — | — |
| status | text | no | — | 'aperto'::text |
| settore | text | sì | — | — |
| official_url | text | sì | — | — |
| source | text | no | — | 'manual'::text |
| keywords | text[] | no | — | '{}'::text[] |
| notes | text | no | — | ''::text |
| suggested_source_ref | text | sì | — | — |
| created_at | timestamp with time zone | no | — | now() |
| updated_at | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `bandi_pkey`: `PRIMARY KEY (id)`; validato.
- `bandi_slug_unique`: `UNIQUE (slug)`; validato.
- `bandi_source_check`: `CHECK ((source = ANY (ARRAY['manual'::text, 'suggested'::text])))`; validato.
- `bandi_status_check`: `CHECK ((status = ANY (ARRAY['aperto'::text, 'in-scadenza'::text, 'concluso'::text])))`; validato.
- `bandi_suggested_source_ref_unique`: `UNIQUE (suggested_source_ref)`; validato.

Indici:

- `bandi_pkey`: `CREATE UNIQUE INDEX bandi_pkey ON public.bandi USING btree (id)`; valido.
- `bandi_settore_idx`: `CREATE INDEX bandi_settore_idx ON public.bandi USING btree (settore)`; valido.
- `bandi_slug_unique`: `CREATE UNIQUE INDEX bandi_slug_unique ON public.bandi USING btree (slug)`; valido.
- `bandi_source_idx`: `CREATE INDEX bandi_source_idx ON public.bandi USING btree (source)`; valido.
- `bandi_status_idx`: `CREATE INDEX bandi_status_idx ON public.bandi USING btree (status)`; valido.
- `bandi_suggested_source_ref_unique`: `CREATE UNIQUE INDEX bandi_suggested_source_ref_unique ON public.bandi USING btree (suggested_source_ref)`; valido.

## bando_matches

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('bando_matches_id_seq'::regclass) |
| bando_id | integer | no | — | — |
| target_type | text | no | — | — |
| publication_id | integer | sì | — | — |
| contract_id | integer | sì | — | — |
| pnrr_project_id | integer | sì | — | — |
| match_reason | text | no | — | ''::text |
| confirmed | boolean | no | — | false |
| dismissed | boolean | no | — | false |
| created_at | timestamp with time zone | no | — | now() |
| updated_at | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `bando_matches_bando_id_bandi_id_fk`: `FOREIGN KEY (bando_id) REFERENCES bandi(id) ON DELETE CASCADE`; validato.
- `bando_matches_contract_id_contracts_id_fk`: `FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE`; validato.
- `bando_matches_pkey`: `PRIMARY KEY (id)`; validato.
- `bando_matches_pnrr_project_id_attuazione_pnrr_projects_id_fk`: `FOREIGN KEY (pnrr_project_id) REFERENCES attuazione_pnrr_projects(id) ON DELETE CASCADE`; validato.
- `bando_matches_publication_id_publications_id_fk`: `FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE CASCADE`; validato.
- `bando_matches_target_type_check`: `CHECK ((target_type = ANY (ARRAY['publication'::text, 'contract'::text, 'pnrr'::text])))`; validato.

Indici:

- `bando_matches_bando_id_idx`: `CREATE INDEX bando_matches_bando_id_idx ON public.bando_matches USING btree (bando_id)`; valido.
- `bando_matches_pkey`: `CREATE UNIQUE INDEX bando_matches_pkey ON public.bando_matches USING btree (id)`; valido.
- `bando_matches_unique_contract`: `CREATE UNIQUE INDEX bando_matches_unique_contract ON public.bando_matches USING btree (bando_id, contract_id) WHERE (contract_id IS NOT NULL)`; valido.
- `bando_matches_unique_pnrr`: `CREATE UNIQUE INDEX bando_matches_unique_pnrr ON public.bando_matches USING btree (bando_id, pnrr_project_id) WHERE (pnrr_project_id IS NOT NULL)`; valido.
- `bando_matches_unique_publication`: `CREATE UNIQUE INDEX bando_matches_unique_publication ON public.bando_matches USING btree (bando_id, publication_id) WHERE (publication_id IS NOT NULL)`; valido.

## canonical_subjects

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| subject_id | uuid | no | sì | — |
| subject_kind | text | no | — | — |
| domain_type | text | no | — | — |
| created_at | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `canonical_subjects_domain_type_check`: `CHECK ((domain_type ~ '^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$'::text))`; validato.
- `canonical_subjects_pkey`: `PRIMARY KEY (subject_id)`; validato.
- `canonical_subjects_subject_id_uuidv7_check`: `CHECK (((subject_id)::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'::text))`; validato.
- `canonical_subjects_subject_kind_check`: `CHECK ((subject_kind = ANY (ARRAY['entity'::text, 'event'::text])))`; validato.

Indici:

- `canonical_subjects_kind_domain_idx`: `CREATE INDEX canonical_subjects_kind_domain_idx ON public.canonical_subjects USING btree (subject_kind, domain_type)`; valido.
- `canonical_subjects_pkey`: `CREATE UNIQUE INDEX canonical_subjects_pkey ON public.canonical_subjects USING btree (subject_id)`; valido.

## categories

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('categories_id_seq'::regclass) |
| name | text | no | — | — |
| slug | text | no | — | — |
| description | text | no | — | — |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `categories_pkey`: `PRIMARY KEY (id)`; validato.
- `categories_slug_unique`: `UNIQUE (slug)`; validato.

Indici:

- `categories_pkey`: `CREATE UNIQUE INDEX categories_pkey ON public.categories USING btree (id)`; valido.
- `categories_slug_unique`: `CREATE UNIQUE INDEX categories_slug_unique ON public.categories USING btree (slug)`; valido.

## change_sentinel_events

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| event_id | text | no | sì | — |
| provider | text | no | — | — |
| watch_key | text | no | — | — |
| canonical_source_id | text | no | — | — |
| observed_at | timestamp with time zone | no | — | — |
| received_at | timestamp with time zone | no | — | now() |
| state | text | no | — | 'received'::text |
| attempt_count | integer | no | — | 0 |
| claimed_at | timestamp with time zone | sì | — | — |
| processed_at | timestamp with time zone | sì | — | — |
| last_error_code | text | sì | — | — |
| canonical_before_hash | text | sì | — | — |
| canonical_after_hash | text | sì | — | — |
| material_change | boolean | sì | — | — |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `change_sentinel_events_pkey`: `PRIMARY KEY (event_id)`; validato.

Indici:

- `change_sentinel_events_pkey`: `CREATE UNIQUE INDEX change_sentinel_events_pkey ON public.change_sentinel_events USING btree (event_id)`; valido.
- `change_sentinel_events_queue_idx`: `CREATE INDEX change_sentinel_events_queue_idx ON public.change_sentinel_events USING btree (state, received_at)`; valido.
- `change_sentinel_events_source_observed_idx`: `CREATE INDEX change_sentinel_events_source_observed_idx ON public.change_sentinel_events USING btree (canonical_source_id, observed_at)`; valido.

## confiscated_assets

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('confiscated_assets_id_seq'::regclass) |
| slug | text | no | — | — |
| denominazione | text | no | — | — |
| description | text | no | — | ''::text |
| tipologia | text | no | — | ''::text |
| status | text | no | — | 'confiscato'::text |
| indirizzo | text | no | — | ''::text |
| assegnatario | text | no | — | ''::text |
| destinazione_uso | text | no | — | ''::text |
| dati_catastali | text | no | — | ''::text |
| official_url | text | sì | — | — |
| source | text | no | — | 'manual'::text |
| source_id | text | sì | — | — |
| latitude | numeric(10,7) | sì | — | — |
| longitude | numeric(10,7) | sì | — | — |
| geo_address | text | sì | — | — |
| geo_quartiere | text | sì | — | — |
| geo_source | text | sì | — | — |
| geo_manual | boolean | no | — | false |
| geo_verify | boolean | no | — | false |
| notes | text | no | — | ''::text |
| created_at | timestamp with time zone | no | — | now() |
| updated_at | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `confiscated_assets_pkey`: `PRIMARY KEY (id)`; validato.
- `confiscated_assets_slug_unique`: `UNIQUE (slug)`; validato.
- `confiscated_assets_source_check`: `CHECK ((source = ANY (ARRAY['manual'::text, 'auto'::text])))`; validato.
- `confiscated_assets_source_id_unique`: `UNIQUE (source_id)`; validato.
- `confiscated_assets_status_check`: `CHECK ((status = ANY (ARRAY['sequestrato'::text, 'confiscato'::text, 'assegnato'::text, 'riutilizzato'::text])))`; validato.

Indici:

- `confiscated_assets_pkey`: `CREATE UNIQUE INDEX confiscated_assets_pkey ON public.confiscated_assets USING btree (id)`; valido.
- `confiscated_assets_slug_unique`: `CREATE UNIQUE INDEX confiscated_assets_slug_unique ON public.confiscated_assets USING btree (slug)`; valido.
- `confiscated_assets_source_id_unique`: `CREATE UNIQUE INDEX confiscated_assets_source_id_unique ON public.confiscated_assets USING btree (source_id)`; valido.
- `confiscated_assets_source_idx`: `CREATE INDEX confiscated_assets_source_idx ON public.confiscated_assets USING btree (source)`; valido.
- `confiscated_assets_status_idx`: `CREATE INDEX confiscated_assets_status_idx ON public.confiscated_assets USING btree (status)`; valido.
- `confiscated_assets_tipologia_idx`: `CREATE INDEX confiscated_assets_tipologia_idx ON public.confiscated_assets USING btree (tipologia)`; valido.

## contracts

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('contracts_id_seq'::regclass) |
| source_id | text | sì | — | — |
| title | text | no | — | — |
| description | text | no | — | — |
| supplier | text | no | — | — |
| amount | numeric(14,2) | no | — | — |
| procedure_type | text | no | — | — |
| status | text | no | — | — |
| cig | text | sì | — | — |
| cup | text | sì | — | — |
| stazione_appaltante | text | sì | — | — |
| acquisition_tool | text | sì | — | — |
| without_tender | boolean | no | — | false |
| without_mepa | boolean | no | — | false |
| anac_url | text | sì | — | — |
| macrotema | text | sì | — | — |
| macrotema_manual | boolean | no | — | false |
| latitude | numeric(10,7) | sì | — | — |
| longitude | numeric(10,7) | sì | — | — |
| geo_address | text | sì | — | — |
| geo_quartiere | text | sì | — | — |
| geo_source | text | sì | — | — |
| geo_manual | boolean | no | — | false |
| geo_verify | boolean | no | — | false |
| award_date | timestamp with time zone | no | — | now() |
| start_date | timestamp with time zone | sì | — | — |
| end_date | timestamp with time zone | sì | — | — |
| theme_id | integer | sì | — | — |
| first_seen_at | timestamp with time zone | no | — | now() |
| last_seen_at | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `contracts_pkey`: `PRIMARY KEY (id)`; validato.
- `contracts_source_id_unique`: `UNIQUE (source_id)`; validato.
- `contracts_theme_id_themes_id_fk`: `FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE SET NULL`; validato.

Indici:

- `contracts_award_date_idx`: `CREATE INDEX contracts_award_date_idx ON public.contracts USING btree (award_date)`; valido.
- `contracts_cig_idx`: `CREATE INDEX contracts_cig_idx ON public.contracts USING btree (cig)`; valido.
- `contracts_cup_idx`: `CREATE INDEX contracts_cup_idx ON public.contracts USING btree (cup)`; valido.
- `contracts_macrotema_idx`: `CREATE INDEX contracts_macrotema_idx ON public.contracts USING btree (macrotema)`; valido.
- `contracts_pkey`: `CREATE UNIQUE INDEX contracts_pkey ON public.contracts USING btree (id)`; valido.
- `contracts_source_id_unique`: `CREATE UNIQUE INDEX contracts_source_id_unique ON public.contracts USING btree (source_id)`; valido.
- `contracts_status_idx`: `CREATE INDEX contracts_status_idx ON public.contracts USING btree (status)`; valido.
- `contracts_theme_id_idx`: `CREATE INDEX contracts_theme_id_idx ON public.contracts USING btree (theme_id)`; valido.

## conversations

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('conversations_id_seq'::regclass) |
| title | text | no | — | — |
| created_at | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `conversations_pkey`: `PRIMARY KEY (id)`; validato.

Indici:

- `conversations_pkey`: `CREATE UNIQUE INDEX conversations_pkey ON public.conversations USING btree (id)`; valido.

## crime_event_cluster_members

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| cluster_id | uuid | no | sì | — |
| event_id | uuid | no | sì | — |
| created_at | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `crime_event_cluster_members_cluster_id_crime_event_clusters_clu`: `FOREIGN KEY (cluster_id) REFERENCES crime_event_clusters(cluster_id) ON DELETE CASCADE`; validato.
- `crime_event_cluster_members_cluster_id_event_id_pk`: `PRIMARY KEY (cluster_id, event_id)`; validato.
- `crime_event_cluster_members_event_id_crime_events_event_id_fk`: `FOREIGN KEY (event_id) REFERENCES crime_events(event_id) ON DELETE RESTRICT`; validato.

Indici:

- `crime_event_cluster_members_cluster_id_event_id_pk`: `CREATE UNIQUE INDEX crime_event_cluster_members_cluster_id_event_id_pk ON public.crime_event_cluster_members USING btree (cluster_id, event_id)`; valido.
- `crime_event_cluster_members_event_idx`: `CREATE INDEX crime_event_cluster_members_event_idx ON public.crime_event_cluster_members USING btree (event_id)`; valido.

## crime_event_cluster_sources

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| cluster_id | uuid | no | sì | — |
| source_id | uuid | no | sì | — |
| created_at | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `crime_event_cluster_sources_cluster_id_crime_event_clusters_clu`: `FOREIGN KEY (cluster_id) REFERENCES crime_event_clusters(cluster_id) ON DELETE CASCADE`; validato.
- `crime_event_cluster_sources_cluster_id_source_id_pk`: `PRIMARY KEY (cluster_id, source_id)`; validato.
- `crime_event_cluster_sources_source_id_crime_sources_source_id_f`: `FOREIGN KEY (source_id) REFERENCES crime_sources(source_id) ON DELETE RESTRICT`; validato.

Indici:

- `crime_event_cluster_sources_cluster_id_source_id_pk`: `CREATE UNIQUE INDEX crime_event_cluster_sources_cluster_id_source_id_pk ON public.crime_event_cluster_sources USING btree (cluster_id, source_id)`; valido.
- `crime_event_cluster_sources_source_idx`: `CREATE INDEX crime_event_cluster_sources_source_idx ON public.crime_event_cluster_sources USING btree (source_id)`; valido.

## crime_event_clusters

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| cluster_id | uuid | no | sì | — |
| schema_version | text | no | — | — |
| reported_event_count | integer | sì | — | — |
| count_precision | text | no | — | — |
| resolution_status | text | no | — | — |
| created_at | timestamp with time zone | no | — | now() |
| updated_at | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `crime_event_clusters_count_precision_check`: `CHECK ((count_precision = ANY (ARRAY['exact'::text, 'minimum'::text, 'approximate'::text, 'unknown'::text])))`; validato.
- `crime_event_clusters_exact_count_check`: `CHECK (((count_precision <> 'exact'::text) OR (reported_event_count IS NOT NULL)))`; validato.
- `crime_event_clusters_id_uuidv7_check`: `CHECK (((cluster_id)::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'::text))`; validato.
- `crime_event_clusters_pkey`: `PRIMARY KEY (cluster_id)`; validato.
- `crime_event_clusters_reported_count_check`: `CHECK (((reported_event_count IS NULL) OR (reported_event_count >= 1)))`; validato.
- `crime_event_clusters_resolution_status_check`: `CHECK ((resolution_status = ANY (ARRAY['unresolved'::text, 'partially_resolved'::text, 'resolved'::text])))`; validato.

Indici:

- `crime_event_clusters_pkey`: `CREATE UNIQUE INDEX crime_event_clusters_pkey ON public.crime_event_clusters USING btree (cluster_id)`; valido.
- `crime_event_clusters_resolution_idx`: `CREATE INDEX crime_event_clusters_resolution_idx ON public.crime_event_clusters USING btree (resolution_status)`; valido.

## crime_event_locations

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| location_id | uuid | no | sì | — |
| event_id | uuid | no | — | — |
| basis_source_id | uuid | sì | — | — |
| role | text | no | — | — |
| municipality | text | no | — | — |
| evidence_basis | text | no | — | — |
| evidence_precision | text | no | — | — |
| resolved_precision | text | no | — | — |
| sensitivity | text | no | — | — |
| publication_risk | text | no | — | — |
| longitude | numeric(10,7) | sì | — | — |
| latitude | numeric(10,7) | sì | — | — |
| place_name | text | sì | — | — |
| neighbourhood | text | sì | — | — |
| iccs_location_type | text | sì | — | — |
| street_scope_key | text | sì | — | — |
| neighbourhood_scope_key | text | sì | — | — |
| locality_scope_key | text | sì | — | — |
| created_at | timestamp with time zone | no | — | now() |
| updated_at | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `crime_event_locations_basis_source_id_crime_sources_source_id_f`: `FOREIGN KEY (basis_source_id) REFERENCES crime_sources(source_id) ON DELETE RESTRICT`; validato.
- `crime_event_locations_coarse_point_check`: `CHECK (((resolved_precision <> ALL (ARRAY['municipality'::text, 'unknown'::text])) OR ((longitude IS NULL) AND (latitude IS NULL))))`; validato.
- `crime_event_locations_coordinate_pair_check`: `CHECK ((((longitude IS NULL) AND (latitude IS NULL)) OR ((longitude IS NOT NULL) AND (latitude IS NOT NULL))))`; validato.
- `crime_event_locations_event_id_crime_events_event_id_fk`: `FOREIGN KEY (event_id) REFERENCES crime_events(event_id) ON DELETE CASCADE`; validato.
- `crime_event_locations_evidence_basis_check`: `CHECK ((evidence_basis = ANY (ARRAY['source_stated_exact'::text, 'source_stated_named_site'::text, 'source_stated_street'::text, 'source_stated_neighbourhood'::text, 'source_stated_locality'::text, 'geocoder_candidate'::text, 'editorial_inference'::text, 'unknown'::text])))`; validato.
- `crime_event_locations_evidence_precision_check`: `CHECK ((evidence_precision = ANY (ARRAY['exact_public_site'::text, 'exact_address'::text, 'street_segment'::text, 'neighbourhood'::text, 'locality'::text, 'municipality'::text, 'unknown'::text])))`; validato.
- `crime_event_locations_latitude_check`: `CHECK (((latitude IS NULL) OR ((latitude >= ('-90'::integer)::numeric) AND (latitude <= (90)::numeric))))`; validato.
- `crime_event_locations_longitude_check`: `CHECK (((longitude IS NULL) OR ((longitude >= ('-180'::integer)::numeric) AND (longitude <= (180)::numeric))))`; validato.
- `crime_event_locations_pkey`: `PRIMARY KEY (location_id)`; validato.
- `crime_event_locations_publication_risk_check`: `CHECK ((publication_risk = ANY (ARRAY['low_public_site'::text, 'non_sensitive'::text, 'residential'::text, 'victim_linked'::text, 'minor_or_vulnerable'::text, 'sexual_offence_context'::text, 'unknown'::text])))`; validato.
- `crime_event_locations_resolved_precision_check`: `CHECK ((resolved_precision = ANY (ARRAY['exact_public_site'::text, 'exact_address'::text, 'street_segment'::text, 'neighbourhood'::text, 'locality'::text, 'municipality'::text, 'unknown'::text])))`; validato.
- `crime_event_locations_role_check`: `CHECK ((role = ANY (ARRAY['occurrence'::text, 'target'::text, 'discovery'::text, 'recovery'::text, 'arrest'::text, 'search'::text, 'procedural'::text, 'other'::text])))`; validato.
- `crime_event_locations_sensitivity_check`: `CHECK ((sensitivity = ANY (ARRAY['public_place'::text, 'non_sensitive'::text, 'private_or_sensitive'::text, 'unknown'::text])))`; validato.

Indici:

- `crime_event_locations_event_role_idx`: `CREATE INDEX crime_event_locations_event_role_idx ON public.crime_event_locations USING btree (event_id, role)`; valido.
- `crime_event_locations_pkey`: `CREATE UNIQUE INDEX crime_event_locations_pkey ON public.crime_event_locations USING btree (location_id)`; valido.
- `crime_event_locations_street_scope_idx`: `CREATE INDEX crime_event_locations_street_scope_idx ON public.crime_event_locations USING btree (street_scope_key)`; valido.

## crime_event_offences

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| offence_instance_id | uuid | no | sì | — |
| event_id | uuid | no | — | — |
| classification_source_id | uuid | sì | — | — |
| classification_basis | text | no | — | — |
| iccs_code | text | sì | — | — |
| istat_catalogue_id | text | sì | — | — |
| istat_synthetic_code | text | sì | — | — |
| istat_analytical_code | text | sì | — | — |
| legal_reference | text | sì | — | — |
| attempt_status | text | sì | — | — |
| situational_context | jsonb | no | — | '[]'::jsonb |
| cyber_related | text | sì | — | — |
| affected_object_count | integer | sì | — | — |
| created_at | timestamp with time zone | no | — | now() |
| updated_at | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `crime_event_offences_affected_object_count_check`: `CHECK (((affected_object_count IS NULL) OR (affected_object_count >= 0)))`; validato.
- `crime_event_offences_attempt_status_check`: `CHECK (((attempt_status IS NULL) OR (attempt_status = ANY (ARRAY['attempted'::text, 'completed'::text, 'not_applicable'::text, 'unknown'::text]))))`; validato.
- `crime_event_offences_classification_basis_check`: `CHECK ((classification_basis = ANY (ARRAY['source_stated_legal'::text, 'istat_crosswalk'::text, 'behavioural_manual'::text, 'provisional'::text])))`; validato.
- `crime_event_offences_classification_source_id_crime_sources_sou`: `FOREIGN KEY (classification_source_id) REFERENCES crime_sources(source_id) ON DELETE RESTRICT`; validato.
- `crime_event_offences_event_id_crime_events_event_id_fk`: `FOREIGN KEY (event_id) REFERENCES crime_events(event_id) ON DELETE CASCADE`; validato.
- `crime_event_offences_id_uuidv7_check`: `CHECK (((offence_instance_id)::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'::text))`; validato.
- `crime_event_offences_pkey`: `PRIMARY KEY (offence_instance_id)`; validato.

Indici:

- `crime_event_offences_event_idx`: `CREATE INDEX crime_event_offences_event_idx ON public.crime_event_offences USING btree (event_id)`; valido.
- `crime_event_offences_iccs_idx`: `CREATE INDEX crime_event_offences_iccs_idx ON public.crime_event_offences USING btree (iccs_code)`; valido.
- `crime_event_offences_istat_catalogue_idx`: `CREATE INDEX crime_event_offences_istat_catalogue_idx ON public.crime_event_offences USING btree (istat_catalogue_id)`; valido.
- `crime_event_offences_pkey`: `CREATE UNIQUE INDEX crime_event_offences_pkey ON public.crime_event_offences USING btree (offence_instance_id)`; valido.

## crime_event_sources

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| event_id | uuid | no | sì | — |
| source_id | uuid | no | sì | — |
| support_role | text | no | sì | 'event_support'::text |
| created_at | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `crime_event_sources_event_id_crime_events_event_id_fk`: `FOREIGN KEY (event_id) REFERENCES crime_events(event_id) ON DELETE CASCADE`; validato.
- `crime_event_sources_event_id_source_id_support_role_pk`: `PRIMARY KEY (event_id, source_id, support_role)`; validato.
- `crime_event_sources_source_id_crime_sources_source_id_fk`: `FOREIGN KEY (source_id) REFERENCES crime_sources(source_id) ON DELETE RESTRICT`; validato.
- `crime_event_sources_support_role_check`: `CHECK ((support_role = ANY (ARRAY['event_support'::text, 'classification_support'::text, 'location_support'::text, 'procedural_context'::text, 'corroboration'::text])))`; validato.

Indici:

- `crime_event_sources_event_id_source_id_support_role_pk`: `CREATE UNIQUE INDEX crime_event_sources_event_id_source_id_support_role_pk ON public.crime_event_sources USING btree (event_id, source_id, support_role)`; valido.
- `crime_event_sources_source_idx`: `CREATE INDEX crime_event_sources_source_idx ON public.crime_event_sources USING btree (source_id)`; valido.

## crime_events

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| event_id | uuid | no | sì | — |
| schema_version | text | no | — | — |
| record_status | text | no | — | — |
| event_form | text | no | — | — |
| title | text | no | — | — |
| temporal_start | text | sì | — | — |
| temporal_end | text | sì | — | — |
| temporal_edtf | text | sì | — | — |
| temporal_precision | text | no | — | — |
| temporal_start_bound | date | sì | — | — |
| temporal_end_bound | date | sì | — | — |
| created_at | timestamp with time zone | no | — | now() |
| updated_at | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `crime_events_event_form_check`: `CHECK ((event_form = ANY (ARRAY['discrete'::text, 'continuous_episode'::text, 'course_of_conduct'::text])))`; validato.
- `crime_events_event_id_uuidv7_check`: `CHECK (((event_id)::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'::text))`; validato.
- `crime_events_pkey`: `PRIMARY KEY (event_id)`; validato.
- `crime_events_record_status_check`: `CHECK ((record_status = ANY (ARRAY['verified_source'::text, 'published'::text, 'superseded'::text, 'merged'::text, 'split'::text, 'withdrawn'::text, 'suppressed'::text])))`; validato.
- `crime_events_temporal_bounds_order_check`: `CHECK (((temporal_start_bound IS NULL) OR (temporal_end_bound IS NULL) OR (temporal_end_bound >= temporal_start_bound)))`; validato.
- `crime_events_temporal_precision_check`: `CHECK ((temporal_precision = ANY (ARRAY['exact_datetime'::text, 'exact_date'::text, 'bounded_interval'::text, 'week_or_similar'::text, 'month'::text, 'year'::text, 'approximate'::text, 'unknown'::text])))`; validato.

Indici:

- `crime_events_pkey`: `CREATE UNIQUE INDEX crime_events_pkey ON public.crime_events USING btree (event_id)`; valido.
- `crime_events_record_status_idx`: `CREATE INDEX crime_events_record_status_idx ON public.crime_events USING btree (record_status)`; valido.
- `crime_events_temporal_bounds_idx`: `CREATE INDEX crime_events_temporal_bounds_idx ON public.crime_events USING btree (temporal_start_bound, temporal_end_bound)`; valido.

## crime_public_events

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| event_id | uuid | no | sì | — |
| schema_version | text | no | — | — |
| payload | jsonb | no | — | — |
| payload_sha256 | text | no | — | — |
| publication_gate_version | text | no | — | — |
| published_at | timestamp with time zone | no | — | now() |
| updated_at | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `crime_public_events_event_id_crime_events_event_id_fk`: `FOREIGN KEY (event_id) REFERENCES crime_events(event_id) ON DELETE CASCADE`; validato.
- `crime_public_events_payload_event_id_check`: `CHECK (((payload ->> 'event_id'::text) = (event_id)::text))`; validato.
- `crime_public_events_payload_object_check`: `CHECK ((jsonb_typeof(payload) = 'object'::text))`; validato.
- `crime_public_events_payload_schema_version_check`: `CHECK (((payload ->> 'schema_version'::text) = schema_version))`; validato.
- `crime_public_events_payload_sha256_check`: `CHECK ((payload_sha256 ~ '^[0-9a-f]{64}$'::text))`; validato.
- `crime_public_events_pkey`: `PRIMARY KEY (event_id)`; validato.

Indici:

- `crime_public_events_pkey`: `CREATE UNIQUE INDEX crime_public_events_pkey ON public.crime_public_events USING btree (event_id)`; valido.
- `crime_public_events_schema_version_idx`: `CREATE INDEX crime_public_events_schema_version_idx ON public.crime_public_events USING btree (schema_version)`; valido.

## crime_sources

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| source_id | uuid | no | sì | — |
| source_type | text | no | — | — |
| provider | text | no | — | — |
| title | text | no | — | ''::text |
| url | text | sì | — | — |
| published_at | timestamp with time zone | sì | — | — |
| retrieved_at | timestamp with time zone | sì | — | — |
| canonical_source_key | text | sì | — | — |
| content_sha256 | text | sì | — | — |
| created_at | timestamp with time zone | no | — | now() |
| updated_at | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `crime_sources_content_sha256_check`: `CHECK (((content_sha256 IS NULL) OR (content_sha256 ~ '^[0-9a-f]{64}$'::text)))`; validato.
- `crime_sources_pkey`: `PRIMARY KEY (source_id)`; validato.
- `crime_sources_source_id_uuidv7_check`: `CHECK (((source_id)::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'::text))`; validato.
- `crime_sources_source_type_check`: `CHECK ((source_type = ANY (ARRAY['judicial_primary'::text, 'law_enforcement_primary'::text, 'public_authority_primary'::text, 'news_agency'::text, 'press_secondary'::text, 'academic'::text, 'other'::text])))`; validato.

Indici:

- `crime_sources_canonical_source_key_idx`: `CREATE INDEX crime_sources_canonical_source_key_idx ON public.crime_sources USING btree (canonical_source_key)`; valido.
- `crime_sources_pkey`: `CREATE UNIQUE INDEX crime_sources_pkey ON public.crime_sources USING btree (source_id)`; valido.
- `crime_sources_source_type_idx`: `CREATE INDEX crime_sources_source_type_idx ON public.crime_sources USING btree (source_type)`; valido.

## demographic_observations

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('demographic_observations_id_seq'::regclass) |
| series_id | integer | no | — | — |
| release_id | integer | no | — | — |
| geography_code | text | no | — | — |
| reference_period | text | no | — | — |
| reference_type | text | no | — | — |
| dimensions | jsonb | no | — | '{}'::jsonb |
| dimension_key | text | no | — | '{}'::text |
| value | numeric(18,4) | no | — | — |
| unit | text | no | — | — |
| source_status | text | no | — | 'unknown'::text |
| source_observation_status | text | sì | — | — |
| quality_flags | jsonb | no | — | '[]'::jsonb |
| created_at | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `demographic_observations_pkey`: `PRIMARY KEY (id)`; validato.
- `demographic_observations_reference_type_check`: `CHECK ((reference_type = ANY (ARRAY['stock'::text, 'flow'::text])))`; validato.
- `demographic_observations_release_id_demographic_releases_id_fk`: `FOREIGN KEY (release_id) REFERENCES demographic_releases(id) ON DELETE CASCADE`; validato.
- `demographic_observations_series_id_demographic_series_id_fk`: `FOREIGN KEY (series_id) REFERENCES demographic_series(id) ON DELETE CASCADE`; validato.
- `demographic_observations_source_status_check`: `CHECK ((source_status = ANY (ARRAY['final'::text, 'provisional'::text, 'estimated'::text, 'reconstructed'::text, 'forecast'::text, 'unknown'::text])))`; validato.

Indici:

- `demographic_observations_pkey`: `CREATE UNIQUE INDEX demographic_observations_pkey ON public.demographic_observations USING btree (id)`; valido.
- `demographic_observations_release_identity_idx`: `CREATE UNIQUE INDEX demographic_observations_release_identity_idx ON public.demographic_observations USING btree (release_id, geography_code, reference_period, dimension_key)`; valido.
- `demographic_observations_release_idx`: `CREATE INDEX demographic_observations_release_idx ON public.demographic_observations USING btree (release_id)`; valido.
- `demographic_observations_series_period_idx`: `CREATE INDEX demographic_observations_series_period_idx ON public.demographic_observations USING btree (series_id, geography_code, reference_period)`; valido.

## demographic_releases

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('demographic_releases_id_seq'::regclass) |
| series_id | integer | no | — | — |
| source_dataset | text | no | — | — |
| source_url | text | no | — | — |
| source_hash | text | no | — | — |
| source_version | text | sì | — | — |
| release_date | timestamp with time zone | sì | — | — |
| acquired_at | timestamp with time zone | no | — | now() |
| http_etag | text | sì | — | — |
| http_last_modified | text | sì | — | — |
| raw_payload | text | sì | — | — |
| metadata | jsonb | no | — | '{}'::jsonb |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `demographic_releases_pkey`: `PRIMARY KEY (id)`; validato.
- `demographic_releases_series_id_demographic_series_id_fk`: `FOREIGN KEY (series_id) REFERENCES demographic_series(id) ON DELETE CASCADE`; validato.

Indici:

- `demographic_releases_pkey`: `CREATE UNIQUE INDEX demographic_releases_pkey ON public.demographic_releases USING btree (id)`; valido.
- `demographic_releases_series_acquired_idx`: `CREATE INDEX demographic_releases_series_acquired_idx ON public.demographic_releases USING btree (series_id, acquired_at)`; valido.
- `demographic_releases_series_hash_idx`: `CREATE UNIQUE INDEX demographic_releases_series_hash_idx ON public.demographic_releases USING btree (series_id, source_hash)`; valido.

## demographic_series

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('demographic_series_id_seq'::regclass) |
| series_key | text | no | — | — |
| title | text | no | — | — |
| description | text | no | — | ''::text |
| unit | text | no | — | — |
| geography_level | text | no | — | 'municipality'::text |
| reference_type | text | no | — | — |
| source | text | no | — | — |
| source_dataset | text | no | — | — |
| source_url | text | sì | — | — |
| external_key | text | sì | — | — |
| created_at | timestamp with time zone | no | — | now() |
| updated_at | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `demographic_series_pkey`: `PRIMARY KEY (id)`; validato.
- `demographic_series_reference_type_check`: `CHECK ((reference_type = ANY (ARRAY['stock'::text, 'flow'::text])))`; validato.
- `demographic_series_series_key_unique`: `UNIQUE (series_key)`; validato.

Indici:

- `demographic_series_external_key_idx`: `CREATE INDEX demographic_series_external_key_idx ON public.demographic_series USING btree (external_key)`; valido.
- `demographic_series_pkey`: `CREATE UNIQUE INDEX demographic_series_pkey ON public.demographic_series USING btree (id)`; valido.
- `demographic_series_series_key_unique`: `CREATE UNIQUE INDEX demographic_series_series_key_unique ON public.demographic_series USING btree (series_key)`; valido.

## feed_status

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('feed_status_id_seq'::regclass) |
| source | text | no | — | — |
| label | text | no | — | — |
| url | text | no | — | — |
| status | text | no | — | 'pending'::text |
| error | text | sì | — | — |
| items_total | integer | no | — | 0 |
| items_new | integer | no | — | 0 |
| last_checked_at | timestamp with time zone | sì | — | — |
| last_updated_at | timestamp with time zone | sì | — | — |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `feed_status_pkey`: `PRIMARY KEY (id)`; validato.
- `feed_status_source_unique`: `UNIQUE (source)`; validato.

Indici:

- `feed_status_pkey`: `CREATE UNIQUE INDEX feed_status_pkey ON public.feed_status USING btree (id)`; valido.
- `feed_status_source_unique`: `CREATE UNIQUE INDEX feed_status_source_unique ON public.feed_status USING btree (source)`; valido.

## fundamental_acts

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('fundamental_acts_id_seq'::regclass) |
| slug | text | no | — | — |
| label | text | no | — | — |
| keywords | text[] | no | — | '{}'::text[] |
| sort_order | integer | no | — | 0 |
| title | text | sì | — | — |
| description | text | sì | — | — |
| source | text | no | — | 'none'::text |
| manual_official_url | text | sì | — | — |
| manual_file | jsonb | sì | — | — |
| linked_publication_id | integer | sì | — | — |
| suggested_publication_id | integer | sì | — | — |
| created_at | timestamp with time zone | no | — | now() |
| updated_at | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `fundamental_acts_linked_publication_id_publications_id_fk`: `FOREIGN KEY (linked_publication_id) REFERENCES publications(id) ON DELETE SET NULL`; validato.
- `fundamental_acts_pkey`: `PRIMARY KEY (id)`; validato.
- `fundamental_acts_slug_unique`: `UNIQUE (slug)`; validato.
- `fundamental_acts_suggested_publication_id_publications_id_fk`: `FOREIGN KEY (suggested_publication_id) REFERENCES publications(id) ON DELETE SET NULL`; validato.

Indici:

- `fundamental_acts_pkey`: `CREATE UNIQUE INDEX fundamental_acts_pkey ON public.fundamental_acts USING btree (id)`; valido.
- `fundamental_acts_slug_unique`: `CREATE UNIQUE INDEX fundamental_acts_slug_unique ON public.fundamental_acts USING btree (slug)`; valido.
- `fundamental_acts_sort_order_idx`: `CREATE INDEX fundamental_acts_sort_order_idx ON public.fundamental_acts USING btree (sort_order)`; valido.

## helper_overrides

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('helper_overrides_id_seq'::regclass) |
| key | text | no | — | — |
| published_json | jsonb | sì | — | — |
| draft_json | jsonb | sì | — | — |
| updated_at | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `helper_overrides_key_unique`: `UNIQUE (key)`; validato.
- `helper_overrides_pkey`: `PRIMARY KEY (id)`; validato.

Indici:

- `helper_overrides_key_unique`: `CREATE UNIQUE INDEX helper_overrides_key_unique ON public.helper_overrides USING btree (key)`; valido.
- `helper_overrides_pkey`: `CREATE UNIQUE INDEX helper_overrides_pkey ON public.helper_overrides USING btree (id)`; valido.

## italiadomani_projects

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('italiadomani_projects_id_seq'::regclass) |
| cup | text | no | — | — |
| clp | text | sì | — | — |
| title | text | no | — | — |
| mission | text | sì | — | — |
| component | text | sì | — | — |
| investment | text | sì | — | — |
| holder | text | sì | — | — |
| attuatore | text | sì | — | — |
| importo_finanziato | numeric(16,2) | sì | — | — |
| status | text | sì | — | — |
| start_date | timestamp with time zone | sì | — | — |
| end_date | timestamp with time zone | sì | — | — |
| italiadomani_updated_at | timestamp with time zone | sì | — | — |
| first_seen_at | timestamp with time zone | no | — | now() |
| last_seen_at | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `italiadomani_projects_cup_unique`: `UNIQUE (cup)`; validato.
- `italiadomani_projects_pkey`: `PRIMARY KEY (id)`; validato.

Indici:

- `italiadomani_projects_cup_idx`: `CREATE INDEX italiadomani_projects_cup_idx ON public.italiadomani_projects USING btree (cup)`; valido.
- `italiadomani_projects_cup_unique`: `CREATE UNIQUE INDEX italiadomani_projects_cup_unique ON public.italiadomani_projects USING btree (cup)`; valido.
- `italiadomani_projects_last_seen_at_idx`: `CREATE INDEX italiadomani_projects_last_seen_at_idx ON public.italiadomani_projects USING btree (last_seen_at)`; valido.
- `italiadomani_projects_pkey`: `CREATE UNIQUE INDEX italiadomani_projects_pkey ON public.italiadomani_projects USING btree (id)`; valido.
- `italiadomani_projects_status_idx`: `CREATE INDEX italiadomani_projects_status_idx ON public.italiadomani_projects USING btree (status)`; valido.

## legacy_subject_map

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| mapping_id | integer | no | sì | nextval('legacy_subject_map_mapping_id_seq'::regclass) |
| legacy_namespace | text | no | — | — |
| legacy_type | text | no | — | — |
| legacy_id | text | no | — | — |
| subject_id | uuid | no | — | — |
| resolution_method | text | no | — | — |
| mapping_status | text | no | — | 'active'::text |
| valid_from | timestamp with time zone | no | — | now() |
| valid_to | timestamp with time zone | sì | — | — |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `legacy_subject_map_legacy_id_check`: `CHECK ((btrim(legacy_id) <> ''::text))`; validato.
- `legacy_subject_map_namespace_check`: `CHECK ((legacy_namespace ~ '^[a-z][a-z0-9_.-]{0,63}$'::text))`; validato.
- `legacy_subject_map_pkey`: `PRIMARY KEY (mapping_id)`; validato.
- `legacy_subject_map_resolution_method_check`: `CHECK ((resolution_method ~ '^[a-z][a-z0-9_.-]{0,63}$'::text))`; validato.
- `legacy_subject_map_status_check`: `CHECK ((mapping_status = ANY (ARRAY['active'::text, 'superseded'::text])))`; validato.
- `legacy_subject_map_status_validity_check`: `CHECK ((((mapping_status = 'active'::text) AND (valid_to IS NULL)) OR ((mapping_status = 'superseded'::text) AND (valid_to IS NOT NULL))))`; validato.
- `legacy_subject_map_subject_id_canonical_subjects_subject_id_fk`: `FOREIGN KEY (subject_id) REFERENCES canonical_subjects(subject_id) ON DELETE RESTRICT`; validato.
- `legacy_subject_map_type_check`: `CHECK ((legacy_type ~ '^[a-z][a-z0-9_.-]{0,63}$'::text))`; validato.
- `legacy_subject_map_validity_order_check`: `CHECK (((valid_to IS NULL) OR (valid_to >= valid_from)))`; validato.

Indici:

- `legacy_subject_map_active_identity_uq`: `CREATE UNIQUE INDEX legacy_subject_map_active_identity_uq ON public.legacy_subject_map USING btree (legacy_namespace, legacy_type, legacy_id) WHERE (valid_to IS NULL)`; valido.
- `legacy_subject_map_history_idx`: `CREATE INDEX legacy_subject_map_history_idx ON public.legacy_subject_map USING btree (legacy_namespace, legacy_type, legacy_id, valid_from)`; valido.
- `legacy_subject_map_pkey`: `CREATE UNIQUE INDEX legacy_subject_map_pkey ON public.legacy_subject_map USING btree (mapping_id)`; valido.
- `legacy_subject_map_subject_idx`: `CREATE INDEX legacy_subject_map_subject_idx ON public.legacy_subject_map USING btree (subject_id)`; valido.

## legality_areas

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('legality_areas_id_seq'::regclass) |
| slug | text | no | — | — |
| title | text | no | — | — |
| description | text | no | — | ''::text |
| final_judgment | text | no | — | ''::text |
| position | integer | no | — | 0 |
| created_at | timestamp with time zone | no | — | now() |
| updated_at | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `legality_areas_pkey`: `PRIMARY KEY (id)`; validato.
- `legality_areas_slug_unique`: `UNIQUE (slug)`; validato.

Indici:

- `legality_areas_pkey`: `CREATE UNIQUE INDEX legality_areas_pkey ON public.legality_areas USING btree (id)`; valido.
- `legality_areas_slug_unique`: `CREATE UNIQUE INDEX legality_areas_slug_unique ON public.legality_areas USING btree (slug)`; valido.

## legality_overview

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | 1 |
| overall_judgment | text | no | — | ''::text |
| updated_at | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `legality_overview_pkey`: `PRIMARY KEY (id)`; validato.

Indici:

- `legality_overview_pkey`: `CREATE UNIQUE INDEX legality_overview_pkey ON public.legality_overview USING btree (id)`; valido.

## legality_requirements

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('legality_requirements_id_seq'::regclass) |
| area_id | integer | no | — | — |
| title | text | no | — | — |
| description | text | no | — | ''::text |
| status | text | no | — | 'absent'::text |
| comment | text | no | — | ''::text |
| linked_acts | jsonb | no | — | '[]'::jsonb |
| position | integer | no | — | 0 |
| created_at | timestamp with time zone | no | — | now() |
| updated_at | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `legality_requirements_area_id_legality_areas_id_fk`: `FOREIGN KEY (area_id) REFERENCES legality_areas(id) ON DELETE CASCADE`; validato.
- `legality_requirements_pkey`: `PRIMARY KEY (id)`; validato.
- `legality_requirements_status_check`: `CHECK ((status = ANY (ARRAY['present'::text, 'absent'::text, 'partial'::text, 'not_applicable'::text])))`; validato.

Indici:

- `legality_requirements_area_id_idx`: `CREATE INDEX legality_requirements_area_id_idx ON public.legality_requirements USING btree (area_id)`; valido.
- `legality_requirements_pkey`: `CREATE UNIQUE INDEX legality_requirements_pkey ON public.legality_requirements USING btree (id)`; valido.

## messages

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('messages_id_seq'::regclass) |
| conversation_id | integer | no | — | — |
| role | text | no | — | — |
| content | text | no | — | — |
| created_at | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `messages_conversation_id_conversations_id_fk`: `FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE`; validato.
- `messages_pkey`: `PRIMARY KEY (id)`; validato.

Indici:

- `messages_pkey`: `CREATE UNIQUE INDEX messages_pkey ON public.messages USING btree (id)`; valido.

## monitoring_reports

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('monitoring_reports_id_seq'::regclass) |
| subject_type | text | no | — | — |
| contract_id | integer | sì | — | — |
| pnrr_project_id | integer | sì | — | — |
| subject_title | text | no | — | — |
| cig | text | sì | — | — |
| cup | text | sì | — | — |
| title | text | no | — | — |
| author_name | text | sì | — | — |
| desk_analysis | text | no | — | — |
| effectiveness_evaluation | text | no | — | — |
| impact_results | text | no | — | — |
| overall_assessment | text | no | — | — |
| attachments | jsonb | no | — | '[]'::jsonb |
| status | text | no | — | 'in_revisione'::text |
| moderation_note | text | sì | — | — |
| created_at | timestamp with time zone | no | — | now() |
| updated_at | timestamp with time zone | no | — | now() |
| published_at | timestamp with time zone | sì | — | — |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `monitoring_reports_assessment_check`: `CHECK ((overall_assessment = ANY (ARRAY['positivo'::text, 'neutro'::text, 'critico'::text])))`; validato.
- `monitoring_reports_contract_id_contracts_id_fk`: `FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE SET NULL`; validato.
- `monitoring_reports_pkey`: `PRIMARY KEY (id)`; validato.
- `monitoring_reports_pnrr_project_id_attuazione_pnrr_projects_id_`: `FOREIGN KEY (pnrr_project_id) REFERENCES attuazione_pnrr_projects(id) ON DELETE SET NULL`; validato.
- `monitoring_reports_status_check`: `CHECK ((status = ANY (ARRAY['in_revisione'::text, 'pubblicato'::text, 'rifiutato'::text])))`; validato.
- `monitoring_reports_subject_type_check`: `CHECK ((subject_type = ANY (ARRAY['contract'::text, 'pnrr'::text])))`; validato.

Indici:

- `monitoring_reports_contract_id_idx`: `CREATE INDEX monitoring_reports_contract_id_idx ON public.monitoring_reports USING btree (contract_id)`; valido.
- `monitoring_reports_created_at_idx`: `CREATE INDEX monitoring_reports_created_at_idx ON public.monitoring_reports USING btree (created_at)`; valido.
- `monitoring_reports_pkey`: `CREATE UNIQUE INDEX monitoring_reports_pkey ON public.monitoring_reports USING btree (id)`; valido.
- `monitoring_reports_pnrr_project_id_idx`: `CREATE INDEX monitoring_reports_pnrr_project_id_idx ON public.monitoring_reports USING btree (pnrr_project_id)`; valido.
- `monitoring_reports_status_idx`: `CREATE INDEX monitoring_reports_status_idx ON public.monitoring_reports USING btree (status)`; valido.

## official_activities

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('official_activities_id_seq'::regclass) |
| official_id | integer | no | — | — |
| title | text | no | — | — |
| description | text | sì | — | — |
| date | timestamp with time zone | sì | — | — |
| position | integer | no | — | 0 |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `official_activities_official_id_officials_id_fk`: `FOREIGN KEY (official_id) REFERENCES officials(id) ON DELETE CASCADE`; validato.
- `official_activities_pkey`: `PRIMARY KEY (id)`; validato.

Indici:

- `official_activities_official_id_idx`: `CREATE INDEX official_activities_official_id_idx ON public.official_activities USING btree (official_id)`; valido.
- `official_activities_pkey`: `CREATE UNIQUE INDEX official_activities_pkey ON public.official_activities USING btree (id)`; valido.

## official_declarations

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('official_declarations_id_seq'::regclass) |
| official_id | integer | no | — | — |
| title | text | no | — | — |
| date | timestamp with time zone | sì | — | — |
| content | text | sì | — | — |
| url | text | sì | — | — |
| position | integer | no | — | 0 |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `official_declarations_official_id_officials_id_fk`: `FOREIGN KEY (official_id) REFERENCES officials(id) ON DELETE CASCADE`; validato.
- `official_declarations_pkey`: `PRIMARY KEY (id)`; validato.

Indici:

- `official_declarations_official_id_idx`: `CREATE INDEX official_declarations_official_id_idx ON public.official_declarations USING btree (official_id)`; valido.
- `official_declarations_pkey`: `CREATE UNIQUE INDEX official_declarations_pkey ON public.official_declarations USING btree (id)`; valido.

## official_remunerations

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('official_remunerations_id_seq'::regclass) |
| official_id | integer | no | — | — |
| year | integer | no | — | — |
| amount | numeric(14,2) | sì | — | — |
| type | text | no | — | — |
| note | text | sì | — | — |
| position | integer | no | — | 0 |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `official_remunerations_official_id_officials_id_fk`: `FOREIGN KEY (official_id) REFERENCES officials(id) ON DELETE CASCADE`; validato.
- `official_remunerations_pkey`: `PRIMARY KEY (id)`; validato.

Indici:

- `official_remunerations_official_id_idx`: `CREATE INDEX official_remunerations_official_id_idx ON public.official_remunerations USING btree (official_id)`; valido.
- `official_remunerations_pkey`: `CREATE UNIQUE INDEX official_remunerations_pkey ON public.official_remunerations USING btree (id)`; valido.

## official_votes

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('official_votes_id_seq'::regclass) |
| official_id | integer | no | — | — |
| publication_id | integer | no | — | — |
| seduta_id | integer | sì | — | — |
| vote | text | no | — | — |
| position | integer | no | — | 0 |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `official_votes_official_id_officials_id_fk`: `FOREIGN KEY (official_id) REFERENCES officials(id) ON DELETE CASCADE`; validato.
- `official_votes_official_id_publication_id_unique`: `UNIQUE (official_id, publication_id)`; validato.
- `official_votes_pkey`: `PRIMARY KEY (id)`; validato.
- `official_votes_publication_id_publications_id_fk`: `FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE CASCADE`; validato.
- `official_votes_seduta_id_sedute_id_fk`: `FOREIGN KEY (seduta_id) REFERENCES sedute(id) ON DELETE SET NULL`; validato.

Indici:

- `official_votes_official_id_publication_id_unique`: `CREATE UNIQUE INDEX official_votes_official_id_publication_id_unique ON public.official_votes USING btree (official_id, publication_id)`; valido.
- `official_votes_pkey`: `CREATE UNIQUE INDEX official_votes_pkey ON public.official_votes USING btree (id)`; valido.
- `official_votes_publication_id_idx`: `CREATE INDEX official_votes_publication_id_idx ON public.official_votes USING btree (publication_id)`; valido.
- `official_votes_seduta_id_idx`: `CREATE INDEX official_votes_seduta_id_idx ON public.official_votes USING btree (seduta_id)`; valido.

## officials

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('officials_id_seq'::regclass) |
| name | text | no | — | — |
| slug | text | no | — | — |
| role | text | no | — | — |
| role_title | text | sì | — | — |
| group | text | sì | — | — |
| status | text | no | — | 'in_carica'::text |
| appointment_date | timestamp with time zone | sì | — | — |
| biography | text | sì | — | — |
| created_at | timestamp with time zone | no | — | now() |
| updated_at | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `officials_pkey`: `PRIMARY KEY (id)`; validato.
- `officials_slug_unique`: `UNIQUE (slug)`; validato.
- `officials_status_check`: `CHECK ((status = ANY (ARRAY['in_carica'::text, 'cessato'::text])))`; validato.

Indici:

- `officials_pkey`: `CREATE UNIQUE INDEX officials_pkey ON public.officials USING btree (id)`; valido.
- `officials_role_idx`: `CREATE INDEX officials_role_idx ON public.officials USING btree (role)`; valido.
- `officials_slug_unique`: `CREATE UNIQUE INDEX officials_slug_unique ON public.officials USING btree (slug)`; valido.
- `officials_status_idx`: `CREATE INDEX officials_status_idx ON public.officials USING btree (status)`; valido.

## opendata_datasets

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('opendata_datasets_id_seq'::regclass) |
| source_id | text | no | — | — |
| slug | text | sì | — | — |
| title | text | no | — | — |
| description | text | no | — | ''::text |
| category | text | sì | — | — |
| theme | text | sì | — | — |
| frequency | text | sì | — | — |
| license_id | text | sì | — | — |
| license_title | text | sì | — | — |
| holder_name | text | sì | — | — |
| portal_url | text | sì | — | — |
| tags | jsonb | no | — | '[]'::jsonb |
| resource_count | integer | no | — | 0 |
| metadata_modified | timestamp with time zone | sì | — | — |
| first_seen_at | timestamp with time zone | no | — | now() |
| last_seen_at | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `opendata_datasets_pkey`: `PRIMARY KEY (id)`; validato.
- `opendata_datasets_source_id_unique`: `UNIQUE (source_id)`; validato.

Indici:

- `opendata_datasets_pkey`: `CREATE UNIQUE INDEX opendata_datasets_pkey ON public.opendata_datasets USING btree (id)`; valido.
- `opendata_datasets_source_id_unique`: `CREATE UNIQUE INDEX opendata_datasets_source_id_unique ON public.opendata_datasets USING btree (source_id)`; valido.

## opendata_resources

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('opendata_resources_id_seq'::regclass) |
| source_id | text | no | — | — |
| dataset_id | integer | no | — | — |
| name | text | no | — | ''::text |
| description | text | sì | — | — |
| format | text | sì | — | — |
| url | text | no | — | — |
| position | integer | no | — | 0 |
| last_modified | timestamp with time zone | sì | — | — |
| first_seen_at | timestamp with time zone | no | — | now() |
| last_seen_at | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `opendata_resources_dataset_id_opendata_datasets_id_fk`: `FOREIGN KEY (dataset_id) REFERENCES opendata_datasets(id) ON DELETE CASCADE`; validato.
- `opendata_resources_pkey`: `PRIMARY KEY (id)`; validato.
- `opendata_resources_source_id_unique`: `UNIQUE (source_id)`; validato.

Indici:

- `opendata_resources_pkey`: `CREATE UNIQUE INDEX opendata_resources_pkey ON public.opendata_resources USING btree (id)`; valido.
- `opendata_resources_source_id_unique`: `CREATE UNIQUE INDEX opendata_resources_source_id_unique ON public.opendata_resources USING btree (source_id)`; valido.

## opendata_snapshots

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('opendata_snapshots_id_seq'::regclass) |
| resource_id | integer | no | — | — |
| captured_at | timestamp with time zone | no | — | now() |
| checksum | text | no | — | — |
| row_count | integer | no | — | 0 |
| changed | boolean | no | — | true |
| columns | jsonb | no | — | '[]'::jsonb |
| rows | jsonb | no | — | '[]'::jsonb |
| etag | text | sì | — | — |
| last_modified | text | sì | — | — |
| last_checked_at | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `opendata_snapshots_pkey`: `PRIMARY KEY (id)`; validato.
- `opendata_snapshots_resource_id_opendata_resources_id_fk`: `FOREIGN KEY (resource_id) REFERENCES opendata_resources(id) ON DELETE CASCADE`; validato.

Indici:

- `opendata_snapshots_captured_at_idx`: `CREATE INDEX opendata_snapshots_captured_at_idx ON public.opendata_snapshots USING btree (captured_at DESC NULLS LAST)`; valido.
- `opendata_snapshots_pkey`: `CREATE UNIQUE INDEX opendata_snapshots_pkey ON public.opendata_snapshots USING btree (id)`; valido.
- `opendata_snapshots_resource_id_idx`: `CREATE INDEX opendata_snapshots_resource_id_idx ON public.opendata_snapshots USING btree (resource_id)`; valido.

## organi

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('organi_id_seq'::regclass) |
| type | text | no | — | — |
| name | text | no | — | — |
| slug | text | no | — | — |
| description | text | sì | — | — |
| position | integer | no | — | 0 |
| created_at | timestamp with time zone | no | — | now() |
| updated_at | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `organi_pkey`: `PRIMARY KEY (id)`; validato.
- `organi_slug_unique`: `UNIQUE (slug)`; validato.

Indici:

- `organi_pkey`: `CREATE UNIQUE INDEX organi_pkey ON public.organi USING btree (id)`; valido.
- `organi_slug_unique`: `CREATE UNIQUE INDEX organi_slug_unique ON public.organi USING btree (slug)`; valido.

## organi_members

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('organi_members_id_seq'::regclass) |
| organo_id | integer | no | — | — |
| official_id | integer | no | — | — |
| membership_role | text | sì | — | — |
| position | integer | no | — | 0 |
| term_label | text | sì | — | — |
| start_date | timestamp with time zone | sì | — | — |
| end_date | timestamp with time zone | sì | — | — |
| source_label | text | sì | — | — |
| source_url | text | sì | — | — |
| notes | text | sì | — | — |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `organi_members_official_id_officials_id_fk`: `FOREIGN KEY (official_id) REFERENCES officials(id) ON DELETE CASCADE`; validato.
- `organi_members_organo_id_organi_id_fk`: `FOREIGN KEY (organo_id) REFERENCES organi(id) ON DELETE CASCADE`; validato.
- `organi_members_pkey`: `PRIMARY KEY (id)`; validato.

Indici:

- `organi_members_official_id_idx`: `CREATE INDEX organi_members_official_id_idx ON public.organi_members USING btree (official_id)`; valido.
- `organi_members_organo_id_idx`: `CREATE INDEX organi_members_organo_id_idx ON public.organi_members USING btree (organo_id)`; valido.
- `organi_members_pkey`: `CREATE UNIQUE INDEX organi_members_pkey ON public.organi_members USING btree (id)`; valido.
- `organi_members_term_idx`: `CREATE INDEX organi_members_term_idx ON public.organi_members USING btree (organo_id, start_date, end_date)`; valido.

## oversight_opinion_documents

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('oversight_opinion_documents_id_seq'::regclass) |
| opinion_id | integer | no | — | — |
| title | text | no | — | — |
| type | text | no | — | — |
| url | text | sì | — | — |
| date | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `oversight_opinion_documents_opinion_id_oversight_opinions_id_fk`: `FOREIGN KEY (opinion_id) REFERENCES oversight_opinions(id)`; validato.
- `oversight_opinion_documents_pkey`: `PRIMARY KEY (id)`; validato.

Indici:

- `oversight_opinion_documents_pkey`: `CREATE UNIQUE INDEX oversight_opinion_documents_pkey ON public.oversight_opinion_documents USING btree (id)`; valido.

## oversight_opinions

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('oversight_opinions_id_seq'::regclass) |
| title | text | no | — | — |
| issuing_body | text | no | — | — |
| opinion_type | text | no | — | — |
| subject | text | no | — | — |
| outcome | text | sì | — | — |
| body | text | sì | — | — |
| reference_year | integer | sì | — | — |
| status | text | no | — | 'pubblicato'::text |
| opinion_date | timestamp with time zone | no | — | now() |
| created_at | timestamp with time zone | no | — | now() |
| updated_at | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `oversight_opinions_pkey`: `PRIMARY KEY (id)`; validato.

Indici:

- `oversight_opinions_pkey`: `CREATE UNIQUE INDEX oversight_opinions_pkey ON public.oversight_opinions USING btree (id)`; valido.

## page_blocks

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('page_blocks_id_seq'::regclass) |
| page_slug | text | no | — | — |
| block_type | text | no | — | — |
| position | integer | no | — | 0 |
| enabled | boolean | no | — | true |
| status | text | no | — | 'published'::text |
| content | jsonb | no | — | '{}'::jsonb |
| draft_content | jsonb | sì | — | — |
| created_at | timestamp with time zone | no | — | now() |
| updated_at | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `page_blocks_pkey`: `PRIMARY KEY (id)`; validato.

Indici:

- `page_blocks_page_slug_idx`: `CREATE INDEX page_blocks_page_slug_idx ON public.page_blocks USING btree (page_slug)`; valido.
- `page_blocks_pkey`: `CREATE UNIQUE INDEX page_blocks_pkey ON public.page_blocks USING btree (id)`; valido.
- `page_blocks_position_idx`: `CREATE INDEX page_blocks_position_idx ON public.page_blocks USING btree (page_slug, "position")`; valido.

## performance_categories

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('performance_categories_id_seq'::regclass) |
| slug | text | no | — | — |
| name | text | no | — | — |
| description | text | no | — | ''::text |
| position | integer | no | — | 0 |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `performance_categories_pkey`: `PRIMARY KEY (id)`; validato.
- `performance_categories_slug_unique`: `UNIQUE (slug)`; validato.

Indici:

- `performance_categories_pkey`: `CREATE UNIQUE INDEX performance_categories_pkey ON public.performance_categories USING btree (id)`; valido.
- `performance_categories_slug_unique`: `CREATE UNIQUE INDEX performance_categories_slug_unique ON public.performance_categories USING btree (slug)`; valido.

## performance_indicator_values

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('performance_indicator_values_id_seq'::regclass) |
| indicator_id | integer | no | — | — |
| period | text | no | — | — |
| value | numeric(18,4) | no | — | — |
| note | text | sì | — | — |
| manual | boolean | no | — | false |
| source | text | sì | — | — |
| created_at | timestamp with time zone | no | — | now() |
| updated_at | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `performance_indicator_values_indicator_id_performance_indicator`: `FOREIGN KEY (indicator_id) REFERENCES performance_indicators(id) ON DELETE CASCADE`; validato.
- `performance_indicator_values_pkey`: `PRIMARY KEY (id)`; validato.

Indici:

- `performance_indicator_values_indicator_id_idx`: `CREATE INDEX performance_indicator_values_indicator_id_idx ON public.performance_indicator_values USING btree (indicator_id)`; valido.
- `performance_indicator_values_indicator_period_idx`: `CREATE UNIQUE INDEX performance_indicator_values_indicator_period_idx ON public.performance_indicator_values USING btree (indicator_id, period)`; valido.
- `performance_indicator_values_pkey`: `CREATE UNIQUE INDEX performance_indicator_values_pkey ON public.performance_indicator_values USING btree (id)`; valido.

## performance_indicators

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('performance_indicators_id_seq'::regclass) |
| slug | text | no | — | — |
| category_id | integer | no | — | — |
| title | text | no | — | — |
| description | text | no | — | ''::text |
| unit | text | no | — | — |
| source | text | no | — | 'Redazione'::text |
| source_url | text | sì | — | — |
| update_mode | text | no | — | 'manual'::text |
| polarity | text | no | — | 'neutral'::text |
| external_key | text | sì | — | — |
| position | integer | no | — | 0 |
| created_at | timestamp with time zone | no | — | now() |
| updated_at | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `performance_indicators_category_id_performance_categories_id_fk`: `FOREIGN KEY (category_id) REFERENCES performance_categories(id) ON DELETE RESTRICT`; validato.
- `performance_indicators_pkey`: `PRIMARY KEY (id)`; validato.
- `performance_indicators_slug_unique`: `UNIQUE (slug)`; validato.
- `performance_indicators_update_mode_check`: `CHECK ((update_mode = ANY (ARRAY['manual'::text, 'automatic'::text])))`; validato.

Indici:

- `performance_indicators_category_id_idx`: `CREATE INDEX performance_indicators_category_id_idx ON public.performance_indicators USING btree (category_id)`; valido.
- `performance_indicators_pkey`: `CREATE UNIQUE INDEX performance_indicators_pkey ON public.performance_indicators USING btree (id)`; valido.
- `performance_indicators_slug_unique`: `CREATE UNIQUE INDEX performance_indicators_slug_unique ON public.performance_indicators USING btree (slug)`; valido.

## publications

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('publications_id_seq'::regclass) |
| progressivo | text | no | — | — |
| tipologia | text | no | — | — |
| category | text | no | — | — |
| subcategory | text | sì | — | — |
| provenienza | text | sì | — | — |
| oggetto | text | no | — | — |
| data_atto | timestamp with time zone | sì | — | — |
| pub_start | timestamp with time zone | sì | — | — |
| pub_end | timestamp with time zone | sì | — | — |
| num_reg_set | text | sì | — | — |
| num_reg_gen | text | sì | — | — |
| cups | text[] | no | — | '{}'::text[] |
| pnrr_mission | text | sì | — | — |
| is_pnrr | boolean | no | — | false |
| attachments | jsonb | no | — | '[]'::jsonb |
| detail_fetched_at | timestamp with time zone | sì | — | — |
| markdown_text | text | sì | — | — |
| markdown_source | text | sì | — | — |
| markdown_extracted_at | timestamp with time zone | sì | — | — |
| is_new | boolean | no | — | true |
| first_seen_at | timestamp with time zone | no | — | now() |
| last_seen_at | timestamp with time zone | no | — | now() |
| brief | text | sì | — | — |
| brief_manual | boolean | sì | — | — |
| brief_generated_at | timestamp with time zone | sì | — | — |
| macrotema | text | sì | — | — |
| macrotema_manual | boolean | no | — | false |
| public_safety_decision | jsonb | sì | — | — |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `publications_pkey`: `PRIMARY KEY (id)`; validato.
- `publications_progressivo_unique`: `UNIQUE (progressivo)`; validato.

Indici:

- `publications_category_idx`: `CREATE INDEX publications_category_idx ON public.publications USING btree (category)`; valido.
- `publications_data_atto_idx`: `CREATE INDEX publications_data_atto_idx ON public.publications USING btree (data_atto)`; valido.
- `publications_is_pnrr_idx`: `CREATE INDEX publications_is_pnrr_idx ON public.publications USING btree (is_pnrr)`; valido.
- `publications_last_seen_at_idx`: `CREATE INDEX publications_last_seen_at_idx ON public.publications USING btree (last_seen_at)`; valido.
- `publications_pkey`: `CREATE UNIQUE INDEX publications_pkey ON public.publications USING btree (id)`; valido.
- `publications_progressivo_unique`: `CREATE UNIQUE INDEX publications_progressivo_unique ON public.publications USING btree (progressivo)`; valido.
- `publications_pub_start_idx`: `CREATE INDEX publications_pub_start_idx ON public.publications USING btree (pub_start)`; valido.

## questions

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('questions_id_seq'::regclass) |
| text | text | no | — | — |
| teaser | text | sì | — | — |
| destination_path | text | no | — | — |
| cta_label | text | no | — | — |
| topic | text | no | — | — |
| featured | boolean | no | — | false |
| sort_order | integer | no | — | 0 |
| status | text | no | — | 'draft'::text |
| created_at | timestamp with time zone | no | — | now() |
| updated_at | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `questions_pkey`: `PRIMARY KEY (id)`; validato.

Indici:

- `questions_pkey`: `CREATE UNIQUE INDEX questions_pkey ON public.questions USING btree (id)`; valido.

## reports

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('reports_id_seq'::regclass) |
| title | text | no | — | — |
| description | text | no | — | — |
| category | text | no | — | — |
| location | text | no | — | — |
| status | text | no | — | 'ricevuta'::text |
| citizen_name | text | sì | — | — |
| created_at | timestamp with time zone | no | — | now() |
| initial_source_type | text | sì | — | — |
| initial_source_url | text | sì | — | — |
| public_emergence_date | timestamp with time zone | sì | — | — |
| involved_sector | text | sì | — | — |
| competent_office | text | sì | — | — |
| formal_act | text | sì | — | — |
| institutional_response | text | sì | — | — |
| institutional_response_date | timestamp with time zone | sì | — | — |
| available_data | text | sì | — | — |
| missing_data | text | sì | — | — |
| foia_link | text | sì | — | — |
| outcome | text | no | — | 'aperta'::text |
| verification_status | text | no | — | 'non_verificata'::text |
| interpretive_caution | text | no | — | 'Scheda da leggere come tracciamento civico: la presenza nel registro non indica responsabilità o irregolarità accertate.'::text |
| updated_at | timestamp with time zone | no | — | now() |
| published_at | timestamp with time zone | sì | — | — |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `reports_outcome_check`: `CHECK ((outcome = ANY (ARRAY['aperta'::text, 'risolta'::text, 'parzialmente_risolta'::text, 'non_risolta'::text, 'non_verificabile'::text, 'archiviata'::text])))`; validato.
- `reports_pkey`: `PRIMARY KEY (id)`; validato.
- `reports_status_check`: `CHECK ((status = ANY (ARRAY['ricevuta'::text, 'in_valutazione'::text, 'presa_in_carico'::text, 'archiviata'::text])))`; validato.
- `reports_verification_status_check`: `CHECK ((verification_status = ANY (ARRAY['non_verificata'::text, 'in_verifica'::text, 'documentata'::text, 'risposta_ricevuta'::text, 'chiusa'::text, 'archiviata'::text, 'da_aggiornare'::text])))`; validato.

Indici:

- `reports_category_idx`: `CREATE INDEX reports_category_idx ON public.reports USING btree (category)`; valido.
- `reports_competent_office_idx`: `CREATE INDEX reports_competent_office_idx ON public.reports USING btree (competent_office)`; valido.
- `reports_created_at_idx`: `CREATE INDEX reports_created_at_idx ON public.reports USING btree (created_at)`; valido.
- `reports_outcome_idx`: `CREATE INDEX reports_outcome_idx ON public.reports USING btree (outcome)`; valido.
- `reports_pkey`: `CREATE UNIQUE INDEX reports_pkey ON public.reports USING btree (id)`; valido.
- `reports_published_at_idx`: `CREATE INDEX reports_published_at_idx ON public.reports USING btree (published_at)`; valido.
- `reports_status_idx`: `CREATE INDEX reports_status_idx ON public.reports USING btree (status)`; valido.
- `reports_verification_status_idx`: `CREATE INDEX reports_verification_status_idx ON public.reports USING btree (verification_status)`; valido.

## sedute

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('sedute_id_seq'::regclass) |
| organo_id | integer | sì | — | — |
| publication_id | integer | sì | — | — |
| type | text | no | — | — |
| date | timestamp with time zone | sì | — | — |
| agenda | text | sì | — | — |
| created_at | timestamp with time zone | no | — | now() |
| updated_at | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `sedute_organo_id_organi_id_fk`: `FOREIGN KEY (organo_id) REFERENCES organi(id) ON DELETE SET NULL`; validato.
- `sedute_pkey`: `PRIMARY KEY (id)`; validato.
- `sedute_publication_id_publications_id_fk`: `FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE SET NULL`; validato.
- `sedute_publication_id_unique`: `UNIQUE (publication_id)`; validato.

Indici:

- `sedute_date_idx`: `CREATE INDEX sedute_date_idx ON public.sedute USING btree (date)`; valido.
- `sedute_organo_id_idx`: `CREATE INDEX sedute_organo_id_idx ON public.sedute USING btree (organo_id)`; valido.
- `sedute_pkey`: `CREATE UNIQUE INDEX sedute_pkey ON public.sedute USING btree (id)`; valido.
- `sedute_publication_id_unique`: `CREATE UNIQUE INDEX sedute_publication_id_unique ON public.sedute USING btree (publication_id)`; valido.

## session_interventions

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('session_interventions_id_seq'::regclass) |
| report_id | integer | no | — | — |
| speaker_name | text | no | — | — |
| speaker_role | text | sì | — | — |
| content | text | no | — | — |
| position | integer | no | — | 0 |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `session_interventions_pkey`: `PRIMARY KEY (id)`; validato.
- `session_interventions_report_id_session_reports_id_fk`: `FOREIGN KEY (report_id) REFERENCES session_reports(id) ON DELETE CASCADE`; validato.

Indici:

- `session_interventions_pkey`: `CREATE UNIQUE INDEX session_interventions_pkey ON public.session_interventions USING btree (id)`; valido.
- `session_interventions_report_id_idx`: `CREATE INDEX session_interventions_report_id_idx ON public.session_interventions USING btree (report_id)`; valido.

## session_reports

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('session_reports_id_seq'::regclass) |
| publication_id | integer | no | — | — |
| seduta_id | integer | sì | — | — |
| summary | text | sì | — | — |
| created_at | timestamp with time zone | no | — | now() |
| updated_at | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `session_reports_pkey`: `PRIMARY KEY (id)`; validato.
- `session_reports_publication_id_publications_id_fk`: `FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE CASCADE`; validato.
- `session_reports_publication_id_unique`: `UNIQUE (publication_id)`; validato.
- `session_reports_seduta_id_sedute_id_fk`: `FOREIGN KEY (seduta_id) REFERENCES sedute(id) ON DELETE SET NULL`; validato.

Indici:

- `session_reports_pkey`: `CREATE UNIQUE INDEX session_reports_pkey ON public.session_reports USING btree (id)`; valido.
- `session_reports_publication_id_unique`: `CREATE UNIQUE INDEX session_reports_publication_id_unique ON public.session_reports USING btree (publication_id)`; valido.
- `session_reports_seduta_id_idx`: `CREATE INDEX session_reports_seduta_id_idx ON public.session_reports USING btree (seduta_id)`; valido.

## shares

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('shares_id_seq'::regclass) |
| theme_id | integer | no | — | — |
| channel | text | no | — | — |
| dedupe_key | text | sì | — | — |
| created_at | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `shares_pkey`: `PRIMARY KEY (id)`; validato.
- `shares_theme_id_themes_id_fk`: `FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE CASCADE`; validato.

Indici:

- `shares_pkey`: `CREATE UNIQUE INDEX shares_pkey ON public.shares USING btree (id)`; valido.
- `shares_theme_channel_dedupe_unique`: `CREATE UNIQUE INDEX shares_theme_channel_dedupe_unique ON public.shares USING btree (theme_id, channel, dedupe_key)`; valido.
- `shares_theme_id_idx`: `CREATE INDEX shares_theme_id_idx ON public.shares USING btree (theme_id)`; valido.

## site_strings

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('site_strings_id_seq'::regclass) |
| key | text | no | — | — |
| namespace | text | no | — | 'general'::text |
| default_value | text | no | — | ''::text |
| published_value | text | sì | — | — |
| draft_value | text | sì | — | — |
| rich_text | boolean | no | — | false |
| updated_at | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `site_strings_key_unique`: `UNIQUE (key)`; validato.
- `site_strings_pkey`: `PRIMARY KEY (id)`; validato.

Indici:

- `site_strings_key_unique`: `CREATE UNIQUE INDEX site_strings_key_unique ON public.site_strings USING btree (key)`; valido.
- `site_strings_namespace_idx`: `CREATE INDEX site_strings_namespace_idx ON public.site_strings USING btree (namespace)`; valido.
- `site_strings_pkey`: `CREATE UNIQUE INDEX site_strings_pkey ON public.site_strings USING btree (id)`; valido.

## theme_documents

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('theme_documents_id_seq'::regclass) |
| theme_id | integer | no | — | — |
| title | text | no | — | — |
| type | text | no | — | — |
| url | text | sì | — | — |
| date | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `theme_documents_pkey`: `PRIMARY KEY (id)`; validato.
- `theme_documents_theme_id_themes_id_fk`: `FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE CASCADE`; validato.

Indici:

- `theme_documents_pkey`: `CREATE UNIQUE INDEX theme_documents_pkey ON public.theme_documents USING btree (id)`; valido.
- `theme_documents_theme_id_idx`: `CREATE INDEX theme_documents_theme_id_idx ON public.theme_documents USING btree (theme_id)`; valido.

## theme_emails

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('theme_emails_id_seq'::regclass) |
| theme_id | integer | no | — | — |
| subject | text | no | — | — |
| sender | text | no | — | — |
| recipient | text | no | — | — |
| direction | text | no | — | — |
| date | timestamp with time zone | no | — | now() |
| body | text | no | — | — |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `theme_emails_pkey`: `PRIMARY KEY (id)`; validato.
- `theme_emails_theme_id_themes_id_fk`: `FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE CASCADE`; validato.

Indici:

- `theme_emails_pkey`: `CREATE UNIQUE INDEX theme_emails_pkey ON public.theme_emails USING btree (id)`; valido.
- `theme_emails_theme_id_idx`: `CREATE INDEX theme_emails_theme_id_idx ON public.theme_emails USING btree (theme_id)`; valido.

## theme_followers

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('theme_followers_id_seq'::regclass) |
| theme_id | integer | no | — | — |
| email | text | no | — | — |
| unsubscribe_token | text | no | — | — |
| created_at | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `theme_followers_pkey`: `PRIMARY KEY (id)`; validato.
- `theme_followers_theme_id_themes_id_fk`: `FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE CASCADE`; validato.
- `theme_followers_unsubscribe_token_unique`: `UNIQUE (unsubscribe_token)`; validato.

Indici:

- `theme_followers_email_idx`: `CREATE INDEX theme_followers_email_idx ON public.theme_followers USING btree (email)`; valido.
- `theme_followers_pkey`: `CREATE UNIQUE INDEX theme_followers_pkey ON public.theme_followers USING btree (id)`; valido.
- `theme_followers_theme_email_unique`: `CREATE UNIQUE INDEX theme_followers_theme_email_unique ON public.theme_followers USING btree (theme_id, email)`; valido.
- `theme_followers_unsubscribe_token_unique`: `CREATE UNIQUE INDEX theme_followers_unsubscribe_token_unique ON public.theme_followers USING btree (unsubscribe_token)`; valido.

## theme_metrics

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('theme_metrics_id_seq'::regclass) |
| theme_id | integer | no | — | — |
| label | text | no | — | — |
| value | text | no | — | — |
| unit | text | no | — | — |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `theme_metrics_pkey`: `PRIMARY KEY (id)`; validato.
- `theme_metrics_theme_id_themes_id_fk`: `FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE CASCADE`; validato.

Indici:

- `theme_metrics_pkey`: `CREATE UNIQUE INDEX theme_metrics_pkey ON public.theme_metrics USING btree (id)`; valido.
- `theme_metrics_theme_id_idx`: `CREATE INDEX theme_metrics_theme_id_idx ON public.theme_metrics USING btree (theme_id)`; valido.

## theme_posts

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('theme_posts_id_seq'::regclass) |
| theme_id | integer | no | — | — |
| title | text | sì | — | — |
| body | text | no | — | — |
| event_date | timestamp with time zone | no | — | now() |
| created_at | timestamp with time zone | no | — | now() |
| updated_at | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `theme_posts_pkey`: `PRIMARY KEY (id)`; validato.
- `theme_posts_theme_id_themes_id_fk`: `FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE CASCADE`; validato.

Indici:

- `theme_posts_pkey`: `CREATE UNIQUE INDEX theme_posts_pkey ON public.theme_posts USING btree (id)`; valido.
- `theme_posts_theme_id_idx`: `CREATE INDEX theme_posts_theme_id_idx ON public.theme_posts USING btree (theme_id)`; valido.

## theme_relevance_events

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('theme_relevance_events_id_seq'::regclass) |
| theme_id | integer | no | — | — |
| dedupe_key | text | sì | — | — |
| created_at | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `theme_relevance_events_pkey`: `PRIMARY KEY (id)`; validato.
- `theme_relevance_events_theme_id_themes_id_fk`: `FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE CASCADE`; validato.

Indici:

- `theme_relevance_events_pkey`: `CREATE UNIQUE INDEX theme_relevance_events_pkey ON public.theme_relevance_events USING btree (id)`; valido.
- `theme_relevance_events_theme_dedupe_unique`: `CREATE UNIQUE INDEX theme_relevance_events_theme_dedupe_unique ON public.theme_relevance_events USING btree (theme_id, dedupe_key)`; valido.
- `theme_relevance_events_theme_id_idx`: `CREATE INDEX theme_relevance_events_theme_id_idx ON public.theme_relevance_events USING btree (theme_id)`; valido.

## themes

| Colonna | Tipo SQL | NULL ammesso | Chiave primaria | Default |
|---|---|---|---|---|
| id | integer | no | sì | nextval('themes_id_seq'::regclass) |
| title | text | no | — | — |
| slug | text | no | — | — |
| summary | text | no | — | — |
| description | text | no | — | — |
| category_id | integer | no | — | — |
| status | text | no | — | 'aperto'::text |
| relevance_count | integer | no | — | 0 |
| share_count | integer | no | — | 0 |
| follower_count | integer | no | — | 0 |
| updated_at | timestamp with time zone | no | — | now() |

Vincoli applicativi e relazioni (i vincoli NOT NULL sono già riportati nella tabella):

- `themes_category_id_categories_id_fk`: `FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT`; validato.
- `themes_pkey`: `PRIMARY KEY (id)`; validato.
- `themes_slug_unique`: `UNIQUE (slug)`; validato.
- `themes_status_check`: `CHECK ((status = ANY (ARRAY['aperto'::text, 'in_corso'::text, 'monitoraggio'::text, 'chiuso'::text])))`; validato.

Indici:

- `themes_category_id_idx`: `CREATE INDEX themes_category_id_idx ON public.themes USING btree (category_id)`; valido.
- `themes_pkey`: `CREATE UNIQUE INDEX themes_pkey ON public.themes USING btree (id)`; valido.
- `themes_slug_unique`: `CREATE UNIQUE INDEX themes_slug_unique ON public.themes USING btree (slug)`; valido.
- `themes_status_idx`: `CREATE INDEX themes_status_idx ON public.themes USING btree (status)`; valido.
