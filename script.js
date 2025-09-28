function aceptar() {
  document.getElementById("contenido").style.display = "block";
}

function enviarSD3() {
  // Simulación de envío
  const respuestas = {}; // recolectar respuestas del formulario
  fetch("https://tu-url-ngrok.ngrok.io/sd3", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ respuestas: respuestas })
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("resultado-sd3").innerText = JSON.stringify(data);
  });
}

function analizarImagen() {
  const imagen = document.getElementById("imagen").files[0];
  const formData = new FormData();
  formData.append("imagen", imagen);

  fetch("https://tu-url-ngrok.ngrok.io/microexp", {
    method: "POST",
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("resultado-imagen").innerText = JSON.stringify(data);
  });
}

function generarResumen() {
  // Simulación de integración
  fetch("https://tu-url-ngrok.ngrok.io/integrar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sd3: {}, // datos simulados
      micro: {} // datos simulados
    })
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("resultado-final").innerText = data.resumen;
  });
}

function enviarSD3() {
  const form = document.getElementById("form-sd3");
  const datos = new FormData(form);

  let maquiavelismo = 0;
  let narcisismo = 0;
  let psicopatia = 0;

  maquiavelismo += parseInt(datos.get("item1")) + parseInt(datos.get("item2")) + parseInt(datos.get("item3"));
  narcisismo += parseInt(datos.get("item4")) + parseInt(datos.get("item5")) + parseInt(datos.get("item6"));
  psicopatia += parseInt(datos.get("item7")) + parseInt(datos.get("item8")) + parseInt(datos.get("item9"));

  const resultado = `
    <h4>Resultados del Test SD3:</h4>
    <p><strong>Maquiavelismo:</strong> ${maquiavelismo} / 15</p>
    <p><strong>Narcisismo:</strong> ${narcisismo} / 15</p>
    <p><strong>Psicopatía:</strong> ${psicopatia} / 15</p>
  `;

  document.getElementById("resultado-sd3").innerHTML = resultado;
}

