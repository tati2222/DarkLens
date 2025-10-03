// ========================================
// VARIABLES GLOBALES
// ========================================
const invertidos = [11, 15, 17, 20, 25];
let graficoSD3;
let resultadosSD3 = null;
let resultadosMicro = null;
let stream = null;

// Items del test SD3
const itemsSD3 = [
  "No es prudente contar tus secretos.",
  "Me gusta usar manipulaciones ingeniosas para salirme con la mía.",
  "Hagas lo que hagas, debes conseguir que las personas importantes estén de tu lado.",
  "Evito el conflicto directo con los demás porque pueden serme útiles en el futuro.",
  "Es sabio guardar información que puedas usar en contra de otras personas más adelante.",
  "Debes esperar el momento oportuno para vengarte de las personas.",
  "Hay cosas que deberías ocultar a los demás porque no necesitan saberlas.",
  "Asegúrate de que tus planes te beneficien a ti, no a los demás.",
  "La mayoría de las personas puede ser manipulada.",
  "La gente me ve como un líder nato.",
  "(R) Odio ser el centro de atención.",
  "Muchas actividades grupales tienden a ser aburridas sin mí.",
  "Sé que soy especial porque todos me lo dicen continuamente.",
  "Me gusta relacionarme con personas importantes.",
  "(R) Me siento avergonzado/a si alguien me hace un cumplido.",
  "Me han comparado con gente famosa.",
  "(R) Soy una persona promedio.",
  "Insisto en recibir el respeto que merezco.",
  "Me gusta vengarme de las autoridades.",
  "(R) Evito situaciones peligrosas.",
  "La venganza debe ser rápida y desagradable.",
  "La gente suele decir que estoy fuera de control.",
  "Es cierto que puedo ser cruel con los demás.",
  "Las personas que se meten conmigo siempre se arrepienten.",
  "(R) Nunca me he metido en problemas con la ley.",
  "Disfruto tener relaciones sexuales con personas que apenas conozco.",
  "Diré cualquier cosa para conseguir lo que quiero."
];

// ========================================
// GENERAR ITEMS DEL TEST
// ========================================
function generarItemsTest() {
  const form = document.getElementById('form-sd3');
  itemsSD3.forEach((texto, index) => {
    const num = index + 1;
    const div = document.createElement('div');
    div.className = 'test-item';
    div.innerHTML = `
      <p><strong>${num}.</strong> ${texto}</p>
      <div class="opciones">
        ${[1, 2, 3, 4, 5].map(val => `
          <input type="radio" id="item${num}_${val}" name="item${num}" value="${val}" required>
          <label for="item${num}_${val}">${val}</label>
        `).join('')}
      </div>
    `;
    form.appendChild(div);
  });

  const btnSubmit = document.createElement('button');
  btnSubmit.type = 'submit';
  btnSubmit.textContent = 'Enviar respuestas del test';
  form.appendChild(btnSubmit);
}

