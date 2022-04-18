/* 
===============================================================================
                    Inisiasi dan Instansiasi Variabel dan Objek
===============================================================================
*/

// Inisiasi Web Speech API SpeechRecognititon
// Menangani pengenalan suara dan event
try {
  window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!window.SpeechRecognition) {
    throw new Error("SpeechRecognition tidak didukung oleh peramban");
  }

  const recognition = new SpeechRecognition();
  // Mengembalikan Hasil dari pengenalan suara meskipun proses pengenalan suara
  // belum pada fase akhir
  recognition.interimResults = true;

  // Hasil pengenalan suara lebih dari 1, dan tidak akan menimpa hasil sebelumnya
  recognition.continuous = true;

  // Bahasa pengenalan suara adalah bahasa Indonesia
  recognition.lang = "id-ID";

  // Akses DOM
  const textarea = document.querySelector(".area-teks");
  const clipButton = document.querySelector(".btn-clip");
  const speakButton = document.querySelector(".btn-katakanlah");
  const stopButton = document.querySelector(".btn-stop");
  const saveButton = document.querySelector(".btn-save");

  // Membuat elemen paragraf nantinya akan diisi teks dari hasil pengenalan suara
  let paragraph = document.createElement("p");

  /* 
===============================================================================
                                      Fungsi
===============================================================================
*/

  /**
   * Fungsi untuk memulai sesi pengenalan suara dan mendaftarkan
   * event handler yang berkaitan dengan pengenalan suara untuk
   * aplikasi ini
   *
   * Catatan: Pastikan aplikasi diizinkan untuk mengakses microphone *
   */
  function startSpeak() {
    recognition.addEventListener("result", recognizeSpeech);
    recognition.addEventListener("end", recognition.start);
    recognition.start();
    disableElements(true, speakButton);
    disableElements(false, stopButton, clipButton, saveButton);
  }

  /**
   * Fungsi untuk mmenangani hasil pengenalan suara
   *
   * @param {SpeechRecognitionEvent Object} evt
   */
  function recognizeSpeech(evt) {
    textarea.appendChild(paragraph);
    // Ubah hasil pengenalan suara ke bentuk Array
    // Mapping hinggga pada properti transcrip
    // untuk mendapatkan teks hasil pengenalan suara
    const transcript = Array.from(evt.results)
      .map(result => result[0])
      .map(result => result.transcript)
      .join("");
    let processText;

    // Mengganti huruf kecil menjadi huruf besar di awal paragraf
    processText = transcript.replace(/\b[a-z]/, char => char.charAt(0).toUpperCase());

    // Perintah untuk mengganti tanda baca pada transcript menjadi
    // tanda baca ",", "!", "?", "(", ")" dan ":"
    processText = processText.replace(/ tanda koma| tanda baca koma/gi, ",");
    processText = processText.replace(/ tanda seru| tanda baca seru/gi, "!");
    processText = processText.replace(/ tanda tanya| tanda baca tanya/gi, "?");
    processText = processText.replace(/ tanda titik| tanda baca titik/gi, ". ");
    processText = processText.replace(/ kurung buka/gi, "(");
    processText = processText.replace(/ kurung tutup/gi, ")");
    processText = processText.replace(/ titik dua/gi, ":");

    // Perintah untuk membuat baris baru
    processText = processText.replace(/buat baris baru/gi, "\n");

    // Menampilkan teks hasil pengenalan suara setelah diproses pada paragraf
    paragraph.innerText = processText;

    // if (evt.results[0].isFinal) {
    //   paragraph = paragraph.cloneNode();
    //   textarea.appendChild(paragraph);
    // }

    // Perintah untuk membuat paragraf baru
    const breakRow = /buat paragraf$/gi.test(processText);
    try {
      if (breakRow) {
        paragraph.innerText = paragraph.innerText.replace(/buat paragraf$/gi, "");
        recognition.abort();
        paragraph = paragraph.cloneNode();
        textarea.appendChild(paragraph);
      }
    } catch (error) {
      console.error(error);
    }

    // Perintah untuk menghapus paragraf saat ini
    const deleteRow = /hapus paragraf/gi.test(processText);
    try {
      if (deleteRow) {
        paragraph.innerText = paragraph.innerText.replace(/hapus paragraf$/gi, "");
        recognition.abort();
        paragraph.remove();
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Fungsi untuk mengakhiri sesi pengenalan suara dan menhapus
   * event handler yang telah didaftarkan saat memulai sesi
   *
   */
  function stopSpeak() {
    recognition.removeEventListener("result", recognizeSpeech);
    recognition.removeEventListener("end", recognition.start);
    recognition.abort();

    textarea.innerHTML = "";
    disableElements(false, speakButton);
    disableElements(true, stopButton, clipButton, saveButton);
  }

  /**
   * Fungsi untuk menyalin tulisan dalam textarea ke dalam clipboard
   *
   * @return {void}
   */
  function copyToClipboard() {
    if (!textarea.innerText) return;
    try {
      if (!navigator.clipboard) throw new Error("Clipboard tidak didukung");
      // Cek apakah peramban telah mengizinkan akses tulis ke dalam clipboard
      navigator.permissions.query({ name: "clipboard-write" }).then(result => {
        if (result.state == "granted" || result.state == "prompt") {
          const text = CapitalizeFirstLetterOfSentence(textarea.innerText);
          navigator.clipboard.writeText(text);
          showTooltip(clipButton);
        }
      });
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Fungsi untuk menyimpan tulisan dalam textarea ke bentuk file .txt
   *
   * @return {void}
   */
  function saveToFile() {
    if (!textarea.innerText) return;
    try {
      const anchor = document.createElement("a");
      const objectURL = makeTextFile(textarea.innerText);
      anchor.href = objectURL;
      anchor.download = "Katakanlah.txt";
      anchor.click();
      window.URL.revokeObjectURL(objectURL);
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Fungsi untuk membuat file txt
   *
   * @param {String} text
   * @return {Object} url
   */
  function makeTextFile(text) {
    try {
      const blob = new Blob([text], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      return url;
    } catch (error) {
      console.error(error);
    }
  }

  // /**
  //  * Fungsi untuk membuat file csv
  //  *
  //  * @param {String} text
  //  * @return {Object} url
  //  */
  // function makeCSVFile(text) {
  //   try {
  //     text = textarea.innerText.replace(/\n\n/gi, "\n");
  //     const blob = new Blob([text], { type: "text/csv" });
  //     const url = window.URL.createObjectURL(blob);
  //     return url;
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

  /**
   * Fungsi untuk mengubah huruf kecil menjadi huruf besar
   * pada awal kalimat (Setelah tanda titik)
   *
   * @param {String} text
   * @return {String}
   */
  function CapitalizeFirstLetterOfSentence(text) {
    // Fungsi inner untuk melakukan pengubahan huruf kecil ke besar
    // pada kata yang telah ditemukan
    function capitalize(match, offset, string) {
      console.log(match, offset, string);
      let firstLetter = match.charAt(0).toUpperCase();
      let stringPart = match.substring(1);
      return firstLetter + stringPart;
    }
    return text.replace(/(?<=\. )\w{1,}/gi, capitalize);
  }

  /**
   * Fungsi untuk memindahkan posisi scrollbar ke bawah
   * agar baris teks pada posisi terakhir tetap tersorot
   *
   */
  function setScrollbarToBottom() {
    // if (this.scrollHeight > this.offsetHeight) this.scrollTop = this.scrollHeight;

    if (document.body.scrollHeight >= window.innerHeight) {
      window.scrollTo(0, document.body.scrollHeight);
    }
  }

  /* 
===============================================================================
                        Event Listener dan Event Handler 
===============================================================================
*/

  // Ketika tombol Katakanlah, Hentikan, Simpan ke File,
  // atau ikon Salin teks diklik
  speakButton.addEventListener("click", startSpeak);
  stopButton.addEventListener("click", stopSpeak);
  saveButton.addEventListener("click", saveToFile);
  clipButton.addEventListener("click", copyToClipboard);

  // Ketika sesi pengenalan suara
  recognition.addEventListener("result", setScrollbarToBottom);
} catch (error) {
  console.error(error.message);
}
