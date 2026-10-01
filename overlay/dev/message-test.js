(() => {
  const output = document.getElementById('message-test-output');
  const count = document.getElementById('message-test-count');
  if (!output || !count || !RTS.core.messaging) return;

  let sequence = 0;
  const queue = RTS.core.messaging.create('dev-test', {
    present(message, finish) {
      output.textContent = message.text;
      output.classList.add('message-test-output--active');
      count.textContent = 'Showing ' + message.text;

      setTimeout(() => {
        output.classList.remove('message-test-output--active');
        output.classList.add('message-test-output--finished');
        setTimeout(() => {
          output.classList.remove('message-test-output--finished');
          finish();
        }, 400);
      }, message.duration);
    },

    finished() {
      updateCount();
    }
  });

  const updateCount = () => {
    count.textContent = queue.isActive()
      ? 'Active message - ' + queue.size() + ' waiting'
      : queue.size() + ' waiting';
  };

  document.getElementById('message-enqueue')?.addEventListener('click', () => {
    sequence++;
    queue.enqueue({
      text: 'Message ' + sequence,
      duration: 1000
    });
    updateCount();
  });

  document.getElementById('message-clear')?.addEventListener('click', () => {
    queue.clear();
    output.classList.remove(
      'message-test-output--active',
      'message-test-output--finished'
    );
    output.textContent = 'Queue cleared';
    updateCount();
  });

  updateCount();
})();
