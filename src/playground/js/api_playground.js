const api_form = document.getElementById('api-form');
const api_log = document.getElementById('api-log');
const api_log_clear = document.getElementById('api-log-clear');

async function handle_api_submit(event) {
  event.preventDefault();
  const request_data = JSON.stringify({
    title: 'notification',
    room: api_form.querySelector('[name="room"]').value,
    message: api_form.querySelector('[name="message"]').value,
  });
  const date = new Date();
  let response, response_status_code = '', response_data = '';
  try {
    response = await fetch('/api/notification/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: request_data,
    });
    response_status_code = response.status;
  } catch (e) {
    response_data = 'Failed to do request';
  }
  try {
    response_data = JSON.stringify(await response.json());
  } catch (e) {
    response_data = 'not JSON';
  }

  let li = document.createElement('li');
  li.innerHTML = `${date.toISOString()}<br />${request_data}<br />` +
    `${response_status_code}: ${response_data}`;
  api_log.insertBefore(li, api_log.firstChild);

  return false;
}

function clear_api_logs(event) {
  event.preventDefault();
  api_log.innerHTML = '';
}

export default function init_api_playground() {
  api_form.addEventListener('submit', handle_api_submit);
  api_log_clear.addEventListener('click', clear_api_logs);
}
