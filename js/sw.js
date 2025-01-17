// sw.js

const CACHE_NAME = "my-site-cache-v1";

// تحديث مسارات الملفات حسب هيكل المشروع
const FILES_TO_CACHE = [
  "/", // الصفحة الرئيسية
  "/index.html", // صفحة البداية
  "/css/styles.css", // ملف CSS داخل مجلد css
  "/js/script.js", // ملف JavaScript داخل مجلد js
  "/images/logo.png", // مثال على صورة داخل مجلد images
];

// تثبيت الـ Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// استرجاع الملفات من الكاش عند الطلب
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});

// تحديث الكاش عند وجود ملفات جديدة
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
});
