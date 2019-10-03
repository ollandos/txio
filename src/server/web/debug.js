/*
 * Implements '/debug' routes
 */

import jwt from 'jsonwebtoken';
import express from 'express';

import nconf from 'server/config';
import TxServerIO from 'server/ioserver';

const debugRouter = express.Router();

debugRouter.get('/rooms/:socketId', async (req, res) => {
    const rooms = TxServerIO().socketGetRooms(req.params.socketId);
    res.json(rooms);
});

debugRouter.get('/rooms', async (req, res) => {
    const rooms = TxServerIO().socketGetRooms();
    res.json(rooms);
});

debugRouter.get('/token', (req, res) => {
    const cert = nconf.get('jwtCert');

    let rooms = req.query.rooms;
    if (typeof(rooms) == 'string') {
      rooms = [rooms];
    }
    const token = jwt.sign(
      {
        _rooms: rooms || [],
        _username: 'johnrose'
      },
      cert,
      {
        expiresIn: 60 * 60 * 60
      }
    )
    let data = {'token': token}
    res.json(data);
});


export default debugRouter
