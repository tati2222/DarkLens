// ========================================
// VARIABLES GLOBALES
// ========================================
const invertidos = [11, 15, 17, 20, 25];
let graficoSD3;
let resultadosSD3 = null;
let resultadosMicro = null;
let imagenCapturada = null;
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
document.getElementById("form-datos-basicos").addEventListener("submit", function(event) {
  event.preventDefault(); // Evita que se recargue la página

  const consentimiento = document.querySelector('input[name="consentimiento"]').checked;

  if (!consentimiento) {
    alert("Debés aceptar el consentimiento para continuar.");
    return;
  }

  // Ocultar bienvenida y mostrar test
  document.getElementById("seccion-bienvenida").classList.add("hidden");
  document.getElementById("seccion-test").classList.remove("hidden");
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

  resultadosSD3 = { mach, narc, psych, respuestas: respuestasObj };

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
const ctx = canvas.getContext('2d');

document.getElementById('btn-activar-camara').addEventListener('click', async function() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    video.classList.remove('hidden');
    this.classList.add('hidden');
    document.getElementById('btn-tomar-foto').classList.remove('hidden');
  } catch(err) {
    alert('No se pudo acceder a la cámara. Por favor subí una imagen.');
    console.error(err);
  }
});

document.getElementById('btn-tomar-foto').addEventListener('click', function() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);
  
  // Guardar imagen en Base64
  imagenCapturada = canvas.toDataURL('image/jpeg', 0.8);
  
  video.classList.add('hidden');
  canvas.classList.remove('hidden');
  document.getElementById('btn-analizar').classList.remove('hidden');
  
  // Detener cámara
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
});

// Botón para abrir selector de archivos
document.getElementById('btn-subir-imagen').addEventListener('click', function() {
  document.getElementById('input-imagen').click();
});

// Subir imagen
document.getElementById('input-imagen').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      const img = new Image();
      img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Guardar imagen en Base64
        imagenCapturada = canvas.toDataURL('image/jpeg', 0.8);
        
        video.classList.add('hidden');
        canvas.classList.remove('hidden');
        document.getElementById('btn-analizar').classList.remove('hidden');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// ========================================
// ANÁLISIS DE MICROEXPRESIONES
// ========================================


// 🔹 Evento del botón
document.getElementById('btn-analizar').addEventListener('click', function() {
  analizarMicroexpresiones();
});
// Variables para microexpresiones
let modeloMicroexpresiones = null;
const resultadoDiv = document.getElementById('resultado-micro');

// Evento del botón
document.getElementById('btn-analizar').addEventListener('click', function() {
  analizarMicroexpresiones();
});
// 🔹 Función principal
async function analizarMicroexpresiones() {
  resultadoDiv.innerHTML = '<div class="analisis-loading">Cargando modelo de IA...</div>';
  resultadoDiv.classList.remove('hidden');

  try {
    // 🔹 Cargar el modelo solo si no está en memoria
    if (!modeloMicroexpresiones) {
      modeloMicroexpresiones = await tf.loadLayersModel('https://tati2222.github.io/DarkLens/model/model.json');
      console.log('✅ Modelo cargado correctamente');
    }

    resultadoDiv.innerHTML = '<div class="analisis-loading">Analizando microexpresiones...</div>';

    // 🔹 Preprocesar imagen del canvas
    let tensor = tf.browser.fromPixels(canvas)
      .resizeNearestNeighbor([224, 224])
      .toFloat()
      .div(255.0)
      .expandDims();

    // 🔹 Predecir
    const prediccion = await modeloMicroexpresiones.predict(tensor).data();

    // 🔹 Mapear a emociones
    const emociones = {
      enojado: prediccion[0],
      desprecio: prediccion[1],
      disgusto: prediccion[2],
      miedo: prediccion[3],
      feliz: prediccion[4],
      otro: prediccion[5],
      triste: prediccion[6],
      sorprendido: prediccion[7]
    };

    tensor.dispose();

    resultadosMicro = emociones;
    mostrarResultadosMicro(emociones);
} catch (error) {
    console.error('❌ Error al analizar:', error);
    resultadoDiv.innerHTML = `
      <div class="resultado-box" style="border-color: #ff6384;">
        <h4>Error en el análisis</h4>
        <p>No se pudo cargar el modelo. Por favor intentá de nuevo.</p>
        <p style="font-size: 0.9em; color: #ff6384;">${error.message}</p>
      </div>
    `;
  }
}

