const { bootstrap } = require("@kaholo/plugin-library");
const { createVariablesString } = require("./helpers");
const terraformCli = require("./terraform-cli");

async function runMainCommand(params) {
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
  });
}

module.exports = bootstrap({
  runCommand,
  runMainCommand,
});
