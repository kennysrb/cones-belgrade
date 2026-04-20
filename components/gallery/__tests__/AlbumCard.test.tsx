import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));
vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));
vi.mock("@/lib/utils/formatDate", () => ({
  formatDate: () => "15. jul 2024.",
}));

import AlbumCard from "@/components/gallery/AlbumCard";

const mockAlbum = {
  slug: "test-album",
  title: "Summer Camp 2024",
  date: "2024-07-15",
  coverImageUrl: "https://cdn.sanity.io/test.jpg",
  locale: "sr" as const,
};

test("AlbumCard renders title", () => {
  render(<AlbumCard {...mockAlbum} />);
  expect(screen.getByText("Summer Camp 2024")).toBeInTheDocument();
});

test("AlbumCard renders formatted date", () => {
  render(<AlbumCard {...mockAlbum} />);
  expect(screen.getByText("15. jul 2024.")).toBeInTheDocument();
});

test("AlbumCard links to album slug", () => {
  render(<AlbumCard {...mockAlbum} />);
  expect(screen.getByRole("link")).toHaveAttribute("href", "/gallery/test-album");
});

test("AlbumCard renders cover image", () => {
  render(<AlbumCard {...mockAlbum} />);
  // alt="" makes the image decorative (role="presentation"), query by role presentation
  expect(screen.getByRole("presentation")).toHaveAttribute("src", mockAlbum.coverImageUrl);
});

test("AlbumCard renders fallback when no cover image", () => {
  render(<AlbumCard {...mockAlbum} coverImageUrl={null} />);
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
});
