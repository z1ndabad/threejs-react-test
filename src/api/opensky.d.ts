export type OpenSkyResponse = {
  time: number;
  states: StateVector[];
};

export type StateVector = {
  icao24: string;
  callsign: string;
  origin_country: string;
  time_position: number;
  last_contact: number;
  longitude: number;
  latitude: number;
  baro_altitude: number;
  on_ground: boolean;
  velocity: number;
  true_track: number;
  vertical_rate: number;
  sensors: number[];
  geo_altitude: number;
  squawk: string;
  spi: boolean;
  position_source: number;
  category: number;
};
