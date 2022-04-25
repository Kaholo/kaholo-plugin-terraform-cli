const { bootstrap } = require("kaholo-plugin-library");
const { createVariablesText } = require("./helpers");
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
  const args = [];
  if (params.mode === "destroy" || params.mode === "apply") {
    args.push("--auto-approve");
  }
  const command = `${params.mode} ${args.join(" ")}`.trim();
  return runCommand({
    ...params,
    command,
  });
}

async function runCommand(params) {
  const variables = await createVariablesText(params);
  return terraformCli.execute({
    command: params.command,
    workingDirectory: params.workingDirectory,
    variables,
    pluckStdout: true,
  });
}

module.exports = bootstrap({
  getTerraformVersion,
  runCommand,
  runMainCommand,
});
