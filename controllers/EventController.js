const moment = require('moment');

const index = (req, res) => {
    var currentDateTimeInUTC = moment().toISOString();
    console.log(111,currentDateTimeInUTC)
    let q = 'SELECT id, title__c, description__c, CreatedDate, startdate__c, enddate__c, status__c, banner__c FROM EventNodejs__c LIMIT 10';
    let records = [];
    let query = req.conn.query(q)
        .on("record", function(record) {
            console.log(22222,record.StartDate__c)
            if(moment(currentDateTimeInUTC).isBefore(record.StartDate__c)){
                records.push(record);
            }
        })
        .on("end", function() {
            console.log("total in database : " + query.totalSize);
            console.log("total fetched : " + query.totalFetched);
            res.json(records);
        })
        .on("error", function(err) {
            console.error(err);
        })
        .run({ autoFetch : true, maxFetch : 4000 });
}

const show = (req, res) => {
    req.conn.sobject("EventNodejs__c").retrieve(req.params.id, function(err, event) {
        if (err) { return console.error(err); }
        console.log("Name : " + event.title);
        res.json(event);
    });
}

const eventRegister = async (req, res) => {
    var errors = []
    if(!req.body.email__c){
        errors.push('Email field is required.')
    }
    if(!req.body.phone__c){
        errors.push('Phone field is required.')
    }
    if(!req.body.firstName__c){
        errors.push('First Name field is required.')
    }
    if(!req.body.lastName__c){
        errors.push('Last Name field is required.')
    }
    if(!req.body.company__c){
        errors.push('Company field is required.')
    }
    if(!req.body.eventId__c){
        errors.push('Event Id field is required.')
    }
    if(req.body.eventId__c && req.body.email__c){
        let q = "SELECT id FROM EventRegister__c WHERE email__c ='"+req.body.email__c+"' AND eventId__c = '"+req.body.eventId__c+"'"
        await req.conn.query(q)
        .on("record", function(record) {
            if(record){
                errors.push('You already registered with this event.')
            }
        })
        .on("error", function(err) {
            console.error(err);
        })
    }

    if(errors.length > 0){
        res.status(400).json({errors})
    }
    else {
        req.conn.sobject("EventNodejs__c").retrieve(req.body.eventId__c, function(err, event) {
            if (err) { return console.error(err); }
            if(event.Status__c !== "Open"){
                errors.push('This event is not open can\'t register')
                res.status(400).json({errors})
            }
            const today = new Date()
            const eventStartDate = new Date(event.StartDate__c)
            if(today.getTime() >= eventStartDate.getTime()){
                errors.push('Event is in past')
                res.status(400).json({errors})
            }
            if(errors.length === 0){
                req.conn.sobject("EventRegister__c").create(req.body, function(err, ret) {
                    if (err || !ret.success) { return console.error(err, ret); }
                    console.log("Created record id : " + ret.id);
                    res.status(200).json({register:ret})
                });
            }
        });
    }
    
}

module.exports = {index, show, eventRegister}