import logo from './logo.svg';
import './App.css';

import { BrowserRouter, Route, Switch } from "react-router-dom";

import { Registro } from "./components/Registro";

import { InicioSesion } from "./components/InicioSesion";
import { Ecommerce } from './components/Ecommerce';

function App() {
  return (
    <BrowserRouter>
        <Switch>
          <Route exact path = "/" component = {InicioSesion} />
          <Route exact path = "/registrarse" component = {Registro} />
          <Route exact path = "/ecommerce" component = {Ecommerce} />
        </Switch>
    </BrowserRouter>
  )
}

export default App;
