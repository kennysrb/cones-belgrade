import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "sr",
}));
vi.mock("@/i18n/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({}),
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import Nav from "@/components/layout/Nav";

test("Nav renders four nav links", () => {
  render(<Nav />);
  const links = screen.getAllByRole("link", { name: /home|news|events|gallery/i });
  expect(links.length).toBeGreaterThanOrEqual(4);
  expect(screen.getAllByRole("link", { name: /home/i }).length).toBeGreaterThan(0);
  expect(screen.getAllByRole("link", { name: /news/i }).length).toBeGreaterThan(0);
  expect(screen.getAllByRole("link", { name: /events/i }).length).toBeGreaterThan(0);
  expect(screen.getAllByRole("link", { name: /gallery/i }).length).toBeGreaterThan(0);
});

test("Nav renders brand name", () => {
  render(<Nav />);
  expect(screen.getByText("CONES")).toBeInTheDocument();
});
