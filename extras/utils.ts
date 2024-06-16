import sanitize from 'sanitize-html';

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
    },
    transformTags: {
      'select': (tagName, attribs) => {
        // Example: Remove options for sanitization and dynamic loading
        if (attribs['id'] && attribs['id'] === 'country-select') {
          return {
            tagName: 'select',
            attribs: { ...attribs },
            text: '' // Removes the options, assume dynamic loading
          };
        }
        return { tagName, attribs };
      },
    },
  });
};
