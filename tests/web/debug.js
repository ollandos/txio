/* globals describe, it, afterEach */

import chai from 'chai';
import chaiHttp from 'chai-http';
import jwt from 'jsonwebtoken';
import sinon from 'sinon';

import { app, ioServer } from 'server';
import nconf from 'server/config';

chai.use(chaiHttp);
chai.should();

describe('/debug routes', () => {
  describe('GET /debug/rooms/:socketId', () => {
    afterEach(async () => {
      sinon.restore();
    });
    it('should get an empty list', async () => {
      const fakeSocketGetRooms = sinon.fake.returns([]);
      sinon.replace(ioServer, 'socketGetRooms', fakeSocketGetRooms);
      const res = await chai.request(app).get('/debug/rooms/noSocketId');
      res.should.have.status(200);
      res.body.should.eql([]);
      fakeSocketGetRooms.calledOnceWithExactly('noSocketId').should.be.true;
    });
    it('should get a non empty list', async () => {
      const fakeSocketGetRooms = sinon.fake.returns(['foo', 'bar']);
      sinon.replace(ioServer, 'socketGetRooms', fakeSocketGetRooms);
      const res = await chai.request(app).get('/debug/rooms/socketId');
      res.should.have.status(200);
      res.body.should.have.members(['foo', 'bar']);
      fakeSocketGetRooms.calledOnceWithExactly('socketId').should.be.true;
    });
  });
  describe('GET /debug/rooms', () => {
    afterEach(async () => {
      // The socket.io server requires some time to remove empty rooms.
      sinon.restore();
    });
    it('should get an empty list', async () => {
      const fakeSocketGetRooms = sinon.fake.returns([]);
      sinon.replace(ioServer, 'socketGetRooms', fakeSocketGetRooms);
      const res = await chai.request(app).get('/debug/rooms');
      res.should.have.status(200);
      res.body.should.eql([]);
      fakeSocketGetRooms.calledOnceWithExactly().should.be.true;
    });
    it('should get a non empty list', async () => {
      const fakeSocketGetRooms = sinon.fake.returns(['foo', 'bar']);
      sinon.replace(ioServer, 'socketGetRooms', fakeSocketGetRooms);
      const res = await chai.request(app).get('/debug/rooms/');
      res.should.have.status(200);
      res.body.should.have.members(['foo', 'bar']);
      fakeSocketGetRooms.calledOnceWithExactly().should.be.true;
    });
  });
  describe('GET /debug/token', () => {
    it('should get a token with default username and no rooms', async () => {
      const res = await chai.request(app).get('/debug/token');
      res.should.have.status(200);
      res.body.should.be.a('object');
      const decoded = jwt.verify(res.body.token, nconf.get('jwtCert'));
      decoded._username.should.eql('johnrose');
      decoded._rooms.should.eql([]);
    });
    it('should get a token with default username and one room', async () => {
      const res = await chai.request(app).get('/debug/token?rooms=foo');
      res.should.have.status(200);
      res.body.should.be.a('object');
      const decoded = jwt.verify(res.body.token, nconf.get('jwtCert'));
      decoded._username.should.eql('johnrose');
      decoded._rooms.should.eql(['foo']);
    });
    it('should get a token with default username and multiple rooms', async () => {
      const res = await chai.request(app).get('/debug/token?rooms=foo&rooms=bar');
      res.should.have.status(200);
      res.body.should.be.a('object');
      const decoded = jwt.verify(res.body.token, nconf.get('jwtCert'));
      decoded._username.should.eql('johnrose');
      decoded._rooms.should.eql(['foo', 'bar']);
    });
  });
});
