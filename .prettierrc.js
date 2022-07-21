'use strict';

module.exports = {
  singleQuote: true,
  htmlWhitespaceSensitivity: 'css',
  overrides: [
    {
      files: ['*.hbs'],
      options: {
        singleQuote: false,
      },
    },
    {
      files: ['*.yml'],
      options: {
        singleQuote: false,
      },
    },
  ],
};
