import { Router, type IRouter } from "express";
import { comuneGeoJson, quartieriGeoJson } from "../data/gis";

const router: IRouter = Router();

// Livelli GIS di base del territorio (Mappa GIS degli interventi).
// Dati aperti OpenStreetMap (© OpenStreetMap contributors, ODbL 1.0):
//  - /gis/comune     → confine amministrativo del Comune (Polygon)
//  - /gis/quartieri  → centroidi delle circoscrizioni storiche (Point)
// Serviti come GeoJSON così che web e mobile possano disegnare la mappa.

router.get("/gis/comune", (_req, res) => {
  res.json(comuneGeoJson);
});

router.get("/gis/quartieri", (_req, res) => {
  res.json(quartieriGeoJson);
});

export default router;
