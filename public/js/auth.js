const button = document.getElementById("sign_out");
const url = window.location.hostname.includes("localhost")
  ? "http://localhost:8080/api/auth/"
  : "https://sockets-restapi.herokuapp.com/api/auth/";
const miFormulario = document.querySelector("form");
const inputCorreo = document.getElementById("correo");
const inputPassword = document.getElementById("password");

//code here!!
miFormulario.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = {
    correo: inputCorreo.value,
    password: inputPassword.value,
  };

  fetch(url + "login", {
    method: "POST",
    body: JSON.stringify(formData),
    headers: { "Content-Type": "application/json" },
  })
    .then((resp) => resp.json())
    .then(({ msg, token }) => {
      if (msg) return console.log(msg);
      localStorage.setItem("token", token);
      window.location = "chat.html";
    })
    .catch((err) => {
      console.log("Error: " + err);
    });
});

function handleCredentialResponse(response) {
  // decodeJwtResponse() is a custom function defined by you
  // to decode the credential response.
  //  const responsePayload = decodeJwtResponse(response.credential);
  //*id token
  const body = { id_token: response.credential };
  //   console.log(body)
  // console.log(" (Cliente) Id token: ", response.credential);

  fetch(url + "google", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then((resp) => resp.json())
    .then((datos) => {
      const email = datos.usuario.correo;
      const { token } = datos;

      localStorage.setItem("email", email);
      localStorage.setItem("token", token);
      window.location = "chat.html";
    })
    .catch((resp) => {
      console.log("Error: ", resp);
    });
}

button.onclick = () => {
  // console.log("btn clicked");
  //   console.log(google.accounts.id);

  // * Sign out
  google.accounts.id.disableAutoSelect();

  const email = localStorage.getItem("email");

  google.accounts.id.revoke(email, (done) => {
    console.log("consent revoked");
    // console.log(done);
    localStorage.clear();
    location.reload();
  });
};
