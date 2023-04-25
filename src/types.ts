export type Vehicle = {
  // id: string;
  type:
    | "motorbike"
    | "tractor"
    | "emergency"
    | "diplomat"
    | "foreign"
    | "military"
    | string;
  tollPassDates: Date[];
};
