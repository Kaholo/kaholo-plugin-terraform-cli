const { bootstrap } = require("@kaholo/plugin-library");
const { createVariablesString } = require("./helpers");
const terraformCli = require("./terraform-cli");

async function getTerraformVersion() {
  return terraformCli.execute({
    command: "terraform version -json",
  });
}

async function runMainCommand(params) {
  const additionalArgs = [];
  if (params.mode === "destroy" || params.mode === "apply") {
    additionalArgs.push("-auto-approve");
  }

  const newParams = {
    ...params,
    command: params.mode,
    additionalArgs,
  };
  const variables = await createVariablesString(newParams);

  return terraformCli.execute({
    ...newParams,
    variables,
  });
}

async function runCommand(params) {
  const variables = await createVariablesString(params);

  return terraformCli.execute({
    ...params,
    variables,
  });
}

module.exports = bootstrap({
  getTerraformVersion,
  runCommand,
  runMainCommand,
});
