import { test, expect } from "@playwright/test";

test("SR home renders hero", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("CONES");
});

test("EN home is reachable and localized", async ({ page }) => {
  await page.goto("/en");
  await expect(page).toHaveURL(/\/en/);
  await expect(page.getByRole("navigation").getByRole("link", { name: /news/i })).toBeVisible();
});

test("Sitemap is served", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  expect(res.status()).toBe(200);
  expect(await res.text()).toContain("<urlset");
});

test("Robots is served", async ({ request }) => {
  const res = await request.get("/robots.txt");
  expect(res.status()).toBe(200);
  expect(await res.text()).toContain("Sitemap:");
});
