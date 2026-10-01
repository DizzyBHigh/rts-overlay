(() => {
  const output = document.getElementById('message-test-output');
  if (!output || !RTS.core.messaging) return;

  const queue = RTS.core.messaging.create('dev-test', {
    present(message, finish) {
      output.textContent = message.text;
      setTimeout(finish, message.duration);
    },
    finished(message) {
      output.dataset.lastFinished = message.text;
    }
  });

  document.getElementById('message-enqueue')?.addEventListener('click', () => {
    const value = 'Message ' + (queue.size() + 1);
    queue.enqueue({ text: value, duration: 1000 });
  });

  document.getElementById('message-clear')?.addEventListener('click', () => {
    queue.clear();
    output.textContent = 'Queue cleared';
  });
})();
