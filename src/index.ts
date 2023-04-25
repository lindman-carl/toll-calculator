import { readFileSync } from "fs";

import { calculateVehicleTollFee } from "./logic/tollCalculator";
import { Vehicle } from "./types";

const main = () => {
  let filePath = process.argv[2] || __dirname + "/" + "toll_data.json";

  // read file
  const file = readFileSync(filePath, "utf8");

  // parse json file
  const jsonFromFile = JSON.parse(file);

  // parse vehicles from json
  const vehicles: Vehicle[] = jsonFromFile.map((vehicle: Vehicle) => {
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

  const totalPasses = vehicles.reduce((acc, vehicle) => {
    return acc + vehicle.tollPassDates.length;
  }, 0);
  const averageFeePerVehicle = totalFee / vehicles.length;
  const averageFeePerPass = (totalFee / totalPasses).toFixed(2);

  console.group("\nStatistics");
  console.log("total vehicles".padEnd(16, " ") + vehicles.length);
  console.log("total fees".padEnd(16, " ") + totalFee);
  console.log("total passes".padEnd(16, " ") + totalPasses);
  console.log("fee/vehicle".padEnd(16, " ") + averageFeePerVehicle);
  console.log("fee/pass".padEnd(16, " ") + averageFeePerPass);
  console.groupEnd();
};

main();
