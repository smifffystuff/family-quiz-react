import React, {useEffect, useState, useContext} from 'react';
import {useParams, useHistory} from 'react-router-dom';

import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH,
} from '../../shared/util/validators';
import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import {useForm} from '../../shared/hooks/form-hook';
import Card from '../../shared/components/UIElements/Card';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import Modal from '../../shared/components/UIElements/Modal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import {useHttpClient} from '../../shared/hooks/http-hook';
import {AuthContext} from '../../shared/context/auth-context';

import './QuizForm.css';

const UpdateQuiz = () => {
  const [loadedQuiz, setLoadedQuiz] = useState();
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
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
    },
    true
  );

  const [quesFormState, quesInputHandler, setQuesFormData] = useForm(
    {
      question: {
        value: '',
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
        setLoadedQuiz(data.quiz);
        setQuizQuestions(
          data.quiz.questions.map(q => ({
            id: q.id,
            number: q.number,
            question: q.question,
          }))
        );
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
          },
          true
        );
      } catch (err) {
        console.log(err);
      }
    };
    fetchQuiz();
  }, [sendRequest, quizId, setFormData, setQuizQuestions]);

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
      await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/quizzes/${quizId}`,
        'PATCH',
        JSON.stringify({
          title: formState.inputs.title.value,
          description: formState.inputs.description.value,
        }),
        {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        }
      );
      await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/quizzes/${quizId}/questions`,
        'POST',
        JSON.stringify({
          questions: quizQuestions.map(q => ({question: q.question})),
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

  const openAddingQuestionHandler = () => {
    setAddingQuestion(true);
  };

  const closeAddingQuestionHandler = () => {
    setAddingQuestion(false);
  };

  const addQuestionHandler = () => {
    setQuizQuestions(prevQuestions => {
      return [
        ...prevQuestions,
        {
          number: prevQuestions.length + 1,
          question: quesFormState.inputs.question.value,
        },
      ];
    });
    setQuesFormData(
      {
        question: {
          value: '',
          isValid: true,
        },
      },
      false
    );
    setAddingQuestion(false);
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <Modal
        show={addingQuestion}
        onCancel={closeAddingQuestionHandler}
        header="New Question"
        // contentClass="quiz-item__modal-content"
        // footerClass="quiz-item__modal-action"
        footer={
          <React.Fragment>
            <Button
              onClick={addQuestionHandler}
              disabled={!quesFormState.isValid}
            >
              ADD
            </Button>
            <Button onClick={closeAddingQuestionHandler}>CLOSE</Button>
          </React.Fragment>
        }
      >
        <div>
          <Input
            id="question"
            element="input"
            type="text"
            label="Question"
            validators={[VALIDATOR_REQUIRE()]}
            errorText="Please enter a valid question"
            onInput={quesInputHandler}
            initialValue=""
            initialValid={false}
          />
        </div>
      </Modal>
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
          {quizQuestions.length > 0 && (
            <ul>
              {quizQuestions.map(q => {
                return (
                  <li key={q.number}>
                    {q.number} - {q.question}
                  </li>
                );
              })}
            </ul>
          )}
          <Button type="submit" disabled={!formState.isValid}>
            UPDATE QUIZ
          </Button>
          <Button type="button" onClick={openAddingQuestionHandler}>
            ADD QUESTION
          </Button>
        </form>
      )}
    </React.Fragment>
  );
};

export default UpdateQuiz;
