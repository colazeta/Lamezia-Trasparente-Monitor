# ANNCSU Coordinate Quality Audit 2025

## Result

- Source civics checked: 22757
- Suspect civic coordinates: 301
- Civic review tasks loaded: 2304
- Workbench point access_ids observed: 11548
- Suspect points missing from `civics_by_task`: 0
- Suspect CSV: `data/interim/qa/anncsu_coordinate_suspect_points_2025.csv`

This audit does not alter ANNCSU raw data and does not assign sections by OpenStreetMap or proximity.
It flags coordinates that need manual coordinate review before they are used as geometric evidence.

## Sources

- Source CSV: `data/processed/geo/anncsu_lamezia_civics_with_electoral_section_2025_v2.csv`
- Census cells: `data/interim/geo/electoral_section_census_cells_assignment_2025.gpkg` layer `electoral_section_census_cells_assignment_2025`
- Boundary source: `data/processed/territorio/istat_sezioni_censimento_lamezia.geojson`

## Flag Counts

- `isolated_point`: 16
- `needs_manual_coordinate_review`: 9
- `outside_boundary`: 15
- `same_street_outlier`: 261

## Checks Performed

- Missing coordinates.
- Implausible Lamezia lon/lat ranges and possible X/Y swaps.
- Outside municipal boundary candidate, with 25 m tolerance.
- Same-street cluster outliers using robust distance thresholds.
- Isolated same-street points with no same-street neighbour within 150 m and nearest same-street distance above 500 m.
- Rare census-cell placement for a street when combined with a spatial outlier signal.
- Progressive civic-number anomalies only when adjacent civic numbers are spatially distant and the nearest same-street civic is above 250 m.

## Interpretation

- `coordinate suspect` does not mean the civic label is wrong.
- `coordinate suspect` does not by itself mean the electoral section is wrong.
- The electoral section should still be reviewed against the electoral street register.
- Future geometry generation may exclude or override these points only through a traced manual decision.
- OpenStreetMap remains visual context only.

## Sample Suspects

- `3514824` CONTRADA AGLI 18: `outside_boundary`; outside municipal boundary candidate by 146.0 m; 3559.2 m from same-street cluster centroid; nearest same-street civic is 808.2 m away; progressive civic-number neighbour is 4032.2 m away
- `3526015` CONTRADA ANNUNZIATA 105: `outside_boundary`; outside municipal boundary candidate by 146.0 m; progressive civic-number neighbour is 877.0 m away
- `3530569` CONTRADA CARIA 399: `outside_boundary`; outside municipal boundary candidate by 34.0 m
- `3530575` CONTRADA CARIA 454: `outside_boundary`; outside municipal boundary candidate by 38.8 m
- `3530570` CONTRADA CARIA 458: `outside_boundary`; outside municipal boundary candidate by 32.2 m
- `3530576` CONTRADA CARIA 459: `outside_boundary`; outside municipal boundary candidate by 29.9 m
- `3530579` CONTRADA CARIA 461: `outside_boundary`; outside municipal boundary candidate by 39.5 m
- `3530577` CONTRADA CARIA 469: `outside_boundary`; outside municipal boundary candidate by 39.4 m
- `3530578` CONTRADA CARIA 473: `outside_boundary`; outside municipal boundary candidate by 28.4 m
- `3530580` CONTRADA CARIA 484: `outside_boundary`; outside municipal boundary candidate by 42.0 m
- `3530571` CONTRADA CARIA 498: `outside_boundary`; outside municipal boundary candidate by 32.3 m
- `3530581` CONTRADA CARIA 501: `outside_boundary`; outside municipal boundary candidate by 37.0 m
- `3530572` CONTRADA CARIA 512: `outside_boundary`; outside municipal boundary candidate by 43.4 m
- `3530573` CONTRADA CARIA 518: `outside_boundary`; outside municipal boundary candidate by 34.7 m
- `3530574` CONTRADA CARIA 93: `outside_boundary`; outside municipal boundary candidate by 33.6 m
- `3527350` CONTRADA ACQUADAUZANO 72: `same_street_outlier`; nearest same-street civic is 538.5 m away; progressive civic-number neighbour is 541.7 m away
- `3514822` CONTRADA AGLI 60: `same_street_outlier`; 3030.7 m from same-street cluster centroid; nearest same-street civic is 808.2 m away; rare census-cell placement for same-street civics; progressive civic-number neighbour is 3492.7 m away
- `3525993` CONTRADA ANNUNZIATA 23: `same_street_outlier`; nearest same-street civic is 2407.0 m away; progressive civic-number neighbour is 3322.9 m away
- `3526021` CONTRADA ANNUNZIATA 77: `same_street_outlier`; 6911.6 m from same-street cluster centroid; nearest same-street civic is 624.1 m away; progressive civic-number neighbour is 624.1 m away
- `3526022` CONTRADA ANNUNZIATA 79: `same_street_outlier`; nearest same-street civic is 1400.9 m away; progressive civic-number neighbour is 2131.0 m away
- `3593842` CONTRADA BENEFICIO 8: `same_street_outlier`; 2576.3 m from same-street cluster centroid; nearest same-street civic is 2763.5 m away; rare census-cell placement for same-street civics; progressive civic-number neighbour is 2763.5 m away
- `3528302` CONTRADA BUCOLIA DI SOTTO 56: `same_street_outlier`; 3104.8 m from same-street cluster centroid; nearest same-street civic is 2588.2 m away; progressive civic-number neighbour is 2676.2 m away
- `3579202` CONTRADA CANTARELLE 130: `same_street_outlier`; progressive civic-number neighbour is 4391.2 m away
- `3579209` CONTRADA CANTARELLE 83: `same_street_outlier`; progressive civic-number neighbour is 3543.3 m away
- `3532859` CONTRADA CARONTE 35: `same_street_outlier`; progressive civic-number neighbour is 857.5 m away
