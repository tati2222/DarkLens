document.addEventListener("DOMContentLoaded", function () {
  const formulario = document.getElementById("datos-basicos");

  formulario.addEventListener("submit", function (e) {
    e.preventDefault();

    // Oculta la bienvenida
    document.querySelector(".bienvenida").style.display = "none";

    // Muestra el test SD3
    document.getElementById("contenido").style.display = "block";

    // Desplaza suavemente al test
    document.getElementById("contenido").scrollIntoView({ behavior: "smooth" });
  });
});


function calcularSD3() {
  const datos = new FormData(document.getElementById("form-sd3"));

  // Ítems por rasgo según clave oficial
  const maquiavelismo = [1, 4, 7, 10, 13, 16, 19, 22, 25];
  const narcisismo = [2, 5, 8, 11, 14, 17, 20, 23, 26];
  const psicopatia = [3, 6, 9, 12, 15, 18, 21, 24, 27];

  // Ítems invertidos
  const invertidos = [5, 6, 17, 21, 23];

  function obtenerValor(n) {
    let val = parseInt(datos.get("item" + n));
    if (invertidos.includes(n)) val = 6 - val;
    return val;
  }

  let m = 0, n = 0, p = 0;
  maquiavelismo.forEach(i => m += obtenerValor(i));
  narcisismo.forEach(i => n += obtenerValor(i));
  psicopatia.forEach(i => p += obtenerValor(i));

  document.getElementById("resultado-sd3").innerHTML = `
    <h4>Resultados del Test SD3:</h4>
    <p><strong>Maquiavelismo

    // ------------------------------
// Preguntas SD3 (27 ítems)
// ------------------------------
const preguntasSD3 = [
  "La mejor manera de manejar a las personas es decirles lo que quieren oír.",
  "La gente me dice que soy muy manipulador/a.",
  "Me gusta planear las cosas con mucha antelación.",
  "La mayoría de la gente puede ser manipulada.",
  "Tengo tendencia a explotar a los demás para lograr mis objetivos.",
  "Soy una persona calculadora.",
  "Las personas que me molestan siempre lo pagan.",
  "Es difícil que me sienta culpable.",
  "La venganza es dulce.",
  "Nunca me preocupo por la moralidad de mis acciones.",
  "Las personas que no pueden defenderse merecen ser usadas.",
  "Siempre busco lo que me conviene.",
  "Me gusta ser el centro de atención.",
  "Las personas suelen admirarme.",
  "Tengo un fuerte sentido de importancia personal.",
  "Me gusta presumir de mis logros.",
  "Me siento superior a la mayoría de la gente.",
  "Soy una persona especial que merece un trato especial.",
  "Disfruto cuando la gente me elogia.",
  "Creo que tengo un talento único.",
  "Me gusta que los demás me obedezcan.",
  "Siento poco remordimiento por las cosas que hago.",
  "Soy insensible a los sentimientos de los demás.",
  "Me cuesta empatizar con la gente.",
  "Puedo ser cruel si es necesario.",
  "No me importa mucho si hiero a otros para lograr mis objetivos.",
  "No me siento mal cuando engaño a alguien."
];

// ------------------------------
// Escalas SD3
// ------------------------------
const escalas = {
  maquiavelismo: [1,2,4,5,6,12],
  narcisismo: [13,14,15,16,17,18,19,20],
  psicopatia: [7,8,9,10,11,21,22,23,24,25,26,27]
};

const invertidos = [3]; // ejemplo

let datosUsuario = {};
let resultadosSD3 = {};
let resultadosMicro = {};

// ------------------------------
// Generar preguntas dinámicamente
// ------------------------------
window.onload = () => {
  const lista = document.getElementById("lista-preguntas");
  preguntasSD3.forEach((pregunta, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${pregunta}
      <div class="opciones">
        ${[1,2,3,4,5].map(v => `
          <input type="radio" id="item${i+1}_${v}" name="item${i+1}" value="${v}" required>
          <label for="item${i+1}_${v}">${v}</label>
        `).join("")}
      </div>
    `;
    lista.appendChild(li);
  });

  // Manejo del formulario inicial
  document.getElementById("form-datos").addEventListener("submit", (e) => {
    e.preventDefault();
    datosUsuario.nombre = document.getElementById("nombre").value;
    datosUsuario.edad = document.getElementById("edad").value;
    datosUsuario.fecha = new Date().toLocaleString();
    document.getElementById("formulario").style.display = "none";
    document.getElementById("test-sd3").style.display = "block";
  });
};

// ------------------------------
// Calcular SD3
// ------------------------------
function calcularSD3() {
  const respuestas = [];
  for (let i=1; i<=27; i++) {
    const seleccionada = document.querySelector(`input[name="item${i}"]:checked`);
    if (!seleccionada) return alert("Faltan respuestas.");
    let valor = parseInt(seleccionada.value);
    if (invertidos.includes(i)) valor = 6 - valor;
    respuestas.push(valor);
  }

  const promedio = (indices) => indices.map(j => respuestas[j-1]).reduce((a,b)=>a+b,0) / indices.length;

  resultadosSD3 = {
    maquiavelismo: promedio(escalas.maquiavelismo).toFixed(2),
    narcisismo: promedio(escalas.narcisismo).toFixed(2),
    psicopatia: promedio(escalas.psicopatia).toFixed(2)
  };

  document.getElementById("resultado-sd3").innerHTML = `
    <h3>Resultados de ${datosUsuario.nombre}</h3>
    <p><b>Maquiavelismo:</b> ${resultadosSD3.maquiavelismo}</p>
    <p><b>Narcisismo:</b> ${resultadosSD3.narcisismo}</p>
    <p><b>Psicopatía:</b> ${resultadosSD3.psicopatia}</p>
  `;

  new Chart(document.getElementById("grafico-sd3"), {
    type: "radar",
    data: {
      labels: ["Maquiavelismo", "Narcisismo", "Psicopatía"],
      datasets: [{
        label: "Perfil",
        data: Object.values(resultadosSD3),
        backgroundColor: "rgba(52,152,219,0.2)",
        borderColor: "#3498db",
        pointBackgroundColor: "#2980b9"
      }]
    },
    options: {
      scales: { r: { min: 1, max: 5, ticks: { stepSize: 1 } } }
    }
  });

  document.getElementById("continuar-micro").style.display = "block";
  document.getElementById("continuar-micro").onclick = () => {
    document.getElementById("test-sd3").style.display = "none";
    document.getElementById("microexpresiones").style.display = "block";
  };
}

