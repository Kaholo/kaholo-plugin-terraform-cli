# Kaholo Terraform Plugin
[Hashicorp Terraform](https://www.terraform.io/) is an open-source infrastructure as code software tool that enables you to safely and predictably create, change, and improve infrastructure. The Kaholo Terraform Plugin bring Terraform commands to Kaholo.

## Prerequisites
Terraform operates primarily by use of execution plans. These are readily identifiable by files matching `*.tf`. These files are written using Terraform configuration language. To use the plugin, one generally needs such a Terraform execution plan staged on the Kaholo agent. This is usually accomplished using the [Kaholo Git Plugin](https://github.com/Kaholo/kaholo-plugin-git). The development and test of Terraform execution plans are typically done beforehand using a development system with the Terraform CLI installed. 

## Access and Authentication
HashiCorp and the Terraform community have already written thousands of providers to manage many different types of resources and services, including Amazon Web Services (AWS), Azure, Google Cloud Platform (GCP), Kubernetes, Helm, GitHub, Splunk, DataDog, and many more. Access and Authentication depends on which providers are included in your execution plan.

## Plugin Installation
For download, installation, upgrade, downgrade and troubleshooting of plugins in general, see [INSTALL.md](./INSTALL.md).

## Plugin Settings
Plugin settings act as default parameter values. If configured in plugin settings, the action parameters will be by default pre-configured. Plugin settings can be found by clicking on the name of the plugin, which is a link in Kaholo Settings | Plugins.

Terraform has only one plugin-level setting, which is "Default Working Directory". This is the directory that contains your terraform configuration, i.e. if you were using the Terraform CLI, you would execute command `terraform init` in this directory.

## Use of Docker
This plugin relies on the [Hashicorp maintained Docker image](https://hub.docker.com/r/hashicorp/terraform/) "hashicorp/terraform" to run Terraform commands. This has many upsides but a few downsides as well of which the user should be aware.

The first time the plugin is used on each agent, docker may spend a minute or two downloading the image. After that the delay of starting up another docker image each time is quite small, a second or two. Method "Get Terraform Version" is a quick and simple way to force the image to download and test that the plugin is installed and working.

Next, because the CLI is running inside a docker container, it will not have access to the complete filesystem on the Kaholo agent. Parameter "Working Directory" is particularly important for this. Files outside of Working Directory will not be accessible by Terraform. If Working directory is left unconfigured the default working directory on a Kaholo 5.x agent is `/twiddlebug/workspace`.

The docker container is destroyed once the command has successfully run, so output files will also be destroyed if not written in the working directory or a subdirectory.

## Using Var Files and Vars
If using parameters `Vars`, `Secret Vars`, `Secret Environment Variables`, or `Var File`, the easiest format is one-per-line `key=value` format, as if using `terraform apply -var 'foo=bar'` on the command line. The format is the same for either regular or Vault parameters, the only difference being that vaulted ones are stored in the Kaholo Vault and therefore prevented from appearing in the user interface, configuration, log, or error files of the pipeline. For example,

    aws_access_key=AKIA3LQJ6W8S3DHVWNLY
    aws_secret_key=M9N3dLzEKnhV2KXIaGFrGofmtcb7U0FCa2gRXtii

For variable requirements beyond simple key=value pairs, it is customary to use a Var File instead of Vars, but it is still possible to use Vars. This example includes `regions` of type `list(string)`. However quotes should be escaped with `\` in the text parameter:
 
    aws_access_key=AKIA3LQJ6W8S3DHVWNLY
    aws_secret_key=M9N3dLzEKnhV2KXIaGFrGofmtcb7U0FCa2gRXtii
    regions=[\"us-west\", \"sa-east\", \"ap-northwest\"]

If using the code layer both the `\` and `"` characters need to be escaped to see them all the way through to the command line. For example:

    vars = "aws_access_key=AKIA3LQJ6W8S3DHVWNLY\naws_secret_key=M9N3dLzEKnhV2KXIaGFrGofmtcb7U0FCa2gRXtii\nregions=[\\\"us-west\\\", \\\"sa-east\\\", \\\"ap-northwest\\\"]"

If using a `Var File`, use the standard Terraform tfvars format as if using `terraform apply -var-file=foo.tfvars` on the command line. This is typically one-per-line `key = "value"` format **without** escapes, e.g.,

    aws_access_key = "AKIA3LQJ6W8S3DHVWNLY"
    aws_secret_key = "M9N3dLzEKnhV2KXIaGFrGofmtcb7U0FCa2gRXtii"
    regions = ["us-west", "sa-east", "ap-northwest"]

## Method: Get Terraform Version
This method simply runs command `terraform --version`. This serves the purpose of knowing what version of Terraform you are using, as well as an easy test to download the docker image and ensure the plugin is working when you do not have a valid Terraform configuration with which to test.

## Method: Run Main Terraform Command
This method is used to run the basic terraform commands, as listed in parameter `Mode`.

### Mode Init
This method runs ```terraform init```. Initiates the Terraform instance in the specified directory. [Learn More](https://www.terraform.io/cli/commands/init)

### Mode: Plan
This method runs ```terraform plan```. Creates an execution plan of all Terraform resources in the directory specified. [Learn More](https://www.terraform.io/docs/cli/commands/plan.html)

### Mode: Apply
This method runs ```terraform apply```. Creates all resources needed and runs all Terraform scripts. [Learn More](https://www.terraform.io/docs/cli/commands/apply.html)

### Mode: Destroy
This method runs ```terraform destroy```. Destroys all remote objects managed by a particular Terraform configuration. [Learn More](https://www.terraform.io/docs/cli/commands/destroy.html)

### Mode: Validate
This method runs ```terraform validate```. The terraform validate command validates the configuration files in a directory, referring only to the configuration and not accessing any remote services such as remote state, provider APIs, etc. [Learn More](https://www.terraform.io/docs/cli/commands/validate.html)

### Parameter: Working Directory
The path (either absolute or relative) on the Kaholo agent of the directory containing the Terraform configuration to init, plan, apply, destroy or validate. If left unconfigured, the default Kaholo agent directory will be used. Relative paths are from the same default directory, on Kaholo 5.x it is `/twiddlebug/workspace`.

### Parameter: Vars
A set of key=value pairs that will be passed to Terraform as Terraform vars. Use this parameter for vars that you wish to expose in the configuration of the pipeline, e.g. for end-user configuration, logging in Activity Log, and/or for extraction from Kaholo configuration. These are passed to Terraform in a similar way as when executing commands with `-var="key=value"`.

### Parameter: Secret Vars
This is identical to Parameter `Vars` except the key=value pairs are stored in the Kaholo Vault so they will not appear in configuration, Activity log, error, or log messages. Use this for Terraform vars that should be kept secret, for example password or security keys. These secret variables will be recorded in a temporary file to be passed to Terraform using `-var-file=<tempfile location>` and then securely deleted after the command has finished but before the docker container is destroyed.

### Parameter: Secret Environment Variables
Terraform variables cannot be used for some operations, for example using an S3 backend with the AWS EC2 provider. For these special cases, variables must be passed to Terraform as operating system environment variables instead (similar to running command `export KEY=value` before running terraform commands). These should be vaulted in the same was as normal Terraform vars, e.g. `AWS_SECRET_ACCESS_KEY=9p2zQ8N29r8y239ry23y0r239duw`.

### Parameter: Var File
This works like parameter `Vars` except the variables should be listed in a file on the Kaholo Agent. In this parameter just provide the relative or absolute path to that file. This file **MUST** be located within the Working Directory to be accessible by the command. This is useful when variables have been checked into code as a file and you simply wish to use them as-is.

### Parameter: Raw Output
By default the plugin will pass the Terraform command the `-json` flag to provide programmatically accessible JSON output in the Kaholo Final Result. If you prefer the plain text output as displayed when Terraform is run on a command line without the `-json` flag, select Raw Output and it will be so.

### Parameter: Docker Image
The terraform command is run in a docker container based on the docker image specified. The default image is the one used for test and development of the plugin. To use a more recent or custom image, specify the image here. The first time an image is used it will be automatically pulled to the Kaholo agent when the action runs.

### Parameter: Additional Command Arguments
Include additional command arguments here, if there are any not already covered by the parameters above. Arguments may be entered one per line for easy reading and will be joined into a single command string at execution time.

## Method: Run Terraform Command
Use this method to run any free-form Terraform command, including init, plan, apply, etc. Secret Vars is provided here to provide a method to hide variables in the Kaholo Vault as with method `Run Main Terraform Command`.

### Parameter: Command
The terraform command to run. The initial `terraform` is optional. Arguments may be entered one per line for easy reading and will be joined into a single command string at execution time.

### Parameter: Working Directory
The path (either absolute or relative) on the Kaholo agent of the directory containing the Terraform configuration to init, plan, apply, destroy or validate. If left unconfigured, the default Kaholo agent directory will be used. Relative paths are from the same default directory, on Kaholo 5.x it is `/twiddlebug/workspace`.

### Parameter: Secret Vars
This is identical to Parameter `Vars` except the key=value pairs are stored in the Kaholo Vault so they will not appear in configuration, Activity log, error, or log messages. Use this for Terraform vars that should be kept secret, for example password or security keys. These secret variables will be recorded in a temporary file to be passed to Terraform using `-var-file=<tempfile location>` and then securely deleted after the command has finished but before the docker container is destroyed.

### Parameter: Raw Output
By default the plugin will pass the Terraform command the `-json` flag to provide programmatically accessible JSON output in the Kaholo Final Result. If you prefer the plain text output as displayed when Terraform is run on a command line without the `-json` flag, select Raw Output and it will be so.

### Parameter: Docker Image
The terraform command is run in a docker container based on the docker image specified. The default image is the one used for test and development of the plugin. To use a more recent or custom image, specify the image here. The first time an image is used it will be automatically pulled to the Kaholo agent when the action runs.
