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
