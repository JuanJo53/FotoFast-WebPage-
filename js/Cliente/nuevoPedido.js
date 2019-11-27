window.onload=ValidarCli();
//Esta funcion optiene la extension del documento.
function getFileExtension(filename){
    return filename.split('.').pop();
}
//Evento al añadir nuevo documento.
var fileButton = document.getElementById('my-file');
fileButton.addEventListener('change',function (e){
    var storage = firebase.storage();
    var user = firebase.auth().currentUser;
    var bd = firebase.firestore();
    //Get file
    var file=e.target.files[0];
    //Agrega metadata al documento por subir
    var metadata={
        name: file.name,
        contentType: getFileExtension(file.name)
    };
    //Create a storage ref
    var storageRef = storage.ref();
    //Upload file
    var task=storageRef.child('docsPedidos/'+user.uid+'/'+file.name).put(file,metadata);
    var perc;
    task.on('state_changed', 
        function progress(snapshot){
            perc=(snapshot.bytesTransferred/snapshot.totalBytes)*100;
            console.log(perc);
        }, 
        function error(err){
            console.log('Error: '+err);
        }, 
        function() {
            task.snapshot.ref.getDownloadURL()
            .then(url=>{
                console.log("Mostrar: "+url);
                bd.collection('Pedido').add({
                    blancoYnegro: false,
                    cantidad: 0,
                    clienteID: user.uid,
                    docID: url,
                    engrampado: false,
                    estado: "porEnviar",
                    fecha: firebase.firestore.FieldValue.serverTimestamp(),
                    fechaEntrega: firebase.firestore.FieldValue.serverTimestamp(),
                    ladosImpre: "",
                    metodoPago: "",
                    negocioID: "",
                    nombreDoc: file.name, 
                    paginas: true,
                    tamañoHoja: "",
                    tipoDoc: getFileExtension(file.name),
                    tipoHoja: ""
                })
            })
            
        })
        setData(getFileExtension(file.name),file.name);
});
//Coloca la imagen y nombre de los negocios disponibles.
function setNegocios(){
    var user = firebase.auth().currentUser;
    var bd = firebase.firestore();
    var string="";
    bd.collection('Negocios').get()
    .then(function(querySnapshot){
        querySnapshot.forEach(function(doc){
            string+=`<div class="pb-3 text-center puesto" data-dismiss="modal" data-toggle="modal"
                        data-target="#configurarPedido">
                        <div id="`+doc.data().nombreNeg+`" onclick="getNeg(this)" class="card negocioIcon mx-auto">
                            <div class="img-puesto">
                                <!--img del negocio-->
                                <img src="../../../img/pcs.jpg" alt="" class="card-img-top">
                                <!--//img del negocio-->
                            </div>
                            <div class="card-footer">
                                <!--nombre del negocio-->
                                <h5  class="my-auto text-light">`+doc.data().nombreNeg+`</h5>
                                <!--//nombre del negocio-->
                            </div>
                        </div>
                    </div>`
            var negocios=document.getElementById('Negocios');
            negocios.innerHTML=string;
        })
    })
    .catch(function(error){
        console.log("Error obteniendo los negocios: ", error);
    });    
}

function getDocData(){
    var user = firebase.auth().currentUser;
    var bd = firebase.firestore();
    bd.collection('Pedido').where('clienteID','==',user.uid)
    .get()
    .then(function(querySnapshot){
        querySnapshot.forEach(function(doc){
            setData(doc.data().tipoDoc,doc.data().nombreDoc);
        })
    })
    .catch(function(error){
        console.log("Error obteniendo los documentos: ", error);
    });
}

function setData(type,name){
    var bd=firebase.firestore();
    var storage=firebase.storage();
    var user=firebase.auth().currentUser;
    var userid=user.uid;
    var storageRef = storage.ref('docsPedidos/'+user.uid);

    var table=document.getElementsByTagName('table')[0];
    var newRow=table.insertRow(1);
    //console.log(table.rows.length);

    var tipo=newRow.insertCell(0);
    var nombArch=newRow.insertCell(1);
    var solic=newRow.insertCell(2);
    var elim=newRow.insertCell(3);

    var icon=document.createElement('i');

    if(type==='pdf'){
        // TODO: Configurar para multiples iconos
        icon.className='far fa-file-pdf fa-3x';
        tipo.appendChild(icon);
    }
    tipo.className="text-center";
    
    nombArch.className="text-center";
    nombArch.innerHTML=name;

    solic.className="text-center";
    solic.innerHTML=`<button id="btnSol/`+(table.rows.length-1)+`" onclick="getDocNomb(this)" 
                        class="btn positive bg-printalo-greenDetail text-light" data-toggle="modal" data-target="#escogerLocal">
                        Solicitar
                    </button>`;
    elim.className="text-center";
    elim.innerHTML=`<button class="btn negative bg-printalo-blueDetail text-light" data-toggle="modal" data-target="#checkAlert">
                        Eliminar
                    </button>`;
    
}
var negocioID;
var color;
var tamanio;
var impresion;
var paginas;
var rangoInf, rangoSup;
var acabado;
var tipo;
var cantidad;
var fecha_hora;
var pago;
var nombTarjeta, numTarjeta, mes, anio, cvv;

