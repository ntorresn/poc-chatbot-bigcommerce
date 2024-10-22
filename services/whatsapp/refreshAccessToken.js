const {
    GRAPH_API_TOKEN,
    CLIENT_SECRET,
    CLIENT_ID
} = process.env;

const refreshAccessToken = async () => {
    try {
        const response = await axios.get(
            "https://graph.facebook.com/v20.0/oauth/access_token", {
            params: {
                grant_type: "fb_exchange_token",
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                fb_exchange_token: GRAPH_API_TOKEN, // El token de refresco que obtuviste previamente
            },
        });
        const newAccessToken = response.data.access_token;
        return newAccessToken;
    } catch (error) {
        console.error(
            "Error refreshing access token:",
            error.response ? error.response.data : error.message
        );
        throw error;
    }
};

export default refreshAccessToken