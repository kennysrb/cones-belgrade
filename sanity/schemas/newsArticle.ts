import { defineField, defineType } from "sanity";

export default defineType({
  name: "newsArticle",
  title: "News Article",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "localeString", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: (doc: Record<string, unknown>) => ((doc.title as Record<string, string>)?.sr) ?? "" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Tournament", value: "tournament" },
          { title: "Club News", value: "club" },
          { title: "Roster", value: "roster" },
          { title: "Match Report", value: "match" },
          { title: "Community", value: "community" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: "publishedAt", title: "Published at", type: "datetime", validation: (r) => r.required() }),
    defineField({ name: "coverImage", title: "Cover image", type: "image", options: { hotspot: true } }),
    defineField({ name: "excerpt", title: "Excerpt", type: "localeText" }),
    defineField({ name: "body", title: "Body", type: "localeBlock" }),
    defineField({ name: "featured", title: "Featured on homepage", type: "boolean", initialValue: false }),
  ],
  orderings: [{ title: "Newest", name: "newest", by: [{ field: "publishedAt", direction: "desc" as const }] }],
  preview: {
    select: { title: "title.sr", media: "coverImage", date: "publishedAt" },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prepare(value: any) {
      return { title: value.title || "(untitled)", subtitle: value.date?.slice(0, 10), media: value.media };
    },
  },
});
