import { config } from './config';
import { initializePlay, loginReplit } from './utils';
import { Page } from 'playwright';

export async function apply(page: Page) {
    try {
        const applybtn = page.locator("button[data-cy='apply-button']").first();
        const appliedbtn = page.locator("button[data-cy='applied-button']").first();
        const description = page.locator("div.rendered-markdown").first().innerText();

        const dialog = page.locator('div[aria-label="Dialog"] form');

        const textarea = dialog.locator('textarea[id=":rj:-message"]').first();
        const email = dialog.locator('input[id=":rj:-contact-info"]').first();

        const btn = dialog.locator('button[type="submit"]').first();

      
    } catch (error) {
        console.error("Error during application: ", error);
        throw error;
    } finally {return true;}
}

export async function startBountyHunter(page: Page) {
    try {
        const bountyList = await page.locator('div [role="tabpanel"] ul.css-ktp7z li a.css-1om7s53').evaluateAll(lnk => lnk.map(lnk => (lnk as HTMLLinkElement).href)).catch(() => []);
        for (const bounty of bountyList) {
            await page.goto(bounty);
            await apply(page);
        }
    
    } catch (error) {
        console.error("Error during search: ", error);
        throw error;} finally {return true;}
}

(async () => {
    const { page, browser } = await initializePlay(config.dataPath);
    try {
        await loginReplit(page);
        await page.goto(config.replit.home);

        await startBountyHunter(page);
        console.log("Done! BountyHunter has finished.");
    } catch (error) {
        console.error("Error in main function: ", error);
    } finally {
        await browser.close();
    }
})();
