//service worker activation

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("./../service-worker.js", { scope: "/" })
    .then(function (registration) {
      console.log("Service worker registered!");
    })
    .catch(function (err) {
      console.error("Service worker registration failed!", err);
    });

  //check if service worker is ready and active
  navigator.serviceWorker.ready
    .then(function (registration) {
      console.log("Service worker is active!", registration.active);
    })
    .catch(function (err) {
      console.error("Service worker is not ready!", err);
    });

  //Do check if service worker is controlling the page
  if (navigator.serviceWorker.controller) {
    console.log("Service worker is controlling the page!");
  } else {
    console.log("Service worker is not controlling the page!");
  }
} else {
  console.error("Service worker not supported!");
}
