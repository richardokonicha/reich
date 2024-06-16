import { Page, chromium } from "playwright";
import sanitize from "sanitize-html";
import { browserArgs, config, contextOptions } from "./config";
import path from 'path';
import OpenAI from "openai";
const openai = new OpenAI();

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

export async function login(page: Page) {
    console.log("Login..")
    try {
        await page.goto(config.freelancer.home);
        await page.waitForTimeout(5000);
        const currentUrl = page.url();
        if (currentUrl.includes('login')) {
            // await page.goto(config.linkedin.login);
            console.log('Login Page');
            await page.locator('form.LoginForm #emailOrUsernameInput').fill(config.freelancer.email);
            await page.locator('form.LoginForm #passwordInput').fill(config.freelancer.password);
            await page.locator('form.LoginForm app-login-signup-button button').click();
            // await page.goto(config.freelancer.home)
            return true;
        } else {
            console.log('Logged in".');
            await page.goto(config.freelancer.home);
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

export async function aigen(title: string, description: string) {
    const system = `
    You are https://www.linkedin.com/in/richardokonicha/, a senior software engineer with vast experience in fullstack development and cloud, responding to job proposals on freelancer.com. 
    Your responses should be friendly, concise, and express genuine interest in the project. 
    Briefly introduce your skills and relevant experience, ask clarifying questions to understand the client's needs, 
    and demonstrate how you can help them achieve their goals. 
    End with encouragement for further discussion. 
    Response should be under 250 characters, avoiding filler text. 
    All lowercase, short-form English response.
    `;
    const proposal = `
    Project: ${title}\n
    Description: ${description}
    `;
    const completion = await openai.chat.completions.create({
        messages: [
            {"role": "system", "content": system},
            {"role": "user", "content": proposal}
        ],
        model: "gpt-4o",
    });
    if (completion.choices[0].message.content == null) {throw new Error("No response from AI")};
    return completion.choices[0].message.content;
}