import { groq } from "next-sanity";

export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0]{
    title, description, ogImage, teamPhoto, mascotImage,
    "stats": stats[]{ value, label },
    "galleryImages": galleryImages[]
  }
`;

export const newsListQuery = groq`
  *[_type == "newsArticle"] | order(publishedAt desc){
    _id, title, "slug": slug.current, category, publishedAt, excerpt, coverImage, featured
  }
`;

export const featuredNewsQuery = groq`
  *[_type == "newsArticle"] | order(publishedAt desc)[0...3]{
    _id, title, "slug": slug.current, category, publishedAt, excerpt, coverImage
  }
`;

export const newsArticleBySlugQuery = groq`
  *[_type == "newsArticle" && slug.current == $slug][0]{
    _id, title, "slug": slug.current, category, publishedAt, excerpt, body, coverImage
  }
`;

export const allNewsSlugsQuery = groq`
  *[_type == "newsArticle" && defined(slug.current)][].slug.current
`;

export const upcomingEventsQuery = groq`
  *[_type == "event" && startAt >= now()] | order(startAt asc){
    _id, title, startAt, endAt, kind, venue, city, description, image, rsvpUrl, isFeatured
  }
`;

export const pastEventsQuery = groq`
  *[_type == "event" && startAt < now()] | order(startAt desc)[0...12]{
    _id, title, startAt, kind, venue, city, image
  }
`;

export const practiceScheduleQuery = groq`
  *[_type == "practiceSession"] | order(order asc){
    _id, dayOfWeek, startTime, endTime, venue, level, notes
  }
`;

export const sponsorsQuery = groq`
  *[_type == "sponsor"] | order(order asc){
    _id, name, logo, url, tier
  }
`;
