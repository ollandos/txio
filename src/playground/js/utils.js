export async function get_jwt() {
  let globals = window.txio;
  let url;
  if (globals.rooms.length) {
    const params = globals.rooms.map((room) => `rooms=${room}`).join('&');
    url = `/debug/token?${params}`;
  } else {
    url = '/debug/token';
  }
  const response = await fetch(url);
  const data = await response.json();
  globals.token = data.token;
}

export function reset_rooms() {
  let globals = window.txio;
  globals.socket.emit('reset_rooms', globals.token);
}
