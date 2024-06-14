import { initializePlay, login, sanitizeHtml, scrollJobList } from "./methods/utils";
import { config } from "./methods/config";
import { Page } from "playwright";
import { aiWrite } from "./methods/aiwrite";

(async () => {
    try {
        const page: Page = await initializePlay();
        await login(page);
        await page.goto(config.linkedin.job);
        
        // Optionally, you can uncomment the following lines if you need to wait for the page to load completely or scroll the job list
        await page.waitForLoadState();
        await scrollJobList(page);

        const jobList = page.locator('div.jobs-search-results-list .job-card-container');
        const jobCount = await jobList.count();
        // jobList.first().scrollIntoViewIfNeeded();

        // Loop through each job card and click on it
        for (let i = 0; i < jobCount; i++) {
            const jobCard = jobList.nth(i);
            await jobCard.click();

            // Interact with the Easy Apply and Dismiss buttons
            try {
                const easyApplyButton = page.getByRole('button', { name: 'Easy Apply' });
                if (await easyApplyButton.isVisible()) {
                    await easyApplyButton.click();
                    const easyModal = page.locator('div[role="dialog"].jobs-easy-apply-modal');
                    // Do something with the Easy Apply modal here
                    if (await easyModal.isVisible()) {

                        while (await easyModal.locator("div.jobs-easy-apply-content progress").inputValue){
                            console.log(await easyModal.locator("div.jobs-easy-apply-content progress").inputValue, "input value")
                            await aiWrite("click the next button", easyModal);
                        }


                    }
                    await easyModal.waitFor({ state: "hidden"});
                }
                } catch (error) {
                console.error(`Error interacting with job card ${i}:`, error);
                }
        }


        console.log("Done! Check Output");

    } catch (error) {
        console.error("Error in main function: ", error);
    }
})();
