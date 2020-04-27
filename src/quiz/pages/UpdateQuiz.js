import React, {useEffect, useState, useContext} from 'react';
import {useParams, useHistory} from 'react-router-dom';

import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH,
  VALIDATOR_MIN,
  VALIDATOR_MAX,
} from '../../shared/util/validators';
import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import {useForm} from '../../shared/hooks/form-hook';
import Card from '../../shared/components/UIElements/Card';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import {useHttpClient} from '../../shared/hooks/http-hook';
import {AuthContext} from '../../shared/context/auth-context';

import './QuizForm.css';

const UpdateQuiz = () => {
  const [loadedQuiz, setLoadedQuiz] = useState();
  const {isLoading, error, sendRequest, clearError} = useHttpClient();

  const history = useHistory();
  const auth = useContext(AuthContext);

  const quizId = useParams().quizId;

  const [formState, inputHandler, setFormData] = useForm(
    {
      title: {
        value: '',
        isValid: false,
      },
      description: {
        value: '',
        isValid: false,
      },
      numberQuestions: {
        value: 0,
        isValid: false,
      },
    },
    true
  );

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const data = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/quizzes/${quizId}`
        );
        console.log(data);
        setLoadedQuiz({
          ...data.quiz,
          numberQuestions: data.quiz.number_questions,
        });
        setFormData(
          {
            title: {
              value: data.quiz.title,
              isValid: true,
            },
            description: {
              value: data.quiz.description,
              isValid: true,
            },
            numberQuestions: {
              value: data.quiz.number_questions && 0,
              isValid: data.quiz.number_questions ? true : false,
            },
          },
          true
        );
      } catch (err) {
        console.log(err);
      }
    };
    fetchQuiz();
  }, [sendRequest, quizId, setFormData]);

  if (isLoading && !error) {
    return (
      <div className="center">
        <LoadingSpinner asOverlay />
      </div>
    );
  }

  if (!loadedQuiz) {
    return (
      <div className="center">
        <Card>
          <h2>Could not find quiz!</h2>
        </Card>
      </div>
    );
  }

  const quizUpdateSubmitHandler = async event => {
    event.preventDefault();
    try {
      console.log(formState.inputs.numberQuestions.value);
      await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/quizzes/${quizId}`,
        'PATCH',
        JSON.stringify({
          title: formState.inputs.title.value,
          description: formState.inputs.description.value,
          number_questions: formState.inputs.numberQuestions.value,
        }),
        {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        }
      );

      history.push(`/${auth.userId}/quizzes`);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {!isLoading && loadedQuiz && (
        <form className="quiz-form" onSubmit={quizUpdateSubmitHandler}>
          <Input
            id="title"
            element="input"
            type="text"
            label="Title"
            validators={[VALIDATOR_REQUIRE()]}
            errorText="Please enter a valid title"
            onInput={inputHandler}
            initialValue={loadedQuiz.title}
            initialValid={true}
          />
          <Input
            id="description"
            element="textarea"
            label="Description"
            validators={[VALIDATOR_MINLENGTH(5)]}
            errorText="Please enter a valid description of at least 5 chars"
            onInput={inputHandler}
            initialValue={loadedQuiz.description}
            initialValid={true}
          />
          <Input
            id="numberQuestions"
            element="input"
            type="number"
            label="Number of questions"
            validators={[
              VALIDATOR_REQUIRE(),
              VALIDATOR_MIN(5),
              VALIDATOR_MAX(100),
            ]}
            errorText="Number of questions must be between 5 and 100"
            onInput={inputHandler}
            initialValue={loadedQuiz.numberQuestions}
            initialValid={true}
          />

          <Button type="submit" disabled={!formState.isValid}>
            UPDATE QUIZ
          </Button>
        </form>
      )}
    </React.Fragment>
  );
};

export default UpdateQuiz;
