import React from 'react';
import axios from 'axios';
import {useSelector,useDispatch} from 'react-redux'

const Home = () => {

    const token = localStorage.getItem('token');

    const logouthandler = () => {
      window.localStorage.removeItem('isLoggedin');
      window.location.reload();
    }
    return (
        <div>
          Welcome to the app {token}  

          <button onClick={logouthandler}>Logout</button>
        </div>
    );
};

export default Home;