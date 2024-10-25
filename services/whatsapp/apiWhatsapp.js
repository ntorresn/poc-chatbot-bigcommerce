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


const sendInteractiveMessage = async (to, phoneNumberId, rowsSection, headerText, bodyText, footerText) => {
    var token = await refreshAccessToken();
    const axios = require('axios');
    let data = JSON.stringify({
        "messaging_product": "whatsapp",
        "to": to,
        "type": "interactive",
        "interactive": {
            "type": "list",
            "header": {
                "type": "text",
                "text": headerText
            },
            "body": {
                "text": bodyText
            },
            "footer": {
                "text": "Gracias por su preferencia"
            },
            "action": {
                "button": "Ver opciones",
                "sections": [
                    {
                        "title": "Opciones",
                        "rows": rowsSection

                    }
                ]
            }
        }
    });


    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        data: data
    };

    axios.request(config)
        .then((response) => {
            console.log(JSON.stringify(response.data));
        })
        .catch((error) => {
            console.error(error.response ? error.response.data : error.message);

        });

};

const sendIndividualMessage = async (to, phoneNumberId, bodyText) => {
    var token = await refreshAccessToken();

    console.log('\n\n************ Start send message whatsappp ************');
    console.log('phoneNumberId', phoneNumberId);
    console.log('to', to);
    console.log('bodyText', bodyText);
    console.log('\n************ End send message whatsappp ************');

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


const sendConfirmationMessage = async (to, phoneNumberId, bodyText) => {
    var token = await refreshAccessToken();

    console.log('\n\n************ token ************');
    console.log(GRAPH_API_TOKEN);
    console.log('to', to);
    console.log('\n\n');



    const data = {
        messaging_product: "whatsapp",


        "recipient_type": "individual",
        "to": to,  // Reemplaza con el número de teléfono del destinatario
        "type": "interactive",
        "interactive": {
            "type": "button",
            "header": {
                "type": "text",
                "text": "Confirmación"
            },
            "body": {
                "text": "¿Estás seguro de que deseas continuar?"
            },
            "footer": {
                "text": "Elige una opción"
            },
            "action": {
                "buttons": [
                    {
                        "type": "reply",
                        "reply": {
                            "id": "confirm_yes",  // ID para la opción "Sí"
                            "title": "Sí"
                        }
                    },
                    {
                        "type": "reply",
                        "reply": {
                            "id": "confirm_no",  // ID para la opción "No"
                            "title": "No"
                        }
                    }
                ]
            }
        }


    }
    console.log(data);

    try {
        const response = await axios.post(`${graphURL}${phoneNumberId}/messages`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error sending confirmation message:", error.response ? error.response.data : error.message);
    }

};

const sendImageMessage = async (to, phoneNumberId, urlImage) => {
    console.log("\n\n\n\n");
    console.log("****************************************");
    console.log("to", to);
    console.log("phoneNumberId", phoneNumberId);
    console.log("urlImage", urlImage);



    try {
        const url = `${graphURL}${phoneNumberId}/messages`;
        const imageData = {
            messaging_product: "whatsapp",
            to: to,
            type: "image",
            image: {
                link: urlImage,
                caption: `Cargando ...`,
            },
        };

        const response = await axios.post(url, imageData, {
            headers: {
                Authorization: `Bearer ${GRAPH_API_TOKEN}`,
                "Content-Type": "application/json",
            },
        });
        console.log("\n\n\n\n");
        console.log("****************************************");
        console.log(response.data);

        console.log(
            "Mensaje con imagen y detalles enviado con éxito:",
            response.data
        );
    } catch (error) {
        console.error(
            "Error al enviar el mensaje con imagen y detalles:",
            error.response ? error.response.data : error.message
        );
        throw error;
    }
};

const showProductWithImage = async (to, phoneNumberId, product) => {
    try {
        const url = `${graphURL}${phoneNumberId}/messages`;
        const imageData = {
            messaging_product: "whatsapp",
            to: to,
            type: "image",
            image: {
                link: product.imageUrl,
                caption: `*${product.name}*\n💰Precio: ${product.price}\n${product.description.replace(/<\/?p>/g, "")}`,
            },
        };

        const response = await axios.post(url, imageData, {
            headers: {
                Authorization: `Bearer ${GRAPH_API_TOKEN}`,
                "Content-Type": "application/json",
            },
        });

        console.log(
            "Mensaje con imagen y detalles enviado con éxito:",
            response.data
        );
    } catch (error) {
        console.error(
            "Error al enviar el mensaje con imagen y detalles:",
            error.response ? error.response.data : error.message
        );
        throw error;
    }
};




module.exports = {
    sendInteractiveMessage,
    sendIndividualMessage,
    showProductWithImage,
    sendConfirmationMessage,
    sendImageMessage
};
