// ========================================
// VARIABLES GLOBALES
// ========================================
const invertidos = [11, 15, 17, 20, 25];
let graficoSD3;
let graficoEmociones;
let resultadosSD3 = null;
let resultadosMicro = null;
let imagenCapturada = null;
let stream = null;
let modeloMicroexpresiones = null;
let audioNarrativa = null;

// ========================================
// VARIABLES PARA TRACKING DE TIEMPOS
// ========================================
let tiemposRespuesta = {}; // Almacena tiempo de respuesta por ítem
let tiempoInicioItem = {}; // Timestamp cuando se muestra cada ítem
let itemActualVisible = null; // Ítem que está visible actualmente
let testInicioTimestamp = null; // Momento en que se carga el test completo

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
  form.innerHTML = '';
  
  // Registrar inicio del test
  testInicioTimestamp = Date.now();
  tiemposRespuesta = {};
  tiempoInicioItem = {};
  
  itemsSD3.forEach((texto, index) => {
    const num = index + 1;
    const div = document.createElement('div');
    div.className = 'test-item';
    div.setAttribute('data-item', num);
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
    
    // Inicializar tiempo de inicio para este ítem (será actualizado cuando sea visible)
    tiempoInicioItem[num] = null;
  });

  const btnSubmit = document.createElement('button');
  btnSubmit.type = 'submit';
  btnSubmit.textContent = 'Enviar respuestas del test';
  btnSubmit.className = 'btn-primary';
  form.appendChild(btnSubmit);
  
  // Configurar tracking de tiempo para cada ítem
  configurarTrackingTiempos();
}

// ========================================
// TRACKING DE TIEMPOS DE RESPUESTA
// ========================================
function configurarTrackingTiempos() {
  // Observer para detectar cuando un ítem entra en viewport
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const itemDiv = entry.target;
        const itemNum = parseInt(itemDiv.getAttribute('data-item'));
        
        // Solo iniciar contador si no tiene respuesta aún
        const input = document.querySelector(`input[name="item${itemNum}"]:checked`);
        if (!input && !tiempoInicioItem[itemNum]) {
          tiempoInicioItem[itemNum] = Date.now();
          console.log(`⏱️ Ítem ${itemNum} visible - iniciando contador`);
        }
      }
    });
  }, {
    threshold: 0.5 // 50% del ítem visible
  });

  // Observar todos los ítems
  document.querySelectorAll('.test-item').forEach(item => {
    observer.observe(item);
  });

  // Listener para cada opción de respuesta
  for (let i = 1; i <= 27; i++) {
    const radios = document.querySelectorAll(`input[name="item${i}"]`);
    radios.forEach(radio => {
      radio.addEventListener('change', function() {
        registrarTiempoRespuesta(i);
      });
    });
  }
}

function registrarTiempoRespuesta(itemNum) {
  // Si ya hay un tiempo registrado, no sobrescribir
  if (tiemposRespuesta[itemNum]) {
    return;
  }

  const tiempoInicio = tiempoInicioItem[itemNum];
  
  if (tiempoInicio) {
    const tiempoFin = Date.now();
    const tiempoRespuesta = tiempoFin - tiempoInicio;
    
    tiemposRespuesta[itemNum] = {
      tiempo_ms: tiempoRespuesta,
      tiempo_segundos: (tiempoRespuesta / 1000).toFixed(2),
      timestamp_inicio: tiempoInicio,
      timestamp_respuesta: tiempoFin
    };
    
    console.log(`✅ Ítem ${itemNum} respondido en ${(tiempoRespuesta / 1000).toFixed(2)}s`);
  } else {
    // Si no hay tiempo de inicio, usar el inicio del test como referencia
    const tiempoDesdeInicio = Date.now() - testInicioTimestamp;
    tiemposRespuesta[itemNum] = {
      tiempo_ms: tiempoDesdeInicio,
      tiempo_segundos: (tiempoDesdeInicio / 1000).toFixed(2),
      timestamp_inicio: testInicioTimestamp,
      timestamp_respuesta: Date.now(),
      nota: 'Respondido antes de visualización completa'
    };
    
    console.log(`⚠️ Ítem ${itemNum} respondido antes de tracking completo`);
  }
}

