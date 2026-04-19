import { defineField, defineType } from "sanity";

export default defineType({
  name: "event",
  title: "Event",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "localeString", validation: (r) => r.required() }),
    defineField({ name: "startAt", title: "Start", type: "datetime", validation: (r) => r.required() }),
    defineField({ name: "endAt", title: "End", type: "datetime" }),
    defineField({
      name: "kind",
      title: "Kind",
      type: "string",
      options: {
        list: [
          { title: "Tournament", value: "tournament" },
          { title: "Match", value: "match" },
          { title: "Meetup", value: "meetup" },
          { title: "Camp", value: "camp" },
        ],
      },
    }),
    defineField({ name: "venue", title: "Venue", type: "localeString" }),
    defineField({ name: "city", title: "City", type: "string", initialValue: "Belgrade" }),
    defineField({ name: "description", title: "Description", type: "localeText" }),
    defineField({ name: "image", title: "Image", type: "image", options: { hotspot: true } }),
    defineField({ name: "rsvpUrl", title: "RSVP URL", type: "url" }),
    defineField({ name: "isFeatured", title: "Featured", type: "boolean", initialValue: false }),
  ],
  orderings: [{ title: "Soonest", name: "soonest", by: [{ field: "startAt", direction: "asc" as const }] }],
  preview: {
    select: { title: "title.sr", date: "startAt", media: "image" },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prepare(value: any) {
      return { title: value.title || "(untitled)", subtitle: value.date?.slice(0, 16), media: value.media };
    },
  },
});
