const express = require("express");
const API = require("./api");
const axios = require("axios")

const app = express();

// parse json 
app.use(express.json());
app.use(express.urlencoded({ extended: true} ));

// load secrets from .env file
require("dotenv").config();

function priceComparator(t1, t2) {
    if (t1.price.sleeper > t2.price.sleeper) {
        return 1;
    } else if (t1.price.sleeper < t2.price.sleeper) {
        return -1;
    } else {
        // if price of both sleeper is same then compare AC
        if (t1.price.AC > t2.price.AC) return 1;
        else return 1;
    }
}

function seatAvlComparator(t1, t2) {
    if (t1.seatsAvailable.sleeper < t2.seatsAvailable.sleeper) {
        return 1;
    } else if (t1.seatsAvailable.sleeper > t2.seatsAvailable.sleeper) {
        return -1;
    } else {
        // if price of both sleeper is same then compare AC
        if (t1.seatsAvailable.AC < t2.seatsAvailable.AC) return 1;
        else return 1;
    }
}

function departureComparator(t1, t2) {
    // sort by descending order of time
    // departure time t1
    let departure1 = new Date();
    departure1.setHours(t1.departureTime.Hours);
    departure1.setMinutes(t1.departureTime.Minutes);
    departure1.setSeconds(t1.departureTime.Seconds);

    // departure time t2
    let departure2 = new Date();
    departure2.setHours(t2.departureTime.Hours);
    departure2.setMinutes(t2.departureTime.Minutes);
    departure2.setSeconds(t2.departureTime.Seconds);

    // considering delay 
    let delayed1 = new Date(departure1.getTime() + t1.delayedBy * 60 * 1000);
    let delayed2 = new Date(departure2.getTime() + t2.delayedBy * 60 * 1000);

    if (delayed1 > delayed2) return 1;
    return -1;
}

app.get("/trains", async (req, res) => {

        const tokenStr = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2OTI3MTM2ODMsImNvbXBhbnlOYW1lIjoiVHJhaW4gQ2VudHJhbCIsImNsaWVudElEIjoiODM1NDNmYzAtZGUwZC00ZDAwLWI4MzItYjkxOGNhZWVkOTlmIiwib3duZXJOYW1lIjoiIiwib3duZXJFbWFpbCI6IiIsInJvbGxObyI6IlJBMjAxMTAwMzAxMDc3OCJ9.jgvbaemMmBJGyJQkUEA-fHz9kdzuHk-r_EU1mCbkLDU"
    try {

        const initial = (await axios.get("http://20.244.56.144/train/trains",{ headers: {"Authorization" : `token ${tokenStr}`} }).data);

        console.log(initial);

        // ignore trains that are in next 30 minutes of departure
        const filtered = initial.filter(({ departureTime }) => {
            // departure time
            let departure = new Date();
            departure.setHours(departureTime.Hours);
            departure.setMinutes(departureTime.Minutes);
            departure.setSeconds(departureTime.Seconds);
            // current time
            const now = new Date();
            const diff = departure - now;
            return diff > 30 * 60 * 1000;
        });

        // sort by price
        filtered.sort(priceComparator);

        // sort by seats available
        filtered.sort(seatAvlComparator);
        // sort by departure time

        // let us consider delay in minutes 
        filtered.sort(departureComparator);

        return res.status(200).json(initial.data);
    } catch (error) {
        console.log(error);
    }
});

app.get("/trains/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const initial = (await API.get(`/trains/${id}`)).data;
        return res.status(200).json(initial);
    } catch (error) {
        console.log(error);
    }
});


// listed to requests on port 3000
app.listen(5555, () => {
    console.log(`Server started on port 5555`);
});