// ========================================
// FORMULARIO DE DATOS BÁSICOS 
// ========================================
document.addEventListener("DOMContentLoaded", () => {
  const formDatos = document.getElementById("form-datos-basicos");
  const seccionBienvenida = document.getElementById("seccion-bienvenida");
  const seccionTest = document.getElementById("seccion-test");

  if (!formDatos) {
    console.error("❌ No se encontró el formulario de datos básicos.");
    return;
  }

  formDatos.addEventListener("submit", (event) => {
    event.preventDefault();

    const consentimiento = formDatos.querySelector('input[name="consentimiento"]');
    if (!consentimiento || !consentimiento.checked) {
      alert("Debés aceptar el consentimiento para continuar.");
      return;
    }

    const nombre = formDatos.querySelector('input[name="nombre"]');
    const edad = formDatos.querySelector('input[name="edad"]');
    const genero = formDatos.querySelector('select[name="genero"]');
    const pais = formDatos.querySelector('input[name="pais"]');

    if (!nombre || !nombre.value.trim()) {
      alert("Por favor ingresá tu nombre.");
      nombre.focus();
      return;
    }

    if (!edad || !edad.value) {
      alert("Por favor ingresá tu edad.");
      edad.focus();
      return;
    }

    if (!genero || !genero.value) {
      alert("Por favor seleccioná tu género.");
      genero.focus();
      return;
    }

    if (!pais || !pais.value.trim()) {
      alert("Por favor ingresá tu país.");
      pais.focus();
      return;
    }

    generarItemsTest();

    if (seccionBienvenida) seccionBienvenida.classList.add("hidden");
    if (seccionTest) seccionTest.classList.remove("hidden");

    window.scrollTo({ top: 0, behavior: "smooth" });
    console.log("✅ Se cambió correctamente de bienvenida a test");
  });

  const formSD3 = document.getElementById('form-sd3');
  if (formSD3) {
    formSD3.addEventListener('submit', function(e) {
      e.preventDefault();
      calcularSD3();
    });
  }
});

