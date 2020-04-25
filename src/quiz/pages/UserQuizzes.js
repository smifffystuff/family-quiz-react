import React, {useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';

import QuizList from '../components/QuizList';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import {useHttpClient} from '../../shared/hooks/http-hook';

const UserQuizzes = props => {
  const [loadedQuizzes, setLoadedQuizzes] = useState();
  const {isLoading, error, sendRequest, clearError} = useHttpClient();

  const userId = useParams().userId;

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const data = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/quizzes/user/${userId}`
        );
        setLoadedQuizzes(data.quizzes);
      } catch (err) {
        console.log(err);
      }
    };
    fetchQuizzes();
  }, [sendRequest, userId]);

  const placeDeletedHandler = deletedQuizId => {
    setLoadedQuizzes(prevQuizzes =>
      prevQuizzes.filter(quiz => quiz.id !== deletedQuizId)
    );
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner asOverlay />
        </div>
      )}
      {!isLoading && loadedQuizzes && (
        <QuizList items={loadedQuizzes} onDeletePlace={placeDeletedHandler} />
      )}
    </React.Fragment>
  );
};

export default UserQuizzes;
