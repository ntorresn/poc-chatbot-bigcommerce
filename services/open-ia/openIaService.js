const axios = require('axios');
const { oneToX } = require("../../utils/util.js");

const { OPEN_IA_KEY } = process.env;

const sendCompletionsAndQuestion = async (training, textMessage) => {


    try {
        let openai_data = JSON.stringify({
            model: "gpt-4o",
            temperature: 0.2,
            response_format: {
                type: "json_object",
            },
            messages: [
                {
                    role: "system",
                    content: training,
                },
                {
                    role: "user",
                    content: textMessage,
                },
            ],
        });

        let config = {
            method: "post",
            maxBodyLength: Infinity,
            url: "https://api.openai.com/v1/chat/completions",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OPEN_IA_KEY}`,
            },
            data: openai_data,
        };

        const response = await axios.request(config);

        if (response.data.choices && response.data.choices[0].message.content) {
            return response.data.choices[0].message.content;
        } else {
            throw new Error("El formato de respuesta no es el esperado.");
        }

    } catch (error) {
        console.error(error.response ? error.response.data : error.message);
        throw error;
    }
};





module.exports = {
    sendCompletionsAndQuestion
};
