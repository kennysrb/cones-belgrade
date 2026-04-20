import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));
vi.mock("@/components/motion/Reveal", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/components/ui/SectionHeading", () => ({
  default: () => <div>Section Heading</div>,
}));
vi.mock("@/components/ui/Lightbox", () => ({
  default: ({ images }: { images: string[] }) => <div data-testid="lightbox" data-count={images.length} />,
}));
vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

import Gallery from "@/components/home/Gallery";

const albums = [
  {
    _id: "1",
    slug: "album-1",
    coverImageUrl: "https://cdn.sanity.io/cover1.jpg",
    photos: [
      { _key: "p1", imageUrl: "https://cdn.sanity.io/photo1.jpg" },
      { _key: "p2", imageUrl: "https://cdn.sanity.io/photo2.jpg" },
    ],
  },
  {
    _id: "2",
    slug: "album-2",
    coverImageUrl: "https://cdn.sanity.io/cover2.jpg",
    photos: [{ _key: "p3", imageUrl: "https://cdn.sanity.io/photo3.jpg" }],
  },
];

test("Gallery renders cover images", () => {
  render(<Gallery albums={albums} />);
  const images = screen.getAllByRole("img");
  expect(images[0]).toHaveAttribute("src", "https://cdn.sanity.io/cover1.jpg");
});

test("Gallery renders without crashing when albums is empty", () => {
  render(<Gallery albums={[]} />);
  expect(screen.getByText("Section Heading")).toBeInTheDocument();
});
