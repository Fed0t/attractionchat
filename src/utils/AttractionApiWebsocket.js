const w3cws = require('websocket').w3cwebsocket;
const Wampy = require('wampy').Wampy;

const AttractionApiWebsocket = {
    connectToWebsocket: (authId,token) => {
        let ws = new Wampy('wss://app.attractionclub.ro:9999', {
            ws: w3cws,
            realm: 'attractionclub',
            authid: authId,
            autoReconnect:true,
            reconnectInterval:3000,
            authmethods: ['jwt'],
            onChallenge: (method, info) => {
                if (method === "jwt") {
                    return token;
                } else {
                   return 'Authentication failed.Tic Tac!'
                }
            },
            onConnect: () => {
            }
        });
        ws.connect();
        return ws;
    }
};

module.exports = AttractionApiWebsocket;