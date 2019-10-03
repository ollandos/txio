import 'regenerator-runtime/runtime';

import express from 'express';
import httpServer from 'http';

import nconf from 'server/config';
import TxServerIO from 'server/ioserver';

import authMiddleWare from 'server/web/auth';
import apiRouter from 'server/web/api';
import debugRouter from 'server/web/debug';

const app = express();
const http = httpServer.createServer(app);

// Initialize socket.io server
const ioServer = TxServerIO(http);

app.use(express.json());

if (nconf.get('useApiAuth')) app.use('/api', authMiddleWare);
app.use('/api', apiRouter);

if (nconf.get('debug')) {
  app.use('/debug', debugRouter);
  app.get('/', function(req, res) {
    res.sendFile(process.cwd() + '/dist/playground/index.html');
  });
  app.get('/index.js', (req, res) => {
    res.sendFile(process.cwd() + '/dist/playground/index.js');
  });
}

http.listen(3005, function() {
  console.log('listening on *:3005');
});

export { app, ioServer };
