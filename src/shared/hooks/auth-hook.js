import {useState, useEffect, useCallback} from 'react';

let logoutTimer;

export const useAuth = () => {
  const [token, setToken] = useState();
  const [tokenExpirationDate, setTokenExpirationDate] = useState();
  const [userId, setUserId] = useState();
  const [isAdmin, setIsAdmin] = useState(false);

  const login = useCallback((uid, token, expirationDate, adminUser) => {
    setToken(token);
    setUserId(uid);
    setIsAdmin(adminUser);
    const tokenExpirationDate =
      expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60 * 6); //6 hours
    setTokenExpirationDate(tokenExpirationDate);
    localStorage.setItem(
      'userData',
      JSON.stringify({
        userId: uid,
        isAdmin: adminUser,
        token,
        expiration: tokenExpirationDate.toISOString(),
      })
    );
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setTokenExpirationDate(null);
    setUserId(null);
    setIsAdmin(false);
    localStorage.removeItem('userData');
  }, []);

  useEffect(() => {
    if (token && tokenExpirationDate) {
      const remainingTime =
        tokenExpirationDate.getTime() - new Date().getTime();
      logoutTimer = setTimeout(logout, remainingTime);
    } else {
      clearTimeout(logoutTimer);
    }
  }, [token, logout, tokenExpirationDate]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));

    if (
      userData &&
      userData.token &&
      new Date(userData.expiration) > new Date()
    ) {
      login(
        userData.userId,
        userData.token,
        new Date(userData.expiration),
        userData.isAdmin
      );
    }
  }, [login]);

  return {token, login, logout, userId, isAdmin};
};