// ------------------------------
// Simulación análisis de imagen
// ------------------------------
function analizarImagen() {
  const archivo = document.getElementById("imagen").files[0];
  if (!archivo) return alert("Por favor, subí una imagen.");

  // 🔮 Simulación: emociones detectadas
  resultadosMicro = {
    alegria: (Math.random()*100).toFixed(1),
    tristeza: (Math.random()*100).toFixed(1),
    ira: (Math.random()*100).toFixed(1),
    miedo: (Math.random()*100).toFixed(1),
    sorpresa: (Math.random()*100).toFixed(1),
    desprecio: (Math.random()*100).toFixed(1)
  };

  document.getElementById("resultado-micro").innerHTML = `
    <h3>Emociones detectadas</h3>
    <ul>
      ${Object.entries(resultadosMicro).map(([k,v]) => `<li>${k}: ${v}%</li>`).join("")}
    </ul>
  `;

  document.getElementById("continuar-integracion").style.display = "block";
  document.getElementById("continuar-integracion").onclick = mostrarIntegracion;
}

// ------------------------------
// Integración final
// ------------------------------
function mostrarIntegracion() {
  document.getElementById("microexpresiones").style.display = "none";
  document.getElementById("integracion").style.display = "block";

  document.getElementById("resumen-integrado").innerHTML = `
    <h3>Resumen Integrado</h3>
    <p><b>${datosUsuario.nombre}</b> (${datosUsuario.edad} años)</p>
    <p><b>SD3</b> → Maquiavelismo: ${resultadosSD3.maquiavelismo}, Narcisismo: ${resultadosSD3.narcisismo}, Psicopatía: ${resultadosSD3.psicopatia}</p>
    <p><b>Microexpresiones</b> → Alegría: ${resultadosMicro.alegria}%, Tristeza: ${resultadosMicro.tristeza}%, Ira: ${resultadosMicro.ira}%...</p>
  `;

  new Chart(document.getElementById("grafico-integrado"), {
    type: "bar",
    data: {
      labels: ["Maquiavelismo", "Narcisismo", "Psicopatía", "Alegría", "Tristeza", "Ira", "Miedo", "Sorpresa", "Desprecio"],
      datasets: [{
        label: "Perfil Combinado",
        data: [
          resultadosSD3.maquiavelismo,
          resultadosSD3.narcisismo,
          resultadosSD3.psicopatia,
          resultadosMicro.alegria,
          resultadosMicro.tristeza,
          resultadosMicro.ira,
          resultadosMicro.miedo,
          resultadosMicro.sorpresa,
          resultadosMicro.desprecio
        ],
        backgroundColor: "rgba(155,89,182,0.6)"
      }]
    }
  });
}
document.addEventListener("DOMContentLoaded", function () {
  const formulario = document.getElementById("datos-basicos");

  formulario.addEventListener("submit", function (e) {
    e.preventDefault();

    // Oculta la presentación
    document.querySelector(".bienvenida").style.display = "none";

    // Muestra el test SD3
    document.getElementById("contenido").style.display = "block";

    // Desplazamiento suave al test
    document.getElementById("contenido").scrollIntoView({ behavior: "smooth" });
  });
});

function calcularSD3() {
  const datos = new FormData(document.getElementById("form-sd3"));

  const maquiavelismo = [1, 4, 7, 10, 13, 16, 19, 22, 25];
  const narcisismo = [2, 5, 8, 11, 14, 17, 20, 23, 26];
  const psicopatia = [3, 6, 9, 12, 15, 18, 21, 24, 27];
  const invertidos = [5, 6, 17, 21, 23];

  function obtenerValor(n) {
    let val = parseInt(datos.get("item" + n));
    if (invertidos.includes(n)) val = 6 - val;
    return val;
  }

  let m = 0, n = 0, p = 0;
  maquiavelismo.forEach(i => m += obtenerValor(i));
  narcisismo.forEach(i => n += obtenerValor(i));
  psicopatia.forEach(i => p += obtenerValor(i));

  document.getElementById("resultado-sd3").innerHTML = `
    <h4>Resultados del Test SD3:</h4>
    <p><strong>Maquiavelismo:</strong> ${m} / 45</p>
    <p><strong>Narcisismo:</strong> ${n} / 45</p>
    <p><strong>Psicopatía:</strong> ${p} / 45</p>
  `;

  const ctx = document.getElementById("grafico-sd3").getContext("2d");
  new Chart(ctx, {
    type: "radar",
    data: {
      labels: ["Maquiavelismo", "Narcisismo", "Psicopatía"],
      datasets: [{
        label: "Perfil SD3",
        data: [m, n, p],
        backgroundColor: "rgba(127, 0, 255, 0.2)",
        borderColor: "#7f00ff",
        borderWidth: 2
      }]
    },
    options: {
      scales: {
        r: {
          suggestedMin: 0,
          suggestedMax: 45,
          ticks: { stepSize: 5 }
        }
      }
    }
  });
}
