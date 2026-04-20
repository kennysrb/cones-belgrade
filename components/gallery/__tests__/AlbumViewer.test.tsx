import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));
vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));
vi.mock("@/lib/utils/formatDate", () => ({ formatDate: () => "15. jul 2024." }));

import AlbumViewer from "@/components/gallery/AlbumViewer";

const photos = [
  { _key: "k1", imageUrl: "https://cdn.sanity.io/1.jpg", title: "Photo 1" },
  { _key: "k2", imageUrl: "https://cdn.sanity.io/2.jpg", title: "Photo 2" },
  { _key: "k3", imageUrl: "https://cdn.sanity.io/3.jpg", title: "Photo 3" },
];

const defaultProps = {
  photos,
  albumTitle: "Test Album",
  date: "2024-07-15",
  backLabel: "Back to gallery",
  backHref: "/gallery",
  locale: "sr" as const,
};

test("AlbumViewer renders album title", () => {
  render(<AlbumViewer {...defaultProps} />);
  expect(screen.getByText("Test Album")).toBeInTheDocument();
});

test("AlbumViewer renders back link", () => {
  render(<AlbumViewer {...defaultProps} />);
  expect(screen.getByRole("link", { name: /back to gallery/i })).toHaveAttribute("href", "/gallery");
});

test("AlbumViewer shows first photo by default", () => {
  render(<AlbumViewer {...defaultProps} />);
  const images = screen.getAllByRole("img");
  expect(images[0]).toHaveAttribute("src", "https://cdn.sanity.io/1.jpg");
});

test("AlbumViewer renders all thumbnails", () => {
  render(<AlbumViewer {...defaultProps} />);
  expect(screen.getAllByRole("img")).toHaveLength(photos.length + 1); // main + thumbnails
});

test("AlbumViewer clicking thumbnail changes main image", () => {
  render(<AlbumViewer {...defaultProps} />);
  // DOM order: prev button (0), next button (1), thumb[0] (2), thumb[1] (3), thumb[2] (4)
  // Click the second thumbnail (index 3) to switch to photo 2
  const buttons = screen.getAllByRole("button");
  fireEvent.click(buttons[3]);
  const images = screen.getAllByRole("img");
  expect(images[0]).toHaveAttribute("src", "https://cdn.sanity.io/2.jpg");
});
