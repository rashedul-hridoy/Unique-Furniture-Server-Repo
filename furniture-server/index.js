const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
//const jwt = require('jsonwebtoken');
require('dotenv').config();
//const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.akesmbp.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const productCollection = client.db('uniqueFurniture').collection('products');
        const usersCollection = client.db('uniqueFurniture').collection('users');
        const advertiseCollection = client.db('uniqueFurniture').collection('advertise');
        const bookedProductsCollection = client.db('uniqueFurniture').collection('bookedProducts');
        // products
        app.get('/category/:id', async (req, res) => {
            const category_id = req.params.id;
            const query = { category_id };
            const product = await productCollection.find(query).toArray();
            res.send(product);
        })

        app.get('/products/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const myproducts = await productCollection.find(query).toArray();
            res.send(myproducts);
        })

        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            res.send(result);
        })

        app.delete('/products/:id', async(req,res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await productCollection.deleteOne(query);
            res.send(result);
        })

        // Booked product
        app.post('/bookedproducts', async (req, res) => {
            const product = req.body;
            const result = await bookedProductsCollection.insertOne(product);
            res.send(result);
        })

        app.get('/bookedproducts/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const myorders = await bookedProductsCollection.find(query).toArray();
            res.send(myorders);
        })


        //------------ advertise-------------
        app.post('/advertise', async (req, res) => {
            const product = req.body;
            const result = await advertiseCollection.insertOne(product);
            res.send(result);
        })
        app.get('/advertise', async (req, res) => {
            const query = {};
            const product = await advertiseCollection.find(query).toArray();
            res.send(product);
        })

        //---------- user---------------
        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({ isSeller: user?.role === 'Seller' })
        })
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'Admin' })
        })
        app.get('/users/buyer/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({ isBuyer: user?.role === 'Buyer' })
        })

        app.get('/users', async (req,res) =>{
            let query = {};
            if(req.query.role){
                query ={role : req.query.role}
            }
            const cursor = usersCollection.find(query);
            const seller = await cursor.toArray();
            res.send(seller);
        });

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });
        app.put('/users/:id', async (req, res) => {
            const id = req.params.id;
            const status = req.body.status;
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    status: status
                }
            }
            const result = await usersCollection.updateOne(query, updatedDoc, options);
            res.send(result);
        })
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(query);
            res.send(result);
        })
    }
    finally {

    }
}
run().catch(console.log);




app.get('/', async (req, res) => {
    res.send('Unique Furniture server is running');
})

app.listen(port, () => console.log(`Unique Furniture running on ${port}`))