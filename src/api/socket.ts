import { useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import { Ensure } from "@/util/types";
import { OpenSkyResponse, StateVector } from "./opensky";

type DisplayableVector = Ensure<
  StateVector,
  "longitude" | "latitude" | "geo_altitude"
>;

export type AircraftPositions = Pick<OpenSkyResponse, "time"> & {
  states: DisplayableVector[];
};

function cleanStateVectors(vec: StateVector): boolean {
  return (
    vec.longitude !== null &&
    vec.longitude !== undefined &&
    vec.latitude !== null &&
    vec.latitude !== undefined &&
    vec.geo_altitude !== null &&
    vec.geo_altitude !== undefined
  );
}

function useAircraftPositions(): AircraftPositions {
  // TODO: Remember to replace prod API endpoint with wss:// for SSL
  const socketUrl = "ws://localhost:3000";
  const [data, setData] = useState<AircraftPositions>({
    time: -1,
    states: [],
  });
  const { lastMessage } = useWebSocket(socketUrl);

  useEffect(() => {
    if (lastMessage) {
      const parsed = JSON.parse(lastMessage.data) as OpenSkyResponse;
      const cleaned = parsed.states.filter(
        cleanStateVectors,
      ) as DisplayableVector[];
      setData({ time: parsed.time, states: cleaned });
    }
  }, [lastMessage]);

  return {
    time: data.time,
    states: data.states,
  };
}

export { useAircraftPositions };
