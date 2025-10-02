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

    // Desplazamiento suave
    document.getElementById("contenido").scrollIntoView({ behavior: "smooth" });
  });
});

// ===============================
// 2. FUNCIÓN PARA CALCULAR SD3
// ===============================
let graficoSD3; // Variable global para el gráfico

function calcularYMostrarSD3() {
  let mach = 0, narc = 0, psych = 0;

  // Recorremos las respuestas
  for (let i = 1; i <= 27; i++) {
    const val = document.querySelector(`input[name="item${i}"]:checked`);
    if (val) {
      const numVal = parseInt(val.value);
      if ([1, 4, 7, 10, 13, 16, 19, 22, 25].includes(i)) mach += numVal;
      if ([2, 5, 8, 11, 14, 17, 20, 23, 26].includes(i)) narc += numVal;
      if ([3, 6, 9, 12, 15, 18, 21, 24, 27].includes(i)) psych += numVal;
    }
  }

  mach = (mach / 9).toFixed(2);
  narc = (narc / 9).toFixed(2);
  psych = (psych / 9).toFixed(2);

  // Mostrar resultados
  document.getElementById("resultado-sd3").innerHTML = `
    <p><strong>Maquiavelismo:</strong> ${mach}</p>
    <p><strong>Narcisismo:</strong> ${narc}</p>
    <p><strong>Psicopatía:</strong> ${psych}</p>
  `;

  // Gráfico de torta
  const ctx = document.getElementById("grafico-sd3").getContext("2d");

  // Si ya existe un gráfico, destruirlo para no duplicar
  if (graficoSD3) {
    graficoSD3.destroy();
  }

  graficoSD3 = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Maquiavelismo", "Narcisismo", "Psicopatía"],
      datasets: [{
        data: [mach, narc, psych],
        backgroundColor: ["#ff6384", "#36a2eb", "#ffce56"]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });

  // Mostrar narrativa
  document.getElementById("narrativa-sd3").innerHTML =
    generarNarrativa(mach, narc, psych);

  // Enviar datos a Google Sheets
  enviarAGoogleSheets(mach, narc, psych);

  // Mostrar botón de microexpresiones
  document.getElementById("btn-continuar-micro").style.display = "block";
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
    sd3: {
      maquiavelismo: mach,
      narcisismo: narc,
      psicopatia: psych
    }
  };

  fetch("https://script.google.com/macros/s/AKfycbyKTY-FqYxLAcn3axZDeSVbTQ49FxqolrQhc5iO8dBlT3_9lg_Ii2ynUEjGpWGmjfXo0g/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  })
    .then(res => res.json())
    .then(data => console.log("Guardado en Google Sheets:", data))
    .catch(err => console.error("Error al guardar:", err));
}

// ===============================
// 5. LISTENER DEL TEST
// ===============================
document.getElementById("form-sd3").addEventListener("submit", function (e) {
  e.preventDefault();
  calcularYMostrarSD3();
});

// ===============================
// 6. MICROEXPRESIONES
// ===============================

// Botón para mostrar microexpresiones
const btnContinuarMicro = document.createElement("button");
btnContinuarMicro.textContent = "Continuar al análisis de microexpresiones";
btnContinuarMicro.id = "btn-continuar-micro";
btnContinuarMicro.style.display = "none";
btnContinuarMicro.style.marginTop = "20px";
document.getElementById("contenido").appendChild(btnContinuarMicro);

// Mostrar sección de microexpresiones al hacer clic
btnContinuarMicro.addEventListener("click", function() {
  const microSec = document.getElementById("microexpresiones");
  microSec.style.display = "block";
  microSec.scrollIntoView({ behavior: "smooth" });
});

// Listener para subir imagen y mostrar en canvas
const inputImagen = document.getElementById("input-imagen");
const canvasMicro = document.getElementById("canvas-microexp");
const ctxMicro = canvasMicro.getContext("2d");

inputImagen.addEventListener("change", function(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    const img = new Image();
    img.onload = function() {
      // Ajustar tamaño canvas al tamaño de la imagen
      canvasMicro.width = img.width;
      canvasMicro.height = img.height;
      ctxMicro.drawImage(img, 0, 0, img.width, img.height);

      // Aquí se puede llamar a tu modelo para detectar microexpresiones
      document.getElementById("resultado-microexpresiones").innerHTML =
        "<p>Imagen cargada. Aquí se procesarían las microexpresiones.</p>";
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});
