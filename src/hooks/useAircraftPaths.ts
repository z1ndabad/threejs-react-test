import { useEffect, useState } from "react";
import { OpenSkyResponse } from "@/types/opensky";
import { useFetchAircraftPosiions } from "./useFetchAircraftPositions";

export type GlobePoint = {
  label: string;
  longitude: number;
  latitude: number;
  altitude: number;
  rotation: number;
};

export type AircraftPaths = Pick<OpenSkyResponse, "time"> & {
  paths: {
    [key: string]: GlobePoint[];
  };
};

function useAircraftPaths(): AircraftPaths {
  // TODO: Remember to replace prod API endpoint with wss:// for SSL
  const [data, setData] = useState<AircraftPaths>({
    time: -1,
    paths: {},
  });
  const { time, states } = useFetchAircraftPosiions();

  useEffect(() => {
    const newPaths = states.reduce(
      (acc, curr) => {
        const update: GlobePoint = {
          label: curr.icao24,
          longitude: curr.longitude,
          latitude: curr.latitude,
          altitude: curr.geo_altitude,
          rotation: curr.true_track,
        };
        const record = data.paths[update.label];
        if (record) {
          acc[update.label] = [...record, update];
        } else {
          acc[update.label] = [update];
        }
        return acc;
      },
      {} as AircraftPaths["paths"],
    );

    setData({
      time: time,
      paths: newPaths,
    });
  }, [time]);

  return data;
}

export { useAircraftPaths };
