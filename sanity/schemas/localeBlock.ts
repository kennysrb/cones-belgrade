import { defineType } from "sanity";
import { SUPPORTED_LOCALES } from "./localeString";

export default defineType({
  name: "localeBlock",
  title: "Localized rich text",
  type: "object",
  fields: SUPPORTED_LOCALES.map((lang) => ({
    name: lang.id,
    title: lang.title,
    type: "array" as const,
    of: [{ type: "block" as const }, { type: "image" as const, options: { hotspot: true } }],
  })),
});
