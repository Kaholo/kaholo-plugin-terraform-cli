const childProcess = require("child_process");

async function execTerraform(cmd, args, path) {
  if (!path) {
    throw new Error("Parameter Working Directory is required.");
  }
  const terraCmd = `terraform ${cmd} ${args.join(" ")}`;
  return new Promise((resolve, reject) => {
    childProcess.exec(terraCmd, { cwd: path }, (error, stdout, stderr) => {
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

module.exports = {
  execTerraform,
  parseVars,
};
