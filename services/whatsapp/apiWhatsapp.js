const axios = require('axios');
const instance = require("../../config/axiosInstance");
const { graphURL } = require("../../config/urls.js");


const {
    GRAPH_API_TOKEN,
    CLIENT_SECRET,
    CLIENT_ID
} = process.env;
const refreshAccessToken = async () => {
    try {
        const response = await axios.get("https://graph.facebook.com/v20.0/oauth/access_token", {
            params: {
                grant_type: "fb_exchange_token",
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                fb_exchange_token: GRAPH_API_TOKEN,
            },
        });

        const newAccessToken = response.data.access_token;
        return newAccessToken;
    } catch (error) {
        console.error("Error refreshing access token:", error.response ? error.response.data : error.message);
        throw error;
    }
};


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
    var token = await refreshAccessToken();

    console.log('\n\n************ token ************');
    console.log(GRAPH_API_TOKEN);
    console.log('to', to);
    console.log('\n\n');



    const data = {
        messaging_product: "whatsapp",
        to: to,
        text: {
            body: bodyText,
        },
    };
    console.log(data);

    try {
        const response = await axios.post(`${graphURL}${phoneNumberId}/messages`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error sending individual message:", error.response ? error.response.data : error.message);
    }

};




module.exports = {
    sendInteractiveMessage,
    sendIndividualMessage,
};