// 🔹 Visualización de resultados
function mostrarResultadosMicro(emociones) {
  const sorted = Object.entries(emociones).sort((a, b) => b[1] - a[1]);
  const emocionDominante = sorted[0];

  let html = `
    <div class="resultado-box">
      <h4>Análisis de Microexpresiones</h4>
      <p style="font-size: 1.2em; margin-bottom: 20px;">
        <strong>Emoción dominante:</strong> ${emocionDominante[0].charAt(0).toUpperCase() + emocionDominante[0].slice(1)} 
        (${(emocionDominante[1] * 100).toFixed(1)}%)
      </p>
      <div style="margin-top: 20px;">
        <h4 style="margin-bottom: 15px;">Distribución emocional:</h4>
  `;

  sorted.forEach(([emocion, valor]) => {
    const porcentaje = (valor * 100).toFixed(1);
    html += `
      <div class="emocion-bar">
        <div class="emocion-bar-fill" style="width: ${porcentaje}%"></div>
        <div class="emocion-bar-content">
          <span><strong>${emocion.charAt(0).toUpperCase() + emocion.slice(1)}:</strong></span>
          <span>${porcentaje}%</span>
        </div>
      </div>
    `;
  });

  html += `
      </div>
      <p style="margin-top: 25px; font-style: italic; color: #b0a0ff;">
        Este análisis identifica patrones emocionales sutiles en tu expresión facial mediante técnicas de visión por computadora.
      </p>
    </div>
  `;

  resultadoDiv.innerHTML = html;
}

// ========================================
// ENVIAR TODOS LOS DATOS A GOOGLE SHEETS
// ========================================
function enviarDatosCompletos() {
  const datos = {
    // Datos personales
    nombre: document.querySelector('input[name="nombre"]').value,
    edad: document.querySelector('input[name="edad"]').value,
    genero: document.querySelector('select[name="genero"]').value,
    pais: document.querySelector('input[name="pais"]').value,
    
    // Resultados SD3
    maquiavelismo: resultadosSD3.mach,
    narcisismo: resultadosSD3.narc,
    psicopatia: resultadosSD3.psych,
    respuestas_sd3: resultadosSD3.respuestas,
    
    // Imagen facial (Base64)
    imagen_base64: imagenCapturada,
    
    // Resultados de microexpresiones
    emociones: resultadosMicro,
    
    // Timestamp
    fecha: new Date().toISOString()
  };

 fetch("https://script.google.com/macros/s/AKfycbysYvlE0XqfeTktWzreEPf5Frs0pbCdy-F_0ERp4X31WbtrO4EauKUImopHGiSwdrvnbg/exec", {
  method: "POST",
  mode: "no-cors",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(datos)
})
.then(() => {
  console.log("✅ Todos los datos enviados a Google Sheets");
  alert("✅ Datos enviados correctamente. Gracias por participar.");
})
.catch(err => {
  console.error("❌ Error al enviar:", err);
  alert("⚠️ Ocurrió un error al enviar los datos. Por favor, intentá de nuevo.");
});

}


// ========================================
// RESULTADO FINAL INTEGRADO
// ========================================
function mostrarResultadoFinal() {
  if (!resultadosSD3 || !resultadosMicro) {
    alert('Faltan completar algunos pasos del análisis');
    return;
  }

  document.getElementById('seccion-micro').classList.add('hidden');
  document.getElementById('seccion-final').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  const { mach, narc, psych } = resultadosSD3;
  const emocionesSorted = Object.entries(resultadosMicro).sort((a, b) => b[1] - a[1]);
  const emocionPrincipal = emocionesSorted[0][0];
  const emocionSecundaria = emocionesSorted[1][0];

  let html = `
    <div class="perfil-combinado">
      <div class="resultado-box">
        <h4>Perfil Psicométrico SD3</h4>
        <p><strong>Maquiavelismo:</strong> ${mach}</p>
        <p><strong>Narcisismo:</strong> ${narc}</p>
        <p><strong>Psicopatía:</strong> ${psych}</p>
      </div>
      
      <div class="resultado-box">
        <h4>Perfil Emocional</h4>
        <p><strong>Emoción dominante:</strong> ${emocionPrincipal}</p>
        <p><strong>Emoción secundaria:</strong> ${emocionSecundaria}</p>
        <p><strong>Intensidad:</strong> ${(emocionesSorted[0][1] * 100).toFixed(1)}%</p>
      </div>
    </div>

    <div class="resultado-box" style="margin-top: 30px;">
      <h4>Interpretación Integrada</h4>
      ${generarInterpretacionIntegrada(mach, narc, psych, emocionPrincipal, emocionesSorted[0][1])}
    </div>

    <div class="resultado-box" style="margin-top: 30px; background: rgba(127, 0, 255, 0.1);">
      <h4>Nota Importante</h4>
      <p style="color: #d0d0ff;">
        Este análisis combina datos psicométricos autorreportados con análisis computacional de expresiones faciales. 
        Los resultados son de carácter exploratorio y forman parte de una investigación académica. 
        <strong>No constituyen un diagnóstico clínico</strong> y no deben utilizarse para tomar decisiones importantes sobre salud mental.
        Para una evaluación profesional, consultá con un psicólogo o psiquiatra.
      </p>
    </div>

    <div style="text-align: center; margin-top: 40px;">
      <p style="color: #c080ff; font-size: 1.2em;">Gracias por participar en DARKLENS</p>
      <p style="color: #b0a0ff; margin-top: 10px;">
        Proyecto de investigación - Licenciatura en Ciencia de Datos<br>
        Universidad del Gran Rosario (UGR)
      </p>
    </div>
  `;

  document.getElementById('contenido-final').innerHTML = html;
}

