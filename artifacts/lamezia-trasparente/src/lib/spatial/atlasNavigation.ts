export type AtlasEntityReference = {
  entityType: string;
  entityId: string;
};

export type AtlasNavigationState = {
  layerIds: string[];
  entity: AtlasEntityReference | null;
};

export type BuildAtlasHrefOptions = {
  layerIds?: string[];
  entity?: AtlasEntityReference | null;
};

export function parseAtlasNavigation(search: string): AtlasNavigationState {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const layerIds = Array.from(
    new Set(
      (params.get("layers") ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );

  const rawEntity = params.get("entity")?.trim() ?? "";
  const separatorIndex = rawEntity.indexOf(":");
  const entity =
    separatorIndex > 0 && separatorIndex < rawEntity.length - 1
      ? {
          entityType: rawEntity.slice(0, separatorIndex),
          entityId: rawEntity.slice(separatorIndex + 1),
        }
      : null;

  return { layerIds, entity };
}

export function buildAtlasHref({
  layerIds = [],
  entity = null,
}: BuildAtlasHrefOptions = {}): string {
  const params = new URLSearchParams();
  const uniqueLayerIds = Array.from(
    new Set(layerIds.map((value) => value.trim()).filter(Boolean)),
  );

  if (uniqueLayerIds.length > 0) {
    params.set("layers", uniqueLayerIds.join(","));
  }
  if (entity?.entityType && entity.entityId) {
    params.set("entity", `${entity.entityType}:${entity.entityId}`);
  }

  const query = params.toString();
  return query ? `/atlante-territoriale?${query}` : "/atlante-territoriale";
}
