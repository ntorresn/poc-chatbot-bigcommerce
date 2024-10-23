const axios = require('axios');
const { bigcommerceURL } = require('../../config/urls.js');
const { BIGCOMMERCE_AUTH_TOKEN } = process.env;


const createCartBigCommerce = async (line_items) => {
    const cartData = { line_items };

    try {
        const response = await axios.post(`${bigcommerceURL}carts`, cartData, {
            headers: {
                "X-Auth-Token": BIGCOMMERCE_AUTH_TOKEN,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });

        if (response.data.data.id) {
            console.log('response.data.data.id: ', response.data.data.id);
            return response.data.data.id
            // getCart(response.data.data.id);
        }
        //return response.data;
    } catch (error) {
        console.error(
            "Error creando el carrito:",
            error.response ? error.response.data : error.message
        );
    }
};

module.exports = { createCartBigCommerce };
