//hire trainer variables
const email = $("#inputEmail");
const password = $("#inputPassword");
const firstName = $("#firstName");
const lastName = $("#lastName");
const birthday = $("#inputBirthday");
const gender = $("#inputGender");
const phone = $("#inputPhone");
const role = $("#inputRole");
//trainer list variables
const trainerList = $(".trainerNameList");

loadTrainers();

//Get trainer list on page load.
function loadTrainers() {
  $.ajax({
    url: `/api/manager/trainers`,
    method: "GET",
  }).then(function (trainerNames) {
    console.log(trainerNames);
    for (let i = 0; i < trainerNames.length; i++) {
      const firstName = trainerNames[i].first_name;
      const lastName = trainerNames[i].last_name;
      const trainerId = trainerNames[i].id;
      $(trainerList).append(`
        <li class="me-5 d-flex float-left text-white" >${firstName} ${lastName} <button type="button" class="btn darkBtn d-flex float-right ms-5 mb-3 viewBtn" data-id="${trainerId}">View</button></li>`);
    }

    //View button sends individual trainer's information to the right hand box.
    $("body").on("click", ".viewBtn", function () {
      const $trainerFirstName = $(".trainerFirstName");
      const $trainerLastName = $(".trainerLastName");
      const $trainerGender = $(".trainerGender");
      const $trainerEmail = $(".trainerEmail");
      const $trainerPhone = $(".trainerPhone");
      const btnId = event.target.getAttribute("data-id");
      $trainerFirstName.empty();
      $trainerLastName.empty();
      $trainerGender.empty();
      $trainerEmail.empty();
      $trainerPhone.empty();
      for (let i = 0; i < trainerNames.length; i++) {
        if (parseInt(btnId) === trainerNames[i].id) {
          $trainerFirstName.append("First Name: " + trainerNames[i].first_name);
          $trainerLastName.append("Last Name: " + trainerNames[i].last_name);
          $trainerGender.append("Gender: " + trainerNames[i].gender);
          $trainerEmail.append("Email Address: " + trainerNames[i].email);
          $trainerPhone.append("Phone Number: " + trainerNames[i].phone);
          $(".terminateBtn").attr("data-id", trainerNames[i].id);
        }
      }
    });
  });
}

//Terminate Trainer button Deletes trainer from database.
$("body").on("click", ".terminateBtn", function () {
  const termBtnId = event.target.getAttribute("data-id");
  console.log(termBtnId);
  $.ajax({
    url: `/api/manager/deleteTrainer/${termBtnId}`,
    // data: {
    //   id: termBtnId,
    // },
    method: "DELETE", //Should this be a get request or a delete request?

    error: function (req, status, err) {
      if (err) alertModal(err);
    },
  }).then(function (response) {
    console.log(response);
    //If sign-up goes through, refresh manager page
    window.location.href = "/manager";
  });
});

//submit button listener for hire new trainer
$("body").on("click", "#hireBtn", function () {
  $.ajax({
    url: "/api/manager/addTrainer/",
    data: {
      email: email.val().trim(),
      password: password.val().trim(),
      first_name: firstName.val().trim(),
      last_name: lastName.val().trim(),
      gender: gender.val().trim(),
      phone: phone.val().trim(),
      role: role.val().trim(),
    },
    method: "POST",

    error: function (req, status, err) {
      if (err) alertModal(err);
    },
  }).then(function (response) {
    console.log(response);
    //If sign-up goes through, refresh manager page
    window.location.href = "/manager";
  });
});

//function to display Alert Modal on login error
function alertModal(title, body) {
  // Display error message to the user in a modal
  $("#alert-modal-title").html(title);
  $("#alert-modal-body").html(body);
  $("#alert-modal").modal("show");
}

//Close modal on close button click
$(".modalBtn").click(function () {
  $("#alert-modal").modal("hide");
});

//SCHEDULE SECTION

//global variables
const $weekDay = $(".week-day");
const $dateOfYear = $(".date-of-year");
const $weekDayDiv = $(".weekday-placeholder");

//changes timestamp to readable time.
function tConvert(time) {
  // Check correct time format and split into components
  time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [
    time,
  ];

  if (time.length > 1) {
    // If time format correct
    time = time.slice(1); // Remove full string match value
    time[5] = +time[0] < 12 ? "AM" : "PM"; // Set AM/PM
    time[0] = +time[0] % 12 || 12; // Adjust hours
  }
  //my added part to get rid of last two 00's (Ethan W)
  time.splice(1, 3);
  time.splice(2, 0, " ");
  // return adjusted time or original string
  return time.join("");
}

//grabs 7 days of the week, updates day and date for each div.
const displayCurrentDate = () => {
  for (i = 0; i < $weekDay.length; i++) {
    //updates day of the week
    const dayofWeek = dayjs()
      .add([i - 1 + 1], "day")
      .format("dddd");

    //appends day onto page
    $weekDay[i].append(dayofWeek);

    //updates date for each day
    const dayOfYear = dayjs()
      .add([i - 1 + 1], "day")
      .format("MMM D");

    //appends date onto page
    $dateOfYear[i].append(dayOfYear);

    //create a timestamp specifically to send back in ajax in api readable format yyyy-MM-DD
    const timestamp = dayjs()
      .add([i - 1 + 1], "day")
      .format("YYYY MM DD");

    //add ajax as a data-attribute to make it easily grabbable
    $dateOfYear[i].setAttribute("data-timestamp", timestamp);

    //deletes the old class
    $weekDayDiv[i].className = "";

    //adds the current day of the week as the new class name. This is how classes will know which div to append to.
    $weekDayDiv[i].classList.add($weekDay[i].innerHTML);
  }
};
displayCurrentDate();

