// const { chromium } = require('playwright');
// const fs = require('fs');
const { Configuration, OpenAIApi } = require('openai');

const PEOPLE_URL = "https://www.linkedin.com/search/results/people/?geoUrn=%5B%22103644278%22%5D&network=%5B%22F%22%5D&origin=FACETED_SEARCH&sid=_vU";
const EMAIL = process.env.LINKEDIN_EMAIL || 'richardokonicha@gmail.com';
const PASSWORD = process.env.LINKEDIN_PASSWORD || 'Shoo';
const authFile = 'playwright/.auth/user.json';
const userDataDir = 'omni/linkedin/user_data'; // Define your userDataDir path here
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "sk-proj-kMxWNYiLzRcMB7IOiW22T3BlbkFJi81uTRKUT6WunTCxvMtH";
const openai = new OpenAIApi(new Configuration({
  apiKey: OPENAI_API_KEY,
}));

const browserArgs = [
    '--disable-web-security',
    '--disable-features=IsolateOrigins,site-per-process',
    '--disable-blink-features=AutomationControlled',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-webgl',
    '--disable-rtc-smoothness-algorithm',
    '--disable-webrtc-encryption',
];
const contextOptions = {
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    ignoreHTTPSErrors: true,
    geolocation: { latitude: 6.5, longitude: 3.3 },
    permissions: ['geolocation'],
    extraHTTPHeaders: {
        'Accept-Language': 'en-US,en;q=0.9',
    },
};

(async () => {
    let context;

    if (fs.existsSync(userDataDir)) {
        context = await chromium.launchPersistentContext(userDataDir, {
            headless: false,
            args: browserArgs,
            ...contextOptions,
        });
    } else {
        const browser = await chromium.launch();
        context = await browser.newContext();
    }
    const page = await context.newPage();
    await page.goto(PEOPLE_URL);

    async function handleClose(page) {
        if (await page.getByRole('button', { name: 'Close your conversation with' }).isVisible()) {
            await page.getByRole('button', { name: 'Close your conversation with' }).click();
            await page.waitForTimeout(500);
        }
        if (await page.getByRole('button', { name: 'Close your draft conversation' }).isVisible()) {
            await page.getByRole('button', { name: 'Close your draft conversation' }).click();
            await page.waitForTimeout(500);
        }
        if (!await page.getByRole('button', { name: 'Close your draft conversation' }).isVisible() && !await page.getByRole('button', { name: 'Close your conversation with' }).isVisible()){
            console.log("no close found")
        }
    }

    async function handleMButton(btn) {
        await btn.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        await btn.hover();
        await btn.click({ force: true });
        console.log('Message button clicked');
        await page.waitForTimeout(1000);
    }

    async function extractUserInfo(page) {
        // Extract user profile information
        // const profileUrl = await page.locator('a[href*="/in/"]').first().getAttribute('href');
        // await page.goto(profileUrl);
        const info = await page.locator("div[@class='artdeco-entity-lockup__content']")
        console.log(info, 'info')
        const jobTitle = await page.locator('div.text-body-medium').innerText();
        const company = await page.locator('span.t-bold').innerText();
        const skills = await page.locator('span.pv-skill-category-entity__name-text').allTextContents();

        return { jobTitle, company, skills };
    }

    async function analyzeProfile(userInfo) {
        // Analyze the user's profile
        const { jobTitle, company, skills } = userInfo;

        // Basic analysis: Determine if the user is a hiring manager
        const isHiringManager = jobTitle.toLowerCase().includes('recruiter') || jobTitle.toLowerCase().includes('hiring manager');

        // Determine domain interest
        const domainInterest = skills.some(skill => ['recruiting', 'hiring', 'talent acquisition'].includes(skill.toLowerCase()));

        return { isHiringManager, domainInterest };
    }

    async function generateNextMessage(conversationHistory, userInfo) {
        const prompt = `
            You are a senior engineer and you're looking for a job in cloud, you strike up friendly conversations to get key info about compay and hiring process, you are to find out if a user is currently hiring, or ask for a referal if they might be in a position to do so. Here is the conversation history so far:
            observe social cues and all messages outght to be professional, friendly and brief to keep the conversation going.
            the aim is to get a job.

            Here is the user's information:
            Job Title: ${userInfo.jobTitle}
            Company: ${userInfo.company}
            Skills: ${userInfo.skills.join(', ')}
            
            ${conversationHistory.join('\n')}
            Your goal is to build a connection, learn more about the user's company and roles they are hiring for, and ask for a referral if applicable. Generate the next message in the conversation.
        `;

        const response = await openai.createCompletion({
            model: 'gpt-4o',
            // prompt,
            messages: [

                { role: "system", content: "You are a helpful assistant." },
          
                { role: "user", content: "Tell me a joke." }
          
              ],
            max_tokens: 150,
            n: 1,
            stop: ['\n'],
        });

        return response.data.choices[0].text.trim();
    }

    async function handleMessage(page) {
        let message = 'Hello, I am a recruiter at Omni. I would like to talk to you about a job opportunity. Please let me know if you are interested.';
        await page.waitForTimeout(500);
        let msgFrame = await page.getByLabel('Messaging')
        if (!await msgFrame.isVisible()){
            console.log('msgFrame is not visible')
            return
        }

        await msgFrame.scrollIntoViewIfNeeded();
        await msgFrame.hover();
        await msgFrame.click();

        const conversationHistory = await msgFrame.locator('p').allTextContents();
        const headerText = await msgFrame.locator('//header//a').innerText();

        const userInfo = await extractUserInfo(page);
        const { isHiringManager, domainInterest } = await analyzeProfile(userInfo);

        if (!isHiringManager || !domainInterest) {
            console.log('User is not a suitable lead. Ending conversation.');
            await handleClose(page);
            return;
        }

        const nextMessage = await generateNextMessage(conversationHistory, userInfo);

        if (await page.getByRole('button', { name: 'Send' }).isVisible()) {
            await page.fill('textarea', nextMessage);
            // await page.getByRole('button', { name: 'Send' }).click();
            console.log('Message sent');
            await page.waitForTimeout(500);
        } else {
            console.log('Send button is not visible');
            await handleClose(page);
        }
    }

    async function processMessageButtons(page) {
        await page.waitForSelector('.linked-area', { timeout: 10000 });
        const linkedAreaElements = await page.locator('.linked-area');
        const count = await linkedAreaElements.count();
        console.log(`Found ${count} linked-area elements`);
        let messageButtons = [];

        for (let i = 0; i < count; i++) {
            const linkedAreaElement = linkedAreaElements.nth(i);
            const messageButton = await linkedAreaElement.locator('button:has-text("Message")').elementHandle();
            if (messageButton) {
                messageButtons.push(messageButton);
            }
        }

        console.log(`Found ${messageButtons.length} message buttons`);

        for (const messageButton of messageButtons) {
            try {
                if (messageButton) {
                    await handleClose(page);
                    await handleMButton(messageButton);
                    await handleMessage(page);
                    await handleClose(page);
                } else {
                    console.log('Message button is not an element');
                }
            } catch (error) {
                console.error(`Error interacting with message button: ${error}`);
            }
        }

        await page.waitForTimeout(2000);

        if (await page.getByLabel('Next').isVisible()) {
            await page.getByLabel('Next').click();
            await page.waitForTimeout(1000);
            await processMessageButtons(page);
        } else {
            console.log('No more next button found');
        }
    }

    await processMessageButtons(page);
    await context.close();
})();
