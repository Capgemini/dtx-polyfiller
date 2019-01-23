# DTX-Polyfiller

This Chrome (And firefox!) extension rewrites a few input events from "onpropertychange" to "onchange" - 
whilst also implementing minor other CSS/JS patches for legacy tools.

## Installation (CHROME - New Style)

We're on the chrome web store! Just install here:
[https://chrome.google.com/webstore/detail/ndjmplgjbibmifkajogmngpekcnammpb](https://chrome.google.com/webstore/detail/ndjmplgjbibmifkajogmngpekcnammpb)


## Installation (Firefox!)

1) [Right-Click Here and "Save Link As"](https://capgemini.github.io/dtx-polyfiller/dtx-polyfiller.xpi)

2) In Firefox, open the Firefox menu Firefox browser menu button and click Add-ons.

3) From the settings cog, open Install Add-on From File.

4) Select the XPI file you just downloaded and click "Add"

## Installation (CHROME - old style)

1) [Right-Click Here and "Save Link As"](https://capgemini.github.io/dtx-polyfiller/dtx-polyfiller.crx)

2) Go to https://robwu.nl/crxviewer/

3) Click browse button and then locate and select the 'dtx-polyfiller.crx' file saved in step 1.

4) Click the download button in the top-right of the screen

5) Locate this file on your computer (will be named 'dtx-polyfiller.zip') and double click on it to unzip the file

6) Visit the following URL in Chrome: chrome://extensions

7) Toggle developer mode on in the top-right then click 'load unpacked'

8) Locate and select the folder created when you unzipped the 'dtx-polyfiller.zip' file

## Development


1) Install Node/Yarn

2) Run `yarn`

3) Populate .env based on example.env template

4) Run yarn build


## Issues

If you find a bug, raise it as a GitHub issue here:

[https://github.com/Capgemini/dtx-polyfiller](https://github.com/Capgemini/dtx-polyfiller)


For other issues, contact Dan Cotton:

[https://github.com/daniel-cotton](https://github.com/daniel-cotton)
