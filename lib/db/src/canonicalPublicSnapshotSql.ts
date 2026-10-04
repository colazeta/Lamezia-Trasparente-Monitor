// One SQL statement, one MVCC snapshot. Only the three registered sources are
// in scope. Raw evidence never leaves the internal reader.
export const canonicalPublicSnapshotSql = `WITH latest AS (
 SELECT DISTINCT ON (s.source_key) s.source_key,e.repository_path,rel.id,rel.metadata,rel.collections,
 a.byte_hash,a.repository_commit,a.content_text
 FROM public.source_sources s JOIN public.source_endpoints e ON e.source_id=s.id
 JOIN public.source_releases rel ON rel.endpoint_id=e.id
 JOIN public.source_artifacts a ON a.id=rel.artifact_id
 JOIN public.source_acquisition_runs run ON run.release_id=rel.id AND run.status='succeeded'
 WHERE s.source_key IN ('lamezia.albo.current','lamezia.albo.delibere','lamezia.pnrr.municipal')
 ORDER BY s.source_key,run.started_at DESC,run.id DESC
), records AS (
 SELECT r.*,l.source_key FROM public.source_records r JOIN latest l ON l.id=r.release_id
), assertions AS (
 SELECT a.* FROM public.core_assertions a JOIN records r ON r.id=a.source_record_id
), project_ids AS (
 SELECT DISTINCT o.target_subject_id AS id FROM public.core_resolution_outcomes o JOIN records r ON r.id=o.source_record_id
 WHERE r.source_key='lamezia.pnrr.municipal' AND o.status='resolved' AND o.role='project_identity'
 UNION SELECT DISTINCT i.project_id FROM public.project_identifiers i JOIN records r ON upper(btrim(r.payload->>'cup'))=i.value
 WHERE r.source_key='lamezia.pnrr.municipal' AND r.collection_key='projects' AND i.scheme='CUP' AND i.issuer='it.dipe'
)
SELECT jsonb_build_object(
 'releases',(SELECT jsonb_agg(to_jsonb(l) ORDER BY source_key) FROM latest l),
 'records',(SELECT jsonb_agg(to_jsonb(r) ORDER BY source_key,collection_key,ordinal) FROM records r),
 'publications',(SELECT coalesce(jsonb_agg(to_jsonb(p)), '[]') FROM public.document_publications p),
 'versions',(SELECT coalesce(jsonb_agg(to_jsonb(v)), '[]') FROM public.document_publication_versions v JOIN records r ON r.id=v.source_record_id),
 'acts',(SELECT coalesce(jsonb_agg(to_jsonb(a)), '[]') FROM public.document_acts a),
 'documents',(SELECT coalesce(jsonb_agg(to_jsonb(d)), '[]') FROM public.document_documents d),
 'actLinks',(SELECT coalesce(jsonb_agg(to_jsonb(l)||jsonb_build_object('assertion_pointer',a.source_pointer)), '[]') FROM public.document_publication_acts l JOIN records r ON r.id=l.source_record_id JOIN assertions a ON a.id=l.evidence_assertion_id AND a.source_record_id=l.source_record_id),
 'documentLinks',(SELECT coalesce(jsonb_agg(to_jsonb(l)||jsonb_build_object('assertion_pointer',a.source_pointer)), '[]') FROM public.document_publication_documents l JOIN records r ON r.id=l.source_record_id JOIN assertions a ON a.id=l.evidence_assertion_id AND a.source_record_id=l.source_record_id),
 'assertions',(SELECT coalesce(jsonb_agg(to_jsonb(a)), '[]') FROM assertions a),
 'outcomes',(SELECT coalesce(jsonb_agg(to_jsonb(o)||jsonb_build_object('assertion_pointer',a.source_pointer)), '[]') FROM public.core_resolution_outcomes o JOIN records r ON r.id=o.source_record_id JOIN assertions a ON a.id=o.assertion_id AND a.source_record_id=o.source_record_id),
 'classifications',(SELECT coalesce(jsonb_agg(to_jsonb(c)||jsonb_build_object('assertion_pointer',a.source_pointer)), '[]') FROM public.taxonomy_classifications c JOIN records r ON r.id=c.source_record_id JOIN assertions a ON a.id=c.evidence_assertion_id AND a.source_record_id=c.source_record_id),
 'projects',(SELECT coalesce(jsonb_agg(to_jsonb(p)||jsonb_build_object('cup',(SELECT value FROM public.project_identifiers pi WHERE pi.project_id=p.id AND pi.scheme='CUP' AND pi.issuer='it.dipe' ORDER BY value LIMIT 1),'financed_amount',p.financed_amount::text,'opencup_total_cost',p.opencup_total_cost::text,'opencup_public_funding',p.opencup_public_funding::text)), '[]') FROM public.project_projects p JOIN project_ids i ON i.id=p.id),
 'identifiers',(SELECT coalesce(jsonb_agg(to_jsonb(i)||jsonb_build_object('source_record_id',a.source_record_id,'assertion_pointer',a.source_pointer,'evidence_value',a.value,'evidence_property',a.property_key,'evidence_record_cup',er.payload->>'cup','evidence_source_key',es.source_key)), '[]') FROM public.project_identifiers i JOIN project_ids p ON p.id=i.project_id JOIN public.core_assertions a ON a.id=i.evidence_assertion_id JOIN public.source_records er ON er.id=a.source_record_id JOIN public.source_releases el ON el.id=er.release_id JOIN public.source_endpoints ee ON ee.id=el.endpoint_id JOIN public.source_sources es ON es.id=ee.source_id),
 'fields',(SELECT coalesce(jsonb_agg(to_jsonb(f)||jsonb_build_object('source_record_id',a.source_record_id,'assertion_pointer',a.source_pointer)), '[]') FROM public.project_field_resolutions f JOIN project_ids p ON p.id=f.project_id JOIN public.core_assertions a ON a.id=f.selected_assertion_id WHERE f.valid_to IS NULL)
) AS bundle`;
