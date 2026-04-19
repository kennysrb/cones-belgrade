import { defineField, defineType } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Site title", type: "localeString" }),
    defineField({ name: "description", title: "Description", type: "localeText" }),
    defineField({ name: "ogImage", title: "OG image", type: "image", options: { hotspot: true } }),
    defineField({
      name: "stats",
      title: "Hero stats",
      type: "array",
      of: [
        {
          type: "object" as const,
          fields: [
            { name: "value", type: "string" as const },
            { name: "label", type: "localeString" as const },
          ],
        },
      ],
      validation: (r) => r.max(3),
    }),
    defineField({ name: "galleryImages", title: "Gallery", type: "array", of: [{ type: "image" as const, options: { hotspot: true } }] }),
    defineField({ name: "teamPhoto", title: "Team photo", type: "image", options: { hotspot: true } }),
    defineField({ name: "mascotImage", title: "Mascot image", type: "image", options: { hotspot: true } }),
  ],
});
