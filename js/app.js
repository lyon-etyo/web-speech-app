// Cek apakah layana servis worker didukung oleh peramban
// jika didukung daftarkan service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async _ => {
    try {
      await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker Berhasil Didaftarkan!");
    } catch (error) {
      console.error("Service Worker Gagal Didaftarkan!", error);
    }
  });
}
