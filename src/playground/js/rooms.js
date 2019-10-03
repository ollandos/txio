import { get_jwt, reset_rooms } from './utils';

const room_form = document.getElementById('room-form');
const room_list = document.getElementById('room-list');

async function handle_room_delete_click(event) {
  let globals = window.txio;
  const button = event.currentTarget;
  const room = button.value;
  globals.rooms = globals.rooms.filter((item) => item != room);
  await get_jwt();
  reset_rooms();
  const li = button.parentNode;

  li.parentNode.removeChild(li);
}

async function handle_room_form_submit(event) {
  let globals = window.txio;
  event.preventDefault();
  const room_input = room_form.querySelector('input[name="room"]');
  const room = room_input.value.trim();
  if (! room.trim() || globals.rooms.indexOf(room) != -1) {
    room_input.value = '';
    return false;
  }

  globals.rooms.push(room);
  await get_jwt();
  reset_rooms();

  room_input.value = '';
  let li = document.createElement('li');
  li.innerHTML = `<button value="${room}">✗</button> ${room}`
  room_list.appendChild(li);
  li.querySelector('button').
    addEventListener('click', handle_room_delete_click);
}

export default function init_rooms() {
  room_form.addEventListener('submit', handle_room_form_submit);
}
