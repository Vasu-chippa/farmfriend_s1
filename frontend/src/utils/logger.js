// Minimal logger for frontend use. Keeps API similar to server logger.
const noop = () => {};
const warn = (...args) => console.warn(...args);
const info = (...args) => console.info(...args);
const error = (...args) => console.error(...args);

const logger = {
  warn,
  info,
  error,
  debug: info,
  trace: info,
  noop,
};

export default logger;
