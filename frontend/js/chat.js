$(document).ready(function(){

  // TODO PASAR TODO EL CODIGO A VANILLA PARA EVITAR EL PESO DE JQUERY

  var person = prompt("Please enter your name", "Anonimo"+makeId(3));
  var email = prompt("Please enter your email", "");
  
  if (person != null) {
  localStorage.setItem('name',person);
  }else{
  localStorage.setItem('name',"Anonimo"+makeId(3));
  }

  if (email == null || email == '') {
      email = 'test@email.com'
      localStorage.setItem('email',email);
    }else{
      localStorage.setItem('email',email);
    }

    var name = localStorage.getItem('name');

    $.ajax({
      type: "POST",
      url: "http://localhost:3000/saveUser",
      data: {name:name, email:email},
      dataType: "JSON",
      success: function (res) {
        console.log(res.message);
        localStorage.setItem('id_conversation',res.id_conversation)
        localStorage.setItem('id_user',res.id_user);
      },error: err => {console.error(err)}
    });
  
  
  var socket = io('http://localhost:3000');
  $('form').submit(function(){
  
    let message = $('#m').val();
  
    if(message == ''){
      $('#errors').html('El mensaje no puede estar vacio');
      return false;
    }

    $.ajax({
      type: "POST",
      url: "http://localhost:3000/saveMessage",
      data: {name: name, message: message},
      dataType: "JSON",
      success: function (res) {
        console.log(res.result);
        console.log(res.message);
      },error: err => {console.log(err); alert('entro a error!')}
    });

    let id_conversation = localStorage.getItem('id_conversation')
    let id_user = localStorage.getItem('id_user');

  
    socket.emit('chat message', {name:name,
      msg:message,
      id_user:id_user,
      id_conversation:id_conversation});

    $('#m').val('');
    $('#errors').html('');
    socket.emit('isTyping','0');
    return false;
  });

  $('#m').change( function(){

    if($(this).val() == ''){

      socket.emit('isTyping','0');

    }else{

      let typingMessage = ' esta escribiendo....';

      socket.emit('isTyping', name+': '+typingMessage);

    }

  });
  
  socket.on('chat message', function(data){

    let id_conversation = localStorage.getItem('id_conversation');

    if(data.id_conversation == id_conversation){
      $('#messages').append($('<li>').text(data.name+': '+data.msg));
      window.scrollTo(0, document.body.scrollHeight);
    }


  });

  socket.on('isTyping', function(msg){

    if(msg == '0'){
      $('#isTyping').html('');
    }else{
      $('#isTyping').html(msg);
    }
  });
  
  });
  
  function makeId(length) {
  
  var result           = '';
  var characters       = '0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
  
  }