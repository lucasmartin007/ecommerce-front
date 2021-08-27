import React from 'react';

import { useState, useEffect } from "react";

//redux
import { useSelector, useDispatch } from 'react-redux';

//react router
import { Redirect } from 'react-router';

import { store, persistor } from './Tienda/storePersist';

// import moment from 'moment';

import axios from 'axios';

import jwt_decode from "jwt-decode";

import { browserHistory } from 'react-router';

import { useHistory } from "react-router-dom";


// action creator
function updateToken(token, itemsCarrito) {
    return {
      type: 'UPDATE',
      token,
      itemsCarrito,
    };
  }

// action creator
function updateItemsCarrito(token, itemsCarrito) {
    return {
      type: 'UPDATE',
      token: token,
      itemsCarrito: itemsCarrito,
    };
  }
  
  export const Cart = () => {
    //    
    let tokenUsuario = store.getState().data.token;
    const dispatch = useDispatch();
    
    const [logueado, setLogueado] = useState(true);
    
    const [nomUsuario, setNomUsuario] = useState("");

    const [prodsCarrito, setProdsCarrito] = useState([]);

    const cerrar_sesion = () => {
        store.dispatch(updateToken(""));
        window.location.replace("");
    }

    const busc_nom_usuario = () => {
        try {
            let tokens = store.getState().data.token.split(".")
            let json_parse = JSON.parse(atob(tokens[1]))
            setNomUsuario(json_parse.name)
        } catch (error) {
            console.log("Se produjo un error: " + error)
            
        }
    }

    const verificar_login = () => {
        console.log(store.getState().data.token)
        if(store.getState().data.token !== ""){
            setLogueado(true);
            busc_nom_usuario();

            tokenUsuario = store.getState().data.token;
        }else{
            setLogueado(false);
        }

        setProdsCarrito([])

        console.log("El usuario esta logueado:" + logueado);
    }

    const ag_ordenes_productos = idOrden => {
        if(idOrden !== 0){
            let prec_total = 0;
            prodsCarrito.forEach((producto) => {
                if(producto.cantidad > 0){
                const data = { 
                    "ordenId": idOrden,
                    "productoId": producto.id,
                    "cantidad": producto.cantidad   };
                const requestOptions = {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                    };
                    fetch("http://localhost:3000/ordenes-productos", requestOptions) // "https://jsonplaceholder.typicode.com/posts"
                    .then(response => response.json())    
                    .then(res => console.log(res));
                    prec_total = prec_total + producto.precio * producto.cantidad
                }
            })

            let tokens = store.getState().data.token.split(".")
            let json_parse = JSON.parse(atob(tokens[1]))
            let id_de_usuario = json_parse.id
            try {
                const data = { 
                    "id": idOrden,
                    "usuarioId":id_de_usuario,
                    "precioTotal":prec_total   };
                const requestOptions = {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                    };
                fetch("http://localhost:3000/ordenes/" + idOrden, requestOptions) // "https://jsonplaceholder.typicode.com/posts"
                    .then(response => response.json())
                    .then(res => console.log(res));                
            } catch (error) {
                console.log("Error: " + error)                
            }
            
            setProdsCarrito([])
            store.dispatch(updateItemsCarrito(tokenUsuario, []))
        }
    }

    const handleSubmitPurchase = e => {
        e.preventDefault();

        if(prodsCarrito){
            let tokens = store.getState().data.token.split(".")
            let json_parse = JSON.parse(atob(tokens[1]))
            let id_de_usuario = json_parse.id

            let fec_actual = new Date()
            const data = { 
                "usuarioId": id_de_usuario,
                "created_at": fec_actual,
            };
            const requestOptions = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
                };
            fetch("http://localhost:3000/ordenes", requestOptions) // "https://jsonplaceholder.typicode.com/posts"
                .then(response => response.json())
                .then(res => console.log(res));
            // console.log(store.getState())
        let ult_orden = [];
        let id_ult_orden = 0;
        axios
            .get("http://localhost:3000/ordenes/ultima-orden")
            .then((res) => {
                ult_orden = res;
                id_ult_orden = res.data[0].id;
                console.log(res.data)
                console.log(id_ult_orden)
                ag_ordenes_productos(id_ult_orden)
            });
        console.log(ult_orden)
        }
    };

    useEffect(() => {
        verificar_login();

        setProdsCarrito(store.getState().data.itemsCarrito)

        if(logueado){
            busc_nom_usuario();
        }
	}, [])

    if(!logueado){
        return <Redirect to='/'/>;
    }

    return (
        <div>
            <div className = "div_usuario_actual">
                <h2>Hola {nomUsuario} :)</h2>
                <button onClick = {cerrar_sesion}>Cerrar sesion</button> 
                <br />
                <br />
                <hr />
                <br />
                <div onClick = {() => {window.location.href = "/ecommerce"}} className = "div_link_carrito">
                <span>Ecommerce</span>
                </div>
                <div onClick = {() => {window.location.href = "/cart"}} className = "div_link_carrito">
                <span>Carrito</span>
                </div>
                <div onClick = {() => {window.location.href = "/compras"}} className = "div_link_carrito">
                <span >Compras</span>
                </div>
            </div>
            
            <div className = "div_carrito">
                <div className = "div_ver_carrito">
                    Productos del carrito:<br />
                    <section>
                    {prodsCarrito !== [] ? prodsCarrito.map(prod => (
                        <div key = {prod.id} className = "div_item_producto">
                        <span>
                            Nombre: {prod.nombre}
                        </span>
                        <br />
                        <span>
                            Precio: {prod.precio}
                        </span>
                        <br />
                        <span>
                            Cantidad: {prod.cantidad}
                        </span>
                        </div>
                    )) : {}}
                    </section>
                    <br />
                    <button onClick = {handleSubmitPurchase} className = "bot_comprar">Comprar</button>
                </div>
            </div>
        </div>
    )
}

// export default Ecommerce