function generarInterpretacionIntegrada(mach, narc, psych, emocion, intensidad) {
  let texto = '<p>';

  const rasgoDominante = Math.max(mach, narc, psych);
  let rasgoNombre = '';
  if (rasgoDominante === mach) rasgoNombre = 'maquiavelismo';
  else if (rasgoDominante === narc) rasgoNombre = 'narcisismo';
  else rasgoNombre = 'psicopatía';

  texto += `Tu perfil muestra una mayor presencia de <strong>${rasgoNombre}</strong> (${rasgoDominante.toFixed(2)}), `;

  const relacionesEmocionales = {
    maquiavelismo: {
      neutral: 'lo cual se correlaciona con tu expresión facial neutral, sugiriendo un control emocional característico de personas con alta planificación estratégica.',
      feliz: 'aunque tu expresión facial muestra felicidad, lo que podría indicar una presentación social cuidadosamente gestionada.',
      triste: 'interesante contraste con tu expresión facial de tristeza, lo que podría reflejar una disonancia entre estrategia y estado emocional.',
      enojado: 'y tu expresión de enojo podría reflejar frustración cuando las estrategias interpersonales no funcionan como se esperaba.',
      sorprendido: 'aunque tu expresión de sorpresa podría indicar reacciones auténticas ante situaciones inesperadas.',
      miedo: 'en contraste con tu expresión de miedo, sugiriendo posible vulnerabilidad bajo la superficie calculada.',
      disgusto: 'coherente con tu expresión de disgusto, posiblemente hacia situaciones que no podés controlar.'
    },
    narcisismo: {
      neutral: 'aunque tu expresión neutral contrasta con la búsqueda típica de atención y admiración.',
      feliz: 'consistente con tu expresión facial de felicidad, común en personas que disfrutan del reconocimiento social.',
      triste: 'en contraste con tu expresión de tristeza, lo que podría indicar una discrepancia entre autoestima y estado emocional actual.',
      enojado: 'y tu expresión de enojo podría surgir cuando sentís que no recibís el reconocimiento que creés merecer.',
      sorprendido: 'junto con tu expresión de sorpresa, sugiriendo reactividad ante feedback externo sobre tu persona.',
      miedo: 'en contraste notable con tu expresión de miedo, posiblemente relacionado con amenazas a tu autoimagen.',
      disgusto: 'y tu expresión de disgusto podría relacionarse con situaciones que percibís como degradantes para tu imagen.'
    },
    psicopatía: {
      neutral: 'coherente con tu expresión facial neutral, característica de baja reactividad emocional.',
      feliz: 'aunque tu expresión de felicidad podría reflejar búsqueda de estimulación y experiencias intensas.',
      triste: 'en contraste con tu expresión de tristeza, lo que es inusual y podría indicar un momento de vulnerabilidad poco frecuente.',
      enojado: 'consistente con tu expresión de enojo, común ante frustraciones o barreras para conseguir objetivos.',
      sorprendido: 'junto con tu expresión de sorpresa, sugiriendo reactividad ante estímulos novedosos o intensos.',
      miedo: 'en contraste notable con tu expresión de miedo, emoción generalmente menos frecuente en este perfil.',
      disgusto: 'y tu expresión de disgusto ante situaciones o personas que interferían con tus objetivos.'
    }
  };

  texto += relacionesEmocionales[rasgoNombre][emocion] || 'que se relaciona de forma compleja con tu expresión facial actual.';
  texto += '</p><p>';

  const intensidadAlta = intensidad > 0.4;
  if (intensidadAlta) {
    texto += `La intensidad alta de tu emoción facial (${(intensidad * 100).toFixed(1)}%) sugiere una expresión emocional marcada en este momento, `;
  } else {
    texto += `La intensidad moderada de tu emoción facial (${(intensidad * 100).toFixed(1)}%) sugiere sutileza en tu expresión emocional, `;
  }

  texto += 'lo cual es un dato complementario valioso junto con tu perfil psicométrico autorreportado.';
  texto += '</p>';

  return texto;
}

// ========================================
// INICIALIZACIÓN
// ========================================
generarItemsTest();
