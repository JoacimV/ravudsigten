import coastLines from "./test1.json" with { type: "json" };
import landGeoJSON from "./land.json" with { type: "json" };
import Flatbush from 'flatbush';
import * as turf from '@turf/turf';
import points from "./coast_points.json" with { type: "json" };
import fs from "fs";
import stations from "./stations.json" with { type: "json" };

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
const findNearestStation = (position, stations = [], source) => {
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
// ==========================================
// 1. BYG SPATIAL INDEX (Køres én gang ved opstart)
// ==========================================
export function buildCoastlineIndex(coastlinesGeoJSON) {
    const index = new Flatbush(coastlinesGeoJSON.features.length);

    for (const feature of coastlinesGeoJSON.features) {
        const bbox = turf.bbox(feature); // [minX, minY, maxX, maxY]
        index.add(bbox[0], bbox[1], bbox[2], bbox[3]);
    }
    index.finish();
    return index;
}

// ==========================================
// 2. TJEK OM PUNKT ER INDE I ET LAND-POLYGON
// ==========================================
function isPointInLand(point, landGeoJSON) {
    if (!landGeoJSON || !landGeoJSON.features) return false;

    // Løber igennem alle øer/land-polygoner i din FeatureCollection
    return landGeoJSON.features.some((feature) => {
        const geomType = feature.geometry?.type;
        if (geomType === 'Polygon' || geomType === 'MultiPolygon') {
            return turf.booleanPointInPolygon(point, feature);
        }
        return false;
    });
}

// ==========================================
// 3. SKUDSIKKER BEREGNING AF KYSTAZIMUTH OG OCEAN NORMAL
// ==========================================
export function getCoastlineData(targetPoint, coastlinesGeoJSON, coastlineIndex, landGeoJSON) {
    const [lon, lat] = targetPoint.geometry.coordinates;

    // A. Find de 5 nærmeste bounding boxes via Flatbush
    const candidateIndices = coastlineIndex.neighbors(lon, lat, 5);

    let minDistance = Infinity;
    let nearestFeature = null;

    for (const idx of candidateIndices) {
        const feature = coastlinesGeoJSON.features[idx];
        const dist = turf.pointToLineDistance(targetPoint, feature, { units: 'kilometers' });
        if (dist < minDistance) {
            minDistance = dist;
            nearestFeature = feature;
        }
    }

    if (!nearestFeature) return null;

    // B. Snap punktet til kystlinjen
    const snappedPoint = turf.nearestPointOnLine(nearestFeature, targetPoint);
    const coords = nearestFeature.geometry.coordinates;
    let segmentIndex = snappedPoint.properties.index;

    // Kantsikring: Hvis vi rammer det aller-sidste punkt i koordinat-arrayet
    if (segmentIndex >= coords.length - 1) {
        segmentIndex = coords.length - 2;
    }
    if (segmentIndex < 0) return null;

    const p1 = turf.point(coords[segmentIndex]);
    const p2 = turf.point(coords[segmentIndex + 1]);

    // C. Beregn kystens langsgående azimuth (0-360 grader)
    let coastAzimuth = turf.bearing(p1, p2);
    if (coastAzimuth < 0) coastAzimuth += 360;

    // D. Beregn de to vinkelrette muligheder (Højre og Venstre)
    const rightNormal = (coastAzimuth + 90) % 360;
    const leftNormal = (coastAzimuth - 90 + 360) % 360;

    // E. Test et punkt 10 meter (0.1 km) til HØJRE for kystlinjen
    const testPointRight = turf.destination(snappedPoint, 0.1, rightNormal, { units: 'kilometers' });

    // F. Tjek om test-punktet rammer en af land-featurene
    const isRightLand = isPointInLand(testPointRight, landGeoJSON);

    // Hvis højre side er LAND, må venstre side være VAND (oceanNormal) — og omvendt!
    const oceanNormal = isRightLand ? leftNormal : rightNormal;

    return {
        coastAzimuth: coastAzimuth,            // Retning langsgående ad kysten (fx 198°)
        oceanNormal: oceanNormal,              // Retning direkte vinkelret ud mod havet (fx 108°)
        snappedCoordinates: snappedPoint.geometry.coordinates,
        distanceKm: minDistance
    };
}

// ==========================================
// 4. KORREKT PAALANDSVIND-TJEK
// ==========================================
// export const calculateIsOnshore = (oceanNormal, windDirection) => {
//     // Find den mindste vinkelforskel (0-180 grader) mellem oceanNormal og windDirection
//     let diff = Math.abs(oceanNormal - windDirection) % 360;
//     if (diff > 180) {
//         diff = 360 - diff;
//     }

//     // Hvis vinden blæser FRA havet (inden for 90 grader af oceanNormal), er det pålandsvind!
//     return diff < 90;
// };

// 1. Ved opstart af appen (køres kun én gang)
const coastlineIndex = buildCoastlineIndex(coastLines);
const newPoints = []
for (const point of points) {
    const coastData = getCoastlineData(point, coastLines, coastlineIndex, landGeoJSON);
    if (coastData) {
        // console.log(`Kystens retning: ${coastData.coastAzimuth.toFixed(1)}°`);
        // console.log(`Retning mod havet: ${coastData.oceanNormal.toFixed(1)}°`);
        newPoints.push({
            longitude: coastData.snappedCoordinates[0],
            latitude: coastData.snappedCoordinates[1],
            azimuth: coastData.oceanNormal,
            metStation: findNearestStation({ lat: coastData.snappedCoordinates[1], lng: coastData.snappedCoordinates[0] }, stations.met, "met").stationId
        });
    } else {
        console.log(`Ingen kystdata fundet for punkt: ${point.geometry.coordinates}`);
    }
}
fs.writeFileSync("./coast_points_10_with_coastData.json", JSON.stringify(newPoints, null, 2));