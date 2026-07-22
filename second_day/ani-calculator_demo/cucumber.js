module.exports = {
  default: {
    // Gherkin feature files live under docs/ per project conventions (AGENTS.md).
    paths: ['docs/features/**/*.feature'],
    require: ['test/support/**/*.ts', 'test/step-definitions/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: ['progress-bar'],
    publishQuiet: true,
  },
};
