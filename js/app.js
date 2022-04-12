// Check if service worker supported then proceed to register service worker
if ("serviceWorker" in navigator) {
  // Use the window load event to keep the page load performant
  window.addEventListener("load", async _ => {
    try {
      await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker Berhasil Didaftarkan!", serviceWorker);
    } catch (error) {
      console.error("Service Worker Gagal Didaftarkan!", error);
    }
  });
}
