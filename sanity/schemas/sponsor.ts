import { defineField, defineType } from "sanity";

export default defineType({
  name: "sponsor",
  title: "Sponsor",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "logo", title: "Logo", type: "image", options: { hotspot: true } }),
    defineField({ name: "url", title: "URL", type: "url" }),
    defineField({
      name: "tier",
      title: "Tier",
      type: "string",
      options: { list: ["platinum", "gold", "silver", "partner"] },
      initialValue: "partner",
    }),
    defineField({ name: "order", title: "Display order", type: "number", initialValue: 0 }),
  ],
  orderings: [{ title: "By order", name: "order", by: [{ field: "order", direction: "asc" as const }] }],
});
