/*
 * Implements '/api' routes
 */

import express from 'express';
import TxServerIO from 'server/ioserver';

const apiRouter = express.Router();

apiRouter.post('/notification', async (req, res) => {
    console.log('in API', req.body);
    if ('event_name' in req.body &&
        'room' in req.body &&
        'message' in req.body) {
        const event_name = req.body.event_name;
        const room = req.body.room;
        const message = req.body.message;
        const notification_type = req.body.notification_type || 'info';
        const txserverio = TxServerIO();
        txserverio.notifyRoom(room, event_name, message, notification_type);
        res.status(202).json({ message: 'Notification accepted for processing'});
    } else {
        res.status(400).json({ message: 'Missing required parameters' });
    }
});

apiRouter.post('/room/:roomId/join', async (req, res) => {
    console.log('in API', req.body);
    if ('username' in req.body) {
        const room = req.params.roomId;
        const username = req.body.username;
        const txserverio = TxServerIO();
        txserverio.joinRoom(username, room);
        res.status(202).json({ message: '"Room join" accepted for processing'});
    } else {
        res.status(400).json({ message: 'Missing required parameters' });
    }
});

apiRouter.post('/room/:roomId/leave', async (req, res) => {
    console.log('in API', req.body);
    if ('username' in req.body) {
        const room = req.params.roomId;
        const username = req.body.username;
        const txserverio = TxServerIO();
        txserverio.leaveRoom(username, room);
        res.status(202).json({ message: '"Room leave" accepted for processing'});
    } else {
        res.status(400).json({ message: 'Missing required parameters' });
    }
});

export default apiRouter
