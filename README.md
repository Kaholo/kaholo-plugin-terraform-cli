# kaholo-plugin-terraform-cli
Kaholo Plugin to run Terraform CLI commands.

## How To Use
After installing the plugin on the Kaholo server, make sure that Terraform is installed on every agent that will run methods from this plugin.

## Using Var Files and Vars
If using **Vars**, the easiest format is one-per-line `key=value` format, as if using `terraform apply -var 'foo=bar'` on the command line. The format is the same whether Parameter Vars or Secret Vars is used, the only difference being that secret vars are in the Kaholo vault.

    aws_access_key=AKIA3LQJ6W8S3DHVWNLY
    aws_secret_key=M9N3dLzEKnhV2KXIaGFrGofmtcb7U0FCa2gRXtii

For variable requirements beyond simple key=value pairs, it is customary to use a Var File instead of Vars, but it is still possible to use Vars, for example type `list(string)`. However quotes should be escaped with `\` in the text parameter:
 
    aws_access_key=AKIA3LQJ6W8S3DHVWNLY
    aws_secret_key=M9N3dLzEKnhV2KXIaGFrGofmtcb7U0FCa2gRXtii
    regions=[\"us-west\", \"sa-east\", \"ap-northwest\"]

Also, if using the code layer both the `\` and `"` characters need to be escaped to see them all the way through to the command line. For example:

    vars = "aws_access_key=AKIA3LQJ6W8S3DHVWNLY\naws_secret_key=M9N3dLzEKnhV2KXIaGFrGofmtcb7U0FCa2gRXtii\nregions=[\\\"us-west\\\", \\\"sa-east\\\", \\\"ap-northwest\\\"]"

If using a **Var File**, use the standard Terraform tfvars format as if using `terraform apply -var-file=foo.tfvars` on the command line. This typically one-per-line `key = "value"` format, e.g.,

    aws_access_key = "AKIA3LQJ6W8S3DHVWNLY"
    aws_secret_key = "M9N3dLzEKnhV2KXIaGFrGofmtcb7U0FCa2gRXtii"
    regions = ["us-west", "sa-east", "ap-northwest"]

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

**Code Example:**
* When using directly in the Code field:
```
(async ()=>
    {
        var1: `val1`,
        secret: await kaholo.vault.getValueByKey("my-secret")
    }
)()
```
* You can also add this function in the Code layer and invoke it from the Code field:
```
async function getTrerraformVars(){
    return {
        var1: `val1`,
        secret: await kaholo.vault.getValueByKey("my-secret")
    }
}
```

4. Var File (String) **Optional** - Path to variables file. Can be passed either as an absolute path or relative path to the Working Directory parameter.
5. Other Flags (String) **Optional** - Any other flags or arguments to pass to the CLI.

## Method: Plan
This method runs ```terraform plan```. Creates an execution plan of all Terraform resources in the directory specified. [Learn More](https://www.terraform.io/docs/cli/commands/plan.html)

### Parameters
1. Working Directory (String) **Required** - The path of the directory containing the Terraform resources to plan.
2. Vars (Text/Object/Array) **Optional** - Variables to pass to the terraform resource. Pass in a ```key=value``` format.

**Code Example:**
* When using directly in the Code field:
```
(async ()=>
    {
        var1: `val1`,
        secret: await kaholo.vault.getValueByKey("my-secret")
    }
)()
```
* You can also add this function in the Code layer and invoke it from the Code field:
```
async function getTrerraformVars(){
    return {
        var1: `val1`,
        secret: await kaholo.vault.getValueByKey("my-secret")
    }
}
```
4. Var File (String) **Optional** - Path to variables file. Can be passed either as an absolute path or relative path to the Working Directory parameter.
5. Options (String) **Optional** - Any other flags or arguments to pass to the CLI.

## Method: Destroy
This method runs ```terraform destroy```. Destroys all remote objects managed by a particular Terraform configuration. [Learn More](https://www.terraform.io/docs/cli/commands/destroy.html)

### Parameters
1. Working Directory (String) **Required** - The path of the directory containing the Terraform resources to destroy.
2. Vars (Text/Object/Array) **Optional** - Variables to pass to the Terraform resource. Pass in a ```key=value``` format.

**Code Example:**
* When using directly in the Code field:
```
(async ()=>
    {
        var1: `val1`,
        secret: await kaholo.vault.getValueByKey("my-secret")
    }
)()
```
* You can also add this function in the Code layer and invoke it from the Code field:
```
async function getTrerraformVars(){
    return {
        var1: `val1`,
        secret: await kaholo.vault.getValueByKey("my-secret")
    }
}
```
4. Var File (String) **Optional** - Path to variables file. Can be passed either as an absolute path or relative path to the Working Directory parameter.
5. Options (String) **Optional** - Any other flags or arguments to pass to the CLI.

