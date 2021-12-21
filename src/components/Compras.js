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

    let tokenUsuario = store.getState().data.token;
    const dispatch = useDispatch();
    
    const [logueado, setLogueado] = useState(true);

    const [nomUsuario, setNomUsuario] = useState("");

    const [seleccionoOrdProductos, setSeleccionoOrdProductos] = useState(false);
    const [ordenProductos, setOrdenProductos] = useState([]);
    const [precioTotal, setPrecioTotal] = useState(0);

    const rutProducto = "productos/ferreter.jpg";

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
        try {
            setOrdenProductos(ordenProductos => []); 
            console.log(ordenProductos);
        } catch (err) {
            console.log("No se pudo modificar orden productos");            
        }
        let orden_productos = [];
        let prec_total = 0;
        fetch("http://localhost:3000/idproductos-ordenesproductos/" + id_orden)
        .then(response => response.json())
        .then(ord_producto => {
            if(ord_producto !== []){
                ord_producto.forEach(ord_prod => {
                    orden_productos.push({
                        "id": ord_prod.id,

                        "productoId": ord_prod.productoId,
                        "nombre": ord_prod.nombre,
                        "precio": ord_prod.precio,
                        "tiene_imagen": ord_prod.tiene_imagen,
                        "url_imagen": ord_prod.url_imagen,

                        "cantidad": ord_prod.cantidad
                    });
                prec_total = prec_total + ord_prod.precio * ord_prod.cantidad;
                } )
                setPrecioTotal(prec_total);
            }
        });
        setOrdenProductos(orden_productos);
        setSeleccionoOrdProductos(true);
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
        const establecerOrdenProductos = (productos) => {
            setOrdenProductos(productos);
        }
        establecerOrdenProductos(ordenProductos);
    }, [ordenProductos]);

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
                    {/* {ordenSeleccionada !== [] ? ( */}
                        <div className = "div_item_orden">
                        <span>
                            {ordenSeleccionada.fec_orden}
                        </span>
                        <br />
                        {ordenProductos !== [] ? ordenProductos.map(ord_prod => (
                            <div key = {ord_prod.id}> 
                            {ord_prod.tiene_imagen ? (
                                <div className = "div_imagordproducto">
                                    <img src = {ord_prod.url_imagen} className = "imag_ordproducto" />
                                </div>
                            ) : (
                                <div className = "div_imagordproducto">
                                    <img src = {rutProducto} className = "imag_ordproducto" />
                                </div>
                            )}
                            <span>
                                Nombre: {ord_prod.nombre}
                            </span>
                            <br />
                            <span>
                                Precio: {ord_prod.precio}
                            </span>
                            <br />
                            <span>
                                Cantidad: {ord_prod.cantidad}
                            </span>
                            <br />
                            <hr />
                            </div>
                        )) : {}}
                        </div>
                        {
                            seleccionoOrdProductos ? (
                                <div>
                                    <span>
                                        Precio total: {precioTotal}
                                    </span>
                                </div>
                            ) : (
                                <span></span>
                            )
                        }
                    
                    </section>
                </div>
            </div>
        </div>
    )
}
// export default Ecommerce
