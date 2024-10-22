const axios = require('axios');
const { bigcommerceURL } = require('../../config/urls.js');

const { BIGCOMMERCE_AUTH_TOKEN } = process.env;
const getCategories = async () => {
    console.log('BIGCOMMERCE_AUTH_TOKEN ', BIGCOMMERCE_AUTH_TOKEN);
    console.log('bigcommerceURL ', bigcommerceURL);

    try {
        const headers = {
            "X-Auth-Token": BIGCOMMERCE_AUTH_TOKEN,
            "Content-Type": "application/json",
        };
        const respuesta = await axios.get(
            `${bigcommerceURL}catalog/categories`,
            { headers }
        );

        const categoriesInfo = respuesta.data.data.map((category) => ({
            name: category.name,
            description: category.description,
        }));

        return categoriesInfo;
    } catch (error) {
        console.error("Error al obtener las categorías:", error);
        throw error;
    }
};

module.exports = { getCategories };
