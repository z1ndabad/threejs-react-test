import { FeatureCollection, GeoJsonProperties } from "geojson";
import { useEffect, useMemo, useRef } from "react";
import Globe, { GlobeMethods, GlobeProps } from "react-globe.gl";
import {
  CircleGeometry,
  DoubleSide,
  Mesh,
  MeshLambertMaterial,
  OctahedronGeometry,
} from "three";
import * as topoJson from "topojson-client";
import { Topology, Objects } from "topojson-specification";
import * as landJson from "world-atlas/land-110m.json";
import { OpenSkyResponse, StateVector } from "@/api/opensky";
import { useAircraftPositions } from "@/api/socket";

type GlobePoint = {
  label: string;
  longitude: number;
  latitude: number;
  altitude: number;
};

// TODO - bug: incorrect number of 3D object markers render on the globe. Verified that
// the correct # of datapoints is passed to the Scene, and that it works properly using
// HTML element markers instead of 3D objects
function HollowGlobe(props: GlobeProps) {
  const landFeatures = useMemo(() => {
    return topoJson.feature(
      landJson as unknown as Topology<Objects<GeoJsonProperties>>,
      //@ts-expect-error String literal union expected
      landJson.objects.land,
    ) as unknown as FeatureCollection;
  }, []);

  const landPolygons = landFeatures.features;
  const polygonsMaterial = new MeshLambertMaterial({
    color: "white",
    side: DoubleSide,
  });

  const { aircraftData } = useAircraftPositions();
  // TODO: add persisent labels layer?
  // TODO: positions are not reliable -- when a plane leaves the array, we should assume it keeps going the same directions
  // also, why are they not really moving? Do I need a longer monitoring window?
  const positions: GlobePoint[] = aircraftData.states.map(
    ({ icao24, latitude, longitude, baro_altitude }) => {
      return {
        label: icao24 ?? "",
        latitude: latitude ?? 0,
        longitude: longitude ?? 0,
        altitude: baro_altitude ?? 0,
      };
    },
  );
  console.log(aircraftData);
  const globeRef = useRef<GlobeMethods>();

  const aircraftMarker = useMemo(() => {
    // TODO: scale these based on initial globe size (in case container grows/shrinks)
    const aircraftGeometry = new OctahedronGeometry(0.25);
    const aircraftMaterial = new MeshLambertMaterial({ color: "red" });
    return new Mesh(aircraftGeometry, aircraftMaterial);
  }, [aircraftData]);

  useEffect(() => {
    if (globeRef.current) {
      const scene = globeRef.current.scene;
      console.log("SCENE");
      console.log(scene().toJSON());
    }
  }, [positions]);

  const markerSvg = `<svg viewBox="-4 0 36 36">
    <path fill="currentColor" d="M14,0 C21.732,0 28,5.641 28,12.6 C28,23.963 14,36 14,36 C14,36 0,24.064 0,12.6 C0,5.641 6.268,0 14,0 Z"></path>
    <circle fill="black" cx="14" cy="14" r="7"></circle>
  </svg>`;

  return (
    <Globe
      ref={globeRef}
      backgroundColor="black" // TODO: theme this later
      showGlobe={false}
      showAtmosphere={false}
      polygonsData={landPolygons}
      polygonCapMaterial={polygonsMaterial}
      polygonSideColor={() => "rgba(0, 0, 0, 0)"}
      polygonAltitude={0} // defaults to 0.01 -- marker altitude needs to be adjusted when using a nonzero value
      htmlElementsData={positions}
      htmlLat={"latitude"}
      htmlLng={"longitude"}
      htmlElement={() => {
        const el = document.createElement("div");
        el.innerHTML = markerSvg;
        el.style.color = "red";
        el.style.width = "10px";
        return el;
      }}
      htmlTransitionDuration={2000}
      {...props}
    />
  );
}

export { HollowGlobe };
