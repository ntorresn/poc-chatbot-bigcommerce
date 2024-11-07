const axios = require('axios');
// const { instance, token } = require("../../config/axiosInstance");
const { graphURL } = require("../../config/urls.js");
const logger = require('./../../utils/logger');
const { CLIENT_ID, CLIENT_SECRET, GRAPH_API_TOKEN } = process.env

const sendInteractiveMessage = async (to, phoneNumberId, rowsSection, headerText, bodyText, footerText) => {

    console.log("************** start sendIndividualMessage **************************");
    console.log("to: ", to);
    console.log("phoneNumberId: ", phoneNumberId);
    console.log("bodyText: ", bodyText);
    console.log("************** end  sendIndividualMessage **************************");

    var token = await refreshAccessToken();
    const axios = require('axios');
    let data = JSON.stringify({
        messaging_product: "whatsapp",
        to: to,
        type: "interactive",
        interactive: {
            type: "list",
            header: {
                type: "text",
                text: headerText
            },
            body: {
                text: bodyText
            },
            footer: {
                text: "Gracias por su preferencia"
            },
            action: {
                button: "Ver opciones",
                sections: [
                    {
                        title: "Opciones",
                        rows: rowsSection

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

        })
        .catch((error) => {
            console.error(error.response ? error.response.data : error.message);

        });

};

const sendIndividualMessage = async (to, phoneNumberId, bodyText, message) => {

    return new Promise(async (resolve, reject) => {
        var token = await refreshAccessToken();

        console.log("************** start sendIndividualMessage **************************");
        console.log("to: ", to);
        console.log("phoneNumberId: ", phoneNumberId);
        console.log("bodyText: ", bodyText);
        console.log("************** end  sendIndividualMessage **************************");



        var data = {
            messaging_product: "whatsapp",
            to: to,
            text: {
                body: bodyText,
            }
        };
        if (message) {
            data.context = {
                message_id: message.id,
            }
        }

        try {
            const response = await axios.post(`${graphURL}${phoneNumberId}/messages`, data, {
                headers: { Authorization: `Bearer ${token}` }
            });
            resolve(response.data)
        } catch (error) {
            console.error("Error sending individual message:", error.response ? error.response.data : error.message);
            reject("Error sending individual message:", error.response ? error.response.data : error.message)
        }
    });

};

const sendConfirmationMessage = async (to, phoneNumberId, bodyText, message) => {
    var token = await refreshAccessToken();

    console.log("************** start sendConfirmationMessage **************************");
    console.log("to: ", to);
    console.log("phoneNumberId: ", phoneNumberId);
    console.log("bodyText: ", bodyText);
    console.log("************** end  sendConfirmationMessage **************************");




    var data = {
        messaging_product: "whatsapp",

        recipient_type: "individual",
        to: to,
        type: "interactive",

        interactive: {
            type: "button",
            header: {
                type: "text",
                text: "Confirmación"
            },
            body: {
                text: "¿Estás seguro de que deseas continuar?"
            },
            footer: {
                text: "Elige una opción"
            },
            action: {
                buttons: [
                    {
                        type: "reply",
                        reply: {
                            id: "confirm_yes",  // ID para la opción "Sí"
                            title: "Sí"
                        }
                    },
                    {
                        type: "reply",
                        reply: {
                            id: "confirm_no",  // ID para la opción "No"
                            title: "No"
                        }
                    }
                ]
            }
        }
    }
    if (message) {
        data.context = {
            message_id: message.id,
        }
    }

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
    console.log("************** start sendImageMessage **************************");
    console.log("to", to);
    console.log("phoneNumberId", phoneNumberId);
    console.log("urlImage", urlImage);
    console.log("************** end sendImageMessage **************************");

    var token = await refreshAccessToken();

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
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        console.log(
            "Mensaje con imagen y detalles enviado con éxito:",
            response.data
        );
    } catch (error) {
        logger.error(
            "Error al enviar el mensaje con imagen y detalles:",
            error.response ? error.response.data : error.message
        );
        throw error;
    }
};

const showProductWithImage = async (to, phoneNumberId, product) => {

    console.log("************** start showProductWithImage **************************");
    console.log("to", to);
    console.log("phoneNumberId", phoneNumberId);
    console.log("product", product);
    console.log("************** end showProductWithImage **************************");
    var token = await refreshAccessToken();

    try {
        const url = `${graphURL}${phoneNumberId}/messages`;
        const imageData = {
            messaging_product: "whatsapp",
            to: to,
            type: "image",
            image: {
                link: product.imageUrl,
                caption: `*${product.name}*\n
                          💰Precio: ${product.price}\n
                          ${product.description.replace(/<\/?p>/g, "")}
                          \n\n Ingresa la cantidad: `,
            },
        };

        const response = await axios.post(url, imageData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        console.log(
            "Mensaje con imagen y detalles enviado con éxito:",
            response.data
        );
    } catch (error) {
        logger.error(
            "Error al enviar el mensaje con imagen y detalles:",
            error.response ? error.response.data : error.message
        );
        throw error;
    }
};

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

const sendCategories = async (to, phoneNumberId, categories) => {


    console.log("************** start sendCategories **************************");
    console.log("to:", to);
    console.log("phoneNumberId:", phoneNumberId);
    console.log("urlImage:", urlImage);
    console.log("************** end sendCategories **************************");

    const token = await refreshAccessToken();

    // Redimensionar la imagen a 1024x1024 píxeles
    const resizedImagePath = categories[0].image_url;
    const resizedImageBuffer = await axios.get(categories[0].image_url, { responseType: 'arraybuffer' });

    await sharp(resizedImageBuffer.data)
        .resize(1024, 1024)
        .toFile(resizedImagePath);

    // Ahora, sube la imagen redimensionada a la API de WhatsApp y obtén el media_id
    const mediaResponse = await axios.post(
        `${graphURL}${phoneNumberId}/media`, {
        file: await fs.readFile(resizedImagePath),
        type: "image/jpeg"
    }, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
        }
    });

    const mediaId = mediaResponse.data.id;

    // Finalmente, envía el mensaje con el `media_id`
    try {
        const url = `${graphURL}${phoneNumberId}/messages`;
        const imageData = {
            messaging_product: "whatsapp",
            to: to,
            type: "image",
            image: {
                id: mediaId,
                caption: `Imagen redimensionada a 1024x1024 píxeles.`,
            },
        };

        const response = await axios.post(url, imageData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        console.log("Mensaje con imagen enviado con éxito:", response.data);
    } catch (error) {
        console.error(
            "Error al enviar el mensaje con imagen:",
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
    sendImageMessage,
    sendCategories
};
