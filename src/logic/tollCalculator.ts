import { z } from "zod";

import { Vehicle } from "@/types";
import { TOLL_FREE_VEHICLE_TYPES } from "../tollConfig.json";

// map toll free vehicle types for O(1) time complexity
const TOLL_FREE_VEHICLE_TYPES_MAP = new Map(
  TOLL_FREE_VEHICLE_TYPES.map((el: string) => [el, true])
);

export const isTollFreeVehicleType = (vehicle: Vehicle): boolean => {
  // returns true if vehicle type is toll free
  // TOLL_FREE_VEHICLE_TYPES are defined in tollConfig.json
  // O(1) time complexity

  // input validation
  const vehicleSchema = z.object({
    type: z.string().nonempty(),
  });
  try {
    vehicleSchema.parse(vehicle);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(error);
    }

    // invalid input is not toll free
    return false;
  }

  // check map for vehicle type
  return TOLL_FREE_VEHICLE_TYPES_MAP.has(vehicle.type);
};
