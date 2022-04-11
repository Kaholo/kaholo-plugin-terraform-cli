const { execTerraform, parseVars } = require("./helpers");

async function executeTerraformInit(action, settings) {
  return exeTf("init", action, settings);
}

async function executeTerraformApply(action, settings) {
  return exeTf("apply", action, settings);
}

async function executeTerraformPlan(action, settings) {
  return exeTf("plan", action, settings);
}

async function executeTerraformDestroy(action, settings) {
  return exeTf("destroy", action, settings);
}

async function exeTf(mode, action, settings) {
  const path = action.params.workingDir || settings.workingDir;
  let args;
  if (mode === "init") {
    args = action.params.upgrade ? ["-upgrade"] : [];
  } else {
    args = parseVars(action.params.vars);
  }
  if (action.params.varFile) { args.push(`-var-file="${action.params.varFile}"`); }
  if (mode === "apply" || mode === "destroy") { args.push("--auto-approve"); }
  if (action.params.options) { args.push(action.params.options); }
  return execTerraform(mode, args, path);
}

module.exports = {
  executeTerraformInit,
  executeTerraformApply,
  executeTerraformPlan,
  executeTerraformDestroy,
};
