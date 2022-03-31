const { comprobarJWT } = require("../helpers");
const { ChatMensajes } = require("../models");

const chatMensajes = new ChatMensajes();

const sokectController = async (socket, io) => {
  const usuario = await comprobarJWT(socket.handshake.headers["x-token"]); // parametro Token
  if (!usuario) return socket.disconnect();

  //* add usuario conectado
  chatMensajes.agregarUsuarios(usuario);
  io.emit("usuarios-activos", chatMensajes.usuarios);

  // limpiar lista cuando alguien se desconecta
  socket.on("disconnect", () => {
    chatMensajes.desconectarUsuario(usuario.id);
    io.emit("usuarios-activos", chatMensajes.usuarios);
  });

  socket.on("enviar-mensaje", ({ mensaje, uid }) => {
    chatMensajes.enviarMensaje(usuario.ui, usuario.nombre, mensaje);
    io.emit("recibir-mensajes",chatMensajes.ultimos10)
  });
};

module.exports = { sokectController };
