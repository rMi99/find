import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("boarding filters and focused content work on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/boarding-for-women");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Boarding houses for women in Sri Lanka",
  );
  await expect(page.getByLabel("Suitable for")).toHaveValue("women");
  await page.getByLabel("People per room").fill("3");
  await page.getByLabel("Available spaces needed").fill("2");
  await page.getByLabel("Compare monthly prices per").selectOption("person");
  await page.getByRole("button", { name: "Find my place" }).click();
  await expect(page).toHaveURL(/capacity=3/);
  await expect(page).toHaveURL(/vacancies=2/);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test("boarding form customizes women, men and couple rooms and prevents overcapacity", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/submit");
  await page.getByLabel("Property or venue type").selectOption("Boarding");
  await page
    .getByLabel("Listing title")
    .fill("Three person boarding room in Galle");
  await page
    .getByLabel("Tell its story")
    .fill(
      "A bright shared boarding room with a separate entrance, kitchen access, shared bathroom and storage. The monthly price is per person; please contact the owner to confirm meals, bills and available spaces.",
    );
  await page.getByLabel("City or town").fill("Galle");
  await page.getByRole("button", { name: "Keep going" }).click();
  await expect(page.getByLabel("Pricing period")).toHaveValue("month");
  await expect(page.getByLabel("Pricing period")).toBeDisabled();
  await page.getByLabel("Price (LKR)", { exact: true }).fill("18000");
  for (const [audience, count] of [
    ["women", "2"],
    ["women", "3"],
    ["men", "6"],
    ["men", "1"],
    ["couples", "2"],
  ]) {
    await page.getByLabel("Suitable for").selectOption(audience);
    await page.getByLabel("People per room").fill(count);
    await page.getByLabel("Available spaces", { exact: false }).fill(count);
    await expect(page.getByLabel("Guest capacity")).toHaveValue(count);
  }
  await page.getByLabel("Available spaces", { exact: false }).fill("3");
  expect(
    await page
      .getByLabel("Available spaces", { exact: false })
      .evaluate((el: HTMLInputElement) => el.validity.rangeOverflow),
  ).toBe(true);
  await page.getByLabel("Available spaces", { exact: false }).fill("2");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(axe.violations).toEqual([]);
  await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
  await page.screenshot({
    path: "/tmp/ceylon-boarding-form.png",
    fullPage: true,
  });
});
for (const route of [
  "/boarding-houses",
  "/boarding-for-women/colombo",
  "/boarding-for-men",
  "/boarding-for-couples",
  "/guides/boarding-house-checklist",
]) {
  test(`boarding SEO, ads off and accessibility: ${route}`, async ({
    page,
  }) => {
    const advertising: string[] = [];
    page.on("request", (r) => {
      if (/googlesyndication|doubleclick|fundingchoices/.test(r.url()))
        advertising.push(r.url());
    });
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    await expect(page.locator('link[rel="canonical"]').first()).toHaveAttribute(
      "href",
      `http://localhost:3000${route}`,
    );
    await expect(
      page.locator('meta[name="description"]').first(),
    ).toHaveAttribute("content", /\S.{40}/);
    await expect(
      page.locator('meta[property="og:title"]').first(),
    ).toHaveAttribute("content", /\S/);
    await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute(
      "content",
      route.startsWith("/guides/") && process.env.DEMO_CONTENT !== "true"
        ? /^index, follow$/
        : /noindex/,
    );
    expect(advertising).toEqual([]);
    expect(
      (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze())
        .violations,
    ).toEqual([]);
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
}
