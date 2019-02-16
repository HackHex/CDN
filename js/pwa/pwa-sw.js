const CACHE_VERSION = '1.0.7.1';

const BASE_CACHE_FILES = [
    'https://hackhex.com/general/blockchain-basics-you-need-to-know-about-2520.html',
'https://hackhex.com/security/127-million-records-up-for-sale-2526.html',
'https://hackhex.com/security/runc-lets-you-escape-linux-containers-2514.html',
'https://hackhex.com/tools/lazygit-simple-terminal-ui-2463.html',
'https://hackhex.com/security/us-intelligence-officer-charged-with-spying-for-iranian-hackers-2469.html',
'https://hackhex.com/security/adobe-releases-february-2019-patch-updates-for-75-vulnerabilities-2362.html',
'https://hackhex.com/security/microsoft-patch-february-2019-update-2377.html',
'https://hackhex.com/security/macos-flaw-lets-apps-spy-on-your-safari-browsing-history-2392.html',
'https://hackhex.com/tools/pf-ring-high-speed-packet-capture-2303.html',
'https://hackhex.com/how-to/how-to-get-snapchat-password-without-knowing-2194.html',
'https://hackhex.com/about-us',
'https://hackhex.com/advertise-with-us',
'https://hackhex.com/contact',
'https://hackhex.com/submit-a-tip',
'https://hackhex.com/copyright-policy',
'https://hackhex.com/authors',
'https://hackhex.com/privacy-policy',

];

const OFFLINE_CACHE_FILES = [
     'https://hackhex.com',
];

const NOT_FOUND_CACHE_FILES = [
    'https://hackhex.com',
];

const OFFLINE_PAGE = 'https://hackhex.com';
const NOT_FOUND_PAGE = 'https://hackhex.com';

const CACHE_VERSIONS = {
    content: 'content-v' + CACHE_VERSION,
    notFound: '404-v' + CACHE_VERSION,
    offline: 'offline-v' + CACHE_VERSION,
};

// Define MAX_TTL's in SECONDS for specific file extensions
const MAX_TTL = {
    '/': 3600,
    html: 3600,
    json: 86400,
    js: 86400,
    css: 86400,
    png: 86400,
    jpg: 86400,
};

const CACHE_BLACKLIST =  [
//    (str) => {
//        return !str.includes('/wp-admin/') || !str.startsWith('https://hackhex.com/wp-admin/');
//    },
];
const neverCacheUrls = [/\/wp-admin/,/\/wp-login/,/preview=true/,];


const SUPPORTED_METHODS = [
    'GET',
];
// Check if current url is in the neverCacheUrls list
function checkNeverCacheList(url) {
    if ( this.match(url) ) {
        return false;
    }
    return true;
}
/**
 * isBlackListed
 * @param {string} url
 * @returns {boolean}
 */
function isBlacklisted(url) {
    return (CACHE_BLACKLIST.length > 0) ? !CACHE_BLACKLIST.filter((rule) => {
        if(typeof rule === 'function') {
            return !rule(url);
        } else {
            return false;
        }
    }).length : false
}

/**
 * getFileExtension
 * @param {string} url
 * @returns {string}
 */
function getFileExtension(url) {
    
    if (typeof url === 'string') {
     
        let split_two = url.split('?');
        let split_url = split_two[0];

        let extension = split_url.split('.').reverse()[0].split('?')[0];		
        return (extension.endsWith('/')) ? '/' : extension;
        
    }else{
        return null;
    }            
}
/**
 * getTTL
 * @param {string} url
 */
function getTTL(url) {
    if (typeof url === 'string') {
        let extension = getFileExtension(url);
        if (typeof MAX_TTL[extension] === 'number') {
            return MAX_TTL[extension];
        } else {
            return null;
        }
    } else {
        return null;
    }
}

/**
 * installServiceWorker
 * @returns {Promise}
 */
