const mongoose = require('mongoose');
const initData = require('./data');
const Listing = require('../models/listing');

main()
.then((res)=>{
    console.log("connection successful: ", res);
})
.catch((err)=>{
    console.log(err);
})

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/airbnb');
}

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({...obj, owner: "6a07c96c8919c395337cbbc6" })) //because map returns new array so saving it in initData.data again
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
}

initDB();
