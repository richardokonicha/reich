import { Page } from "@playwright/test";
import { randomUUID } from "crypto";
import { RunnableFunctionWithParse } from "openai/lib/RunnableFunction";
import { z } from "zod";
import sanitize from 'sanitize-html';

const sanitizeHtml = (subject: string): string => {
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

export const createActions = (
  page: Page
): Record<string, RunnableFunctionWithParse<any>> => {
  const locatorMap = new Map();

  const getLocator = (elementId: string) => {
    const locator = locatorMap.get(elementId);

    if (!locator) {
      throw new Error('Unknown elementId "' + elementId + '"');
    }

    return locator;
  };

  return {
    locateElement: {
      function: async (args: { cssSelector: string }) => {
        const locator = await page.locator(args.cssSelector);
        const elementId = randomUUID();
        locatorMap.set(elementId, locator);
        return { elementId };
      },
      name: "locateElement",
      description:
        "Locates element using a CSS selector and returns elementId. This element ID can be used with other functions to perform actions on the element.",
      parse: (args: string) => {
        return z
          .object({
            cssSelector: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          cssSelector: {
            type: "string",
          },
        },
      },
    },
    locator_evaluate: {
      function: async (args: { pageFunction: string; elementId: string }) => {
        return {
          result: sanitizeHtml(await getLocator(args.elementId).evaluate(args.pageFunction)),
        };
      },
      description:
        "Execute JavaScript code in the page, taking the matching element as an argument.",
      name: "locator_evaluate",
      parameters: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
          },
          pageFunction: {
            type: "string",
            description:
              "Function to be evaluated in the page context, e.g. node => node.innerText",
          },
        },
      },
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
            pageFunction: z.string(),
          })
          .parse(JSON.parse(args));
      },
    },
    locator_getAttribute: {
      function: async (args: { attributeName: string; elementId: string }) => {
        return {
          attributeValue: sanitizeHtml(await getLocator(args.elementId).getAttribute(args.attributeName)),
        };
      },
      name: "locator_getAttribute",
      description: "Returns the matching element's attribute value.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
            attributeName: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          attributeName: {
            type: "string",
          },
          elementId: {
            type: "string",
          },
        },
      },
    },
    locator_innerHTML: {
      function: async (args: { elementId: string }) => {
        return { innerHTML: sanitizeHtml(await getLocator(args.elementId).innerHTML()) };
      },
      name: "locator_innerHTML",
      description: "Returns the element.innerHTML.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
          },
        },
      },
    },
    locator_innerText: {
      function: async (args: { elementId: string }) => {
        return { innerText: sanitizeHtml(await getLocator(args.elementId).innerText()) };
      },
      name: "locator_innerText",
      description: "Returns the element.innerText.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
          },
        },
      },
    },
    locator_textContent: {
      function: async (args: { elementId: string }) => {
        return {
          textContent: sanitizeHtml(await getLocator(args.elementId).textContent()),
        };
      },
      name: "locator_textContent",
      description: "Returns the node.textContent.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
          },
        },
      },
    },
    locator_inputValue: {
      function: async (args: { elementId: string }) => {
        return {
          inputValue: sanitizeHtml(await getLocator(args.elementId).inputValue()),
        };
      },
      name: "locator_inputValue",
      description:
        "Returns input.value for the selected <input> or <textarea> or <select> element.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
          },
        },
      },
    },
    locator_selectOption: {
      function: async (args: { elementId: string; value: string }) => {
        const locator = getLocator(args.elementId);
        await locator.selectOption({ value: args.value });
        return { success: true };
      },
      name: "locator_selectOption",
      description: "Select an option from a dropdown by value.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
            value: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
          },
          value: {
            type: "string",
          },
        },
      },
    },
    locator_blur: {
      function: async (args: { elementId: string }) => {
        await getLocator(args.elementId).blur();
        return { success: true };
      },
      name: "locator_blur",
      description: "Removes keyboard focus from the current element.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
          },
        },
      },
    },
  };
};
