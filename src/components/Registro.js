import React from 'react';
import { useState } from "react";
import { useEffect } from "react";

//redux

//react router
import { Redirect } from 'react-router';
import { store, persistor } from './Tienda/storePersist';


export const Registro = () => {
    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [userPassword, setUserPassword] = useState("");

    const onUserNameChange = e => setUserName(e.target.value);
    const onUserEmailChange = e => setUserEmail(e.target.value);
    const onUserPasswordChange = e => setUserPassword(e.target.value);

    const handleSubmitUser = e => {
        e.preventDefault();
    
        const data = { 
          "username": userName,
          "email": userEmail,
          "password": userPassword   };
        const requestOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        };
        fetch("http://localhost:3000/signup", requestOptions) // "https://jsonplaceholder.typicode.com/posts"
        .then(response => response.json())      
        .then(res => console.log(res));  
    };

    //
    const idUsuario = store.getState().info.idUsuario;
    //
    const [logueado, setLogueado] = useState(false);

    const verificar_login = () => {
      if(JSON.stringify(store.getState().info) !== "{}"){
        setLogueado(true);
      }
    }

    useEffect(() => {
      verificar_login();
    }, [])

    if(logueado){
      return <Redirect to='/mensajes'/>;
    }
    return (
        <div className="div_inicio">
        <h2>Registrar usuario</h2>
        <form>
            Nuevo usuario<br />
            <input type="text" value={userName} onChange={onUserNameChange} /><br /><br />
            Nueva contraseña<br />
            <input type="password" value={userPassword} onChange={onUserPasswordChange} /><br /><br />
            Mail del nuevo usuario<br />
            <input type="text" value={userEmail} onChange={onUserEmailChange} /><br /><br />
            <button onClick = {handleSubmitUser}>Registrarse</button><br />
        </form>
        <br />
        <a href = "/">Volver a inicio de sesion</a>
      </div>
    )
}

// export default Registro
