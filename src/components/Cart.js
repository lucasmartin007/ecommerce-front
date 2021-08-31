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

    // const [rutProducto, setRutProducto] = useState("");
    const rutProducto = "productos/ferreter.jpg";

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

    const ins_met_pago = (id_orden, met_pago, num_tarjeta, cod_tarjeta, prec_total) => {
        let data = {};
        if(num_tarjeta === "" && cod_tarjeta === ""){
            data = { 
                "ordenId": id_orden,
                "metodoPago": met_pago,
                "precioTotal": prec_total   };
        }else{
            data = { 
                "ordenId": id_orden,
                "metodoPago": met_pago,
                "numeroTarjeta": parseInt(num_tarjeta),
                "codigoTarjeta": parseInt(cod_tarjeta),
                "precioTotal": prec_total   };
        }
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
            };
        fetch("http://localhost:3000/checkouts", requestOptions) // "https://jsonplaceholder.typicode.com/posts"
            .then(response => response.json())
            .then(res => console.log(res));
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
            let met_pago = document.getElementById("selec_met_pago").value;
            let num_tarjeta = document.getElementById("inp_num_tarjeta").value;
            let cod_tarjeta = document.getElementById("inp_cod_tarjeta").value;
            ins_met_pago(idOrden, met_pago, num_tarjeta, cod_tarjeta, prec_total);

            let tokens = store.getState().data.token.split(".");
            let json_parse = JSON.parse(atob(tokens[1]));
            let id_de_usuario = json_parse.id;
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

    const busc_ult_orden = () => {
      let ult_orden = [];
      let id_ult_orden = 0;
      axios
          .get("http://localhost:3000/ordenes/ultima-orden")
          .then((res) => {
              ult_orden = res;
              id_ult_orden = res.data[0].id;
              console.log(res.data);
              console.log(id_ult_orden);
              ag_ordenes_productos(id_ult_orden);
          });
      console.log(ult_orden)
    }

    const confirmarCarrito = e => {
        let div_checkout = document.getElementById("div_checkout");
        div_checkout.style.display = "block";
    }

    const verificarInputs = e => {
        let selec_met_pago = document.getElementById("selec_met_pago");
        if(selec_met_pago.value === "Debito" || selec_met_pago.value === "Credito"){
            document.getElementById("inp_num_tarjeta").disabled = false;
            document.getElementById("inp_cod_tarjeta").disabled = false;
        }else if(selec_met_pago.value === "Efectivo"){
            document.getElementById("inp_num_tarjeta").disabled = true;
            document.getElementById("inp_cod_tarjeta").disabled = true;            
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
                .then(res => {
                  console.log(res)
                  busc_ult_orden();
                });
            // console.log(store.getState())
        }
    };

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

    useEffect(() => {
        verificar_login();

        setProdsCarrito(store.getState().data.itemsCarrito)

        if(logueado){
            busc_nom_usuario();
        }

        // setRutProducto("https://www.modregohogar.com/329118-home_default/tornillo-hexagonal-hispanox-din-933-a2-5x20-acero-inoxidable.jpg");
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
            
            <div className = "div_detalle_compra_carrito">
                <div className = "div_ver_detalles_carrito">
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
                    <button onClick = {confirmarCarrito} className = "bot_comprar">Confirmar</button>
                </div>
            </div>

            <div className = "div_checkout" id = "div_checkout">
                <div className = "div_ver_checkout">
                    Confirmacion<br /><br />
                    <section className = "sect_checkout">
                        Metodo de pago:<br />
                        <select name="met_pago" className = "selec_met_pago" id = "selec_met_pago" onChange = {verificarInputs}>
                            <option value="Efectivo">Efectivo</option>
                            <option value="Debito">Debito</option>
                            <option value="Credito">Credito</option>
                        </select><br />
                        Numero de tarjeta:<br />
                        <input type = "text" name = "inp_num_tarjeta" id = "inp_num_tarjeta" disabled /><br />
                        Codigo de tarjeta:<br />
                        <input type = "password" name = "inp_cod_tarjeta" id = "inp_cod_tarjeta" disabled />
                        <br /><br />

                        <button type = "submit" onClick = {handleSubmitPurchase}>Comprar</button>                                            
                    </section>
                </div>
            </div>
        </div>
    )
}

// export default Ecommerce
