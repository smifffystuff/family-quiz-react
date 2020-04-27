import {socket} from './index';
import {v4 as uuid} from 'uuid';

export const socketEvents = ({setValue}) => {
  socket.on('message', msg => {
    msg.id = uuid();
    setValue(state => {
      const newMessages = [msg, ...state.messages];
      while (newMessages.length > 50) {
        newMessages.pop();
      }
      return {...state, messages: newMessages};
    });
  });
  socket.on('answer_submitted', answer => {
    setValue(state => {
      const newAnswer = [answer, ...state.answers];
      return {...state, answers: newAnswer};
    });
  });
};
