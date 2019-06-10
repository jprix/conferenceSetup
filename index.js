const express       = require ('express');
const app           = express ();
// const fs            = require ('fs');
const request       = require ('request');
const bodyParser    = require ('body-parser');

const router        = express.Router ();
const PORT          = 3000;


const SETTINGS  = {
    assets_base: '/web-app'
}

app.use (bodyParser.json()); 
app.use (bodyParser.urlencoded({ extended: true })); 

router.get ('/', (req, res) => {
    res.render ('index.ejs', { ...SETTINGS, ...{
        partecipants: [
            { name: 'Moderator', mod: true },
            { name: 'Participant 1', mod: false },
            { name: 'Participant 2', mod: false },
            { name: 'Participant 3', mod: false }
        ]
    }})
});

router.post ('/createConference', (req, res) => {
    // console.log (JSON.stringify (JSON.parse (req.body.data), null, '   '));
    request ({
        method: 'POST',
        uri: 'https://cobalt-greyhound-5788.twil.io/createSyncMapItem',
        form: {
            Data: req.body.data
        }
    }, (e, r, b) => {
        console.log (b)
        res.json (JSON.parse (b));
        // res.json (JSON.parse (req.body.data));
    })
});

app.use ('/', router);
app.use (SETTINGS.assets_base, express.static ('web-app'));

app.listen (process.env.port || PORT);

console.log ('Running at Port', PORT);