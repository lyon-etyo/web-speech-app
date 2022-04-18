// Nama cache, digunakan sebagai key untuk melakukan operasi caching
const staticCacheName = "static-assets-v1";
const dynamicCacheName = "dynamic-assets-v1";

// Daftar asset dasar yang perlu di caching
const assets = [
  "/",
  "/index.html",
  "/js/app.js",
  "/css/style.css",
  "/favicon.ico",
  "https://fonts.googleapis.com/css2?family=Quicksand:wght@400;700&display=swap",
  "https://fonts.gstatic.com/s/quicksand/v28/6xKtdSZaM9iE8KbpRA_hJFQNcOM.woff2",
  "https://fonts.gstatic.com/s/quicksand/v28/6xKtdSZaM9iE8KbpRA_hK1QN.woff2",
  "/pages/fallback.html",
];

// Fungsi untuk memberi batasan jumlah cache yang disimpan
async function limitCacheSize(name, size) {
  const caching = await caches.open(name);
  const cachingKeys = await caching.keys();
  if (cachingKeys.length > size) {
    cachingKeys.slice(0, cachingKeys.length - size).forEach(key => caching.delete(key));
  }
}

// Pada saat service worker pertama kali diinstall maka
// aplikasi pada melakukan caching assets
self.addEventListener("install", evt => {
  evt.waitUntil(
    caches.open(staticCacheName).then(cache => {
      console.log("caching shell assets");
      cache.addAll(assets);
    })
  );
});

// Ketika service worker berada fase aktivasi maka
// hapus cache yang tidak digunakan
self.addEventListener("activate", evt => {
  evt.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== staticCacheName && key !== dynamicCacheName)
          .map(key => caches.delete(key))
      );
    })
  );
});

// Ketika aplikasi melakukan request terhadap server
// service worker akan melakukan intercepting
// cek pada cache apakah ada permintaan yang sesuai dengan
// yang diinginkan, jika ada kembalikan responsenya.
// Jika tidak ada coba teruskan request ke server dan
// ketika mendapatkan response, masukan kedalam cache response tersebut.
// jika request tidak dapat diteruskan ke serever,
//  kembalikan halaman fallback.html
self.addEventListener("fetch", evt => {
  evt.respondWith(
    caches.match(evt.request).then(async cachedResponse => {
      if (cachedResponse) return cachedResponse;
      try {
        const fetchResponse = await fetch(evt.request);
        if (fetchResponse.status < 400) {
          const caching = await caches.open(dynamicCacheName);
          await caching.put(evt.request.url, fetchResponse.clone());
          limitCacheSize(dynamicCacheName, 25);
          return fetchResponse;
        }
        // Jika request mengembalikan kode response 400 ke atas
        return caches.match("/pages/fallback.html");
      } catch (error) {
        // Jika kondisi luring
        return caches.match("/pages/fallback.html");
      }
    })
  );
});
