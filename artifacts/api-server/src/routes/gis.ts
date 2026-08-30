import { Router, type IRouter } from "express";
import {
  historicCircumscriptionCentroidsSpatialCollection,
  municipalBoundarySpatialCollection,
} from "../lib/gisSpatial";

const router: IRouter = Router();

// Livelli GIS di base del territorio (Mappa GIS degli interventi).
// La geometria sorgente resta nel file auto-generato `data/gis.ts`; questo
// router espone payload qualificati con provenienza/licenza e semantica di
// rappresentazione esplicita.
//  - /gis/comune     → confine amministrativo del Comune (Polygon)
//  - /gis/quartieri  → centroidi/toponimi delle circoscrizioni storiche (Point),
//                      esplicitamente NON confini di quartiere.

router.get("/gis/comune", (_req, res) => {
  res.type("application/geo+json").json(municipalBoundarySpatialCollection);
});

router.get("/gis/quartieri", (_req, res) => {
  res
    .type("application/geo+json")
    .json(historicCircumscriptionCentroidsSpatialCollection);
});

export default router;
