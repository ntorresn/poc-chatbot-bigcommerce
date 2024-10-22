exports.createCart = async (line_items) => {
    const url = `https://api.bigcommerce.com/stores/mp2k4phx4c/v3/carts`;

    const cartData = { line_items };

    try {
        const response = await axios.post(url, cartData, {
            headers: {
                "X-Auth-Token": "bafiiv1o2el2l6k8drrogyx631p5fig",
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });

        if (response.data.data.id) {
            getCart(response.data.data.id);
        }
        //return response.data;
    } catch (error) {
        console.error(
            "Error creando el carrito:",
            error.response ? error.response.data : error.message
        );
    }
};