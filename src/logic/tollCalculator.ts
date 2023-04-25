import { z } from "zod";

import { Vehicle } from "@/types";
import { getDateString, getMinutesSinceMidnight } from "../utils";

import {
  TOLL_FREE_VEHICLE_TYPES,
  TOLL_FREE_DATES,
  TOLL_FREE_WEEKDAYS,
  TOLL_FEE_INTERVAL_START_BY_MINUTE,
} from "../tollConfig.json";

// hash maps for O(1) time complexity
const TOLL_FREE_DATES_MAP = new Map(TOLL_FREE_DATES.map((el) => [el, true]));
const TOLL_FREE_WEEKDAYS_MAP = new Map(
  TOLL_FREE_WEEKDAYS.map((el) => [el, true])
);
const TOLL_FREE_VEHICLE_TYPES_MAP = new Map(
  TOLL_FREE_VEHICLE_TYPES.map((el: string) => [el, true])
);

// functions
export const getTollFeeByDate = (date: Date) => {
  // O(log n) time complexity
  // this could eventually be done with O(1) time complexity by memoizing the toll fee for each minute of the day
  // but the list is small and logarithmic time complexity is fine enough

  const tollPassMinute = getMinutesSinceMidnight(date);
  let tollPassFee = 0;

  // binary search to find the highest toll period that is less than or equal to the current minute of the day
  let leftIndex = 0;
  let rightIndex = TOLL_FEE_INTERVAL_START_BY_MINUTE.length - 1;
  let midIndex = Math.floor((leftIndex + rightIndex) / 2);

  while (leftIndex <= rightIndex) {
    const [intervalStartTime, fee] =
      TOLL_FEE_INTERVAL_START_BY_MINUTE[midIndex];

    if (tollPassMinute >= intervalStartTime) {
      tollPassFee = fee;
      leftIndex = midIndex + 1;
    } else {
      rightIndex = midIndex - 1;
    }

    midIndex = Math.floor((leftIndex + rightIndex) / 2);
  }

  return tollPassFee;
};
export const isTollFreeDate = (date: Date): boolean => {
  // returns true if date is toll free
  // TOLL_FREE_DATES and TOLL_FREE_WEEKDAYS are defined in tollConfig.json
  // O(1) time complexity

  const month = date.getMonth();
  const day = date.getDate();
  const weekday = date.getDay();

  // input validation
  try {
    z.number().min(0).max(11).parse(month);
    z.number().min(1).max(31).parse(day);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(error);
    }

    // invalid input is not a toll free date
    return false;
  }

  // check for toll free weekdays
  if (TOLL_FREE_WEEKDAYS_MAP.has(weekday)) {
    return true;
  }

  const currentDateString = getDateString(date);

  return TOLL_FREE_DATES_MAP.has(currentDateString);
};

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
