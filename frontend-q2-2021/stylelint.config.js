module.exports = {
  defaultSeverity: 'error',
  extends: [
    'stylelint-config-sass-guidelines',
    'stylelint-config-rational-order',
    'stylelint-prettier/recommended',
  ],
  plugins: [
    'stylelint-no-px',
    'stylelint-order',
    'stylelint-config-rational-order/plugin',
    'stylelint-no-nested-media',
    'stylelint-use-nesting',
    'stylelint-prettier',
    'stylelint-csstree-validator',
  ],
  rules: {
    'unit-allowed-list': ['rem', 'vh', 'vw', '%', 'vmin', 'vmax', 'deg'],

    'meowtec/no-px': true,
    'pitcher/no-nested-media': true,
    'csstools/use-nesting': 'always',
    'prettier/prettier': true,
    'csstree/validator': true,

    'selector-max-id': null,
    'max-nesting-depth': null,
    'order/properties-alphabetical-order': null,
    'selector-max-compound-selectors': null,
  },
};
