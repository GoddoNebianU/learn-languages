import { transports, format } from "winston";

const { combine, timestamp, printf, colorize, json } = format;

const customFormat = printf(({ level, message, timestamp, ...metadata }) => {
  const cleanMeta = Object.fromEntries(
    Object.entries(metadata).filter(([key]) => typeof key === "string")
  );
  const metaStr = Object.keys(cleanMeta).length ? JSON.stringify(cleanMeta) : "";
  return `${timestamp} [${level}]: ${message} ${metaStr}`;
});

export const devTransport = new transports.Console({
  format: combine(
    colorize(),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    customFormat
  ),
});

export const prodConsoleTransport = new transports.Console({
  format: combine(timestamp(), json()),
});
