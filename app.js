let jefes = {};
let jefeActivo = null;
let personalActivo = [];
let nombresPersonal = {}; // Mapa de ID a nombre

// Cargar CSV de personal desde sheet
async function cargarPersonal() {
  try {
    const response = await fetch( 
      "https://docs.google.com/spreadsheets/d/1-ECTfgK8SMfShxI-Likx7wwqtDvrZJj8NYGSNlqRbro/export?format=csv&gid=0");
    let texto = await response.text();
    texto = texto.replace(/^\uFEFF/, '');
    const lineas = texto.trim().split('\n').slice(1);

    lineas.forEach(linea => {
      const [id, nombre] = linea.split(',');
      nombresPersonal[id.trim()] = nombre.trim();
    });

    console.log('Personal cargado:', nombresPersonal);
  } catch (e) {
    console.error('Error cargando personal.csv:', e);
  }
}

// Cargar CSV de jefes desde GitHub
async function cargarJefes() {
  try {
    const response = await fetch(
       "https://docs.google.com/spreadsheets/d/1mzFPSSLO2fCa71yVcj2iyfSdHOHY-Z0ZKE5p-UDimF4/export?format=csv&gid=0");
    let texto = await response.text();
    texto = texto.replace(/^\uFEFF/, '');
    const lineas = texto.trim().split('\n').slice(1);

    lineas.forEach(linea => {
      const [usuario, clave, personal, area, nombre] = linea.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/);
      jefes[usuario] = {
        clave: clave,
        personal: personal.replace(/\"/g, '').split(','),
        area: (area || '').trim(),
        nombre: (nombre || '').trim()
      };
    });

    console.log('Jefes cargados:', jefes);
  } catch (e) {
    console.error('Error cargando jefes.csv:', e);
  }
}

// Validar login
document.getElementById('btnLogin').addEventListener('click', () => {
  const usuario = document.getElementById('usuario').value.trim();
  const clave = document.getElementById('clave').value.trim();

  if (jefes[usuario] && jefes[usuario].clave === clave) {
    jefeActivo = usuario;
    personalActivo = jefes[usuario].personal;

    document.getElementById('loginDiv').style.display = 'none';
    document.getElementById('formDiv').style.display = 'block';
    document.getElementById('btnLogout').classList.remove('hidden');

    // Mostrar datos del jefe
    const jefeData = jefes[usuario];
    const nombreJefe = jefeData.nombre;
    const areaJefe = jefeData.area || "Área no especificada";

    const infoBox = document.getElementById("infoJefe");
    infoBox.innerHTML = `
      <h3>${nombreJefe}</h3>
      <p><strong>Área:</strong> ${areaJefe}</p>
    `;
    infoBox.classList.remove("hidden");

    mostrarFormulario();
  } else {
    document.getElementById('loginMsg').textContent = 'Usuario o clave incorrecta';

    // Ocultar infoJefe si el login falla
    const infoBox = document.getElementById("infoJefe");
    infoBox.classList.add('hidden');
    infoBox.innerHTML = '';
  }
});

// Mostrar formulario
function mostrarFormulario() {
  const contenedor = document.getElementById('formDiv');
  contenedor.innerHTML = '';

  personalActivo.forEach(id => {
    const nombre = nombresPersonal[id.trim()] || '';
    const div = document.createElement('div');
    div.innerHTML = `
      <h3>${id} - ${nombre}</h3>
      <textarea id="nota-${id}" rows="2" placeholder="Toca para calificar"></textarea>
      <hr>
    `;
    contenedor.appendChild(div);
  });

  const footer = document.createElement('div');
  footer.innerHTML = `
    <label for="mes">Mes:</label>
    <select id="mes">
      <option value="">-- Elegí el mes --</option>
      <option value="Enero">Enero</option>
      <option value="Febrero">Febrero</option>
      <option value="Marzo">Marzo</option>
      <option value="Abril">Abril</option>
      <option value="Mayo">Mayo</option>
      <option value="Junio">Junio</option>
      <option value="Julio">Julio</option>
      <option value="Agosto">Agosto</option>
      <option value="Septiembre">Septiembre</option>
      <option value="Octubre">Octubre</option>
      <option value="Noviembre">Noviembre</option>
      <option value="Diciembre">Diciembre</option>
    </select>
    <button id="btnEnviar">Enviar por WhatsApp</button>
  `;
  contenedor.appendChild(footer);

  document.getElementById('btnEnviar').addEventListener('click', enviarWhatsApp);
}

// Enviar por WhatsApp
function enviarWhatsApp() {
  const mes = document.getElementById('mes').value;
  if (!mes) {
    alert('Por favor seleccioná un mes.');
    return;
  }

  let jefe = jefes[jefeActivo];
  let mensaje = `📋 Calificaciones - ${mes}\n👨‍💼 Jefe: ${jefe.nombre}\n🏢 Área: ${jefe.area}\n\n`;

  personalActivo.forEach(id => {
    const nota = document.getElementById(`nota-${id}`).value.trim();
    mensaje += `👨‍🚒 ${id}: ${nota}\n`;
  });
  const numero = "5493329530568";
const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');
}

// Cerrar sesión
document.getElementById("btnLogout").addEventListener("click", () => {
  jefeActivo = null;
  personalActivo = [];

  document.getElementById('loginDiv').style.display = 'block';
  document.getElementById('formDiv').style.display = 'none';
  document.getElementById('infoJefe').classList.add('hidden');
  document.getElementById('infoJefe').innerHTML = '';
  document.getElementById('btnLogout').classList.add('hidden');
  document.getElementById('usuario').value = '';
  document.getElementById('clave').value = '';
  document.getElementById('loginMsg').textContent = '';
});

// Cargar CSVs al iniciar
window.onload = async () => {
  await cargarPersonal();
  await cargarJefes();
};

function ayudaWhatsApp() {
  const mensaje = encodeURIComponent(
    "Hola, tengo problemas para ingresar a la app de calificaciones. ¿Me pueden ayudar?"
  );

  // Reemplazá por el número real de asistencia (con código de país)
  const telefono = "5491123456789";

  window.open(
    `https://wa.me/${telefono}?text=${mensaje}`,
    "_blank"
  );
}

