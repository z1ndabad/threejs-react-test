import { useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import { OpenSkyResponse } from "./opensky";

function useAircraftPositions() {
  // TODO: Remember to replace prod API endpoint with wss:// for SSL
  const socketUrl = "ws://localhost:3000";
  const [aircraftData, setAircraftData] = useState<OpenSkyResponse>({
    time: -1,
    states: [],
  });
  const { lastMessage } = useWebSocket(socketUrl);

  useEffect(() => {
    if (lastMessage) {
      setAircraftData(JSON.parse(lastMessage.data));
    }
  }, [lastMessage]);

  return { aircraftData };
}

export { useAircraftPositions };
