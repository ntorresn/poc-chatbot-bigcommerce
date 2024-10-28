const axios = require('axios');
const { instance, token } = require("../../config/axiosInstance");
const { graphURL } = require("../../config/urls.js");
const logger = require('./../../utils/logger');


const sendInteractiveMessage = async (to, phoneNumberId, rowsSection, headerText, bodyText, footerText) => {

    logger.info("************** start sendIndividualMessage **************************");
    logger.info("to: ", to);
    logger.info("phoneNumberId: ", phoneNumberId);
    logger.info("bodyText: ", bodyText);
    logger.info("************** end  sendIndividualMessage **************************");

    // var token = await refreshAccessToken();
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

const sendIndividualMessage = async (to, phoneNumberId, bodyText) => {

    logger.info("************** start sendIndividualMessage **************************");
    logger.info("to: ", to);
    logger.info("phoneNumberId: ", phoneNumberId);
    logger.info("bodyText: ", bodyText);
    logger.info("************** end  sendIndividualMessage **************************");



    const data = {
        messaging_product: "whatsapp",
        to: to,
        text: {
            body: bodyText,
        },
    };

    try {
        const response = await instance.post(`${graphURL}${phoneNumberId}/messages`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error sending individual message:", error.response ? error.response.data : error.message);
    }

};


const sendConfirmationMessage = async (to, phoneNumberId, bodyText) => {
    // var token = await refreshAccessToken();

    logger.info("************** start sendConfirmationMessage **************************");
    logger.info("to: ", to);
    logger.info("phoneNumberId: ", phoneNumberId);
    logger.info("bodyText: ", bodyText);
    logger.info("************** end  sendConfirmationMessage **************************");




    const data = {
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

    try {
        const response = await instance.post(`${graphURL}${phoneNumberId}/messages`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error sending confirmation message:", error.response ? error.response.data : error.message);
    }

};

const sendImageMessage = async (to, phoneNumberId, urlImage) => {
    logger.info("************** start sendImageMessage **************************");
    logger.info("to", to);
    logger.info("phoneNumberId", phoneNumberId);
    logger.info("urlImage", urlImage);
    logger.info("************** end sendImageMessage **************************");



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

        const response = await instance.post(url, imageData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        logger.info(
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

    logger.info("************** start showProductWithImage **************************");
    logger.info("to", to);
    logger.info("phoneNumberId", phoneNumberId);
    logger.info("product", product);
    logger.info("************** end showProductWithImage **************************");


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

        const response = await instance.post(url, imageData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        logger.info(
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




module.exports = {
    sendInteractiveMessage,
    sendIndividualMessage,
    showProductWithImage,
    sendConfirmationMessage,
    sendImageMessage
};
