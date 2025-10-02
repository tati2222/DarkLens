// ===============================
// 1. FORMULARIO INICIAL -> MOSTRAR TEST
// ===============================
document.addEventListener("DOMContentLoaded", function () {
  const formulario = document.getElementById("datos-basicos");
  const bienvenida = document.querySelector(".bienvenida");
  const contenido = document.getElementById("contenido");

  formulario.addEventListener("submit", function (e) {
    e.preventDefault();

    // Ocultar bienvenida
    bienvenida.style.display = "none";

    // Mostrar test SD3
    contenido.style.display = "block";

    // Desplazamiento suave
    contenido.scrollIntoView({ behavior: "smooth" });
  });
});

// ===============================
// 2. BOTÓN CONTINUAR HACIA MICROEXPRESIONES
// ===============================
document.getElementById("btn-continuar")?.addEventListener("click", function () {
  document.getElementById("microexpresiones").style.display = "block";
  document.getElementById("microexpresiones").scrollIntoView({ behavior: "smooth" });
});

// ===============================
// 3. FUNCIÓN PARA CALCULAR SD3
// ===============================
let graficoSD3; // Variable global para el gráfico

function calcularYMostrarSD3() {
  const invertidos = [11, 15, 17, 20, 25];
  const respuestas = [];

  for (let i = 1; i <= 27; i++) {
    const sel = document.querySelector(`input[name="item${i}"]:checked`);
    if (!sel) {
      alert(`Falta responder el ítem ${i}.`);
      document.querySelector(`input[name="item${i}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    let val = parseInt(sel.value);
    if (invertidos.includes(i)) val = 6 - val;
    respuestas.push(val);
  }

  const mean = arr => arr.reduce((a,b) => a+b,0)/arr.length;
  const mach = mean(respuestas.slice(0,9)).toFixed(2);
  const narc = mean(respuestas.slice(9,18)).toFixed(2);
  const psych = mean(respuestas.slice(18,27)).toFixed(2);

  // Mostrar resultados
  document.getElementById("resultado-sd3").innerHTML = `
    <h4>Resultados SD3 (promedio 1–5)</h4>
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
        backgroundColor: ["#f94144", "#577590", "#f9c74f"],
        borderColor: "#fff",
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom" } }
    }
  });

  // Narrativa
  document.getElementById("narrativa-sd3").innerHTML = generarNarrativa(mach, narc, psych);

  // Enviar datos a Google Sheets
  enviarAGoogleSheets(mach, narc, psych);

  // Mostrar botón para continuar
  document.getElementById("continuar-container").style.display = "block";
}

// ===============================
// 4. NARRATIVA
// ===============================
function generarNarrativa(mach, narc, psych) {
  const interpretar = (valor, rasgo) => {
    if (valor <= 2.4) return `puntaje bajo en ${rasgo}, indicando baja expresión.`;
    if (valor <= 3.4) return `puntaje medio en ${rasgo}, indicando expresión moderada.`;
    return `puntaje alto en ${rasgo}, lo que sugiere una presencia marcada.`;
  };

  return `
    <h4>Interpretación Académica (Paulhus & Williams, 2002)</h4>
    <p><strong>Maquiavelismo:</strong> ${interpretar(mach, "manipulación estratégica y cálculo interpersonal")}</p>
    <p><strong>Narcisismo:</strong> ${interpretar(narc, "autoimagen grandiosa y búsqueda de admiración")}</p>
    <p><strong>Psicopatía:</strong> ${interpretar(psych, "impulsividad, búsqueda de excitación y baja empatía")}</p>
  `;
}

// ===============================
// 5. ENVÍO A GOOGLE SHEETS
// ===============================
function enviarAGoogleSheets(mach, narc, psych) {
  const datos = {
    secret: "MI_SECRETO_MUY_FUERTE",
    nombre: document.querySelector("input[name='nombre']").value,
    edad: document.querySelector("input[name='edad']").value,
    genero: document.querySelector("select[name='genero']").value,
    pais: document.querySelector("input[name='pais']").value,
    SD3: { maquiavelismo: mach, narcisismo: narc, psicopatia: psych }
  };

  fetch("https://script.google.com/macros/s/AKfycbyKTY-FqYxLAcn3axZDeSVbTQ49FxqolrQhc5iO8dBlT3_9lg_Ii2ynUEjGpWGmjfXo0g/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  })
  .then(res => res.json())
  .then(resp => console.log("Guardado en Google Sheets:", resp))
  .catch(err => console.error("Error guardando:", err));
}

// ===============================
// 6. LISTENER DEL TEST SD3
// ===============================
document.getElementById("form-sd3").addEventListener("submit", function (e) {
  e.preventDefault();
  calcularYMostrarSD3();
});
