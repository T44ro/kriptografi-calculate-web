import { useState } from 'react';

// --- ALGORITMA KRIPTOGRAFI ---

// 1. Vigenere Cipher
const vigenereCipher = (text, key, decrypt = false) => {
  if (!key) return text;
  key = key.toUpperCase().replace(/[^A-Z]/g, ''); 
  if (!key) return text;

  let result = '';
  let keyIndex = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char.match(/[a-z]/i)) {
      const isUpper = char === char.toUpperCase();
      const offset = isUpper ? 65 : 97;
      const shift = key.charCodeAt(keyIndex % key.length) - 65;
      const direction = decrypt ? -1 : 1;
      
      let newChar = ((char.charCodeAt(0) - offset + (shift * direction)) % 26);
      if (newChar < 0) newChar += 26;
      
      result += String.fromCharCode(newChar + offset);
      keyIndex++;
    } else {
      result += char; 
    }
  }
  return result;
};

// 2. Affine Cipher
const modInverse = (a, m) => {
  for (let x = 1; x < m; x++) {
    if ((a * x) % m === 1) return x;
  }
  return 1; 
};

const affineCipher = (text, a, b, decrypt = false) => {
  a = parseInt(a);
  b = parseInt(b);
  if (isNaN(a) || isNaN(b)) return "Error: Masukkan nilai a dan b";
  
  let a_inv = modInverse(a, 26);
  if (decrypt && a_inv === 1 && a !== 1) {
    return "Error: Nilai 'a' tidak coprime dengan 26. Ganti angka lain (misal: 3, 5, 7, 11).";
  }

  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char.match(/[a-z]/i)) {
      const isUpper = char === char.toUpperCase();
      const offset = isUpper ? 65 : 97;
      const x = char.charCodeAt(0) - offset;
      let newChar;
      
      if (decrypt) {
        newChar = (a_inv * (x - b)) % 26; 
      } else {
        newChar = (a * x + b) % 26;       
      }
      
      if (newChar < 0) newChar += 26;
      result += String.fromCharCode(newChar + offset);
    } else {
      result += char;
    }
  }
  return result;
};

// 3. Playfair Cipher
const playfairCipher = (text, key, decrypt = false) => {
  if (!key) return text;
  
  key = key.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
  const alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ";
  let matrixStr = "";
  for (let char of key + alphabet) {
    if (!matrixStr.includes(char)) matrixStr += char;
  }

  const getPos = (char) => {
    let idx = matrixStr.indexOf(char.toUpperCase() === 'J' ? 'I' : char.toUpperCase());
    return [Math.floor(idx / 5), idx % 5];
  };

  let result = text.split('');
  let letterIndices = [];
  let letters = [];
  
  for (let i = 0; i < text.length; i++) {
    if (/[a-z]/i.test(text[i])) {
      letterIndices.push(i);
      letters.push(text[i]);
    }
  }

  for (let i = 0; i < letters.length - 1; i += 2) {
    let c1 = letters[i];
    let c2 = letters[i + 1];
    let isUpper1 = c1 === c1.toUpperCase();
    let isUpper2 = c2 === c2.toUpperCase();

    let [r1, col1] = getPos(c1);
    let [r2, col2] = getPos(c2);

    let e1, e2;
    if (r1 === r2) { 
      e1 = matrixStr[r1 * 5 + ((col1 + (decrypt ? 4 : 1)) % 5)];
      e2 = matrixStr[r2 * 5 + ((col2 + (decrypt ? 4 : 1)) % 5)];
    } else if (col1 === col2) { 
      e1 = matrixStr[((r1 + (decrypt ? 4 : 1)) % 5) * 5 + col1];
      e2 = matrixStr[((r2 + (decrypt ? 4 : 1)) % 5) * 5 + col2];
    } else { 
      e1 = matrixStr[r1 * 5 + col2];
      e2 = matrixStr[r2 * 5 + col1];
    }

    letters[i] = isUpper1 ? e1 : e1.toLowerCase();
    letters[i + 1] = isUpper2 ? e2 : e2.toLowerCase();
  }

  for (let i = 0; i < letterIndices.length; i++) {
    result[letterIndices[i]] = letters[i];
  }
  
  return result.join('');
};