// ========================================
// CÁLCULO SD3
// ========================================
function calcularSD3() {
  const respuestas = [];
  const respuestasObj = {};

  for (let i = 1; i <= 27; i++) {
    const input = document.querySelector(`input[name="item${i}"]:checked`);
    if (!input) {
      alert(`Por favor respondé el ítem ${i}`);
      const firstRadio = document.querySelector(`input[name="item${i}"]`);
      if (firstRadio) {
        firstRadio.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
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

  // Calcular tiempo total del test
  const testFinTimestamp = Date.now();
  const tiempoTotalTest = testFinTimestamp - testInicioTimestamp;
  
  // Calcular estadísticas de tiempo
  const tiemposArray = Object.values(tiemposRespuesta).map(t => t.tiempo_ms);
  const estadisticasTiempo = calcularEstadisticasTiempo(tiemposArray);

  resultadosSD3 = { 
    mach, 
    narc, 
    psych, 
    respuestas: respuestasObj,
    tiempos_respuesta: tiemposRespuesta,
    tiempo_total_ms: tiempoTotalTest,
    tiempo_total_segundos: (tiempoTotalTest / 1000).toFixed(2),
    estadisticas_tiempo: estadisticasTiempo
  };

  console.log('📊 Estadísticas de tiempo:', estadisticasTiempo);

  const resultadoSD3 = document.getElementById('resultado-sd3');
  if (resultadoSD3) {
    resultadoSD3.innerHTML = `
      <div class="resultado-box">
        <h4>Tus resultados SD3</h4>
        <p><strong>Maquiavelismo:</strong> ${mach} / 5.0</p>
        <p><strong>Narcisismo:</strong> ${narc} / 5.0</p>
        <p><strong>Psicopatía:</strong> ${psych} / 5.0</p>
        <p style="margin-top: 15px; font-size: 0.9em; color: #b0a0ff;">
          <strong>Tiempo total:</strong> ${(tiempoTotalTest / 1000 / 60).toFixed(1)} minutos<br>
          <strong>Tiempo promedio por ítem:</strong> ${estadisticasTiempo.promedio_segundos}s
        </p>
      </div>
    `;
    resultadoSD3.classList.remove('hidden');
  }

  const graficoContainer = document.getElementById('grafico-container');
  if (graficoContainer) {
    graficoContainer.classList.remove('hidden');
    crearGraficoSD3(mach, narc, psych);
  }

  const narrativaSD3 = document.getElementById('narrativa-sd3');
  if (narrativaSD3) {
    narrativaSD3.innerHTML = generarNarrativa(mach, narc, psych);
    narrativaSD3.classList.remove('hidden');
  }

  const btnContinuar = document.getElementById('btn-continuar-micro');
  if (btnContinuar) {
    btnContinuar.classList.remove('hidden');
  }
}

// ========================================
// CALCULAR ESTADÍSTICAS DE TIEMPO
// ========================================
function calcularEstadisticasTiempo(tiemposArray) {
  if (tiemposArray.length === 0) {
    return {
      promedio_ms: 0,
      promedio_segundos: '0.00',
      mediana_ms: 0,
      mediana_segundos: '0.00',
      minimo_ms: 0,
      minimo_segundos: '0.00',
      maximo_ms: 0,
      maximo_segundos: '0.00',
      desviacion_estandar_ms: 0,
      desviacion_estandar_segundos: '0.00'
    };
  }

  const suma = tiemposArray.reduce((a, b) => a + b, 0);
  const promedio = suma / tiemposArray.length;
  
  const sorted = [...tiemposArray].sort((a, b) => a - b);
  const medio = Math.floor(sorted.length / 2);
  const mediana = sorted.length % 2 === 0 
    ? (sorted[medio - 1] + sorted[medio]) / 2 
    : sorted[medio];
  
  const minimo = Math.min(...tiemposArray);
  const maximo = Math.max(...tiemposArray);
  
  // Desviación estándar
  const varianza = tiemposArray.reduce((acc, val) => {
    return acc + Math.pow(val - promedio, 2);
  }, 0) / tiemposArray.length;
  const desviacionEstandar = Math.sqrt(varianza);

  return {
    promedio_ms: Math.round(promedio),
    promedio_segundos: (promedio / 1000).toFixed(2),
    mediana_ms: Math.round(mediana),
    mediana_segundos: (mediana / 1000).toFixed(2),
    minimo_ms: minimo,
    minimo_segundos: (minimo / 1000).toFixed(2),
    maximo_ms: maximo,
    maximo_segundos: (maximo / 1000).toFixed(2),
    desviacion_estandar_ms: Math.round(desviacionEstandar),
    desviacion_estandar_segundos: (desviacionEstandar / 1000).toFixed(2),
    total_items: tiemposArray.length
  };
}

function crearGraficoSD3(mach, narc, psych) {
  const canvas = document.getElementById('grafico-sd3');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
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
document.addEventListener('DOMContentLoaded', () => {
  const btnContinuar = document.getElementById('btn-continuar-micro');
  if (btnContinuar) {
    btnContinuar.addEventListener('click', function() {
      const seccionTest = document.getElementById('seccion-test');
      const seccionMicro = document.getElementById('seccion-micro');
      
      if (seccionTest) seccionTest.classList.add('hidden');
      if (seccionMicro) seccionMicro.classList.remove('hidden');
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});

// ========================================
// CÁMARA Y CAPTURA
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const btnActivarCamara = document.getElementById('btn-activar-camara');
  const btnTomarFoto = document.getElementById('btn-tomar-foto');
  const btnSubirImagen = document.getElementById('btn-subir-imagen');
  const inputImagen = document.getElementById('input-imagen');
  const btnAnalizar = document.getElementById('btn-analizar');

  if (btnActivarCamara) {
    btnActivarCamara.addEventListener('click', async function() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (video) {
          video.srcObject = stream;
          video.classList.remove('hidden');
        }
        this.classList.add('hidden');
        if (btnTomarFoto) btnTomarFoto.classList.remove('hidden');
      } catch(err) {
        alert('No se pudo acceder a la cámara. Por favor subí una imagen.');
        console.error(err);
      }
    });
  }

  if (btnTomarFoto && video && canvas) {
    btnTomarFoto.addEventListener('click', function() {
      const ctx = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      
      imagenCapturada = canvas.toDataURL('image/jpeg', 0.8);
      
      video.classList.add('hidden');
      canvas.classList.remove('hidden');
      if (btnAnalizar) btnAnalizar.classList.remove('hidden');
      
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
      }
    });
  }

  if (btnSubirImagen && inputImagen) {
    btnSubirImagen.addEventListener('click', function() {
      inputImagen.click();
    });

    inputImagen.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
          const img = new Image();
          img.onload = function() {
            if (canvas) {
              const ctx = canvas.getContext('2d');
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0);
              
              imagenCapturada = canvas.toDataURL('image/jpeg', 0.8);
              
              if (video) video.classList.add('hidden');
              canvas.classList.remove('hidden');
              if (btnAnalizar) btnAnalizar.classList.remove('hidden');
            }
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (btnAnalizar) {
    btnAnalizar.addEventListener('click', async () => {
      await analizarMicroexpresiones();
    });
  }
});

// ========================================
// ANÁLISIS DE MICROEXPRESIONES CON SPINNER Y REINTENTOS

async function cargarModeloConReintentos(url, intentos = 3) {
  for (let i = 1; i <= intentos; i++) {
    try {
      await tf.ready();
      const modelo = await tf.loadLayersModel(url);
      console.log(`✅ Modelo cargado correctamente (intento ${i})`);
      return modelo;
    } catch (error) {
      console.warn(`⚠️ Error cargando modelo en intento ${i}: ${error.message}`);
      if (i === intentos) throw error;
      await new Promise(res => setTimeout(res, 1000)); // Espera 1s antes de reintentar
    }
  }
}

async function analizarMicroexpresiones() {
  const resultadoDiv = document.getElementById('resultado-micro');
  if (!resultadoDiv) {
    console.error('No se encontró el div de resultados');
    return;
  }

  // Spinner animado mientras carga
  resultadoDiv.innerHTML = `
    <div class="analisis-loading">
      <div class="spinner"></div>
      Cargando modelo de IA...
    </div>`;
  resultadoDiv.classList.remove('hidden');

  try {
    // 🔹 Cargar modelo con reintentos
    if (!modeloMicroexpresiones) {
      modeloMicroexpresiones = await cargarModeloConReintentos(
        "https://tati2222.github.io/DarkLens/model/tfjs_model/model.json"
      );
    }

    // Spinner animado mientras analiza
    resultadoDiv.innerHTML = `
      <div class="analisis-loading">
        <div class="spinner"></div>
        Analizando microexpresiones...
      </div>`;

    const canvas = document.getElementById('canvas');
    if (!canvas) throw new Error("No se encontró el canvas para analizar.");

    // 🔹 Preprocesar imagen
    const tensor = tf.browser.fromPixels(canvas)
      .resizeNearestNeighbor([224, 224])
      .toFloat()
      .div(255.0)
      .expandDims();

    // 🔹 Hacer predicción
    const prediccion = await modeloMicroexpresiones.predict(tensor).data();
    tensor.dispose();

    if (!prediccion || prediccion.length < 8) {
      throw new Error("Predicción inválida");
    }

    resultadosMicro = {
      enojado: prediccion[0],
      desprecio: prediccion[1],
      disgusto: prediccion[2],
      miedo: prediccion[3],
      feliz: prediccion[4],
      otro: prediccion[5],
      triste: prediccion[6],
      sorprendido: prediccion[7]
    };

    // 🔹 Mostrar resultados integrados
    mostrarResultadoIntegrado();

  } catch (error) {
    console.error('❌ Error al analizar:', error);
    resultadoDiv.innerHTML = `
      <div class="resultado-box" style="border-color: #ff6384;">
        <h4>Error en el análisis</h4>
        <p>No se pudo realizar el análisis. Por favor intentá de nuevo.</p>
        <p style="font-size: 0.9em; color: #ff6384;">${error.message}</p>
      </div>
    `;
  }
}


// ========================================
// RESULTADO INTEGRADO CON VOZ Y GRÁFICO
// ========================================
function mostrarResultadoIntegrado() {
  if (!resultadosSD3 || !resultadosMicro) {
    alert('Faltan completar algunos pasos del análisis');
    return;
  }

  // Ocultar sección de microexpresiones y mostrar resultado final
  const seccionMicro = document.getElementById('seccion-micro');
  const seccionFinal = document.getElementById('seccion-final');
  
  if (seccionMicro) seccionMicro.classList.add('hidden');
  if (seccionFinal) seccionFinal.classList.remove('hidden');
  
  window.scrollTo({ top: 0, behavior: 'smooth' });

  const { mach, narc, psych } = resultadosSD3;
  const emocionesSorted = Object.entries(resultadosMicro).sort((a, b) => b[1] - a[1]);
  const emocionPrincipal = emocionesSorted[0][0];
  const emocionSecundaria = emocionesSorted[1][0];
  const intensidad = emocionesSorted[0][1];

  // Generar narrativa textual
  const narrativa = generarNarrativaIntegrada(mach, narc, psych, emocionPrincipal, intensidad);

  let html = `
    <div class="resultado-integrado">
      <!-- Controles de audio -->
      <div class="audio-controls">
        <button id="btn-reproducir-audio" class="btn-audio">
          🔊 Escuchar Análisis
        </button>
        <button id="btn-pausar-audio" class="btn-audio hidden">
          ⏸️ Pausar
        </button>
        <button id="btn-detener-audio" class="btn-audio hidden">
          ⏹️ Detener
        </button>
      </div>

      <!-- Perfiles lado a lado -->
      <div class="perfiles-grid">
        <div class="resultado-box">
          <h4>📊 Perfil Psicométrico SD3</h4>
          <p><strong>Maquiavelismo:</strong> ${mach.toFixed(2)} / 5.0</p>
          <p><strong>Narcisismo:</strong> ${narc.toFixed(2)} / 5.0</p>
          <p><strong>Psicopatía:</strong> ${psych.toFixed(2)} / 5.0</p>
        </div>
        
        <div class="resultado-box">
          <h4>😊 Perfil Emocional</h4>
          <p><strong>Emoción dominante:</strong> ${capitalize(emocionPrincipal)}</p>
          <p><strong>Emoción secundaria:</strong> ${capitalize(emocionSecundaria)}</p>
          <p><strong>Intensidad:</strong> ${(intensidad * 100).toFixed(1)}%</p>
        </div>
      </div>

      <!-- Gráfico de emociones -->
      <div class="grafico-emociones-container">
        <canvas id="grafico-emociones"></canvas>
      </div>

      <!-- Narrativa integrada -->
      <div class="resultado-box narrativa-principal">
        <h4>🧠 Análisis Psicológico Integrado</h4>
        <div id="texto-narrativa">
          ${narrativa}
        </div>
      </div>

      <!-- Disclaimer -->
      <div class="resultado-box disclaimer">
        <h4>⚠️ Nota Importante</h4>
        <p>
          Este análisis combina datos psicométricos autorreportados con análisis computacional de expresiones faciales. 
          Los resultados son de carácter exploratorio y forman parte de una investigación académica. 
          <strong>No constituyen un diagnóstico clínico</strong> y no deben utilizarse para tomar decisiones importantes sobre salud mental.
          Para una evaluación profesional, consultá con un psicólogo o psiquiatra.
        </p>
      </div>

      <!-- Botón enviar datos -->
      <div style="text-align: center; margin-top: 30px;">
        <button id="btn-enviar-datos-final" class="btn-primary">
          📤 Enviar Datos y Finalizar
        </button>
      </div>

      <!-- Footer -->
      <div class="footer-investigacion">
        <p style="color: #c080ff; font-size: 1.2em;">Gracias por participar en DARKLENS</p>
        <p style="color: #b0a0ff; margin-top: 10px;">
          Proyecto de investigación - Licenciatura en Ciencia de Datos<br>
          Universidad del Gran Rosario (UGR)
        </p>
      </div>
    </div>
  `;

  const contenidoFinal = document.getElementById('contenido-final');
  if (contenidoFinal) {
    contenidoFinal.innerHTML = html;
  }

  // Crear gráfico de emociones
  crearGraficoEmociones(resultadosMicro);

  // Configurar controles de audio
  configurarAudioNarrativa(narrativa);

  // Configurar botón de envío
  const btnEnviar = document.getElementById('btn-enviar-datos-final');
  if (btnEnviar) {
    btnEnviar.addEventListener('click', enviarDatosCompletos);
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ========================================
// GRÁFICO DE EMOCIONES
// ========================================
function crearGraficoEmociones(emociones) {
  const canvas = document.getElementById('grafico-emociones');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (graficoEmociones) graficoEmociones.destroy();

  const sorted = Object.entries(emociones).sort((a, b) => b[1] - a[1]);
  const labels = sorted.map(([emocion]) => capitalize(emocion));
  const data = sorted.map(([, valor]) => (valor * 100).toFixed(1));

  const colores = {
    enojado: '#ff4444',
    desprecio: '#aa44ff',
    disgusto: '#88ff44',
    miedo: '#ff8844',
    feliz: '#ffdd44',
    otro: '#888888',
    triste: '#4488ff',
    sorprendido: '#ff44ff'
  };

  const backgroundColor = sorted.map(([emocion]) => colores[emocion] || '#888888');

  graficoEmociones = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Intensidad (%)',
        data: data,
        backgroundColor: backgroundColor,
        borderColor: '#1a1a2e',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      indexAxis: 'y',
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Distribución de Microexpresiones Faciales',
          color: '#e0e0ff',
          font: { size: 18, weight: 'bold' }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.parsed.x.toFixed(1) + '%';
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 100,
          ticks: {
            color: '#b0b0ff',
            callback: function(value) {
              return value + '%';
            }
          },
          grid: {
            color: 'rgba(176, 176, 255, 0.1)'
          }
        },
        y: {
          ticks: {
            color: '#b0b0ff',
            font: { size: 12 }
          },
          grid: {
            display: false
          }
        }
      }
    }
  });
}

