const { resolve: resolvePath } = require("path");
const pluginLib = require("@kaholo/plugin-library");

const {
  validateDirectoryPath,
  convertMapToObject,
  generateRandomTemporaryPath,
  saveToRandomTemporaryFile,
  shredTerraformVarFile,
  getCurrentUserId,
  asyncExec,
} = require("./helpers");

function createTerraformCommand(baseCommand, {
  variableFile,
  json,
  additionalArgs = [],
}) {
  const command = baseCommand.startsWith("terraform ") ? baseCommand.substring(10) : baseCommand;
  const postArgs = [...additionalArgs];
  if (variableFile) {
    postArgs.push("-var-file=$TERRAFORM_VAR_FILE_MOUNT_POINT");
  }
  if (json) {
    if (baseCommand !== "init") {
      postArgs.push("-json");
    } else {
      console.error("JSON Output is not supported for this Terraform command.");
    }
  }
  return `${command} ${postArgs.join(" ")}`;
}

async function execute(params) {
  const {
    workingDirectory,
    command,
    baseCommand,
    variables,
    secretEnvVariables,
    rawOutput,
    additionalArgs,
    customDockerImage,
  } = params;

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

  let terraformCommand;
  // handle method runCommand
  if (command) {
    const commandString = command.join(" ");
    terraformCommand = commandString.startsWith("terraform ") ? commandString.substring(10) : commandString;
    if (!rawOutput && !commandString.includes("-json")) {
      terraformCommand = `${terraformCommand} -json`;
    }
  }

  // handle method runMainCommand
  if (baseCommand) {
    terraformCommand = createTerraformCommand(baseCommand, {
      variableFile: environmentVariables.has("TERRAFORM_VAR_FILE_MOUNT_POINT"),
      json: !rawOutput,
      additionalArgs,
    });
  }

  const dockerEnvs = secretEnvVariables ? pluginLib.parsers.keyValuePairs(secretEnvVariables) : {};

  const buildDockerCommandOptions = {
    image: customDockerImage,
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
    error,
    parsedObjects,
  } = await asyncExec({
    command: dockerCommand,
    onProgressFn: process.stdout.write.bind(process.stdout),
    options: {
      env: {
        ...convertMapToObject(environmentVariables),
        ...dockerEnvs,
      },
    },
  });

  if (environmentVariables.has("TERRAFORM_VAR_FILE")) {
    await shredTerraformVarFile(environmentVariables.get("TERRAFORM_VAR_FILE"));
  }

  if (parsedObjects) {
    return parsedObjects;
  }

  if (error) {
    if (!rawOutput) {
      console.error("\nRECOMMENDATION: Try enabling parameter Raw Output for a more meaningful error message.\n");
    }
    throw new Error(error);
  }

  return "";
}

module.exports = {
  execute,
};
