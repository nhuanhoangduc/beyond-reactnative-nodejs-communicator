const rn_bridge = require('rn-bridge');


const services = {}; // { serviceName: requestHandler }


const service = (serviceName, requestHandler) => {
    services[serviceName] = requestHandler;
};


rn_bridge.channel.on('message', (message) => {
    const { from: requestId, to: serviceName, body } = message;
    const requestHandler = services[serviceName];

    if (!requestHandler) {
        return;
    }

    const request = body;
    const response = {
        success: (response) => {
            const message = {
                from: serviceName,
                to: requestId,
                ok: 1,
                body: response,
            };
            rn_bridge.channel.send(message);
        },

        error: (error) => {
            const message = {
                from: serviceName,
                to: requestId,
                ok: 0,
                body: {
                    reason: error,
                },
            };
            rn_bridge.channel.send(message);
        },
    };

    requestHandler(request, response);
});


module.exports = service;
