const child_process = require("child_process")

function executeTerraformInit(action, settings){
	return new Promise((resolve,reject) => {
		const command = `cd ${action.params.PATH} && terraform init ${action.params.UPGRADE}`
		child_process.exec(command, (error, stdout, stderr) => {
			if (error) {
			   return reject(`exec error: ${error}`);
			}
			if (stderr) {
				console.log(`stderr: ${stderr}`);
			}
			return resolve(stdout);
		});
	})
}

function executeTerraformApply(action, settings){
	return new Promise((resolve,reject) => {
        const command = `cd ${action.params.PATH} terraform apply --auto-approve ${action.params.VAR ? '--var ' :''} ${action.params.VAR} ${action.params.VARFILE ? '--varfile ':''} ${action.params.VARFILE}`
		child_process.exec(command, (error, stdout, stderr) => {
			if (error) {
			   return reject(`exec error: ${error}`);
			}
			if (stderr) {
				console.log(`stderr: ${stderr}`);
			}
			return resolve(stdout);
		});
	})
}

function executeTerraformPlan(action, settings){
	return new Promise((resolve,reject) => {
		const command = `cd ${action.params.PATH} terraform plan --auto-approve ${action.params.OPTIONS}`
		child_process.exec(command,(error, stdout,stderr) =>{
			if (error){
				return reject(`exec error: ${error}`);
			}
			if (stderr) {
				console.log(`stderr: ${stderr}`);
			}
			return resolve(stdout);
		});
	})
}
function executeTerraformPlan(action, settings){
	return new Promise((resolve,reject) => {
		const command = `cd ${action.params.COMMAND}`
		child_process.exec(command,(error, stdout,stderr) =>{
			if (error){
				return reject(`exec error: ${error}`);
			}
			if (stderr) {
				console.log(`stderr: ${stderr}`);
			}
			return resolve(stdout);
		});
	})
}
module.exports = {
	setEnvironmentVariable,
	executeTerraformInit,
	executeTerraformApply,
	executeTerraformPlan
};