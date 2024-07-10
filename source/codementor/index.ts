import path from 'path';
import OpenAI from 'openai';
import { chromium, Page, Browser, BrowserContext } from 'playwright';
import { contextOptions, browserArgs, config, systemPrompt } from './config';

const openai = new OpenAI();

async function initializePlay(): Promise<{ page: Page; browser: Browser | BrowserContext }> {
    console.log('Initializing...');
    try {
        const browser = await chromium.launchPersistentContext(path.resolve(config.dataPath), {
            headless: false,
            args: browserArgs,
            ...contextOptions,
            timeout: 10000,
            slowMo: 100,
        });
        const page = await browser.newPage();
        return { page, browser };
    } catch (error) {
        console.error('Error initializing Playwright:', error);
        throw new Error('Failed to initialize browser');
    }
}

async function loginCodementor(page: Page): Promise<boolean> {
    console.log('Logging in...');
    try {
        await page.goto(config.codementor.dashboard, { timeout: 30000 });
        if (page.url().includes('login')) {
            await page.goto(config.codementor.login, { timeout: 30000 });
            console.log('On Login Page');
            await page.locator("form input[name='email']").fill(config.codementor.email);
            await page.locator("form input[name='password']").fill(config.codementor.password);
            await Promise.all([
                page.waitForNavigation({ timeout: 60000 }),
                page.locator("form button[type='submit']").click()
            ]);
        } else {
            console.log('Already logged in.');
        }
        return true;
    } catch (error) {
        console.error('Error during login:', error);
        return false;
    } finally {
        try {
            await page.goto(config.codementor.dashboard, { timeout: 30000 });
            await page.waitForLoadState('networkidle', { timeout: 30000 });
        } catch (error) {
            console.error('Error navigating to dashboard:', error);
        }
    }
}

async function generateProposal(request: string): Promise<string> {
    console.log('Generating proposal...');
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: request },
            ],
            max_tokens: 50,
            n: 1,
            stop: ['\n'],
        });
        const result = completion.choices[0].message.content;
        if (!result) throw new Error('No content generated');
        return result;
    } catch (error) {
        console.error('Error generating proposal:', error);
        return 'Failed to generate proposal. Please try again.';
    }
}

async function notify(message: string): Promise<void> {
    console.log(message);
    try {
        const response = await fetch("https://ntfy.sh/suki", {
            method: "POST",
            headers: {
                "Content-Type": "text/plain",
            },
            body: message + " 😀",
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        console.log("Notification sent successfully");
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}

async function codeMentor(): Promise<void> {
    let browser: Browser | BrowserContext | undefined;
    let page: Page | undefined;

    try {
        ({ page, browser } = await initializePlay());
        const loginSuccess = await loginCodementor(page);
        if (!loginSuccess) throw new Error('Login failed');

        const requestLinks = await page.$$eval(
            "a.dashboard__open-question-item[href^='/m/dashboard/open-requests']",
            (links) => links.map((link) => link.getAttribute('href'))
        );

        for (const link of requestLinks) {
            if (!link) continue;
            try {
                await page.goto(`${config.codementor.home}${link}`, { timeout: 30000 });
                await page.waitForLoadState('networkidle', { timeout: 30000 });
        
                const requesthead = await page.locator('div.question-detail h2').textContent().catch(() => 'N/A');
                const request = await page.locator('div.question-detail__body').textContent().then(text => text?.trim() ?? 'N/A').catch(() => 'N/A');
                const isApplied = await page.isVisible('img[src="https://web-cdn.codementor.io/static/images/Dashboard/Request/express-interest.png"]');
        
                if (isApplied) {
                    console.log(`Already applied to request: ${requesthead}`);
                    continue;
                }
        
                const proposal = await generateProposal(request);
                await page.locator("form textarea").fill(proposal).catch((error) => {
                    console.error('Error filling proposal:', error);
                    throw new Error('Failed to fill proposal');
                });
        
                const submitBtn = page.locator("form button");
        
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
    } catch (error) {
        console.error("Error in main function: ", error);
    }
})();