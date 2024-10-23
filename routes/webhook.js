const express = require('express');
const { getCategories } = require('../services/bigcommerce/categoriesService.js');
const { getProducts } = require('../services/bigcommerce/productService.js');
const { createCartBigCommerce } = require('../services/bigcommerce/createCartService.js');
const { generateCheckoutBigCommerce } = require('../services/bigcommerce/generateCheckoutService.js');
const { extractMessage, extractPhoneNumberId, extractTextMessage, trainingAssistant, getProductById, getCartResume } = require('../utils/util.js');
const { getUser, createUser } = require('../services/poc-api/userService.js');
const { createCart, addProductToCart, removeProductToCart, getCart, removeCart } = require('../services/poc-api/cartService.js');
const { sendIndividualMessage, sendInteractiveMessage, showProductWithImage, sendConfirmationMessage } = require('../services/whatsapp/apiWhatsapp.js');
const { sendCompletionsAndQuestion } = require('../services/open-ia/openIaService.js');

const router = express.Router();
const { WEBHOOK_VERIFY_TOKEN } = process.env;

var idproducto = null
var categories = []
var products = []
var user = null

router.post('/test-ia', async function (req, res, next) {
    let categories = await getCategories();
    let products = await getProducts();
    let training = trainingAssistant(categories, products);

    let response = await sendCompletionsAndQuestion(training, req.body.text);
    let data = JSON.parse(response)
    res.json(JSON.parse(response))

})
router.get('/', async function (req, res, next) {

    console.log("********************webhook start get***********************")
    console.dir(req.query, { depth: null, colors: true })
    console.log("********************webhook end get***********************")

    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }

});

