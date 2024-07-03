import path from 'path';
import * as fs from 'fs';
import * as XLSX from 'xlsx';
import { contextOptions, browserArgs, config } from "./config";
import { chromium, Page } from 'playwright';
import sanitize from "sanitize-html";

export async function loginLinkedin(page: Page) {
    console.log("Login..")
    try {
        await page.goto(config.linkedin.home);
        const currentUrl = page.url();
        if (currentUrl.includes('login')) {
            // await page.goto(config.linkedin.login);
            console.log('Login Page');
            await page.locator('form.login__form #username').fill(config.linkedin.email);
            await page.locator('form.login__form #password').fill(config.linkedin.password);
            await page.locator('form button[type=submit]').click();
            await page.goto(config.linkedin.home)
            return true;
        } else {
            console.log('Logged in".');
            await page.goto(config.linkedin.home);
            return true;
        }
    } catch (error) {
        console.error('Error:', error);
        return false;
    }
}

export async function initializePlay(pathString: string) {
    console.log("Initializing...")
    let browser;
    browser = await chromium.launchPersistentContext(
      path.resolve(pathString), {
        headless: false,
        args: browserArgs,
        ...contextOptions,
        downloadsPath: path.resolve(pathString),
        timeout: 10000,
        // slowMo: 100
      });
    const page = await browser.newPage();
    return { page, browser };
}

export async function isElementInView(page: Page, locator: any) {
    const boundingBox = await locator.boundingBox();
    if (!boundingBox) return false;

    const viewportHeight = await page.evaluate(() => window.innerHeight);
    const viewportWidth = await page.evaluate(() => window.innerWidth);

    const inView = (
        boundingBox.y >= 0 &&
        boundingBox.y + boundingBox.height <= viewportHeight &&
        boundingBox.x >= 0 &&
        boundingBox.x + boundingBox.width <= viewportWidth
    );
    return inView;
}

export async function scrollJobList(page:Page) {
    await page.waitForSelector('div.jobs-search-results-list .job-card-container');
    const scrollContainer = page.locator('div.jobs-search-results-list');
    const footer = await page.getByLabel('LinkedIn Footer Content')
    while (!(await isElementInView(page, footer))) {
        // console.log(await isElementInView(page, footer),  "footer isnt visible yet");
        await scrollContainer.hover();
        await scrollContainer.focus();
        await page.mouse.wheel(0, 400);
    }
    console.log(await isElementInView(page, footer), "footer is visible now");
    await scrollContainer.scrollIntoViewIfNeeded();
    return;
}

export const sanitizeHtml = (subject: string): string => {
    return sanitize(subject, {
      allowedTags: sanitize.defaults.allowedTags.concat([
        "button",
        "form",
        "img",
        "input",
        "select",
        "textarea",
        "option"
      ]),
      allowedAttributes: {
        "*": [
          "class",
          "id",
          "role",
          "aria-label",
          "aria-labelledby",
          "aria-valuetext",
          "aria-valuemin",
          "aria-valuenow",
          "aria-valuemax",
          "tabindex",
          "data-*",
          "style",
          "title",
          "loading",
          "alt"
        ],
        "img": ["src", "width", "height", "loading", "alt", "title"],
        "input": ["type", "name", "value", "placeholder", "required"],
        "select": ["id", "aria-describedby", "aria-required", "required", "data-test-text-entity-list-form-select"],
        "option": ["value"]
      }
    });
};

export const getAllSkus = async (excelFile: string): Promise<string[]> => {
    if (!fs.existsSync(excelFile)) {
      return [];
    }
  
    const workbook = XLSX.readFile(excelFile);
    const worksheet = workbook.Sheets['Products'];
  
    if (!worksheet) {
      throw new Error('Worksheet is undefined.');
    }
  
    const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
    return sheetData.slice(1).map(row => row[0]);
  };
  