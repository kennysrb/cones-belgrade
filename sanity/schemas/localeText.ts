import { defineType } from "sanity";
import { SUPPORTED_LOCALES } from "./localeString";

export default defineType({
  name: "localeText",
  title: "Localized text",
  type: "object",
  fields: SUPPORTED_LOCALES.map((lang) => ({
    name: lang.id,
    title: lang.title,
    type: "text" as const,
    rows: 3,
  })),
});
