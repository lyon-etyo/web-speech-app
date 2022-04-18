/* 
===============================================================================
                    Inisiasi dan Instansiasi Variabel dan Objek
===============================================================================
*/

// Inisiasi Web API Speech Synthesis Utterance
// Merepresentasikan speech request atau permintaan untuk mengucapkan teks
const utterance = new SpeechSynthesisUtterance();

const speech = window.speechSynthesis;

// Inisiasi array kosong nantinya akan diisi dengan bahasa-bahasa ucapan
let voices = [];

// Inisiasi variabel nantinya sebagai penanda karakter terakhir
// yang sekarang sedang diucapkan
let currentCharacterIndex;

// Akses DOM
const textarea = document.querySelector(".area-teks");
const voiceLangList = document.querySelector(".langlist");
const speakButton = document.querySelector(".btn-katakanlah");
const pauseButton = document.querySelector(".btn-pause");
const stopButton = document.querySelector(".btn-stop");
const options = document.querySelectorAll("[type='range']");
const optionsLabel = document.querySelectorAll(".label-value");

/* 
===============================================================================
                                      Fungsi
===============================================================================
*/

/**
 * Fungsi untuk mengambil bahasa-bahasa suara yang tersedia
 * di dalam Speech Synthesis
 *
 */
function populateVoices() {
  try {
    voices = speech.getVoices().sort(function (a, b) {
      const aname = a.name.toUpperCase(),
        bname = b.name.toUpperCase();
      if (aname < bname) return -1;
      else if (aname == bname) return 0;
      else return +1;
    });
  } catch (error) {
    console.error(error.message);
  }

  const optionElement = document.createElement("option");
  voices.forEach(voice => {
    const option = optionElement.cloneNode();
    [option.value, option.textContent] = [voice.name, voice.name];
    voiceLangList.appendChild(option);
  });
}

/**
 * Fungsi untuk mengucapkan ucapan
 *
 */
function playSpeech() {
  if (!textarea.value || !utterance.text) return;
  try {
    // Jika sedang dijeda maka lanjutkan berbicara
    if (speech.paused && speech.speaking) {
      speech.resume();
    }

    // Mengucapkan ucapan
    speech.speak(utterance);
  } catch (error) {
    console.error(error.message);
  }
}

/**
 * Fungsi untuk menjeda ucapan
 *
 */
function pauseSpeech() {
  if (speech.speaking) speech.pause();
}

// Fungsi untuk menghentikan ucapan yang sedang diucapkan
function stopSpeech() {
  if (!textarea.value || !utterance.text) return;
  try {
    speech.resume();
    speech.cancel();
    utterance.text = "";
  } catch (error) {
    console.error(error.message);
  }
}

/**
 * Fungsi untuk melanjutkan ucapan dari kata yang terakhir diucapkan
 *
 */
function resumeFromLastWord() {
  if (utterance.text) {
    speech.cancel();
    utterance.text = utterance.text.substring(currentCharacterIndex);
    if (currentCharacterIndex <= 0) return;
    playSpeech();
    speakButton.textContent = "Katakanlah";
  }
}

/**
 * Fungsi untuk mengeset properti bahasa ucapan
 *
 *
 */
function setVoice() {
  try {
    utterance.voice = voices.find(voice => voice.name === this.value);
    if (!textarea.value || !utterance.text) return;
    resumeFromLastWord();
  } catch (error) {
    console.error(error.message);
  }
}

/**
 * Fungsi untuk mengeset properti rate atau pitch pada speech
 * kemudian melanjutkan berbicara
 * jika reset = true maka nilai rate dan pitch
 *
 * @param {Boolean} reset
 */
function setOption(reset) {
  try {
    if (reset) this.value = 1.0;
    utterance[this.name] = this.value;
    if (!textarea.value || !utterance.text) return;
    resumeFromLastWord();
  } catch (error) {
    console.log(error);
  }
}

/* 
===============================================================================
                        Event Listener dan Event Handler 
===============================================================================
*/

// // Ketika awal halaman dimuat
populateVoices();
// Fallback code untuk browser selain chrome
if (speech.onvoiceschanged !== undefined) {
  speech.onvoiceschanged = populateVoices;
}
// speech.addEventListener("voiceschanged", populateVoices);

// Ketika terjadi perubahan pilihan pada pilihan bahasa ucapan
voiceLangList.addEventListener("change", setVoice);

// Ketika terjadi perubahan nilai pada input kecepatan dan ketinggian
options.forEach(option => {
  option.addEventListener("change", _ => {
    setOption.call(option, false);
    setOptionLabelValue(optionsLabel, option);
  });
  option.addEventListener("contextmenu", evt => {
    evt.preventDefault();
    setOption.call(option, true);
    setOptionLabelValue(optionsLabel, option);
  });
  option.previousElementSibling.firstElementChild.addEventListener("click", _ => {
    setOption.call(option, true);
    setOptionLabelValue(optionsLabel, option);
  });
});

// Ketika tombol katakanlah, jeda, dan hentikan diklik
speakButton.addEventListener("click", evt => {
  // Mengucapkan ucapan dengan teks dari textarea
  utterance.text = textarea.value;
  playSpeech();
});
pauseButton.addEventListener("click", pauseSpeech);
stopButton.addEventListener("click", stopSpeech);

// Ketika ucapan mulai diucapkan nonaktifkan fungsionaltas dari
// teks area, tombol katakanlah dan pilihan bahasa ucapan
utterance.addEventListener("start", evt => {
  disableElements(true, textarea, speakButton, voiceLangList);
  disableElements(false, stopButton, pauseButton);
});

// Ketika ucapan dijeda aktifkan kembali fungsionaltas dari
// tombol katakanlah dan pilihan bahasa ucapan
utterance.addEventListener("pause", evt => {
  speakButton.textContent = "Lanjutkan";
  disableElements(true, pauseButton);
  disableElements(false, speakButton, voiceLangList);
});

// Ketika ucapan dilanjutkan untuk diucapkan nonaktifkan fungsionaltas dari
// tombol katakanlah dan pilihan bahasa ucapan
utterance.addEventListener("resume", evt => {
  speakButton.textContent = "Katakanlah";
  disableElements(true, speakButton, voiceLangList);
  disableElements(false, pauseButton);
});

// Ketika ucapan selesai diucapkan aktifkan kembali fungsionaltas dari
// teks area, tombol katakanlah, dan pilihan bahasa ucapan
utterance.addEventListener("end", evt => {
  speakButton.textContent = "Katakanlah";
  disableElements(false, textarea, speakButton, voiceLangList);
  disableElements(true, stopButton, pauseButton);
});

// Ketika ucapan berada kata terakhir yang saat ini sedang diucapkan
utterance.addEventListener("boundary", evt => (currentCharacterIndex = evt.charIndex));
