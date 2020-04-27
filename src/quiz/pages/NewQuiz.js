import React, {useContext} from 'react';
import {useHistory} from 'react-router-dom';

import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH,
  VALIDATOR_MAX,
  VALIDATOR_MIN,
} from '../../shared/util/validators';
import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import {useForm} from '../../shared/hooks/form-hook';
import {useHttpClient} from '../../shared/hooks/http-hook';
import {AuthContext} from '../../shared/context/auth-context';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import './QuizForm.css';

const NewQuiz = () => {
  const {isLoading, error, sendRequest, clearError} = useHttpClient();
  const history = useHistory();
  const auth = useContext(AuthContext);
  const [formState, inputHandler] = useForm(
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
        value: 5,
        isValid: true,
      },
    },
    false
  );

  const quizSubmitHandler = async event => {
    event.preventDefault();
    try {
      await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/quizzes`,
        'POST',
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
      history.push('/');
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && <LoadingSpinner asOverlay />}
      <form className="quiz-form" onSubmit={quizSubmitHandler}>
        <Input
          id="title"
          element="input"
          type="text"
          label="Title"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a valid title"
          onInput={inputHandler}
        />
        <Input
          id="description"
          element="textarea"
          label="Description"
          validators={[VALIDATOR_MINLENGTH(5)]}
          errorText="Please enter a valid description of at least 5 chars"
          onInput={inputHandler}
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
        />
        <Button type="submit" disabled={!formState.isValid}>
          ADD QUIZ
        </Button>
      </form>
    </React.Fragment>
  );
};

export default NewQuiz;
