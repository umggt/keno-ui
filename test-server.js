var express = require('express');
var bodyParser = require('body-parser');
var app = express();

//app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.post('/servidor.php', function (req, res) {
    if (!req.body || !req.body.data){
        res.status(400).json({ resultado: false, mensaje: 'empty body' });
        return;
    }
    
    var data = JSON.parse(req.body.data);
    
    if (!data || !data.operacion) {
        res.status(400).json({ resultado: false, mensaje: 'empty data' });
        return;
    }
    
    if (data.operacion === 'obtener-perfil') {
        if (data.nickname === 'mike') {
            res.json({
                resultado: true,
                nickname: 'mike',
                saldoInicial: '100.00',
                saldoActual: '500.00'
            });
        } else {
            res.json({
                resultado: false
            });
        }
        
        return;
    }
    
    if (data.operacion === 'registrar-perfil') {
        if (data.nickname && data.saldoInicial) {
            res.json({
                resultado: true,
                nickname: data.nickname,
                saldoInicial: data.saldoInicial,
                saldoActual: data.saldoInicial
            });
        } else {
            res.json({
                resultado: false,
                nickname: data.nickname,
                saldoInicial: data.saldoInicial,
                saldoActual: data.saldoInicial
            });
        }
        return;
    }
    
     if (data.operacion === 'jugar') {
        if (data.nickname && data.apuesta) {
            res.json({
                resultado: true,
                nickname: data.nickname,
                ganancias: 100,
                coincidencias: 3,
                numeros: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                saldoActual: 30.31
            });
        } else {
            res.json({
                resultado: false
            });
        }
        return;
    }
    
    if (data.operacion == 'listar') {
        res.json([
            { nickname: 'mike', saldoInicial: 100, saldoActual: 200 },
            { nickname: 'john', saldoInicial: 500, saldoActual: 100 },
            { nickname: 'juan', saldoInicial: 400, saldoActual: 1000 }
        ]);
        return;
    }
    
    res.status(400).json({ resultado: false, mensaje: 'unknown operation' });
});

app.use('/node_modules', express.static(__dirname + '/node_modules'));

app.use(express.static(__dirname + '/dist'));

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});