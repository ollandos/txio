// Import the dependencies for testing
import chai from 'chai';
import chaiHttp from 'chai-http';
import jwt from 'jsonwebtoken';

import { app } from 'server';
import nconf from 'server/config';

// Configure chai
chai.use(chaiHttp);
chai.should();

describe('/debug routes', () => {
    describe('GET /debug/rooms', () => {
        it('should get an empty list', (done) => {
             chai.request(app)
                 .get('/debug/rooms')
                 .end((err, res) => {
                     res.should.have.status(200);
                     res.body.should.eql([]);
                     done();
                  });
         });
    });
    describe('GET /debug/token', () => {
       it('should get a token with default username and no rooms', (done) => {
            chai.request(app)
            .get('/debug/token')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                const decoded = jwt.verify(res.body.token, nconf.get('jwtCert'));
                decoded._username.should.eql('johnrose')
                decoded._rooms.should.eql([])
                done();
            });

       });
       it('should get a token with default username and one room', (done) => {
            chai.request(app)
            .get('/debug/token?rooms=foo')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                const decoded = jwt.verify(res.body.token, nconf.get('jwtCert'));
                decoded._username.should.eql('johnrose')
                decoded._rooms.should.eql(['foo'])
                done();
            });
        });
       it('should get a token with default username and multiple rooms', (done) => {
            chai.request(app)
            .get('/debug/token?rooms=foo&rooms=bar')
            .end((err, res) => {
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
