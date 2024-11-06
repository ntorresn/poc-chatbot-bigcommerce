const express = require('express');
const { generateCheckout, createCart, getProducts, getCategories } = require('../services/bigcommerce/bigCommerceService.js');
const { extractMessage, extractPhoneNumberId, extractTextMessage, trainingAssistant, getProductById, getCartResume, getMessageKey } = require('../utils/util.js');
const { getUser, createUser } = require('../services/poc-api/userService.js');
const { createStore, addProductToStore, removeProductFromStore, getStore, removeStore, editProductStore } = require('../services/poc-api/cartService.js');
const { sendIndividualMessage, sendInteractiveMessage, showProductWithImage, sendConfirmationMessage, sendImageMessage } = require('../services/whatsapp/apiWhatsapp.js');
const { sendCompletionsAndQuestion } = require('../services/open-ia/openIaService.js');
const logger = require('./../utils/logger');

const router = express.Router();
const { WEBHOOK_VERIFY_TOKEN } = process.env

var idproducto = null
var idproductoEditar = null
var categories = []
var products = []
var user = null
var userPhone = null

router.post('/test-ia', async function (req, res, next) {
    let categories = await getCategories()
    let products = await getProducts()
    let training = trainingAssistant(categories, products)

    let response = await sendCompletionsAndQuestion(training, req.body.text)
    let data = JSON.parse(response)
    res.json(JSON.parse(response))

})

router.get('/', async function (req, res, next) {

    console.log("******************** webhook GET start ***********************")
    console.log(req.query, { depth: null, colors: true })
    console.log("********************webhook GET end ***********************")

    const mode = req.query["hub.mode"]
    const token = req.query["hub.verify_token"]
    const challenge = req.query["hub.challenge"]

    if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
        res.status(200).send(challenge)
    } else {
        res.sendStatus(403)
    }

})

