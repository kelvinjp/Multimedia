var express = require('express'),
    app     = express(),
    mysql   = require('mysql'),
    connectionpool = mysql.createPool({
        host     : 'localhost',
        user     : 'root',
        password : 'secret',
        database : 'rest_demo'
    });
/*
Modulos requeridos para la seguridad de las Urls
 */
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var multer = require('multer');
var expressSession = require('express-session');
var passport = require('passport');
var passportLocal = require('passport-local');
var passportHttp = require('passport-http');

	app.use(bodyParser.json()); // for parsing application/json
	app.use(bodyParser.urlencoded({ extended: false })); // for parsing application/x-www-form-urlencoded
	app.use(multer()); // for parsing multipart/form-data
    app.use(cookieParser());
    app.use(expressSession({
        secret: process.env.SESSION_SECRET || 'secret',
        resave:false,
        saveUninitialized:false
    }));
    app.use(passport.initialize());
    app.use(passport.session());


passport.use(new passportLocal.Strategy(verifyCredentials));
passport.use(new passportHttp.BasicStrategy(verifyCredentials));

/*
 Aqui validamos que el usuario y contraseña exista y creamos la credencial,
 La funcion done() es la que se encarga de settear en el header una Key si el
 usuario se autentico correctamente para que en su proximo request pueda accesar a
 la url que necesiten autenticacion.
 */
 function verifyCredentials (username, password, done){

    if(username===password){
        done(null, {id: username, name:username });
    }else{
        done(null, null);
    }
}
/*
Aqui se serializa el Id del usuario que se autentico para
poder encontrarlo en su proximo request
 */
passport.serializeUser(function(user,done){
    done(null, user.id);
});
/*
Aqui se deserializa solo en id que fue guardado en session,
si se quiere mas informacion del usuario se hace una consulta
a la bd
 */
passport.deserializeUser(function(id,done){
    //Query database or cache here done(null, user.id);
    done(null, {id:id, name:id});
});

/*
Aqui nos aseguiramos que el usuario esta autenticado
de no estarlo enviamos un error 403 de no permiso
 */
function ensureAuthenticated(req, res, next){
   if(req.isAuthenticated()){
       next();
   } else{
       res.json('no esta autenticado');
   }
}

/*
Solo para probar si al autenticacion HTTP funciona
 */
app.get('/', function(req,res){

    if(req.isAuthenticated()){
        res.json(true);
    }else{
        res.json(false);
    }
});

/*
Metodo Post para loguearse
@param username
@param password
@return json del usuario o json vacio
 */
app.post('/login', passport.authenticate('local'), function(req,res){
    res.json(req.body);
});

/*
Es necesario hacer logout del lado del servidor
para quitar la key que da acceso a las Urls restringidas
 */
app.get('/logout', function(req,res){

    req.logout();
    res.json('logOut');
});

/*
Todas las Url que parta de path '/admin/' necesitaran logeo
 */
//app.use('/admin', passport.authenticate('basic'));

app.get('/admin/alertas',ensureAuthenticated, function(req,res){

    if(req.isAuthenticated()){
        res.json([
            {value:'Estoy Autenticado'},
            {value:'valor 1'},
            {value:'valor 1'}
        ]);
    } else{
        res.json('No Tiene Acceso');
    }
});

app.listen(3000);
console.log('Rest Demo Listening on port 3000');
