const axios = require('axios');
const { pocURL } = require('../../config/urls.js');

// Función para obtener un usuario basado en su número de teléfono
const createStore = async phone => {


    try {
        const respuesta = await axios.post(`${pocURL}carts`, { "phone": phone });
        return respuesta.data;
    } catch (error) {
        console.error("Error al crear el carrito:", error);
        throw error;
    }
};

const addProductToStore = async (product, userPhone) => {

    console.log(`${pocURL}carts/add-product/${product.id}`);

    try {
        const respuesta = await axios.put(`${pocURL}carts/add-product/${product.id}`, {
            id: product.id,
            name: product.name,
            quantity: product.quantity,
            phone: userPhone,
            price: product.price
        });
        return respuesta.data;
    } catch (error) {
        console.error("Error al agregar el carrito", error);
    }
};

const removeProductFromStore = async (productId, phone) => {

    console.log(`${pocURL}carts/remove-product/${productId}`);

    try {
        const respuesta = await axios.put(`${pocURL}carts/remove-product/${productId}`, {
            phone: phone
        });
        return respuesta.data;
    } catch (error) {
        console.error("Error al eliminar el carrito", error.data);
    }
};

const removeStore = async (userPhone) => {


    try {
        const respuesta = await axios.delete(`${pocURL}carts/${userPhone}`);
        return respuesta.data;
    } catch (error) {
        console.error("Error al eliminar el carrito", error);
    }
};

const getStore = async phone => {

    console.log(`${pocURL}carts/${phone}`);

    try {
        const respuesta = await axios.get(`${pocURL}carts/${phone}`);
        return respuesta.data;
    } catch (error) {
        console.error("Error al consultar el carrito", error.data);
    }
};

const editProductStore = async (product, userPhone) => {


    try {
        const respuesta = await axios.put(`${pocURL}carts/edit-product/${product.id}`, {
            id: product.id,
            name: product.name,
            quantity: product.quantity,
            phone: userPhone,
            price: product.price
        });
        return respuesta.data;
    } catch (error) {
        console.error("Error al agregar el carrito", error);
    }
};


module.exports = { createStore, addProductToStore, removeProductFromStore, getStore, removeStore, editProductStore };
