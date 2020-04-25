import React, {useState, useContext} from 'react';
import {useHistory} from 'react-router-dom';

import Card from '../../shared/components/UIElements/Card';
import Button from '../../shared/components/FormElements/Button';
import Modal from '../../shared/components/UIElements/Modal';
import {AuthContext} from '../../shared/context/auth-context';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import {useHttpClient} from '../../shared/hooks/http-hook';

import './QuizItem.css';

const QuizItem = ({quiz, onDelete}) => {
  const auth = useContext(AuthContext);
  const history = useHistory();
  const [showQuiz, setShowQuiz] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const {isLoading, error, sendRequest, clearError} = useHttpClient();

  const openQuizHandler = () => {
    setShowQuiz(true);
  };

  const closeQuizHandler = () => {
    setShowQuiz(false);
  };

  const showDeleteModalHandler = () => {
    setShowConfirmModal(true);
  };

  const cancelDeleteHandler = () => {
    setShowConfirmModal(false);
  };

  const confirmDeleteHandler = async () => {
    setShowConfirmModal(false);
    try {
      await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/quizzes/${quiz.id}`,
        'DELETE',
        null,
        {
          Authorization: `Bearer ${auth.token}`,
        }
      );
      onDelete(quiz.id);
    } catch (err) {
      console.log(err);
    }
  };

  const joinQuizHandler = () => {
    history.push(`/participate/${quiz.id}`);
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <Modal
        show={showQuiz}
        onCancel={closeQuizHandler}
        header={quiz.title}
        contentClass="quiz-item__modal-content"
        footerClass="quiz-item__modal-action"
        footer={<Button onClick={closeQuizHandler}>CLOSE</Button>}
      >
        <div className="quiz-container">
          <h2>{quiz.description}</h2>
          {quiz.question_count > 0 && (
            <ul>
              {quiz.questions.map(q => {
                return (
                  <li key={q.number}>
                    {q.number} - {q.question}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Modal>
      <Modal
        show={showConfirmModal}
        onCancel={cancelDeleteHandler}
        header="Are you sure?"
        footerClass="place-item__modal-actions"
        footer={
          <React.Fragment>
            <Button inverse onClick={cancelDeleteHandler}>
              CANCEL
            </Button>
            <Button danger onClick={confirmDeleteHandler}>
              DELETE
            </Button>
          </React.Fragment>
        }
      >
        <p>
          Do you want to proceed and delete this quiz? Please note it can't be
          undone!
        </p>
      </Modal>
      <li className="quiz-item">
        <Card className="quiz-item__content">
          {isLoading && <LoadingSpinner asOverlay />}
          <div className="quiz-item__info">
            <h2>{quiz.title}</h2>
            <h3>{quiz.meetingId}</h3>
            <p>{quiz.description}</p>
          </div>
          <div className="quiz-item__actions">
            <Button inverse onClick={openQuizHandler}>
              VIEW QUIZ
            </Button>
            <Button inverse onClick={joinQuizHandler}>
              JOIN QUIZ
            </Button>
            {auth.userId === quiz.creator && (
              <Button to={`/quizzes/${quiz.id}`}>EDIT QUIZ</Button>
            )}
            {auth.userId === quiz.creator && (
              <Button danger onClick={showDeleteModalHandler}>
                DELETE QUIZ
              </Button>
            )}
            {auth.userId === quiz.creator && (
              <Button to={`/answers/${quiz.id}`}>CHECK ANSWERS</Button>
            )}
          </div>
        </Card>
      </li>
    </React.Fragment>
  );
};

export default QuizItem;
