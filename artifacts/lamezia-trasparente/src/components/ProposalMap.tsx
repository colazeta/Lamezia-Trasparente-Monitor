import { useEffect, useMemo } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import type { PublicProposal } from "@/data/propostePubbliche";
import {
  PROPOSAL_GEO_AREA_LABELS,
  PROPOSAL_GEO_PRECISION_LABELS,
  getProposalGeography,
  type ProposalGeoPoint,
} from "@/data/proposalGeography";
import { LAMEZIA_CENTER } from "@/lib/gis";

type LocatedProposalPoint = {
  proposal: PublicProposal;
  point: ProposalGeoPoint;
};

function FitProposalBounds({ points }: { points: LocatedProposalPoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) {
      map.setView(LAMEZIA_CENTER, 11);
      return;
    }

    if (points.length === 1) {
      map.setView([points[0].point.latitude, points[0].point.longitude], 14, {
        animate: true,
      });
      return;
    }

    const bounds = L.latLngBounds(
      points.map(({ point }) => [point.latitude, point.longitude]),
    );
    map.fitBounds(bounds, { padding: [28, 28], maxZoom: 14, animate: true });
  }, [map, points]);

  return null;
}

export function ProposalMap({ proposals }: { proposals: readonly PublicProposal[] }) {
  const locatedPoints = useMemo<LocatedProposalPoint[]>(
    () =>
      proposals.flatMap((proposal) => {
        const geography = getProposalGeography(proposal.id);
        if (!geography || geography.scope === "citywide") return [];
        return geography.points.map((point) => ({ proposal, point }));
      }),
    [proposals],
  );

  if (locatedPoints.length === 0) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
        Nessuna proposta con riferimento geografico puntuale nei filtri correnti.
      </div>
    );
  }

  return (
    <MapContainer
      center={LAMEZIA_CENTER}
      zoom={11}
      scrollWheelZoom={false}
      className="h-[430px] w-full rounded-2xl"
      style={{ background: "hsl(var(--muted))" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitProposalBounds points={locatedPoints} />

      {locatedPoints.map(({ proposal, point }) => {
        const approximate =
          point.precision === "street_approximate" ||
          point.precision === "area_centroid";

        return (
          <CircleMarker
            key={`${proposal.id}-${point.id}`}
            center={[point.latitude, point.longitude]}
            radius={approximate ? 8 : 9}
            pathOptions={{
              color: "hsl(219 89% 46%)",
              fillColor: "hsl(219 89% 46%)",
              fillOpacity: approximate ? 0.45 : 0.78,
              weight: 2,
              dashArray: approximate ? "4 3" : undefined,
            }}
          >
            <Tooltip direction="top" offset={[0, -6]}>
              {proposal.title}
            </Tooltip>
            <Popup>
              <div className="min-w-[220px] space-y-2">
                <div className="font-semibold leading-snug">{proposal.title}</div>
                <div className="text-xs leading-relaxed text-muted-foreground">
                  {point.label}
                </div>
                <div className="text-xs font-medium">
                  {PROPOSAL_GEO_AREA_LABELS[point.area]}
                </div>
                <div className="font-mono text-[11px] text-muted-foreground">
                  {point.latitude.toFixed(5)}, {point.longitude.toFixed(5)}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {PROPOSAL_GEO_PRECISION_LABELS[point.precision]}
                </div>
                <div className="border-t border-border pt-2 text-xs text-muted-foreground">
                  Promotore: {proposal.promoter}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
