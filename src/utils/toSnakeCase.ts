
/**
 * @param input - The input string to be converted to snake_case.
 * @returns The converted snake_case string.
 */


function toSnakeCase(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^\w_]/g, "");
}
