import { FeatureCollection, GeoJsonProperties } from "geojson";
import { useEffect, useMemo, useRef, useState } from "react";
import Globe, { GlobeMethods, GlobeProps } from "react-globe.gl";
import {
  CircleGeometry,
  DoubleSide,
  Mesh,
  MeshLambertMaterial,
  MeshPhongMaterial,
  OctahedronGeometry,
} from "three";
import * as topoJson from "topojson-client";
import { Topology, Objects } from "topojson-specification";
import * as landJson from "world-atlas/land-110m.json";
import { OpenSkyResponse, StateVector } from "@/api/opensky";
import { useAircraftPositions } from "@/api/socket";

type PathSet = { [key: string]: Omit<GlobePoint, "label">[][] };

type GlobePoint = {
  label: string;
  longitude: number;
  latitude: number;
  altitude: number;
};

function HollowGlobe(props: GlobeProps) {
  // Ref to actual Globe element for debugging
  const globeRef = useRef<GlobeMethods>();

  // Globe materials
  const globeMaterial = useMemo(
    () =>
      new MeshPhongMaterial({
        color: "black",
        transparent: true,
        opacity: 0.95,
      }),
    [],
  );

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

  // Aircraft drawings
  const aircraftMarker = useMemo(() => {
    // TODO: scale these based on initial globe size (in case container grows/shrinks)
    const aircraftGeometry = new OctahedronGeometry(0.25);
    const aircraftMaterial = new MeshLambertMaterial({ color: "red" });
    return new Mesh(aircraftGeometry, aircraftMaterial);
  }, []);

  // Aircraft position data retrieval & processing
  const { states, paths } = useAircraftPositions();
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

  useEffect(() => {
    if (globeRef.current) {
      const scene = globeRef.current.scene;
      console.log("SCENE");
      console.log(scene().toJSON());
    }
  }, [positions]);

  // console.log("PATHS");
  // console.log(paths);

  //THEN: add paths
  //use the Paths layer
  //For every aircraft, each tick add a new [lng, lat, alt] to its paths array
  //Likely need to convert aircraft details into an object for fast access -- ew!

  return (
    <Globe
      ref={globeRef}
      backgroundColor="black" // TODO: theme this later
      showGlobe={true}
      globeMaterial={globeMaterial}
      showAtmosphere={false}
      polygonsData={landPolygons}
      polygonCapMaterial={polygonsMaterial}
      polygonSideColor={() => "rgba(0, 0, 0, 0)"}
      polygonAltitude={0.01} // defaults to 0.01 -- marker altitude needs to be adjusted when using a nonzero value
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
      pathsData={Object.values(paths)}
      pathPoints={(d) => {
        // console.log("ACCESSOR");
        // console.log(d);
        return d.map((vec) => {
          return [vec.latitude, vec.longitude, vec.geo_altitude];
        });
      }}
      // pathPointAlt={(pnt) => pnt[2]}
      {...props}
    />
  );
}

export { HollowGlobe };
