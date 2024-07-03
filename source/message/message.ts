import { config } from './config';
import { initializePlay, loginLinkedin, handleClose, handleMButton, handleMessage, getMessageButtons, continueNext } from './utils';
import { Page } from 'playwright';

export async function startMessaging(page: Page) {
    try {
        const messageButtons = await getMessageButtons(page)
        for (const messageButton of messageButtons) {
            try {
                await handleClose(page);
                await handleMButton(page, messageButton);
                await handleMessage(page);
                await handleClose(page);
            } catch (error) {
                console.error(`Error interacting with message button: ${error}`);
            }
        }
        continueNext(page);
    } catch (error) {
        console.error("Error during search: ", error);
        throw error;} finally {return true;}
}

(async () => {
    const { page, browser } = await initializePlay(config.dataPath);
    try {
        await loginLinkedin(page);
        await page.goto(config.linkedin.people);
        await startMessaging(page);
        console.log("Done! Check Output");
    } catch (error) {
        console.error("Error in main function: ", error);
    } finally {
        await browser.close();
    }
})();
