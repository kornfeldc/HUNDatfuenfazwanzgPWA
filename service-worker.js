importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.2.0/workbox-sw.js');
const VERSION ="1.1.1";

if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);

  // workbox.core.setCacheNameDetails({
  //   prefix: 'kantine',
  //   suffix: VERSION
  // });

  //cache first libraries
  const cacheFirst = (scripts) => {
    scripts.forEach(script => 
      workbox.routing.registerRoute(script, workbox.strategies.cacheFirst())
    );
  }

  cacheFirst([
    'https://code.jquery.com/jquery-3.4.0.min.js',
    'https://cdn.jsdelivr.net/npm/vue/dist/vue.js',
    'https://unpkg.com/vue-router/dist/vue-router.js', 
    'https://cdn.jsdelivr.net/pouchdb/5.4.5/pouchdb.min.js',
    'https://unpkg.com/pouchdb@7.0.0/dist/pouchdb.find.js'
  ]);

  
  //network first 
  workbox.routing.registerRoute(new RegExp('.*\.js'), workbox.strategies.networkFirst(/*{
    plugins: [
      new workbox.expiration.Plugin({
        // Cache only 30 images
        name: "jscache"+VERSION,
        //maxEntries: 30,
        // Cache for a maximum of a day
        //maxAgeSeconds: 1 * 24 * 60 * 60,
      })
    ]
  }*/));
  
  //css (Use cache but update in the background ASAP)
  workbox.routing.registerRoute(/.*\.css/, workbox.strategies.staleWhileRevalidate({ cacheName: 'css-cache' }));
  workbox.routing.registerRoute(/.*\.woff/, workbox.strategies.staleWhileRevalidate({ cacheName: 'woff-cache' }));
  workbox.routing.registerRoute(/.*\.ttf/, workbox.strategies.staleWhileRevalidate({ cacheName: 'ttf-cache' }));
  workbox.routing.registerRoute(/.*\.woff2/, workbox.strategies.staleWhileRevalidate({ cacheName: 'woff2-cache' }));
  workbox.routing.registerRoute(/.*\.eot/, workbox.strategies.staleWhileRevalidate({ cacheName: 'eot-cache' }));

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
          // Cache for a maximum of 30 day
          maxAgeSeconds: 30 * 24 * 60 * 60,
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