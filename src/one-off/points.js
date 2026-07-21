import fs from "node:fs/promises";
// import municipalities from "../resources/geojson/municipalities.json" with { type: "json" };

import { point } from "@turf/helpers";
import { bearing } from "@turf/bearing";
import { bearingToAzimuth } from "@turf/helpers";
import { bboxPolygon } from "@turf/bbox-polygon";
import { multiPolygon } from "@turf/helpers";
import booleanOverlap from "@turf/boolean-overlap";

const inputPath = "./coast-points.json";
const outputPath = "./coast-points-enriched.json";

const municipalities = JSON.parse(await fs.readFile("../resources/geojson/municipalities.json", "utf8"));
const raw = await fs.readFile(inputPath, "utf8");
const points = JSON.parse(raw);

const findNearestMunicipality = (position) => {
    // Create a bounding box around the position
    const dist = 0.02; // 2 km
    const bbox = new bboxPolygon([
        position.lng - dist,
        position.lat - dist,
        position.lng + dist,
        position.lat + dist
    ]);
    const geojson = multiPolygon(municipalities)
    let nearest;
    // Find the nearest municipality to the position
    for (const municipality of geojson.geometry.coordinates.features) {
        // Check if the position is inside the municipality
        const overlaps = booleanOverlap(municipality, bbox);
        if (overlaps) {
            nearest = municipality.properties
        }
    }
    return nearest;
}


function findAzimuth(index, allPoints) {
    const current = allPoints[index];
    const prev = allPoints[index - 1];
    const next = allPoints[index + 1];

    if (prev && next) {
        return bearingToAzimuth(
            bearing(
                point([prev.longitude, prev.latitude]),
                point([next.longitude, next.latitude])
            )
        );
    }

    if (next) {
        return bearingToAzimuth(
            bearing(
                point([current.longitude, current.latitude]),
                point([next.longitude, next.latitude])
            )
        );
    }

    if (prev) {
        return bearingToAzimuth(
            bearing(
                point([prev.longitude, prev.latitude]),
                point([current.longitude, current.latitude])
            )
        );
    }

    return null;
}

const enriched = points.map((item, index, allPoints) => ({
    ...item,
    azimuth: findAzimuth(index, allPoints),
    municipalityId: findNearestMunicipality({ lng: item.longitude, lat: item.latitude }),
}));

await fs.writeFile(outputPath, JSON.stringify(enriched, null, 2), "utf8");

console.log(`Wrote ${enriched.length} enriched points to ${outputPath}`);