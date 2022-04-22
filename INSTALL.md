# Installation of Kaholo Plugins
These instructions are generalized for the installation of any Kaholo Plugin. To see plugin-specific instructions, refer to that plugin's README.md.

## About Kaholo Plugins
A Kaholo plugin is an extension of functionality that enables Kaholo users to add a new type of Action to a pipeline, typically use of one specific tool or platform. For example, the "Terraform" plugin allows a Kaholo pipeline to work with Terraform execution plans. A pipeline using this plugin might contain three Terraform Actions, one Action running each of three of the plugin's methods - init, plan, apply.

As of Q2 2022, any one Kaholo plugin can be used in only one version, so any upgrade/downgrade affects all existing pipeline Actions using that plugin, including those exported as JSON documents. If a plugin has been significantly changed, i.e. parameters added, removed, or reordered, this can cause breakage that is repaired only by deleting and rebuilding every affected Action in every pipeline or by downgrading the plugin.

For this reason it is important to carefully evaluate the impact of upgrade. Upgrades that include only defect fixes and enhancements but NO changes to the number or order of parameters will in general have no breaking effect.

The Kaholo road map includes improvements to facilitate smoother upgrade paths and reduce the probability of breakage when upgrading plugins.

## Plugin Settings
Each plugin has plugin-level settings. These are defaults for the parameters the plugin uses. If you configure them in plugin settings, they do not have to be configured in the individual actions. This is a convenience and may reduce user error. If at the action level the affected parameters are configured anyway, that overrides the plugin-level settings for that parameter in that Action only.

## Download a plugin
A plugin install package is nothing but a flat zip file of the files containing code and the logo (typically only `*.js`, `*.json`, `*.png`). Including README.md or LICENSE is harmless but there should be no folders in the zip file. For example you might change directory into repo and simply run `zip plugin.zip *`. The resulting plugin.zip is the file that can be uploaded to install into Kaholo. The name of the zip file is not important.

Some repos have zip and src folders, but these will disappear as plugins are updated. The zip files in the zip folders may be outdated, please make a flat zip file of the files in the src folder instead.

Downloading directly from Github in zip format leaves the source files at least one folder deep in the zip file. This unfortunately cannot be uploaded to install the plugin. The files must be in the root of the zip for the plugin to be installed.

## Installing a plugin
1. Download the desired plugin's code to prepare for installation.
1. Create a flat zip file of the code and logo.
1. In the Kaholo Platform, click on Settings in the panel on the far left of the display. 
1. Click on the puzzle piece icon to see plugins. A list of all installed plugins is displayed.
1. Click on the "UPLOAD PLUGIN" button and browse for the zip file from step 2.
1. Once the file is selected installation is automatic. You are returned to the list of all installed plugins.
1. Find the plugin in the list and click on its name.
1. You will be presented with Setting for the plugin. Configure appropriately.
1. Click the "Save" button.
1. You may now return to any pipeline and add an Action using the newly installed or upgraded plugin.

## Upgrading or Downgrading a plugin
For upgrading or downgrading the process is the same. The most recently uploaded zip is the version that will be used in all Actions of that type. Actions created or exported using another version of the plugin will continue to bear their creation version number, but when run they will use the most recently installed version of the plugin. An Action can be cloned or re-created to force it to display the new version number.

## Troubleshooting
It is advisable to test thoroughly to ensure upgraded plugins are working correctly with existing pipelines.

Significant change to plugins can cause Actions created with previous versions to break. The easiest way to resolve this is to downgrade the plugin to the version before the upgrade. Another way to resolve this is to re-create (not clone) the affected Actions.

## Import/Export of Pipelines
Import and export of pipelines is also affected by plugin upgrade. If relying heavily on this feature it is advisable to test that pipelines using the plugin can still be exported and imported after plugin upgrade.

v20220329_1040
