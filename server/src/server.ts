import * as express from 'express';
import { pubRouter, authRoutes } from './routes/user.routes';
import indexRoutes from './routes/index';
import caseRouter from './routes/case.routes';
import * as passport from 'passport';
import * as i18n from 'i18n';
import * as bodyParser from 'body-parser';
import * as socket from 'socket.io';
import adminRouter from './routes/admin.routes';
//import { SocketNotify } from './services/socket.service';

var path = require('path');

const app = express();

app.all("/*", function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization, Content-Length, X-Requested-With');
  next();
});

//Passport initialize
app.use(passport.initialize());

//Body parser
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//i18 configurations
i18n.configure({
  // setup some locales - other locales default to en silently
  locales: ['en', 'da', 'fr'],

  // where to store json files - defaults to './locales'
  directory: __dirname + '/locales',

  // enable object notation
  objectNotation: true,

  // you may alter a site wide default locale
  defaultLocale: 'en'
});

app.use(i18n.init);

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`server listening on port ${port}`);
});


app.use((req, res, next) => {
  console.log(' ------>>>>>> new request for %s', req.originalUrl);
  if (req.originalUrl.indexOf('/api/v1') >= 0) {
    return next(); 
  } else if (req.originalUrl.indexOf('/api/pub') >= 0) {
    return next();
  } else if (req.originalUrl.indexOf('/api-docs') >= 0 || req.originalUrl.indexOf('/swagger.json') >= 0) {
    return next();
  } else if (req.originalUrl.indexOf('/api/v1/admin') >= 0) {
    return next();
  } else if (req.originalUrl.indexOf('/api') >= 0) {
    // require auth
  } else if (req.originalUrl.indexOf('/admin') >= 0) {
    const directoryPath = path.join(__dirname, "admin");
    if (req.path.endsWith(".js") ||
      req.path == "/favicon.ico" ||
      req.path.endsWith("js.map") ||
      req.path.startsWith("/assets") || 
      req.path.endsWith(".scss") || 
      req.path.endsWith(".css") || 
      req.path.endsWith(".png") ||
      req.path.endsWith(".jpg")) {
      res.sendFile(path.join(directoryPath + req.path));
    }
    else {
      res.sendFile(path.join(directoryPath + "/index.html"));
    }

    return;
  } else {
    const directoryPath = path.join(__dirname, "client");
    if (req.path.endsWith(".js") ||
      req.path == "/favicon.ico" ||
      req.path.endsWith("js.map") ||
      req.path.startsWith("/assets") || 
      req.path.endsWith(".scss") || 
      req.path.endsWith(".css") || 
      req.path.endsWith(".png") ||
      req.path.endsWith(".jpg")) {
      res.sendFile(path.join(directoryPath + req.path));
    }
    else {
      res.sendFile(path.join(directoryPath + "/index.html"));
    }

    return;
  }
});
//socket connect
// export var io = socket.listen(server);
// let socketService: SocketNotify = new SocketNotify();
// socketService.initializeConnection();

// setup routes
app.use('/', indexRoutes);   //Public
app.use('/api/v1/auth', authRoutes);   //Authenticated
app.use('/api/v1/pub', pubRouter);  //Public
app.use('/api/v1', caseRouter); //Cases edit
app.use('/api/v1/admin', adminRouter);
