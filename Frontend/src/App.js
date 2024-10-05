import React from 'react';
import './App.css';
import Login from './Components/LoginScreen/Login';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import TripList from './Components/Trips/TripList';
import TripDetails from './Components/Trips/TripDetails';


function App() {
  const authorised = JSON.parse(localStorage.getItem('Authorization Details'));
  console.log(process.env.REACT_APP_HOSTNAME);
  return (
    <div>
      <BrowserRouter>
        <Switch>
          <Route path="/" render={() => (<Redirect to="/login" />)} exact />
          <Route path="/login" component={Login} exact />
          {authorised?._id && (
            <>
              <Route path="/triplist" component={TripList} exact />
              <Route path="/tripdetails" component={TripDetails} exact />
            </>
          )}
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;