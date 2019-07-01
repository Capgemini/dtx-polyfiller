chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
      if( details.url === "http://missbhasil01.corp.capgemini.com/Layout/Javascript/Tree.js" || details.url === "https://missbhasil01.corp.capgemini.com/Layout/Javascript/Tree.js" )
          return {redirectUrl: "https://daniel-cotton.github.io/silhouette-polyfiller/tree.js" };
  },
  {urls: ["*://missbhasil01.corp.capgemini.com/*.js"]},
  ["blocking"]);