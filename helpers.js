const childProcess = require("child_process");
const { promisify } = require("util");
const {
  access,
  lstat,
  readFile,
  writeFile,
} = require("fs/promises");
const { resolve: resolvePath } = require("path");
const ShredFile = require("shredfile");

const exec = promisify(childProcess.exec);

function logToActivityLog(message) {
  // TODO: Change console.error to console.info
  // Right now (Kaholo v4.1.2.1) console.info
  // does not print messages to Activity Log
  // Jira ticket: https://kaholo.atlassian.net/browse/KAH-3636
  console.error(message);
}

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
    variablesText += variables;
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
  const shredder = new ShredFile({
    shredPath: await getShredPath(),
    remove: true,
    force: true,
    zero: true,
    debugMode: false,
    iterations: 4,
  });
  console.error("Shredding", filepath);
  return shredder.shred(filepath).catch(console.error);
}

async function getCurrentUserId() {
  const { stdout } = await exec("id -u");
  return stdout.trim();
}

async function getShredPath() {
  const { stdout } = await exec("which shred");
  return stdout.trim();
}

function isJsonAllowed(command) {
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
    return { rawOutput: terraformOutput };
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

module.exports = {
  validateDirectoryPath,
  convertMapToObject,
  generateRandomTemporaryPath,
  createVariablesString,
  saveToRandomTemporaryFile,
  shredTerraformVarFile,
  tryParseTerraformJsonOutput,
  exec,
  isJsonAllowed,
  logToActivityLog,
  getCurrentUserId,
};
