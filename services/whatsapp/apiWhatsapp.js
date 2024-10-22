const axios = require('axios');
const instance = require("../../config/axiosInstance");
const { graphURL } = require("../../config/urls.js");
const { GRAPH_API_TOKEN } = process.env;

const sendInteractiveMessage = async (to, sections) => {
    const data = {
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: {
            type: "list",
            header: {
                type: "text",
                text: "Seleccione una opción"
            },
            body: {
                text: "Elija una opción de la lista:"
            },
            footer: {
                text: "Gracias por su preferencia"
            },
            action: {
                button: "Ver opciones",
                sections: sections || [
                    {
                        title: "Opciones",
                        rows: [
                            {
                                id: "opcion_1",
                                title: "Opción 1"
                            },
                            {
                                id: "opcion_2",
                                title: "Opción 2"
                            }
                        ]
                    }
                ]
            }
        }
    };

    try {
        const response = await axios.post(`https://graph.facebook.com/v20.0/${process.env.PHONE_NUMBER_ID}/messages`, data, {
            headers: { Authorization: `Bearer ${GRAPH_API_TOKEN}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error sending interactive message:", error.response ? error.response.data : error.message);
        throw error;
    }
};

const sendIndividualMessage = async (to, phoneNumberId, bodyText) => {
    const data = {
        messaging_product: "whatsapp",
        to,
        text: {
            body: bodyText,
        },
    };

    try {
        const response = await instance.post(`${graphURL}${phoneNumberId}/messages`, data, {
            headers: { Authorization: `Bearer ${GRAPH_API_TOKEN}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error sending individual message:", error.response ? error.response.data : error.message);
        throw error;
    }
};




module.exports = {
    sendInteractiveMessage,
    sendIndividualMessage,
};
