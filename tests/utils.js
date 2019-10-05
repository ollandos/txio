import jwt from 'jsonwebtoken';
import nconf from 'server/config';
import ioClient from 'socket.io-client';

export function socketClients(usernames, rooms, callback, sockets) {
    if ( !sockets ) sockets = {};

    const username = usernames.pop();
    if ( !username ) return callback(sockets);

    const socket = socketClient(username, rooms.pop());

    if ( !sockets[username] ) sockets[username] = [];
    sockets[username].push(socket);
    socket.on('connect', () => {
        socketClients(usernames, rooms, callback, sockets);
    });
}

function socketClient(username, rooms) {
    const token = jwt.sign(
        { _rooms: rooms || [], _username: username },
        nconf.get('jwtCert'),
        { expiresIn: 60 * 60 * 60 }
    )
    const socketUrl = "http://localhost:3005";
    const options = {
        // transports: ['websocket'],
        'forceNew': true,
        query: {
            token: token
        }
    };
    const client = ioClient(socketUrl, options);
    return client;
}

export { socketClient }
