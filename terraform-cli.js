const { resolve: resolvePath } = require("path");
const pluginLib = require("@kaholo/plugin-library");

const {
  validateDirectoryPath,
  convertMapToObject,
  generateRandomTemporaryPath,
  saveToRandomTemporaryFile,
  shredTerraformVarFile,
  tryParseTerraformJsonOutput,
  isJsonAllowed,
  getCurrentUserId,
  exec,
} = require("./helpers");

const { TERRAFORM_DOCKER_IMAGE } = require("./consts.json");

function createTerraformCommand(baseCommand, {
  workingDirectory,
  variableFile,
  json,
  additionalArgs = [],
}) {
  const command = baseCommand.startsWith("terraform ") ? baseCommand.substring(10) : baseCommand;
  const postArgs = [...additionalArgs, "-no-color"];
  const preArgs = [];
  if (workingDirectory) {
    preArgs.push("-chdir=$TERRAFORM_DIR_MOUNT_POINT");
  }
  if (variableFile) {
    postArgs.push("-var-file=$TERRAFORM_VAR_FILE_MOUNT_POINT");
  }
  if (json) {
    if (isJsonAllowed(command)) {
      postArgs.push("-json");
    } else {
      console.error("JSON Output is not supported for this Terraform command.");
    }
  }
  return `${preArgs.join(" ")} ${command} ${postArgs.join(" ")}`;
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
  if (absoluteWorkingDirectory) {
    await validateDirectoryPath(absoluteWorkingDirectory);
    environmentVariables.set("TERRAFORM_DIR", absoluteWorkingDirectory);
    environmentVariables.set("TERRAFORM_DIR_MOUNT_POINT", generateRandomTemporaryPath());
  }
  if (variables) {
    const fileName = await saveToRandomTemporaryFile(variables);
    environmentVariables.set("TERRAFORM_VAR_FILE", fileName);
    environmentVariables.set("TERRAFORM_VAR_FILE_MOUNT_POINT", generateRandomTemporaryPath());
  }

  const terraformCommand = createTerraformCommand(command, {
    workingDirectory: environmentVariables.has("TERRAFORM_DIR_MOUNT_POINT"),
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
      absoluteWorkingDirectory ? "-v $TERRAFORM_DIR:$TERRAFORM_DIR_MOUNT_POINT" : "",
      variables ? "-v $TERRAFORM_VAR_FILE:$TERRAFORM_VAR_FILE_MOUNT_POINT" : "",
    ],
  };

  if (dockerEnvs) {
    buildDockerCommandOptions.environmentVariables = dockerEnvs;
  }

  const dockerCommand = pluginLib.docker.buildDockerCommand(buildDockerCommandOptions);
  // console.error(JSON.stringify(dockerCommand));

  let result;
  try {
    result = await exec(dockerCommand, {
      env: {
        ...convertMapToObject(environmentVariables),
        ...dockerEnvs,
      },
    });
  } catch (error) {
      throw new Error(error.stderr ?? error.message);
  } finally {
    if (environmentVariables.has("TERRAFORM_VAR_FILE")) {
      await shredTerraformVarFile(environmentVariables.get("TERRAFORM_VAR_FILE"));
    }
  }

  result.stdout = tryParseTerraformJsonOutput(result.stdout);
  return result.stdout;
}

module.exports = {
  execute,
};
