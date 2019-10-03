/*
 * Implements '/api' routes
 */

import express from 'express';
import TxServerIO from 'server/ioserver';

const apiRouter = express.Router();

apiRouter.post('/notification', async (req, res) => {
  if ('title' in req.body && 'room' in req.body && 'message' in req.body) {
    const notification_type = req.body.notification_type || 'info';
    const txserverio = TxServerIO();
    txserverio.notifyRoom(
      req.body.room,
      req.body.title,
      req.body.message,
      notification_type
    );
    res.status(202).json({ message: 'Accepted' });
  } else {
    res.status(400).json({ message: 'Missing required parameters' });
  }
});

apiRouter.post('/room/:roomId/join', async (req, res) => {
  if ('username' in req.body) {
    const room = req.params.roomId;
    const username = req.body.username;
    const txserverio = TxServerIO();
    txserverio.joinRoom(username, room);
    res.status(202).json({ message: '"Room join" accepted for processing' });
  } else {
    res.status(400).json({ message: 'Missing required parameters' });
  }
});

apiRouter.post('/room/:roomId/leave', async (req, res) => {
  if ('username' in req.body) {
    const room = req.params.roomId;
    const username = req.body.username;
    const txserverio = TxServerIO();
    txserverio.leaveRoom(username, room);
    res.status(202).json({ message: '"Room leave" accepted for processing' });
  } else {
    res.status(400).json({ message: 'Missing required parameters' });
  }
});

export default apiRouter;
