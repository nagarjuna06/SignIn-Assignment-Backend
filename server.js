require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors')
const signInModel = require('./schema');
const app = express()
app.use(express.json())
app.use(cors())

mongoose.connect(process.env.MONGODB_URI).then(() => console.log("DB Connected!")).catch(err => console.log(err))

app.listen(5000, () => console.log('server is running at 5000'))

const generateJwt = (payload) => {
    const jwtToken = jwt.sign(payload, "SECRETE", { expiresIn: '30d' })
    return jwtToken
}
const UserMatched = async (req, res, next) => {
    const data = req.body
    const userData = await signInModel.findOne({ email: data.email });
    if (userData === null) {
        res.status(401);
        res.send({ msg: "Invalid User!" })
    }
    else {
        req.userData = userData
        next()
    }
}
const PasswordMatched = async (req, res, next) => {
    const isPasswordMatched = await bcrypt.compare(req.body.password, req.userData.password)
    if (isPasswordMatched) {
        next()
    }
    else {
        res.status(400);
        res.send({ msg: "Incorrect Password" })
    }
}

const verifyJwtToken = async (request, response, next) => {
    let jwtToken;
    const authHeader = request.headers["authorization"]

    if (authHeader !== undefined) {
        jwtToken = authHeader.split(" ")[1]

    }
    if (jwtToken === undefined) {
        response.status(401)
        response.send({ msg: "unauthorized user!" })
    }
    else {
        jwt.verify(jwtToken, "SECRETE", async (error, user) => {
            if (error) {
                response.status(400);
                response.send({ msg: "Invalid access token" });
            }
            else {
                request.user = user;
                next()
            }
        });
    }
}


app.post('/signIn', UserMatched, PasswordMatched, async (req, res) => {
    const { email, _id } = req.userData
    const data = { email, _id }
    const jwtToken = generateJwt(data)
    res.send({ jwtToken })

});

app.get('/', verifyJwtToken, async (req, res) => {
    res.send(req.user)
})