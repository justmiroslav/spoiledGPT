const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const corsOptions = require('./helpers/corsOptions');
const appConfigs = require('./configs/appConfig');
const mongoConnection = require('./connections/mongoConnection');
const routes = require('./routes');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const runAI = require('./controllers/wsController');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server: server });
server.listen(appConfigs.wssPort, () => {
    console.log(`WS Server listening on port ${appConfigs.wssPort}`);
});

app.use(express.static(path.join(__dirname, 'static')));
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/message", routes.messageRoutes);
app.use("/chat", routes.chatRoutes);
app.use("/", routes.appRoutes);
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

const startServer = async () => {
    try {
        await mongoConnection.connect();
        app.listen(appConfigs.appPort, () => {
            console.log(`Server is running at http://localhost:${appConfigs.appPort}/`);
        });
    } catch (error) {
        console.error('Failed to connect to the database', error);
    }
}

startServer();

wss.on('connection', (ws) => {
    runAI(ws);
});