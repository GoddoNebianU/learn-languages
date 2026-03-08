import winston from "winston";
import { devTransport, prodTransport } from "./transports";

const isDev = process.env.NODE_ENV !== "production";

export const logger = winston.createLogger({
  level: isDev ? "debug" : "info",
  transports: [isDev ? devTransport : prodTransport],
});
