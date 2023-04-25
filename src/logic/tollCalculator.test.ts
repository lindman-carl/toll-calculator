import { isTollFreeVehicleType } from "./tollCalculator";
import { TOLL_FREE_VEHICLE_TYPES } from "../tollConfig.json";
import { Vehicle } from "@/types";

describe("isTollFreeVehicleType", () => {
  test("should return true for all vehicles with a type found in TOLL_FREE_VEHICLE_TYPES", () => {
    for (const type of TOLL_FREE_VEHICLE_TYPES) {
      const isTollFree = isTollFreeVehicleType({
        type,
        tollPassDates: [],
      } as Vehicle);
      expect(isTollFree).toBe(true);
    }
  });
  test("should return false for all vehicle types not found in TOLL_FREE_VEHICLE_TYPES", () => {
    const nonTollFreeVehicleTypes = [
      "car",
      "bus",
      "truck",
      "skateboard",
      "boat",
    ];

    for (const type of nonTollFreeVehicleTypes) {
      const isTollFree = isTollFreeVehicleType({
        type,
        tollPassDates: [],
      } as Vehicle);
      expect(isTollFree).toBe(false);
    }
  });
  test("should return false for vehicles with an empty type", () => {
    const isTollFree = isTollFreeVehicleType({
      type: "",
      tollPassDates: [],
    } as Vehicle);
    expect(isTollFree).toBe(false);
  });
});
