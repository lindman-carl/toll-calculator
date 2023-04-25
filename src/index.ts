import { readFileSync } from "fs";

import { calculateVehicleTollFee } from "./logic/tollCalculator";
import { Vehicle } from "./types";

const main = () => {
  let fileName = process.argv[2] || "example_data.json";

  // read file
  const file = readFileSync(__dirname + "/" + fileName, "utf8");

  // parse json file
  const jsonFromFile = JSON.parse(file);

  // parse vehicles from json
  const vehicles: Vehicle[] = jsonFromFile.vehicles.map((vehicle: Vehicle) => {
    return {
      ...vehicle,
      tollPassDates: vehicle.tollPassDates.map((date) => new Date(date)),
    };
  });

  const tollFeeByVehicleId = new Map<string, number>();
  let totalFee = 0;

  console.log("Toll revenue report\n");

  console.log("id".padEnd(24, " ") + "type".padEnd(24, " ") + "total fee");
  // calculate toll fee for each vehicle, store in map and print
  vehicles.forEach((vehicle) => {
    const tollFee = calculateVehicleTollFee(vehicle);
    tollFeeByVehicleId.set(vehicle.id, tollFee);
    totalFee += tollFee;

    console.log(
      vehicle.id.padEnd(24, " ") + vehicle.type.padEnd(24, " ") + tollFee
    );
  });

  console.group("\nStatistics");
  console.log("total vehicles".padEnd(16, " ") + vehicles.length);
  console.log("total fees".padEnd(16, " ") + totalFee);
  console.log("average fee".padEnd(16, " ") + totalFee / vehicles.length);
  console.groupEnd();
};

main();