// 4. Hill Cipher
const hillCipher = (text, keyStr, decrypt = false) => {
  let nums = keyStr.split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
  if (nums.length !== 4) return "Error: Hill Cipher 2x2 butuh 4 angka dipisah spasi (misal: 3 3 2 5)";
  
  let [a, b, c, d] = nums;

  let det = (a * d - b * c) % 26;
  if (det < 0) det += 26;
  
  let detInv = modInverse(det, 26); 
  if (detInv === 1 && det !== 1) return "Error: Determinan matriks tidak memiliki invers modulo 26. Ganti angka kunci.";

  let k11 = a, k12 = b, k21 = c, k22 = d;
  
  if (decrypt) {
    k11 = (d * detInv) % 26;
    k12 = (-b * detInv) % 26;
    k21 = (-c * detInv) % 26;
    k22 = (a * detInv) % 26;
    if (k11 < 0) k11 += 26;
    if (k12 < 0) k12 += 26;
    if (k21 < 0) k21 += 26;
    if (k22 < 0) k22 += 26;
  }

  let result = text.split('');
  let letterIndices = [];
  let letters = [];
  
  for (let i = 0; i < text.length; i++) {
    if (/[a-z]/i.test(text[i])) {
      letterIndices.push(i);
      letters.push(text[i]);
    }
  }

  for (let i = 0; i < letters.length - 1; i += 2) {
    let isUpper1 = letters[i] === letters[i].toUpperCase();
    let isUpper2 = letters[i + 1] === letters[i + 1].toUpperCase();

    let p1 = letters[i].toUpperCase().charCodeAt(0) - 65;
    let p2 = letters[i + 1].toUpperCase().charCodeAt(0) - 65;

    let e1 = (k11 * p1 + k12 * p2) % 26;
    let e2 = (k21 * p1 + k22 * p2) % 26;

    letters[i] = String.fromCharCode(e1 + (isUpper1 ? 65 : 97));
    letters[i + 1] = String.fromCharCode(e2 + (isUpper2 ? 65 : 97));
  }

  for (let i = 0; i < letterIndices.length; i++) {
    result[letterIndices[i]] = letters[i];
  }
  
  return result.join('');
};

// 5. Enigma Cipher 
const enigmaCipher = (text, keySettings) => {
  const rotorI = "EKMFLGDQVZNTOWYHXUSPAIBRCJ";
  const rotorII = "AJDKSIRUXBLHWTMCQGZNPYFVOE";
  const rotorIII = "BDFHJLCPRTXVZNYEIWGAKMUSQO";
  const reflectorB = "YRUHQSLDPXNGOKMIEBFZCWVJAT";
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  let settings = (keySettings || "AAA").toUpperCase().replace(/[^A-Z]/g, '');
  while (settings.length < 3) settings += 'A'; 
  
  let p1 = alphabet.indexOf(settings[0]);
  let p2 = alphabet.indexOf(settings[1]);
  let p3 = alphabet.indexOf(settings[2]);

  const mapForward = (char, rotor, offset) => {
    let idx = (char.charCodeAt(0) - 65 + offset) % 26;
    let mappedChar = rotor[idx];
    let mappedIdx = (mappedChar.charCodeAt(0) - 65 - offset + 26) % 26;
    return String.fromCharCode(mappedIdx + 65);
  };

  const mapBackward = (char, rotor, offset) => {
     let targetIdx = (char.charCodeAt(0) - 65 + offset) % 26;
     let targetChar = String.fromCharCode(targetIdx + 65);
     let idx = rotor.indexOf(targetChar);
     let origIdx = (idx - offset + 26) % 26;
     return String.fromCharCode(origIdx + 65);
  };

  let result = "";
  
  for (let i = 0; i < text.length; i++) {
    let char = text[i];
    
    if (/[a-z]/i.test(char)) {
       let isUpper = char === char.toUpperCase();
       let c = char.toUpperCase();

       p1 = (p1 + 1) % 26;
       if (p1 === 0) {
         p2 = (p2 + 1) % 26;
         if (p2 === 0) {
           p3 = (p3 + 1) % 26;
         }
       }

       c = mapForward(c, rotorI, p1);
       c = mapForward(c, rotorII, p2);
       c = mapForward(c, rotorIII, p3);

       c = reflectorB[c.charCodeAt(0) - 65];

       c = mapBackward(c, rotorIII, p3);
       c = mapBackward(c, rotorII, p2);
       c = mapBackward(c, rotorI, p1);

       result += isUpper ? c : c.toLowerCase();
    } else {
       result += char;
    }
  }
  return result;
};


