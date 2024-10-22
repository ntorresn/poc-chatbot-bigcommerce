exports.showProductsWithoutImage = async (phoneNumber, business_phone_number_id, productName, productPrice, productDescription) => {
    try {
        const url = `https://graph.facebook.com/v20.0/${business_phone_number_id}/messages`;

        const data = {
            messaging_product: "whatsapp",
            to: phoneNumber,
            type: "text", // Cambia el tipo a 'text' en lugar de 'interactive'
            text: {
                body: `*${productName}*\n 💲 *Precio:* ${productPrice}\n *Descripción:* ${productDescription}`,
            },
        };

        const response = await axios.post(url, data, {
            headers: {
                Authorization: `Bearer ${GRAPH_API_TOKEN}`,
                "Content-Type": "application/json",
            },
        });

        console.log("Mensaje de texto enviado con éxito:", response.data);
    } catch (error) {
        console.error(
            "Error al enviar el mensaje de texto:",
            error.response ? error.response.data : error.message
        );
        throw error;
    }
};