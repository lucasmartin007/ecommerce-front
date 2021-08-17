import React from 'react'

import { useState, useEffect } from "react";

//redux
import { useSelector, useDispatch } from 'react-redux';

//react router
import { Redirect } from 'react-router';

import { store, persistor } from './Tienda/storePersist';


// action creator
function updateIdUsuario(idUsuario) {
  return {
    type: 'UPDATE',
    idUsuario,
  };
}

// action creator
function updateItemsCarrito(itemsCarrito) {
    return {
    type: 'UPDATE',
    itemsCarrito,
    };
  }

export const Cart = ({ usuario }) => {    
    const [logueado, setLogueado] = useState(true)

    const idUsuario = store.getState().login.idUsuario

    const dispatch = useDispatch()
    
    const verificar_login = () => {
        // alert("Verificando login")
        console.log(typeof(idUsuario))
        console.log(store.getState())
      if(idUsuario !== ""){
        setLogueado(true)
      }
    }

    useEffect(() => {
        verificar_login()
	  }, [])

    //
    if (!logueado) {
        return <Redirect to='/'/>;
    }
    return (
        <div className="div_inicio">
        Hola mundo
        </div>
    )
}

// export default InicioSesion

