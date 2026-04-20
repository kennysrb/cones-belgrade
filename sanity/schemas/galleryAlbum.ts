import { defineField, defineType } from "sanity";

export default defineType({
  name: "galleryAlbum",
  title: "Gallery Album",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "localeString",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title.sr", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "datetime",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "image",
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "photos",
      title: "Photos",
      type: "array",
      of: [
        {
          type: "object" as const,
          fields: [
            defineField({
              name: "image",
              title: "Image",
              type: "image",
              options: { hotspot: true },
              validation: (r) => r.required(),
            }),
            defineField({ name: "title", title: "Title", type: "localeString" }),
            defineField({ name: "description", title: "Description", type: "localeText" }),
          ],
          preview: {
            select: { media: "image", title: "title.sr" },
            prepare(v: { media: unknown; title?: string }) {
              return { title: v.title || "(untitled)", media: v.media };
            },
          },
        },
      ],
    }),
  ],
  orderings: [
    { title: "Newest first", name: "dateDesc", by: [{ field: "date", direction: "desc" as const }] },
    { title: "Manual order", name: "orderAsc", by: [{ field: "order", direction: "asc" as const }] },
  ],
  preview: {
    select: { title: "title.sr", date: "date", media: "coverImage" },
    prepare(v: { title?: string; date?: string; media: unknown }) {
      return { title: v.title || "(untitled)", subtitle: v.date?.slice(0, 10), media: v.media };
    },
  },
});
