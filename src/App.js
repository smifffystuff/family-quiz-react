import React, {Suspense} from 'react';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from 'react-router-dom';

// import Users from './user/pages/Users';
// import NewQuiz from './quiz/pages/NewQuiz';
// import UserQuizzes from './quiz/pages/UserQuizzes';
// import UpdateQuiz from './quiz/pages/UpdateQuiz';
// import Auth from './user/pages/Auth';
import MainNavigation from './shared/components/Navigation/MainNavigation';
import {AuthContext} from './shared/context/auth-context';
import {useAuth} from './shared/hooks/auth-hook';
import LoadingSpinner from './shared/components/UIElements/LoadingSpinner';
import Participate from './quiz/pages/Participate';
import Answers from './quiz/pages/Answers';

const Users = React.lazy(() => import('./user/pages/Users'));
const NewQuiz = React.lazy(() => import('./quiz/pages/NewQuiz'));
const UserQuizzes = React.lazy(() => import('./quiz/pages/UserQuizzes'));
const UpdateQuiz = React.lazy(() => import('./quiz/pages/UpdateQuiz'));
const Auth = React.lazy(() => import('./user/pages/Auth'));

const App = () => {
  const {token, login, logout, userId, isAdmin} = useAuth();

  let routes;

  if (token) {
    routes = (
      <Switch>
        <Route path="/" exact>
          <Users />
        </Route>
        <Route path="/:userId/quizzes" exact>
          <UserQuizzes />
        </Route>
        <Route path="/quizzes/new" exact>
          <NewQuiz />
        </Route>
        <Route path="/participate/:quizId" exact>
          <Participate />
        </Route>
        <Route path="/quizzes/:quizId" exact>
          <UpdateQuiz />
        </Route>
        <Route path="/answers/:quizId" exact>
          <Answers />
        </Route>
        <Redirect to="/" />
      </Switch>
    );
  } else {
    routes = (
      <Switch>
        <Route path="/" exact>
          <Users />
        </Route>
        <Route path="/:userId/quizzes" exact>
          <UserQuizzes />
        </Route>
        <Route path="/auth">
          <Auth />
        </Route>
        <Redirect to="/auth" />
      </Switch>
    );
  }
  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token,
        isAdmin: isAdmin,
        token: token,
        userId: userId,
        login: login,
        logout: logout,
      }}
    >
      <Router>
        <MainNavigation />
        <main>
          <Suspense
            fallback={
              <div className="center">
                <LoadingSpinner />
              </div>
            }
          >
            {routes}
          </Suspense>
        </main>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
