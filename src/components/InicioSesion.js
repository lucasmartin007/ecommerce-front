import React from 'react'

import { useState, useEffect } from "react";

//redux
import { useSelector, useDispatch } from 'react-redux';

//react router
import { Redirect } from 'react-router';

import { store, persistor } from './Tienda/storePersist';


// action creator
function updateToken(token, itemsCarrito) {
  return {
    type: 'UPDATE',
    token,
    itemsCarrito,
  };
}

export const InicioSesion = ({ usuario }) => {
    let [userEmail, setUserEmail] = useState("");
    let [userPassword, setUserPassword] = useState("");

    const onUserEmailChange = e => setUserEmail(e.target.value);
    const onUserPasswordChange = e => setUserPassword(e.target.value);
    
    const [logueado, setLogueado] = useState(false)

    // const idUsuario = store.getState().data.idUsuario

    const dispatch = useDispatch()
    
    const verificar_login = () => {
      if(store.getState().data.token !== ""){
        setLogueado(true)
        console.log(JSON.stringify(store.getState().data.token))
        console.log(logueado)
      }else{
        setLogueado(false)
        console.log(JSON.stringify(store.getState().data.token))
        console.log(logueado)
      }
    }
    
    const handleSubmitLogin = e => {
        e.preventDefault();
    
        const data = {
            "email": userEmail,
            "password": userPassword   };
        const requestOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        };
        fetch("http://localhost:3000/users/login", requestOptions) // "https://jsonplaceholder.typicode.com/posts"
        .then(response => response.json())
        .then(r => {
          if(r && r.token){
            let itemsCarrito = []
            try {
              store.dispatch(updateToken(r.token, itemsCarrito))              
            } catch (error) {
              console.log("Error: " + error)              
            }

            
            console.log(r.token)

            console.log(userEmail)

            setLogueado(true)
          }else{
            console.log("No se devolvieron registros")
          }
        } )
    };

    useEffect(() => {
        verificar_login()
	  }, [])

    //
    if (logueado) {
        return <Redirect to='/ecommerce'/>;
    }
    return (
        <div className="div_inicio">
        <h2>Iniciar sesion</h2>
        <form>
            Nombre de usuario<br />
            <input type="text" value={userEmail} onChange={onUserEmailChange} /><br /><br />
            Contraseña<br />
            <input type="password" value={userPassword} onChange={onUserPasswordChange} /><br /><br />
            <button onClick = {handleSubmitLogin}>Iniciar sesion</button><br /><br /> {/* */}
            <br />

            <a href = "/registrarse">Ir al registro</a><br />
        </form>
            <div>Id de usuario: {store.getState().data.token}</div>
        </div>
    )
}

// export default InicioSesion