// ========================================
// NARRATIVA INTEGRADA
// ========================================
function generarNarrativaIntegrada(mach, narc, psych, emocion, intensidad) {
  const rasgoDominante = Math.max(mach, narc, psych);
  let rasgoNombre = '';
  let valorRasgo = 0;
  
  if (rasgoDominante === mach) {
    rasgoNombre = 'maquiavelismo';
    valorRasgo = mach;
  } else if (rasgoDominante === narc) {
    rasgoNombre = 'narcisismo';
    valorRasgo = narc;
  } else {
    rasgoNombre = 'psicopatía';
    valorRasgo = psych;
  }

  const interpretarNivel = (valor) => {
    if (valor <= 2.4) return 'bajo';
    if (valor <= 3.4) return 'moderado';
    return 'alto';
  };

  const nivel = interpretarNivel(valorRasgo);

  let narrativa = `<p>Tu perfil psicológico muestra una presencia ${nivel} de <strong>${rasgoNombre}</strong>, con un puntaje de ${valorRasgo.toFixed(2)} sobre 5.0. `;

  // Relaciones específicas entre rasgos y emociones
  const relacionesEmocionales = {
    maquiavelismo: {
      otro: 'Tu expresión facial neutral es coherente con este perfil, sugiriendo un control emocional calculado típico de la planificación estratégica.',
      feliz: 'Aunque tu expresión muestra felicidad, esto podría indicar una presentación social cuidadosamente gestionada para influir en otros.',
      triste: 'Tu expresión de tristeza contrasta interesantemente con el maquiavelismo, posiblemente reflejando frustración cuando las estrategias no funcionan.',
      enojado: 'La expresión de enojo puede manifestarse cuando las estrategias interpersonales encuentran obstáculos inesperados.',
      sorprendido: 'Tu sorpresa podría indicar reacciones genuinas ante situaciones que escapan a tu control estratégico.',
      miedo: 'La expresión de miedo sugiere vulnerabilidad bajo la superficie calculada, un aspecto menos frecuente en este perfil.',
      disgusto: 'El disgusto es coherente con reacciones ante situaciones o personas que no podés controlar o manipular.',
      desprecio: 'El desprecio se relaciona con tu evaluación estratégica de otros como herramientas o obstáculos.'
    },
    narcisismo: {
      otro: 'Tu expresión neutral contrasta con la búsqueda típica de atención característica del narcisismo.',
      feliz: 'La felicidad es consistente con este perfil, especialmente cuando recibís reconocimiento y admiración social.',
      triste: 'La tristeza puede surgir de una discrepancia entre tu autoimagen grandiosa y el feedback externo recibido.',
      enojado: 'El enojo típicamente emerge cuando sentís que no recibís el reconocimiento o respeto que considerás merecer.',
      sorprendido: 'La sorpresa sugiere alta reactividad ante comentarios o situaciones que afectan tu autoimagen.',
      miedo: 'El miedo puede relacionarse con amenazas percibidas a tu imagen pública o autoestima.',
      disgusto: 'El disgusto aparece ante situaciones que percibís como degradantes para tu imagen personal.',
      desprecio: 'El desprecio hacia otros es común cuando los considerás inferiores o sin valor para tu imagen.'
    },
    psicopatía: {
      otro: 'La expresión neutral es característica de este perfil, reflejando baja reactividad emocional general.',
      feliz: 'La felicidad puede reflejar búsqueda de estimulación y disfrute de experiencias intensas o riesgosas.',
      triste: 'La tristeza es poco común en este perfil, posiblemente indicando un momento inusual de vulnerabilidad.',
      enojado: 'El enojo surge típicamente ante frustraciones o barreras que impiden conseguir objetivos inmediatos.',
      sorprendido: 'La sorpresa aparece ante estímulos novedosos que capturan tu atención orientada a la búsqueda de sensaciones.',
      miedo: 'El miedo es una emoción menos frecuente en este perfil, caracterizado por baja sensibilidad a amenazas.',
      disgusto: 'El disgusto se manifiesta ante situaciones o personas que interfieren directamente con tus objetivos.',
      desprecio: 'El desprecio puede reflejar falta de empatía hacia otros, viéndolos como objetos más que personas.'
    }
  };

  narrativa += relacionesEmocionales[rasgoNombre][emocion] || 'Esta combinación sugiere un perfil psicológico complejo.';
  narrativa += '</p>';

  // Análisis de intensidad emocional
  narrativa += `<p>La intensidad de tu expresión facial es ${intensidad > 0.4 ? 'alta' : 'moderada'} (${(intensidad * 100).toFixed(1)}%), `;
  
  if (intensidad > 0.4) {
    narrativa += 'lo que indica una expresión emocional marcada y visible. Esta intensidad sugiere que la emoción detectada está siendo experimentada de manera significativa en este momento.';
  } else {
    narrativa += 'sugiriendo sutileza en tu expresión emocional. Esto puede indicar control emocional o una experiencia emocional menos intensa en el momento de la captura.';
  }
  narrativa += '</p>';

  // Integración final
  narrativa += `<p>La combinación de tu perfil psicométrico con tus microexpresiones faciales ofrece una visión multidimensional de tu personalidad. `;
  narrativa += `Mientras que el test SD3 captura patrones de comportamiento y pensamiento autorreportados, el análisis facial revela estados emocionales momentáneos que pueden o no alinearse con tu autopercepción. `;
  narrativa += `Esta disonancia o consonancia entre ambos componentes es información valiosa para comprender la complejidad del comportamiento humano.</p>`;

  return narrativa;
}