//Al apretar alguno de los documentos para solicitar.
function getDocNomb(_this){
    var nomb=getRowSelected(_this);
    console.log(nomb);
}
//Obtiene el nombre de la fila seleccionada.
function getRowSelected(objectPressed){
    var a=objectPressed.parentNode.parentNode;
    var nomb=a.getElementsByTagName("td")[1].innerHTML;
    return nomb;
}
//Obtiene el Negocio elegido.
function getNeg(objectPressed){
    negocioID=objectPressed.id;
    console.log(negocioID);
}
//Setea los valores para los detalles del pedido.
function setDetPed(){
    color=getColor();
    tamanio=getTamaño();
    impresion=getImpresion();
    paginas=getCantHojas();
    if(paginas==='personalizado'){
        rangoInf=getRangoInf();
        rangoSup=getRangoSup();
    }
    acabado=getAcabado();
    tipo= getTipoHoja();
    cantidad=getCantCopias();
    console.log(color);
    console.log(tamanio);
    console.log(impresion);
    console.log(paginas);
    console.log(rangoInf);
    console.log(rangoSup);
    console.log(acabado);
    console.log(tipo);
    console.log(cantidad);
    setPreview();
}
//Obtiene el valor del color de impresion.
function getColor(){
    if(document.getElementById("color").checked){
        return false;
    }else{
        return true;
    }    
}
//Obtiene el valor del tamanio de hoja.
function getTamaño(){
    if(document.getElementById("carta").checked){
        return 'carta';
    }else if(document.getElementById("oficio").checked){
        return 'oficio';
    }else{
        return 'A4';
    }    
}
//Obtiene el tipo de impresion.
function getImpresion(){
    if(document.getElementById("impresion").checked){
        return 'intercalado';
    }else{
        return 'anv/rev';
    }    
}
//Obtiene el detalle de las paginas.
function getCantHojas(){
    if(document.getElementById("todo").checked){
        return 'todo';
    }else{
        return 'personalizado';
    }
}
//Obtiene el rango inferior de las hojas.
function getRangoInf(){
    var inf=document.getElementById('rangoInf').value;
    return parseInt(inf);
}
//Obtiene el rango superior de las hojas.
function getRangoSup(){
    var sup=document.getElementById('rangoSup').value;
    return parseInt(sup);
}
//Obtiene el acabado de la impresion.
function getAcabado(){
    if(document.getElementById("acabado").checked){
         return 'engrampado';
    }else{
        return 'normal';
    }    
}
//Obtiene el tipo de hoja.
function getTipoHoja(){
    if(document.getElementById("TipoHoja").checked){
        return 'normal';
    }else{
        return 'reutilizado';
    }    
}
//Obtener la cantidad de copias.
function getCantCopias(){
    var cant=document.getElementById('cantidad').value;
    return parseInt(cant);
}
//Obtiene la fecha y hora deseada para su entrega.
function getFechaHora(){
    var fecha=document.getElementById('datepicker').value;
    var hora=document.getElementById('timepicker').value;
    fecha_hora=fecha+'_'+hora;
    console.log(fecha_hora);
}

function getTipoPago(){
    if(document.getElementById("tipoPago").checked){
        pago='personal';
        console.log('personal');
    }else{
        pag='tarjeta';
        getDatosTarjeta();
        console.log('tarjeta');
    }    
}

function getDatosTarjeta(){
    var nombre=document.getElementById('nombTarjeta').value;
    var numero=document.getElementById('numTarjeta').value;
    var mes=document.getElementById('mes').value;
    var anio=document.getElementById('anio').value;
    var cvv=document.getElementById('CVV').value;
    console.log('nombre: '+nombre+'\nNumero: '+numero+'\nMes: '+mes+'\nAnio: '+anio+'\nCVV: '+cvv);
}
//Muestra la pre vista de todos lo parametros seleccionados.
function setPreview(){
    if(color===true){
        document.getElementById("colorP").checked=true;
    }else{
        document.getElementById("BNP").checked=true;
    }
    if(tamanio==='carta'){
        document.getElementById("cartaP").checked=true;
    }else if(tamanio==='oficio'){
        document.getElementById("oficioP").checked=true;
    }else{
        document.getElementById("a4P").checked=true;
    }
    if(impresion==='intercalado'){
        document.getElementById("intercaladoP").checked=true;
    }else{
        document.getElementById("anvP").checked=true;
    }
    if(paginas==='todo'){
        document.getElementById("todoP").checked=true;
    }else{
        document.getElementById("personalizadoP").checked=true;
        //TODO: Valores de rango
    }
    if(acabado==='normal'){
        document.getElementById("normalP").checked=true;
    }else{
        document.getElementById("engrampadoP").checked=true;
    }
    if(tipo==='normal'){
        document.getElementById("TnormalP").checked=true;
    }else{
        document.getElementById("TreutilizadoP").checked=true;
    }
    document.getElementById("cantP").value=cantidad;
    var sp=fecha_hora.split("_");
    var fecha=sp[1];
    var hora=sp[2];
    document.getElementById("fechaP").value=fecha;
    document.getElementById("horaP").value=hora;
}
// Esta funcion ejecuta el observador de firebase
function ValidarCli(){
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in.
            getDocData();
            setNegocios();
            console.log("Logeado");
        }else{
            // User is not signed in.
            console.log("No Logeado");
            location.href="/html/index/usuarioIndex/indexUser.html"
        }
    }); 
}