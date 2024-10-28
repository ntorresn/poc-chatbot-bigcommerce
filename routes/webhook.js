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

    logger.info("******************** webhook GET start ***********************")
    logger.info(req.query, { depth: null, colors: true })
    logger.info("********************webhook GET end ***********************")

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



    logger.info("..................... start getMessageKey .....................")
    let ress = getMessageKey(req.body)
    logger.info('ress: ', ress)
    logger.info("..................... start getMessageKey .....................")


    if (getMessageKey(req.body)) {
        categories = await getCategories()
        products = await getProducts()


        let training = trainingAssistant(categories, products)
        const phoneNumberId = extractPhoneNumberId(req.body)
        const message = extractMessage(req.body) ?? null
        userPhone = message?.from ?? null;

        logger.info("..................... start body .....................")
        logger.info(JSON.stringify(req.body, null, 6))
        logger.info("..................... end body .....................")

        logger.info('userPhone', userPhone)
        logger.info('message : ', message)
        logger.info('phoneNumberId : ', phoneNumberId)


        if (userPhone && message) {
            user = await getUser(userPhone)
            logger.info('user : ', user)
        }
        if (message.type === "text" && user) {

            const text = extractTextMessage(req.body);
            var quantity = parseInt(text, 10);
            if (!isNaN(quantity) && idproducto) {
                logger.info('!isNaN(quantity) && idproducto => quantity = ', quantity, ' idproducto = ', idproducto)
                loading(userPhone, phoneNumberId, 'Por favor espera estamos agregando el producto al carrito ⏳...');
                if (quantity <= 0) {
                    const txt = `❌ No puedes ingresar cantidades en 0 o negativas, intentalo nuevamente`;
                    sendIndividualMessage(userPhone, phoneNumberId, txt);
                    logger.info("########## Cantidad no permitida ###########", idproducto);
                    quantity = 1
                }

                let producto = getProductById(products, idproducto)
                producto.quantity = quantity


                response = await addProductToStore(producto, userPhone)
                if (response.status == 'success') {
                    const txt = `Se agregaron  ${quantity} unidades de ${producto.name} al carrito`;
                    sendIndividualMessage(userPhone, phoneNumberId, txt);
                } else {
                    const txt = `❌ ${response.message}`;
                    sendIndividualMessage(userPhone, phoneNumberId, txt);
                }

            } if (!isNaN(quantity) && idproductoEditar) {
                loading(userPhone, phoneNumberId, 'Por favor espera estamos editando el producto ⏳...');
                producto = getProductById(products, idproductoEditar)
                producto.quantity = quantity


                if (quantity <= 0) {
                    txt = `❌ No puedes ingresar cantidades en 0 o negativas, intentalo nuevamente`;
                    sendIndividualMessage(userPhone, phoneNumberId, txt);
                    logger.error("########## Cantidad no permitida  ###########", idproductoEditar);
                }
                response = await editProductStore(producto, userPhone)
                if (response.status == 'success') {
                    txt = `✅ ${response.message}`;
                    sendIndividualMessage(userPhone, phoneNumberId, txt);
                } else {
                    txt = `❌ ${response.message}`;
                    sendIndividualMessage(userPhone, phoneNumberId, txt);
                }


            }
            else {
                logger.info("********************** start ia *************************************");
                let response = await sendCompletionsAndQuestion(training, text)
                response = JSON.parse(response)
                logger.info('response ia: ', response);
                logger.info("********************** end ia *************************************");

                // sendIndividualMessage(userPhone, phoneNumberId, response.mensajeRespuesta);

                if (response.tipoRespuesta) {
                    switch (response.tipoRespuesta) {
                        case "agregarproducto":
                            loading(userPhone, phoneNumberId, 'Estoy procesando tu solicitud espera un momento ⏳...');

                            if (response.productos.length > 0) {
                                let rowsSection = response.productos.map(producto => {
                                    return {
                                        "id": `producto_${producto.id}`,
                                        "title": producto.nombre.length > 24 ? producto.nombre.slice(0, 21) + '...' : producto.nombre

                                    }
                                });
                                sendInteractiveMessage(userPhone, phoneNumberId, rowsSection, 'Bienvenido', 'Selecciona un producto para continuar', 'Gracias por su preferencia')
                            }
                            break;
                        case "vercarrito":
                            loading(userPhone, phoneNumberId, 'Estoy procesando tu solicitud espera un momento ⏳...');


                            var cart = await getStore(userPhone)

                            if (cart.products.length > 0) {
                                let { resume, total } = getCartResume(cart.products)
                                txt = `Resumen de compra:\n\n${resume}\n\n💰 *Total de la compra:* $${total} \n\n Deseas realizar el pago`
                                sendIndividualMessage(userPhone, phoneNumberId, txt);
                            } else {
                                txt = `🟡 No has registrado productos en el carrito de compras `,
                                    sendIndividualMessage(userPhone, phoneNumberId, txt);
                            }

                            break;

                        case "realizarpago":
                            loading(userPhone, phoneNumberId, 'Estoy procesando tu solicitud espera un momento ⏳...');
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
                                sendIndividualMessage(userPhone, phoneNumberId, txt);

                            }


                            break;

                        case "vaciarcarro":
                            loading(userPhone, phoneNumberId, 'Estoy procesando tu solicitud espera un momento ⏳...');
                            sendConfirmationMessage(userPhone, phoneNumberId, "hello")
                            break;

                        case "eliminarelemento":
                            loading(userPhone, phoneNumberId, 'Estoy procesando tu solicitud espera un momento ⏳...');
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
                                sendIndividualMessage(userPhone, phoneNumberId, txt);
                            }

                            break;

                        case "editarproducto":
                            loading(userPhone, phoneNumberId, 'Estoy procesando tu solicitud espera un momento ⏳...');
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
                                sendIndividualMessage(userPhone, phoneNumberId, txt);
                            }
                            break;

                        case "":
                            break;


                    }
                } else {
                    sendIndividualMessage(userPhone, phoneNumberId, response.mensajeRespuesta);
                }
            }

        }
        else if (message.type == 'interactive' && user) {

            if (message.interactive.list_reply) {
                loading(userPhone, phoneNumberId, 'Estoy procesando tu solicitud espera un momento ⏳...');
                message.interactive.list_reply
                if (message.interactive.list_reply.id.includes("producto")) {
                    idproducto = message.interactive.list_reply.id.split("_")[1]
                    let product = getProductById(products, idproducto)

                    let txt = `Has seleccionado el producto: \n*${product.name}*\n`;
                    await sendIndividualMessage(userPhone, phoneNumberId, txt);
                    await showProductWithImage(userPhone, phoneNumberId, product);
                    txt = `¿Cuál es la cantidad que deseas? :`;
                    await sendIndividualMessage(userPhone, phoneNumberId, txt);
                } else if (message.interactive.list_reply.id.includes("eliminar")) {
                    idproducto = message.interactive.list_reply.id.split("_")[1]
                    response = await removeProductFromStore(idproducto, userPhone)

                    if (response.status == 'success') {
                        txt = `✅ El producto fue eliminado exitosamente`
                        sendIndividualMessage(userPhone, phoneNumberId, txt);
                    } else {
                        txt = `❌ No se pudo eliminar el producto`
                        sendIndividualMessage(userPhone, phoneNumberId, txt);
                    }

                } else if (message.interactive.list_reply.id.includes("editar")) {
                    idproducto = null
                    idproductoEditar = message.interactive.list_reply.id.split("_")[1]
                    let product = getProductById(products, idproductoEditar)

                    let txt = `Has seleccionado el producto : \n*${product.name}*\n`;
                    await sendIndividualMessage(userPhone, phoneNumberId, txt);
                    await showProductWithImage(userPhone, phoneNumberId, product);
                    txt = `¿Cuál es la nueva cantidad que deseas? :`;
                    await sendIndividualMessage(userPhone, phoneNumberId, txt);
                }

            } else if (message.interactive.button_reply) {
                loading(userPhone, phoneNumberId, 'Estoy procesando tu solicitud espera un momento ⏳...');
                id = message.interactive.button_reply.id
                if (id == 'confirm_yes') {
                    response = await removeStore(userPhone)
                    if (response.status == 'success') {
                        txt = `✅ El carrito fue eliminado exitosamente`
                        sendIndividualMessage(userPhone, phoneNumberId, txt);
                    } else {
                        txt = `❌ No se pudo eliminar el carrito de compras`
                        sendIndividualMessage(userPhone, phoneNumberId, txt);
                    }
                }
            }

        }
    }


    const phoneNumberId = extractPhoneNumberId(req.body)
    const message = extractMessage(req.body) ?? null
    userPhone = message?.from ?? null;
    logger.info("::::: userInfo ", userPhone, " message ", message)

    if (!user && userPhone) {
        sendIndividualMessage(userPhone, phoneNumberId,
            `¡Hola! 👋 Bienvenido a Macsodi 
            🛒\n\nEstamos encantados de ayudarte con tus compras. 😊 \n
            Estan son algunas de las categorias que tenemos disponible para ti: \n
             ${categories.map((category) => `${category.name}\n`).join(", ")}
            `);
        user = await createUser(userPhone)
        await createStore(userPhone)
    }



    res.sendStatus(200);

})

const loading = async (to, phoneNumberId, text) => {
    sendIndividualMessage(to, phoneNumberId, text)
}
module.exports = router;
