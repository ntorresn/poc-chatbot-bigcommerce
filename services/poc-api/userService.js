const axios = require('axios');
const { pocURL } = require('../../config/urls.js');

// Función para obtener un usuario basado en su número de teléfono
const getUser = async (phone) => {
    console.log('pocAPI', pocURL);
    console.log('phone', phone);

    try {
        const respuesta = await axios.get(`${pocURL}users/${phone}`);
        return respuesta.data;
    } catch (error) {
        console.error("Error al obtener el usuario:", error);
        throw error;
    }
};
const createUser = async (phone) => {

    console.log(`${pocURL}users/${phone}`);

    try {
        const respuesta = await axios.post(`${pocURL}users`, {
            "phone": phone
        });
        return respuesta.data;
    } catch (error) {
        console.error("Error al crear el usuario", error.data);
    }
};

module.exports = { getUser, createUser };
