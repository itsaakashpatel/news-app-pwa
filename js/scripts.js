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
    .then(async function (registration) {
      console.log("Service worker is active!");

      try {
        await navigator.permissions.query({
          name: "periodic-background-sync",
        });

        await registration.periodicSync.register("sync-news", {
          minInterval: 3000,
        });

        console.log("Periodic Sync registered!");
      } catch (error) {
        console.log("Periodic Sync could not be registered!", error);
      }

      if ("sync" in registration) {
        registration.sync
          .register("sync-data")
          .then(() => {
            console.log('Background sync registered with tag "sync-data"');
          })
          .catch((error) => {
            console.error("Background sync registration failed:", error);
          });
      }
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
