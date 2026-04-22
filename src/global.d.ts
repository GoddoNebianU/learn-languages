import en from "../messages/en-US.json";

declare module "next-intl" {
  interface AppConfig {
    Messages: typeof en;
  }
}
