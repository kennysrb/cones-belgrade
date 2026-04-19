import { defineType } from "sanity";

export const SUPPORTED_LOCALES = [
  { id: "sr", title: "Serbian" },
  { id: "en", title: "English" },
] as const;

export default defineType({
  name: "localeString",
  title: "Localized string",
  type: "object",
  fields: SUPPORTED_LOCALES.map((lang) => ({
    name: lang.id,
    title: lang.title,
    type: "string" as const,
  })),
});
