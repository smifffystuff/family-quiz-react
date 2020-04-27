import {socket} from './index';
import {v4 as uuid} from 'uuid';

export const socketEvents = ({setValue}) => {
  socket.on('message', msg => {
    msg.id = uuid();
    console.log('Got a message');
    console.log(msg);
    setValue(state => {
      const newMessages = [msg, ...state.messages];
      while (newMessages.length > 50) {
        newMessages.pop();
      }
      console.log(newMessages);
      return {...state, messages: newMessages};
    });
  });
  socket.on('answer_submitted', answer => {
    setValue(state => {
      console.log(answer);
      const newAnswer = [answer, ...state.answers];
      return {...state, answers: newAnswer};
    });
  });
};
