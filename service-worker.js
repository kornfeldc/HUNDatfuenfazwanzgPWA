importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.2.0/workbox-sw.js');
const VERSION ="1.0.4";

if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);

  workbox.core.setCacheNameDetails({
    prefix: 'kantine',
    suffix: VERSION
  });

  //cache first libraries
  const cacheFirst = (scripts) => {
    scripts.forEach(script => 
      workbox.routing.registerRoute(script, workbox.strategies.cacheFirst())
    );
  }

  cacheFirst([
    'https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.4/css/bulma.min.css',
    'https://use.fontawesome.com/releases/v5.8.1/css/all.css', 
    'https://code.jquery.com/jquery-3.4.0.min.js',
    'https://cdn.jsdelivr.net/npm/vue/dist/vue.js',
    'https://unpkg.com/vue-router/dist/vue-router.js', 
    'https://cdn.jsdelivr.net/pouchdb/5.4.5/pouchdb.min.js'
  ]);

  
  //network first 
  workbox.routing.registerRoute(new RegExp('.*\.js'), workbox.strategies.networkFirst({
    plugins: [
      new workbox.expiration.Plugin({
        // Cache only 30 images
        name: "jscache"+VERSION,
        maxEntries: 30,
        // Cache for a maximum of a day
        maxAgeSeconds: 1 * 24 * 60 * 60,
      })
    ]
  }));
  
  //css (Use cache but update in the background ASAP)
  workbox.routing.registerRoute(/.*\.css/, workbox.strategies.staleWhileRevalidate({ cacheName: 'css-cache' }));

  //images
  workbox.routing.registerRoute(
    // Cache image files
    /.*\.(?:png|jpg|jpeg|svg|gif)/,
    // Use the cache if it's available
    workbox.strategies.cacheFirst({
      // Use a custom cache name
      cacheName: 'image-cache',
      plugins: [
        new workbox.expiration.Plugin({
          // Cache only 30 images
          maxEntries: 30,
          // Cache for a maximum of a day
          maxAgeSeconds: 1 * 24 * 60 * 60,
        })
      ],
    })
  );

  const matchCb = ({url, event}) => {
    return (url.pathname === '/');
  };

  workbox.routing.registerRoute(matchCb, workbox.strategies.networkFirst());

} else {
  console.log(`Boo! Workbox didn't load 😬`);
}