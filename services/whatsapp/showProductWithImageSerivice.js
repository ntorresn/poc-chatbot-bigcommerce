exports.showProductWithImage = async (phoneNumber, business_phone_number_id, imageUrl, productName, productPrice, productDescription) => {
    try {
        const url = `https://graph.facebook.com/v21.0/${business_phone_number_id}/messages`;
        const imageData = {
            messaging_product: "whatsapp",
            to: phoneNumber,
            type: "image",
            image: {
                link: imageUrl,
                caption: `*${productName}*\n 💲Precio: ${productPrice}\n ${productDescription})`,
            },
        };

        const response = await axios.post(url, imageData, {
            headers: {
                Authorization: `Bearer ${GRAPH_API_TOKEN}`,
                "Content-Type": "application/json",
            },
        });

        logger.info(
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