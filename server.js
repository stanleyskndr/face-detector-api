const express = require("express");
const bcrypt = require("bcrypt-nodejs");
const cors = require("cors");
const knex = require("knex");

const db = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      //port : 3306,
      user : 'postgres',
      password : '240199',
      database : 'face-detector'
    }
});

const app = express();

app.use(express.json());
app.use(cors());


app.get("/", (req, res) =>{
    res.json(database.users);
})

app.post("/signin", (req, res) =>{
    const {email, password} = req.body;
    if(!email || !password){
        return res.status(400).json("Please fill all the input field.")
    }

    db.select("email", "hash").from("login")
        .where("email", "=", email)
        .then(data =>{
            const isValid = bcrypt.compareSync(password, data[0].hash);
            console.log(password, data[0].hash, isValid);
            if(isValid){
                return db.select("*").from("users")
                    .where("email", "=", email)
                    .then(user =>{
                        res.json(user[0]);
                    })
                    .catch(err =>{
                        res.status(400).json("Unable to get user data.");
                    })
            } else{
                res.status(400).json("Failed to sign in. Invalid password.");
            }
        })
        .catch(err =>{
            res.status(400).json("Failed to sign in. Invalid email.");
        })
})

app.post("/register", (req, res) =>{
    const {email, name, password} = req.body;
    if(!email || !name || !password){
        return res.status(400).json("Please fill all the input field.")
    }

    const hash = bcrypt.hashSync(password);

    db.transaction(trx =>{
        trx.insert({
            email: email,
            hash: hash
        })
        .into("login")
        .returning("email")
        .then(signinEmail =>{
            return db("users")
                .insert({
                    email: signinEmail[0].email,
                    name: name,
                    joined: new Date()
                })
                .returning("*")
                .then(user =>{
                    res.json(user[0]);
                }) 
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err =>{
        res.status(400).json("Sorry, unable to register.");
    })

})

app.get("/profile/:id", (req, res) =>{
    const {id} = req.params;    
    db("users").select("*").where({id})
        .then(userData =>{
            if(userData.length){
                res.json(userData[0]);
            }else{
                res.status(404).json("No user with that ID.");
            }
        })
        .catch(err =>{
            res.status(400).json("Error getting user data.");
        })
})

app.put("/image", (req, res) =>{
    const {id} = req.body;
    db("users").where("id", "=", id)
    .increment("entries", 1)
    .returning("entries")
        .then(entries =>{
            res.json(entries[0].entries)
        })
        .catch(err =>{
            res.status(400).json("Unable to get entries");
        })
})

app.listen(process.env.PORT, () =>{
    console.log(`App is running in port ${process.env.PORT}`)
})






// TEST FUNCTIONS BEFORE DATABASE

// var database = {
//     users:[
//         {
//             id: 101,
//             email: "aaaa@gmail.com",
//             username: "aaaa",
//             name: "aaaa aaa",
//             password: "asas",
//             entries: 0,
//             joined: new Date()
//         },
//         {
//             id: 102,
//             email: "bbbb@gmail.com",
//             username: "bbbb",
//             name: "bbbb bbb",
//             password: "bsbs",
//             entries: 0,
//             joined: new Date()
//         }
//     ]
// }

// const getUserDataById = (id) =>{
//     const userData = database.users.map(user =>{
//         if(id === user.id){
            
//             return user;
//         }
//     });

//     return userData[0];
// }

// const getUserDataByEmail = (email) =>{
//     const userData = database.users.map(user =>{
//         if(email === user.email){
//             return user;
//         }
//     });

//     return userData[0];
// }

// const checkPassword = (password, enteredPassword) =>{
//     if (enteredPassword !== password){
//         return false;
//     }else{
//         return true;
//     }

// }