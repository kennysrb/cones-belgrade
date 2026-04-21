import { defineField, defineType } from "sanity";

export default defineType({
  name: "player",
  title: "Player",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "nickname", title: "Nickname", type: "string" }),
    defineField({ name: "photo", title: "Photo", type: "image", options: { hotspot: true } }),
    defineField({ name: "number", title: "Jersey number", type: "number" }),
    defineField({ name: "age", title: "Age", type: "number" }),
    defineField({
      name: "position",
      title: "Position",
      type: "string",
      options: { list: ["forward", "defense", "goalie"] },
    }),
    defineField({
      name: "stick",
      title: "Stick",
      type: "string",
      options: { list: [{ title: "Left", value: "L" }, { title: "Right", value: "R" }] },
    }),
    defineField({ name: "order", title: "Display order", type: "number", initialValue: 0 }),
  ],
  orderings: [{ title: "By order", name: "order", by: [{ field: "order", direction: "asc" as const }] }],
  preview: {
    select: { title: "name", subtitle: "position", media: "photo" },
  },
});
