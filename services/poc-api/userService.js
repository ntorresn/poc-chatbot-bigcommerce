const axios = require('axios');
const { pocAPI } = require('../../config/urls.js');

// Función para obtener un usuario basado en su número de teléfono
const getUser = async (phone) => {
    try {
        const respuesta = await axios.get(`${pocAPI}users/${phone}`);
        return respuesta.data;
    } catch (error) {
        console.error("Error al obtener el usuario:", error);
        throw error;
    }
};

// Exportar la función
module.exports = { getUser };
