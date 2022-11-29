const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const { query } = require('express');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.d5moryc.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const usersCollection = client.db('bikeMania').collection('users')
        const bikesCollection = client.db('bikeMania').collection('bikes')
        const categoriesCollection = client.db('bikeMania').collection('categories')
        const bookingsCollection = client.db('bikeMania').collection('bookings')

        app.get('/categories', async(req, res)=>{
            const query = {}
            const cursor = categoriesCollection.find(query)
            const categories = await cursor.toArray();
            res.send(categories)
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user);
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

        app.get('/category', async (req, res) => {

            let query = {}
            if (req.query.categoryName) {
                query = {
                    categoryName: req.query.categoryName
                }
            }
            const cursor = bikesCollection.find(query);
            bikes = await cursor.toArray()

            res.send(bikes)
        })

        app.post('/bookings', async(req,res)=>{
            const booking = req.body;
            const result = await bookingsCollection.insertOne(booking);
            res.send(result);
        })

        app.get('/bookings', async(req, res)=>{
            const email = req.query.email;
            const query = {email: email};
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings);
        })

        app.patch('/bikes/:id', async(req,res)=>{
            const id = req.params.id;
            const status = req.body;
            console.log(status)
            const query = {_id : ObjectId(id)};
            const updatedDoc = {
                $set:{
                    status: status
                }
            }
            const result = await bikesCollection.updateOne(query, updatedDoc);
            res.send(result);
        })

    }
    finally {

    }
} run().catch(e => console.log(e));


app.get('/', (req, res) => {
    res.send('Bike-Mania server is running')
})

app.listen(port, () => {
    console.log(`Bike-Mania server is running on port: ${port}`);
})