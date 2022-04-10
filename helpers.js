const childProcess = require("child_process");
const fs = require("fs");
const pathmodule = require("path");
const { v4: uuidv4 } = require("uuid");

async function execTerraform(cmd, args, workDir) {
  if (!workDir) {
    throw new Error("Parameter Working Directory is required.");
  }
  const terraCmd = `terraform ${cmd} ${args.join(" ")}`;
  return new Promise((resolve, reject) => {
    childProcess.exec(terraCmd, { cwd: workDir }, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
      }
      return resolve(stdout);
    });
  });
}

function parseVars(vars) {
  if (!vars) { // if vars is false\undefined return empty arr
    return [];
  }
  if (typeof (vars) === "string") { // if vars is string split vars by new lines
    return vars.split("\n").map((keyVal) => `-var="${keyVal.trim()}"`);
  }
  if (Array.isArray(vars)) { // if vars is an array only add flags
    return vars.map((keyVal) => `-var="${keyVal}"`);
  }
  if (typeof (vars) === "object") { // if vars were passed as an object parse to arg strings
    return Object.keys(vars).map((key) => `-var="${key}=${vars[key]}"`);
  }
  // if vars wasn't passed in a supproted format throw error
  throw new Error("Parameter Vars not in a recognized format.");
}

async function makeVarFile(secretVarFile, workDir) {
  if (!secretVarFile || !workDir) {
    throw new Error("Both content for the Terraform vars file and a working directory are required.");
  }
  let svf = secretVarFile;
  if (!svf.endsWith("\n")) { svf += "\n"; }
  const svfName = `temp-9bxY9f-${uuidv4()}.tfvars`; // e.g. temp-9bxY9f-d2c714eb-9b9f-49b0-844f-34810262a4c9.tfvars
  const svfPath = pathmodule.join(workDir, svfName);
  return new Promise((resolve, reject) => {
    fs.writeFile(svfPath, svf, (err) => {
      if (err) { return reject(err); }
      return resolve(svfName);
    });
  });
}

module.exports = {
  execTerraform,
  parseVars,
  makeVarFile,
};
