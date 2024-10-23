

const axios = require('axios');
const { bigcommerceURL } = require('../../config/urls.js');
const { BIGCOMMERCE_AUTH_TOKEN } = process.env;

const generateCheckoutBigCommerce = async (id) => {

    try {
        const headers = {
            "X-Auth-Token": BIGCOMMERCE_AUTH_TOKEN,
            "Content-Type": "application/json",
        };

        const response = await axios.post(
            `${bigcommerceURL}carts/${id}/redirect_urls`,
            {},
            { headers }
        );

        return response.data.data


    } catch (error) {
        console.error("Error al generateCheckout:", error);
        throw error;
    }
};
module.exports = { generateCheckoutBigCommerce };
