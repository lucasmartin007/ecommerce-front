import logo from './logo.svg';
import './App.css';

import { BrowserRouter, Route, Switch } from "react-router-dom";

import { Registro } from "./components/Registro";

import { InicioSesion } from "./components/InicioSesion";
import { Ecommerce } from './components/Ecommerce';
import { Cart } from './components/Cart';
import { Compras } from './components/Compras';

function App() {
  return (
    <BrowserRouter>
        <Switch>
          <Route exact path = "/" component = {InicioSesion} />
          <Route exact path = "/registrarse" component = {Registro} />
          <Route exact path = "/ecommerce" component = {Ecommerce} />
          <Route exact path = "/cart" component = {Cart} />
          <Route exact path = "/compras" component = {Compras} />
        </Switch>
    </BrowserRouter>
  )
}

export default App;
