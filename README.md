# kaholo-plugin-terraform-cli
Kaholo plugin to run terraform cli commands.

## How To Use
After installing the plugin on the Kaholo server make sure that terraform is installed on every agent that will run methods from this plugin.

## Methods

### Method: Set environment variable
Generate an authentication token for aws eks cluster using a specific user.

### Parameters
1. Access Key ID(string)
2. Secret Access key(vault)
3. AWS Region(autocomplete string)
4. EKS Cluster Name(string)
5. Token Expires(int) - Time in seconds until expiration of token. Default is 60.