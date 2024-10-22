const express = require('express');
const { getCategories } = require('../services/bigcommerce/categoriesService.js');
const { getProducts } = require('../services/bigcommerce/productService.js');
const { extractMessage, extractPhoneNumberId, extractTextMessage, trainingAssistant } = require('../utils/util.js');
const { getUser } = require('../services/poc-api/userService.js');
const { sendIndividualMessage } = require('../services/whatsapp/sendMessage.js');

const router = express.Router();

router.get('/', function (req, res, next) {
    res.send(`Get webhook`);
});

router.post('/', async function (req, res, next) {
    console.log(req.body);
    console.log("***********************************************************");

    let categories = await getCategories();
    let products = await getProducts();


    let training = trainingAssistant(categories, products);
    const phoneNumberId = extractPhoneNumberId(req.body);
    const message = extractMessage(req.body);
    userPhone = message?.from ?? '';

    let user = await getUser(userPhone);

    console.log('user : ', user);
    console.log('message : ', message);

    if (!user || user.welcome == false) {
        sendIndividualMessage(userPhone, phoneNumberId, "¡Hola! 👋 Bienvenido a Sodimac 🛒\n\nEstamos encantados de ayudarte con tus compras. Puedes escribir:\n1️⃣ Ver productos\n2️⃣ Ver carrito\n3️⃣ Ayuda\n\n¡Estamos aquí para lo que necesites! 😊");
    }

    if (message?.type === "text") {
        const text = extractTextMessage(req.body);
        if (
            text.toString().startsWith("Realizar pago") ||
            text.toString().startsWith("realizar pago")
        ) {
            // fs.readFile("shoppingCart.json", "utf8", (err, data) => {
            //   if (err) {
            //     console.error("Error leyendo el archivo shoppingCart.json:", err);
            //     return;
            //   }

            //   const shoppingCar = JSON.parse(data);

            //   const line_items = shoppingCar.map((product) => {
            //     return {
            //       quantity: parseInt(product.quantity, 10), // Convertir la cantidad a número entero
            //       product_id: product.id, // El id del producto
            //     };
            //   });

            //   if (line_items.length > 0) {
            //     createCart(line_items);
            //   }
            // });
        }
    }

    res.json({ categories, products });
});

module.exports = router;