router.post('/', async function (req, res, next) {
    console.log("********************* BODY **************************************");
    // console.log(JSON.stringify(req.body, null, 6))




    console.log("********************** categories *************************************");
    // console.log(JSON.stringify(categories, null, 6))
    // console.log(categories.length);


    console.log("********************** products *************************************");
    // console.log(products.length);

    // console.log(JSON.stringify(products, null, 6))


    categories = await getCategories();
    products = await getProducts();

    let training = trainingAssistant(categories, products);
    const phoneNumberId = extractPhoneNumberId(req.body);
    const message = extractMessage(req.body) ?? null;
    userPhone = message?.from ?? null;


    console.log('userPhone', userPhone);
    console.log('message : ', message);
    console.log('phoneNumberId : ', phoneNumberId);


    if (userPhone && message) {
        user = await getUser(userPhone);
        console.log('user : ', user);
    }


    if (!user && userPhone) {
        sendIndividualMessage(userPhone, phoneNumberId, "¡Hola! 👋 Bienvenido a Macsodi 🛒\n\nEstamos encantados de ayudarte con tus compras. Puedes escribir:\n1️⃣ Ver productos\n2️⃣ Ver carrito\n3️⃣ Ayuda\n\n¡Estamos aquí para lo que necesites! 😊");
        // sendInteractiveMessage(userPhone, phoneNumberId, [])
        user = await createUser(userPhone)
        await createCart(userPhone)

    }

    if (message.type === "text") {

        const text = extractTextMessage(req.body);
        var quantity = parseInt(text, 10);
        if (!isNaN(quantity) && idproducto) {

            if (quantity <= 0) {
                const txt = `❌ No puedes ingresar cantidades en 0 o negativas, intentalo nuevamente`;
                sendIndividualMessage(userPhone, phoneNumberId, txt);
                console.log("########## Cantidad no permitida ###########", idproducto);
                quantity = 1
            }

            // console.log("**************************************************");
            // console.log("idproducto => ", idproducto);
            // console.log("quantity => ", quantity);

            let producto = getProductById(products, idproducto)
            producto.quantity = quantity


            response = await addProductToCart(producto, userPhone)

            console.log(".....................................................");
            console.log(response);


            if (response.status == 'success') {
                const txt = `Se agregaron  ${quantity} unidades de ${producto.name} al carrito`;
                sendIndividualMessage(userPhone, phoneNumberId, txt);
            } else {
                const txt = `❌ ${response.message}`;
                sendIndividualMessage(userPhone, phoneNumberId, txt);
            }


        } else {
            // console.log("\n\n\n");
            // console.log("********************** sendCompletionsAndQuestion *************************************");
            let response = await sendCompletionsAndQuestion(training, text)
            response = JSON.parse(response)
            console.log('response', response);

            sendIndividualMessage(userPhone, phoneNumberId, response.mensajeRespuesta);

            switch (response.tipoRespuesta) {
                case "agregarproducto":
                    if (response.productos.length > 0) {
                        let rowsSection = response.productos.map(producto => {
                            return {
                                "id": `producto_${producto.id}`,
                                "title": producto.nombre.length > 24 ? producto.nombre.slice(0, 21) + '...' : producto.nombre

                            }
                        });
                        console.log(rowsSection);


                        sendInteractiveMessage(userPhone, phoneNumberId, rowsSection, 'Bienvenido', 'Selecciona un producto para continuar', 'Gracias por su preferencia')
                    }
                    break;
                case "vercarrito":
                    console.log("Voy a ver el carrito....");
                    console.log(userPhone);


                    var cart = await getCart(userPhone)

                    if (cart.products.length > 0) {
                        let { resume, total } = getCartResume(cart.products)
                        txt = `Resumen de compra:\n\n${resume}\n\n💰 *Total de la compra:* $${total} \n\n Deseas realizar el pago`
                        sendIndividualMessage(userPhone, phoneNumberId, txt);
                    } else {
                        txt = `🟡 No has registrado productos en el carrito de compras `,
                            sendIndividualMessage(userPhone, phoneNumberId, txt);
                    }
                    console.log(cart);

                    break;

                case "realizarpago":
                    console.log("Voy a realizar el pago ...");
                    var cart = await getCart(userPhone)


                    const line_items = cart.products.map((product) => {
                        return {
                            quantity: product.quantity,
                            product_id: product.id
                        };
                    });

                    console.log('line_items', line_items);


                    if (line_items.length > 0) {
                        let idcart = await createCartBigCommerce(line_items);
                        console.log('idcart => ', idcart);
                        let response = await generateCheckoutBigCommerce(idcart)
                        console.log('response => ', response);
                        txt = `Para continuar con tu compra, ingresa al siguiente 🌐 link: 💰 ${response.embedded_checkout_url}`
                        sendIndividualMessage(userPhone, phoneNumberId, txt);

                    }


                    break;
                case "vaciarcarro":
                    console.log("Voy a vaciar el carrito ...");

                    sendConfirmationMessage(userPhone, phoneNumberId, "hello")

                    break;

                case "eliminarelemento":
                    console.log("Voy a eliminar un elemento ...");
                    var cart = await getCart(userPhone)
                    if (cart.products.length > 0) {
                        let rowsSection = cart.products.map(product => {
                            return {
                                "id": `eliminar_${product.id}`,
                                "title": product.name.length > 24 ? product.name.slice(0, 21) + '...' : product.name

                            }
                        });
                        console.log(rowsSection);
                        sendInteractiveMessage(userPhone, phoneNumberId, rowsSection, 'Eliminar', 'Selecciona el producto a eliminar', 'Gracias por su preferencia')
                    } else {
                        const txt = `❌ No puedes eliminar elementos, el carrito se encuentra vacio`;
                        sendIndividualMessage(userPhone, phoneNumberId, txt);
                    }

                    break;
            }

        }




    }
    else if (message.type == 'interactive') {


        if (message.interactive.list_reply) {
            message.interactive.list_reply
            if (message.interactive.list_reply.id.includes("producto")) {
                idproducto = message.interactive.list_reply.id.split("_")[1]
                let product = getProductById(products, idproducto)

                console.log(product);


                let txt = `Has seleccionado el producto: \n*${product.name}*\n`;
                await sendIndividualMessage(userPhone, phoneNumberId, txt);
                await showProductWithImage(userPhone, phoneNumberId, product);
                txt = `¿Cuál es la cantidad que deseas? :`;
                await sendIndividualMessage(userPhone, phoneNumberId, txt);
            } else if (message.interactive.list_reply.id.includes("eliminar")) {
                idproducto = message.interactive.list_reply.id.split("_")[1]

                console.log("::::::::::::: ::::::::::::::::");
                response = await removeProductToCart(idproducto, userPhone)
                console.log(response);
                console.log("::::::::::::: ::::::::::::::::");

                if (response.status == 'success') {
                    txt = `✅ El producto fue eliminado exitosamente`
                    sendIndividualMessage(userPhone, phoneNumberId, txt);
                } else {
                    txt = `❌ No se pudo eliminar el producto`
                    sendIndividualMessage(userPhone, phoneNumberId, txt);
                }

            }

        } else if (message.interactive.button_reply) {
            id = message.interactive.button_reply.id
            if (id == 'confirm_yes') {
                response = await removeCart(userPhone)
                console.log(response);
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


    // res.json({ categories, products });

    res.sendStatus(200);

});

module.exports = router;
