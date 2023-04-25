import { nanoid } from "nanoid";

import {
  isTollFreeDate,
  isTollFreeVehicleType,
  getTollFeeByDate,
  calculateVehicleTollFee,
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
        id: nanoid(8),
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
        id: nanoid(8),
        type,
        tollPassDates: [],
      } as Vehicle);
      expect(isTollFree).toBe(false);
    }
  });
  test("should return false for vehicles with an empty type", () => {
    const isTollFree = isTollFreeVehicleType({
      id: nanoid(8),
      type: "",
      tollPassDates: [],
    } as Vehicle);
    expect(isTollFree).toBe(false);
  });
});

describe("calculateVehicleTollFee", () => {
  test("should return 0 for a toll free vehicle", () => {
    const vehicle: Vehicle = {
      id: nanoid(8),
      type: "motorbike",
      tollPassDates: [new Date()],
    };

    expect(calculateVehicleTollFee(vehicle)).toBe(0);
  });

  test("should return 0 if the vehicle has not passed any tolls", () => {
    const vehicle: Vehicle = {
      id: nanoid(8),
      type: "car",
      tollPassDates: [],
    };

    const tollFreeVehicle: Vehicle = {
      id: nanoid(8),
      type: "emergency",
      tollPassDates: [],
    };

    expect(calculateVehicleTollFee(vehicle)).toBe(0);
    expect(calculateVehicleTollFee(tollFreeVehicle)).toBe(0);
  });

  test("should return the correct toll fee for a vehicle that has passed tolls that doesn't have overlaping periods", () => {
    const vehicles: Vehicle[] = [
      {
        id: nanoid(8),
        type: "car",
        tollPassDates: [
          new Date("2021-01-01T06:20"), // 8
          new Date("2021-01-01T08:35"), // 8
          new Date("2021-01-01T09:40"), // 8
          new Date("2021-01-01T11:30"), // 8
          new Date("2021-01-01T15:10"), // 13
        ], // 45
      },
      {
        id: nanoid(8),
        type: "locomotive",
        tollPassDates: [
          new Date("2021-01-01T07:20"), // 18
          new Date("2021-01-01T08:35"), // 8
          new Date("2021-01-01T10:05"), // 8
        ], // 34
      },
    ];
    const expectedFees = [45, 34];

    for (let i = 0; i < vehicles.length; i++) {
      expect(calculateVehicleTollFee(vehicles[i])).toBe(expectedFees[i]);
    }
  });

  test("should return the correct toll fee for a vehicle that has passed tolls that have overlaping periods", () => {
    const vehicles: Vehicle[] = [
      {
        id: nanoid(8),
        type: "car",
        tollPassDates: [
          new Date("2021-01-01T06:10"), // 0
          new Date("2021-01-01T06:45"), // 0
          new Date("2021-01-01T07:05"), // 18
        ], // 18
      },
      {
        id: nanoid(8),
        type: "locomotive",
        tollPassDates: [
          new Date("2021-01-01T06:10"), // 0
          new Date("2021-01-01T06:45"), // 0
          new Date("2021-01-01T07:05"), // 18
          new Date("2021-01-01T07:15"), // 18
          new Date("2021-01-01T07:35"), // 0
          new Date("2021-01-01T07:45"), // 0
          new Date("2021-01-01T08:10"), // 0
        ], // 36
      },
      {
        id: nanoid(8),
        type: "camel",
        tollPassDates: [
          new Date("2021-01-01T06:10"), // 0
          new Date("2021-01-01T06:45"), // 0
          new Date("2021-01-01T07:05"), // 18
          new Date("2021-01-01T07:35"), // 18
          new Date("2021-01-01T07:45"), // 0
          new Date("2021-01-01T08:10"), // 0
          new Date("2021-01-01T09:30"), // 8
          new Date("2021-01-01T09:45"), // 0
        ], // 44
      },
    ];
    const expectedFees = [18, 36, 44];

    for (let i = 0; i < vehicles.length; i++) {
      expect(calculateVehicleTollFee(vehicles[i])).toBe(expectedFees[i]);
    }
  });

  test("should return a maximum 60 for a day", () => {
    const vehicle: Vehicle = {
      id: nanoid(8),
      type: "car",
      tollPassDates: [
        new Date("2021-01-01T06:10"), // 0
        new Date("2021-01-01T06:45"), // 0
        new Date("2021-01-01T07:05"), // 18
        new Date("2021-01-01T07:35"), // 18
        new Date("2021-01-01T07:45"), // 0
        new Date("2021-01-01T08:10"), // 0
        new Date("2021-01-01T09:30"), // 8
        new Date("2021-01-01T09:45"), // 0
        new Date("2021-01-01T10:30"), // 8
        new Date("2021-01-01T10:45"), // 0
        new Date("2021-01-01T11:30"), // 8
        new Date("2021-01-01T11:45"), // 0
        new Date("2021-01-01T12:30"), // 8
        new Date("2021-01-01T12:45"), // 0
        new Date("2021-01-01T13:30"), // 8
        new Date("2021-01-01T13:45"), // 0
        new Date("2021-01-01T14:30"), // 8
        new Date("2021-01-01T14:45"), // 0
        new Date("2021-01-01T15:30"), // 13
        new Date("2021-01-01T15:45"), // 0
        new Date("2021-01-01T16:30"), // 13
      ],
    };

    expect(calculateVehicleTollFee(vehicle)).toBe(60);
  });

  test("should return the correct toll fee for a vehicle that has passed tolls on multiple days", () => {
    const vehicle: Vehicle = {
      id: nanoid(8),
      type: "car",
      tollPassDates: [
        new Date("2021-01-01T06:10"), // 0
        new Date("2021-01-01T06:45"), // 0
        new Date("2021-01-01T07:05"), // 18
        new Date("2021-01-01T07:35"), // 18
        new Date("2021-01-01T07:45"), // 0
        new Date("2021-01-01T08:10"), // 0
        new Date("2021-01-01T09:30"), // 8
        new Date("2021-01-01T09:45"), // 0
        new Date("2021-01-01T10:30"), // 8
        new Date("2021-01-01T10:45"), // 0
        new Date("2021-01-01T11:30"), // 8
        new Date("2021-01-01T11:45"), // 0
        new Date("2021-01-01T12:30"), // 8
        new Date("2021-01-01T12:45"), // 0
        new Date("2021-01-01T13:30"), // 8
        new Date("2021-01-01T13:45"), // 0
        new Date("2021-01-01T14:30"), // 8
        new Date("2021-01-01T14:45"), // 0
        new Date("2021-01-01T15:30"), // 13
        new Date("2021-01-01T15:45"), // 0
        new Date("2021-01-01T16:30"), // 13
        new Date("2021-01-02T06:05"), // 8
        new Date("2021-01-02T09:10"), // 8
        new Date("2021-01-02T11:00"), // 8
        new Date("2021-01-03T07:10"), // 18
        new Date("2021-01-03T08:00"), // 0
        new Date("2021-01-04T07:15"), // 18
        new Date("2021-01-04T09:00"), // 8
        new Date("2021-01-04T14:00"), // 8
        new Date("2021-01-04T15:20"), // 13
        new Date("2021-01-04T16:25"), // 18
      ],
    };

    // 1/1: 60
    // 2/1: 24
    // 3/1: 18
    // 4/1: 60
    // sum: 162

    expect(calculateVehicleTollFee(vehicle)).toBe(162);
  });
});
