import { FeatureCollection, GeoJsonProperties } from "geojson";
import { useEffect, useMemo, useRef, useState } from "react";
import Globe, { GlobeMethods, GlobeProps } from "react-globe.gl";
import {
  CircleGeometry,
  DoubleSide,
  Mesh,
  MeshLambertMaterial,
  MeshPhongMaterial,
  Object3D,
  OctahedronGeometry,
} from "three";
import * as topoJson from "topojson-client";
import { Topology, Objects } from "topojson-specification";
import * as landJson from "world-atlas/land-110m.json";
import { GlobePoint, useAircraftPaths } from "@/hooks/useAircraftPaths";

function calculateDisplayAltitude(alt: number) {
  const EARTH_RADIUS_KM = 6371;
  const KM_IN_M = 0.001;
  const ALTITUDE_SCALE_FACTOR = 10;
  return (alt * KM_IN_M * ALTITUDE_SCALE_FACTOR) / EARTH_RADIUS_KM + 0.012;
}

function getTooltip(content: string) {
  return `<div style='color: red; background-color: white; padding: 2px 8px 2px 8px; border-radius: 2px; font-weight: bold'>${content}</div>`;
}

// TODO:
// - Increase scroll sensitivity for zoom -- takes too long to zoom in
// - Update path lines and plane markers to be prettier
function HollowGlobe(props: GlobeProps) {
  // Ref to actual Globe element for debugging
  const globeRef = useRef<GlobeMethods>();

  // Stores the ICAO24 code of the hovered marker/path
  const [hovered, setHovered] = useState("");

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
  const pathColor = "orangered";
  const hoverColor = "blue";

  // TODO: scale these based on initial globe size (in case container grows/shrinks)
  // NOTE that onObjectHover does not support functions that return memoized instances of Mesh, only new Mesh objects.
  // If no hover behavior is needed, memoize the entire mesh.
  const aircraftGeometry = useMemo(() => new OctahedronGeometry(0.4), []);
  const aircraftMaterial = useMemo(
    () =>
      new MeshLambertMaterial({
        color: pathColor,
      }),
    [],
  );

  const aircraftMaterialHover = useMemo(
    () => new MeshLambertMaterial({ color: hoverColor }),
    [],
  );

  const objRepresent = (d: (GlobePoint & Object3D) | null) => {
    const material =
      d && d.label && d.label === hovered
        ? aircraftMaterialHover
        : aircraftMaterial;
    return new Mesh(aircraftGeometry, material);
  };

  // Aircraft position data retrieval & processing
  const { paths } = useAircraftPaths();
  const displayPaths = Object.values(paths);
  const currentPositions = displayPaths.map((path) => path[path.length - 1]);
  console.log(paths);

  return (
    <Globe
      ref={globeRef}
      backgroundColor="black"
      showGlobe={true}
      globeMaterial={globeMaterial}
      showAtmosphere={false}
      polygonsData={landPolygons}
      polygonCapMaterial={polygonsMaterial}
      polygonSideColor={() => "rgba(0, 0, 0, 0)"}
      polygonAltitude={0.01} // defaults to 0.01 -- marker altitude needs to be adjusted when using a nonzero value
      objectsData={currentPositions}
      objectLabel={(d) => getTooltip((d as GlobePoint).label)}
      objectLat={"latitude"}
      objectLng={"longitude"}
      objectAltitude={(d) =>
        calculateDisplayAltitude((d as GlobePoint).altitude)
      }
      objectThreeObject={(d) =>
        objRepresent(d as (Object3D & GlobePoint) | null)
      }
      // @ts-expect-error incorrect package type -- supports setState<Object3D>
      onObjectHover={(d) => setHovered(d?.label)}
      pathsData={displayPaths}
      pathPoints={(d) => {
        return (d as GlobePoint[]).map((pt) => {
          return [pt.latitude, pt.longitude, pt.altitude];
        });
      }}
      pathPointAlt={(pnt) => calculateDisplayAltitude(pnt[2])}
      pathTransitionDuration={0}
      // @ts-expect-error incorrect package type
      pathColor={(d: GlobePoint[]) =>
        d[0].label === hovered ? hoverColor : pathColor
      }
      pathLabel={(d) => getTooltip((d as GlobePoint[])[0].label)}
      onPathHover={(d) => {
        const t = d as GlobePoint[] | null;
        setHovered(t ? t[0].label : "");
      }}
      {...props}
    />
  );
}

export { HollowGlobe };
