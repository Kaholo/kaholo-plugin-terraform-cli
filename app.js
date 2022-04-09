const { execTerraform, parseVars } = require("./helpers");

async function executeTerraformInit(action, settings) {
  const args = action.params.UPGRADE ? ["-upgrade"] : [];
  return execTerraform("init", args, action.params.PATH);
}

async function executeTerraformApply(action, settings) {
  const args = parseVars(action.params.VAR || []);
  if (action.params.VARFILE) { args.push(`-var-file="${action.params.VARFILE}"`); }
  if (action.params.OTHER) { args.push(action.params.OTHER); }
  args.push("--auto-approve");

  return execTerraform("apply", args, action.params.PATH);
}

async function executeTerraformPlan(action, settings) {
  const args = parseVars(action.params.vars);
  if (action.params.varFile) { args.push(`-var-file="${action.params.varFile}"`); }
  if (action.params.OPTIONS) { args.push(action.params.OPTIONS); }
  return execTerraform("plan", args, action.params.PATH);
}

async function executeTerraformDestroy(action, settings) {
  const args = parseVars(action.params.vars);
  if (action.params.varFile) { args.push(`-var-file="${action.params.varFile}"`); }
  if (action.params.options) { args.push(action.params.options); }
  args.push("--auto-approve");
  return execTerraform("destroy", args, action.params.path);
}

module.exports = {
  executeTerraformInit,
  executeTerraformApply,
  executeTerraformPlan,
  executeTerraformDestroy,
};
