import nconf from 'nconf'

nconf.file({file: process.cwd() + '/config.json'});

export default nconf
