const { faker } = require('@faker-js/faker');

const mysql = require('mysql2');
const express = require("express");
const app = express();

let port = 3000;

app.listen(port, () => {
    console.log(`server is listening to port ${port}`);
})

const path = require("path");
const methodOverride = require("method-override");

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));




const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'delta_app',
  password: 'Connect@101'
});

let getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.username(),
    faker.internet.email(),
    faker.internet.password()
  ];
}

//Inserting New Data
// let q = "INSERT INTO user (id, username, email, password) VALUES ?";

// let data = [];
// for(let i=1; i<=100; i++){
//     data.push(getRandomUser()); //100 fake user
// }

app.get("/", (req, res) => {
    let q = `SELECT COUNT(*) FROM user`;
    try{
    connection.query(q, (err, result) => {
        if(err) throw err;
        // let count = result[0]["COUNT(*)"];
          let count = result[0]["COUNT(*)"];
        // res.send(result[0]["COUNT(*)"]);
        console.log(count);
        res.render("home.ejs", { count });
    });
} catch (err) {
    console.log(err);
    res.send("some error in DB")
}
})
app.get("/user", (req, res) => {
    let q = `SELECT * FROM user`;
    try{
    connection.query(q, (err, result) => {
        if(err) throw err;
        let users = result;
        // res.send(result[0]["COUNT(*)"]);
        console.log(users);
        res.render("users.ejs", {users});
    });
} catch (err) {
    console.log(err);
    res.send("some error occured");
}
})

app.get("/user/:id/edit", (req, res) => {
    let {id} = req.params;
    let q = `SELECT * FROM user WHERE id= '${id}'`;

    try {
        connection.query(q, (err, result) => {
            if(err) throw err;
            let user = result[0];
            // console.log(result);
            res.render("edit.ejs", {user})
        });
    }
        catch (err) {
            console.log(err);
            res.send("some error in DB");
        }
    });

    app.patch("/user/:id", (req, res) => {
        let {id} = req.params;
        let {password: formPass, username: newUsername} = req.body;
    let q = `SELECT * FROM user WHERE id= '${id}'`;

    try {
        connection.query(q, (err, result) => {
            if(err) throw err;
            let user = result[0];
            if(formPass != user.password) {
                res.send("Wrong password");
            }else{
                let q2 = `UPDATE user SET username = '${newUsername}' WHERE id = '${id}'`;
                connection.query(q2, (err, result) => {
                    if (err) throw err;
                    res.redirect("/user");
                });
            }
            // console.log(result);
        });
    }
        catch (err) {
            console.log(err);
            res.send("some error in DB");
        }
    })

    app.get("/user/new", (req, res) => {
        // res.send("Create a new user");
        res.render("new.ejs");
    })

    app.post("/user", (req, res) => {
        let {username, email, password} = req.body;
        let id = faker.string.uuid();
        // let q = `SELECT * FROM user WHERE id= '${id}'`;
        let q = "INSERT INTO user (id, username, email, password) VALUES (?, ?, ?, ?)";

    try {
        connection.query(q, [id, username, email, password], (err, result) => {
            if(err) throw err;
            // let user = result[0];
            // console.log(result);
            // res.render("edit.ejs", {user})
            console.log(result);
            res.redirect("/user");
        });
    }
        catch (err) {
            console.log(err);
            res.send("some error in DB");
        }

    })


    // Show Delete Form
app.get("/user/:id/delete", (req, res) => {
    let { id } = req.params;
    let q = "SELECT * FROM user WHERE id = ?";
    connection.query(q, [id], (err, result) => {
        if (err) throw err;
        let user = result[0];
        console.log(user);
        res.render("delete.ejs", { user });
    });
});


// Handle Delete Request
app.delete("/user/:id", (req, res) => {
    let { id } = req.params;
    let { email, password } = req.body;

    // Step 1: Verify email + password
    let q = "SELECT * FROM user WHERE id = ?";
    connection.query(q, [id], (err, result) => {
        if (err) throw err;
        if (result.length === 0) return res.send("User not found");

        let user = result[0];

        // Match email + password
        if (user.email === email && user.password === password) {
            let delQ = "DELETE FROM user WHERE id = ?";
            connection.query(delQ, [id], (err2) => {
                if (err2) throw err2;
                res.redirect("/user"); // Redirect to users list
            });
        } else {
            res.send("Email or password is incorrect");
        }
    });
});





