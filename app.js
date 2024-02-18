const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const corsOptions = require('./helpers/corsOptions');
const port = require('./configs/appConfig');
const mongoConnection = require('./connections/mongoConnection');
const routes = require('./routes');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const chatController = require('./controllers/chatController');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server: server });

app.use(express.static(path.join(__dirname, 'static')));
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/", routes.chatRoutes);
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

const startServer = async () => {
    try {
        await mongoConnection.connect();
        app.listen(port, () => {
            console.log(`Server is running at http://localhost:${port}/`);
        });
    } catch (error) {
        console.error('Failed to connect to the database', error);
    }
}

startServer();

wss.on('connection', (ws) => {
    chatController.updateChat(ws);
});