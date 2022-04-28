const { bootstrap } = require("kaholo-plugin-library");
const { createVariablesString } = require("./helpers");
const terraformCli = require("./terraform-cli");

async function getTerraformVersion() {
  return terraformCli.execute({
    command: "terraform version -json",
    pluckStdout: true,
  });
}

async function runMainCommand(params) {
  if (!params.workingDirectory) {
    throw new Error("Working Directory is required for this command.");
  }
  const additionalArgs = [];
  if (params.mode === "destroy" || params.mode === "apply") {
    additionalArgs.push("-auto-approve");
  }
  return runCommand({
    ...params,
    command: params.mode,
    additionalArgs,
  });
}

async function runCommand(params) {
  const variables = await createVariablesString(params);
  return terraformCli.execute({
    ...params,
    variables,
    pluckStdout: true,
  });
}

module.exports = bootstrap({
  getTerraformVersion,
  runCommand,
  runMainCommand,
});
