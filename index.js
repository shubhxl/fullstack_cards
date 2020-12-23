const {google} = require('googleapis');
const keys = require('./keys.json');
const express = require('express');
const cors = require('cors');
const bodyParser = require("body-parser");
const app = express();  
const path = require('path');    
let PORT = process.env.PORT || 9000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use(express.static(path.join(__dirname, 'client')));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

app.get('/form', function (req, res) {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});


const client = new google.auth.JWT(
    keys.client_email,
    null,
    keys.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
);

client.authorize(function(err, tokens){
    if(err){
        console.log(err)
        return;
    }
    else{
        gsrun(client)
        console.log('connected');
    }
});

let dataArray;

async function gsrun(cl){
    const gsapi = google.sheets({version:'v4', auth:cl});

    const opt ={
        spreadsheetId:'1lZPS12LBVC6fbDdWKl5_wcd1sNG43Q6OdoQcQSZbovU',
        range:'CardData!A2:Q'
    }

    let data= await gsapi.spreadsheets.values.get(opt);
    let yoArray = data.data.values
    dataArray = yoArray.map(function(r){
        let myObj= {Image:r[0], Course:r[1], FFS:r[2], FPS:r[3], CP:r[4], Age:r[5], TIW:r[6], ON:r[7], Cen:r[8], Skills:r[9], Book:r[10], TC1: r[11], TC2: r[12], MDT1:r[13], MDD1:r[14], MDT2:r[15], MDD2:r[16]}
        return myObj
    })
    console.log(dataArray);

}


app.use(cors());
app.get('/data', (req, res) =>{
    res.send(dataArray)
})

let final=[]

app.get('/api', (req,res)=>[
    res.send(final)
])

app.post('/api', (req,res)=>{
    const data = {
        id: final.length+1,
        course : req.body.course
    }
    final.push(data)
    res.send(data)
})

app.get('/fd', (req,res)=>{
    res.send(final)
  })


  app.post('/fd',(req,res) =>{
    const data = {
       id: final.length+1,
       name : req.body.name,
       age : req.body.age,
       program : req.body.program,
       email : req.body.email,
       tc:req.body.tc
    }
      final.push(data)
      res.send(data);

      client.authorize(function(err){
        if(err){
            console.log(err)
            return;
        }
        else{
            // gswrite(client)
            
            const gsapi = google.sheets({version:'v4', auth:client});
            const options ={
                spreadsheetId:'1lZPS12LBVC6fbDdWKl5_wcd1sNG43Q6OdoQcQSZbovU',
                range:'FormResponse!A2',
                valueInputOption:'USER_ENTERED',
                resource: {values: [[req.body.name, req.body.age, req.body.program, req.body.email, req.body.tc]]}
            };
    
            let res = gsapi.spreadsheets.values.append(options);
            console.log(res);
            console.log('happening');
        }
  })
})


app.listen(PORT, ()=>{
    console.log('Listening, go to 9000');
})