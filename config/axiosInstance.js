const axios = require('axios');
const { graphURL } = require('./urls');
const fs = require('fs');
const logger = require('./../utils/logger');

const {
    GRAPH_API_TOKEN,
    CLIENT_SECRET,
    CLIENT_ID
} = process.env;

var token = GRAPH_API_TOKEN


const instance = axios.create({
    baseURL: graphURL,
    headers: {
        "Content-Type": "application/json",
    },
});

instance.interceptors.request.use(
    (config) => {
        token = refreshAccessToken();
        if (token) {
            config.headers["Authorization"] = 'Bearer ' + token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    (res) => {
        return res;
    },
    async (err) => {
        const originalConfig = err.config;
        if (err.response) {
            logger.error("::::::::::::::::: Interceptor Error Start ::::::::::::::::::::::::::::::")
            logger.error(err.response.status)
            logger.error("!originalConfig._retry : ", !originalConfig._retry)
            logger.error("::::::::::::::::: Interceptor Error End ::::::::::::::::::::::::::::::")
            if (!originalConfig._retry) {
                logger.error("::::::::::::::::: Si ::::::::::::::::::::::::::::::")
            } else {
                logger.error("::::::::::::::::: No ::::::::::::::::::::::::::::::")

            }

            if (err.response.status === 401 && !originalConfig._retry) {
                logger.error("::::::::::::::::: Refrescar el token ::::::::::::::::::::::::::::::")

                originalConfig._retry = true;
                try {
                    token = await refreshAccessToken();
                    logger.error(`::::::::::::::::: ${token} ::::::::::::::::::::::::::::::`)

                    instance.defaults.headers.common["Authorization"] = 'Bearer ' + token;
                    return instance(originalConfig);
                } catch (_error) {
                    if (_error.response && _error.response.data) {
                        return Promise.reject(_error.response.data);
                    }
                    return Promise.reject(_error);
                }
            }
            if (err.response.status === 403 && err.response.data) {
                return Promise.reject(err.response.data);
            }
        }
        return Promise.reject(err);
    }
);

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

module.exports = { instance, token };
