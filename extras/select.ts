import OpenAI from 'openai';
import { RunnableFunctionWithParse } from "openai/lib/RunnableFunction";
import { z } from "zod";
import sanitize from 'sanitize-html';
const openai = new OpenAI();

const task = () => {
    return `fill the form input value with Richard Okonicha email, and select country usa for phone number, and my new phone number is 090506321, ensure you are targeting the right element and type as you move along, if its a select option choose from list, make sure all locators are correct lets think step by step`
}

export const prompt = (dom: any) => {
    return `

    This is your task from user: ${task}

    You are an assistant designed to automate form submissions on LinkedIn's Easy Apply modal. The modal has multiple form fields such as select, radio, text, and file. You need to interact with these fields step-by-step and click the "Next" button to proceed until the form is complete, then click the "Submit" button.
  
    Here are the steps to follow:
  
    1. **Identify Form Fields**: Review the provided snapshot of the form modal and identify all the interactive fields (input, select, textarea, radio, file).
  
    2. **Fill Out Fields**:
        - For text inputs, use appropriate sample data.
        - For select dropdowns, choose the first available option.
        - For radio buttons, select the first option.
        - For file inputs, use a sample file available in the directory.
        - For textareas, fill with appropriate sample text.
  
    3. **Click Next**: After filling out the fields, click the "Next" button to proceed to the next tab of the form.
  
    4. **Repeat Steps 1-3**: Continue filling out fields and clicking "Next" until there are no more tabs to fill.
  
    5. **Submit Form**: Once all fields are filled and there are no more tabs, click the "Submit" button.
  
    Here is the snapshot of the current state of the modal:
    ${dom}
  
    Please execute these steps by invoking the appropriate functions from the provided tools and return the final state of the form submission.


    `;
  }

