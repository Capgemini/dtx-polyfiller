# DTX-Polyfiller

This Chrome extension rewrites a few input events from "onpropertychange" to "onchange" - 
whilst also implementing minor other CSS/JS patches for legacy tools.

Also overrides a number of functions in the claims submission process to remove IE specific XML/XPath usage.

## Installation


1) [Right-Click Here and "Save Link As"](https://capgemini.github.io/dtx-polyfiller/dtx-polyfiller.crx)

2) Visit the following URL in Chrome: chrome://extensions

3) Drag/Drop saved .crx file onto the page

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
