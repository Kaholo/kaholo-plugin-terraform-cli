const {
  execTerraform,
  parseVars,
  makeVarFile,
} = require("./helpers");

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
  const workDir = action.params.workingDirectory || settings.workingDirectory;
  let args;

  if (mode === "init") {
    args = action.params.upgrade ? ["-upgrade"] : [];
  } else {
    args = parseVars(action.params.vars);
  }
  if (action.params.varFile) {
    args.push(`-var-file="${action.params.varFile}"`);
  }
  if (mode === "apply" || mode === "destroy") { args.push("--auto-approve"); }
  if (action.params.options) {
    args.push(action.params.options);
  }
  if (action.params.secretVarFile) {
    const svfName = await makeVarFile(action.params.secretVarFile, workDir);
    args.push(`-var-file="${svfName}"`);
    // this securely deletes any files matching temp-9bxY9f-* in the working directory
    const shredArray = [
      "temp9bxY9fcount=$(ls | grep temp-9bxY9f- | wc -l)", // count them
      "if [ $temp9bxY9fcount -gt 0 ]", // if any exist
      "then shred -n 3 -z -u temp-9bxY9f-*", // shred them
      "fi",
    ];
    const shredCmd = shredArray.join("; ");
    args.push(`; ${shredCmd}`);
  }
  return execTerraform(mode, args, workDir);
}

module.exports = {
  executeTerraformInit,
  executeTerraformApply,
  executeTerraformPlan,
  executeTerraformDestroy,
};
