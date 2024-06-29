const token = localStorage.getItem("token");

const verifyTokenCallback = (verifyStatus, verifyData) => {
  console.log("Token Verification Status:", verifyStatus);
  console.log("Token Verification Data:", verifyData);

  // Step 2: Fetch Task List
  const taskListCallback = (responseStatus, responseData) => {
    console.log("Response Status:", responseStatus);
    console.log("Response Data:", responseData);

    const taskList = document.getElementById("tasksList");
    taskList.innerHTML = ''; // Clear existing content

    responseData.forEach((task) => {
      const displayItem = document.createElement("div");
      displayItem.className =
        "col-xl-4 col-lg-6 col-md-6 col-sm-12 mb-4 position-relative"; // Added position-relative

      displayItem.innerHTML = `
          <div class="card">
              <div class="card-body">
                  <h5 class="card-title">ID: ${task.task_id}</h5>
                  <p class="card-text">
                      <span>Title:</span> ${task.title} <br>
                      <span>Description:</span> ${task.description} <br>
                      <span>Points:</span> 
                      <span style="color: crimson; ">${task.points}</span> <br>
                  </p>
                  ${verifyStatus === 200 && verifyData.role == 'admin' ? `
                  <a href="singleTaskInfo.html?task_id=${task.task_id}" class="btn btn-primary">View & Add Task Progresses</a>
                  <div class="edit-delete-buttons position-absolute top-0 end-0 p-2">
                    <a href="updateTask.html?task_id=${task.task_id}" class="btn btn-secondary btn-sm"><i class="fas fa-edit"></i></a>
                    <button class="btn btn-danger btn-sm delete-button" data-task-id="${task.task_id}"><i class="fas fa-trash-alt"></i></button>
                  </div>
                  ` : `<a href="singleTaskInfo.html?task_id=${task.task_id}" class="btn btn-primary">View Task Progresses</a>`}
              </div>
          </div>
      `;

      taskList.appendChild(displayItem);
      if (verifyStatus === 200 && verifyData.role == 'admin') {
        const deleteButton = displayItem.querySelector(".delete-button");
        deleteButton.addEventListener("click", () => {
            // Show the custom popup
            const confirmationPopup = document.getElementById("confirmationPopup");
            confirmationPopup.style.display = "block";

            // Add event listener for confirm delete button
            const confirmDeleteButton = document.getElementById("confirmDelete");
            confirmDeleteButton.addEventListener("click", () => {
                // Fetch API to delete task
                const deleteTaskCallback = (deleteStatus, deleteData) => {
                    if (deleteStatus === 204) {
                        // Eliminate the need for alert and simply reload the page
                        console.log("Task deleted successfully.")
                        confirmationPopup.style.display = "none";
                        setTimeout(() => location.reload(), 2000);
                    } else {
                        alert("Error deleting task");
                    }
                };

                // Fetch the delete API
                fetchMethod(currentUrl + `/api/tasks/${task.task_id}`, deleteTaskCallback, "DELETE");
            });

            // Add event listener for cancel delete button
            const cancelDeleteButton = document.getElementById("cancelDelete");
            cancelDeleteButton.addEventListener("click", () => {
                // Hide the popup without deleting the task
                confirmationPopup.style.display = "none";
            });
        });
      }
    });

    if (verifyStatus === 200 && verifyData.role == 'admin') {
      // Add another div with a plus button only if the token is successfully verified
      const addTaskDiv = document.createElement("div");
      addTaskDiv.className =
        "col-xl-4 col-lg-6 col-md-6 col-sm-12 mb-4 d-block align-items-center";
      addTaskDiv.innerHTML = `
            <div class="card">
                <div class="card-body text-center">
                    <h5 class="card-title font-weight-bold">Add New Task</h5>
                    <p class="card-text">
                        <span>Click Here to Add new Tasks!</span>
                    </p>
                    <button class="btn btn-success" id="addTaskButton">+</button>
                </div>
            </div>
        `;

      taskList.appendChild(addTaskDiv);
      const addTaskButton = document.getElementById("addTaskButton");
      addTaskButton.addEventListener("click", () => {
        // Redirect to add new task page
        window.location.href = "addNewTask.html"; 
      });
    }
  };

  // Step 3: Fetch Task Data
  fetchMethod(currentUrl + "/api/tasks", taskListCallback);

  // Step 4: Handle unauthorized access or redirect logic here
  if (verifyStatus === 401) {
    // Handle unauthorized access, maybe redirect to a login page
    console.log("Login to add the new task."); // Display a pop-up window
    // Redirect logic or show an error message to the user
  }
};

// Step 5: Send token for verification
fetchMethod(currentUrl + "/api/jwt/verify", verifyTokenCallback, "GET", null, token);

// JavaScript to refresh the page every 10 seconds 
setTimeout(function() {         
  location.reload();    
}, 180000); // 180000 milliseconds = 3min
