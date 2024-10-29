const axios = require('axios');
const { bigcommerceURL, bigcommerceUrlImages } = require('../../config/urls.js');
const logger = require('../../utils/logger.js');

const { BIGCOMMERCE_AUTH_TOKEN } = process.env;
const getCategories = async () => {

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
            category_id: category.category_id,
            name: category.name,
            description: category.description,
            image_url: category.image_url
        }));

        return categoriesInfo;
    } catch (error) {
        console.error("Error al obtener las categorías:", error);
        throw error;
    }
};

const createCart = async (line_items) => {
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
            logger.info('BIGCOMMERCE RESPONSE createCart : ', response.data.data.id);
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

const generateCheckout = async (id) => {

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

const getCart = async (id) => {
    try {
        const headers = {
            "X-Auth-Token": BIGCOMMERCE_AUTH_TOKEN,
            "Content-Type": "application/json",
        };
        const response = await axios.get(
            `${bigcommerceURL}carts/${id}`,
            { headers }
        );
        return response.data.data
    } catch (error) {
        console.error("Error al obtener el carrito ", error);
        throw error;
    }
};

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
        let products = respuesta.data.data;
        const productsImages = await Promise.all(
            products.map(async (p) => {
                const image = await getImageProduct(p.id);
                return {
                    id: p.id,
                    name: p.name,
                    description: p.description,
                    price: p.price,
                    imageUrl: image[0].url.replace("?c=1", ""),
                };
            })
        );

        return productsImages

    } catch (error) {
        console.error("Error al obtener los productos:", error);
        throw error;
    }
};
const getImageProduct = async (id) => {
    try {
        const headers = {
            "X-Auth-Token": "bafiiv1o2el2l6k8drrogyx631p5fig",
            "Content-Type": "application/json",
        };
        const respuesta = await axios.get(
            `${bigcommerceUrlImages}${id}/images`,
            { headers }
        );

        const getImage = respuesta.data.data.map((i) => {
            return {
                product_id: i.product_id,
                url: i.url_standard,
            };
        });
        return getImage;
    } catch (error) {
        console.error("Error al obtener la imagen del producto:", error);
        throw error;
    }
};
module.exports = { getCategories, createCart, generateCheckout, getCart, getProducts };
