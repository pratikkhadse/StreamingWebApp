var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  // next(createError(404));
  next();
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const http = require("http");
const server = http.createServer(app);

const io = require("socket.io")(server);
app.use(express.static(__dirname + "/public"));

hostUsers = {};
activeHosts = [];

io.on('connection', function (socket) {

  socket.on('main-page', function () {
    socket.emit('active-host', activeHosts);
  });

  socket.on('host-connect', function (data) {
    if (!hostUsers.hasOwnProperty(socket.id)) {
      hostUsers[socket.id] = data;
      activeHosts.push(data);
    }
    console.log('host-connect');
    console.log(activeHosts)
    socket.broadcast.emit('active-host', activeHosts);
  });

  socket.on('host-disconnect', function (data) {
    // if (!hostUsers.hasOwnProperty(socket.id)) {
    //   hostUsers[socket.id] = data;
    //   activeHosts.push(hostUsers[socket.id]);
    // }

    var ind = activeHosts.indexOf(data);
    if(ind != -1){
      activeHosts.splice(ind, 1)
    }
    console.log('host-disconnect');
    console.log(activeHosts)
    socket.broadcast.emit('active-host', activeHosts);
  });

  socket.on('join-room', function(room){
    socket.join(room);
  });

  socket.on('host-live', function () {
    // activeHosts[socket.id] = hostUsers[socket.id];
    activeHosts.push(hostUsers[socket.id]);
  });

  // socket.on('active-host', function () {
  //   socket.to(socket.id).emit('active-list', activeHosts);
  // });

  socket.on('host-end', function () {
    // delete activeHosts[socket.id];
    var ind = activeHosts.indexOf(hostUsers[socket.id]);
    if (ind != -1)
      activeHosts.splice(ind, 1);
    console.log(activeHosts);
  });

  socket.on('stream', function (image) {
    // socket.broadcast.emit('stream', image);
    socket.broadcast.to(hostUsers[socket.id]).emit('stream', image);
  });

  socket.on('disconnect', function () {
    var ind = activeHosts.indexOf(hostUsers[socket.id]);
    // delete activeHosts[socket.id];
    if (ind != -1)
      activeHosts.splice(ind, 1);
    delete hostUsers[socket.id];
    console.log('disconnected');
    console.log(hostUsers);
    console.log(activeHosts);
  });

});

io.sockets.on("error", e => console.log(e));
server.listen(3000, () => console.log(`Server is running on port 3000`));

