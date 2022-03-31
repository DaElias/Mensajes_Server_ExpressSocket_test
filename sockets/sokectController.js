const { comprobarJWT } = require("../helpers");
const { ChatMensajes } = require("../models");

const chatMensajes = new ChatMensajes();

const sokectController = async (socket, io) => {
  const usuario = await comprobarJWT(socket.handshake.headers["x-token"]); // parametro Token
  if (!usuario) return socket.disconnect();

  //* add usuario conectado
  chatMensajes.agregarUsuarios(usuario);
  io.emit("usuarios-activos", chatMensajes.usuarios);
  io.emit("recibir-mensajes", chatMensajes.ultimos10);

  //Conectarlo a una sala especial
  socket.join(usuario.id);

  // limpiar lista cuando alguien se desconecta
  socket.on("disconnect", () => {
    chatMensajes.desconectarUsuario(usuario.id);
    io.emit("usuarios-activos", chatMensajes.usuarios);
  });

  socket.on("enviar-mensaje", ({ usuario, mensaje, uid }) => {
    // const { uid } = usuario;
    // console.log(usuario);
    // console.log("uid: ",uid)
    if (uid) {
      //* mensajes privados
      console.log("Mensaje Privado");
      socket.to(uid).emit("mensajes-privado", { nombre: usuario.nombre, mensaje });
    } else {
      console.log("Mensaje Publico");
      chatMensajes.enviarMensaje(usuario.uid, usuario.nombre, mensaje);
      io.emit("recibir-mensajes", chatMensajes.ultimos10);
    }
  });
};

module.exports = { sokectController };
