<p align="center">
    <img alt="Visual Studio Marketplace Version" src="https://img.shields.io/visual-studio-marketplace/v/Dedsec727.jekyll-run?style=for-the-badge">
    <img alt="Visual Studio Marketplace Downloads" src="https://img.shields.io/visual-studio-marketplace/d/Dedsec727.jekyll-run?style=for-the-badge">
    <img alt="Visual Studio Marketplace Rating" src="https://img.shields.io/visual-studio-marketplace/r/Dedsec727.jekyll-run?style=for-the-badge">
    <img alt="GitHub Workflow Status" src="https://img.shields.io/github/workflow/status/Kanna727/jekyll-run/CI Publish?style=for-the-badge">
    <img alt="GitHub" src="https://img.shields.io/github/license/Kanna727/jekyll-run?style=for-the-badge">
</p>

# Looking for Donations & Contributors

I'm unable to actively develop & improve this extension to support macbook, github codespaces etc.. You can [sponsor](https://patreon.com/dedsec727) or contribute to make this extension more feature rich

# VSCode Extension to Build & Run Jekyll Static Websites Locally

This extension can simply Run your Jekyll site locally and opens your site in browser

## Features

If a Jekyll Workspace is open:

* You can run following commands from Command Palette/Keybindings:

  | Command | Shortcut | Functionality
  | --- | --- | --- |
  | Jekyll Run | (ctrl+F5) | Builds Project, Starts Jekyll Server & Opens the local hosted site in Browser
  | Jekyll Stop | (ctrl+F6) | Stops Jekyll Server
  | Jekyll Restart | (ctrl+F7) | Restarts Jekyll Server
  | Jekyll Build | (ctrl+F8) | Builds Project
  | Jekyll Open in Browser | (ctrl+F9) | Opens the local hosted site in Browser while Jekyll Server is running

  All the above shortcuts are also configurable via vscode keyboard shortcuts editor

* Status Bar shortcuts:

  * Jekyll Run

    <p align="center">
    <img  src="media/snaps/status-bar-run.png">
    </p>

  * Jekyll Stop/Restart/Open in Browser

    <p align="center">
    <img  src="media/snaps/status-bar-stop-restart.png">
    </p>

* Editor Title Menus:

  * Jekyll Run

    <p align="center">
    <img  src="media/snaps/editor-title-run.png">
    </p>

  * Jekyll Stop/Restart

    <p align="center">
    <img  src="media/snaps/editor-title-stop-restart.png">
    </p>

## Configuration

Following fields in the extension's settings page are configurable:

* `jekyll-run.commandLineArguments`: Command Line Arguments to be passed to `bundle exec jekyll serve` cmd. Defaults to empty string i.e, no arguments

## Requirements

* Static Website Workspace in VSCode i.e, `_config.yml` should be present in the opened workspace
* [Jekyll](https://jekyllrb.com/docs/installation/)
