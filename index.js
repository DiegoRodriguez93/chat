var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var bodyParser = require('body-parser');
var dateLib = require('./dateLib');

var mysqli      = require('mysql');
var mysql = mysqli.createPool({
  connectionLimit : 10,
  host     : 'localhost',
  port     : '8889',
  user     : 'root',
  password : 'root',
  database : 'chat'
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// for parsing application/json
app.use(bodyParser.json()); 
// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
  socket.on('isTyping', function(msg){
    io.emit('isTyping', msg);
  });
});

app.post('/saveMessage', function(req, res){
 
mysql.query(`INSERT INTO messages_chat (name, message) VALUES ('`+req.body.name+`', '`+req.body.message+`')`, function (error, results, fields) {
  if (error){
    console.log(error);
    res.send({'result':false,'message':'No se ha podido guardar en la db!'})
  }else{
    res.send({'result':true,'message':'Correcto!'})
  }

});

});

app.post('/saveUser', function(req, res){

  //TODO HACER UN SELECT DEL MAIL Y TOMAR ESE ID USER
 
  mysql.query(`INSERT INTO users (name, email, creation_date) VALUES ('`+req.body.name+`', '`+req.body.email+`', now() )`,async function (error, results, fields) {
    if (error){
      console.log(error);
      res.send({'result':false,'message':'No se ha podido guardar en la db!'})
    }else{

      devolverConversationId(results.insertId)
      .then((conv)=>{ !conv.error ? res.send({'result':true,
      'message':'Usuario guardado correctamente!',
      'id_user':results.insertId,
      'id_conversation':conv.conversationID}) : res.send({'message':'Error!'}) })

    }
  
  });
  
  });

  app.get('/listConversations', function(req, res){

    //TODO HACER UN SELECT DEL MAIL Y TOMAR ESE ID USER
   
    mysql.query(`SELECT c.id as converId, c.date, c.state, o.name as ownerName, u.email as userEmail FROM conversations as c 
    LEFT JOIN users as u ON c.visitantId = u.id_user
    LEFT JOIN owners as o ON o.id = c.ownerId
    ORDER BY date DESC`, function (error, results, fields) {
      if (error){
        console.log(error);
        res.send()
      }else{

        console.log(results[0].id)

        let largoArray = results.length;
        let conversations = [];
        let state = '';
        let newDate = '';
        let date = '';

        for(let i = 0; i < largoArray;i++){

          let cerrarChat = '';
          let btnAtender = '';

          if(results[i].state == 0){
            state = 'Cerrado';
          }else if(results[i].state == 1){
            state = 'Sin Antender';
          }else if(results[i].state == 2){
            state = 'Atendido';
          }

          date = new Date(results[i].date);
          newDate = dateLib.dateTime(date);

          if(results[i].state == 1){
             btnAtender = `<button onclick="atenderChat('`+results[i].converId+`','`+results[i].userEmail+`')">Atender Chat</button>`;
          }

          if(results[i].state == 2){
            cerrarChat = `<button onclick="cerrarChat('`+results[i].converId+`')">Cerrar Chat</button>`;
          }

          let acciones = btnAtender+'<br/>'+cerrarChat;

          conversations.push( [ newDate, state, results[i].userEmail, results[i].ownerName, acciones]); 

          

        }

        let response = '{ "data" :' + JSON.stringify(conversations) + '}';
        console.log(response);
        res.send(response);

      }
    
    });
    
    });

function devolverConversationId(id_user){

  return new Promise ( (resolve, reject) => {
    mysql.query(`INSERT INTO conversations (state, visitantId, ownerId, date) VALUES ('1', '`+id_user+`', NULL ,now() )`, 
    function (error, results, fields) {
      if (error){
        console.log(error);
        reject({'error':true});
      }else{
        resolve({'error': false, 'conversationID': results.insertId}) ;
      }
    });
  })



}



app.get('/listConversations',function(req, res){

  mysql.query(`SELECT * FROM conversations`, function(err, results, fields){

 /*    console.log(results); */

    let largoArray = results.length;

    for(let i = 0;i < largoArray; i++){
      console.log(results[i].date);
    }

    if(err){
      console.log(error);
      let dataTableEmpty = {"data":[]};
      res.send(dataTableEmpty);
    }else{
      res.send();
    }


  });


});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
