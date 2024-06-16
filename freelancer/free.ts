import { aigen, initializePlay, login } from "./utils";
import { config } from "./config";
import { Page } from "playwright";

(async () => {
    try {
        const page: Page = await initializePlay();
        await login(page);

        // Wait for the page to fully load
        await page.waitForTimeout(5000);
        await page.goto(config.freelancer.job);
        await page.waitForLoadState('domcontentloaded');

        // Fetch job links
        const jobList = page.locator('app-search-results-projects a');
        const jobCount = await jobList.count();
        const hrefs = [];

        for (let i = 0; i < Math.min(jobCount, 2); i++) {
            const href = await jobList.nth(i).getAttribute('href');
            if (href) hrefs.push(href);
        }

        if (hrefs.length === 0) {
            console.log("No jobs found");
            return;
        }

        for (const href of hrefs) {
            await page.waitForLoadState();
            await page.waitForTimeout(5000);
            await page.goto(`${config.freelancer.home}${href}`);

            // Extract job title and description
            const title = await page.locator("app-project-title h1").innerText();
            const description = await page.locator("app-project-details-description").innerText();

            console.log("Title: ", title);
            console.log("Description: ", description);
            console.log("Visited: ", `${config.freelancer.home}${href}`);

            // Generate proposal using aigen function
            const proposal = await aigen(title, description);

            // Fill in the proposal form
            const textarea = page.locator("app-bid-form textarea");
            await textarea.fill(proposal);

            // Submit the proposal
            await page.waitForTimeout(5000);
            await page.locator("app-bid-description-button button").click();
            await page.waitForTimeout(5000);
        }

        console.log("Done! Check Output");
    } catch (error) {
        console.error("Error in main function: ", error);
    }
})();
