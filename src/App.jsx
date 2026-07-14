import React, { useState, useEffect } from "react";
import { bearingToAzimuth, point } from "@turf/helpers";
import { bearing } from "@turf/bearing";
import { findNearestMunicipality } from "./functions";
import Sidebar from "./components/Sidebar";
import LeafletMap from "./components/LeafletMap";

function App() {
  const [bbox, setBbox] = useState([0, 0, 0, 0]);
  const [tiderWaterStationName, setTiderWaterStationName] = useState(undefined);
  const [lowSpots, setLowSpots] = useState([])
  const [nearestPoint, setNearestPoint] = useState(undefined)
  const [nearestNextPoint, setNearestNextPoint] = useState(undefined)
  const [currentWind, setCurrentWind] = useState(undefined)
  const [loading, setLoading] = useState(false)

  const [debug, setDebug] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!nearestPoint) {
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      setSidebarOpen(true);
      const municipality = findNearestMunicipality(nearestPoint)
      if (!municipality) {
        setLoading(false);
        return;
      }
      const azimuth = bearingToAzimuth(bearing(point([nearestPoint.lng, nearestPoint.lat]), point([nearestNextPoint.lng, nearestNextPoint.lat])));
      const res = await fetch(`https://hayxmiy9qg.execute-api.eu-north-1.amazonaws.com/forecast?&position=${JSON.stringify({ longitude: nearestPoint.lng, latitude: nearestPoint.lat })}&municipalityId=${municipality.MunicipalityID}&azimuth=${azimuth}`);
      const json = await res.json();
      if (json.message) { // Something bad happened
        console.log(json.message);
        setLoading(false);
        return;
      }
      setBbox(json.boundingBox);
      setLowSpots(json.spots)
      setTiderWaterStationName(json.tiderWaterStationName);
      setCurrentWind(json.currentWind);
      setLoading(false);
    }
    fetchData();
  }, [nearestPoint, nearestNextPoint])

  // Add key listener to toggle debug mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'd') {
        setDebug(debug => !debug)
      }
    }
    document.addEventListener('keyup', handleKeyDown, true)
    return () => {
      document.removeEventListener('keyup', handleKeyDown, true)
    }
  }, [])

  return (
    <React.Fragment>
      <Sidebar currentWind={currentWind} loading={loading} lowSpots={lowSpots} tiderWaterStationName={tiderWaterStationName} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <LeafletMap
        debug={debug}
        nearestPoint={nearestPoint}
        setNearestPoint={setNearestPoint}
        nearestNextPoint={nearestNextPoint}
        setNearestNextPoint={setNearestNextPoint}
        setBbox={setBbox}
        bbox={bbox}
      />
    </React.Fragment>
  );
}

export default App;
