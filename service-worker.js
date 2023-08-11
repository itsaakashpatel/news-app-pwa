// Inside service worker document and window doesn't exist
//self object refers to the service worker

const CACHE_NAME = "inbriefs";
const CACHE_VERSION = 4;

/**
 * Service Worker Install
 * Triggered when the service worker is installed
 */
self.addEventListener("install", function (event) {
  console.log("Service Worker: Installed!!", event);

  //activate service worker immediately and get rid of old service worker
  self.skipWaiting();

  //cache all the assets
  event.waitUntil(
    caches
      .open(`${CACHE_NAME}-v${CACHE_VERSION}`)
      .then(function (cache) {
        console.log("cache opened!", cache);

        cache.addAll([
          "/",
          "/index.html",
          "/offline.html",
          "/js/scripts.js",
          "/style/main.css",
          "/manifest.json",
          "/assets/inbriefs-100.png",
          "/assets/inbriefs-150x150.png",
          "/assets/inbriefs-192x192.png",
          "/assets/inbriefs-512x512.png",
          "/assets/favicon-16x16.png",
          "/assets/favicon-32x32.png",
          "/assets/favicon.ico",
          "/assets/apple-touch-icon.png",
          "/assets/safari-pinned-tab.svg",
          "https://fonts.googleapis.com/css2?family=Lexend:wght@300;600&display=swap",
        ]);
      })
      .catch(function (err) {
        console.log("cache failed!", err);
      })
  );
});

/**
 * Service Worker Activate
 * Triggered when the service worker is activated
 */
self.addEventListener("activate", function (event) {
  console.log("Service Worker: Activated!");

  //Immediately take a control over all the opened tabs of browser - async method so the next line will not be executed until all the pages will be claimed
  event.waitUntil(clients.claim());

  //remove old cache that are no longer necessary
  event.waitUntil(
    caches
      .keys()
      .then(function (cacheNames) {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== `${CACHE_NAME}-v${CACHE_VERSION}`) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .catch(function (err) {
        console.log("Error in deleting old caches", err);
      })
  );
});

/**
 * Service Worker Fetch
 * Triggered when the service worker is fetching an asset
 */

self.addEventListener("fetch", function (event) {
  if (!(event.request.url.indexOf("http") === 0)) return; // skip the request. if request is not made with http protocol

  if (event.request.method !== "GET") return; //skip the request if it is not a get request

  console.log("Service Worker: Fetching", event.request.url);

  //Caching strategy: Stale while revalidate
  event.respondWith(
    caches
      .open(`${CACHE_NAME}-v${CACHE_VERSION}`)
      .then(function (cache) {
        return cache
          .match(event.request)
          .then(function (response) {
            const fetchUpdatedData = fetch(event.request)
              .then(function (newResponse) {
                cache.put(event.request, newResponse.clone());
                return newResponse;
              })
              .catch(function (err) {
                return cache.match("/offline.html");
              });
            return response || fetchUpdatedData;
          })
          .catch(function (err) {
            console.log("Failed to send cached response!", err);
          });
      })
      .catch(function (err) {
        console.log("Failed to open cache!", err);
      })
  );
});
