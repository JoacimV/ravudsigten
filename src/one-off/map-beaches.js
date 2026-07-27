import fs from "fs/promises";


async function fetchPlaces(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Kunne ikke hente ${url}`);
    }

    return response.json();
}


function normalizePlaces(data) {
    return data
        .map(x => ({
            name: x.primærtnavn,
            lng: x.visueltcenter[0],
            lat: x.visueltcenter[1]
        }));
}


// Haversine afstand i meter
function distance(lat1, lon1, lat2, lon2) {

    const R = 6371000;

    const p1 = lat1 * Math.PI / 180;
    const p2 = lat2 * Math.PI / 180;

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;


    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(p1) *
        Math.cos(p2) *
        Math.sin(dLon / 2) ** 2;


    return 2 * R * Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
    );
}


function findNearest(point, places) {

    let closest = null;
    let closestDistance = Infinity;


    for (const place of places) {

        const d = distance(
            point.lat,
            point.lng,
            place.lat,
            place.lng
        );


        if (d < closestDistance) {
            closestDistance = d;
            closest = place;
        }
    }


    return {
        name: closest?.name ?? null,
        distance: Math.round(closestDistance)
    };
}


async function main() {

    console.log("Henter data...");


    const beachesRaw = await fetchPlaces(
        "https://api.dataforsyningen.dk/steder?hovedtype=Naturareal&undertype=strand"
    );


    const townsRaw = await fetchPlaces(
        "https://api.dataforsyningen.dk/steder?hovedtype=Bebyggelse&undertype=by"
    );


    const beaches = normalizePlaces(beachesRaw);
    const towns = normalizePlaces(townsRaw);


    console.log(
        `Strande: ${beaches.length}, Byer: ${towns.length}`
    );


    const coastPoints = JSON.parse(
        await fs.readFile(
            "coast_points.json",
            "utf8"
        )
    );


    const output = [];


    let count = 0;

    for (const p of coastPoints) {
        // Map p to point   {
        //     "type": "Feature",
        //     "properties": {},
        //     "geometry": {
        //       "type": "Point",
        //       "coordinates": [
        //         11.153274042433033,
        //         55.33602524814464
        //       ]
        //     }
        //   },
        const point = {
            lat: p.geometry.coordinates[1],
            lng: p.geometry.coordinates[0]
        };
        const beach = findNearest(
            point,
            beaches
        );


        const town = findNearest(
            point,
            towns
        );


        output.push({
            ...point,

            strand: beach.name,
            strandDistance: beach.distance,

            by: town.name,
            byDistance: town.distance
        });


        count++;

        if (count % 1000 === 0) {
            console.log(`${count}/${coastPoints.length}`);
        }
    }


    await fs.writeFile(
        "coast_locations.json",
        JSON.stringify(output, null, 2)
    );


    console.log("Færdig!");
}


main();