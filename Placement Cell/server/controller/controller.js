
const axios = require('axios');
const bcrypt = require('bcrypt');
const { student, company, admin, job, studentJob } = require('../model/model');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const { syncIndexes } = require('mongoose');
require('dotenv').config({ path: 'config.env' });


exports.filter = (req , res ) => {

    const search = req.query; 
    job.find({sear : search})
        .then(data => {
            if(!data){
                res.status(404).send({message:"Not Found"});
            }
            else{
                res.send(data); 
            }
            })
        .catch(err=>{
            res.status(500).send({message:"Error while fetching data of requested query"})
        })
};
