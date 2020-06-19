<p align="center">
    <img alt="Visual Studio Marketplace Version" src="https://img.shields.io/visual-studio-marketplace/v/Dedsec727.jekyll-run?style=for-the-badge">
    <img alt="Visual Studio Marketplace Downloads" src="https://img.shields.io/visual-studio-marketplace/d/Dedsec727.jekyll-run?style=for-the-badge">
    <img alt="Visual Studio Marketplace Rating" src="https://img.shields.io/visual-studio-marketplace/r/Dedsec727.jekyll-run?style=for-the-badge">
    <img alt="GitHub Workflow Status" src="https://img.shields.io/github/workflow/status/Kanna727/jekyll-run/CI Publish?style=for-the-badge">
    <img alt="GitHub" src="https://img.shields.io/github/license/Kanna727/jekyll-run?style=for-the-badge">
</p>

# VSCode Extension to Build & Run Jekyll Static Websites

This extension can simply Run your Jekyll site locally and opens your site in browser

## Features

If a Jekyll Workspace is open:

* You can run following commands from Command Palette/Keybindings:

  * Jekyll Build    &nbsp;&nbsp;&nbsp;&nbsp;(ctrl+F8) &nbsp;&nbsp;&nbsp;&nbsp; Builds project
  * Jekyll Run      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(ctrl+F5) &nbsp;&nbsp;&nbsp;&nbsp; Builds, Starts Jekyll Server & Opens the local hosted site in Browser
  * Jekyll Stop&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(ctrl+F6) &nbsp;&nbsp;&nbsp;&nbsp; Stops Jekyll Server
  * Jekyll Restart&nbsp;&nbsp;(ctrl+F7) &nbsp;&nbsp;&nbsp;&nbsp; Restarts Jekyll Server

* Status Bar shortcuts:

  * Jekyll Run

    <p align="center">
    <img  src="media/snaps/status-bar-run.png">
    </p>

  * Jekyll Stop/Restart

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

## Requirements

* Static Website Workspace in VSCode i.e, `_config.yml` should be present in the opened workspace
* [Jekyll](https://jekyllrb.com/docs/installation/)