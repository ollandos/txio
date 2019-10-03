import nconf from 'server/config';
import jwt from 'jsonwebtoken';

import ServerIO from 'socket.io'
import ioredis from 'socket.io-redis';

import * as constants from 'server/ioserver/constants'

const jwtCert = nconf.get('jwtCert');

function eventResetRooms(socket, token) {
    let decoded;
    try {
        decoded = jwt.verify(token, jwtCert);
    } catch(err) {
        console.log('JWT re auth failed: ', token, err);
        return
    }

    let roomNames = Object.keys(socket.rooms) || [];
    roomNames.forEach((roomName, index) => {
        if (socket.id != roomName) socket.leave(constants.ROOM_PREFIX + roomName);
    })

    roomNames = decoded._rooms || [];
    roomNames.forEach((roomName, index) => {
        socket.join(constants.ROOM_PREFIX + roomName);
    });
}

export default class TxServerIO {
    constructor(server) {
        this.io = ServerIO(server);
        // Redis adapter for cluster
        if (nconf.get('useRedisAdapter')) {
            this.io.adapter(
                ioredis({
                    host: nconf.get('redisHost'),
                    port: nconf.get('redisPort')
                })
            );
        }
        this.io.use(this._socketAuth);
        this.io.on('connection', this._socketInit);
    }

    notifyRoom(room, title, message, type) {
        const roomName = constants.ROOM_PREFIX + room
        this.io.of('/').to(roomName).emit(
            constants.NOTIFICATION_EVENT,
            {
                title: title,
                msg: message,
                type: type
            }
        )
    }

    joinRoom(username, room) {
        const userRoom = constants.USER_ROOM_PREFIX + username
        const sockets = this.io.of('/').adapter.rooms[userRoom].sockets
        if (sockets) {
            Object.keys(sockets).forEach(
                (socketId, index) => {
                    this.io.of('/').connected[socketId].join(constants.ROOM_PREFIX + room)
                }
            )
            this.io.to(userRoom).emit(constants.JOIN_ROOM_EVENT, room);
            console.log('User', username, 'joined room', room);
        }
    }

    leaveRoom(username, room) {
        const userRoom = constants.USER_ROOM_PREFIX + username
        const sockets = this.io.of('/').adapter.rooms[userRoom].sockets
        if (sockets) {
            Object.keys(sockets).forEach(
                (socketId, index) => {
                    this.io.of('/').connected[socketId].leave(constants.ROOM_PREFIX + room)
                }
            )
            this.io.to(userRoom).emit(constants.JOIN_ROOM_EVENT, room);
            console.log('User', username, 'left room', room);
        }
    }

    socketGetRooms(socketId) {
        let rooms;
        if (socketId) {
            rooms = this.io.of('/').adapter.sids[socketId];
            if (rooms) rooms = Object.keys(rooms);
        }
        else {
            rooms = Object.keys(this.io.of('/').adapter.rooms)
        }
        return rooms
    }

    _socketInit(socket) {
        socket.on('disconnect',
            () => { console.log('user disconnected');
        });
        socket.on('reset_rooms',
            (token) => { eventResetRooms(socket, token) }
        );
    }

    _socketAuth (socket, next) {
        const token = socket.handshake.query.token;
        if (token == undefined) {
            const msg = 'No JWT token provided';
            console.log(msg);
            return next(new Error(msg));
        }

        let decoded;
        try {
            decoded = jwt.verify(token, jwtCert);
        } catch(err) {
            const msg = 'JWT auth failed';
            console.log(msg);
            return next(new Error(msg));
        }

        const roomNames = decoded._rooms || [];
        const userRoom = constants.USER_ROOM_PREFIX + decoded._username;
        socket.join(userRoom);
        roomNames.forEach((roomName, index) => {
            socket.join(constants.ROOM_PREFIX + roomName);
        });
        return next();
    }
}
