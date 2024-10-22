const axios = require('axios');
const { bigcommerceURL } = require('../../config/urls.js');

const { BIGCOMMERCE_AUTH_TOKEN } = process.env;

const getProducts = async () => {
    try {
        const headers = {
            "X-Auth-Token": BIGCOMMERCE_AUTH_TOKEN,
            "Content-Type": "application/json",
        };
        const respuesta = await axios.get(
            `${bigcommerceURL}catalog/products`,
            { headers }
        );
        return respuesta.data.data;
    } catch (error) {
        console.error("Error al obtener los productos:", error);
        throw error;
    }
};

module.exports = { getProducts };
