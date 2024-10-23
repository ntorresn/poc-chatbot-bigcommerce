const axios = require('axios');
const { bigcommerceURL, bigcommerceUrlImages } = require('../../config/urls.js');

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
        /*
        return products.map(async (p) => {
            const image = await getImageProduct(p.id);
            return {
                id: p.id,
                name: p.name,
                description: p.description,
                price: p.price,
                imageUrl: image[0].url.replace("?c=1", ""),
            };

        })*/
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
module.exports = { getProducts };
