import React, {useState, useEffect, createContext} from 'react';
import {initSockets} from '../sockets';
import {
  sendMessage,
  joinQuiz,
  leaveQuiz,
  answerQuestion,
  answerMarked,
} from '../sockets/emit';

export const SocketContext = createContext({
  messages: [],
  answers: [],
  joinQuiz: userId => {},
  sendMessage: msg => {},
  leaveQuiz: () => {},
  answerQuestion: answer => {},
  removeAnswer: answerId => {},
  answerMarked: (questNum, result, userId) => {},
});

const SocketProvider = props => {
  const removeAnswer = answerId => {
    setValue(state => {
      return {
        ...state,
        answers: state.answers.filter(answer => answer.id !== answerId),
      };
    });
  };

  const [value, setValue] = useState({
    messages: [],
    answers: [],
    joinQuiz,
    leaveQuiz,
    sendMessage,
    answerQuestion,
    removeAnswer,
    answerMarked,
  });

  useEffect(() => {
    initSockets({setValue});
  }, []);

  return (
    <SocketContext.Provider value={value}>
      {props.children}
    </SocketContext.Provider>
  );
};
export default SocketProvider;
