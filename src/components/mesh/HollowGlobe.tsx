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
  // Ref to actual Globe element for debugging
  const globeRef = useRef<GlobeMethods>();

  // Landmass drawings
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

  // Aircraft position data retrieval & processing
  const { states } = useAircraftPositions();
  const EARTH_RADIUS_KM = 6371;
  const KM_IN_M = 0.001;
  const ALTITUDE_SCALE_FACTOR = 10;
  const positions: GlobePoint[] = states.map(
    ({ icao24, latitude, longitude, geo_altitude }) => {
      return {
        longitude,
        latitude,
        altitude:
          (geo_altitude * KM_IN_M * ALTITUDE_SCALE_FACTOR) / EARTH_RADIUS_KM,
        label: icao24 ?? "",
      };
    },
  );

  const aircraftMarker = useMemo(() => {
    // TODO: scale these based on initial globe size (in case container grows/shrinks)
    const aircraftGeometry = new OctahedronGeometry(0.25);
    const aircraftMaterial = new MeshLambertMaterial({ color: "red" });
    return new Mesh(aircraftGeometry, aircraftMaterial);
  }, [states]);

  useEffect(() => {
    if (globeRef.current) {
      const scene = globeRef.current.scene;
      console.log("SCENE");
      console.log(scene().toJSON());
    }
  }, [positions]);

  //THEN: add paths
  //use the Paths layer
  //For every aircraft, each tick add a new [lng, lat, alt] to its paths array
  //Likely need to convert aircraft details into an object for fast access -- ew!

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
      objectsData={positions}
      // TODO: theming for accessors
      objectLabel={(d) =>
        `<div style='color: red'>${(d as GlobePoint).label}</div>`
      }
      objectLat={"latitude"}
      objectLng={"longitude"}
      // TODO: figure out correct altitude calculations--passing it directly draws markers in the wrong positons
      objectAltitude={"altitude"}
      objectThreeObject={aircraftMarker}
      {...props}
    />
  );
}

export { HollowGlobe };
