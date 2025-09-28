document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("datos-basicos").addEventListener("submit", function (e) {
    e.preventDefault();
    document.querySelector(".bienvenida").style.display = "none";
    document.getElementById("contenido").style.display = "block";
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
