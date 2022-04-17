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

// Fungsi untuk memunculkan tooltip
function showTooltip(element) {
  if (element.lastElementChild.className == "tooltip") return;
  const tooltip = document.createElement("div");
  tooltip.innerText = "Tersalin";
  tooltip.className = "tooltip";

  element.appendChild(tooltip);
  tooltip.setAttribute("open", "");
  setTimeout(_ => {
    tooltip.removeAttribute("open");
    tooltip.setAttribute("close", "");
  }, 1400);
  setTimeout(() => {
    tooltip.remove();
  }, 2000);
}

// Akses DOM
const linkBack = document.querySelector(".link-back");

// Ketika ikon panah ke-kiri di klik maka akan kembali ke halaman sebelumnya
if (linkBack) {
  linkBack.addEventListener("click", _ => {
    window.history.back();
  });
}
