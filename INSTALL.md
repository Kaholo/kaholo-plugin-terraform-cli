# Installation of Kaholo Plugins
These instructions are generalized for the installation of any Kaholo Plugin. To see plugin-specific instructions, refer to that plugin's README.md.

> Warning
>
> Upgrading Kaholo plugins, especially with those with major version number changes, can adversely effect existing pipelines, and render previously exported pipelines unimportable. Please take appropriate precautions to backup your existing system and/or upgrade in a test environment before attempting upgrade of a plugin in a production system.

## Quick Install
In Kaholo, Settings | Plugins provides a view of all installed plugins with a second tab for "Available Plugins". This is not a complete list of all plugins, but only those released recently (during or after 2023). For plugins on this list simply clicking the "Install" or "Upgrade" button will install the latest version of that plugin.

## About Kaholo Plugins
A Kaholo plugin is an extension of functionality that enables Kaholo users to add a new type of Action to a pipeline, typically use of one specific tool or platform. For example, the "Terraform" plugin enables a Kaholo pipeline to run Terraform execution plans. A pipeline using this plugin might contain three Terraform Actions, one Action running each of three of the plugin's methods - init, plan, apply.

As of Q3 2023, any one Kaholo plugin can be used in only one version, so any upgrade/downgrade affects all existing pipeline Actions using that plugin, including those exported as JSON documents. If a plugin has been significantly changed, i.e. methods or parameters added or removed, this can cause breakage that is repaired only by deleting and rebuilding every affected Action in every pipeline or by downgrading the plugin. For this reason it is important to carefully evaluate the impact of upgrade. Upgrades that include only defect fixes and enhancements will in general have no breaking effect.

A good method to test a new plugin without impacting existing pipelines or to run two versions of the same plugin side-by-side is to alter config.json to give the plugin a unique `name`, `viewName` and `auth.authId`. For example if using SonarQube v2.0.0 and testing SonarQube v2.1.0, it may look like this:

    "name": "sonarqube210"
    "viewName": "SonarQube v2.1.0"
    "auth": {
        "authId": "sonarqube210"
    }

Then this plugin can be installed without interfering with pipelines using v2.0.0. It is effectively now a different plugin. Note that because of the new `authId`, existing Kaholo accounts will not be available to the plugin. New ones will need to be created.

## Plugin Settings
Plugin Settings are accessed in Kaholo by clicking on Settings | Plugins and then clicking the name of the plugin. If a plugin has settings or accounts the name will appear as a blue hyperlink that takes you to Plugin Settings view.

Each plugin has plugin-level settings. These are defaults for some of the parameters the plugin uses. If you configure a parameter in plugin settings, the same parameter will be automatically prefilled when you create a new Action using that plugin. This is an optional convenience that helps reduce tedium and user error. If at the Action level the parameters are configured differently or cleared, that overrides the plugin-level settings for that parameter in that Action only. For more details please see the README.md for each specific plugin.

## Kaholo Accounts
Kaholo Accounts are accessed in Kaholo by clicking on Settings | Plugins and then clicking the name of the plugin. If a plugin has settings or accounts the name will appear as a blue hyperlink that takes you to Plugin Settings view. Accounts is the second (inactive) tab in Plugin Settings view. An alternative way to create a new account is to use the plugin in a pipeline, select a method, and then in the drop-down for "Account" select "Add New Plugin Account".

A Kaholo Account is a grouping of parameters that are codependent on each other, rarely change, often involve authentication and are likely to be required for every method of the plugin. For example, in a Kubernetes account there is a URL, CA cert, and Token to access a Kubernetes cluster. If any of the three are changed the other two become invalid. For this reason, instead of being individual parameters at the Action level they are managed alongside plugin Settings as a Kaholo Account.

One Kaholo Account can be selected as the default, meaning any new pipeline Actions of that type will be created with the Account already selected, as a convenience. Only new actions are affected. Any action for which another account should be used can still be changed on a case-by-case basis.

## Plugins using Docker
Several plugins use docker within the Kaholo Agent to run commands from purpose-built images. This brings several advantages but also a few caveats of which a Kaholo Administrator should be aware. See each plugin's README.md for more detailed information.
* Each Kaholo Agent must be running docker
* The very first use of the plugin on any agent downloads a docker image, causing delay of up to a minute and docker-related messages in Activity Log. Subsequent runs use the image cached locally on the agent.
* Input and output files require special consideration. The filesystem within the docker image running the command can access the filesystem of the Kaholo Agent only where a docker volume is mounted. In general, the default working directory on the agent is shared and inputs/outputs will work as expected if located there. Many plugins have a "Working Directory" parameter that allows the user to select any directory on the Kaholo Agent to docker mount.
* Most plugins using docker also allow the user to use an alternate docker image. This is to permit use of custom images to accommodate unique features in projects and environments, or to use older/newer versions of images as the situation may require.
* There is a "Kaholo Docker Plugin" with a method "Run Docker Command", and this is sufficient to emulate nearly any plugin including some that do not exist. For example if you need a plugin to "OSIsoft PI", and OSIsoft provides a docker image with the PI-SDK CLI, you could run a Docker command using the OSIsoft image and have effectively emulated an OSIsoft plugin. Of course this is quick-fix and if you have use for a plugin that doesn't exist, please do [let us know](https://kaholo.io/contact/).

## Download a plugin
A complete collection of all plugins can be found on the [Kaholo Community GitHub page](https://github.com/Kaholo). Not all are actively maintained or feature complete, so if you encounter difficulty, please do [let us know](https://kaholo.io/contact/). Also if you fix or otherwise improve a plugin, or create a new plugin that you'd like added to the GitHub, please do issue a pull request.

A plugin installation package is a flat zip archive of the files containing code, configuration, documentation, and logo (`*.js`, `*.json`, `*.md`, `*.png`). The main or master branch of each plugin contains the most recent release, and if a develop branch exists, it may contain as-of-yet unreleased fixes or features.

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
1. Check to be sure the plugin is not Available for [Quick Install](#quick-install) as described above.
1. Download the desired plugin's code to prepare for installation.
1. Create a flat zip file of the code and logo.
1. In the Kaholo Platform, click on Settings in the panel on the far left of the display. 
1. Click on the puzzle piece icon to see plugins. A list of all installed plugins is displayed.
1. Click on the "UPLOAD PLUGIN" button and browse for the zip file just created.
1. Once the file is selected installation is automatic. You are returned to the list of all installed plugins.
1. Find the plugin in the list and click on its name, if it is a blue hyperlink `*`.
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

v20230826_1330