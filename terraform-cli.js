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

async function createDockerCommand({
  terraformCommand,
  mountTerraformDir = false,
  mountVariables = false,
}) {
  const user = await getCurrentUserId();
  return `
    docker run --rm \
    --user ${user} \
    ${mountTerraformDir ? "-v $TERRAFORM_DIR:$TERRAFORM_DIR_MOUNT_POINT" : ""} \
    ${mountVariables ? "-v $TERRAFORM_VAR_FILE:$TERRAFORM_VAR_FILE_MOUNT_POINT" : ""} \
    ${TERRAFORM_DOCKER_IMAGE} ${terraformCommand}
  `.trim();
}

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

async function execute({
  workingDirectory,
  command,
  variables,
  rawOutput,
  additionalArgs,
  pluckStdout = false,
}) {
  const environmentVariables = new Map();
  if (workingDirectory) {
    await validateDirectoryPath(workingDirectory);
    environmentVariables.set("TERRAFORM_DIR", workingDirectory);
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

  const dockerCommand = await createDockerCommand({
    mountTerraformDir: Boolean(workingDirectory),
    mountVariables: Boolean(variables),
    terraformCommand,
  });

  let result;
  try {
    result = await exec(dockerCommand, { env: convertMapToObject(environmentVariables) });
  } catch (error) {
    if (error.stdout) {
      throw tryParseTerraformJsonOutput(error.stdout);
    } else {
      throw new Error(error.stderr ?? error.message ?? error);
    }
  } finally {
    if (environmentVariables.has("TERRAFORM_VAR_FILE")) {
      await shredTerraformVarFile(environmentVariables.get("TERRAFORM_VAR_FILE"));
    }
  }
  result.stdout = tryParseTerraformJsonOutput(result.stdout);
  return pluckStdout ? result.stdout : result;
}

module.exports = {
  execute,
};
