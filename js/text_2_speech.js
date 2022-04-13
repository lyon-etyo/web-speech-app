/* 
===============================================================================
                    Inisiasi dan Instansiasi Variabel dan Objek
===============================================================================
*/

// Inisiasi Web API Speech Synthesis Utterance
// Merepresentasikan speech request atau permintaan untuk mengucapkan teks
const utterance = new SpeechSynthesisUtterance();

// Inisiasi array kosong nantinya akan diisi dengan bahasa-bahasa ucapan
let voices = [];

// Inisiasi variabel nantinya sebagai penanda karakter terakhir
// yang sekarang sedang diucapkan
let currentCharacter;

// Akses DOM
const textarea = document.querySelector(".text");
const voiceLangList = document.querySelector(".langlist");
const speakButton = document.querySelector(".btn-katakan");
const pauseButton = document.querySelector(".btn-pause");
const stopButton = document.querySelector(".btn-stop");
const options = document.querySelectorAll("[type='range']");

/* 
===============================================================================
                                      Fungsi
===============================================================================
*/

// Fungsi untuk mengambil bahasa-bahasa suara yang tersedia
// di dalam Speech Synthesis
function populateVoices() {
  voices = speechSynthesis.getVoices().sort(function (a, b) {
    const aname = a.name.toUpperCase(),
      bname = b.name.toUpperCase();
    if (aname < bname) return -1;
    else if (aname == bname) return 0;
    else return +1;
  });

  const optionElement = document.createElement("option");
  voices.forEach(voice => {
    const option = optionElement.cloneNode();
    [option.value, option.textContent] = voice.name;
    voiceLangList.appendChild(option);
  });
}

// Fungsi untuk melakukan persiapan sebelum ucapan diucapkan
function setVoice() {
  utterance.voice = voices.find(voice => voice.name === this.value);
}

// Fungsi untuk mendisable beberapa input sekaligus
function disableElements(disableState, ...elements) {
  elements.forEach(element => (element.disabled = disableState));
}

// Fungsi untuk mengucapkan ucapan
function playSpeech() {
  // Jika sedang dijeda maka lanjutkan berbicara
  if (speechSynthesis.paused && speechSynthesis.speaking) {
    speechSynthesis.resume();
    disableElements(true, speakButton, voiceLangList);
  }

  // Mendisable fungsionalitas elemen teks area, tombol katakan,
  // dan pilihan bahasa ucapan
  disableElements(true, textarea, speakButton, voiceLangList);

  // Mengucapkan ucapan
  speechSynthesis.speak(utterance);
}

// Fungsi untuk menjeda ucapan
function pauseSpeech() {
  if (speechSynthesis.speaking) {
    speechSynthesis.pause();
    disableElements(false, speakButton, voiceLangList);
  }
}

// Fungsi untuk menghentikan ucapan yang sedang diucapkan
function stopSpeech() {
  speechSynthesis.resume();
  speechSynthesis.cancel();
  utterance.text = "";
}

// Fungsi untuk mengeset properti rate atau pitch pada speech
// kemudian melanjutkan berbicara
// jika reset = true maka nilai rate dan pitch
function setOption(reset) {
  speechSynthesis.cancel();
  utterance.text = utterance.text.substring(currentCharacter);
  if (reset) this.value = 1.0;
  utterance[this.name] = this.value;
  playSpeech();
}

/* 
===============================================================================
                        Event Listener dan Event Handler 
===============================================================================
*/

// Ketika awal halaman dimuat
populateVoices();
// Fallback code untuk browser selain chrome
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoices;
}

// Ketika terjadi perubahan pilihan pada pilihan bahasa ucapan
voiceLangList.addEventListener("change", setVoice);

// Ketika terjadi perubahan nilai pada input kecepatan dan ketinggian
options.forEach(option => {
  option.addEventListener("change", evt => {
    setOption.call(option, false);
  });
  option.addEventListener("contextmenu", evt => {
    evt.preventDefault();
    setOption.call(option, true);
  });
});

// Ketika tombol katakan, jeda, dan hentikan diklik
speakButton.addEventListener("click", evt => {
  // Mengucapkan ucapan dengan teks dari textarea
  utterance.text = textarea.value;
  playSpeech();
});
pauseButton.addEventListener("click", pauseSpeech);
stopButton.addEventListener("click", stopSpeech);

// Ketika ucapan berada kata terakhir yang saat ini sedang diucapkan
utterance.addEventListener("boundary", evt => (currentCharacter = evt.charIndex));

// Ketika ucapan selesai diucapkan kembalikan fungsionaltas dari
// teks area, tombol katakan, dan pilihan bahasa ucapan
utterance.addEventListener("end", _ => {
  disableElements(false, textarea, speakButton, voiceLangList);
});
