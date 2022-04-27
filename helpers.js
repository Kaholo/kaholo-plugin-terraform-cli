const childProcess = require("child_process");
const { promisify } = require("util");
const {
  access,
  lstat,
  readFile,
  writeFile,
} = require("fs/promises");
const { resolve } = require("path");
const mktemp = require("mktemp");
const ShredFile = require("shredfile");

const exec = promisify(childProcess.exec);

function logToActivityLog(message) {
  // TODO: Change console.error to console.info
  // Right now (Kaholo v4.1.2.1) console.info
  // does not print messages to Activity Log
  console.error(message);
}

async function createVariablesText({
  varFile,
  variables,
  secretVariables,
  workingDirectory,
}) {
  let variablesText = "";
  if (varFile) {
    const resolvedVarFilePath = workingDirectory
      ? resolve(workingDirectory, varFile)
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

async function createTemporaryFile(content) {
  const fileName = await createRandomTmpFile();
  await writeFile(fileName, content);
  return fileName;
}

async function shredTerraformVarFiles() {
  const shredder = new ShredFile({
    shredPath: await getShredPath(),
    remove: true,
    force: true,
    zero: true,
    debugMode: false,
    iterations: 4,
  });
  return shredder.shred(await getAllTmpTerraformVarFiles());
}

async function getAllTmpTerraformVarFiles() {
  const { stdout: result } = await exec("ls /tmp | grep .tfvars");
  return result.trim().split("\n").map((file) => `/tmp/${file}`);
}

function getShredPath() {
  return exec("which shred").then(({ stdout }) => stdout.trim());
}

function isJsonAllowed(command) {
  const subcommand = command.split(" ").find((arg) => !arg.startsWith("-"));
  // TODO: Check every subcommand if they support "-json" argument
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

function randomTmpName() {
  return `/tmp/${Math.random().toString(36).slice(2)}`;
}

async function createRandomTmpFile() {
  return mktemp.createFile(`${randomTmpName()}.tfvars`);
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
  randomTmpName,
  createVariablesText,
  createTemporaryFile,
  shredTerraformVarFiles,
  tryParseTerraformJsonOutput,
  exec,
  isJsonAllowed,
  logToActivityLog,
};
