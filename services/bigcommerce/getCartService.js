
exports.getCart = async (id) => {
    try {
        const headers = {
            "X-Auth-Token": "bafiiv1o2el2l6k8drrogyx631p5fig",
            "Content-Type": "application/json",
        };
        const response = await axios.get(
            `https://api.bigcommerce.com/stores/mp2k4phx4c/v3/carts/${id}`,
            { headers }
        );
        if (response.data.data.id) {
            generateCheckout(response.data.data.id);
        }
    } catch (error) {
        console.error("Error al obtener el carrito ", error);
        throw error;
    }
};
