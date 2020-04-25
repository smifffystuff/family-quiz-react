import React, {useEffect, useState} from 'react';

import UsersList from '../components/UsersList';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import {useHttpClient} from '../../shared/hooks/http-hook';

const Users = () => {
  const [loadedUsers, setLoadedUsers] = useState();
  const {isLoading, error, sendRequest, clearError} = useHttpClient();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/users`
        );
        setLoadedUsers(data.users);
      } catch (err) {
        console.log(err);
      }
    };
    fetchUsers();
  }, [sendRequest]);

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner asOverlay />
        </div>
      )}
      {!isLoading && <UsersList items={loadedUsers} />}
    </React.Fragment>
  );
};

export default Users;
