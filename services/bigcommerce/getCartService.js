

const axios = require('axios');
const { bigcommerceURL } = require('../../config/urls.js');
const { BIGCOMMERCE_AUTH_TOKEN } = process.env;

const getCartBigCommerce = async (id) => {
    try {
        const headers = {
            "X-Auth-Token": BIGCOMMERCE_AUTH_TOKEN,
            "Content-Type": "application/json",
        };
        const response = await axios.get(
            `${bigcommerceURL}carts/${id}`,
            { headers }
        );
        // if (response.data.data.id) {
        //     generateCheckout(response.data.data.id);
        // }
    } catch (error) {
        console.error("Error al obtener el carrito ", error);
        throw error;
    }
};
module.exports = { getCartBigCommerce };