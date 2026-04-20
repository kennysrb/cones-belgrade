import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
  formatDate: () => "01. jan 2024.",
}));
vi.mock("@/components/ui/Card", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import AlbumGrid from "@/components/gallery/AlbumGrid";

const albums = [
  { _id: "1", slug: "album-a", title: "Album A", date: "2024-01-01", coverImageUrl: null, order: 2 },
  { _id: "2", slug: "album-b", title: "Album B", date: "2024-06-01", coverImageUrl: null, order: 1 },
];

test("AlbumGrid renders all album titles", () => {
  render(
    <AlbumGrid albums={albums} locale="sr" sortManualLabel="Manual order" sortDateLabel="Newest first" />
  );
  expect(screen.getByText("Album A")).toBeInTheDocument();
  expect(screen.getByText("Album B")).toBeInTheDocument();
});

test("AlbumGrid shows sort toggle buttons", () => {
  render(
    <AlbumGrid albums={albums} locale="sr" sortManualLabel="Manual order" sortDateLabel="Newest first" />
  );
  expect(screen.getByRole("button", { name: /manual order/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /newest first/i })).toBeInTheDocument();
});

test("AlbumGrid sorts by date when Newest first clicked", async () => {
  render(
    <AlbumGrid albums={albums} locale="sr" sortManualLabel="Manual order" sortDateLabel="Newest first" />
  );
  await userEvent.click(screen.getByRole("button", { name: /newest first/i }));
  const links = screen.getAllByRole("link");
  expect(links[0]).toHaveAttribute("href", "/gallery/album-b");
  expect(links[1]).toHaveAttribute("href", "/gallery/album-a");
});
