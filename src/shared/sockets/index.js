import io from 'socket.io-client';
import {socketEvents} from './events';

export const socket = io(process.env.REACT_APP_SOCKET_URL);

export const initSockets = ({setValue}) => {
  socketEvents({setValue});
  // setValue    ^ is passed on to be used by socketEvents
};
