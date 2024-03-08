import { deepCopy } from '../utils';

export function createLogger({
  collapsed = true,
  actionFilter = (mutation, state) => true,
  logger = console,
} = {}) {
  return (context) => {
    let prevState = deepCopy(context.get());

    context.subscribe((mutation, state) => {
      const nextState = deepCopy(state);

      if (actionFilter(mutation, nextState)) {
        const formattedTime = getFormattedTime();
        const message = `mutation ${mutation.type}${formattedTime}`;

        startMessage(logger, message, collapsed);
        logger.log('%c prev state', 'color: #9E9E9E; font-weight: bold', prevState);
        logger.log('%c mutation', 'color: #03A9F4; font-weight: bold', mutation);
        logger.log('%c next state', 'color: #4CAF50; font-weight: bold', nextState);
        endMessage(logger);
      }

      prevState = nextState;
    });
  };
}

function startMessage(logger, message, collapsed) {
  const startMessage = collapsed ? logger.groupCollapsed : logger.group;

  // render
  try {
    startMessage.call(logger, message);
  } catch (e) {
    logger.log(message);
  }
}

function endMessage(logger) {
  try {
    logger.groupEnd();
  } catch (e) {
    logger.log('—— log end ——');
  }
}

function getFormattedTime() {
  const time = new Date();
  return ` @ ${pad(time.getHours(), 2)}:${pad(time.getMinutes(), 2)}:${pad(
    time.getSeconds(),
    2
  )}.${pad(time.getMilliseconds(), 3)}`;
}

function repeat(str, times) {
  return new Array(times + 1).join(str);
}

function pad(num, maxLength) {
  return repeat('0', maxLength - num.toString().length) + num;
}
