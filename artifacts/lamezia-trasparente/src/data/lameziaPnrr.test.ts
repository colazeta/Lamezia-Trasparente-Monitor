import { describe, expect, it } from "vitest";

import {
  LAMEZIA_PNRR_STATIC_DATA,
  LAMEZIA_PNRR_STATIC_VIEW,
  mergePnrrViewProjects,
} from "./lameziaPnrr";

describe("Lamezia PNRR static feed", () => {
  it("maps every materialised project and only its CUP-linked Albo evidence", () => {
    expect(LAMEZIA_PNRR_STATIC_VIEW.projects).toHaveLength(
      LAMEZIA_PNRR_STATIC_DATA.coverage.projects,
    );

    for (const project of LAMEZIA_PNRR_STATIC_VIEW.projects) {
      const source = LAMEZIA_PNRR_STATIC_DATA.projects.find(
        (item) => item.source_id === project.sourceId,
      );
      expect(source).toBeDefined();
      expect(project.documents.map((document) => String(document.id))).toEqual(
        source?.albo_evidence_ids ?? [],
      );
      expect(project.dataOrigin).toBe("static-municipal");
      expect(project.freshnessAssessment).toBe("not_assessed");
    }
  });

  it("publishes archived Albo documents through the verified public path", () => {
    const document = LAMEZIA_PNRR_STATIC_VIEW.projects
      .flatMap((project) => project.documents)
      .find((item) => item.attachments?.[0]?.storagePath);

    expect(document?.attachments?.[0]?.storagePath).toMatch(
      /^\/data\/public\/albo\/documents\//,
    );
  });

  it("maps the official municipal attachment archive with explicit provenance metadata", () => {
    expect(LAMEZIA_PNRR_STATIC_DATA.schema_version).toBe(4);

    const source = LAMEZIA_PNRR_STATIC_DATA.projects.find(
      (project) => project.attachments.length > 1,
    );
    const view = LAMEZIA_PNRR_STATIC_VIEW.projects.find(
      (project) => project.sourceId === source?.source_id,
    );

    expect(source).toBeDefined();
    expect(view?.attachments).toHaveLength(source?.attachments.length ?? 0);
    expect(
      view?.attachments.map((attachment) => attachment.sourceOrder),
    ).toEqual(source?.attachments.map((attachment) => attachment.source_order));
    expect(
      view?.attachments.every(
        (attachment) =>
          attachment.phaseLabel.length > 0 &&
          attachment.phaseDescription.length > 0,
      ),
    ).toBe(true);
  });

  it("reconciles every available OpenCUP record only by identical CUP", () => {
    const enrichedProjects = LAMEZIA_PNRR_STATIC_DATA.projects.filter(
      (project) => project.opencup,
    );
    const projectCups = LAMEZIA_PNRR_STATIC_DATA.projects.flatMap((project) =>
      project.cup ? [project.cup] : [],
    );

    expect(enrichedProjects).toHaveLength(
      LAMEZIA_PNRR_STATIC_DATA.coverage.projects_with_opencup,
    );
    expect(new Set(projectCups).size).toBe(projectCups.length);
    expect(LAMEZIA_PNRR_STATIC_DATA.coverage.projects_without_opencup).toBe(
      LAMEZIA_PNRR_STATIC_DATA.coverage.projects - enrichedProjects.length,
    );
    expect(
      LAMEZIA_PNRR_STATIC_DATA.coverage.projects_with_opencup_fresh +
        LAMEZIA_PNRR_STATIC_DATA.coverage.projects_with_opencup_stale,
    ).toBe(enrichedProjects.length);
    expect(
      LAMEZIA_PNRR_STATIC_DATA.coverage.projects_with_opencup_total_cost,
    ).toBe(
      enrichedProjects.filter(
        (project) => project.opencup?.total_cost_eur != null,
      ).length,
    );
    expect(
      LAMEZIA_PNRR_STATIC_DATA.coverage.projects_with_opencup_public_funding,
    ).toBe(
      enrichedProjects.filter(
        (project) => project.opencup?.public_funding_eur != null,
      ).length,
    );

    for (const source of enrichedProjects) {
      const view = LAMEZIA_PNRR_STATIC_VIEW.projects.find(
        (project) => project.sourceId === source.source_id,
      );
      expect(source.opencup?.cup).toBe(source.cup);
      expect(source.opencup?.source_url).toBe(
        `https://www.opencup.gov.it/portale/it/web/opencup/home/progetto/-/cup/${source.cup}`,
      );
      expect(view?.openCup).toEqual(source.opencup);
      expect(view?.openCupAcquisition).toEqual(source.opencup_acquisition);
      expect(view?.locationSourceUrl).toBe(source.opencup?.source_url);
    }
  });

  it("enriches runtime rows only on an identical CUP and keeps static-only rows", () => {
    const [matched, staticOnly] = LAMEZIA_PNRR_STATIC_VIEW.projects;
    const runtime = {
      ...matched,
      id: 91,
      key: "runtime-91",
      dataOrigin: "runtime-api" as const,
      documents: [],
      documentsCount: 0,
      attachments: [],
    };

    const result = mergePnrrViewProjects([runtime], [matched, staticOnly]);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      id: 91,
      key: "runtime-91",
      cup: matched.cup,
      dataOrigin: "hybrid",
      documentsCount: matched.documentsCount,
      openCup: matched.openCup,
      openCupAcquisition: matched.openCupAcquisition,
    });
    expect(result[1].key).toBe(staticOnly.key);
  });
});
