import { Page, Browser, BrowserContext } from 'playwright';
import { config } from './config';
import { initializePlay, loginCodementor, generateProposal, notify, getVisitedLinks, saveVisitedLink } from './utils'
import path from 'path';

import { chromium } from 'playwright';
import { contextOptions, browserArgs, promptFunc, systemPrompt } from './config';


async function codeMentor(): Promise<void> {
    const browser = await chromium.launchPersistentContext(path.resolve(config.dataPath), {
        headless: false,
        args: [...browserArgs, '--disable-extensions'],
        ...contextOptions,
        timeout: 60000,
        slowMo: 100,
    });
    const page: Page = await browser.newPage();

    try {
        await page.goto(config.codementor.dashboard);
        await page.waitForLoadState();

        if (page.url().includes('login')) {
            const loginSuccess = await loginCodementor(page);
            await page.waitForLoadState();
            if (!loginSuccess) throw new Error('Login failed');
        }

        const linkElements = page.locator("a.dashboard__open-question-item[href^='/m/dashboard/open-requests']");
        const count = await linkElements.count();
        const requestLinks: string[] = [];

        for (let i = 0; i < count; i++) {
            const href = await linkElements.nth(i).getAttribute('href');
            if (href) requestLinks.push(href);
        }

        const visitedLinks = getVisitedLinks();

        for (const link of requestLinks) {
            if (!link) continue;
            const linkurl = `${config.codementor.home}${link}`;

            if (visitedLinks.has(linkurl)) {
                console.log(`Link ${linkurl} has already been processed. Skipping.`);
                continue;
            }

            try {
                // const linkurl = `${config.codementor.home}${link}`;

                try {
                    await page.goto(linkurl);
                } catch (error) {
                    console.error(`Attempt`, error);
                    await page.waitForTimeout(3000);  // Wait 3 seconds before retry
                }

                const requesthead = await page.locator('div.question-detail h2').first().textContent().catch(() => 'N/A');
                const request = await page.locator('div.question-detail__body').first().textContent().then(text => text?.trim() ?? 'N/A').catch(() => 'N/A');
                const isApplied = await page.isVisible('img[src="https://web-cdn.codementor.io/static/images/Dashboard/Request/express-interest.png"]');
        
                if (isApplied) {
                    console.log(`Already applied to request: ${requesthead}`);
                    saveVisitedLink(linkurl);  // Save the link as visited
                    continue;
                }
        
                const proposal = await generateProposal(request);
                await page.locator("form textarea").first().fill(proposal).catch((error) => {
                    console.error('Error filling proposal:', error);
                    throw new Error('Failed to fill proposal');
                });
        
                const submitBtn = page.locator("form button").first();
        
                if (await submitBtn.isVisible()) {
                    await submitBtn.click().catch((error) => {
                        console.error('Error clicking submit button:', error);
                        throw new Error('Failed to submit proposal');
                    });
                    await notify(`Applied to request: ${request.slice(0, 50)}...${request.slice(-50)}`);
                    saveVisitedLink(linkurl);  // Save the link as visited after successful submission
                } else {
                    console.log('Submit button not found or request is empty.');
                }
                console.log(request);
            } catch (error) {
                console.error(`Error processing request ${link}:`, error);
                continue;
            }
        }

    } catch (error) {
        console.error("Error during processing: ", error);
    } finally {
        if (browser) {
            try {
                await browser.close();
            } catch (error) {
                console.error("Error closing browser:", error);
            }
        }
    }
}

(async () => {
    try {
        await codeMentor();
        console.log('Done for now');
    } catch (error) {
        console.error("Error in main function: ", error);
    }
})();