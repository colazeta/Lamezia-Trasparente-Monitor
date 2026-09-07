SELECT 'accesso_civico_requests' AS table_name, count(*)::int AS rows FROM public."accesso_civico_requests"
UNION ALL
SELECT 'acts' AS table_name, count(*)::int AS rows FROM public."acts"
UNION ALL
SELECT 'attuazione_pnrr_projects' AS table_name, count(*)::int AS rows FROM public."attuazione_pnrr_projects"
UNION ALL
SELECT 'bandi' AS table_name, count(*)::int AS rows FROM public."bandi"
UNION ALL
SELECT 'bando_matches' AS table_name, count(*)::int AS rows FROM public."bando_matches"
UNION ALL
SELECT 'canonical_subjects' AS table_name, count(*)::int AS rows FROM public."canonical_subjects"
UNION ALL
SELECT 'categories' AS table_name, count(*)::int AS rows FROM public."categories"
UNION ALL
SELECT 'change_sentinel_events' AS table_name, count(*)::int AS rows FROM public."change_sentinel_events"
UNION ALL
SELECT 'confiscated_assets' AS table_name, count(*)::int AS rows FROM public."confiscated_assets"
UNION ALL
SELECT 'contracts' AS table_name, count(*)::int AS rows FROM public."contracts"
UNION ALL
SELECT 'conversations' AS table_name, count(*)::int AS rows FROM public."conversations"
UNION ALL
SELECT 'crime_event_cluster_members' AS table_name, count(*)::int AS rows FROM public."crime_event_cluster_members"
UNION ALL
SELECT 'crime_event_cluster_sources' AS table_name, count(*)::int AS rows FROM public."crime_event_cluster_sources"
UNION ALL
SELECT 'crime_event_clusters' AS table_name, count(*)::int AS rows FROM public."crime_event_clusters"
UNION ALL
SELECT 'crime_event_locations' AS table_name, count(*)::int AS rows FROM public."crime_event_locations"
UNION ALL
SELECT 'crime_event_offences' AS table_name, count(*)::int AS rows FROM public."crime_event_offences"
UNION ALL
SELECT 'crime_event_sources' AS table_name, count(*)::int AS rows FROM public."crime_event_sources"
UNION ALL
SELECT 'crime_events' AS table_name, count(*)::int AS rows FROM public."crime_events"
UNION ALL
SELECT 'crime_public_events' AS table_name, count(*)::int AS rows FROM public."crime_public_events"
UNION ALL
SELECT 'crime_sources' AS table_name, count(*)::int AS rows FROM public."crime_sources"
UNION ALL
SELECT 'demographic_observations' AS table_name, count(*)::int AS rows FROM public."demographic_observations"
UNION ALL
SELECT 'demographic_releases' AS table_name, count(*)::int AS rows FROM public."demographic_releases"
UNION ALL
SELECT 'demographic_series' AS table_name, count(*)::int AS rows FROM public."demographic_series"
UNION ALL
SELECT 'feed_status' AS table_name, count(*)::int AS rows FROM public."feed_status"
UNION ALL
SELECT 'fundamental_acts' AS table_name, count(*)::int AS rows FROM public."fundamental_acts"
UNION ALL
SELECT 'helper_overrides' AS table_name, count(*)::int AS rows FROM public."helper_overrides"
UNION ALL
SELECT 'italiadomani_projects' AS table_name, count(*)::int AS rows FROM public."italiadomani_projects"
UNION ALL
SELECT 'legacy_subject_map' AS table_name, count(*)::int AS rows FROM public."legacy_subject_map"
UNION ALL
SELECT 'legality_areas' AS table_name, count(*)::int AS rows FROM public."legality_areas"
UNION ALL
SELECT 'legality_overview' AS table_name, count(*)::int AS rows FROM public."legality_overview"
UNION ALL
SELECT 'legality_requirements' AS table_name, count(*)::int AS rows FROM public."legality_requirements"
UNION ALL
SELECT 'messages' AS table_name, count(*)::int AS rows FROM public."messages"
UNION ALL
SELECT 'monitoring_reports' AS table_name, count(*)::int AS rows FROM public."monitoring_reports"
UNION ALL
SELECT 'official_activities' AS table_name, count(*)::int AS rows FROM public."official_activities"
UNION ALL
SELECT 'official_declarations' AS table_name, count(*)::int AS rows FROM public."official_declarations"
UNION ALL
SELECT 'official_remunerations' AS table_name, count(*)::int AS rows FROM public."official_remunerations"
UNION ALL
SELECT 'official_votes' AS table_name, count(*)::int AS rows FROM public."official_votes"
UNION ALL
SELECT 'officials' AS table_name, count(*)::int AS rows FROM public."officials"
UNION ALL
SELECT 'opendata_datasets' AS table_name, count(*)::int AS rows FROM public."opendata_datasets"
UNION ALL
SELECT 'opendata_resources' AS table_name, count(*)::int AS rows FROM public."opendata_resources"
UNION ALL
SELECT 'opendata_snapshots' AS table_name, count(*)::int AS rows FROM public."opendata_snapshots"
UNION ALL
SELECT 'organi' AS table_name, count(*)::int AS rows FROM public."organi"
UNION ALL
SELECT 'organi_members' AS table_name, count(*)::int AS rows FROM public."organi_members"
UNION ALL
SELECT 'oversight_opinion_documents' AS table_name, count(*)::int AS rows FROM public."oversight_opinion_documents"
UNION ALL
SELECT 'oversight_opinions' AS table_name, count(*)::int AS rows FROM public."oversight_opinions"
UNION ALL
SELECT 'page_blocks' AS table_name, count(*)::int AS rows FROM public."page_blocks"
UNION ALL
SELECT 'performance_categories' AS table_name, count(*)::int AS rows FROM public."performance_categories"
UNION ALL
SELECT 'performance_indicator_values' AS table_name, count(*)::int AS rows FROM public."performance_indicator_values"
UNION ALL
SELECT 'performance_indicators' AS table_name, count(*)::int AS rows FROM public."performance_indicators"
UNION ALL
SELECT 'publications' AS table_name, count(*)::int AS rows FROM public."publications"
UNION ALL
SELECT 'questions' AS table_name, count(*)::int AS rows FROM public."questions"
UNION ALL
SELECT 'reports' AS table_name, count(*)::int AS rows FROM public."reports"
UNION ALL
SELECT 'sedute' AS table_name, count(*)::int AS rows FROM public."sedute"
UNION ALL
SELECT 'session_interventions' AS table_name, count(*)::int AS rows FROM public."session_interventions"
UNION ALL
SELECT 'session_reports' AS table_name, count(*)::int AS rows FROM public."session_reports"
UNION ALL
SELECT 'shares' AS table_name, count(*)::int AS rows FROM public."shares"
UNION ALL
SELECT 'site_strings' AS table_name, count(*)::int AS rows FROM public."site_strings"
UNION ALL
SELECT 'source_acquisition_runs' AS table_name, count(*)::int AS rows FROM public."source_acquisition_runs"
UNION ALL
SELECT 'source_artifacts' AS table_name, count(*)::int AS rows FROM public."source_artifacts"
UNION ALL
SELECT 'source_endpoints' AS table_name, count(*)::int AS rows FROM public."source_endpoints"
UNION ALL
SELECT 'source_records' AS table_name, count(*)::int AS rows FROM public."source_records"
UNION ALL
SELECT 'source_releases' AS table_name, count(*)::int AS rows FROM public."source_releases"
UNION ALL
SELECT 'source_sources' AS table_name, count(*)::int AS rows FROM public."source_sources"
UNION ALL
SELECT 'theme_documents' AS table_name, count(*)::int AS rows FROM public."theme_documents"
UNION ALL
SELECT 'theme_emails' AS table_name, count(*)::int AS rows FROM public."theme_emails"
UNION ALL
SELECT 'theme_followers' AS table_name, count(*)::int AS rows FROM public."theme_followers"
UNION ALL
SELECT 'theme_metrics' AS table_name, count(*)::int AS rows FROM public."theme_metrics"
UNION ALL
SELECT 'theme_posts' AS table_name, count(*)::int AS rows FROM public."theme_posts"
UNION ALL
SELECT 'theme_relevance_events' AS table_name, count(*)::int AS rows FROM public."theme_relevance_events"
UNION ALL
SELECT 'themes' AS table_name, count(*)::int AS rows FROM public."themes";
