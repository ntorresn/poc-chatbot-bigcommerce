exports.generateCheckout = async (id) => {
    try {
        const headers = {
            "X-Auth-Token": "bafiiv1o2el2l6k8drrogyx631p5fig",
            "Content-Type": "application/json",
        };

        const response = await axios.post(
            `https://api.bigcommerce.com/stores/mp2k4phx4c/v3/carts/${id}/redirect_urls`,
            {},
            { headers }
        );

        //console.log("generateCheckout:", response.data.data.cart_url);
        //console.log("generateCheckout:", response.data.data.checkout_url);
        //console.log("generateCheckout:", response.data.data.embedded_checkout_url);

        setTimeout(() => {
            axios
                .post(
                    `https://graph.facebook.com/v20.0/${business_phone_number_id}/messages`,
                    {
                        messaging_product: "whatsapp",
                        to: userPhone,
                        text: {
                            body: `Para continuar con tu compra, ingresa al siguiente 🌐 link: 💰 ${response.data.data.embedded_checkout_url}`,
                        },
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${GRAPH_API_TOKEN}`,
                            "Content-Type": "application/json", // Asegurarse de que los headers incluyan el tipo de contenido correcto
                        },
                    }
                )
                .then((response) => {
                    console.log("Mensaje enviado exitosamente:", response.data);
                })
                .catch((error) => {
                    console.error(
                        "Error al enviar el mensaje:",
                        error.response ? error.response.data : error.message
                    );
                });
        }, 1000);
    } catch (error) {
        console.error("Error al generateCheckout:", error);
        throw error;
    }
};