import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("homepage search navigates to matching places", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Find your",
  );
  await page.getByLabel("Choose a location").selectOption("Galle");
  await page.getByLabel("Property type").selectOption("Villa");
  await page.getByRole("button", { name: "Search places" }).click();
  await expect(page).toHaveURL(/city=Galle/);
  await expect(page.locator(".listing-card")).toHaveCount(1);
  await expect(page.locator(".card-title")).toHaveText("The Palm House");
});
test("category controls filter and empty states offer a useful next step", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Cabanas", exact: true }).click();
  await expect(page.locator(".listing-card")).toHaveCount(1);
  await expect(page.locator(".card-title")).toHaveText("Hillside Hideaway");
  await page.getByRole("button", { name: "Land & more" }).click();
  await expect(
    page.getByRole("heading", { name: "A new possibility is on its way." }),
  ).toBeVisible();
});
test("save, view and remove a sample place", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Save The Palm House", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Saved on this device");
  await page.goto("/dashboard?tab=saved");
  await expect(page.locator(".listing-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Unsave The Palm House" }).click();
  await expect(
    page.getByRole("heading", { name: "Keep a little possibility close." }),
  ).toBeVisible();
});
test("detail displays sample status and does not pretend to accept inquiries", async ({
  page,
}) => {
  await page.goto("/places/palm-house-galle");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "The Palm House",
  );
  await expect(
    page.getByText(
      "This is a sample property. Inquiries will be available on real, approved listings.",
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Send an inquiry" }),
  ).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute(
    "content",
    /noindex/,
  );
});
test("admin preview exposes no administrative write actions", async ({
  page,
  request,
}) => {
  await page.goto("/admin");
  await expect(page.getByText(/Workspace preview/)).toBeVisible();
  await page
    .getByRole("button", { name: "Review", exact: true })
    .first()
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Approve", exact: true }),
  ).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const res = await request.get("/api/admin");
  expect(res.status()).toBe(401);
});
test("submission validates required fields and adapts to purpose", async ({
  page,
}) => {
  await page.goto("/submit");
  await page.getByRole("button", { name: "Keep going" }).click();
  await expect(
    page.getByRole("heading", { name: "Every place has a story." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Rent", exact: true }).click();
  await page.getByLabel("Property or venue type").selectOption("Annex");
  await page
    .getByLabel("Listing title")
    .fill("A sunny garden annex near Ja-Ela");
  await page
    .getByLabel("Tell its story")
    .fill(
      "This is a carefully prepared sample description for a sunny garden annex. It has its own entrance, a small kitchen and a peaceful setting with useful transport links nearby.",
    );
  await page
    .getByRole("combobox", { name: "Province", exact: true })
    .selectOption("Western");
  await page
    .getByRole("combobox", { name: "District", exact: true })
    .selectOption("Gampaha");
  await page.getByLabel("City or town").fill("Ja-Ela");
  await page.getByRole("button", { name: "Keep going" }).click();
  await expect(page.getByLabel("Pricing period")).toHaveValue("month");
  await expect(page.getByText("A picture opens the door.")).toBeVisible();
});
test("mobile navigation and critical pages fit a narrow screen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Stays & getaways", exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(/purpose=Stay/);
  for (const route of [
    "/",
    "/explore",
    "/places/palm-house-galle",
    "/submit",
    "/login",
    "/dashboard",
    "/admin",
  ]) {
    await page.goto(route);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      route,
    ).toBe(true);
  }
  await page.getByRole("button", { name: "Open workspace navigation" }).click();
  await page
    .getByRole("button", { name: "Site settings", exact: true })
    .click();
  await expect(page).toHaveURL(/tab=settings/);
});
for (const route of [
  "/",
  "/explore",
  "/submit",
  "/login",
  "/admin",
  "/dashboard",
  "/places/palm-house-galle",
])
  test(`WCAG A/AA automated audit: ${route}`, async ({ page }) => {
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(result.violations).toEqual([]);
  });
