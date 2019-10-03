import jwt from 'jsonwebtoken';
import nconf from 'server/config';
import ioClient from 'socket.io-client';

export function socketClient(username, rooms) {
  const token = jwt.sign(
    { _rooms: rooms || [], _username: username },
    nconf.get('jwtCert'),
    { expiresIn: 60 * 60 * 60 }
  );
  const socketUrl = 'http://localhost:3005';
  const options = {
    forceNew: true,
    query: { token: token },
  };
  const socket = ioClient(socketUrl, options);

  const connectionPromise = new Promise((resolve, reject) => {
    socket.on('connect', () => { resolve(socket); });
  });
  return connectionPromise;
}
