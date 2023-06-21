
// Change this to your repository name
var GHPATH = '/words';

// Choose a different app prefix name
var APP_PREFIX = 'words_';

// The version of the cache. Every time you change any of the files
// you need to change this version (version_01, version_02…). 
// If you don't change the version, the service worker will give your
// users the old files!
var VERSION = 'version_57';

// The files to make available for offline use. make sure to add 
// others to this list
var URLS = [
    `${GHPATH}/`,
    `${GHPATH}/fonts/bootstrap-icons.woff`,
    `${GHPATH}/fonts/bootstrap-icons.woff2`,
    `${GHPATH}/android-chrome-192x192.png`,
    `${GHPATH}/android-chrome-512x512.png`,
    `${GHPATH}/apple-touch-icon.png`,
    `${GHPATH}/bootstrap-icons.css`,
    `${GHPATH}/bootstrap.min.css`,
    `${GHPATH}/bootstrap.min.js`,
    `${GHPATH}/bootstrap.min.css.map`,
    `${GHPATH}/bootstrap.min.js.map`,
    `${GHPATH}/cookie.js`,
    `${GHPATH}/favicon-16x16.png`,
    `${GHPATH}/favicon-32x32.png`,
    `${GHPATH}/favicon.ico`,
    `${GHPATH}/jquery-3.6.4.min.js`,
    `${GHPATH}/hrdict1.js`,
    `${GHPATH}/hrdict2.js`,
    `${GHPATH}/hrdict3.js`,
    `${GHPATH}/endict.js`,
    `${GHPATH}/main.css`,
    `${GHPATH}/main.js`,
    `${GHPATH}/manifest.json`,
    `${GHPATH}/utils.js`
]
/*
self.addEventListener('fetch', function (event) {
    event.respondWith(
        fetch(event.request.url,  { cache: "reload" }).then(function (response) {
            cache.put(request, response.clone());
            return response;
        }).catch(function () {
            return caches.match(event.request);
        }),
    );
});
*/
self.addEventListener('fetch', function (e) {
    console.log('Fetch request : ' + e.request.url);
    e.respondWith(
      caches.match(e.request).then(function (request) {
        if (request) { 
          console.log('Responding with cache : ' + e.request.url);
          return request
        } else {       
          console.log('File is not cached, fetching : ' + e.request.url);
          return fetch(e.request)
        }
      })
    )
  })
  
var CACHE_NAME = APP_PREFIX + VERSION;
self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('Installing cache : ' + CACHE_NAME);
            return cache.addAll(URLS)
        })
    )
})

self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (keyList) {
            var cacheWhitelist = keyList.filter(function (key) {
                return key.indexOf(APP_PREFIX)
            })
            cacheWhitelist.push(CACHE_NAME);
            return Promise.all(keyList.map(function (key, i) {
                if (cacheWhitelist.indexOf(key) === -1) {
                    console.log('Deleting cache : ' + keyList[i]);
                    return caches.delete(keyList[i])
                }
            }))
        })
    )
})