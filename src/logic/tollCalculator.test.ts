import { isTollFreeDate, isTollFreeVehicleType } from "./tollCalculator";
import {
  TOLL_FREE_VEHICLE_TYPES,
  TOLL_FREE_DATES,
  TOLL_FREE_WEEKDAYS,
} from "../tollConfig.json";
import { Vehicle } from "@/types";
import { getDateString } from "../utils";

describe("isTollFreedate", () => {
  const tollFreeDatesMap = new Map<string, boolean>();
  for (const date of TOLL_FREE_DATES) {
    tollFreeDatesMap.set(date, true);
  }

  const tollFreeWeekdayDates: Date[] = [];
  for (
    let d = new Date(2021, 0, 1);
    d <= new Date(2021, 11, 31);
    d.setDate(d.getDate() + 1)
  ) {
    if (TOLL_FREE_WEEKDAYS.includes(d.getDay())) {
      tollFreeWeekdayDates.push(d);
      const dateString = getDateString(d);
      tollFreeDatesMap.set(dateString, true);
    }
  }

  test("should return true for all dates in TOLL_FREE_DATES", () => {
    for (const date of TOLL_FREE_DATES) {
      const [month, day] = date.split("/");
      const testDate = new Date(2021, parseInt(month) - 1, parseInt(day), 0, 0);

      const isTollFree = isTollFreeDate(testDate);
      expect(isTollFree).toBe(true);
    }
  });

  test("should return true for all weekend dates", () => {
    for (const date of tollFreeWeekdayDates) {
      const isTollFree = isTollFreeDate(date);
      expect(isTollFree).toBe(true);
    }
  });

  test("should return false for all other dates", () => {
    for (
      let d = new Date(2021, 0, 1);
      d <= new Date(2021, 11, 31);
      d.setDate(d.getDate() + 1)
    ) {
      const isTollFree = isTollFreeDate(d);
      const dateString = getDateString(d);

      if (!tollFreeDatesMap.has(dateString)) {
        expect(isTollFree).toBe(false);
      }
    }
  });
});

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
