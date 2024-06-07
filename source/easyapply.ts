import { initializePlay, login, scrollJobList } from "./methods/utils";
import { config } from "./methods/config";
import { Page } from "playwright";


(async () => {
    try {
        const page = await initializePlay();
        await login(page);
        await page.goto(config.linkedin.job);
        await page.waitForLoadState();
        await scrollJobList(page);

        // After stopping scrolling, process the job cards
        const jobList = page.locator('div.jobs-search-results-list .job-card-container');
        const jobCount = await jobList.count();
        jobList.first().scrollIntoViewIfNeeded();

        // Loop through each job card and click on it
        for (let i = 0; i < jobCount; i++) {
            const jobCard = jobList.nth(i);
            await jobCard.scrollIntoViewIfNeeded();
            await jobCard.click();

            // Interact with the Easy Apply and Dismiss buttons
            try {
                await page.getByRole('button', { name: 'Easy Apply' }).click();
                const easyModal = await page.locator('div [role="dialog"].jobs-easy-apply-modal').waitFor({state: "visible"});
                // Do something with the Easy Apply modal here

                await page.getByRole('button', { name: 'Dismiss' }).click();
            } catch (error) {
                console.log(`Error clicking Easy Apply or Dismiss for job ${i}:`, error);
            }

            // Optionally, you can add a wait here if there are actions that need to complete before moving to the next item
            // await page.waitForTimeout(1000); // Wait for 1 second
        }

        console.log("Done! Check Output");

    } catch (error) {
        console.error("Error in main function: ", error);
    }
})();
