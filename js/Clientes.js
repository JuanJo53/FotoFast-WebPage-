/*class Cliente{

}*/
// Evento de Boton Registrar
var Registrar = document.getElementById("btnRegistrarUser");
Registrar.addEventListener("click", RegistrarCli);
// Evento de Boton Ingresar
var Ingresar = document.getElementById("btbIngresarUser");
Ingresar.addEventListener("click", IngresarCli);

function RegistrarCli(){
    var nombre = document.getElementById("txtName").value;
    var apellido = document.getElementById("txtLastName").value;
    var num = document.getElementById("txtNum").value;
    var email = document.getElementById("txtEmail").value;
    var pass = document.getElementById("txtPass").value;
    const auth = new Auth();
    auth.crearCuentaEmailPass(email,pass);
    ValidarNeg();
}

function IngresarCli(){
    var email = document.getElementById("txtEmailUser").value;
    var pass = document.getElementById("txtPassUser").value;
    const auth = new Auth();
    auth.LoginEmailPass(email,pass);
    ValidarNeg();
}

function ValidarNeg(){
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in.
            var displayName = user.displayName;
            var email = user.email;
            var emailVerified = user.emailVerified;
            var photoURL = user.photoURL;
            var isAnonymous = user.isAnonymous;
            var uid = user.uid;
            var providerData = user.providerData;
            console.log("Logeado");
            console.log(user);
            return (true);            
        } else {
            // User is not signed in.
            console.log("No Logeado");
            return (false);
        }
        
      });
}