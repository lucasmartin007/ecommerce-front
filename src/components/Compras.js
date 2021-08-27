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
  
  export const Compras = () => {
    //
    const [listOrdenesInicial, setListOrdenesInicial] = useState([]);
    const [listOrdenes, setListOrdenes] = useState([]);

    const [ordenSeleccionada, setOrdenSeleccionada] = useState([]);
    const [detallesCompra, setDetallesCompra] = useState([]);

    const [productosOrden, setProductosOrden] = useState([]);

    let tokenUsuario = store.getState().data.token;
    const dispatch = useDispatch();
    
    const [logueado, setLogueado] = useState(true);

    const [nomUsuario, setNomUsuario] = useState("");

    const [precioTotal, setPrecioTotal] = useState(0);

    let orden_productos = [];

    const cerrar_sesion = () => {
        store.dispatch(updateToken(""));
        window.location.replace("");
    }

    const busc_nom_usuario = () => {
        try {
            let tokens = store.getState().data.token.split(".");
            let json_parse = JSON.parse(atob(tokens[1]));
            setNomUsuario(json_parse.name);
        } catch (error) {
            console.log("Se produjo un error: " + error);
            
        }
    }

    const verificar_login = () => {
        console.log(store.getState().data.token);
        if(store.getState().data.token !== ""){
            setLogueado(true);
            busc_nom_usuario();

            tokenUsuario = store.getState().data.token;
        }else{
            setLogueado(false);
        }

        console.log("El usuario esta logueado:" + logueado);
    }

    const mostrar_ordenes = () => {
        const url_mostrar_ordenes = "http://localhost:3000/ordenes_usuario";
        let tokens = store.getState().data.token.split(".");
        let json_parse = JSON.parse(atob(tokens[1]));
        let id_del_usuario = json_parse.id;
        const data = { 
            "idUsuario": id_del_usuario,   };
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
            };
            fetch("http://localhost:3000/ordenes-usuario", requestOptions) // "https://jsonplaceholder.typicode.com/posts"
            .then(response => response.json())    
            .then(res => {
                console.log(res);
                setListOrdenesInicial(res);
                setListOrdenes(res);
            });
    }

    const ver_productos_orden = (id_orden) => {
        // let orden_productos = [];
        fetch("http://localhost:3000/idproductos-ordenesproductos/" + id_orden)
        .then(response => response.json())
        .then(ord_producto => {
            let prec_total = 0;
            if(ord_producto !== []){
                ord_producto.forEach(ord_prod => {
                    fetch("http://localhost:3000/productos/" + ord_prod.productoId)
                    .then(response => response.json())    
                    .then(prod => {
                        orden_productos.push({
                            "id":prod.id,
                            "nombre":prod.nombre,
                            "precio":prod.precio,
                            "cantidad":ord_prod.cantidad
                        });
                        prec_total = prec_total + prod.precio * ord_prod.cantidad;
                    } )
                });
                setPrecioTotal(prec_total);
            }
        });
        console.log(orden_productos);
        try {
            setProductosOrden(orden_productos);
        } catch (error) {
            console.log("Error al setear productos de orden: " + error);            
        }
        console.log(productosOrden);
    }

    const ver_orden = (id_orden, fec_orden) => {
        setOrdenSeleccionada({
            "id":id_orden,
            "fec_orden":fec_orden,
        });
        
        ver_productos_orden(id_orden);
    }

    useEffect(() => {
        const establecerPrecioTotal = (precio) => {
            setPrecioTotal(precio);
        }
        establecerPrecioTotal(precioTotal);
    }, [precioTotal]);

    useEffect(() => {
        const establecerProductosOrden = (productos) => {
            setProductosOrden(productos);
        }
        establecerProductosOrden(productosOrden);
    }, [productosOrden]);

    useEffect(() => {
        verificar_login();

        if(logueado){
            busc_nom_usuario();
        }

        mostrar_ordenes();
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
                <div className = "div_link_carrito">
                <span onClick = {() => {window.location.href = "/ecommerce"}}>Ecommerce</span>
                </div>
                <div className = "div_link_carrito">
                <span onClick = {() => {window.location.href = "/compras"}}>Compras</span>
                </div>
            </div>

            <div className = "div_compras">
                <div className = "div_ver_compras">
                    Compras del usuario:<br />
                    <section>
                    {listOrdenes !== [] ? listOrdenes.map(ord => (
                        <div key = {ord.id} className = "div_item_orden" onClick = {() => {ver_orden(ord.id, ord.created_at)}}>
                        <span>
                            {ord.created_at}
                        </span>
                        </div>
                    )) : {}}
                    </section>
                </div>
            </div>

            <div className = "div_detalle_compra">
                <div className = "div_ver_detalles">
                    Detalles de compra:<br />
                    <section>
                    {ordenSeleccionada ? (
                        <div className = "div_item_orden">
                        <span>
                            {ordenSeleccionada.fec_orden}
                        </span>
                        <br />
                        {productosOrden !== [] ? productosOrden.map(prod => (
                            <div key = {prod.id}>
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
                            <br />
                            <span>
                                Precio total: {precioTotal}
                            </span>
                            </div>
                        )) : {}}
                        </div>
                    ) : {}}
                    </section>
                </div>
            </div>
        </div>
    )
}
// export default Ecommerce
