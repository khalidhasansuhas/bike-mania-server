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

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: " UnAuthorized Access" })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: " Forbidden Access" })
        }
        req.decoded = decoded;
        next()
    })
}

async function run() {
    try {
        const usersCollection = client.db('bikeMania').collection('users')
        const bikesCollection = client.db('bikeMania').collection('bikes')
        const categoriesCollection = client.db('bikeMania').collection('categories')
        const bookingsCollection = client.db('bikeMania').collection('bookings')

        app.post('/jwt', async(req, res) => {
            const email = req.query.email;
            console.log(email);
            const query ={email: email}
            const user = await usersCollection.findOne(query)
            if(user){

                const token = jwt.sign({email}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10h' });
                return res.send({accessToken: token})
            }
            res.status(403).send({ accessToken: ''})
        })

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

        app.get('/users/admin/:email', async(req, res)=>{
            const email = req.params.email;
            const query = {email}
            const user = await usersCollection.findOne(query);
            res.send({isAdmin : user?.role === 'admin'});
        })

        app.get('/users/seller/:email', async(req, res)=>{
            const email = req.params.email;
            const query = {email}
            const user = await usersCollection.findOne(query);
            res.send({isSeller : user?.role === 'seller'});
        })

        app.get('/users/buyer/:email', async(req, res)=>{
            const email = req.params.email;
            const query = {email}
            const user = await usersCollection.findOne(query);
            res.send({isBuyer : user?.role === 'buyer'});
        })
       

        //get users by role
        app.get('/users', async (req, res) => {
            let query = {}
            if (req.query.role) {
                query = {
                    role: req.query.role
                }
            }
            const cursor = usersCollection.find(query);
            users = await cursor.toArray()

            res.send(users)
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

        app.put('/users/admin/verify/:id', async(req,res)=>{
            const id = req.params.id;
            const filter = {_id: ObjectId(id)}
            const options = { upsert: true};
            const updatedDoc = {
                $set: {
                    isVerified: 'verified'
                }
            }
            const result = await usersCollection.updateOne(filter,updatedDoc,options);
            res.send(result)
        })

        app.put('/users/admin/:id', async(req,res)=>{
            const id = req.params.id;
            const filter = {_id: ObjectId(id)}
            const options = { upsert: true};
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter,updatedDoc,options);
            res.send(result)
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

        app.post('/bikes', async(req,res)=>{
            const product = req.body;
            const result = await bikesCollection.insertOne(product);
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