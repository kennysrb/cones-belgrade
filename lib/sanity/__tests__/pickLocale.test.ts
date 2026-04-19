import { pickLocale } from "@/lib/sanity/types";

test("returns requested locale", () => {
  expect(pickLocale({ sr: "Вести", en: "News" }, "sr")).toBe("Вести");
});

test("falls back to sr when requested locale missing", () => {
  expect(pickLocale({ sr: "Вести" }, "en")).toBe("Вести");
});

test("returns empty string when value undefined", () => {
  expect(pickLocale(undefined, "sr")).toBe("");
});
