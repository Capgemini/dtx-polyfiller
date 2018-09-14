/*
    submit-claims-injector.js

    This script handles the injecting of the override scripts onto the page. An injector
    is needed to override the functions provided by DTX's claimSubmissionPage.js.
 */

const scriptTag = document.createElement('script');
scriptTag.src = chrome.extension.getURL('submit-claims/submit-claims-overrides.js');
scriptTag.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(scriptTag);