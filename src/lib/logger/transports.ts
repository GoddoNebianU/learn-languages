import { transports, format } from "winston";

const { combine, timestamp, printf, colorize, json } = format;

const customFormat = printf(({ level, message, timestamp, ...metadata }) => {
  const metaStr = Object.keys(metadata).length ? JSON.stringify(metadata) : "";
  return `${timestamp} [${level}]: ${message} ${metaStr}`;
});

export const devTransport = new transports.Console({
  format: combine(
    colorize(),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    customFormat
  ),
});

export const prodTransport = new transports.Console({
  format: combine(timestamp(), json()),
});
