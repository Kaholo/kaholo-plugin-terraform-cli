const {
  validateDirectoryPath, convertMapToObject, randomTmpName,
  exec, createTemporaryFile, shredTerraformVarFiles, tryParseTerraformJsonOutput, isJsonAllowed,
} = require("./helpers");
const { TERRAFORM_DOCKER_IMAGE } = require("./consts.json");

function createDockerTerraformCommand({ mountVolume = false, mountVariables = false }) {
  return `
    docker run \
    -e TERRAFORM_COMMAND \
    -e TERRAFORM_DIR \
    ${mountVolume ? "-v $TERRAFORM_DIR:$TERRAFORM_DIR_MOUNT_POINT" : ""} \
    ${mountVariables ? "-v $TERRAFORM_VAR_FILE:$TERRAFORM_VAR_FILE_MOUNT_POINT" : ""} \
    --rm ${TERRAFORM_DOCKER_IMAGE} \
    $TERRAFORM_COMMAND
  `.trim();
}

function constructTerraformCommand(baseCommand, { workingDirectory, variableFile }) {
  const command = baseCommand.startsWith("terraform ") ? baseCommand.substring(10) : baseCommand;
  const postArgs = [];
  const preArgs = [];
  if (workingDirectory) {
    preArgs.push(`-chdir=${workingDirectory}`);
  }
  if (variableFile) {
    postArgs.push(`-var-file=${variableFile}`);
  }
  if (isJsonAllowed(command)) {
    postArgs.push("-json");
  }
  return `${preArgs.join(" ")} ${command} ${postArgs.join(" ")}`.trim();
}

async function execute({
  workingDirectory, command, variables, pluckStdout = false,
}) {
  const env = new Map();
  if (workingDirectory) {
    await validateDirectoryPath(workingDirectory);
    env.set("TERRAFORM_DIR", workingDirectory);
    env.set("TERRAFORM_DIR_MOUNT_POINT", randomTmpName());
  }
  if (variables) {
    const fileName = await createTemporaryFile(variables);
    env.set("TERRAFORM_VAR_FILE", fileName);
    env.set("TERRAFORM_VAR_FILE_MOUNT_POINT", randomTmpName());
  }

  const terraformCommand = constructTerraformCommand(command, {
    workingDirectory: env.get("TERRAFORM_DIR_MOUNT_POINT"),
    variableFile: env.get("TERRAFORM_VAR_FILE_MOUNT_POINT"),
  });
  env.set("TERRAFORM_COMMAND", terraformCommand);

  const dockerCommand = createDockerTerraformCommand({
    mountVolume: Boolean(workingDirectory),
    mountVariables: Boolean(variables),
  });

  let result;
  try {
    result = await exec(dockerCommand, { env: convertMapToObject(env) });
  } catch (error) {
    if (error.stdout) {
      throw tryParseTerraformJsonOutput(error.stdout);
    } else {
      throw new Error(error.stderr ?? error.message ?? error);
    }
  } finally {
    if (env.has("TERRAFORM_VAR_FILE")) {
      await shredTerraformVarFiles();
    }
  }
  result.stdout = tryParseTerraformJsonOutput(result.stdout);
  return pluckStdout ? result.stdout : result;
}

module.exports = {
  execute,
};
