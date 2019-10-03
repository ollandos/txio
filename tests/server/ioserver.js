/* globals describe, it, beforeEach */
import 'server';
import chai from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';

import * as ioServerConstants from 'server/ioserver/constants';
import {socketClient} from '../utils.js';
import ioServer from 'server/ioserver';

chai.use(chaiHttp);
const should = chai.should();

const TxIoServer = ioServer();

function sleep(time) {
  const awake = new Promise((resolve) => { setTimeout(resolve, time); });
  return awake;
}

describe('TxIoServer', () => {
  describe('socketGetRooms(socketId)', () => {
    it('should get an empty list', async () => {
      const rooms = TxIoServer.socketGetRooms('radnomId');
      rooms.should.eql([]);
    });
    it('should get 1 user room and 1 socket room', async () => {
      const socket = await socketClient('foo');
      const rooms = TxIoServer.socketGetRooms(socket.id);
      rooms.should.eql([
        ioServerConstants.USER_ROOM_PREFIX + 'foo',
        socket.id
      ]);
      socket.close();
    });
    it('should get 1 user room, 1 socket room and 2 normal rooms', async () => {
      const socket = await socketClient('foo', ['foo', 'bar']);
      const socketOther = await socketClient('test', ['lol', 'lal']);
      const rooms = TxIoServer.socketGetRooms(socket.id);
      rooms.should.have.members([
        socket.id,
        ioServerConstants.USER_ROOM_PREFIX + 'foo',
        ioServerConstants.ROOM_PREFIX + 'foo',
        ioServerConstants.ROOM_PREFIX + 'bar'
      ]);
      socket.close();
      socketOther.close();
    });
  });
  describe('socketGetRooms()', () => {
    beforeEach(async () => {
      // The socket.io server requires some time to remove empty rooms.
      // So we add an 100ms sleep time.
      // Only required when accessing all rooms.
      await sleep(100);
    });
    it('should get an empty list', async () => {
      const rooms = TxIoServer.socketGetRooms();
      rooms.should.eql([]);
    });
    it('should get 1 user room and 1 socket room', async () => {
      const socket = await socketClient('foo');
      const rooms = TxIoServer.socketGetRooms();
      rooms.should.have.members([
        socket.id,
        ioServerConstants.USER_ROOM_PREFIX + 'foo'
      ]);
      socket.close();
    });
    it('should get 1 user room, 1 socket room and 2 normal rooms', async () => {
      const socket = await socketClient('foo', ['foo', 'bar']);
      const rooms = TxIoServer.socketGetRooms();
      rooms.should.have.members([
        socket.id,
        ioServerConstants.USER_ROOM_PREFIX + 'foo',
        ioServerConstants.ROOM_PREFIX + 'foo',
        ioServerConstants.ROOM_PREFIX + 'bar'
      ]);
      socket.close();
    });
    it('should get 2 user rooms, 2 socket rooms and 3 normal rooms', async () => {
      const socketFoo = await socketClient('foo', ['foo', 'bar']);
      const socketBar = await socketClient('bar', ['foo', 'baz']);
      const rooms = TxIoServer.socketGetRooms();
      rooms.should.have.members([
        socketFoo.id,
        socketBar.id,
        ioServerConstants.USER_ROOM_PREFIX + 'foo',
        ioServerConstants.USER_ROOM_PREFIX + 'bar',
        ioServerConstants.ROOM_PREFIX + 'foo',
        ioServerConstants.ROOM_PREFIX + 'bar',
        ioServerConstants.ROOM_PREFIX + 'baz'
      ]);
      socketBar.close();
      socketFoo.close();
    });
  });
  describe('joinRoom(username, room)', () => {
    it('should not fail for not existing username', async () => {
      try {
        TxIoServer.joinRoom('foo', 'bar');
      } catch (err) {
        should.fail('Should not fail for not existing username');
      }
    });
    it('1 socket should join the room', async () => {
      const socketFoo = await socketClient('foo');
      const socketBar = await socketClient('bar');
      TxIoServer.joinRoom('foo', 'test');
      let rooms = TxIoServer.socketGetRooms(socketFoo.id);
      rooms.should.have.members([
        socketFoo.id,
        ioServerConstants.USER_ROOM_PREFIX + 'foo',
        ioServerConstants.ROOM_PREFIX + 'test'
      ]);
      rooms = TxIoServer.socketGetRooms(socketBar.id);
      rooms.should.have.members([
        socketBar.id,
        ioServerConstants.USER_ROOM_PREFIX + 'bar'
      ]);
      socketFoo.close();
      socketBar.close();
    });
    it('2 sockets should join the room', async () => {
      const socketFoo1 = await socketClient('foo');
      const socketFoo2 = await socketClient('foo', ['baz']);
      const socketBar = await socketClient('bar');
      TxIoServer.joinRoom('foo', 'test');
      // socketFoo1
      let rooms = TxIoServer.socketGetRooms(socketFoo1.id);
      rooms.should.have.members([
        socketFoo1.id,
        ioServerConstants.USER_ROOM_PREFIX + 'foo',
        ioServerConstants.ROOM_PREFIX + 'test'
      ]);
      // socketFoo2
      rooms = TxIoServer.socketGetRooms(socketFoo2.id);
      rooms.should.have.members([
        socketFoo2.id,
        ioServerConstants.USER_ROOM_PREFIX + 'foo',
        ioServerConstants.ROOM_PREFIX + 'baz',
        ioServerConstants.ROOM_PREFIX + 'test'
      ]);
      // socketBar
      rooms = TxIoServer.socketGetRooms(socketBar.id);
      rooms.should.have.members([
        socketBar.id, ioServerConstants.USER_ROOM_PREFIX + 'bar'
      ]);
      socketFoo1.close();
      socketFoo2.close();
      socketBar.close();
    });
  });
  describe('leaveRoom(username, room)', () => {
    it('should not fail for not existing username', async () => {
      try {
        TxIoServer.leaveRoom('foo', 'bar');
      } catch (err) {
        should.fail('Should not fail for not existing username');
      }
    });
    it('1 socket should leave the room', async () => {
      const socketFoo = await socketClient('foo', ['bar']);
      const socketBar = await socketClient('bar', ['bar']);
      TxIoServer.leaveRoom('foo', 'bar');
      let rooms = TxIoServer.socketGetRooms(socketFoo.id);
      rooms.should.have.members([
        socketFoo.id,
        ioServerConstants.USER_ROOM_PREFIX + 'foo'
      ]);
      rooms = TxIoServer.socketGetRooms(socketBar.id);
      rooms.should.have.members([
        socketBar.id,
        ioServerConstants.USER_ROOM_PREFIX + 'bar',
        ioServerConstants.ROOM_PREFIX + 'bar'
      ]);
      socketFoo.close();
      socketBar.close();
    });
    it('2 sockets should leave the room', async () => {
      const socketFoo1 = await socketClient('foo', ['baz']);
      const socketFoo2 = await socketClient('foo', ['baz', 'fuz']);
      const socketBar = await socketClient('bar', ['baz']);
      TxIoServer.leaveRoom('foo', 'baz');
      // socketFoo1
      let rooms = TxIoServer.socketGetRooms(socketFoo1.id);
      rooms.should.have.members([
        socketFoo1.id,
        ioServerConstants.USER_ROOM_PREFIX + 'foo'
      ]);
      // socketFoo2
      rooms = TxIoServer.socketGetRooms(socketFoo2.id);
      rooms.should.have.members([
        socketFoo2.id,
        ioServerConstants.USER_ROOM_PREFIX + 'foo',
        ioServerConstants.ROOM_PREFIX + 'fuz'
      ]);
      // socketBar
      rooms = TxIoServer.socketGetRooms(socketBar.id);
      rooms.should.have.members([
        socketBar.id,
        ioServerConstants.USER_ROOM_PREFIX + 'bar',
        ioServerConstants.ROOM_PREFIX + 'baz'
      ]);
      socketFoo1.close();
      socketFoo2.close();
      socketBar.close();
    });
  });
  describe('notifyRoom(roomName, title, message type)', () => {
    it('should notify only sockets in the room', async () => {
      const socketFooA = await socketClient('foo', ['roomA']);
      const socketFooB = await socketClient('bar', ['roomA', 'roomB']);
      const socketBar = await socketClient('baz', ['roomB']);

      const stubFooA = sinon.fake();
      const stubFooB = sinon.fake();
      const stubBar = sinon.fake();

      const promiseFooA = new Promise((resolve, reject) => {
        socketFooA.on(ioServerConstants.EVENT_NOTIFICATION, (data) => {
          stubFooA(data);
          resolve();
        });
      });
      const promiseFooB = new Promise((resolve, reject) => {
        socketFooB.on(ioServerConstants.EVENT_NOTIFICATION, (data) => {
          stubFooB(data);
          resolve();
        });
      });
      const promiseBar = new Promise((resolve, reject) => {
        socketBar.on(ioServerConstants.EVENT_NOTIFICATION, (data) => {
          stubBar(data);
          resolve();
        });
      });

      TxIoServer.notifyRoom('roomA', 'A', 'AA', 'info');
      TxIoServer.notifyRoom('roomB', 'B', 'BB', 'warning');
      await Promise.all([promiseFooA, promiseFooB, promiseBar]);

      stubFooA.calledOnceWithExactly(
        {title: 'A', message: 'AA', type: 'info'}
      ).should.be.true;

      stubFooB.calledTwice.should.be.true;
      stubFooB.getCall(0).calledWithExactly(
        {title: 'A', message: 'AA', type: 'info'}
      ).should.be.true;
      stubFooB.getCall(1).calledWithExactly(
        {title: 'B', message: 'BB', type: 'warning'}
      ).should.be.true;

      stubBar.calledOnceWithExactly(
        {title: 'B', message: 'BB', type: 'warning'}
      ).should.be.true;
    });
  });
});