// ========================================
// FORMULARIO DE DATOS BÁSICOS
// ========================================
document.getElementById('form-datos-basicos').addEventListener('submit', function(e) {
  e.preventDefault();
  document.getElementById('seccion-bienvenida').classList.add('hidden');
  document.getElementById('seccion-test').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ========================================
// FORMULARIO SD3
// ========================================
document.getElementById('form-sd3').addEventListener('submit', function(e) {
  e.preventDefault();
  calcularSD3();
});

function calcularSD3() {
  const respuestas = [];
  const respuestasObj = {};

  for (let i = 1; i <= 27; i++) {
    const input = document.querySelector(`input[name="item${i}"]:checked`);
    if (!input) {
      alert(`Por favor respondé el ítem ${i}`);
      document.querySelector(`input[name="item${i}"]`).scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    let val = parseInt(input.value);
    if (invertidos.includes(i)) val = 6 - val;
    respuestas.push(val);
    respuestasObj[`item${i}`] = val;
  }

  const mean = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
  const mach = parseFloat(mean(respuestas.slice(0, 9)).toFixed(2));
  const narc = parseFloat(mean(respuestas.slice(9, 18)).toFixed(2));
  const psych = parseFloat(mean(respuestas.slice(18, 27)).toFixed(2));

  resultadosSD3 = { mach, narc, psych };

  // Mostrar resultados
  document.getElementById('resultado-sd3').innerHTML = `
    <div class="resultado-box">
      <h4>Tus resultados SD3</h4>
      <p><strong>Maquiavelismo:</strong> ${mach} / 5.0</p>
      <p><strong>Narcisismo:</strong> ${narc} / 5.0</p>
      <p><strong>Psicopatía:</strong> ${psych} / 5.0</p>
    </div>
  `;
  document.getElementById('resultado-sd3').classList.remove('hidden');
  document.getElementById('grafico-container').classList.remove('hidden');

  // Gráfico
  const ctx = document.getElementById('grafico-sd3').getContext('2d');
  if (graficoSD3) graficoSD3.destroy();
  graficoSD3 = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Maquiavelismo', 'Narcisismo', 'Psicopatía'],
      datasets: [{
        data: [mach, narc, psych],
        backgroundColor: ['#ff6384', '#36a2eb', '#ffce56'],
        borderColor: '#1a1a2e',
        borderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#e0e0ff',
            font: { size: 14 },
            padding: 15
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.label + ': ' + context.parsed.toFixed(2);
            }
          }
        }
      }
    }
  });

  // Narrativa
  document.getElementById('narrativa-sd3').innerHTML = generarNarrativa(mach, narc, psych);
  document.getElementById('narrativa-sd3').classList.remove('hidden');
  document.getElementById('btn-continuar-micro').classList.remove('hidden');

  // Enviar a Google Sheets
  enviarAGoogleSheets(mach, narc, psych, respuestasObj);
}

function generarNarrativa(mach, narc, psych) {
  const interpretar = (valor, rasgo) => {
    if (valor <= 2.4) return `puntaje bajo en ${rasgo}`;
    if (valor <= 3.4) return `puntaje medio en ${rasgo}`;
    return `puntaje alto en ${rasgo}`;
  };

  return `
    <div class="resultado-box">
      <h4>Interpretación Académica</h4>
      <p><strong>Maquiavelismo:</strong> Tu resultado muestra un ${interpretar(mach, "manipulación estratégica y cálculo interpersonal")}. Esto refleja tu tendencia a la planificación a largo plazo en las relaciones sociales.</p>
      <p><strong>Narcisismo:</strong> Tu resultado muestra un ${interpretar(narc, "autoimagen grandiosa y búsqueda de admiración")}. Esto indica tu nivel de confianza en ti mismo y necesidad de reconocimiento social.</p>
      <p><strong>Psicopatía:</strong> Tu resultado muestra un ${interpretar(psych, "impulsividad y búsqueda de sensaciones")}. Esto refleja tu tendencia a la espontaneidad y toma de riesgos.</p>
      <p style="margin-top: 20px; font-style: italic; color: #b0a0ff;">Recordá que estos resultados son parte de una investigación académica y no constituyen un diagnóstico clínico. Los rasgos medidos existen en un continuo y todas las personas los presentan en algún grado.</p>
    </div>
  `;
}

function enviarAGoogleSheets(mach, narc, psych, respuestasObj) {
  const datos = {
    nombre: document.querySelector('input[name="nombre"]').value,
    edad: document.querySelector('input[name="edad"]').value,
    genero: document.querySelector('select[name="genero"]').value,
    pais: document.querySelector('input[name="pais"]').value,
    maquiavelismo: mach,
    narcisismo: narc,
    psicopatia: psych,
    respuestas: respuestasObj
  };

  fetch("https://script.google.com/macros/s/AKfycbxcxRafQhoOygdR4UhZ1L1rDnnR8nduzHJNVmslYXGKXAAV9igH_V1Ofit3T7G3q05JCw/exec", {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  })
  .then(() => console.log("Datos enviados a Google Sheets"))
  .catch(err => console.error("Error al enviar:", err));
}

// ========================================
// CONTINUAR A MICROEXPRESIONES
// ========================================
document.getElementById('btn-continuar-micro').addEventListener('click', function() {
  document.getElementById('seccion-test').classList.add('hidden');
  document.getElementById('seccion-micro').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ========================================
// CÁMARA Y CAPTURA
// ========================================
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
