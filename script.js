// ===============================
// 1 --- BOTÓN DE CONSENTIMIENTO
// ===============================
document.getElementById("btn-continuar-bienvenida").addEventListener("click", function (e) {
  e.preventDefault();
  document.querySelector(".bienvenida").style.display = "none"; // oculta bienvenida
  document.getElementById("contenido").style.display = "block"; // muestra test
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===============================
// 2 --- FORMULARIO TEST SD3
// ===============================
let graficoSD3;
const invertidos = [11, 15, 17, 20, 25]; // Ítems invertidos del SD3

document.getElementById("form-sd3").addEventListener("submit", function (e) {
  e.preventDefault();
  calcularYMostrarSD3();
});

// ===============================
// 3 --- FUNCIÓN PARA CALCULAR SD3
// ===============================
function calcularYMostrarSD3() {
  const respuestas = [];
  const respuestasObj = {};

  for (let i = 1; i <= 27; i++) {
    const val = document.querySelector(`input[name="item${i}"]:checked`);
    if (!val) {
      alert(`Por favor respondé el ítem ${i}.`);
      return;
    }
    let numVal = parseInt(val.value);
    if (invertidos.includes(i)) numVal = 6 - numVal;
    respuestas.push(numVal);
    respuestasObj[`item${i}`] = numVal;
  }

  const mean = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
  const mach = mean(respuestas.slice(0, 9)).toFixed(2);
  const narc = mean(respuestas.slice(9, 18)).toFixed(2);
  const psych = mean(respuestas.slice(18, 27)).toFixed(2);

  // Mostrar resultados
  document.getElementById("resultado-sd3").innerHTML = `
    <h4>Resultados SD3</h4>
    <p><strong>Maquiavelismo:</strong> ${mach}</p>
    <p><strong>Narcisismo:</strong> ${narc}</p>
    <p><strong>Psicopatía:</strong> ${psych}</p>
  `;

  // Gráfico
  const ctx = document.getElementById("grafico-sd3").getContext("2d");
  if (graficoSD3) graficoSD3.destroy();
  graficoSD3 = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Maquiavelismo", "Narcisismo", "Psicopatía"],
      datasets: [{
        data: [mach, narc, psych],
        backgroundColor: ["#ff6384", "#36a2eb", "#ffce56"]
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }
  });

  // Narrativa
  document.getElementById("narrativa-sd3").innerHTML = generarNarrativa(mach, narc, psych);

  // Enviar resultados a Google Sheets
  enviarAGoogleSheets(mach, narc, psych, respuestasObj);

  // Mostrar botón continuar a microexpresiones
  document.getElementById("continuar-micro-container").style.display = "block";
}

// ===============================
// 4 --- GENERAR NARRATIVA
// ===============================
function generarNarrativa(mach, narc, psych) {
  return `
    <h3>Interpretación Académica</h3>
    <ul>
      <li>Maquiavelismo: ${mach}</li>
      <li>Narcisismo: ${narc}</li>
      <li>Psicopatía: ${psych}</li>
    </ul>
    <p>El SD3 es un instrumento de investigación y no un diagnóstico clínico.</p>
  `;
}

// ===============================
// 5 --- ENVÍO DE RESULTADOS A GOOGLE SHEETS
// ===============================
function enviarAGoogleSheets(mach, narc, psych, respuestasObj) {
  const datos = {
    nombre: document.querySelector("input[name='nombre']").value,
    edad: document.querySelector("input[name='edad']").value,
    genero: document.querySelector("select[name='genero']").value,
    pais: document.querySelector("input[name='pais']").value,
    maquiavelismo: mach,
    narcisismo: narc,
    psicopatia: psych,
    respuestas: respuestasObj
  };

  fetch("https://script.google.com/macros/s/AKfycbxcxRafQhoOygdR4UhZ1L1rDnnR8nduzHJNVmslYXGKXAAV9igH_V1Ofit3T7G3q05JCw/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  })
  .then(res => res.json())
  .then(data => console.log("Guardado en Google Sheets:", data))
  .catch(err => console.error("Error al guardar:", err));
}

// ===============================
// 6 --- BOTÓN CONTINUAR A MICROEXPRESIONES
// ===============================
document.getElementById("btn-continuar-micro").addEventListener("click", function () {
  document.getElementById("contenido").style.display = "none";
  document.getElementById("microexpresiones").style.display = "block";
  document.getElementById("microexpresiones").scrollIntoView({ behavior: "smooth" });
});

// ===============================
// 7 --- CAPTURA DE FOTO / SUBIDA
// ===============================
const video = document.getElementById("video");
const canvas = document.getElementById("canvas-microexp");
const inputImagen = document.getElementById("input-imagen");

// Abrir cámara automáticamente
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => { video.srcObject = stream; })
  .catch(err => console.error("No se pudo acceder a la cámara:", err));

// Tomar foto
document.getElementById("btn-tomar-foto").addEventListener("click", () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0);
});

// Subir foto desde archivo
inputImagen.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      const img = new Image();
      img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext("2d").drawImage(img, 0, 0);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
});
