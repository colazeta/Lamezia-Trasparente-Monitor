import { getActiveAtlasSpatialLayers } from "@/lib/spatial";

export function AtlasLayerSelector({
  onVisibilityChange,
  visibleLayerIds,
}: {
  onVisibilityChange: (layerId: string, visible: boolean) => void;
  visibleLayerIds: ReadonlySet<string>;
}) {
  const layers = getActiveAtlasSpatialLayers();

  return (
    <fieldset className="m-0 border-0 p-0">
      <legend className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        Livelli
      </legend>
      <div className="mt-1.5 flex flex-wrap gap-2 text-xs">
        {layers.map((layer) => (
          <label
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 font-medium text-foreground"
            key={layer.id}
            title={layer.description}
          >
            <input
              checked={visibleLayerIds.has(layer.id)}
              className="h-3.5 w-3.5 accent-primary"
              onChange={(event) =>
                onVisibilityChange(layer.id, event.target.checked)
              }
              type="checkbox"
            />
            {layer.title}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
