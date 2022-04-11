import axios from 'axios'

export async function sendServerRequestGET(requestBody, serverPort=getOriginalServerPort()) {
    console.log(serverPort)
    try { return await axios.get(`${serverPort}/api/${requestBody.requestType}`, JSON.stringify(requestBody)) }
    catch(error) { return null; }
}

export async function sendServerRequestPOST(requestBody, serverPort=getOriginalServerPort()) {
    console.log(serverPort)
    try { return await axios.post(`${serverPort}/api/${requestBody.requestType}`, JSON.stringify(requestBody)) }
    catch(error) { return null; }
}

export async function sendServerRequestPUT(requestBody, serverPort=getOriginalServerPort()) {
    console.log(serverPort)
    try { return await axios.put(`${serverPort}/api/${requestBody.requestType}`, JSON.stringify(requestBody)) }
    catch(error) { return null; }
}

export function getOriginalServerPort() {
    const serverProtocol = window.location.protocol;
    const serverHost = window.location.hostname;
    const serverPort = window.location.port;
    const alternatePort = process.env.SERVER_PORT;
    return `${serverProtocol}//${serverHost}:${(!alternatePort ? serverPort : alternatePort)}`;
}