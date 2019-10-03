const message_list = document.getElementById('message-list');
const messages_clear = document.getElementById('messages-clear');

function handle_notification({ title, msg, type }) {
  const date = new Date;
  let li = document.createElement('li');
  li.innerHTML = `<div class="message">${msg}</div>` +
    `<div class="message-info">` +
    `${date.toISOString()}<br />` +
    `Title: ${title}<br />` +
    `Type: ${type}` +
    `</div>`
  message_list.insertBefore(li, message_list.firstChild);
}

function handle_clear_messages(event) {
  message_list.innerHTML = '';
}


export default function init_messages() {
  let globals = window.txio;
  globals.socket.on('notify', handle_notification);
  messages_clear.addEventListener('click', handle_clear_messages);
}
