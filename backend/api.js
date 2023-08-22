const axios = require('axios');


const API = axios.create({
    baseURL: "http://20.244.56.144/train",
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ',
    }
});

module.exports = API;