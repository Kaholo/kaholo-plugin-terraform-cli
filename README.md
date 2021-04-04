# kaholo-plugin-terraform-cli
Kaholo plugin to run terraform cli commands.

## How To Use
After installing the plugin on the Kaholo server make sure that terraform is installed on every agent that will run methods from this plugin.

## Methods

### Method: Init
Run terraform init. Initiates the terraform instance in the specified directory.

### Parameters
1. Working Directory (String) **Required** - The path of the directory containing the Terraform resources to init.
2. Upgrade (Boolean) **Optional** - Whether to upgrade modules and plugins as part of their respective installation steps. Default is false.

### Method: Apply
Run terraform apply. Creates all resources needed and runs all terraform scripts.

### Parameters
1. Working Directory (String) **Required** - The path of the directory containing the Terraform resources to apply.
2. Vars (Text/Object/Array) **Optional** - Variables to pass to the terraform resource. Pass in a key=value format. Can be passed either as text - with each var seprated by new line, or from code as an object whose fields are the vars or array of key value pairs strings.
3. Var File (String) **Optional** - Path to variables file. Can be passed either as absolute path or relative path to the Working Directory parameter.
4. Other Flags (String) **Optional** - Any other flags or argumants to pass to the cli.

### Method: Plan
Run terraform plan. Create an execution plan of all terraform resources in the directory specified.

### Parameters
1. Working Directory (String) **Required** - The path of the directory containing the Terraform resources to plan.
2. Vars (Text/Object/Array) **Optional** - Variables to pass to the terraform resource. Pass in a key=value format.
3. Var File (String) **Optional** - Path to variables file. Can be passed either as absolute path or relative path to the Working Directory parameter.
4. Options (String) **Optional** - Any other flags or argumants to pass to the cli.

### Method: Destroy
Run terraform destroy. Initiates the terraform instance in the specified directory.

### Parameters
1. Working Directory (String) **Required** - The path of the directory containing the Terraform resources to destroy.
2. Vars (Text/Object/Array) **Optional** - Variables to pass to the terraform resource. Pass in a key=value format.
3. Var File (String) **Optional** - Path to variables file. Can be passed either as absolute path or relative path to the Working Directory parameter.
4. Options (String) **Optional** - Any other flags or argumants to pass to the cli.