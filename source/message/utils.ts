import path from 'path';
import OpenAI from 'openai';
import { chromium, ElementHandle, Page } from 'playwright';
import { contextOptions, browserArgs, config, promptFunc } from './config';
import { startMessaging } from './message';

const openai = new OpenAI();

export async function initializePlay(pathString: string) {
    console.log('Initializing...');
    try {
        const browser = await chromium.launchPersistentContext(path.resolve(pathString), {
            headless: false,
            args: browserArgs,
            ...contextOptions,
            downloadsPath: path.resolve(pathString),
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

export async function loginLinkedin(page: Page) {
    console.log('Login...');
    try {
        await page.goto(config.linkedin.home);
        const currentUrl = page.url();
        if (currentUrl.includes('login')) {
            console.log('Login Page');
            await page.locator('form.login__form #username').fill(config.linkedin.email);
            await page.locator('form.login__form #password').fill(config.linkedin.password);
            await page.locator('form button[type=submit]').click();
            await page.goto(config.linkedin.home);
        } else {
            console.log('Logged in.');
            await page.goto(config.linkedin.home);
        }
        return true;
    } catch (error) {
        console.error('Error during login:', error);
        return false;
    }
}

export async function getMessageButtons(page: Page) {
    const messageButtons = [];
    try {
        await page.waitForSelector('.linked-area', { timeout: 10000 });
        const linkedAreaElements = page.locator('.linked-area');
        const count = await linkedAreaElements.count();
        console.log(`Found ${count} linked-area elements`);

        for (let i = 0; i < count; i++) {
            const linkedAreaElement = linkedAreaElements.nth(i);
            const messageButton = await linkedAreaElement.locator('button:has-text("Message")').elementHandle();
            if (messageButton) {
                messageButtons.push(messageButton);
            }
        }

        console.log(`Found ${messageButtons.length} message buttons`);
        return messageButtons;
    } catch (error) {
        console.error('Error during search:', error);
        throw error;
    }
}

export async function continueNext(page: Page) {
    try {
        await page.waitForTimeout(2000);
        if (await page.getByLabel('Next').isVisible()) {
            await page.getByLabel('Next').click();
            await page.waitForTimeout(1000);
            await startMessaging(page);
        } else {
            console.log('No more next button found');
        }
    } catch (error) {
        console.error('Error while continuing to next page:', error);
    }
}

export async function handleClose(page: Page) {
    try {
        if (await page.getByRole('button', { name: 'Close your conversation with' }).isVisible()) {
            await page.getByRole('button', { name: 'Close your conversation with' }).click();
            await page.waitForTimeout(500);
        }
        if (await page.getByRole('button', { name: 'Close your draft conversation' }).isVisible()) {
            await page.getByRole('button', { name: 'Close your draft conversation' }).click();
            await page.waitForTimeout(500);
        }
        if (!await page.getByRole('button', { name: 'Close your draft conversation' }).isVisible() &&
            !await page.getByRole('button', { name: 'Close your conversation with' }).isVisible()) {
            console.log('No close button found');
        }
    } catch (error) {
        console.error('Error while handling close:', error);
    }
}

export async function handleMButton(page: Page, btn: ElementHandle<SVGElement | HTMLElement>) {
    try {
        await btn.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        await btn.hover();
        await btn.click({ force: true });
        console.log('Message button clicked');
        await page.waitForTimeout(1000);
    } catch (error) {
        console.error('Error while handling message button:', error);
    }
}

export async function extractUserInfo(page: Page) {
    try {
        const info = await page.locator('div.msg-s-profile-card .artdeco-entity-lockup__content').innerText();
        return { info };
    } catch (error) {
        console.error('Error extracting user info:', error);
        throw error;
    }
}

export async function analyzeProfile(userInfo: { jobTitle: any; company: any; skills: any; }) {
    const { jobTitle, company, skills } = userInfo;

    const isHiringManager = jobTitle.toLowerCase().includes('recruiter') || jobTitle.toLowerCase().includes('hiring manager');

    const domainInterest = skills.some((skill: string) => ['recruiting', 'hiring', 'talent acquisition'].includes(skill.toLowerCase()));

    return { isHiringManager, domainInterest };
}

export async function generateNextMessage(conversationHistory: any[], userInfo: { info: string }) {
    try {

        const details = {
            user: userInfo.info,
            history: conversationHistory.join('/n')
        }
        const {prmpt, syst} = promptFunc(details)
        
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                // { role: 'system', content: syst },
                { role: 'system', content: prmpt },
            ],
            max_tokens: 150,
            // n: 1,
            // stop: ['\n'],
        });

        const result = completion.choices[0].message.content;
        if (!result) throw Error;
        return result 
    } catch (error) {
        console.error('Error generating next message:', error);
        throw error;
    }
}

export async function handleMessage(page: Page) {
    try {
        await page.waitForTimeout(500);
        const msgFrame = await page.getByLabel('Messaging');
        if (!await msgFrame.isVisible()) {
            console.log('msgFrame is not visible');
            return;
        }

        await msgFrame.scrollIntoViewIfNeeded();
        await msgFrame.hover();
        await msgFrame.click();

        const conversationHistory = await msgFrame.locator('p').allTextContents();
        const userInfo = await extractUserInfo(page);

        const nextMessage = await generateNextMessage(conversationHistory, userInfo);

        if (await page.getByRole('button', { name: 'Send' }).isVisible()) {
            await page.fill('textarea', nextMessage);
            // await page.getByRole('button', { name: 'Send' }).click(); // Uncomment this to send the message
            console.log('Message sent');
            await page.waitForTimeout(500);
        } else {
            console.log('Send button is not visible');
            await handleClose(page);
        }
    } catch (error) {
        console.error('Error while handling message:', error);
    }
}
