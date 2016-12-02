var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));
server.listen(process.env.PORT || 3000);
var mang = [];
var mangSocket = [];
app.get('/', function(req, res){
  res.render('home');
});

io.on('connection', function(socket){

  socket.emit('LIST_USERNAME', mang);
  console.log('Co nguoi ket noi');
  mangSocket.push(socket);

  socket.on('NEW_USERNAME', function(data) {
    if(mang.indexOf(data) == -1){
      socket.username = data;
      mang.push(data);
      socket.emit('XAC_NHAN_DANG_KY', 1);
      io.emit('NGUOI_DUNG_MOI', data);
      console.log('Dang ky thanh cong');
    }else{
      socket.emit('XAC_NHAN_DANG_KY', 0);
      console.log('Dang ky that bai');
    }
  })

  socket.on('PRIVATE_MESSAGE', function(data) {
    var desSocket = mangSocket.find(function(e){
      return e.username == data.username;
    });
    desSocket.emit('GOT_PRIVATE_MESSAGE', data.message);
  })

  socket.on('disconnect', function(){
    var index = mang.indexOf(socket.username);
    mang.splice(index, 1);
    io.emit('NGUOI_DUNG_DANG_XUAT', socket.username);
  });

  socket.on('NEW_MESSAGE', function(data){
    io.emit('SERVER_SEND_MESSAGE', `${socket.username}: ${data}`);
  });
});
