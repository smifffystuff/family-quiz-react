import React, {useEffect, useState, useContext} from 'react';
import {useParams} from 'react-router-dom';

import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import {useHttpClient} from '../../shared/hooks/http-hook';
import {AuthContext} from '../../shared/context/auth-context';
import {SocketContext} from '../../shared/context/socket-context';
import UserAnswers from './UserAnswers';
import Card from '../../shared/components/UIElements/Card';
import Button from '../../shared/components/FormElements/Button';

import './Answers.css';

const Answers = () => {
  const {isLoading, error, sendRequest, clearError} = useHttpClient();
  const [answers, setAnswers] = useState();
  const [users, setUsers] = useState([]);
  const auth = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const [chatMsg, setChatMsg] = useState('');

  const quizId = useParams().quizId;

  useEffect(() => {
    const fetchAnswers = async () => {
      const startingAnswers = [];
      for (let i = 1; i <= 20; i++) {
        startingAnswers.push({number: i, answer: ''});
      }
      try {
        const data = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/answers/all/${quizId}`,
          'GET',
          null,
          {
            Authorization: `Bearer ${auth.token}`,
          }
        );
        setAnswers(data);
        const foundUsers = [];
        data.forEach(answer => {
          if (!foundUsers.find(u => u.id === answer.creator.id)) {
            foundUsers.push(answer.creator);
          }
        });
        setUsers(foundUsers);
      } catch (err) {
        console.log(err);
      }
    };
    fetchAnswers();
  }, [auth.token, sendRequest, quizId]);

  useEffect(() => {
    socket.joinQuiz(auth.userId);
    return () => {
      socket.leaveQuiz();
    };
    //eslint-disable-next-line
  }, []);

  const refreshHandler = async () => {
    const data = await sendRequest(
      `${process.env.REACT_APP_BACKEND_URL}/answers/all/${quizId}`,
      'GET',
      null,
      {
        Authorization: `Bearer ${auth.token}`,
      }
    );
    setAnswers(data);
    const foundUsers = [];
    data.forEach(answer => {
      if (!foundUsers.find(u => u.id === answer.creator.id)) {
        foundUsers.push(answer.creator);
      }
    });
    setUsers(foundUsers);
  };

  const onChangeSelectHandler = async (e, userId, answerId) => {
    const newAnswers = answers.map(answer =>
      answer.id === answerId ? {...answer, correct: e.target.value} : answer
    );
    setAnswers(newAnswers);
    await sendRequest(
      `${process.env.REACT_APP_BACKEND_URL}/answers/${answerId}`,
      'PATCH',
      JSON.stringify({
        correct: e.target.value,
      }),
      {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.token}`,
      }
    );
  };

  const chatMsgChangeHandler = e => {
    setChatMsg(e.target.value);
  };

  const chatMsgKeyUpHandler = e => {
    if (e.keyCode === 13) {
      socket.sendMessage(chatMsg);
      setChatMsg('');
    }
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && <p>Loading......</p>}

      <div className="answers">
        <section className="answers-answers">
          <Card
            style={{
              background: 'lightgrey',
              margin: '0 auto',
              maxWidth: '75vw',
            }}
          >
            <div className="center">
              <Button onClick={refreshHandler}>REFRESH ANSWERS</Button>
            </div>
            {users && users.length > 0 && (
              <ul className="answer-list">
                {users.map(user => (
                  <UserAnswers
                    key={user.id}
                    user={user}
                    answers={answers
                      .filter(answer => answer.creator.id === user.id)
                      .sort((a, b) =>
                        a.number > b.number ? 1 : b.number > a.number ? -1 : 0
                      )}
                    style={{marginTop: '1rem'}}
                    onChangeSelect={onChangeSelectHandler}
                  />
                ))}
              </ul>
            )}
          </Card>
        </section>
        <section className="answers-chat">
          <div>
            <input
              type="text"
              value={chatMsg}
              onChange={chatMsgChangeHandler}
              onKeyUp={chatMsgKeyUpHandler}
              style={{
                width: '100%',
                borderBottom: '1rem',
                marginBottom: '1rem',
              }}
            />
          </div>
          {socket.messages.map(message => (
            <div key={message.id} className="participate-contents__chat__item">
              <strong>{message.user}</strong>: {message.text}
            </div>
          ))}
        </section>
      </div>
    </React.Fragment>
  );
};

export default Answers;
