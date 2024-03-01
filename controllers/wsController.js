const axios = require('axios');
const pythonServer = require('../configs/pythonConfig');
const calculateDelay = require('../helpers/calculateDelay');

function runAI(ws) {
    ws.on('message', async (data) => {
        const { message, model, context } = JSON.parse(data);
        const response = await axios.post(pythonServer, {message: message, model: model, context: context});
        const answer = response.data.answer;
        const delay = calculateDelay(answer.length);
        ws.send(JSON.stringify({type: 'context', content: response.data.context, length: response.data.context.length}));
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

module.exports = runAI;
