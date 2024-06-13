const http = require('http')
const express = require('express')
const path = require('path')
const logger = require('morgan')
const helmet = require('helmet')
const routers = require('./routes/index')

const app = express()

const server = http.createServer(app)

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.set('port', process.env.PORT || '3000')

// 完善http头部，提高安全性
app.use(helmet())
// 日志中间件
app.use(logger('dev'))
// parse application/json，express@4.16.0内置，替代了 body-parser
app.use(express.json())
// parse application/x-www-form-urlencoded，替代了 body-parser
app.use(express.urlencoded({ extended: false }))
// 解析得到 req.cookies
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')))
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'accept, origin, X-Requested-With, content-type, token, userId'
  )
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Content-Type', 'application/json;charset=utf-8')
  res.header('Access-Control-Allow-Credentials', 'true')
  next()
})
// 路由中间件
routers(app)

server.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'))
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
