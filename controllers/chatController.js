const axios = require('axios');
const pythonServer = require('../configs/pythonConfig');
const calculateDelay = require('../helpers/calculateDelay');
let context = [];

function updateChat(ws) {
    ws.on('message', async (data) => {
        const userInput = JSON.parse(data).message;
        const model = JSON.parse(data).model;
        const response = await axios.post(pythonServer, {userInput: userInput, model: model, context: context});
        response.data.context.forEach((item) => {context.push(item)});
        const answer = response.data.answer;
        const delay = calculateDelay(answer.length);
        for (let i = 0; i < answer.length; i++) {
            ws.send(JSON.stringify({type: 'message', content: answer[i], length: answer.length}));
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        if (response.data.conversation_title) {
            const summary = response.data.conversation_title;
            const delay = calculateDelay(summary.length);
            for (let i = 0; i < summary.length; i++) {
                ws.send(JSON.stringify({type: 'summary', content: summary[i], length: summary.length}));
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    });
}

module.exports = {
    updateChat,
};
