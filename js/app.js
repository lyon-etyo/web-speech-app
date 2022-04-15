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

// Fungsi untuk mengeset nilai label pada label kecepatan dan ketinggian
function setOptionLabelValue(optionsLabel, option) {
  optionsLabel.forEach(label => {
    if (label.classList.contains(option.name)) label.textContent = option.value;
  });
}

// Fungsi untuk menonaktifkan beberapa input sekaligus
function disableElements(disableState, ...elements) {
  elements.forEach(element => (element.disabled = disableState));
}
