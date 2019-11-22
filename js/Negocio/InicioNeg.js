//Al cargar la pagina set inicial
window.onload=ValidarNeg();
function SetInicialNeg(){
    //Set inicial en avatar de web
    var user = firebase.auth().currentUser;
    var bd=firebase.firestore();
    var userid= user.uid;
    var nombre;
    var docRef = bd.collection('Negocios').doc(userid);
    docRef.get().then(function(doc){
        if (doc.exists){
            nombre=doc.data().nombreNeg;
            var inicial=nombre.charAt(0);
            document.getElementById('avtInicialNeg').innerHTML = inicial;
        }else{
            console.log("No such document!");
        }
    }).catch(function(error){
        console.log("Error al obtener los datos:", error);
    })
}

// Esta funcion ejecuta el observador de firebase
function ValidarNeg(){
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in.   
            SetInicialNeg();
            console.log("Logeado");
        } else {
            // User is not signed in.
            console.log("No Logeado");
            location.href="/html/index/negocioIndex/indexNeg.html"
        }
    });
}