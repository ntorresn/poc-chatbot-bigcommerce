const axios = require('axios');

const getCategories = async () => {
    try {
        const headers = {
            "X-Auth-Token": "bafiiv1o2el2l6k8drrogyx631p5fig",
            "Content-Type": "application/json",
        };
        const respuesta = await axios.get(
            "https://api.bigcommerce.com/stores/mp2k4phx4c/v3/catalog/categories",
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
