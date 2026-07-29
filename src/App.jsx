import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import LeafletMap from "./components/LeafletMap";

function App() {
  const [nearestPoint, setNearestPoint] = useState(undefined)
  const [nearestNextPoint, setNearestNextPoint] = useState(undefined)
  const [loading, setLoading] = useState(false)
  const [stations, setStations] = useState([])
  const [stationsLoading, setStationsLoading] = useState(false)
  const [nearestStationObservations, setNearestStationObservations] = useState({
    met: undefined,
    tidewater: undefined,
    metStation: undefined,
    tidewaterStation: undefined,
  })

  const [debug, setDebug] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarResetToken, setSidebarResetToken] = useState(0)
  const [sidebarSuppressNextMapClickToken, setSidebarSuppressNextMapClickToken] = useState(0)
  const [forecast, setForecast] = useState(undefined)
  const [score, setScore] = useState(0)
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('https://dswx6vubccbkr.cloudfront.net/enriched/coast-points-simple-full.json')
      const json = await res.json()
      setForecast(json);
    }
    fetchData()
  }, [])

  useEffect(() => {
    const fetchStations = async () => {
      setStationsLoading(true)
      try {
        const res = await fetch('https://dswx6vubccbkr.cloudfront.net/raw/stations.json')
        const json = await res.json()
        setStations(json.met.concat(json.tidewater))
      } catch (error) {
        console.log('Failed to fetch stations', error)
        setStations([])
      } finally {
        setStationsLoading(false)
      }
    }

    fetchStations()
  }, [])

  useEffect(() => {
    if (!nearestPoint) {
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      setSidebarOpen(true);
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
      <Sidebar
        loading={loading}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        nearestStationObservations={nearestStationObservations}
        onOutsideClose={(source) => {
          setSidebarResetToken((current) => current + 1)
          if (source === 'outside') {
            setSidebarSuppressNextMapClickToken((current) => current + 1)
          }
        }}
        score={score}
      />
      <LeafletMap
        debug={debug}
        nearestPoint={nearestPoint}
        setNearestPoint={setNearestPoint}
        nearestNextPoint={nearestNextPoint}
        setNearestNextPoint={setNearestNextPoint}
        stations={stations}
        stationsLoading={stationsLoading}
        onNearestStationObservationsChange={setNearestStationObservations}
        sidebarResetToken={sidebarResetToken}
        sidebarSuppressNextMapClickToken={sidebarSuppressNextMapClickToken}
        forecast={forecast}
        setScore={setScore}
      />
    </React.Fragment>
  );
}

export default App;
