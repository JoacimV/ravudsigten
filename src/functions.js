import { along } from "@turf/along";
import { multiPolygon, point, lineString } from "@turf/helpers";
import { featureCollection } from "@turf/helpers";
import { nearestPointOnLine } from "@turf/nearest-point-on-line";
import { length } from "@turf/length";
import dk from "./resources/geojson/denmark-coastal-line.json" with { type: "json" };

export const findNearestCoastline = (position) => {
    const p = point([position.lng, position.lat]);

    // Antager dk.features[0] er en MultiPolygon
    const coastline = multiPolygon(dk.features[0].geometry.coordinates);

    // Opret LineStrings for alle outer rings
    const lineStrings = coastline.geometry.coordinates.map((poly) => lineString(poly[0]));

    // Find det absolut nærmeste punkt på tværs af alle kystlinje-segmenter
    let nearest = null;
    let minDistance = Infinity;

    for (const line of lineStrings) {
        const np = nearestPointOnLine(line, p);
        if (np.properties.dist < minDistance) {
            minDistance = np.properties.dist;
            nearest = { np, line };
        }
    }

    if (!nearest) return null;

    const { np, line } = nearest;

    // --- SIKKER MÅDE AT FINDE "NÆSTE PUNKT" PÅ ---
    // np.properties.location angiver afstanden fra starten af linjen i miles/km
    const lineLen = length(line, { units: 'meters' });
    const currentDistOnLine = np.properties.location * 1000; // konverter til meter hvis location er i km

    // Bevæg dig 1 meter frem ad linjen (eller 1 meter tilbage, hvis vi er ved vejs ende)
    const targetDist = (currentDistOnLine + 1 <= lineLen)
        ? currentDistOnLine + 1
        : Math.max(0, currentDistOnLine - 1);

    const np2 = along(line, targetDist, { units: 'meters' });

    return {
        nearestPoint: {
            lat: np.geometry.coordinates[1],
            lng: np.geometry.coordinates[0]
        },
        nearestNextPoint: {
            lat: np2.geometry.coordinates[1],
            lng: np2.geometry.coordinates[0]
        }
    };
};
// export const findNearestCoastline = (position) => {
//     console.log(position)
//     const p = point([position.lng, position.lat]);
//     // Load the coastline GeoJSON data
//     const coastline = multiPolygon(dk.features[0].geometry.coordinates);
//     // Find the nearest point on the coastline
//     const lineStrings = [];
//     for (const feater of coastline.geometry.coordinates) {
//         lineStrings.push(lineString(feater[0]));
//     }

//     const nps = [];
//     for (const line of lineStrings) {
//         nps.push({ np: nearestPointOnLine(line, p), line });
//     }

//     // Find the point with the shortest distance to the position, look at np.properties.dist for the distance
//     const np = nps.reduce((nearest, point) => {
//         if (!nearest || point.np.properties.dist < nearest.np.properties.dist) {
//             return point;
//         }
//         return nearest;
//     }, undefined);

//     const split = lineSplit(np.line, np.np);
//     console.log(split);
//     const l = booleanPointOnLine(np.np, split.features[0], { ignoreEndVertices: true }) ? split.features[0] : split.features[1];
//     console.log(l);
//     const np2 = along(l, 1, { units: 'meters' });
//     return { split, nearestPoint: { lat: np.np.geometry.coordinates[1], lng: np.np.geometry.coordinates[0] }, nearestNextPoint: { lat: np2.geometry.coordinates[1], lng: np2.geometry.coordinates[0] } }
// }

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

const toRadians = (degrees) => (degrees * Math.PI) / 180;

const haversineDistanceKm = (from, to) => {
    const earthRadiusKm = 6371;
    const dLat = toRadians(to.lat - from.lat);
    const dLng = toRadians(to.lng - from.lng);

    const lat1 = toRadians(from.lat);
    const lat2 = toRadians(to.lat);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadiusKm * c;
};

export const findNearestStation = (position, stations = [], source) => {
    if (!position || !Number.isFinite(position.lat) || !Number.isFinite(position.lng)) {
        return undefined;
    }

    const candidates = stations.filter((station) => {
        if (!Number.isFinite(Number(station?.latitude)) || !Number.isFinite(Number(station?.longitude))) {
            return false;
        }

        if (!source) {
            return true;
        }

        return station.source === source;
    });

    if (candidates.length === 0) {
        return undefined;
    }

    let nearest = undefined;
    let nearestDistanceKm = Number.POSITIVE_INFINITY;

    for (const station of candidates) {
        const distanceKm = haversineDistanceKm(
            { lat: position.lat, lng: position.lng },
            { lat: Number(station.latitude), lng: Number(station.longitude) }
        );

        if (distanceKm < nearestDistanceKm) {
            nearest = station;
            nearestDistanceKm = distanceKm;
        }
    }

    if (!nearest) {
        return undefined;
    }

    return {
        ...nearest,
        distanceKm: nearestDistanceKm,
    };
};

export const findNearestMetStation = (position, stations = []) => {
    const nearest = findNearestStation(position, stations, "met");
    return nearest;
}

export const findNearestTideStation = (position, stations = []) =>
    findNearestStation(position, stations, "tidewater");