//grab classes from database, then write a dynamic page.
const populateSchedule = () => {
  $weekDayDiv.empty();
  return $.ajax({
    //grabs user id from local storage(set in login page), then ajax calls for data for classes and that user.
    url: `/api/classes/${localStorage.getItem("userId")}`,
    method: "GET",
  }).then(function (classData) {
    //iterates over each class that comes in from ajax list to populate schedule
    classData.map(function (fitClass) {
      //if statement only creates a delete button if the current trainer is logged in
      const viewRosterBtn = `<button
            type="button"
            onclick="viewRoster()"
            class="btn background-red  align-self-center view-roster-btn"
            data-id="${fitClass.id}"
            data-toggle="modal"
             data-target="#exampleModal"
            data-joinedClassList="true"
            >
              Roster 
            </button>`;

      //convert the ajax timestamp into more readable time to display on page.
      const twelveHourTime = tConvert(fitClass.start_time);

      // template for class with dynamic information
      const classTemplate = `
          <div class="row m-0 pb-3 pt-3 border-to-bottom-thin font-large">
            <div class="col border-teal pb-3 text-center">
              <h4 class="class-title-${fitClass.day} bold text-red">${
        fitClass.class_name
      }</h4>
              <div class="class-time-${fitClass.day}">${twelveHourTime}</div>
              <div class="class-trainer-${fitClass.day}" >${
        fitClass.trainer_name
      }</div>
              <div class="class-spots-left-${fitClass.day}">${
        fitClass.max_size - fitClass.current_size
      } slots </div>
            </div>
            <div class="col border-to-right border-teal d-flex">
            ${viewRosterBtn}
            </div>
          </div>
  `;

      //search the divs for one with a class day that matches the classname, and append to that div.
      function appendtoWeekday() {
        for (i = 0; i < $weekDayDiv.length; i++) {
          if ($weekDayDiv[i].className === fitClass.day) {
            $weekDayDiv.eq(i).append(classTemplate);
          }
        }
      }
      appendtoWeekday();
    });
  });
};

populateSchedule();

//the onclick function that displays everyone who signed for a class and the ability to remove them
function viewRoster() {
  const classId = event.target.getAttribute("data-id");
  const classDate = event.target.parentElement.parentElement.parentElement.parentElement
    .querySelector("p")
    .getAttribute("data-timestamp");

  //get the roster from the database
  $.ajax({
    url: `/api/roster/${classId}`,
    method: "GET",
  }).then(function (classRoster) {
    //Write the names and their associated remove button onto the modal body
    function writeRoster() {
      const $modalBody = $(".modal-body");

      //empty div before adding elements
      $modalBody.empty();

      //for each member, add their name and a remove button linked to them
      for (let i = 0; i < classRoster.length - 1; i++) {
        const memberId = classRoster[classRoster.length - 1][i];
        const memberName = classRoster[i];
        const removeMemberBtn = `<button type="button" onclick= "removeMember()" class="btn red-button float-right ms-5 mb-3 viewBtn" data-id="
        ${memberId}" data-class-id="${classId}" data-class-date="${classDate}" "classId">Remove</button>`;
        
         $modalBody.append(
          `<p class="modal-p" data-member-id="${memberId}">${
            i + 1
          }. ${memberName} ${removeMemberBtn}<p>`
        );
      }
      
      //add the AddMember form to the bottom
      const addMemberFormTemplate= ` <div class="col">
      <label for="inputAddMember" class="form-label">Add Member</label>
      <select id="inputAddMember" class="form-select">
          <option>Monday</option>
          <option>Tuesday</option>
          <option>Wednesday</option>
          <option>Thursday</option>
          <option>Friday</option>
          <option>Saturday</option>
          <option>Sunday</option>
      </select>
      </div>`

      $modalBody.append(addMemberFormTemplate)

    }
    writeRoster();
  });
}

//on remove button click, delete the associated user from the class
function removeMember() {
  const memberId = event.target.getAttribute("data-id");
  const classId = event.target.getAttribute("data-class-id");
  const classDate = event.target.getAttribute("data-class-date");

  //this one was a rough hack. I couldn't use writeRoster again, because its data relied on a btn click.
  //I added the member's id to both the button and the p tag. On Click, a for loop runs and when it matches the p tag to
  //the id, it deletes both. This updates the modal for the user immediately. I KNOW this is not a great way and will try to improve.
  function reWriteModal() {
    //grab all the ptags in the modal
    const $modalP = $(".modal-p");

    for (i = 0; i < $modalP.length; i++) {
      const btnId = event.target.getAttribute("data-id");
      let $pId = $modalP[i].getAttribute("data-member-id");
      if ($pId === btnId) {
        $modalP.eq(i).empty();
      }
    }
  }
  reWriteModal();

  return $.ajax({
    url: "/api/removeFromClass",
    method: "POST",

    data: {
      id: classId,
      date: classDate,
      memberid: memberId,
    },
    success: function () {
      console.log("User removed from Class");
    },
  });
}