import React, {useEffect, useState, useRef, useContext} from 'react';
import {useParams, useHistory} from 'react-router-dom';

import Modal from '../../shared/components/UIElements/Modal';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import Button from '../../shared/components/FormElements/Button';
// import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import {useHttpClient} from '../../shared/hooks/http-hook';
import {AuthContext} from '../../shared/context/auth-context';
import {SocketContext} from '../../shared/context/socket-context';

import './Participate.css';

const Participate = () => {
  const [quiz, setQuiz] = useState();
  const [answers, setAnswers] = useState([]);
  const [addingAnswer, setAddingAnswer] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState();
  const [correctScore, setCorrectScore] = useState(0);
  const [wrongScore, setWrongScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [chatMsg, setChatMsg] = useState('');

  const auth = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const history = useHistory();

  const {isLoading, error, sendRequest, clearError} = useHttpClient();
  const answerInput = useRef();
  const quizId = useParams().quizId;

  useEffect(() => {
    const currentCorrectScore = answers.filter(
      answer => answer.correct === 'YES'
    ).length;
    setCorrectScore(currentCorrectScore);
    const currentWrongScore = answers.filter(answer => answer.correct === 'NO')
      .length;
    setWrongScore(currentWrongScore);
    setAnswered(currentCorrectScore + currentWrongScore);
  }, [answers]);

  useEffect(() => {
    const fetchQuiz = async () => {
      const startingAnswers = [];
      for (let i = 1; i <= 20; i++) {
        startingAnswers.push({number: i, answer: ''});
      }
      try {
        const data = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/quizzes/${quizId}`
        );
        setQuiz(data.quiz);
        const currentAnswers = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/answers/${quizId}`,
          'GET',
          null,
          {
            Authorization: `Bearer ${auth.token}`,
          }
        );
        currentAnswers.forEach(answer => {
          const answerIndex = startingAnswers.findIndex(
            a => a.number === answer.number
          );
          if (answerIndex || answerIndex === 0) {
            startingAnswers[answerIndex] = answer;
          }
        });
        setAnswers(startingAnswers);
      } catch (err) {
        console.log(err);
      }
    };
    fetchQuiz();
  }, [sendRequest, setQuiz, quizId, setAnswers, auth.token]);

  useEffect(() => {
    socket.joinQuiz(auth.userId);
    return () => {
      socket.leaveQuiz();
    };
    //eslint-disable-next-line
  }, []);

  const closeAddingAnswerHandler = () => {
    setAddingAnswer(false);
  };

  const addAnswerHandler = async () => {
    setAddingAnswer(false);
    const answer = answerInput.current.value;
    setAnswers(
      answers.map(a =>
        a.number === currentQuestion ? {number: a.number, answer: answer} : a
      )
    );

    try {
      const returnedAnswer = await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/answers/${quizId}/${currentQuestion}`,
        'POST',
        JSON.stringify({
          answer,
        }),
        {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        }
      );
      socket.answerQuestion(returnedAnswer);
    } catch (err) {
      console.log(err);
    }
  };

  const answerQuestionHandler = questionNumber => {
    setCurrentQuestion(questionNumber);
    setAddingAnswer(true);
  };

  const closeQuizHandler = () => {
    history.push(`/`);
  };

  const refreshQuestionsHandler = async () => {
    const startingAnswers = [];
    for (let i = 1; i <= 20; i++) {
      startingAnswers.push({number: i, answer: ''});
    }
    try {
      const data = await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/quizzes/${quizId}`
      );
      setQuiz(data.quiz);
      const currentAnswers = await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/answers/${quizId}`,
        'GET',
        null,
        {
          Authorization: `Bearer ${auth.token}`,
        }
      );
      currentAnswers.forEach(answer => {
        const answerIndex = startingAnswers.findIndex(
          a => a.number === answer.number
        );
        if (answerIndex || answerIndex === 0) {
          startingAnswers[answerIndex] = answer;
        }
      });
      setAnswers(startingAnswers);
    } catch (err) {
      console.log(err);
    }
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
      <Modal
        show={addingAnswer}
        onCancel={closeAddingAnswerHandler}
        header="New Question"
        // contentClass="quiz-item__modal-content"
        // footerClass="quiz-item__modal-action"
        footer={
          <React.Fragment>
            <div>
              <strong>Question {currentQuestion}.</strong>
            </div>
            <input type="text" ref={answerInput} size="50" />
            <div style={{paddingTop: '0.5rem'}}>
              <Button onClick={addAnswerHandler} disabled={false}>
                ANSWER
              </Button>
            </div>
          </React.Fragment>
        }
      ></Modal>
      {isLoading && <p>Loading......</p>}
      {!isLoading && quiz && (
        <div className="participate">
          <div className="participate-contents">
            <section className="participate-contents__answers">
              <h2 className="center">{quiz.title}</h2>
              <h3 className="center">
                {correctScore > 0 && `${correctScore} Correct`}
                {'   '}
                {wrongScore > 0 && `${wrongScore} Wrong`}
                {'   '}
                {answered > 0 && `of ${answered} answered and checked`}
              </h3>
              <div className="center">
                <Button onClick={refreshQuestionsHandler} inverse>
                  REFRESH
                </Button>
              </div>
              <ul>
                {answers.map(answer => (
                  <li key={answer.number} className="participate__question">
                    <span>
                      {answer.correct === 'YES'
                        ? '😀'
                        : answer.correct === 'NO'
                        ? '😢'
                        : '  '}
                      {'  '}
                      {answer.number}. {answer.answer}
                    </span>
                    {!answer.answer && (
                      <Button
                        onClick={() => answerQuestionHandler(answer.number)}
                        inverse
                      >
                        ANSWER QUESTION
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            </section>
            <section className="participate-contents__chat">
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
                <div
                  key={message.id}
                  className="participate-contents__chat__item"
                >
                  <strong>{message.user}</strong>: {message.text}
                </div>
              ))}
            </section>
          </div>
          <div className="center">
            <Button onClick={closeQuizHandler}>CLOSE QUIZ</Button>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

export default Participate;
