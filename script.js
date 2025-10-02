// ===============================
// 1. FORMULARIO INICIAL -> MOSTRAR TEST
// ===============================
document.addEventListener("DOMContentLoaded", function () {
  const formulario = document.getElementById("datos-basicos");

  formulario.addEventListener("submit", function (e) {
    e.preventDefault();

    // Ocultar bienvenida
    document.querySelector(".bienvenida").style.display = "none";

    // Mostrar test SD3
    document.getElementById("contenido").style.display = "block";

    // Mostrar botón continuar a microexpresiones
    document.getElementById("continuar-container").style.display = "block";

    // Scroll suave al test
    document.getElementById("contenido").scrollIntoView({ behavior: "smooth" });
  });
});

// ===============================
// 2. FUNCIÓN PARA CALCULAR SD3
// ===============================
let graficoSD3;

function calcularYMostrarSD3() {
  let mach = 0, narc = 0, psych = 0;

  for (let i = 1; i <= 27; i++) {
    const val = document.querySelector(`input[name="item${i}"]:checked`);
    if (val) {
      const numVal = parseInt(val.value);
      if ([1, 4, 7, 10, 13, 16, 19, 22, 25].includes(i)) mach += numVal;
      if ([2, 5, 8, 11, 14, 17, 20, 23, 26].includes(i)) narc += numVal;
      if ([3, 6, 9, 12, 15, 18, 21, 24, 27].includes(i)) psych += numVal;
    } else {
      alert(`Por favor respondé el ítem ${i}.`);
      return;
    }
  }

  mach = (mach / 9).toFixed(2);
  narc = (narc / 9).toFixed(2);
  psych = (psych / 9).toFixed(2);

  document.getElementById("resultado-sd3").innerHTML = `
    <p><strong>Maquiavelismo:</strong> ${mach}</p>
    <p><strong>Narcisismo:</strong> ${narc}</p>
    <p><strong>Psicopatía:</strong> ${psych}</p>
  `;

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

  document.getElementById("narrativa-sd3").innerHTML =
    generarNarrativa(mach, narc, psych);

  enviarAGoogleSheets(mach, narc, psych);

  document.getElementById("continuar-container").style.display = "block";
}

// ===============================
// 3. NARRATIVA
// ===============================
function generarNarrativa(mach, narc, psych) {
  return `
    <h3>Interpretación Académica</h3>
    <p>Según el test SD3 (Short Dark Triad; Jones & Paulhus, 2014), 
    el perfil muestra los siguientes puntajes:</p>
    <ul>
      <li>Maquiavelismo: ${mach}</li>
      <li>Narcisismo: ${narc}</li>
      <li>Psicopatía: ${psych}</li>
    </ul>
    <p>Estos valores deben interpretarse con cautela, ya que el SD3 
    es un instrumento de investigación y no un diagnóstico clínico.</p>
  `;
}

// ===============================
// 4. ENVÍO A GOOGLE SHEETS
// ===============================
function enviarAGoogleSheets(mach, narc, psych) {
  const datos = {
    nombre: document.querySelector("input[name='nombre']").value,
    edad: document.querySelector("input[name='edad']").value,
    genero: document.querySelector("select[name='genero']").value,
    pais: document.querySelector("input[name='pais']").value,
    sd3: { maquiavelismo: mach, narcisismo: narc, psicopatia: psych }
  };

  fetch("https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  })
    .then(res => res.json())
    .then(data => console.log("Guardado en Google Sheets:", data))
    .catch(err => console.error("Error al guardar:", err));
}

// ===============================
// 5. LISTENER DEL TEST SD3
// ===============================
document.getElementById("form-sd3").addEventListener("submit", function (e) {
  e.preventDefault();
  calcularYMostrarSD3();
});

// ===============================
// 6. BOTÓN CONTINUAR A MICROEXPRESIONES
// ===============================
document.getElementById("btn-continuar").addEventListener("click", function () {
  document.getElementById("test-sd3").style.display = "none";
  document.getElementById("microexpresiones").style.display = "block";
  document.getElementById("microexpresiones").scrollIntoView({ behavior: "smooth" });
});

// ===============================
// 7. CAPTURA DE FOTO O SUBIDA
// ===============================
const video = document.getElementById("cam-video");
const canvas = document.getElementById("cam-canvas");
const fotoPreview = document.getElementById("foto-preview");

// Abrir cámara
document.getElementById("btn-abrir-camara").addEventListener("click", async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  video.style.display = "block";
  document.getElementById("btn-tomar-foto").style.display = "inline-block";
});

// Tomar foto
document.getElementById("btn-tomar-foto").addEventListener("click", () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0);
  fotoPreview.src = canvas.toDataURL("image/png");
  fotoPreview.style.display = "block";
});

// Subir foto desde archivo
document.getElementById("input-subir-foto").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      fotoPreview.src = event.target.result;
      fotoPreview.style.display = "block";
    };
    reader.readAsDataURL(file);
  }
});
