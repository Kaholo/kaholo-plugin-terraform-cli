const { execTerraform, parseVars } = require("./helpers");

// async function executeTerraformInit(action, settings) {
//   const args = action.params.upgrade ? ["-upgrade"] : [];
//   const path = action.params.workingDir || settings.workingDir;
//   if (path) {
//     return execTerraform("init", args, path);
//   }
//   throw new Error("Parameter Working Directory is required.");
// }

async function executeTerraformInit(action, settings) {
  const args = action.params.upgrade ? ["-upgrade"] : [];
  const path = action.params.workingDir || settings.workingDir;
  return execTerraform("init", args, path);
}

async function executeTerraformApply(action, settings) {
  const args = parseVars(action.params.vars || []);
  if (action.params.varFile) { args.push(`-var-file="${action.params.varFile}"`); }
  if (action.params.options) { args.push(action.params.options); }
  args.push("--auto-approve");
  const path = action.params.workingDir || settings.workingDir;
  return execTerraform("apply", args, path);
}

async function executeTerraformPlan(action, settings) {
  const args = parseVars(action.params.vars);
  if (action.params.varFile) { args.push(`-var-file="${action.params.varFile}"`); }
  if (action.params.options) { args.push(action.params.options); }
  const path = action.params.workingDir || settings.workingDir;
  return execTerraform("plan", args, path);
}

async function executeTerraformDestroy(action, settings) {
  const args = parseVars(action.params.vars);
  if (action.params.varFile) { args.push(`-var-file="${action.params.varFile}"`); }
  if (action.params.options) { args.push(action.params.options); }
  args.push("--auto-approve");
  const path = action.params.workingDir || settings.workingDir;
  return execTerraform("destroy", args, path);
}

module.exports = {
  executeTerraformInit,
  executeTerraformApply,
  executeTerraformPlan,
  executeTerraformDestroy,
};
