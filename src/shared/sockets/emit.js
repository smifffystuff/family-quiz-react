import {socket} from './index';

export const sendMessage = msg => {
  socket.emit('message', msg);
};

export const joinQuiz = userId => {
  console.log('emitting join');
  socket.emit('join', userId);
};

export const leaveQuiz = userId => {
  socket.emit('leave', 'BYE!');
};

export const answerQuestion = answer => {
  socket.emit('answer', answer);
};

export const answerMarked = (questNum, result, userId) => {
  socket.emit('answer-marked', {questNum, result, userId});
};
