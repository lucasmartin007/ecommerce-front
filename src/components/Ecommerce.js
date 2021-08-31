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

    const [nomUsuario, setNomUsuario] = useState("");

    const [prodsCarrito, setProdsCarrito] = useState([]);

    const [cantTotal, setCantTotal] = useState(0);
    const [multiplicador, setMultiplicador] = useState(1);    
    const [totalPaginas, setTotalPaginas] = useState(0);
    const pageNumbers = [];
    const cant_por_pagina = 5;

    // const [rutProducto, setRutProducto] = useState("");
    const rutProducto = "productos/ferreter.jpg";

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

        // setProdsCarrito([])

        console.log("El usuario esta logueado:" + logueado);
    }

    const verProductosPaginacion = (multiplica) => {
        let n_list_productos = [];
        for(let i = (multiplica - 1) * cant_por_pagina; i < (multiplica - 1) * cant_por_pagina + cant_por_pagina; i++){
            n_list_productos.push(listProductosInicial[i]);
            if(i === listProductosInicial.length - 1){
                break;
            }
        }
        setListProductos(n_list_productos);
        console.log(listProductos);
    }

    const verProductos = (cantProductos, multiplica) => {
        const url_ver_productos = "http://localhost:3000/productos";
        const requestOptionsMensajes = {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        };
		fetch(url_ver_productos)
            .then(res => res.json())
            .then(data => {
                setListProductosInicial(data);
            });
    }

    const verProductosInicial2 = (cant_productos) => {
        const url_ver_productos = "http://localhost:3000/productos-paginacion/" + cant_productos + "/" + cant_por_pagina + "/1";
        const requestOptionsMensajes = {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        };
		fetch(url_ver_productos)
            .then(res => res.json())
            .then(data => {
                setListProductos(data);
            });
    }

    const verProductosInicial = () => {
        const url_ver_productos = "http://localhost:3000/productos/count";
        const requestOptionsMensajes = {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        };
		fetch(url_ver_productos)
            .then(res => res.json())
            .then(data => {
                setCantTotal(data.count);
                setTotalPaginas(Math.ceil(data.count / cant_por_pagina));
                verProductosInicial2(data.count);
            });
    }

    const cargarPageNumbers = (cant_productos) => {
        for (let i = 1; i <= Math.ceil(cant_productos / cant_por_pagina); i++) {
            pageNumbers.push(i);
        }
        console.log(pageNumbers)
        return(
            pageNumbers.length > 1 ? pageNumbers.map(num => (
                <span>
                    <span onClick = {() => {verProductosPaginacion(num)}} className = "span_paginacion">
                        {num}
                    </span>
                    &nbsp;&nbsp;
                </span>
            )) : (<></>)
        )
    }

    const ag_carrito = (id_producto, nom_producto, prec_producto, url_imag_producto) => {
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
            "url_imagen":url_imag_producto
        })
        }

        setProdsCarrito(listaActual)

        store.dispatch(updateItemsCarrito(tokenUsuario, listaActual))
    }

    const removerCarrito = id_producto => {
        let n_prods_carrito = [];
        prodsCarrito.forEach(prod => {
            if(prod.id !== id_producto){
                n_prods_carrito.push(prod);
            }
        });
        setProdsCarrito(n_prods_carrito);
        store.dispatch(updateItemsCarrito(tokenUsuario, n_prods_carrito));
    }

    const actualizarCantidad = id_producto => {
        let n_prods_carrito = [];
        prodsCarrito.forEach(prod => {
            if(prod.id !== id_producto){
                n_prods_carrito.push(prod);
            }else{
                let n_cantidad = document.getElementById("inp_cantidad_actualizar" + id_producto).value;
                if(n_cantidad > 0){
                let n_item = {
                    "id":id_producto,
                    "nombre":prod.nombre,
                    "precio":prod.precio,
                    "cantidad":parseInt(n_cantidad),
                    "url_imagen":prod.url_imagen
                };
                n_prods_carrito.push(n_item);
                
                }else{
                n_prods_carrito.push(prod);
                }
            }
        });
        setProdsCarrito(n_prods_carrito);
        store.dispatch(updateItemsCarrito(tokenUsuario, n_prods_carrito));
    }

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
        const establecerCantTotal = (cantTotal) => {
            setCantTotal(cantTotal);
        }
        establecerCantTotal(cantTotal);
    }, [cantTotal]);

    useEffect(() => {
        const establecerTotalPaginas = (totalPaginas) => {
            setTotalPaginas(totalPaginas);
        }
        establecerTotalPaginas(totalPaginas);
    }, [totalPaginas]);

    useEffect(() => {
        verificar_login();

        if(logueado){
            busc_nom_usuario();
        }

        verProductosInicial();
        verProductos();
        // verProductosPaginacion();
        // setRutProducto("https://www.modregohogar.com/329118-home_default/tornillo-hexagonal-hispanox-din-933-a2-5x20-acero-inoxidable.jpg");

        setProdsCarrito(store.getState().data.itemsCarrito);
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

            <div className = "div_productos">
                <div className = "div_ver_productos">
                    Productos:<br />
                    <section className = "sect_productos">
                    {listProductos.length !== 0 ? listProductos.map(prod => (
                        <div key = {prod.id} className = "div_item_producto">
                        <div className = "div_imag_producto">
                            {prod.url_imagen !== null ? (
                                <img src = {prod.url_imagen} className = "imag_producto" />
                            ) : (
                                <img src = {rutProducto} className = "imag_producto" />
                            )}
                            
                        </div>
                        <div className = "div_det_producto">
                            <div className = "div_centrar">
                            <span className = "span_nombre">
                                {prod.nombre}
                            </span>
                            <br />
                            <span className = "span_precio">
                                ${prod.precio}
                            </span>
                            <br />
                            <span className = "span_cantidad">
                                Cantidad:
                            </span>
                            <br />
                            <span className = "span_inp_cantidad">
                                <input type = "number" id = {"inp_cantidad" + prod.id} className = "inp_cantidad" onKeyPress={isNumberKey} />
                            </span>
                            <br />
                            <span onClick = {() => {ag_carrito(prod.id, prod.nombre, prod.precio, prod.url_imagen)}} className = "span_ag_carrito">Agregar</span>
                            </div>
                        </div>
                        </div>
                    )) : (<></>)}
                    </section>
                    <div className = "div_paginacion">
                        {cargarPageNumbers(cantTotal)}
                    </div>
                </div>
            </div>

            <div className = "div_detalle_compra">
                <div className = "div_ver_detalles">
                    Carrito actual:<br />
                    <section className = "sect_carrito">
                    {prodsCarrito !== [] ? prodsCarrito.map(prod => (
                        <div key = {prod.id} className = "div_item_producto">
                        <div className = "div_imag_producto">
                            {prod.url_imagen !== null ? (
                                <img src = {prod.url_imagen} className = "imag_producto" />
                            ) : (
                                <img src = {rutProducto} className = "imag_producto" />
                            )}
                            
                        </div>
                        <div className = "div_det_producto">
                            <div className = "div_centrar">
                            <span className = "span_nombre">
                                {prod.nombre}
                            </span>
                            <br />
                            <span className = "span_precio">
                                ${prod.precio}
                            </span>
                            <br />
                            <span>
                                Cantidad: {prod.cantidad}
                            </span><br />
                            <span className = "span_inp_cantidad">
                                <input type = "number" id = {"inp_cantidad_actualizar" + prod.id} className = "inp_cantidad" />
                            </span><br />
                            <span onClick = {() => {actualizarCantidad(prod.id)}} className = "span_carrito_actualizar">Actualizar</span><br />
                            <span onClick = {() => {removerCarrito(prod.id)}} className = "span_carrito_remover">Remover</span>

                            </div>
                        </div>
                        </div>
                    )) : {}}
                    </section>
                </div>
            </div>
        </div>
    )
}

// export default Ecommerce

