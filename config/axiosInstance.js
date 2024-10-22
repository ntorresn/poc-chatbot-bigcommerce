const axios = require('axios');
const urls = require('./urls');
const fs = require('fs');
const path = require('path');

const refreshAccessToken = require('../services/graph/refreshAccessToken');


const instance = axios.create({
    baseURL: urls.graph.replace("%", abc),
    headers: {
        "Content-Type": "application/json",
    },
});

instance.interceptors.request.use(
    (config) => {
        const token = refreshAccessToken();
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
            if (err.response.status === 401 && !originalConfig._retry) {
                originalConfig._retry = true;
                try {
                    const rs = await refreshToken();
                    const { token, refreshToken } = rs.data;

                    // Guardar los nuevos tokens
                    saveTokens({ token, refreshToken });

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


module.exports = instance;
