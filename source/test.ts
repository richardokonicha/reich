import { Page, chromium } from "playwright";
import { auto } from "auto-playwright";
import { config } from "./methods/config";
import { sanitizeHtml } from "./methods/utils"

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(config.linkedin.home);
  const form = await page.locator("")
  const content = sanitizeHtml(await page.content())
  console.log(content);
  // await auto("go to login", { page });
  // await auto("enter email as richardokonicha and paswword", { page });

  // `auto` can query data
  // In this case, the result is plain-text contents of the header
  // const res = await auto("get the header text", { page });

  // use res.query to get a query result.
  await page.close();
})();

function rider(arg0: string, page: Page) {
  throw new Error("Function not implemented.");
}