// --- KOMPONEN UTAMA (GUI) ---
function App() {
  const [algorithm, setAlgorithm] = useState('vigenere');
  const [inputType, setInputType] = useState('text');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [fileObj, setFileObj] = useState(null); 
  const [fileBase64, setFileBase64] = useState(''); 
  const [outputBase64, setOutputBase64] = useState(''); 
  
  const [keys, setKeys] = useState({
    vigenere: '',
    affineA: '',
    affineB: '',
    playfair: '',
    hill: '',
    enigma: ''
  });

  const handleKeyChange = (e, keyName) => {
    setKeys({ ...keys, [keyName]: e.target.value });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileObj({ name: file.name, type: file.type });

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target.result;
      setFileBase64(base64String);
      setInputText(`[File terdeteksi: ${file.name}]\nPreview Header:\n${base64String.substring(0, 100)}...`);
      setOutputText('');
      setOutputBase64('');
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = () => {
    if (!outputBase64) {
      alert("Belum ada file hasil untuk diunduh!");
      return;
    }
    const link = document.createElement('a');
    link.href = outputBase64;
    link.download = `hasil_${fileObj.name}`; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleProcess = (mode) => {
    let textToProcess = '';
    let base64Header = '';

    if (inputType === 'text') {
      textToProcess = inputText;
    } else {
      if (!fileBase64) {
        alert("Silakan upload file terlebih dahulu!");
        return;
      }
      const splitIndex = fileBase64.indexOf(',') + 1;
      base64Header = fileBase64.substring(0, splitIndex);
      textToProcess = fileBase64.substring(splitIndex);
    }

    let processedText = '';
    const isDecrypt = mode === 'Dekripsi';

    switch (algorithm) {
      case 'vigenere':
        if (!keys.vigenere) { alert("Masukkan kunci Vigenere!"); return; }
        processedText = vigenereCipher(textToProcess, keys.vigenere, isDecrypt);
        break;
      case 'affine':
        if (!keys.affineA || !keys.affineB) { alert("Masukkan nilai a dan b untuk Affine!"); return; }
        processedText = affineCipher(textToProcess, keys.affineA, keys.affineB, isDecrypt);
        break;
      case 'playfair':
        if (!keys.playfair) { alert("Masukkan kunci Playfair!"); return; }
        processedText = playfairCipher(textToProcess, keys.playfair, isDecrypt);
        break;
      case 'hill':
        if (!keys.hill) { alert("Masukkan matriks kunci Hill Cipher!"); return; }
        processedText = hillCipher(textToProcess, keys.hill, isDecrypt);
        if (processedText.startsWith("Error")) {
          alert(processedText);
          return;
        }
        break;
      case 'enigma':
        if (!keys.enigma || keys.enigma.length !== 3) { 
          alert("Masukkan kunci Enigma tepat 3 huruf (misal: ABC, XYZ)!"); 
          return; 
        }
        processedText = enigmaCipher(textToProcess, keys.enigma);
        break; 
      default:
        processedText = textToProcess;
    }
    
    if (inputType === 'text') {
      setOutputText(processedText);
    } else {
      const finalBase64 = base64Header + processedText;
      setOutputBase64(finalBase64);
      setOutputText(`[File ${mode} Berhasil]\nSiap diunduh!\nPreview:\n${finalBase64.substring(0, 100)}...`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-800">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-indigo-600 p-6 text-white">
          <h1 className="text-2xl md:text-3xl font-bold tracking-wider">Kalkulator Kriptografi Klasik</h1>
          <p className="text-indigo-200 mt-2">Vigenere | Affine | Playfair | Hill | Enigma</p>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 space-y-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div>
              <label className="block text-sm font-semibold mb-2">Pilih Algoritma:</label>
              <select 
                value={algorithm} 
                onChange={(e) => setAlgorithm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="vigenere">Vigenere Cipher</option>
                <option value="affine">Affine Cipher</option>
                <option value="playfair">Playfair Cipher</option>
                <option value="hill">Hill Cipher</option>
                <option value="enigma">Enigma Cipher</option>
              </select>
            </div>

            <div className="pt-4 border-t border-gray-300">
              <label className="block text-sm font-semibold mb-2">Pengaturan Kunci:</label>
              
              {algorithm === 'vigenere' && (
                <input type="text" placeholder="Masukkan kata kunci (huruf)" value={keys.vigenere} onChange={(e) => handleKeyChange(e, 'vigenere')} className="w-full p-2 border border-gray-300 rounded" />
              )}
              
              {algorithm === 'affine' && (
                <div className="flex space-x-2">
                  <input type="number" placeholder="Nilai a (coprime 26)" value={keys.affineA} onChange={(e) => handleKeyChange(e, 'affineA')} className="w-1/2 p-2 border border-gray-300 rounded" />
                  <input type="number" placeholder="Nilai b" value={keys.affineB} onChange={(e) => handleKeyChange(e, 'affineB')} className="w-1/2 p-2 border border-gray-300 rounded" />
                </div>
              )}

              {algorithm === 'playfair' && (
                <input type="text" placeholder="Kata kunci Playfair" value={keys.playfair} onChange={(e) => handleKeyChange(e, 'playfair')} className="w-full p-2 border border-gray-300 rounded" />
              )}

              {algorithm === 'hill' && (
                <textarea placeholder="Matriks Kunci (misal: 2x2 angka dipisah spasi/koma)" value={keys.hill} onChange={(e) => handleKeyChange(e, 'hill')} className="w-full p-2 border border-gray-300 rounded h-20" />
              )}

              {algorithm === 'enigma' && (
                <input type="text" placeholder="Pengaturan Rotor (misal: ABC)" value={keys.enigma} onChange={(e) => handleKeyChange(e, 'enigma')} className="w-full p-2 border border-gray-300 rounded" />
              )}
            </div>

            <div className="pt-4 border-t border-gray-300">
               <label className="block text-sm font-semibold mb-2">Mode Input:</label>
               <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" value="text" checked={inputType === 'text'} onChange={() => setInputType('text')} className="form-radio text-indigo-600" />
                    <span>Teks Tulis</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" value="file" checked={inputType === 'file'} onChange={() => setInputType('file')} className="form-radio text-indigo-600" />
                    <span>File Upload</span>
                  </label>
               </div>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Input (Plainteks / Cipherteks):</label>
              {inputType === 'text' ? (
                <textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ketik teks di sini..." 
                  className="w-full p-3 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition">
                  <input type="file" onChange={handleFileUpload} className="mx-auto block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                  <p className="mt-2 text-xs text-gray-400">Dukung TXT, JPG, MP3, MP4, SQL, dll</p>
                </div>
              )}
            </div>

            <div className="flex space-x-4">
              <button onClick={() => handleProcess('Enkripsi')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition shadow-md">
                🔒 Enkripsi
              </button>
              <button onClick={() => handleProcess('Dekripsi')} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition shadow-md">
                🔓 Dekripsi
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Output Hasil:</label>
              <textarea 
                value={outputText}
                readOnly
                placeholder="Hasil akan muncul di sini..." 
                className="w-full p-3 border border-gray-300 rounded-lg h-32 bg-gray-100 outline-none"
              />
              {inputType === 'file' && (
                <button onClick={handleDownload} className="mt-3 w-full bg-gray-800 hover:bg-gray-900 text-white py-2 rounded-lg transition font-semibold">
                ⬇️ Download File Hasil
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default App;