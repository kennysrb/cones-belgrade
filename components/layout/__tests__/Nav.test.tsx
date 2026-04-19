import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "sr",
}));
vi.mock("@/i18n/navigation", () => ({
  usePathname: () => "/",
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import Nav from "@/components/layout/Nav";

test("Nav renders three nav links", () => {
  render(<Nav />);
  expect(screen.getByRole("link", { name: /home/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /news/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /events/i })).toBeInTheDocument();
});

test("Nav renders brand name", () => {
  render(<Nav />);
  expect(screen.getByText("CONES")).toBeInTheDocument();
});
