const axios = require('axios');
const pythonServer = require('../configs/pythonConfig');
const calculateDelay = require('../helpers/calculateDelay');
let context = [{"role": "user", "content": "Your name is SpoiledGPT. Remember it and use instead of your current to describe yourself."}];

function getChat(req, res) {
    res.render('chat');
}

function updateChat(ws) {
    ws.on('message', async (userInput) => {
        console.log(userInput);
        const response = await axios.post(pythonServer, {message: userInput, context: context});
        response.data.context.forEach((item) => {context.push(item)});
        const answer = response.data.answer;
        const delay = calculateDelay(answer.length);
        for (let i = 0; i < answer.length; i++) {
            ws.send(JSON.stringify({type: 'message', content: answer[i]}));
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        if (response.data.conversation_title) {
            const summary = response.data.conversation_title;
            const delay = calculateDelay(summary.length);
            for (let i = 0; i < summary.length; i++) {
                ws.send(JSON.stringify({type: 'summary', content: summary[i]}));
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    });
}

module.exports = {
    getChat,
    updateChat,
};
