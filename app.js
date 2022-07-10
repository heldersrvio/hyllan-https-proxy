const createError = require('http-errors');
const express = require('express');
const fileUpload = require('express-fileupload');
const logger = require('morgan');

const indexRouter = require('./routes/index');

const app = express();

app.use(fileUpload({
	createParentPath: true
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', indexRouter);

app.use((_req, _res, next) => {
	next(createError(404));
});

app.use((err, req, res, _next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
});

module.exports = app;
