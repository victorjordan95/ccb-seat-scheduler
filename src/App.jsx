import React, { useState, useEffect } from 'react';

import { BrowserRouter, Switch, Route } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';
import RegisterPage from './Pages/Register.page';
import AdminPage from './Pages/Admin.page';

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/:igreja/" exact component={RegisterPage} />
        <Route path="/:igreja/porteiro" component={RegisterPage} />
        <Route path="/:igreja/admin" component={AdminPage} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
