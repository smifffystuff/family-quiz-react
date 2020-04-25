import {createContext} from 'react';

export const AuthContext = createContext({
  isLoggedIn: false,
  isAdmin: false,
  token: null,
  userId: null,
  login: () => {},
  logout: () => {},
});
