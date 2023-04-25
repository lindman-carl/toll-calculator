import { z } from "zod";
import { Vehicle } from "./types";

export const getDateString = (date: Date) => {
  // format date to "month/day", "2/14"
  // 1-indexed
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

export const getMinutesSinceMidnight = (date: Date) =>
  date.getHours() * 60 + date.getMinutes();

export const getMinutesElapsed = (startTime: Date, endTime: Date) =>
  (endTime.getTime() - startTime.getTime()) / 1000 / 60;

export const parseVehicle = (vehicle: string): Vehicle => {
  const [id, type, tollPasses] = vehicle.split(";");

  const tollPassesArray = tollPasses.split(",").map((tollPass) => {
    return new Date(tollPass);
  });

  // input validation
  const vehicleSchema = z.object({
    id: z.string().nonempty(),
    type: z.string().nonempty(),
    tollPasses: z.array(z.date()),
  });

  const parsedVehicle: Vehicle = {
    id,
    type,
    tollPassDates: tollPassesArray,
  };

  try {
    vehicleSchema.parse({
      id,
      type,
      tollPasses: tollPassesArray,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(error);
    }
  }

  return parsedVehicle;
};
