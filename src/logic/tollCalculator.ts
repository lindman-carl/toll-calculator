import { Vehicle } from "@/types";
import { TOLL_FREE_VEHICLE_TYPES } from "../tollConfig.json";

// map toll free vehicle types for O(1) time complexity
const TOLL_FREE_VEHICLE_TYPES_MAP = new Map(
  TOLL_FREE_VEHICLE_TYPES.map((el: string) => [el, true])
);

export const isTollFreeVehicleType = (vehicle: Vehicle) => {
  // O(1) time complexity

  if (!vehicle) {
    throw new Error("No vehicle");
  }

  if (!vehicle.type) {
    throw new Error("No vehicle type");
  }

  return TOLL_FREE_VEHICLE_TYPES_MAP.has(vehicle.type);
};
