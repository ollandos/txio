/* globals describe, it */

import chai from 'chai';
import chaiHttp from 'chai-http';
import jwt from 'jsonwebtoken';

import { app } from 'server';
import nconf from 'server/config';
import * as ioServerConstants from 'server/ioserver/constants';
import {socketClient} from '../utils.js';

chai.use(chaiHttp);
const should = chai.should();

describe('/debug routes', () => {
  describe('GET /debug/rooms', () => {
    it('should get an empty list', (done) => {
      chai.request(app).get('/debug/rooms').end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.eql([]);
      });
      done();
    });
    it('should get 1 user room and 1 socket room', (done) => {
      const socket = socketClient('foo');
      socket.on('connect', () => {
        chai.request(app).get('/debug/rooms').end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.have.members([
            socket.id,
            ioServerConstants.USER_ROOM_PREFIX + 'foo'
          ]);
          socket.close();
          done();
        });
      });
    });
    it('should get 1 user room, 1 socket room and 2 normal rooms', (done) => {
      const socket = socketClient('foo', ['foo', 'bar']);
      socket.on('connect', () => {
        const socketId = socket.id;
        chai.request(app).get('/debug/rooms').end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.have.members([
            socketId,
            ioServerConstants.USER_ROOM_PREFIX + 'foo',
            ioServerConstants.ROOM_PREFIX + 'foo',
            ioServerConstants.ROOM_PREFIX + 'bar'
          ]);
        });
        socket.close();
        done();
      });
    });
    it('should get 2 user rooms, 2 socket rooms and 3 normal rooms', (done) => {
      const socketFoo = socketClient('foo', ['foo', 'bar']);
      socketFoo.on('connect', () => {
        const socketFooId = socketFoo.id;
        const socketBar = socketClient('bar', ['foo', 'baz']);
        socketBar.on('connect', () => {
          const socketBarId = socketBar.id;
          chai.request(app).get('/debug/rooms').end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.have.members([
              socketFooId,
              socketBarId,
              ioServerConstants.USER_ROOM_PREFIX + 'foo',
              ioServerConstants.USER_ROOM_PREFIX + 'bar',
              ioServerConstants.ROOM_PREFIX + 'foo',
              ioServerConstants.ROOM_PREFIX + 'bar',
              ioServerConstants.ROOM_PREFIX + 'baz'
            ]);
            socketBar.close();
            socketFoo.close();
            done();
          });
        });
      });
    });
  });
  describe('GET /debug/token', () => {
    it('should get a token with default username and no rooms', (done) => {
      chai.request(app).get('/debug/token').end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.be.a('object');
        const decoded = jwt.verify(res.body.token, nconf.get('jwtCert'));
        decoded._username.should.eql('johnrose')
        decoded._rooms.should.eql([])
        done();
      });
    });
    it('should get a token with default username and one room', (done) => {
      chai.request(app).get('/debug/token?rooms=foo').end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.be.a('object');
        const decoded = jwt.verify(res.body.token, nconf.get('jwtCert'));
        decoded._username.should.eql('johnrose')
        decoded._rooms.should.eql(['foo'])
        done();
      });
    });
    it('should get a token with default username and multiple rooms', (done) => {
      chai.request(app).get(
        '/debug/token?rooms=foo&rooms=bar'
      ).end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.be.a('object');
        const decoded = jwt.verify(res.body.token, nconf.get('jwtCert'));
        decoded._username.should.eql('johnrose')
        decoded._rooms.should.eql(['foo', 'bar'])
        done();
      });
    });
  });
});
