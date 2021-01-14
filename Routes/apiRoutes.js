const db = require("../models");

module.exports = function (app) {
  // GET "/api/classes" responds with all classes from the database
  app.get("/api/classes/:id", function (req, res) {
    db.Class.findAll({}).then(function (classes) {
      //need code to find trainer name maybe association

      db.Member.findOne({
        where: {
          id: req.params.id,
        },
      }).then(function (currentUser) {
        db.Employee.findAll({}).then(function (trainers) {
          let classesJoined = [];
          let roster = [];
          let classBundle = [];

          const userName =
            currentUser.dataValues.first_name;

          classes.forEach(function (unit) {
            const activeTrainer = trainers.filter(
              (trainer) =>
                trainer.dataValues.id ===
                unit.dataValues.trainer_id
            );

            if (roster) {
              const roster = unit.dataValues.roster.split(
                "'"
              );

              roster.filter(function classParse(
                participant
              ) {
                if (
                  currentUser.dataValues.id ===
                  parseInt(participant)
                ) {
                  let thisClass = {
                    id: unit.dataValues.id,
                    class_name: unit.dataValues.class_name,
                  };
                  classesJoined.push(thisClass);
                  console.log(classesJoined);
                }
              });
            }
            console.log(classesJoined);
            const reqClass = {
              id: unit.dataValues.id,
              class_name: unit.dataValues.class_name,
              day: unit.dataValues.day,
              start_time: unit.dataValues.start_time,
              current_size: unit.dataValues.current_size,
              max_size: unit.dataValues.max_size,
              trainer_name:
                activeTrainer[0].dataValues.first_name,
              userName: userName,
              classJoined: classesJoined,
            };

            classBundle.push(reqClass);
          });
          console.log(classBundle);
          res.json(classBundle);
        });
      });
    });
  });

  // POST "api/login" authenticates the member login credentials in the database, and responds with the member id
  app.post("/api/login", (req, res) => {
    console.log(req.body);
    // finds if there exists a member with the logged in username and password
    db.Member.findOne({
      where: {
        email: req.body.username,
        password: md5(req.body.password),
      },
    })
      .then(function (dbMember) {
        const member_id = dbMember.id;
        // updates the is_logged_in column in member table to true to track the logged in user
        db.Member.update(
          { is_logged_in: true },
          {
            where: {
              id: member_id,
            },
          }
        )
          .then(function () {
            // sends the logged in member's id as response
            res.json({
              id: member_id,
              badHombre: dbMember.first_name,
            });
          })
          .catch((err) => {
            res
              .status(401)
              .send(
                "Sorry! There was some problem. Please try again."
              );
          });
      })
      .catch((err) => {
        // user-friendly message to user in case of error
        res
          .status(401)
          .send(
            "The email and/or password is incorrect. Please try again."
          );
      });
  });

  // Query to insert the new employee registration record in the employee table in the database
  app.post("/api/addEmployee", (req, res) => {
    db.Employee.create({
      userName: req.body.userName,
      password: md5(req.body.password),
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      gender: req.body.gender,
      email: req.body.email,
      phone: req.body.phone,
      role: req.body.role,
      manager_id: req.body.manager_id,
    }).then(function (result) {
      res.send("Success!");
    });
  });

  // POST API and query to insert the new member registration record in the member table in the database
  app.post("/api/register", (req, res) => {
    db.Member.create({
      email: req.body.userName,
      // md5 encrypts the password
      password: md5(req.body.password),
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      date_of_birth: req.body.date_of_birth
        ? req.body.date_of_birth
        : null,
      gender: req.body.gender,
      phone: req.body.phone
        ? parseInt(req.body.phone)
        : null,
      is_logged_in: true,
    })
      .then(function (dbMember) {
        // sends the member id as response
        res.json({ id: dbMember.id });
      })
      .catch((err) => {
        let message = err.original.sqlMessage;
        // if email already exists in database, send a user-friendly message as response
        if (err.original.errno === 1062) {
          message =
            "This email is already registered with us.";
        }
        // any other error, send it as a response to be handled at front-end
        res.json({ error: message });
      });
  });


  // GET API route for logging out the member
  app.get("/api/member/:id", (req, res) => {

    const member_id = req.params.id;

    // updates the is_logged_in column in db to false when member logs out
    db.Member.update(
      {
        is_logged_in: false,
      },
      {
        where: {
          id: member_id,
        },
      }
    )
      .then(function () {
        // send a logged out message to the user
        res.json({
          message: "You have been successfully logged out.",
        });
      })
      .catch((err) => {
        res.json({
          message: "Sorry! We could not log you out. Please try again.",
        });
      });
  });

  // Query to insert the member into chosen class
  app.post("/api/addToClass", (req, res) => {
    const memeberId = req.params.member_id;
    console.log(req.params);
    db.Class.update(
      { roster: newRoster },
      {
        where: {
          id: req.params.class_id,
        },
      }
    )
      .then(function (result) {
        console.log(result);
        res.json({
          message:
            "You have been successfully added to the class!",
        });
      })
      .catch((err) => {
<<<<<<< HEAD
        res.json({ error: "Sorry! Some problem occured. Please try again." });
=======
        //console.log(err);
        res.json({
          error:
            "Sorry! Some problem occured. Please try again.",
        });
>>>>>>> features/apis
      });
  });

  // API POST route for removing a member/client from a class
  app.post("/api/removeFromClass", (req, res) => {
    console.log(req.body);
    db.Member.destroy({})
      .then(function (result) {
        console.log(result);
        res.json({
          message:
            "You have successfully unenrolled from the class!",
        });
      })
      .catch((err) => {
<<<<<<< HEAD
        res.json({ error: "Sorry! Some problem occured. Please try again." });
=======
        //console.log(err);
        res.json({
          error:
            "Sorry! Some problem occured. Please try again.",
        });
>>>>>>> features/apis
      });
  });

  // POST API that allows a manager to add a trainer to the employee table in the database
  app.post("/api/manager/addTrainer", (req, res) => {
    db.Employee.create({
      email: req.body.userName,
      password: md5(req.body.password),
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      gender: req.body.gender,
      phone: req.body.phone ? parseInt(req.body.phone) : null,
      role: "trainer",
    }).then(function(dbTrainer) {
        // sends successful message as response
        res.json({ message: "The trainer has been successfully added!" });
      })
      .catch((err) => {
        // if there was an error in adding the trainer, sends a user-friendly error message to user
        res.json({ error: "Sorry! Some problem occured. Please try again." });
      });
  });

  // API GET route for deleting a trainer
  app.get("/api/manager/deleteTrainer/:id", (req, res) => {
    db.Employee.destroy({
      where: {
        id: trainer_id
      },
    })
    .then(function(result) {
        console.log(result);
        res.json({
          message: "The trainer has been successfully deleted from the system!",
        });
    })
    .catch((err) => {
      res.json({ error: "Sorry! Some problem occured. Please try again." });
    });
  });
};
