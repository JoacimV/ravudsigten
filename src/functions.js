import { along } from "@turf/along";
import { multiPolygon, point, lineString } from "@turf/helpers";
import { featureCollection } from "@turf/helpers";
import { lineSplit } from "@turf/line-split";
import { bboxPolygon } from "@turf/bbox-polygon";
import { booleanPointOnLine } from "@turf/boolean-point-on-line";
import { nearestPointOnLine } from "@turf/nearest-point-on-line";
import { booleanOverlap } from "@turf/boolean-overlap";
import { length } from "@turf/length";
import dk from "./resources/geojson/denmark-coastal-line.json";
import municipalities from "./resources/geojson/municipalities.json";


export const findNearestMunicipality = (position) => {
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

export const findNearestCoastline = (position) => {
    const p = point([position.lng, position.lat]);
    // Load the coastline GeoJSON data
    const coastline = multiPolygon(dk.features[0].geometry.coordinates);
    // Find the nearest point on the coastline
    const lineStrings = [];
    for (const feater of coastline.geometry.coordinates) {
        lineStrings.push(lineString(feater[0]));
    }

    const nps = [];
    for (const line of lineStrings) {
        nps.push({ np: nearestPointOnLine(line, p), line });
    }

    // Find the point with the shortest distance to the position, look at np.properties.dist for the distance
    const np = nps.reduce((nearest, point) => {
        if (!nearest || point.np.properties.dist < nearest.np.properties.dist) {
            return point;
        }
        return nearest;
    }, undefined);

    const split = lineSplit(np.line, np.np);
    const l = booleanPointOnLine(np.np, split.features[0], { ignoreEndVertices: true }) ? split.features[0] : split.features[1];
    const np2 = along(l, 1, { units: 'meters' });
    return { split, nearestPoint: { lat: np.np.geometry.coordinates[1], lng: np.np.geometry.coordinates[0] }, nearestNextPoint: { lat: np2.geometry.coordinates[1], lng: np2.geometry.coordinates[0] } }
}

const addStepPointsForCoordinates = (coordinates, points, distanceKm) => {
    if (!Array.isArray(coordinates) || coordinates.length < 2) {
        return;
    }

    const line = lineString(coordinates);
    const totalDistanceKm = length(line, { units: "kilometers" });

    if (!Number.isFinite(totalDistanceKm) || totalDistanceKm <= 0) {
        return;
    }

    for (let km = 0; km <= totalDistanceKm; km += distanceKm) {
        points.push(along(line, km, { units: "kilometers" }));
    }

    const remainder = totalDistanceKm % distanceKm;
    if (remainder > 1e-9) {
        points.push(along(line, totalDistanceKm, { units: "kilometers" }));
    }
};

export const pointsAlongGeoJson = (geoJson, distanceKm = 1) => {
    if (!geoJson?.features?.length || distanceKm <= 0) {
        return featureCollection([]);
    }

    const points = [];

    for (const feature of geoJson.features) {
        const geometry = feature?.geometry;
        if (!geometry) {
            continue;
        }

        if (geometry.type === "LineString") {
            addStepPointsForCoordinates(geometry.coordinates, points, distanceKm);
            continue;
        }

        if (geometry.type === "MultiLineString") {
            for (const lineCoordinates of geometry.coordinates) {
                addStepPointsForCoordinates(lineCoordinates, points, distanceKm);
            }
            continue;
        }

        if (geometry.type === "Polygon") {
            for (const ringCoordinates of geometry.coordinates) {
                addStepPointsForCoordinates(ringCoordinates, points, distanceKm);
            }
            continue;
        }

        if (geometry.type === "MultiPolygon") {
            for (const polygonCoordinates of geometry.coordinates) {
                for (const ringCoordinates of polygonCoordinates) {
                    addStepPointsForCoordinates(ringCoordinates, points, distanceKm);
                }
            }
        }
    }

    return featureCollection(points);
};
