const url = window.location.hostname.includes("localhost")
  ? "http://localhost:8080/api/auth/"
  : "https://sockets-restapi.herokuapp.com/api/auth/";
let usuario = null;
let socket = null;

//* referencias HTML
const txtUid = document.getElementById("txtUid");
const txtMensaje = document.getElementById("txtMensaje");
const ulUsuarios = document.getElementById("ulUsuarios");
const ulMensajes = document.getElementById("ulMensajes");
const btnSalid = document.getElementById("btnSalid");

const validarJWT = async () => {
  const token = localStorage.getItem("token") || "";
  if (token.length <= 10) {
    window.location = "index.html";
    throw new Error("El token no es valido!!");
  }

  const resp = await fetch(url, {
    headers: { "x-token": token },
  });

  const { usuario: userDB, token: tokenDb } = await resp.json();
  localStorage.setItem("token", tokenDb);
  usuario = userDB;
  document.title = userDB.nombre;

  await conectarSocket();
};

const conectarSocket = async () => {
  socket = io({
    extraHeaders: {
      "x-token": localStorage.getItem("token"),
    },
  });

  socket.on("connect", () => {
    console.log("Online");
  });
  socket.on("disconnect", () => {
    console.log("Offline");
  });

  socket.on("recibir-mensajes", (payload) => {
    //TODO
    dibujarMensajes(payload);
  });

  socket.on("usuarios-mensajes", () => {
    //TODO
  });
  socket.on("usuarios-activos", dibujarUsuario);

  socket.on("mensajes-privado", (payload) => {
    // console.log(payload)
    const { nombre, mensaje } = payload;
    ulMensajes.innerHTML += `
    <li>
      <p>
          <spam  style="color: red;" class="text-primaty">${nombre}:</spam>
          <spam class="">${mensaje} <b>-Mensaje privado-</b> </spam>
      </p>
    </li>
    `;
  });
};

const dibujarMensajes = (mensajes = [], color = "aqua") => {
  let mensajesHtml = "";
  mensajes.forEach(({ mensaje, nombre }) => {
    mensajesHtml += `
      <li>
        <p>
            <spam  style="color: ${color};" class="text-primaty">${nombre}:</spam>
            <spam class="">${mensaje}</spam>
        </p>
      </li>
      `;
  });
  ulMensajes.innerHTML = mensajesHtml;
};

txtMensaje.addEventListener("keyup", ({ keyCode }) => {
  const mensaje = txtMensaje.value;
  const uid = txtUid.value;
  if (mensaje.length === 0) return;
  if (keyCode !== 13) return;
  // enviar mensaje al servidor
  socket.emit("enviar-mensaje", { usuario, mensaje, uid });
  //limpiar input
  txtMensaje.value = "";
});

const dibujarUsuario = (usuarios = {}) => {
  let userHtml = "";
  for (let property in usuarios) {
    // console.log(`${property}: ${usuarios[property].nombre}`);
    userHtml += `
    <li>
      <p>
          <h5 class="text-success">${usuarios[property].nombre}</h5>
          <spam class="fs-6 text-muted">${property}</spam>
      </p>
    </li>
    `;
  }
  ulUsuarios.innerHTML = userHtml;
};

const main = async () => {
  //Validar JWT
  await validarJWT();
};

main();