function installServiceWorker() {
    return Promise.all(
        [
            caches.open(CACHE_VERSIONS.content)
                .then(
                    (cache) => {
                        
                        if(BASE_CACHE_FILES.length >0){
                        
                            for (var i = 0; i < BASE_CACHE_FILES.length; i++) {
                            
                             precacheUrl(BASE_CACHE_FILES[i]) 
                       
                            }
                            
                        }
                        
                        //return cache.addAll(BASE_CACHE_FILES);
                    }
                ),
            caches.open(CACHE_VERSIONS.offline)
                .then(
                    (cache) => {
                        return cache.addAll(OFFLINE_CACHE_FILES);
                    }
                ),
            caches.open(CACHE_VERSIONS.notFound)
                .then(
                    (cache) => {
                        return cache.addAll(NOT_FOUND_CACHE_FILES);
                    }
                )
        ]
    )
        .then(() => {
            return self.skipWaiting();
        });
}

/**
 * cleanupLegacyCache
 * @returns {Promise}
 */
function cleanupLegacyCache() {

    let currentCaches = Object.keys(CACHE_VERSIONS)
        .map(
            (key) => {
                return CACHE_VERSIONS[key];
            }
        );

    return new Promise(
        (resolve, reject) => {

            caches.keys()
                .then(
                    (keys) => {
                        return legacyKeys = keys.filter(
                            (key) => {
                                return !~currentCaches.indexOf(key);
                            }
                        );
                    }
                )
                .then(
                    (legacy) => {
                        if (legacy.length) {
                            Promise.all(
                                legacy.map(
                                    (legacyKey) => {
                                        return caches.delete(legacyKey)
                                    }
                                )
                            )
                                .then(
                                    () => {
                                        resolve()
                                    }
                                )
                                .catch(
                                    (err) => {
                                        reject(err);
                                    }
                                );
                        } else {
                            resolve();
                        }
                    }
                )
                .catch(
                    () => {
                        reject();
                    }
                );

        }
    );
}

function precacheUrl(url) {
    if(!isBlacklisted(url)) {
        caches.open(CACHE_VERSIONS.content)
            .then((cache) => {
                cache.match(url)
                    .then((response) => {
                        if(!response) {
                            return fetch(url)
                        } else {
                            // already in cache, nothing to do.
                            return null
                        }
                    })
                    .then((response) => {
                        if(response) {
                            return cache.put(url, response.clone());
                        } else {
                            return null;
                        }
                    });
            })
    }
}


self.addEventListener(
    'install', event => {
        event.waitUntil(
            Promise.all([
                installServiceWorker(),
                self.skipWaiting(),
            ])
        );
    }
);

// The activate handler takes care of cleaning up old caches.
self.addEventListener(
    'activate', event => {
        event.waitUntil(
            Promise.all(
                [
                    cleanupLegacyCache(),
                    self.clients.claim(),
                    self.skipWaiting(),
                ]
            )
                .catch(
                    (err) => {
                        self.skipWaiting();
                    }
                )
        );
    }
);

