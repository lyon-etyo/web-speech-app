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
let currentCharacterIndex;

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
  try {
    voices = speechSynthesis.getVoices().sort(function (a, b) {
      const aname = a.name.toUpperCase(),
        bname = b.name.toUpperCase();
      if (aname < bname) return -1;
      else if (aname == bname) return 0;
      else return +1;
    });
  } catch (error) {
    console.error(error);
  }

  const optionElement = document.createElement("option");
  voices.forEach(voice => {
    const option = optionElement.cloneNode();
    [option.value, option.textContent] = [voice.name, voice.name];
    voiceLangList.appendChild(option);
  });
}

// Fungsi untuk mengucapkan ucapan
function playSpeech() {
  if (!textarea.value || !utterance.text) return;
  try {
    // Jika sedang dijeda maka lanjutkan berbicara
    if (speechSynthesis.paused && speechSynthesis.speaking) {
      speechSynthesis.resume();
    }

    // Mengucapkan ucapan
    speechSynthesis.speak(utterance);
  } catch (error) {
    console.error(error);
  }
}

// Fungsi untuk menjeda ucapan
function pauseSpeech() {
  if (speechSynthesis.speaking) speechSynthesis.pause();
}

// Fungsi untuk menghentikan ucapan yang sedang diucapkan
function stopSpeech() {
  if (!textarea.value || !utterance.text) return;
  try {
    speechSynthesis.resume();
    speechSynthesis.cancel();
    utterance.text = "";
  } catch (error) {
    console.error(error);
  }
}

// Fungsi untuk melanjutkan ucapan dari kata yang terakhir diucapkan
function resumeFromLastWord() {
  if (utterance.text) {
    speechSynthesis.cancel();
    utterance.text = utterance.text.substring(currentCharacterIndex);
    if (currentCharacterIndex <= 0) return;
    playSpeech();
  }
}

// Fungsi untuk mengeset properti bahasa ucapan
function setVoice() {
  if (!textarea.value || !utterance.text) return;
  try {
    utterance.voice = voices.find(voice => voice.name === this.value);
    resumeFromLastWord();
  } catch (error) {
    console.error(error);
  }
}

// Fungsi untuk mengeset properti rate atau pitch pada speech
// kemudian melanjutkan berbicara
// jika reset = true maka nilai rate dan pitch
function setOption(reset) {
  if (!textarea.value || !utterance.text) return;
  try {
    if (reset) this.value = 1.0;
    utterance[this.name] = this.value;
    resumeFromLastWord();
  } catch (error) {
    console.log(error);
  }
}

// Fungsi untuk menonaktifkan beberapa input sekaligus
function disableElements(disableState, ...elements) {
  elements.forEach(element => (element.disabled = disableState));
}

/* 
===============================================================================
                        Event Listener dan Event Handler 
===============================================================================
*/

// // Ketika awal halaman dimuat
populateVoices();
// Fallback code untuk browser selain chrome
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoices;
}
// speechSynthesis.addEventListener("voiceschanged", populateVoices);

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

// Ketika ucapan mulai diucapkan nonaktifkan fungsionaltas dari
// teks area, tombol katakan dan pilihan bahasa ucapan
utterance.addEventListener("start", evt => {
  disableElements(true, textarea, speakButton, voiceLangList);
  disableElements(false, stopButton, pauseButton);
});

// Ketika ucapan dijeda aktifkan kembali fungsionaltas dari
// tombol katakan dan pilihan bahasa ucapan
utterance.addEventListener("pause", evt => {
  disableElements(false, speakButton, voiceLangList);
});

// Ketika ucapan dilanjutkan untuk diucapkan nonaktifkan fungsionaltas dari
// tombol katakan dan pilihan bahasa ucapan
utterance.addEventListener("resume", evt => {
  disableElements(true, speakButton, voiceLangList);
});

// Ketika ucapan selesai diucapkan aktifkan kembali fungsionaltas dari
// teks area, tombol katakan, dan pilihan bahasa ucapan
utterance.addEventListener("end", evt => {
  disableElements(false, textarea, speakButton, voiceLangList);
  disableElements(true, stopButton, pauseButton);
});

// Ketika ucapan berada kata terakhir yang saat ini sedang diucapkan
utterance.addEventListener("boundary", evt => (currentCharacterIndex = evt.charIndex));
