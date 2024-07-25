import path from 'path';
import OpenAI from 'openai';
import { chromium, Page, Browser, BrowserContext } from 'playwright';
import { contextOptions, browserArgs, config, promptFunc, systemPrompt } from './config';
import fs from 'fs';

const openai = new OpenAI();

export async function initializePlay(): Promise<{ page: Page; browser: Browser | BrowserContext }> {
    console.log('Initializing...')
    try {
        const browser = await chromium.launchPersistentContext(path.resolve(config.dataPath), {
            headless: false,
            args: browserArgs,
            ...contextOptions,
            timeout: 10000,
            slowMo: 100,
        });
        const page = await browser.newPage();
        await page.waitForLoadState();
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
        await page.waitForLoadState();
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
    } 
}

export async function generateProposal(request: string): Promise<string> {
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

export async function notify(message: string): Promise<void> {
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

const VISITED_LINKS_FILE = 'visited_links.json';

export function getVisitedLinks(): Set<string> {
    if (fs.existsSync(VISITED_LINKS_FILE)) {
        const links = JSON.parse(fs.readFileSync(VISITED_LINKS_FILE, 'utf-8'));
        return new Set(links);
    }
    return new Set();
}

export function saveVisitedLink(link: string): void {
    const visitedLinks = getVisitedLinks();
    visitedLinks.add(link);
    fs.writeFileSync(VISITED_LINKS_FILE, JSON.stringify([...visitedLinks]));
}