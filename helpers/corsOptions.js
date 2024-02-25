const whitelist = ["http://127.0.0.1:8800", "http://localhost:8800", "http://127.0.0.1:8000", "http://localhost:8000", "http://51.20.162.206:27017/", "http://51.21.47.44:27017/", "http://51.20.230.52:27017/", "ws://127.0.0.1:1337"];

function originFunction (origin, callback) {
    if (whitelist.includes(origin) || !origin) {
        callback(null, true);
    } else {
        callback(new Error('Not allowed by CORS'));
    }
}

const corsOptions = {
    origin: originFunction
};

module.exports = corsOptions;