// ========================================
// SÍNTESIS DE VOZ (Text-to-Speech)
// ========================================
function configurarAudioNarrativa(narrativaHTML) {
  // Extraer texto sin HTML
  const div = document.createElement('div');
  div.innerHTML = narrativaHTML;
  const textoPlano = div.textContent || div.innerText || '';

  const btnReproducir = document.getElementById('btn-reproducir-audio');
  const btnPausar = document.getElementById('btn-pausar-audio');
  const btnDetener = document.getElementById('btn-detener-audio');

  if (!btnReproducir || !btnPausar || !btnDetener) return;

  // Verificar soporte de síntesis de voz
  if (!('speechSynthesis' in window)) {
    btnReproducir.textContent = '❌ Audio no disponible';
    btnReproducir.disabled = true;
    return;
  }

  let utterance = null;

  btnReproducir.addEventListener('click', function() {
    // Cancelar cualquier lectura previa
    window.speechSynthesis.cancel();

    utterance = new SpeechSynthesisUtterance(textoPlano);
    
    // Configuración de la voz
    utterance.lang = 'es-ES'; // Español
    utterance.rate = 0.9; // Velocidad (0.1 a 10)
    utterance.pitch = 1; // Tono (0 a 2)
    utterance.volume = 1; // Volumen (0 a 1)

    // Intentar usar una voz en español
    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(voice => voice.lang.startsWith('es'));
    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }

    // Eventos
    utterance.onstart = function() {
      btnReproducir.classList.add('hidden');
      btnPausar.classList.remove('hidden');
      btnDetener.classList.remove('hidden');
      resaltarTextoEnLectura();
    };

    utterance.onend = function() {
      btnReproducir.classList.remove('hidden');
      btnPausar.classList.add('hidden');
      btnDetener.classList.add('hidden');
      quitarResaltado();
    };

    utterance.onerror = function(e) {
      console.error('Error en síntesis de voz:', e);
      alert('Hubo un error al reproducir el audio. Intentá de nuevo.');
      btnReproducir.classList.remove('hidden');
      btnPausar.classList.add('hidden');
      btnDetener.classList.add('hidden');
    };

    window.speechSynthesis.speak(utterance);
  });

  btnPausar.addEventListener('click', function() {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      btnPausar.textContent = '▶️ Continuar';
    } else if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      btnPausar.textContent = '⏸️ Pausar';
    }
  });

  btnDetener.addEventListener('click', function() {
    window.speechSynthesis.cancel();
    btnReproducir.classList.remove('hidden');
    btnPausar.classList.add('hidden');
    btnDetener.classList.add('hidden');
    btnPausar.textContent = '⏸️ Pausar';
    quitarResaltado();
  });

  // Cargar voces cuando estén disponibles
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = function() {
      // Las voces ya están cargadas
    };
  }
}

