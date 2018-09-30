import nodejs from 'nodejs-mobile-react-native';
const uuid = require('./uuid');


const messageHandlers = {}; // uuid: { resolve, reject }


export const talk = (serviceName, body) => new Promise((resolve, reject) => {
    const requestId = uuid();

    messageHandlers[requestId] = {
        resolve: resolve,
        reject: reject,
    };

    nodejs.channel.send({
        from: requestId,
        to: serviceName,
        body: body,
    });
});


/**
 * Message control center
 * Response message format: { from: serviceName, to: requestId, ok: 0/1, body }
 */
nodejs.channel.addListener(
    'message',
    (message) => {
        const { to: requestId, ok, body } = message;

        if (!messageHandlers[requestId]) {
            return;
        }

        const { resolve, reject } = messageHandlers[requestId];
        
        if (ok) {
            resolve(body);
        } else {
            reject(body);
        }

        messageHandlers[requestId] = null;
    }
);



export default talk;
