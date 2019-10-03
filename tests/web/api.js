/* globals describe, it, after, before */

import chai from 'chai';
import chaiHttp from 'chai-http';

import { app } from 'server';
import * as ioServerConstants from 'server/ioserver/constants';
import {socketClient} from '../utils.js';

chai.use(chaiHttp);
const should = chai.should();

describe('/api routes', () => {
  describe('POST /api/notification', () => {
    var socketFoo;
    var socketBar;
    before(async () => {
      socketFoo = await socketClient('foo', ['foo', 'bar']);
      socketBar = await socketClient('bar', ['foo', 'baz']);
    });
    after(async () => {
      socketFoo.close();
      socketBar.close();
    });
    it('should notify the 2 sockets in the room', async () => {
      const sendData = {
        type: 'info', room: 'foo', title: 'My title', message: 'Hello all',
      };
      const assertData = {
        type: 'info', title: 'My title', message: 'Hello all',
      };
      socketFoo.once(ioServerConstants.EVENT_NOTIFICATION, (data) => {
        data.should.eql(assertData);
      });
      socketBar.once(ioServerConstants.EVENT_NOTIFICATION, (data) => {
        data.should.eql(assertData);
      });
      const res = await chai.request(app).post(
        '/api/notification'
      ).type('json').send(sendData);
      res.should.have.status(202);
      res.body.should.eql({ message: 'Accepted' });
    });
    it('should notify the 1 socket in the room', async () => {
      const sendData = {
        type: 'info', room: 'bar', title: 'My title', message: 'Hello all',
      };
      const assertData = {
        type: 'info', title: 'My title', message: 'Hello all',
      };
      socketFoo.once(ioServerConstants.EVENT_NOTIFICATION, (data) => {
        data.should.eql(assertData);
      });
      socketBar.once(ioServerConstants.EVENT_NOTIFICATION, (data) => {
        should.fail('socketBar should not receive emit');
      });
      const res = await chai.request(app).post(
        '/api/notification'
      ).type('json').send(sendData);
      res.should.have.status(202);
      res.body.should.eql({ message: 'Accepted' });
    });
  });
});
