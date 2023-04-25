import {
  isTollFreeDate,
  isTollFreeVehicleType,
  getTollFeeByDate,
} from "./tollCalculator";
import {
  TOLL_FREE_VEHICLE_TYPES,
  TOLL_FREE_DATES,
  TOLL_FREE_WEEKDAYS,
} from "../tollConfig.json";
import { Vehicle } from "@/types";
import { getDateString } from "../utils";

// hide console.error
jest.spyOn(console, "error").mockImplementation(() => {});

describe("getTollFeeByDate", () => {
  test("should return the correct toll fee", () => {
    const testCases: [string, number][] = [
      ["2021-01-01T00:00", 0],
      ["2021-01-01T01:00", 0],
      ["2021-01-01T05:59", 0],
      ["2021-01-01T06:00", 8],
      ["2021-01-01T06:10", 8],
      ["2021-01-01T06:29", 8],
      ["2021-01-01T06:30", 13],
      ["2021-01-01T06:45", 13],
      ["2021-01-01T06:59", 13],
      ["2021-01-01T07:00", 18],
      ["2021-01-01T07:47", 18],
      ["2021-01-01T07:59", 18],
      ["2021-01-01T08:00", 13],
      ["2021-01-01T08:01", 13],
      ["2021-01-01T08:29", 13],
      ["2021-01-01T08:30", 8],
      ["2021-01-01T08:31", 8],
      ["2021-01-01T08:49", 8],
      ["2021-01-01T09:00", 8],
      ["2021-01-01T10:00", 8],
      ["2021-01-01T11:00", 8],
      ["2021-01-01T12:00", 8],
      ["2021-01-01T13:00", 8],
      ["2021-01-01T14:00", 8],
      ["2021-01-01T14:59", 8],
      ["2021-01-01T15:00", 13],
      ["2021-01-01T15:29", 13],
      ["2021-01-01T15:30", 18],
      ["2021-01-01T16:00", 18],
      ["2021-01-01T16:30", 18],
      ["2021-01-01T16:59", 18],
      ["2021-01-01T17:00", 13],
      ["2021-01-01T17:30", 13],
      ["2021-01-01T18:00", 8],
      ["2021-01-01T18:29", 8],
      ["2021-01-01T18:30", 0],
      ["2021-01-01T19:00", 0],
      ["2021-01-01T20:00", 0],
      ["2021-01-01T21:00", 0],
      ["2021-01-01T22:00", 0],
      ["2021-01-01T23:00", 0],
      ["2021-01-01T23:59", 0],
    ];

    for (const [date, expectedFee] of testCases) {
      expect(getTollFeeByDate(new Date(date))).toBe(expectedFee);
    }
  });
});

describe("isTollFreeDate", () => {
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
