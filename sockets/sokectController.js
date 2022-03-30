const sokectController = (socket) => {
  socket.on("connection", (paylaod) => {
    console.log(paylaod);
  });
};

module.exports = { sokectController };
