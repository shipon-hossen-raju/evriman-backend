import { format, parse } from "date-fns";

export const dateInput = (data: string | Date): Date => {
  return typeof data === "string"
    ? parse(data, "MM-dd-yyyy", new Date())
    : data;
};

export const dateOutput = (date: Date): string => {
   return format(date, "MM/dd/yyyy");
};