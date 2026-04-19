import { render } from "@testing-library/react";
import "@testing-library/jest-dom";

test("tailwind design tokens are available via class names", () => {
  const { container } = render(<div className="bg-cones-blue text-cones-orange">x</div>);
  const el = container.firstChild as HTMLElement;
  expect(el.className).toContain("bg-cones-blue");
  expect(el.className).toContain("text-cones-orange");
});
