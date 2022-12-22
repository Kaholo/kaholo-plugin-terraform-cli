const { resolve: resolvePath } = require("path");
const { docker } = require("@kaholo/plugin-library");

const {
  validateDirectoryPath,
  convertMapToObject,
  generateRandomTemporaryPath,
  saveToRandomTemporaryFile,
  shredTerraformVarFile,
  tryParseTerraformJsonOutput,
  isJsonAllowed,
  logToActivityLog,
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
  if (json && isJsonAllowed(command)) {
    postArgs.push("-json");
  }
  return `${preArgs.join(" ")} ${command} ${postArgs.join(" ")}`.trim();
}

function splitVariablesString(secretEnvVariables) {
  if (secretEnvVariables) {
    return secretEnvVariables.split(/\s+/);
  }
  return null;
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
  const absoluteWorkingDirectory = workingDirectory ? resolvePath(workingDirectory) : "";
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
  logToActivityLog(`Generated Terraform command: ${terraformCommand}`);

  const dockerEnvs = splitVariablesString(secretEnvVariables);

  const dockerCommand = docker.buildDockerCommand({
    image: TERRAFORM_DOCKER_IMAGE,
    command: terraformCommand,
    user: await getCurrentUserId(),
    additionalArguments: [
      `${absoluteWorkingDirectory ? "-v $TERRAFORM_DIR:$TERRAFORM_DIR_MOUNT_POINT" : ""} \
       ${variables ? "-v $TERRAFORM_VAR_FILE:$TERRAFORM_VAR_FILE_MOUNT_POINT" : ""} \
       ${dockerEnvs ? dockerEnvs.reduce((acc, env) => `${acc}-e ${env} `, "") : " "}\
    `],
  });

  let result;
  try {
    result = await exec(dockerCommand, { env: convertMapToObject(environmentVariables) });
  } catch (error) {
    if (error.message) {
      throw tryParseTerraformJsonOutput(error.message);
    } else {
      throw new Error(error.stdout ?? error.stderr ?? error);
    }
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