router.post('/', async function (req, res, next) {



    console.log("\n\n\n\n\n\n")
    console.log("----------------------------------------------------[1]-------------------------------------------------------")
    console.log("..................... start MessageKey .....................")
    let MessageKey = getMessageKey(req.body)
    console.log('MessageKey: ', MessageKey)
    console.log("..................... end MessageKey .....................")






    if (MessageKey) {

        categories = await getCategories()
        products = await getProducts()
        console.log("Categories ", categories)


        let training = trainingAssistant(categories, products)
        const text = extractTextMessage(req.body);
        let response = await sendCompletionsAndQuestion(training, text)
        console.log("..................... start ia .....................")
        response = JSON.parse(response)
        console.log(response);
        console.log("..................... end   ia .....................")


        phoneNumberId = extractPhoneNumberId(req.body)
        message = extractMessage(req.body) ?? null
        userPhone = message?.from ?? null;
        console.log('[userPhone = ', userPhone)
        console.log('[message] = ', message)
        console.log('[phoneNumberId] = ', phoneNumberId)
        console.log('[response.mensajeRespuesta] = ', response.mensajeRespuesta)


        await sendIndividualMessage(userPhone, phoneNumberId, response.mensajeRespuesta, message);
        /*
     
     
        let training = trainingAssistant(categories, products)
        var phoneNumberId = extractPhoneNumberId(req.body)
        var message = extractMessage(req.body) ?? null
        userPhone = message?.from ?? null;
     
        console.log("..................... start body .....................")
        console.log(JSON.stringify(req.body, null, 6))
        console.log("..................... end body .....................")
     
        console.log('userPhone', userPhone)
        console.log('message : ', message)
        console.log('phoneNumberId : ', phoneNumberId)
     
        userPhone = '573160794094'
        phoneNumberId = '428066220396970'
     
     
     
        if (userPhone && message) {
            user = await getUser(userPhone)
            console.log('user : ', user)
        }
        if (message.type === "text" && user) {
     
            const text = extractTextMessage(req.body);
            var quantity = parseInt(text, 10);
            if (!isNaN(quantity) && idproducto) {
                console.log('!isNaN(quantity) && idproducto => quantity = ', quantity, ' idproducto = ', idproducto)
     
                console.log(`1 $$$$$$$$$$$$$$$$$$$$$$$${userPhone}$$$$$$$$$$$$$$$$$$$$$$$$$$$`);
     
                await loading(userPhone, phoneNumberId, 'Por favor espera estamos agregando el producto al carrito ⏳...');
                console.log(`2 $$$$$$$$$$$$$$$$$$$$$$$${userPhone}$$$$$$$$$$$$$$$$$$$$$$$$$$$`);
                if (quantity <= 0) {
                    const txt = `❌ No puedes ingresar cantidades en 0 o negativas, intentalo nuevamente`;
                    await sendIndividualMessage(userPhone, phoneNumberId, txt, message);
                    console.log("########## Cantidad no permitida ###########", idproducto);
                    quantity = 1
                }
     
                let producto = getProductById(products, idproducto)
                producto.quantity = quantity
                console.log('producto', producto)
                console.log(`3 $$$$$$$$$$$$$$$$$$$$$$$${userPhone}$$$$$$$$$$$$$$$$$$$$$$$$$$$`);
     
     
                var responseAddProductToStore = await addProductToStore(producto, userPhone)
                console.log(`4 $$$$$$$$$$$$$$$$$$$$$$$${userPhone}$$$$$$$$$$$$$$$$$$$$$$$$$$$`);
                console.log('responseAddProductToStore ', responseAddProductToStore)
     
                if (responseAddProductToStore.status == 'success') {
                    const txt = `Se agregaron  ${quantity} unidades de ${producto.name} al carrito`;
                    console.log(`5 $$$$$$$$$$$$$$$$$$$$$$$${userPhone}$$$$$$$$$$$$$$$$$$$$$$$$$$$`);
                    await sendIndividualMessage(userPhone, phoneNumberId, txt, message);
                } else {
                    const txt = `❌ ${responseAddProductToStore.message}`;
                    await sendIndividualMessage(userPhone, phoneNumberId, txt, message);
                }
     
            } if (!isNaN(quantity) && idproductoEditar) {
                await loading(userPhone, phoneNumberId, 'Por favor espera estamos editando el producto ⏳...');
                producto = getProductById(products, idproductoEditar)
                producto.quantity = quantity
     
     
                if (quantity <= 0) {
                    txt = `❌ No puedes ingresar cantidades en 0 o negativas, intentalo nuevamente`;
                    await sendIndividualMessage(userPhone, phoneNumberId, txt, message);
                    logger.error("########## Cantidad no permitida  ###########", idproductoEditar);
                }
                var responseEditProductStore = await editProductStore(producto, userPhone)
                if (responseEditProductStore.status == 'success') {
                    txt = `✅ ${responseEditProductStore.message}`;
                    await sendIndividualMessage(userPhone, phoneNumberId, txt, message);
                } else {
                    txt = `❌ ${responseEditProductStore.message}`;
                    await sendIndividualMessage(userPhone, phoneNumberId, txt, message);
                }
     
     
            }
            else {
                console.log("********************** start ia *************************************");
                let response = await sendCompletionsAndQuestion(training, text)
                response = JSON.parse(response)
                console.log('response ia: ', response);
                console.log("********************** end ia *************************************");
     
                // await sendIndividualMessage(userPhone, phoneNumberId, response.mensajeRespuesta);
     
                if (response.tipoRespuesta) {
                    switch (response.tipoRespuesta) {
                        case "agregarproducto":
                            await loading(userPhone, phoneNumberId, 'Estoy procesando tu solicitud espera un momento ⏳...');
     
                            if (response.productos.length > 0) {
                                let rowsSection = response.productos.map(producto => {
                                    return {
                                        "id": `producto_${producto.id}`,
                                        "title": producto.nombre.length > 24 ? producto.nombre.slice(0, 21) + '...' : producto.nombre
     
                                    }
                                });
                                sendInteractiveMessage(userPhone, phoneNumberId, rowsSection, 'Agregar producto', 'Selecciona un producto para continuar', 'Gracias por su preferencia')
                            }
                            break;
                        case "vercarrito":
                            await loading(userPhone, phoneNumberId, 'Estoy procesando tu solicitud espera un momento ⏳...');
     
     
                            var cart = await getStore(userPhone)
     
                            if (cart.products.length > 0) {
                                let { resume, total } = getCartResume(cart.products)
                                txt = `Resumen de compra:\n\n${resume}\n\n💰 *Total de la compra:* $${total} \n\n Deseas realizar el pago`
                                await sendIndividualMessage(userPhone, phoneNumberId, txt, message);
                            } else {
                                txt = `🟡 No has registrado productos en el carrito de compras `,
                                    await sendIndividualMessage(userPhone, phoneNumberId, txt, message);
                            }
     
                            break;
     
                        case "realizarpago":
                            await loading(userPhone, phoneNumberId, 'Estoy procesando tu solicitud espera un momento ⏳...');
                            var cart = await getStore(userPhone)
     
     
                            const line_items = cart.products.map((product) => {
                                return {
                                    quantity: product.quantity,
                                    product_id: product.id
                                };
                            });
     
     
                            if (line_items.length > 0) {
                                let idcart = await createCart(line_items);
                                let response = await generateCheckout(idcart)
                                txt = `Para continuar con tu compra, ingresa al siguiente 🌐 link: 💰 ${response.embedded_checkout_url}`
                                await sendIndividualMessage(userPhone, phoneNumberId, txt, message);
     
                            }
     
     
                            break;
     
                        case "vaciarcarro":
                            await loading(userPhone, phoneNumberId, 'Estoy procesando tu solicitud espera un momento ⏳...');
                            sendConfirmationMessage(userPhone, phoneNumberId, "hello", message)
                            break;
     
                        case "eliminarelemento":
                            await loading(userPhone, phoneNumberId, 'Estoy procesando tu solicitud espera un momento ⏳...');
                            var cart = await getStore(userPhone)
                            if (cart.products.length > 0) {
                                let rowsSection = cart.products.map(product => {
                                    return {
                                        "id": `eliminar_${product.id}`,
                                        "title": product.name.length > 24 ? product.name.slice(0, 21) + '...' : product.name
     
                                    }
                                });
                                sendInteractiveMessage(userPhone, phoneNumberId, rowsSection, 'Eliminar', 'Selecciona el producto a eliminar', 'Gracias por su preferencia')
                            } else {
                                const txt = `❌ No puedes eliminar elementos, el carrito se encuentra vacio`;
                                await sendIndividualMessage(userPhone, phoneNumberId, txt, message);
                            }
     
                            break;
     
                        case "editarproducto":
                            await loading(userPhone, phoneNumberId, 'Estoy procesando tu solicitud espera un momento ⏳...');
                            var cart = await getStore(userPhone)
                            if (cart.products.length > 0) {
                                let rowsSection = cart.products.map(product => {
                                    return {
                                        "id": `editar_${product.id}`,
                                        "title": product.name.length > 24 ? product.name.slice(0, 21) + '...' : product.name
     
                                    }
                                });
                                sendInteractiveMessage(userPhone, phoneNumberId, rowsSection, 'Eliminar', 'Selecciona el producto', 'Gracias por su preferencia')
                            } else {
                                const txt = `❌ No puedes editar productos, el carrito se encuentra vacio`;
                                await sendIndividualMessage(userPhone, phoneNumberId, txt);
                            }
                            break;
     
                        case "categorias":
                            if (response.categorias) {
                                const categoriasTexto = response.categorias.join('\n');
                                txt = `${response.mensasjeRespuesta}\n\n ${categoriasTexto} `
                                await sendIndividualMessage(userPhone, phoneNumberId, categoriasTexto, message);
                            }
                            break;
     
     
                    }
                } else {
                    await sendIndividualMessage(userPhone, phoneNumberId, response.mensajeRespuesta, message);
                }
            }
     
        }
        else if (message.type == 'interactive' && user) {
     
            if (message.interactive.list_reply) {
                await loading(userPhone, phoneNumberId, 'Estoy procesando tu solicitud espera un momento ⏳...');
                message.interactive.list_reply
                if (message.interactive.list_reply.id.includes("producto")) {
                    idproducto = message.interactive.list_reply.id.split("_")[1]
                    let product = getProductById(products, idproducto)
     
                    let txt = `Has seleccionado el producto: \n*${product.name}*\n`;
                    // await await sendIndividualMessage(userPhone, phoneNumberId, txt);
                    await showProductWithImage(userPhone, phoneNumberId, product);
                    txt = `¿Cuál es la cantidad que deseas? :`;
                    // await await sendIndividualMessage(userPhone, phoneNumberId, txt);
                } else if (message.interactive.list_reply.id.includes("eliminar")) {
                    idproducto = message.interactive.list_reply.id.split("_")[1]
                    response = await removeProductFromStore(idproducto, userPhone)
     
                    if (response.status == 'success') {
                        txt = `✅ El producto fue eliminado exitosamente`
                        await sendIndividualMessage(userPhone, phoneNumberId, txt, message);
                    } else {
                        txt = `❌ No se pudo eliminar el producto`
                        await sendIndividualMessage(userPhone, phoneNumberId, txt, message);
                    }
     
                } else if (message.interactive.list_reply.id.includes("editar")) {
                    idproducto = null
                    idproductoEditar = message.interactive.list_reply.id.split("_")[1]
                    let product = getProductById(products, idproductoEditar)
     
                    let txt = `Has seleccionado el producto : \n*${product.name}*\n`;
                    await await sendIndividualMessage(userPhone, phoneNumberId, txt, message);
                    await showProductWithImage(userPhone, phoneNumberId, product);
                    txt = `¿Cuál es la nueva cantidad que deseas? :`;
                    await await sendIndividualMessage(userPhone, phoneNumberId, txt, message);
                }
     
            } else if (message.interactive.button_reply) {
                await loading(userPhone, phoneNumberId, 'Estoy procesando tu solicitud espera un momento ⏳...');
                id = message.interactive.button_reply.id
                if (id == 'confirm_yes') {
                    response = await removeStore(userPhone)
                    if (response.status == 'success') {
                        txt = `✅ El carrito fue eliminado exitosamente`
                        await sendIndividualMessage(userPhone, phoneNumberId, txt, message);
                    } else {
                        txt = `❌ No se pudo eliminar el carrito de compras`
                        await sendIndividualMessage(userPhone, phoneNumberId, txt, message);
                    }
                }
            }
     
        }
        */
    }



    /*
    if (!user && userPhone) {
 
 
 
        await sendIndividualMessage(userPhone, phoneNumberId,
            `¡Hola! 👋 Bienvenido a Macsodi 
            🛒\n\nEstamos encantados de ayudarte con tus compras. 😊 \n
            Estan son algunas de las categorias que tenemos disponible para ti: \n
             ${categories.map((category) => `${category.name}\n`).join(", ")}
            `, null);
        user = await createUser(userPhone)
        await createStore(userPhone)
    }
    */

    console.log("----------------------------------------------------[2]-------------------------------------------------------")
    console.log("\n\n\n\n\n\n")


    res.sendStatus(200);

})

const loading = async (to, phoneNumberId, text) => {
    return new Promise(async (resolve, reject) => {
        try {
            let data = await sendIndividualMessage(to, phoneNumberId, text, null)
            resolve(data)
        } catch (error) {
            reject(error)
        }

    });
}
module.exports = router;
