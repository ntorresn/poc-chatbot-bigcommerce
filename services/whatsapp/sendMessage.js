const sendInterativeMessage = async (to, headerText, bodyText, footerText, sections) => {
    let data = {
        messaging_product: "whatsapp",
        "to": to,
        "type": "interactive",
        "interactive": {
            "type": "list",
            "header": {
                "type": "text",
                "text": "Seleccione una opción"
            },
            "body": {
                "text": "Elija una opción de la lista:"
            },
            "footer": {
                "text": "Gracias por su preferencia"
            },
            "action": {
                "button": "Ver opciones",
                "sections": sections || [
                    {
                        "title": "Opciones",
                        "rows": [
                            {
                                "id": "opcion_1",
                                "title": "Opción 1"
                            },
                            {
                                "id": "opcion_2",
                                "title": "Opción 2"
                            }
                        ]
                    }
                ]
            }
        }
    };

    // Aquí puedes enviar la data con alguna función que realice la petición HTTP
};

const sendIndividualMessage = async (to, phoneNumberId, bodyText) => {
    let data = {
        messaging_product: "whatsapp",
        to: to,
        text: {
            body: bodyText,
        },
    };

    axios.post(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
        messaging_product: "whatsapp",
        to: to,
        text: {
            body: `Para continuar di agregar nombre del producto, cantidad`,
        },
    }, {
        headers: { Authorization: `Bearer ${GRAPH_API_TOKEN}` }
    });

    // Aquí puedes enviar la data con alguna función que realice la petición HTTP
};

module.exports = { sendInterativeMessage, sendIndividualMessage };
