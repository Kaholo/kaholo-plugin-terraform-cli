# Installation of Kaholo Plugins
These instructions are generalized for the installation of any Kaholo Plugin. To see plugin-specific instructions, refer to that plugin's README.md.

> Warning
>
> Upgrading Kaholo plugins can adversely effect existing pipelines, and render previously exported pipelines unimportable. Please take appropriate precautions to backup your existing system and/or upgrade in a test environment before attempting upgrade of a plugin in a production system.

## About Kaholo Plugins
A Kaholo plugin is an extension of functionality that enables Kaholo users to add a new type of Action to a pipeline, typically use of one specific tool or platform. For example, the "Terraform" plugin allows a Kaholo pipeline to run Terraform execution plans. A pipeline using this plugin might contain three Terraform Actions, one Action running each of three of the plugin's methods - init, plan, apply.

As of Q3 2022, any one Kaholo plugin can be used in only one version, so any upgrade/downgrade affects all existing pipeline Actions using that plugin, including those exported as JSON documents. If a plugin has been significantly changed, i.e. methods or parameters added or removed, this can cause breakage that is repaired only by deleting and rebuilding every affected Action in every pipeline or by downgrading the plugin.

For this reason it is important to carefully evaluate the impact of upgrade. Upgrades that include only defect fixes and enhancements will in general have no breaking effect.

## Plugin Settings
Each plugin has plugin-level settings. These are defaults for some of the parameters the plugin uses. If you configure a parameter in plugin settings, the same parameter will be automatically prefilled when you create a new Action using that plugin. This is an optional convenience that helps reduce tedium and user error. If at the Action level the parameters is configured differently or cleared, that overrides the plugin-level settings for that parameter in that Action only. For more details please see the README.md for each specific plugin.

## Kaholo Accounts
Kaholo Accounts were introduced in Kaholo 4.3 and are gradually being introduced to Kaholo plugins. A Kaholo Account is a grouping of parameters that are typically codependent on each other, rarely change, often involve authentication and are likely to be required for every method of the plugin. For example, in a Kubernetes account there is a URL, CA cert, and Token to access a Kubernetes cluster. If any of the three are changed the other two become invalid. For this reason, instead of being parameters at the Action level they are managed alongside plugin Settings as a Kaholo Account - Setting | Plugins | Kubernetes (the name of the plugin is a link).

Plugins predating Kaholo Accounts work as usual in Kaholo 4.3.x, but plugins that require Kaholo Accounts do not work in Kaholo Servers prior to version 4.3.x Furthermore, Kaholo Accounts break autocomplete parameters that depend on parameters in the account in version prior to 4.3.5. To avoid this, simply ensure you update to the most recent version of Kaholo before you install plugins that use Kaholo Accounts. You can know a plugin uses Kaholo Accounts if there is a section `"auth": {}` in config.json of the plugin.

## Plugins using Docker
Several plugins use docker within the Kaholo Agent to run commands from purpose-built images. This brings several advantages but also a few caveats of which a Kaholo Administrator should be aware. See each plugin's README.md for more detailed information.
* Each Kaholo Agent must be running docker
* The very first use of the plugin on any agent downloads a docker image, causing delay of up to a minute. Subsequent runs use the image cached locally on the agent
* Input and output files require special consideration. The filesystem within the docker image running the command can access the filesystem of the Kaholo Agent only where a docker volume is mounted. In general, the default working directory (`/usr/src/app/workspace`) is shared and inputs/outputs will work as expected if located there.

## Download a plugin
A plugin installation package is nothing but a flat zip file of the files containing code and the logo (typically only `*.js`, `*.json`, `*.png`), and possibly documentation files such as this one or README.md. The main or master branch of each plugin typically contains the most recent release.

Here's an example of how to create a zip file ready for installation in the Kaholo Settings | Plugins page. In this example, a file `awscli.zip` is created. This file can then be installed to get the AWS CLI Plugin in Kaholo.

    $ git clone https://github.com/Kaholo/kaholo-plugin-aws-cli.git
    Cloning into 'kaholo-plugin-aws-cli'...
    remote: Enumerating objects: 112, done.
    remote: Counting objects: 100% (35/35), done.
    remote: Compressing objects: 100% (27/27), done.
    remote: Total 112 (delta 17), reused 12 (delta 8), pack-reused 77
    Receiving objects: 100% (112/112), 270.80 KiB | 2.51 MiB/s, done.
    Resolving deltas: 100% (54/54), done.

    $ cd kaholo-plugin-aws-cli/

    $ zip awscli.zip *
    adding: app.js (deflated 50%)
    adding: awscli.js (deflated 61%)
    adding: config.json (deflated 72%)
    adding: helpers.js (deflated 63%)
    adding: INSTALL.md (deflated 57%)
    adding: logo.png (deflated 5%)
    adding: package.json (deflated 60%)
    adding: package-lock.json (deflated 74%)
    adding: README.md (deflated 57%)

## Installing a plugin
1. Download the desired plugin's code to prepare for installation.
1. Create a flat zip file of the code and logo.
1. In the Kaholo Platform, click on Settings in the panel on the far left of the display. 
1. Click on the puzzle piece icon to see plugins. A list of all installed plugins is displayed.
1. Click on the "UPLOAD PLUGIN" button and browse for the zip file from step 2.
1. Once the file is selected installation is automatic. You are returned to the list of all installed plugins.
1. Find the plugin in the list and click on its name, if it is a link `*`.
1. You will be presented with Settings and Accounts for the plugin. Configure appropriately.
1. Click the "Save" button.
1. You may now return to any pipeline and add an Action using the newly installed or upgraded plugin.

`*` Not all plugins have Settings or Accounts - if not, its name will not be a link and the remaining steps are unnecessary.

## Upgrading or Downgrading a plugin
For upgrading or downgrading the process is the same. Simply create the zip file for the version desired and install it.

## Troubleshooting
Significant change to plugins can cause Actions created with previous versions to break. The easiest way to resolve this is to downgrade the plugin to the version before the upgrade. Another way to resolve this is to re-create the affected Actions using the new version of the plugin.

## Import/Export of Pipelines
Import and export of pipelines are also affected by upgrades. There is no guarantee an exported pipeline can be re-imported unless the version of the plugin and the Kaholo server are the same as when the export was made.

v20220729_1000