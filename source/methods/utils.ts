import path from 'path';
import { contextOptions, browserArgs, config } from "./config";
import { chromium, Page } from 'playwright';


export async function run() {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
  
    await page.goto('https://example.com');
    await page.screenshot({ path: 'example.png' });
  
    await browser.close();
  }

export async function login(page: Page) {
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

export async function initializePlay() {
    console.log("Initializing...")
    let context;
    context = await chromium.launchPersistentContext(
        path.resolve(config.dataPath), {
        headless: false,
        args: browserArgs,
        ...contextOptions,
        downloadsPath: path.resolve(config.dataPath),
        timeout: 10000,
        // slowMo: 100
    });
    const page = await context.newPage();
    // await context.route('**.jpg', route => route.abort());
    return page;
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
