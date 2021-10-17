const fs = require('fs');
const path = require('path');

console.log('=========checking translations=========');

const folder = path.join(__dirname, '..', 'src', 'i18n');
let translations = {};

fs.readdirSync(folder).forEach((file) => {
  if (!file.endsWith('.json')) {
    return;
  }

  const locale = file.replace(/\.json$/, '');
  translations = {
    ...translations,
    [locale]: require(`${folder}/${file}`),
  };
});

const findVariables = (key) => {
  let results = [];
  let state = 0;
  let currentName = '';

  for (char of key) {
    if (state === 0) {
      //searching for start char
      if (char === '{') {
        state = 1;
      }
    } else if (state === 1) {
      // searching for end char
      if (char === '}') {
        results = [...results, currentName];
        currentName = '';
        state = 0;
      } else {
        currentName += char;
      }
    }
  }

  return results;
};

let foundError = false;
const iterate = (position, translations) => {
  Object.entries(translations).forEach(([key, value]) => {
    let error = false;
    const currentPosition = `${position}.${key}`;
    if (typeof value === 'object' && value !== null) {
      if (Object.keys(value).length === 0) {
        error = 'is an empty object';
      } else {
        iterate(currentPosition, value);
      }
    } else if (typeof value !== 'string') {
      error = 'is not a string';
    } else {
      if (value === '') {
        error = 'is an empty string';
      } else if (value.includes('"')) {
        error = "contains XSS vulnerability (use '&quot;' instead of '\"')";
      } else if (value.includes("'")) {
        error = 'contains XSS vulnerability (use "&apos;" instead of "\'")';
      } else if (/&(?!amp;|lt;|gt;|quot;|apos;|#[0-9a-fA-F]{1,4};)/.test(value)
      ) {
        error = 'contains XSS vulnerability or invalid html escaping sequence (use "&amp;" instead of "&" or fix the html escaping sequence)';
      } else if (value.includes('<')) {
        error = 'contains XSS vulnerability (use "&lt;" instead of "<")';
      } else if (value.includes('>')) {
        error = 'contains XSS vulnerability (use "&gt;" instead of ">")';
      } else if (/[\r\n]/.test(value)) {
        error = 'contains unnecessary new-line chars';
      } else if (value.trim() !== value) {
        error = 'contains unnecessary spacing';
      } else if (value.includes('  ')) {
        error = 'double spacing';
      } else {
        const variablesInKey = findVariables(key).sort(); //eslint-disable-line ts-immutable/immutable-data
        const variablesInValue = findVariables(value).sort(); //eslint-disable-line ts-immutable/immutable-data

        if (variablesInKey.length !== variablesInValue.length) {
          error = 'amount of variables mismatch';
        } else {
          for (let i = 0; i < variablesInKey.length; i++) {
            if (variablesInKey[0] !== variablesInValue[0]) {
              error = `variable "${variablesInKey[0]}" not found in translation`;
              break;
            }
          }
        }
      }
    }

    if (error) {
      foundError = true;
      console.log(`"${currentPosition}" ${error}: ${JSON.stringify(value)}`);
    }
  });
};

Object.keys(translations).forEach((locale) => {
  iterate(locale, translations[locale]);
});

console.log('=========finished checking translations=========');

if (foundError) {
  process.exit(2);
}
