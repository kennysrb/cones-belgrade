import { defineField, defineType } from "sanity";

export default defineType({
  name: "practiceSession",
  title: "Practice Session",
  type: "document",
  fields: [
    defineField({
      name: "dayOfWeek",
      title: "Day",
      type: "string",
      options: {
        list: [
          { title: "Monday", value: "mon" },
          { title: "Tuesday", value: "tue" },
          { title: "Wednesday", value: "wed" },
          { title: "Thursday", value: "thu" },
          { title: "Friday", value: "fri" },
          { title: "Saturday", value: "sat" },
          { title: "Sunday", value: "sun" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: "startTime", title: "Start time (HH:MM)", type: "string", validation: (r) => r.required() }),
    defineField({ name: "endTime", title: "End time (HH:MM)", type: "string", validation: (r) => r.required() }),
    defineField({ name: "venue", title: "Venue", type: "localeString" }),
    defineField({ name: "level", title: "Level", type: "localeString" }),
    defineField({ name: "notes", title: "Notes", type: "localeText" }),
    defineField({ name: "order", title: "Display order", type: "number", initialValue: 0 }),
  ],
  orderings: [{ title: "By order", name: "order", by: [{ field: "order", direction: "asc" as const }] }],
  preview: {
    select: { day: "dayOfWeek", t1: "startTime", venue: "venue.sr" },
    prepare({ day, t1, venue }: { day?: string; t1?: string; venue?: string }) {
      return { title: `${day?.toUpperCase() ?? "?"} · ${t1 ?? "?"}`, subtitle: venue };
    },
  },
});
