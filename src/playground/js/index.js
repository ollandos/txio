let globals = window.txio = {socket: null, token: null, rooms: []};

import io from 'socket.io-client';

import css from '../style.css';

import init_api_playground from './api_playground';
import init_rooms from './rooms';
import init_messages from './messages';
import { get_jwt } from './utils';

async function init() {
  init_api_playground();
  await get_jwt();
  globals.socket = io({query: { token: globals.token }});
  init_rooms();
  globals.socket.on('connect', () => {
    document.getElementById('socket-id').textContent = globals.socket.id;
    init_messages();
  });
}

init();
