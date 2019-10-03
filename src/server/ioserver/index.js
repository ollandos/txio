import TxServerIO from 'server/ioserver/server.js'

let server;
export default (http) => {
    if (server) {
        return server
    }
    if (http == undefined) {
        throw Error('TxServerIO is not initialized');
    }
    server = new TxServerIO(http);
    return server;
}
