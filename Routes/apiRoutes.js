const router = require("express").Router();
const Employee = require("../Employee/employee");
const path = require("path");
const mysql = require("mysql");
let user = require("../user/user.json");
const Member = require("../Clients/clients.js");

// Connect to the gym_management_systemdb database using a localhost connection
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "rootroot",
  database: "gym_management_systemdb",
});

connection.connect((err) => {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
});

// GET "/api/classes" responds with all classes from the database
router.get("/classes", (req, res) => {
  connection.query(
    "SELECT *,employee.first_name, employee.last_name FROM class INNER JOIN employee ON class.trainer_id = employee.id",
    function (err, result) {
      if (err) throw err;
      res.json(result);
    }
  );
});

// POST "api/login" authenticates the member login credentials in the database, and responds with the personal details of the member
router.post("/login", (req, res) => {
  const data = req.body;
  // retrieves the record from database if username and password combination entered by the user matches with the existing records in the database
  connection.query(
    `SELECT * from member WHERE username = "${data.userName}" AND password = MD5("${data.password}")`,
    function (err, result) {
      if (err) throw err;

      // if the result-set has exactly 1 record, then pass on the member details(database query response) to front-end, else send an error message
      result.length === 1
        ? res.json(result[0])
        : res.json({
            error:
              "Username and/or password is incorrect. Please try again.",
          });
    }
  );
});

router.post("/addEmployee", (req, res) => {
  const data = req.body;
  const newEmployee = new Employee(
    data.username,
    data.password,
    data.first_name,
    data.last_name,
    data.gender,
    data.email,
    data.phone,
    data.role,
    data.manager_id
  );
  // SQL query to insert the new employee registration record in the employee table in the database
  connection.query(
    "INSERT INTO employee SET ?",
    newEmployee,
    function (err) {
      if (err) {
        // shows a user friendly message to user
        res.json({
          error:
            "Sorry! Some problem occured. Please try again!",
        });
      } else {
        res.json({
          success: `${data.first_name} ${data.last_name} has been added as ${data.role}`,
        });
      }
    }
  );
});

router.post("/register", (req, res) => {
  const data = req.body;
  const newMember = new Member(
    data.username,
    data.password,
    data.first_name,
    data.last_name,
    data.gender,
    data.date_of_birth,
    data.email,
    data.phone
  );
  // SQL query to insert the new member registration record in the member table in the database
  connection.query(
    "INSERT INTO member SET ?",
    newMember,
    function (err) {
      if (err) {
        // shows a user friendly message to user
        res.json({
          error:
            "Sorry! Some problem occured. Please try again!",
        });
      } else {
        res.json({
          success: `Welcome ${data.first_name}! You are now a member of Dev Fitness`,
        });
      }
    }
  );
});

router.post("/addToClass", (req, res) => {
  console.log(req.body);
  connection.query(
    `INSERT INTO class_members (class_id, member_id, date) 
    VALUES (
       ${parseInt(user.id)}, 
       ${parseInt(req.body.member_id)}, 
       ${parseInt(req.body.date)}
       )`,
    function (err, result) {
      if (err) throw err;
      res.json(result);
    }
  );
  res.send("Added to class!");
});

module.exports = router;
