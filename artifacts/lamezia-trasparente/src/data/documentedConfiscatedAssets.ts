import { z } from "zod";

import rawRegistry from "../../../../data/curated/territorio/beni_confiscati_lamezia_pilot.json";

export const DOCUMENTED_CONFISCATED_ASSETS_DATA_PATH =
  "/data/curated/territorio/beni_confiscati_lamezia_pilot.json" as const;

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "expected an ISO calendar date");

const publicSourceSchema = z.object({
  title: z.string().min(1),
  publisher: z.string().min(1),
  source_kind: z.enum([
    "institutional",
    "manager",
    "service_provider",
    "press",
  ]),
  url: z
    .string()
    .url()
    .refine((value) => value.startsWith("https://"), "source must use HTTPS"),
  published_at: isoDateSchema.nullable(),
  supports: z.array(z.string().min(1)).min(1),
});

const documentedReuseSiteSchema = z
  .object({
    id: z.string().startsWith("reuse-site:"),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    name: z.string().min(1),
    status: z.literal("riutilizzato"),
    address: z.object({
      label: z.string().min(1),
      precision: z.enum(["civic", "civic_range"]),
      verification_status: z.literal("documented"),
    }),
    location: z.object({
      publication_status: z.literal("withheld_pending_verification"),
      coordinates: z.tuple([z.number(), z.number()]).nullable(),
      note: z.string().min(1),
    }),
    anbsc_match: z.object({
      status: z.literal("not_established"),
      record_ids: z.array(z.string()),
      note: z.string().min(1),
    }),
    manager: z.string().min(1),
    context: z.string().min(80),
    public_uses: z.array(z.string().min(1)).min(1),
    refunctionalization: z.object({
      programme: z.string().min(1),
      project_title: z.string().min(1),
      amount_eur: z.number().positive(),
      protocol: z.string().min(1),
      cup: z.string().regex(/^[A-Z0-9]{15}$/),
      municipal_act_reference: z.string().min(1),
      completion_date: isoDateSchema,
    }),
    sources: z.array(publicSourceSchema).min(3),
  })
  .superRefine((record, context) => {
    if (record.location.coordinates !== null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["location", "coordinates"],
        message:
          "coordinates must remain null while publication is pending verification",
      });
    }
    if (record.anbsc_match.record_ids.length > 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["anbsc_match", "record_ids"],
        message:
          "ANBSC record identifiers require an established one-to-one match",
      });
    }
    if (
      !record.sources.some((source) => source.source_kind === "institutional")
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sources"],
        message: "at least one institutional source is required",
      });
    }
    if (!record.sources.some((source) => source.source_kind === "manager")) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sources"],
        message: "at least one source from the reuse-site manager is required",
      });
    }
  });

const methodologySourceSchema = publicSourceSchema
  .omit({
    published_at: true,
    supports: true,
  })
  .extend({
    note: z.string().min(1),
  });

const documentedConfiscatedAssetsRegistrySchema = z
  .object({
    schema_version: z.literal("1.0"),
    title: z.string().min(1),
    scope: z.object({
      municipality: z.literal("Lamezia Terme"),
      record_type: z.literal("documented_reuse_site"),
    }),
    last_verified_at: isoDateSchema,
    publication_policy: z.object({
      summary: z.string().min(1),
      coordinate_rule: z.string().min(1),
      anbsc_rule: z.string().min(1),
    }),
    methodology_sources: z.array(methodologySourceSchema).min(1),
    records: z.array(documentedReuseSiteSchema).min(1),
  })
  .superRefine((registry, context) => {
    const ids = new Set<string>();
    const slugs = new Set<string>();
    registry.records.forEach((record, index) => {
      if (ids.has(record.id)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["records", index, "id"],
          message: `duplicate record id: ${record.id}`,
        });
      }
      if (slugs.has(record.slug)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["records", index, "slug"],
          message: `duplicate record slug: ${record.slug}`,
        });
      }
      ids.add(record.id);
      slugs.add(record.slug);
    });
  });

export type DocumentedConfiscatedAssetsRegistry = z.infer<
  typeof documentedConfiscatedAssetsRegistrySchema
>;
export type DocumentedConfiscatedAsset =
  DocumentedConfiscatedAssetsRegistry["records"][number];
export type DocumentedConfiscatedAssetSource =
  DocumentedConfiscatedAsset["sources"][number];

export function parseDocumentedConfiscatedAssetsRegistry(
  value: unknown,
): DocumentedConfiscatedAssetsRegistry {
  return documentedConfiscatedAssetsRegistrySchema.parse(value);
}

export const documentedConfiscatedAssetsRegistry =
  parseDocumentedConfiscatedAssetsRegistry(rawRegistry);
