import { Transform } from "class-transformer";

export function TransformStringToArray() {
  return Transform(({ value }) => {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        let result = value.split(",").map((item) => item.trim());
        console.log("Transformed value:", result);
        return result;
      }
    }
    return value;
  });
}