function resaltarTextoEnLectura() {
  const textoDiv = document.getElementById('texto-narrativa');
  if (textoDiv) {
    textoDiv.style.backgroundColor = 'rgba(127, 0, 255, 0.1)';
    textoDiv.style.transition = 'background-color 0.5s ease';
  }
}

function quitarResaltado() {
  const textoDiv = document.getElementById('texto-narrativa');
  if (textoDiv) {
    textoDiv.style.backgroundColor = 'transparent';
  }
}

// ========================================
// ENVIAR DATOS A GOOGLE SHEETS
// ========================================
function enviarDatosCompletos() {
  if (!resultadosSD3 || !resultadosMicro || !imagenCapturada) {
    alert('Faltan completar algunos pasos antes de enviar los datos.');
    return;
  }

  const nombre = document.querySelector('input[name="nombre"]');
  const edad = document.querySelector('input[name="edad"]');
  const genero = document.querySelector('select[name="genero"]');
  const pais = document.querySelector('input[name="pais"]');

  if (!nombre || !edad || !genero || !pais) {
    alert('Error: No se encontraron los datos del formulario.');
    return;
  }

  const datos = {
    // Datos personales
    nombre: nombre.value,
    edad: edad.value,
    genero: genero.value,
    pais: pais.value,
    
    // Resultados SD3
    maquiavelismo: resultadosSD3.mach,
    narcisismo: resultadosSD3.narc,
    psicopatia: resultadosSD3.psych,
    respuestas_sd3: JSON.stringify(resultadosSD3.respuestas),
    
    // ⏱️ DATOS DE TIEMPO DE RESPUESTA
    tiempos_respuesta: JSON.stringify(resultadosSD3.tiempos_respuesta),
    tiempo_total_test_segundos: resultadosSD3.tiempo_total_segundos,
    tiempo_promedio_item: resultadosSD3.estadisticas_tiempo.promedio_segundos,
    tiempo_mediana_item: resultadosSD3.estadisticas_tiempo.mediana_segundos,
    tiempo_minimo_item: resultadosSD3.estadisticas_tiempo.minimo_segundos,
    tiempo_maximo_item: resultadosSD3.estadisticas_tiempo.maximo_segundos,
    desviacion_estandar_tiempo: resultadosSD3.estadisticas_tiempo.desviacion_estandar_segundos,
    
    // Imagen facial (Base64)
    imagen_base64: imagenCapturada,
    
    // Resultados de microexpresiones
    emociones: JSON.stringify(resultadosMicro),
    
    // Timestamp
    fecha: new Date().toISOString()
  };

  const btnEnviar = document.getElementById('btn-enviar-datos-final');
  if (btnEnviar) {
    btnEnviar.disabled = true;
    btnEnviar.textContent = '📤 Enviando...';
  }

  console.log('📦 Datos a enviar:', {
    ...datos,
    imagen_base64: '[IMAGEN_OMITIDA_EN_LOG]' // No mostrar base64 en console
  });

  fetch("https://script.google.com/macros/s/AKfycbysYvlE0XqfeTktWzreEPf5Frs0pbCdy-F_0ERp4X31WbtrO4EauKUImopHGiSwdrvnbg/exec", {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  })
  .then(() => {
    console.log("✅ Todos los datos enviados a Google Sheets");
    alert("✅ Datos enviados correctamente. Gracias por participar en DARKLENS.\n\nTus resultados han sido registados para la investigación.");
    
    if (btnEnviar) {
      btnEnviar.textContent = '✅ Enviado';
      btnEnviar.style.backgroundColor = '#4CAF50';
    }
  })
  .catch(err => {
    console.error("❌ Error al enviar:", err);
    alert("⚠️ Ocurrió un error al enviar los datos. Por favor, intentá de nuevo.");
    
    if (btnEnviar) {
      btnEnviar.disabled = false;
      btnEnviar.textContent = '📤 Enviar Datos y Finalizar';
    }
  });
}
