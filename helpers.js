const childProcess = require("child_process");
const { promisify } = require("util");
const {
  access,
  lstat,
  readFile,
  writeFile,
} = require("fs/promises");
const { resolve: resolvePath } = require("path");

const exec = promisify(childProcess.exec);

async function createVariablesString({
  varFile,
  variables,
  secretVariables,
  workingDirectory,
}) {
  let variablesText = "";

  if (varFile) {
    const resolvedVarFilePath = workingDirectory
      ? resolvePath(workingDirectory, varFile)
      : varFile;
    if (!await pathExists(resolvedVarFilePath)) {
      throw new Error(`Variable File path "${resolvedVarFilePath}" does not exist!`);
    }
    if (!await isPathFile(resolvedVarFilePath)) {
      throw new Error(`Variable File path "${resolvedVarFilePath}" is not a file!`);
    }
    const fileContent = await readFile(resolvedVarFilePath);
    variablesText += fileContent.toString();
    variablesText += "\n";
  }
  if (secretVariables) {
    variablesText += secretVariables;
    variablesText += "\n";
  }
  if (variables) {
    // parameter is "type": "text", but might be stringified JSON
    try {
      const varsObj = JSON.parse(variables);
      const pairs = Object.keys(varsObj).map((key) => `${key} = "${varsObj[key]}"`).join("\n");
      variablesText += pairs;
    } catch {
      variablesText += variables;
    }
    variablesText += "\n";
  }
  if (variablesText.length) {
    variablesText = `${variablesText.trim()}\n`;
  }

  return variablesText;
}

async function saveToRandomTemporaryFile(content) {
  const { stdout: mktempOutput } = await exec("mktemp -p /tmp kaholo_plugin_library.XXXXXX");
  const filepath = mktempOutput.trim();
  await writeFile(filepath, content);
  return filepath;
}

async function shredTerraformVarFile(filepath) {
  console.error(`\nShredding secrets in ${filepath}\n`);
  return exec(`shred -u -n 3 -f ${filepath}`);
}

async function getCurrentUserId() {
  const { stdout } = await exec("id -u");
  return stdout.trim();
}

function jsonIsAllowed(command) {
  const subcommand = command.split(" ").find((arg) => !arg.startsWith("-"));
  const subcommandsJsonNotSupported = ["init"];
  return !subcommandsJsonNotSupported.includes(subcommand);
}

async function validateDirectoryPath(path) {
  if (!await pathExists(path)) {
    throw new Error(`Invalid Terraform Directory path! Path ${path} does not exist on agent.`);
  }
  if (!await isPathDirectory(path)) {
    throw new Error(`Invalid Terraform Directory path! Path ${path} is not a directory.`);
  }
}

function tryParseTerraformJsonOutput(terraformOutput) {
  try {
    return terraformOutput.trim().split("\n").map((log) => JSON.parse(log));
  } catch {
    return terraformOutput;
  }
}

function convertMapToObject(map) {
  return Object.fromEntries(map.entries());
}

function generateRandomTemporaryPath() {
  return `/tmp/${Math.random().toString(36).slice(2)}`;
}

async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function isPathDirectory(path) {
  const stat = await lstat(path);
  return stat.isDirectory();
}

async function isPathFile(path) {
  const stat = await lstat(path);
  return stat.isFile();
}

async function asyncExec(params) {
  const {
    command,
    onProgressFn,
    options = {},
  } = params;

  let childProcessError;
  let childProcessInstance;
  try {
    childProcessInstance = childProcess.exec(command, options);
  } catch (error) {
    return { error };
  }

  const outputChunks = [];

  childProcessInstance.stdout.on("data", (data) => {
    outputChunks.push({ type: "stdout", data });

    onProgressFn?.(data);
  });
  childProcessInstance.stderr.on("data", (data) => {
    outputChunks.push({ type: "stderr", data });

    onProgressFn?.(data);
  });
  childProcessInstance.on("error", (error) => {
    childProcessError = error;
  });

  try {
    await promisify(childProcessInstance.on.bind(childProcessInstance))("close");
  } catch (error) {
    childProcessError = error;
  }

  const outputObject = outputChunks.reduce((acc, cur) => ({
    ...acc,
    [cur.type]: `${acc[cur.type]}${cur.data.toString()}`,
  }), { stdout: "", stderr: "" });

  if (childProcessError) {
    outputObject.error = childProcessError;
  }

  return outputObject;
}

module.exports = {
  validateDirectoryPath,
  convertMapToObject,
  generateRandomTemporaryPath,
  createVariablesString,
  saveToRandomTemporaryFile,
  shredTerraformVarFile,
  tryParseTerraformJsonOutput,
  exec,
  jsonIsAllowed,
  getCurrentUserId,
  asyncExec,
};
