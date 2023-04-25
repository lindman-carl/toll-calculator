import { z } from "zod";

import { Vehicle } from "@/types";
import {
  getDateString,
  getMinutesSinceMidnight,
  getMinutesElapsed,
} from "../utils";

import {
  TOLL_FREE_VEHICLE_TYPES,
  TOLL_FREE_DATES,
  TOLL_FREE_WEEKDAYS,
  TOLL_FEE_INTERVAL_START_BY_MINUTE,
  TOLL_PERIOD_LENGTH,
  DAILY_TOLL_FEE_LIMIT,
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

export const calculateVehicleTollFee = (vehicle: Vehicle) => {
  // O(n) time complexity, n = number of dates passed toll

  // input validation
  if (!vehicle) {
    throw new Error("No vehicle");
  }

  // toll free vehicles = 0
  if (isTollFreeVehicleType(vehicle)) {
    return 0;
  }

  // check if the vehicle has passed any tolls
  if (vehicle.tollPassDates.length === 0) {
    return 0;
  }

  // toll fees per day, { "12/24": 45 }
  const accTollFeeByDay = new Map<string, number>();

  // sort dates passed toll by date, ascending
  const sortedTollPassDates = vehicle.tollPassDates.sort((a, z) => {
    return a.getTime() - z.getTime();
  });

  // init with the first toll pass
  let periodStartDate: Date = sortedTollPassDates[0];
  let periodHighestFee = getTollFeeByDate(periodStartDate);

  // iterate the other dates, starting from the second
  for (const date of sortedTollPassDates.slice(1)) {
    const tollFee = getTollFeeByDate(date);

    const minutesSincePeriodStartDate = getMinutesElapsed(
      periodStartDate,
      date
    );

    if (minutesSincePeriodStartDate <= TOLL_PERIOD_LENGTH) {
      // within time period
      // get the highest toll fee for the time period
      periodHighestFee = Math.max(periodHighestFee, tollFee);
    } else {
      // time period has ended
      // add the highest toll fee for the time period to the accumulated toll fees for the day

      const periodStartDateString = getDateString(periodStartDate);
      const accTollFee = accTollFeeByDay.get(periodStartDateString);
      if (accTollFee) {
        accTollFeeByDay.set(
          periodStartDateString,
          accTollFee + periodHighestFee
        );
      } else {
        accTollFeeByDay.set(periodStartDateString, periodHighestFee);
      }

      // start a new time period
      periodStartDate = date;
      periodHighestFee = tollFee;
    }
  }

  // add the last period's toll fee
  const periodStartDateString = getDateString(periodStartDate);
  const accTollFee = accTollFeeByDay.get(periodStartDateString);
  if (accTollFee) {
    accTollFeeByDay.set(periodStartDateString, accTollFee + periodHighestFee);
  } else {
    accTollFeeByDay.set(periodStartDateString, periodHighestFee);
  }

  // sum the accumulated toll fee for every day
  // limit each day to the daily toll fee limit
  const totalFees = [...accTollFeeByDay.values()].reduce(
    (acc, fee) => acc + Math.min(fee, DAILY_TOLL_FEE_LIMIT),
    0
  );

  return totalFees;
};
