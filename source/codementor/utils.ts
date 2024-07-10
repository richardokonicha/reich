import path from 'path';
import OpenAI from 'openai';
import { chromium,  Page } from 'playwright';
import { contextOptions, browserArgs, config, promptFunc, systemPrompt } from './config';

const openai = new OpenAI();

export async function initializePlay() {
    console.log('Initializing...')
    try {
        // const browser = await chromium.connect({
        //     wsEndpoint: 'wss://browserless.fugoku.com/?token=BROWSERLESS_TOKEN',
        //     // slowMo: 100,
        //     // headless: false,
        //     // args: browserArgs,
        //     // ...contextOptions,
        // });
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
        throw error;
    }
}

export async function loginCodementor(page: Page) {
    console.log('Login...');
    try {
        await page.goto(config.codementor.dashboard);
        if ( page.url().includes('login') ) {
            await page.goto(config.codementor.login);
            console.log('Login Page');
            await page.locator("form input[name='email']").fill(config.codementor.email);
            await page.locator("form input[name='password']").fill(config.codementor.password);
            await page.locator("form button[type='submit']").click();
            await page.waitForLoadState();
        } else {
            console.log('Logged in.');
        }
        return true;
    } catch (error) {
        console.error('Error during login:', error);
        return false;
    } finally {
        await page.goto(config.codementor.dashboard);
        await page.waitForLoadState();
    }
}

export async function generateProposal(request: string) {
    console.log('Generating proposal...');

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: request },
            ],
            max_tokens: 46,
            n: 1,
            stop: ['\n'],
        });
        const result = completion.choices[0].message.content;
        if (!result) throw Error('No content generated');
        return result;
    } catch (error) {
        console.error('Error generating proposal:', error);
        throw error;
    }
}

export async function notify(message: string) {
    console.log(message);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://ntfy.sh/suki", true);
    xhr.setRequestHeader("Content-Type", "text/plain");
    xhr.send(message + " 😀");
    xhr.onerror = function () {
        console.error('Error sending notification:', xhr.statusText);
    };
}
