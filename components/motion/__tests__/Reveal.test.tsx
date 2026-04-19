import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("framer-motion", () => ({
  motion: {
    create: () => ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <div className={className}>{children}</div>
    ),
  },
}));

import Reveal from "@/components/motion/Reveal";

test("Reveal renders children", () => {
  render(<Reveal>hello world</Reveal>);
  expect(screen.getByText("hello world")).toBeInTheDocument();
});
