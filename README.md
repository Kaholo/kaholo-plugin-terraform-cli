# kaholo-plugin-terraform-cli
Kaholo Plugin to run Terraform CLI commands.

## How To Use
After installing the plugin on the Kaholo server, make sure that Terraform is installed on every agent that will run methods from this plugin.

## Method: Init
This method runs ```terraform init```. Initiates the Terraform instance in the specified directory. [Learn More](https://www.terraform.io/cli/commands/init)

### Parameters
1. Working Directory (String) **Required** - The path of the directory containing the Terraform resources to initialize.
2. Upgrade (Boolean) **Optional** - Whether to upgrade modules and plugins as part of their respective installation steps. Default value is **false**.

## Method: Apply
This method runs ```terraform apply```. Creates all resources needed and runs all Terraform scripts. [Learn More](https://www.terraform.io/docs/cli/commands/apply.html)

### Parameters
1. Working Directory (String) **Required** - The path of the directory containing the Terraform resources to apply.
2. Vars (Text/Object/Array) **Optional** - Variables to pass to the Terraform resource. Pass in a ```key=value``` format. Can be passed either as text - with each variable seprated by a new line, or from code as an object whose fields are the variables or an array of key value pair strings.
3. Var File (String) **Optional** - Path to variables file. Can be passed either as an absolute path or relative path to the Working Directory parameter.
4. Other Flags (String) **Optional** - Any other flags or arguments to pass to the CLI.

## Method: Plan
This method runs ```terraform plan```. Creates an execution plan of all Terraform resources in the directory specified. [Learn More](https://www.terraform.io/docs/cli/commands/plan.html)

### Parameters
1. Working Directory (String) **Required** - The path of the directory containing the Terraform resources to plan.
2. Vars (Text/Object/Array) **Optional** - Variables to pass to the terraform resource. Pass in a ```key=value``` format.
3. Var File (String) **Optional** - Path to variables file. Can be passed either as an absolute path or relative path to the Working Directory parameter.
4. Options (String) **Optional** - Any other flags or arguments to pass to the CLI.

## Method: Destroy
This method runs ```terraform destroy```. Destroys all remote objects managed by a particular Terraform configuration. [Learn More](https://www.terraform.io/docs/cli/commands/destroy.html)

### Parameters
1. Working Directory (String) **Required** - The path of the directory containing the Terraform resources to destroy.
2. Vars (Text/Object/Array) **Optional** - Variables to pass to the Terraform resource. Pass in a ```key=value``` format.
3. Var File (String) **Optional** - Path to variables file. Can be passed either as an absolute path or relative path to the Working Directory parameter.
4. Options (String) **Optional** - Any other flags or arguments to pass to the CLI.
