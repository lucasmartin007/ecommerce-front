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
  
  export const Ecommerce = () => {
    //
    const [listProductosInicial, setListProductosInicial] = useState([]);
    const [listProductos, setListProductos] = useState([]);
    const [productsSearch, setProductsSearch] = useState("");
    
    const idUsuario = store.getState().login.idUsuario;
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

        console.log(listProductos)

        cambiarProductos();

        console.log(listProductos)
    }

    const cerrar_sesion = () => {
        store.dispatch(updateIdUsuario(""));
        window.location.replace("");
    }

    const busc_nom_usuario = () => {
        // let json_decodificado = jwt_decode(idUsuario, {header:true});
        // setNomUsuario(json_decodificado.name);
        try {
            let tokens = idUsuario.split(".")
            let json_parse = JSON.parse(atob(tokens[1]))
            setNomUsuario(json_parse.name)
        } catch (error) {
            console.log("Se produjo un error: " + error)
            
        }
    }

    const verificar_login = () => {
        if(idUsuario !== ""){
            setLogueado(true);
            busc_nom_usuario();
        }else{
            setLogueado(false);
        }
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

    const ag_carrito = (id_producto, nom_producto) => {
        // let it_carrito = store.getState().items_carrito;
        // store.dispatch(updateItemsCarrito(it_carrito))

        let listaActual = []
        prodsCarrito.forEach((prod) => {
            listaActual.push(prod)
        })
        // listaActual.push(id_producto)
        listaActual.push({
            "id":id_producto,
            "nombre":nom_producto
        })

        setProdsCarrito(listaActual)

        store.dispatch(updateItemsCarrito(listaActual))

        console.log(store.getState().cart.itemsCarrito)
    }

    const camb_carrito = (bool) => {
        store.dispatch(updateIdUsuario(idUsuario))
        store.dispatch(updateItemsCarrito(prodsCarrito))
        if(bool === false){
            setCarrito(false)
        }else{
            setCarrito(true)
        }
    }

    const handleSubmitPurchase = e => {
        e.preventDefault();

        if(prodsCarrito){
            // let tokens = idUsuario.split(".")
            // let json_parse = JSON.parse(atob(tokens[1]))
            // let id_de_usuario = json_parse.id
            // const data = { 
            //     "usuarioId": id_de_usuario   };
            // const requestOptions = {
            //     method: "POST",
            //     headers: { "Content-Type": "application/json" },
            //     body: JSON.stringify(data)
            //     };
            // fetch("http://localhost:3000/ordenes", requestOptions) // "https://jsonplaceholder.typicode.com/posts"
            //     .then(response => response.json())      
            //     .then(res => console.log(res)); 
            console.log(store.getState())
        // prodsCarrito.forEach((comp) => {
        //     const data = { 
        //         "username": userName,
        //         "email": userEmail,
        //         "password": userPassword   };
        //     const requestOptions = {
        //         method: "POST",
        //         headers: { "Content-Type": "application/json" },
        //         body: JSON.stringify(data)
        //         };
        //         fetch("http://localhost:3000/signup", requestOptions) // "https://jsonplaceholder.typicode.com/posts"
        //         .then(response => response.json())      
        //         .then(res => console.log(res)); 

        // })
        }
    
        
         
    };

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
            </div>

            {!carrito ? (
            <div className = "div_productos">
                <div className = "div_ver_productos">
                    Productos:<br />
                    <section>
                    {listProductos !== [] ? listProductos.map(prod => (
                        <div key = {prod.id} onClick = {() => {ag_carrito(prod.id, prod.nombre)}} className = "div_item_producto">
                        <span>
                            {prod.nombre}
                        </span>
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
                            {prod.nombre}
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
