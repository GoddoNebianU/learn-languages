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

export const prodFileTransports = [
  new transports.File({
    filename: "logs/error.log",
    level: "error",
    maxsize: 5 * 1024 * 1024, // 5MB
    maxFiles: 5,
  }),
  new transports.File({
    filename: "logs/combined.log",
    maxsize: 5 * 1024 * 1024, // 5MB
    maxFiles: 5,
  }),
];
