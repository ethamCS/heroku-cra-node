const express = require('express');
const path = require('path');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

const isDev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 5001;

// Multi-process to utilize all CPU cores.
if (!isDev && cluster.isMaster) {
  console.error(`Node cluster master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.error(`Node cluster worker ${worker.process.pid} exited: code ${code}, signal ${signal}`);
  });

} else {
  const app = express();

  // Priority serve any static files.
  app.use(express.static(path.resolve(__dirname, '../react-ui/build')));

  // Answer API requests.
  app.get('/api', function (req, res) {
    res.set('Content-Type', 'application/json');
    res.send('{"message":"Hello from the custom server!"}');
  });

  // All remaining requests return the React app, so it can handle routing.
  app.get('*', function(request, response) {
    response.sendFile(path.resolve(__dirname, '../react-ui/build', 'index.html'));
  });




app.use(express.urlencoded({extended: false}));
app.use(express.json())



const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database(process.cwd() + "/server/bank.sqlite", callback => { // bind database to variable
    if (callback){
        console.error(callback.message)
    }
});

  
app.get('/api/csv', (req, res) => {
    var index = 0;
    db.all(`
    select distinct anchorType, trialID,trials.timeInTrial,trialNumber,action,accountAttacked,blockNumber,trialUser, attackType, amountStolen
from block, trials, accounts
where trailBlockID=blockNumber and accountAttacked=account
group by trialID;`, (err, results) => {
        if (err){
            return console.error(err.message)
        } 

        var fs = require('fs');
        var csvWriter = require('csv-write-stream')
        var writer = csvWriter()

       console.log("index is: " +index)
        writer.pipe(fs.createWriteStream("client/public/ahh"+222+".csv"))
        index++;
        response = {
            "indexOfFile":index
        }
    
        for (let result of results){
           
            writer.write({anchorType: `${result.anchorType}`,trialID: `${result.trialID}`,timeInTrial:`${result.timeInTrial}`,action:`${result.action}`,trialUserInExp:`${result.trialUser}`,attackType:`${result.attackType}`,blockNumber:`${result.blockNumber}`,amountStolen:`${result.amountStolen}`})
           // console.log(`${result.anchorType},${result.trialID},${result.timeInTrial},${result.action},${result.accountAttacked},${result.blockNumber},${result.trialUser},${result.attackType},${result.amountStolen}\n`);
        }
        writer.end()
        console.log(JSON.stringify(response))
        res.send(JSON.stringify(response))
    }); 
   
});

app.post('/api/logout', (req, res) => {
    console.log("LEAVE DETECTED")
    body = Object.keys(req.body)
    body = JSON.parse(body)
    console.log(body)

    db.serialize(() => {
        db.all(` select trialNumber, trialID
        from trials
        where trials.trialUser="${body.value}"
         order by trialID DESC LIMIT 1;
        `, (err, results) => {
        if(err){
            return console.error(err.message);
        }  

        if(results.length < 1){
            db.all(`insert into trials (trailBlockID, trialUser, trialNumber, accountAttacked, action, amountStolen, attackType, timeInBlock, timeInTrial)
            values (${body.blockNumber}, "${body.value}",1,${body.accountNumber}, "leave", ${body.amountStolen}, "${body.attackType}", ${body.timeInBlock}, ${body.reactionTime})`, (err, results) => {
            if(err){
                return console.error(err.message);
            } 
        });
        }else{
        console.log(results)
        results = results[0].trialNumber
        //console.log(results)
       console.log(JSON.stringify(results))
        res.send(JSON.stringify(results))
        //results = results[0].blockNumber
        //console.log(results)
        trialNum = callback(results);
        }
        });
        function callback(results){
            trialNum = results+1;
            console.log(trialNum)
            db.all(`insert into trials (trailBlockID, trialUser, trialNumber, accountAttacked, action, amountStolen, attackType, timeInBlock, timeInTrial)
            values (${body.blockNumber}, "${body.value}",${trialNum},${body.accountNumber}, "leave", ${body.amountStolen}, "${body.attackType}", ${body.timeInBlock},${body.reactionTime})`, (err, results) => {
            if(err){
                return console.error(err.message);
            } 
        });
        db.all(`update block set timeInBlock=${body.timeInBlock} where blockUser='${body.value}' and blockNumber=${body.blockNumber}`, (err, results) => {
        if(err){
            return console.error(err.message);
        } 
    });
          
            return trialNum
          
        } 
  
});
});

app.put('/api/authenticate', (req, res) => {
    body = Object.keys(req.body)
    body = JSON.parse(body)
    console.log(body)
    var response = {}
    var bcrypt = require('bcryptjs');
    var hash3 = "$2a$10$CQAN61RvIog3PFBhiLEdkeuSIUFnJ6RK0JACeE2N4h/d8sNzLpuMK"
    
    var hash1 = bcrypt.hashSync(body.value);
    console.log(hash1)
    bcrypt.compare(body.value, hash3, (err, res)=> {
     if (res === true) {
         console.log('authenticated');
        response = {
            "admin": true
        }
     } else {

     console.log('NOT authenticated');
     response = {
        "admin": false
    }
     }
     console.log(response)

    callback(response)
 });

function callback(response){
 console.log(response)
 res.send(JSON.stringify(response))
}
});
// Data Collecting
//create user
app.put('/api/user', (req, res) => {
   
   console.log(body.value)
    db.serialize(() => {

        //check for existance of user
        db.all(`select * from users where users.id="${body.value}"`, (err, results) => {
            if (err){
                return console.error(err.message)
            }  

           //if user is not already in db add them and create their first session
            if(results.length == 0){
                console.log("first IF")
                db.all(`INSERT INTO users (id) VALUES ( "${body.value}" )`, (err, results) => {
                    if (err){
                        return console.error(err.message)
                    }    
                });

                db.all(`INSERT INTO session (sessionUser, sessionNumber) VALUES ( "${body.value}" , 1)`, (err, results) => {
                    if (err){
                        return console.error(err.message)
                    }
                });
                db.all(`
                select sessionNumber, sessionID, sessionUser
                from session
                where session.sessionUser="${body.value}"
                order by sessionID DESC LIMIT 1;`, (err, results) => {
                if (err){
                    return console.error(err.message)
                }
                console.log(JSON.stringify(results[0]))
                res.send(JSON.stringify(results[0]))
                results = results[0].sessionNumber
                //callback(results);

            });
                
            }
            //add new session to existing user
            sessionNum = 0;
            if(results.length >= 1){
                console.log("second IF")
                //find last session number of the user to be incremeneted 
                 db.all(`
                    select sessionNumber, sessionID, sessionUser
                    from session
                    where session.sessionUser="${body.value}"
                    order by sessionID DESC LIMIT 1;`, (err, results) => {
                    if (err){
                        return console.error(err.message)
                    }
                    results[0].sessionNumber = results[0].sessionNumber+1
                    console.log(JSON.stringify(results[0]))
                    res.send(JSON.stringify(results[0]))
                    results = results[0].sessionNumber
                    callback(results);

                });
                //create the session 
                let sessionNum = 0
                function callback(results){
                   // console.log(results)
                    sessionNum = results;
                    db.all(`INSERT INTO session (sessionUser, sessionNumber) VALUES ( "${body.value}" , ${sessionNum})`, (err, results) => {
                        if (err){
                            return console.error(err.message)
                        }
                    });
                }       
            }
        });
    });
});


app.put('/api/create_block', (req, res) => {
    console.log("BLOCK ALERT")
    body = Object.keys(req.body)
    body = JSON.parse(body)
    
    db.serialize(() => {
        db.all(`select * from block where block.blockUser="${body.value}"`, (err, results) => {
            if (err){
                return console.error(err.message)
            } 
            //console.log(results) 

           //if user is not already in db add them and create their first session
            if(results.length == 0){
                console.log("BODY: ")
                console.log(body)
                db.all(`INSERT INTO block (sessionOfBlock, blockNumber, blockUser) VALUES (${body.sessionID}, 1, "${body.value}" )`, (err, results) => {
                    if (err){
                        return console.error(err.message)
                    }    
                });
                db.all(`
                        select blockNumber, blockID, blockUser
                        from block
                        where block.blockUser="${body.value}"
                        order by blockNumber DESC LIMIT 1;`, (err, results) => {
                        if (err){
                            return console.error(err.message)
                        }
                        console.log(JSON.stringify(results[0]))
                        res.send(JSON.stringify(results[0]))
                        results = results[0].blockNumber
                        console.log(results)
                        //callback(results);
    
                    });
            }

            if(results.length >= 1){
                db.all(`
                        select blockNumber, blockID, blockUser
                        from block
                        where block.blockUser="${body.value}"
                        order by blockNumber DESC LIMIT 1;`, (err, results) => {
                        if (err){
                            return console.error(err.message)
                        }
                        results[0].blockNumber = results[0].blockNumber+1
                        console.log(JSON.stringify(results[0]))
                        res.send(JSON.stringify(results[0]))
                        results = results[0].blockNumber
                        console.log(results)
                        callback(results);
    
                    });
                    let blockNum = 0
                    function callback(results){
                       // console.log(results)
                        blockNum = results;
                        console.log(blockNum)
                        db.all(`INSERT INTO block (sessionOfBlock, blockNumber, blockUser) VALUES ( ${body.sessionID}, ${blockNum}, "${body.value}")`, (err, results) => {
                            if (err){
                                return console.error(err.message)
                            }
                        });
                    } 

            }
    
        });
    });

});
    

app.put('/api/sql_inject', (req, res) => {
    body = Object.keys(req.body)
    body = JSON.parse(body)
    
    db.serialize(() => {
        db.all(`SELECT * FROM accounts`, (err, results) => {
            if(err){
                return console.error(err.message);
            }
            console.log(JSON.stringify(results[0]))
            res.send(JSON.stringify(results[0]))
        });
    });
});

app.get('/api/xss', (req, res) => {
    index = 0;
    db.serialize(() => {
        db.all(`SELECT * FROM accounts`, (err, results) => {
            if(err){
                return console.error(err.message);
            }
            console.log(JSON.stringify(results[index]))
            res.send(JSON.stringify(results[index]))
        });
    });
})
// Option Responses

app.put('/api/steal', (req, res) => {
    body = Object.keys(req.body)
    body = JSON.parse(body)
    attackType = body.attackType
    account = body.account
    console.log(attackType)
    console.log(account)
    console.log(body)
    db.serialize(() => {

        let trialNum = 0
            
            db.all(`SELECT * FROM trials where trialUser="${body.value}"`, (err, results) => {
                if(err){
                    return console.error(err.message);
                }
                if(results.length < 1){
                    console.log("IF CHECK 248 app.js steal")
                    console.log(body)
                  
                        db.all(`SELECT * FROM accounts`, (err, results) => {
                            if(err){
                                return console.error(err.message);
                            }
                    
                            var response = {}, cart = []
                        
                            if (account >= results.length){
                                account = 0
                            }
                            //total = 
                            if (attackType === "SQL"){
                                response = {
                                    "currentAccount": results[account],
                                    "nextAccount": results[account],
                                    //"totalSolen": results[account-1].balance,
                                    "trialNum":1
                                }
                             
                            }
                            else if (attackType === "XSS"){
                                index++;
                                response = {
                                    "currentAccount": results[account],
                                    "nextAccount": results[index],
                                    "trialNum":1
                                }
                            }
                
                            //response = cart.pop();
                            console.log("STEAL TEST")
                            console.log(typeof(body.reactionTime))
                            console.log(response)
                            console.log(JSON.stringify(response))
                            res.send(JSON.stringify(response))//response.currentAccount.balance sums it :/
                            db.all(`insert into trials (trailBlockID, trialUser, trialNumber, accountAttacked, action, amountStolen, attackType, timeInTrial)
                            values (${body.blockNumber}, "${body.value}",1,${body.accountNumber}, "withdrawl", ${response.currentAccount.balance}, "${body.attackType}",${body.reactionTime})`, (err, results) => {
                            if(err){
                                return console.error(err.message);
                            } 
                        });
                        });

                   
                }
                if(results.length >= 1 ){
                    db.all(` select trialNumber, trialID
                        from trials
                        where trials.trialUser="${body.value}"
                         order by trialID DESC LIMIT 1;
                        `, (err, results) => {
                        if(err){
                            return console.error(err.message);
                        }  
                        results = results[0].trialNumber
                        //console.log(results)
                        trialNum = callback(results);
                        
                        });
                   
                    function callback(results){
                        trialNum = results+1;
                        console.log(trialNum)
                        db.all(`SELECT * FROM accounts`, (err, results) => {
                            if(err){
                                return console.error(err.message);
                            }
                    
                            var response = {}, cart = []
                        
                            if (account >= results.length){
                                account = 0
                            }
                            if (attackType === "SQL"){
                                response = {
                                    "currentAccount": results[account-1],
                                    "nextAccount": results[account],
                                    "trialNum":trialNum
                                }
                             
                            }
                            else if (attackType === "XSS"){
                                index++;
                                response = {
                                    "currentAccount": results[account-1],
                                    "nextAccount": results[index],
                                    "trialNum":trialNum
                                }
                            }
                
                            //response = cart.pop();
                            console.log("STEAL TEST")
                            console.log(response.nextAccount.balance)
                            console.log(JSON.stringify(response))
                            res.send(JSON.stringify(response))
                      
                        db.all(`insert into trials (trailBlockID, trialUser, trialNumber, action, amountStolen, accountAttacked, attackType, timeInTrial)
                        values (${body.blockNumber}, "${body.value}",${trialNum}, "withdrawl", ${response.currentAccount.balance}, ${body.accountNumber}, "${body.attackType}",${body.reactionTime})`, (err, results) => {
                            if (err){
                                return console.error(err.message)
                            }
                        });
                    });

                       
                        return trialNum
                      
                    } 
                
                }
              
            });
            
        });

    
})
 

app.put('/api/next', (req, res) => {
    body = Object.keys(req.body)
    body = JSON.parse(body)
    attackType = body.attackType
    account = body.account
    console.log(attackType)
    console.log(account)
    console.log(body)
    db.serialize(() => {
       

            db.all(`SELECT * FROM trials where trialUser="${body.value}"`, (err, results) => {
                if(err){
                    return console.error(err.message);
                }
                if(results.length < 1){
                    console.log("IF CHECK 248 app.js steal")
                    console.log(body)
                    db.all(`insert into trials (trailBlockID, trialUser, trialNumber, action, amountStolen, accountAttacked, attackType, timeInTrial)
                    values (${body.blockNumber}, "${body.value}",1, "next", 0, ${body.accountNumber}, "${body.attackType}",${body.reactionTime})`, (err, results) => {
                        if(err){
                            return console.error(err.message);
                        }  
                    });
                    db.all(`SELECT * FROM accounts`, (err, results) => {
                        let response = {}
                        if (account >= results.length){
                            account = 0
                        }
                        if (attackType === "SQL"){
                            response = {
                                "nextAccount": results[account],
                                "trialNum": 1
                            }
                        }
                        else if (attackType === "XSS"){
                            index++;
                            response = {
                                "nextAccount": results[index],
                                "trialNum":1
                            }
                        }
                        console.log(JSON.stringify(response))
                        res.send(JSON.stringify(response))
                    });
                }
                if(results.length >= 1 ){
                    db.all(` select trialNumber, trialID
                        from trials
                        where trials.trialUser="${body.value}"
                         order by trialID DESC LIMIT 1;
                        `, (err, results) => {
                        if(err){
                            return console.error(err.message);
                        }  
                        results = results[0].trialNumber
                        //console.log(results)
                        callback(results);
    
                    });
                    let blockNum = 0
                    function callback(results){
                        trialNum = results+1;
                        console.log(trialNum)
                        db.all(`insert into trials (trialUser, trialNumber, action, amountStolen, trailBlockID, accountAttacked, attackType, timeInTrial)
                        values ( "${body.value}",${trialNum}, "next", 0, ${body.blockNumber},${body.accountNumber}, "${body.attackType}",${body.reactionTime})`, (err, results) => {
                            if (err){
                                return console.error(err.message)
                            }
                        });
                        db.all(`SELECT * FROM accounts`, (err, results) => {
                            let response = {}
                            if (account >= results.length){
                                account = 0
                            }
                            if (attackType === "SQL"){
                                response = {
                                    "nextAccount": results[account],
                                    "trialNum": trialNum
                                }
                            }
                            else if (attackType === "XSS"){
                                index++;
                                response = {
                                    "nextAccount": results[index],
                                    "trialNum":trialNum
                                }
                            }
                            console.log(JSON.stringify(response))
                            res.send(JSON.stringify(response))
                        });
                    } 
                
                }
              
            });
            // var test1 = getTrialNumber()
            // console.log("TEST1: ")
            // console.log(test1)
           
        });
    
})



// Helper functions

app.listen(PORT, function () {
  console.error(`Node ${isDev ? 'dev server' : 'cluster worker '+process.pid}: listening on port ${PORT}`);
});
}

