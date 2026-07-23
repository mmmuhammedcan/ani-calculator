module.exports = {
  default: {
    requireModule: ["ts-node/register"],
    require: ["tests/support/**/*.ts", "tests/steps/**/*.ts"],
    paths: ["docs/features/**/*.feature"],
    format: ["progress"]
  }
};
