import * as fs from "fs";
import * as path from "path";

export function writeString(str: string, filename: string) {
  const filePath = path.resolve(__dirname, filename);
  fs.writeFileSync(filePath, str);
}

export function appendString(str: string, filename: string) {
  const filePath = path.resolve(__dirname, filename);
  const content = fs.readFileSync(filePath).toString();
  fs.writeFileSync(filePath, `${content}${str}`);
}

export function readString(filename: string): string {
  const filePath = path.resolve(__dirname, filename);
  return fs.readFileSync(filePath).toString();
}
