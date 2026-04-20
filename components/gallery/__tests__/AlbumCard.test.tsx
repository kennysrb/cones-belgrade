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

import AlbumCard from "@/components/gallery/AlbumCard";

const mockAlbum = {
  slug: "test-album",
  title: "Summer Camp 2024",
  date: "2024-07-15",
  coverImageUrl: "https://cdn.sanity.io/test.jpg",
};

test("AlbumCard renders title", () => {
  render(<AlbumCard {...mockAlbum} />);
  expect(screen.getByText("Summer Camp 2024")).toBeInTheDocument();
});

test("AlbumCard renders formatted date", () => {
  render(<AlbumCard {...mockAlbum} />);
  expect(screen.getAllByText(/2024/).length).toBeGreaterThan(0);
});

test("AlbumCard links to album slug", () => {
  render(<AlbumCard {...mockAlbum} />);
  expect(screen.getByRole("link")).toHaveAttribute("href", "/gallery/test-album");
});

test("AlbumCard renders cover image", () => {
  render(<AlbumCard {...mockAlbum} />);
  expect(screen.getByRole("img")).toHaveAttribute("src", mockAlbum.coverImageUrl);
});
