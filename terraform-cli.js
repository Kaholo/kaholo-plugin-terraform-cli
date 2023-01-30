const { resolve: resolvePath } = require("path");
const pluginLib = require("@kaholo/plugin-library");

const {
  validateDirectoryPath,
  generateRandomTemporaryPath,
  saveToRandomTemporaryFile,
  shredTerraformVarFile,
  tryParseTerraformJsonOutput,
  isJsonAllowed,
  getCurrentUserId,
  asyncExec,
} = require("./helpers");

const { TERRAFORM_DOCKER_IMAGE } = require("./consts.json");

function createTerraformCommand(baseCommand, {
  variableFile,
  json,
  additionalArgs = [],
}) {
  const command = baseCommand.startsWith("terraform ") ? baseCommand.substring(10) : baseCommand;
  const postArgs = [...additionalArgs, "-no-color"];

  if (variableFile) {
    postArgs.push("-var-file=$TERRAFORM_VAR_FILE_MOUNT_POINT");
  }

  if (json && isJsonAllowed(command)) {
    postArgs.push("-json");
  } else if (json) {
    console.error("JSON Output is not supported for this Terraform command.");
  }

  return `${command} ${postArgs.join(" ")}`;
}

async function execute({
  workingDirectory,
  command,
  variables,
  secretEnvVariables,
  rawOutput,
  additionalArgs,
}) {
  const environmentVariables = new Map();
  const absoluteWorkingDirectory = workingDirectory ? resolvePath(workingDirectory) : process.cwd();
  await validateDirectoryPath(absoluteWorkingDirectory);
  environmentVariables.set("TERRAFORM_DIR", absoluteWorkingDirectory);
  environmentVariables.set("TERRAFORM_DIR_MOUNT_POINT", generateRandomTemporaryPath());

  if (variables) {
    const fileName = await saveToRandomTemporaryFile(variables);
    environmentVariables.set("TERRAFORM_VAR_FILE", fileName);
    environmentVariables.set("TERRAFORM_VAR_FILE_MOUNT_POINT", generateRandomTemporaryPath());
  }

  const terraformCommand = createTerraformCommand(command, {
    variableFile: environmentVariables.has("TERRAFORM_VAR_FILE_MOUNT_POINT"),
    json: !rawOutput,
    additionalArgs,
  });

  const dockerEnvs = secretEnvVariables ? pluginLib.parsers.keyValuePairs(secretEnvVariables) : {};

  const buildDockerCommandOptions = {
    image: TERRAFORM_DOCKER_IMAGE,
    command: terraformCommand,
    user: await getCurrentUserId(),
    additionalArguments: [
      "-w $TERRAFORM_DIR_MOUNT_POINT",
      "-v $TERRAFORM_DIR:$TERRAFORM_DIR_MOUNT_POINT",
      variables ? "-v $TERRAFORM_VAR_FILE:$TERRAFORM_VAR_FILE_MOUNT_POINT" : "",
    ],
  };

  if (dockerEnvs) {
    buildDockerCommandOptions.environmentVariables = dockerEnvs;
  }

  const dockerCommand = pluginLib.docker.buildDockerCommand(buildDockerCommandOptions);

  const {
    stdout,
    error,
  } = await asyncExec({
    command: dockerCommand,
    onProgressFn: console.info,
    options: {
      env: {
        ...Object.fromEntries(environmentVariables.entries()),
        ...dockerEnvs,
      },
    },
  });

  if (environmentVariables.has("TERRAFORM_VAR_FILE")) {
    await shredTerraformVarFile(environmentVariables.get("TERRAFORM_VAR_FILE"));
  }

  if (error) {
    if (!rawOutput) {
      console.info("\nRECOMMENDATION: Try enabling parameter Raw Output for a more meaningful error message.\n");
    }
    console.error(error);
    throw new Error(`Command error occurred: ${error.message}`);
  }

  return tryParseTerraformJsonOutput(stdout);
}

module.exports = {
  execute,
};
