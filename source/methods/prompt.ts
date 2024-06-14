import { TaskMessage } from "auto-playwright/dist/types";

export const prompt = (message: TaskMessage) => {
    return `This is your task: ${message.task}

    you've been given a form to fill, it mabe sigle page or multiple you should decide how to interact with the webpage to acheive our end goal with as few steps as possible if there is a next page click and refetch the new html and fill again untill the easy apply component is finished and complete the click dismiss
    use function actions 
    here is the modal you're working with ensure accurate element targeting of its value

     \`\`\`
    ${message.snapshot.dom}
    \`\`\`
  
  
  * When creating CSS selectors, ensure they are unique and specific enough to select only one element, even if there are multiple elements of the same type (like multiple h1 elements).
  * Avoid using generic tags like 'h1' alone. Instead, combine them with other attributes or structural relationships to form a unique selector.
  * You must not derive data from the page if you are able to do so by using one of the provided functions, e.g. locator_evaluate.
    fill the form input value with relevant values or closest similar option available especially for input fields, ensure you are targeting the right element and type and handling it correctly according to the standards mdn and playwright standards, if its a select option choose from list, make sure we're picking value from the dropdown. short output only to conserver token be smart about it.  LETS THING STEP BY STEP "
  
    use playwright locator methods to target elements they are more reliable
here is additional information on playwright selectors we are using https://playwright.dev/docs/input take note of the different input types and how they work take note of selectors. 
  Webpage snapshot:
  
 
  `;
  };
  

