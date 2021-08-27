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
  
  export const Ecommerce = () => {
    //
    const [listProductosInicial, setListProductosInicial] = useState([]);
    const [listProductos, setListProductos] = useState([]);
    const [productsSearch, setProductsSearch] = useState("");
    
    let tokenUsuario = store.getState().data.token;
    const dispatch = useDispatch();
    
    const [logueado, setLogueado] = useState(true);
    const [carrito, setCarrito] = useState(false);

    const [nomUsuario, setNomUsuario] = useState("");

    const [prodsCarrito, setProdsCarrito] = useState([]);

    const cambiarProductos = () => {
        let arr_productos = [];
        for(let i = 0; i < listProductosInicial.length; i++){
            if(listProductosInicial[i].nombre.indexOf(productsSearch) > -1){
                arr_productos.push(listProductosInicial[i]);
            }
        }
        setListProductos(arr_productos);

    }
    
    const onProductsSearchChange = e => {
        setProductsSearch(e.target.value);

        cambiarProductos();

        console.log(listProductos)
    }

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

    const verProductos = () => {
        const url_ver_productos = "http://localhost:3000/productos";
        const requestOptionsMensajes = {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        };
		fetch(url_ver_productos)
            .then(res => res.json())
            .then(data => {
                setListProductos(data);
                setListProductosInicial(data);
            });
    }

    const ag_carrito = (id_producto, nom_producto, prec_producto) => {
        let listaActual = []
        prodsCarrito.forEach((prod) => {
            listaActual.push(prod)
        })

        let cant_producto = parseInt( document.getElementById("inp_cantidad" + id_producto).value )
        if(cant_producto > 0){
        listaActual.push({
            "id":id_producto,
            "nombre":nom_producto,
            "precio":prec_producto,
            "cantidad":cant_producto,
        })
        }

        setProdsCarrito(listaActual)

        store.dispatch(updateItemsCarrito(tokenUsuario, listaActual))
    }

    const camb_carrito = (bool) => {
        if(bool === false){
            setCarrito(false)
        }else{
            setCarrito(true)
        }
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

    const isNumberKey = ev => {
        if(ev.charCode < 48 || ev.charCode > 57){
            ev.preventDefault();
        }
    }

    useEffect(() => {
        const establecerprodsCarrito = (prodsCarrito) => {
            setProdsCarrito(prodsCarrito);
        }
        establecerprodsCarrito(prodsCarrito);
    }, [prodsCarrito]);

    useEffect(() => {
        const establecerListProductosInicial = (listProductosInicial) => {
            setListProductosInicial(listProductosInicial);
        }
        establecerListProductosInicial(listProductosInicial);
    }, [listProductosInicial]);

    useEffect(() => {
        const establecerListProductos = (listProductos) => {
            setListProductos(listProductos);
        }
        establecerListProductos(listProductos);
    }, [listProductos]);

    useEffect(() => {
        const establecerProductsSearch = (productsSearch) => {
            setProductsSearch(productsSearch);
        }
        establecerProductsSearch(productsSearch);
    }, [productsSearch]);

    useEffect(() => {
        verificar_login();

        if(logueado){
            busc_nom_usuario();
        }

        verProductos();
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
                <div>
                    Buscar<br />
                    <input type="text" className = "inp_busq_productos" value={productsSearch} onChange={onProductsSearchChange} />
                </div>
                <br />
                <div onClick={() => {camb_carrito(false)}} className = "div_link_carrito">
                <span>Ecommerce</span>
                </div>
                <div onClick={()  => {camb_carrito(true)}} className = "div_link_carrito">
                <span>Carrito</span>
                </div>
                <div className = "div_link_carrito">
                <span onClick = {() => {window.location.href = "/compras"}}>Compras</span>
                </div>
            </div>

            {!carrito ? (
            <div className = "div_productos">
                <div className = "div_ver_productos">
                    Productos:<br />
                    <section>
                    {listProductos !== [] ? listProductos.map(prod => (
                        <div key = {prod.id} className = "div_item_producto">
                        <span>
                            {prod.nombre}
                        </span>
                        <br />
                        <span className = "span_precio">
                            ${prod.precio}
                        </span>
                        <br />
                        <span>Cantidad:
                        </span>
                        <input type = "number" id = {"inp_cantidad" + prod.id} className = "inp_cantidad" onKeyPress={isNumberKey} />
                        <br />
                        <span onClick = {() => {ag_carrito(prod.id, prod.nombre, prod.precio)}} className = "span_ag_carrito">Agregar</span>
                        </div>
                    )) : {}}
                    </section>
                </div>
            </div>
            ) : (<></>)}

            {carrito ? (
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
            ) : (<></>)}
        </div>
    )
}

// export default Ecommerce
