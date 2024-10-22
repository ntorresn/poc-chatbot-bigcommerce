const axios = require('axios');

const getProducts = async () => {
    try {
        const headers = {
            "X-Auth-Token": "bafiiv1o2el2l6k8drrogyx631p5fig",
            "Content-Type": "application/json",
        };
        const respuesta = await axios.get(
            "https://api.bigcommerce.com/stores/mp2k4phx4c/v3/catalog/products",
            { headers }
        );
        return respuesta.data.data;
    } catch (error) {
        console.error("Error al obtener los productos:", error);
        throw error;
    }
};

module.exports = { getProducts };
