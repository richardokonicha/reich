import { Page, Browser, BrowserContext } from 'playwright';
import { config } from './config';
import { initializePlay, loginCodementor, generateProposal, notify } from './utils'
import path from 'path';

import { chromium } from 'playwright';
import { contextOptions, browserArgs, promptFunc, systemPrompt } from './config';

async function codeMentor(): Promise<void> {
    // let browser: Browser | BrowserContext | undefined;
    // let page: Page | undefined;
    const browser = await chromium.launchPersistentContext(path.resolve(config.dataPath), {
        headless: false,
        // args: browserArgs,
        args: [...browserArgs, '--disable-extensions'],
        ...contextOptions,
        timeout: 60000,
        slowMo: 100,
    });
    const page: Page = await browser.newPage();

    try {
        // const { page, browser } = await initializePlay();
        // await page.goto(config.codementor.dashboard);
        // await page.waitForLoadState();
        // await new Promise((resolve) => setTimeout(resolve, 6000));

        await page.goto(config.codementor.dashboard);
        await page.waitForLoadState();

        if ( page.url().includes('login') ){
            const loginSuccess = await loginCodementor(page);
            await page.waitForLoadState();
            if (!loginSuccess) throw new Error('Login failed');
        }
        

        // const requestLinks = await page.$$eval(
        //     "a.dashboard__open-question-item[href^='/m/dashboard/open-requests']",
        //     (links) => links.map((link) => link.getAttribute('href'))
        // );


        const linkElements = page.locator("a.dashboard__open-question-item[href^='/m/dashboard/open-requests']");
        const count = await linkElements.count();
        const requestLinks: string[] = [];

        for (let i = 0; i < count; i++) {
            const href = await linkElements.nth(i).getAttribute('href');
            if (href) requestLinks.push(href);
        }

        // const pagel: Page = await browser.newPage();

        for (const link of requestLinks) {
            // await new Promise((resolve) => setTimeout(resolve, 4000));
            if (!link) continue;
            try {
                const linkurl = `${config.codementor.home}${link}`;

                try {
                    await page.goto(linkurl);
                } catch (error) {
                    console.error(`Attempt`, error);
                    await page.waitForTimeout(3000);  // Wait 5 seconds before retry
                }

                // await pagel.goto(linkurl);
        
                const requesthead = await page.locator('div.question-detail h2').first().textContent().catch(() => 'N/A');
                const request = await page.locator('div.question-detail__body').first().textContent().then(text => text?.trim() ?? 'N/A').catch(() => 'N/A');
                const isApplied = await page.isVisible('img[src="https://web-cdn.codementor.io/static/images/Dashboard/Request/express-interest.png"]');
        
                if (isApplied) {
                    console.log(`Already applied to request: ${requesthead}`);
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
    } 
    
    finally {
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
    } catch (error) {
        console.error("Error in main function: ", error);
    }
})();