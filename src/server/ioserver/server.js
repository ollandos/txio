import nconf from 'server/config';
import jwt from 'jsonwebtoken';

import ServerIO from 'socket.io';
import ioredis from 'socket.io-redis';

import * as constants from 'server/ioserver/constants';

const jwtCert = nconf.get('jwtCert');

/**
 * Socket event `EVENT_RESET_ROOMS` callback.
 * Given a JWT token the server reset the socket's rooms.
 * @param {Socket} socket - The socket sending the event `EVENT_RESET_ROOMS`s
 * @param {string} token - The JWT token send as part of the event.
 */
function eventResetRooms(socket, token) {
  let decoded;
  try {
    decoded = jwt.verify(token, jwtCert);
  } catch (err) {
    console.log('JWT re auth failed: ', token, err);
    return;
  }
  let roomNames = Object.keys(socket.rooms) || [];
  roomNames.forEach((roomName, index) => {
    if (socket.id != roomName) socket.leave(constants.ROOM_PREFIX + roomName);
  });
  roomNames = decoded._rooms || [];
  roomNames.forEach((roomName, index) => {
    socket.join(constants.ROOM_PREFIX + roomName);
  });
}

export default class TxServerIO {
  constructor(httpServer) {
    this.io = ServerIO(httpServer);
    // Redis adapter for cluster
    if (nconf.get('useRedisAdapter')) {
      this.io.adapter(
        ioredis({
          host: nconf.get('redisHost'),
          port: nconf.get('redisPort'),
        })
      );
    }
    this.io.use(this._socketAuth);
    this.io.on('connection', this._socketInit);
  }

  /**
   * Send a notification to a specific room.
   * @param {string} room - The room to send the notification to.
   * @param {string} title - The title of the notification.
   * @param {string} message - The notification's message.
   * @param {string} type - The type of the notification.
   */
  notifyRoom(room, title, message, type) {
    const roomName = constants.ROOM_PREFIX + room;
    this.io.of('/').to(roomName).emit(
      constants.EVENT_NOTIFICATION,
      { title: title, message: message, type: type }
    );
  }

  /**
   * Send a notification to a specific user.
   * @param {string} username - The user to send the notification to.
   * @param {string} title - The title of the notification.
   * @param {string} message - The notification's message.
   * @param {string} type - The type of the notification.
   */
  notifyUser(username, title, message, type) {
    const userRoom = constants.USER_ROOM_PREFIX + username;
    this.io.of('/').to(userRoom).emit(
      constants.EVENT_NOTIFICATION,
      { title: title, message: message, type: type }
    );
  }

  /**
   * Have a user to join a specific room.
   * @param {string} username - The user's username.
   * @param {number} room - The room to join.
   */
  joinRoom(username, room) {
    const userRoomName = constants.USER_ROOM_PREFIX + username;
    const userRoom = this.io.of('/').adapter.rooms[userRoomName];
    if (userRoom) {
      Object.keys(userRoom.sockets).forEach((socketId, index) => {
        this.io.of('/').connected[socketId].join(constants.ROOM_PREFIX + room);
      });
      this.io.to(userRoom).emit(constants.JOIN_ROOM_EVENT, room);
      // console.log('User', username, 'joined room', room);
    }
  }

  /**
   * Have a user to leave a specific room.
   * @param {string} username - The user's username.
   * @param {number} room - The room to leave.
   */
  leaveRoom(username, room) {
    const userRoomName = constants.USER_ROOM_PREFIX + username;
    const userRoom = this.io.of('/').adapter.rooms[userRoomName];
    if (userRoom) {
      Object.keys(userRoom.sockets).forEach((socketId, index) => {
        this.io.of('/').connected[socketId].leave(constants.ROOM_PREFIX + room);
      });
      this.io.to(userRoom).emit(constants.LEAVE_ROOM_EVENT, room);
      // console.log('User', username, 'left room', room);
    }
  }

  /**
   * Get a list of all the available rooms.
   * If a socketId is provided only the socket's rooms will be returned.
   * @param {string} [socketId] - The the unique id of the socket.
   * @return {list} The room names.
   */
  socketGetRooms(socketId) {
    let rooms;
    if (socketId) {
      rooms = this.io.of('/').adapter.sids[socketId];
      rooms = rooms ? Object.keys(rooms) : [];
    } else {
      rooms = Object.keys(this.io.of('/').adapter.rooms);
    }
    return rooms;
  }

  /**
   * Initialize a 'socket.io' socket by adding event listeners.
   * @param {Socket} socket - The socket to initialize.
   */
  _socketInit(socket) {
    socket.on('disconnect', () => { });
    socket.on('reset_rooms', (token) => {
      eventResetRooms(socket, token);
    });
  }

  /**
   * JWT Auth middleware for 'socket.io'.
   * @param {Socket} socket - The socket to initialize.
   * @param {function} next - The callback fuction.
   */
  _socketAuth(socket, next) {
    const token = socket.handshake.query.token;
    if (token == undefined) {
      const msg = 'No JWT token provided';
      console.log(msg);
      return next(new Error(msg));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, jwtCert);
    } catch (err) {
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
