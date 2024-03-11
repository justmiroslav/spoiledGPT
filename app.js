const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const corsOptions = require('./helpers/corsOptions');
const appConfigs = require('./configs/appConfig');
const mongoConnection = require('./connections/mongoConnection');
const routes = require('./routes');
const path = require('path');
const favicon = require('serve-favicon');
const http = require('http');
const WebSocket = require('ws');
const cookieParser = require('cookie-parser');
const runAI = require('./controllers/wsController');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server: server });
server.listen(appConfigs.wssPort, () => {
    console.log(`WS Server listening on port ${appConfigs.wssPort}`);
});

app.use(favicon(path.join(__dirname, 'static', 'img', 'favicon.PNG')));
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/auth", routes.authRoutes);
app.use("/message", routes.messageRoutes);
app.use("/chat", routes.chatRoutes);
app.use("/", routes.appRoutes);
app.use(express.static(path.join(__dirname, 'static')));
app.set('view engine', 'pug');
app.set('views', [path.join(__dirname, 'views'), path.join(__dirname, 'views/auth')]);

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