self.addEventListener(
    'fetch', event => {
        // Return if the current request url is in the never cache list
        if ( ! neverCacheUrls.every(checkNeverCacheList, event.request.url) ) {
          console.log( 'PWA ServiceWorker: URL exists in excluded list of cache.' );
          return;
        }
        
        // Return if request url protocal isn't http or https
        if ( ! event.request.url.match(/^(http|https):\/\//i) )
            return;
                
        
                
        event.respondWith(
            caches.open(CACHE_VERSIONS.content)
                .then(
                    (cache) => {

                        return cache.match(event.request)
                            .then(
                                (response) => {

                                    if (response) {

                                        let headers = response.headers.entries();
                                        let date = null;

                                        for (let pair of headers) {
                                            if (pair[0] === 'date') {
                                                date = new Date(pair[1]);
                                            }
                                        }

                                        if (date) {
                                            let age = parseInt((new Date().getTime() - date.getTime()));
                                            let ttl = getTTL(event.request.url);

                                            if (age > ttl) {

                                                return new Promise(
                                                    (resolve) => {

                                                        return fetch(event.request.clone())
                                                            .then(
                                                                (updatedResponse) => {
                                                                    if (updatedResponse) {
                                                                        cache.put(event.request, updatedResponse.clone());
                                                                        resolve(updatedResponse);
                                                                    } else {
                                                                        resolve(response)
                                                                    }
                                                                }
                                                            )
                                                            .catch(
                                                                () => {
                                                                    resolve(response);
                                                                }
                                                            );

                                                    }
                                                )
                                                    .catch(
                                                        (err) => {
                                                            return response;
                                                        }
                                                    );
                                            } else {
                                                return response;
                                            }

                                        } else {
                                            return response;
                                        }

                                    } else {
                                        return null;
                                    }
                                }
                            )
                            .then(
                                (response) => {
                                    if (response) {
                                        return response;
                                    } else {
                                        return fetch(event.request.clone())
                                            .then(
                                                (response) => {

                                                    if(response.status < 400) {
                                                        if (~SUPPORTED_METHODS.indexOf(event.request.method) && !isBlacklisted(event.request.url)) {
                                                            cache.put(event.request, response.clone());
                                                        }
                                                        return response;
                                                    } else {
                                                        return caches.open(CACHE_VERSIONS.notFound).then((cache) => {
                                                            return cache.match(NOT_FOUND_PAGE);
                                                        })
                                                    }
                                                }
                                            )
                                            .then((response) => {
                                                if(response) {
                                                    return response;
                                                }
                                            })
                                            .catch(
                                                () => {

                                                    return caches.open(CACHE_VERSIONS.offline)
                                                        .then(
                                                            (offlineCache) => {
                                                                return offlineCache.match(OFFLINE_PAGE)
                                                            }
                                                        )

                                                }
                                            );
                                    }
                                }
                            )
                            .catch(
                                (error) => {
                                    console.error('  Error in fetch handler:', error);
                                    throw error;
                                }
                            );
                    }
                )
        );

    }
);


self.addEventListener('message', (event) => {

    if(
        typeof event.data === 'object' &&
        typeof event.data.action === 'string'
    ) {
        switch(event.data.action) {
            case 'cache' :               
                precacheUrl(event.data.url);
                break;
            default :
                console.log('Unknown action: ' + event.data.action);
                break;
        }
    }

});

importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.6.1/workbox-sw.js");
                                    workbox.googleAnalytics.initialize();
importScripts("https://www.gstatic.com/firebasejs/5.5.4/firebase-app.js");
                                 importScripts("https://www.gstatic.com/firebasejs/5.5.4/firebase-messaging.js");
                                 var config ={
    apiKey: "AIzaSyD4j6TnswUNg7ny1weAdnLtk-ep5OYFRe0",
    authDomain: "hack-hex.firebaseapp.com",
    databaseURL: "https://hack-hex.firebaseio.com",
    projectId: "hack-hex",
    storageBucket: "hack-hex.appspot.com",
    messagingSenderId: "308901436514"
};
                                 if (!firebase.apps.length) {firebase.initializeApp(config);}		  		  		  
                                 const messaging = firebase.messaging();
                                 
                                 messaging.setBackgroundMessageHandler(function(payload) {  
                                 const notificationTitle = payload.data.title;
                                 const notificationOptions = {
                                                    body: payload.data.body,
                                                    icon: payload.data.icon,
                                                    vibrate: [100, 50, 100],
                                                    data: {
                                                        dateOfArrival: Date.now(),
                                                        primarykey: payload.data.primarykey,
                                                        url : payload.data.url
                                                      },
                                                    }
                                        return self.registration.showNotification(notificationTitle, notificationOptions); 

                                });
                                
                                self.addEventListener("notificationclose", function(e) {
                                var notification = e.notification;
                                var primarykey = notification.data.primarykey;
                                console.log("Closed notification: " + primarykey);
                                });
                                
                                self.addEventListener("notificationclick", function(e) {
                                    var notification = e.notification;
                                    var primarykey = notification.data.primarykey;
                                    var action = e.action;
                                    if (action === "close") {
                                      notification.close();
                                    } else {
                                      clients.openWindow(notification.data.url);
                                      notification.close();
                                    }
                                  });                                                                    
                                
