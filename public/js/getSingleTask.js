document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    const url = new URL(document.URL);
    const urlParams = url.searchParams;
    const taskId = urlParams.get("task_id");
    let taskName;

    const callbackForTaskTitle = (responseStatus, responseData) => {
        console.log("responseStatus:", responseStatus);
        console.log("responseData:", responseData);
        taskName = responseData.title;
    };

    fetchMethod(currentUrl + `/api/tasks/${taskId}`, callbackForTaskTitle);

    fetchMethod(currentUrl + "/api/jwt/verify", (verifyStatus, verifyData) => {
        const callbackForTaskList = (responseStatus, responseData) => {
            console.log("responseStatus:", responseStatus);
            console.log("responseData:", responseData);

            const taskInfo = document.getElementById("taskInfo");
            const warningText = document.createElement("div");
            warningText.className = "alert";
            taskInfo.appendChild(warningText);

            if (responseStatus === 404) {
                warningText.classList.add("alert-danger");
                warningText.innerHTML = `${responseData.message}`;
            } else {
                const taskTitle = document.getElementById("task-title");
                taskTitle.innerHTML = `Task ${taskId}: ${taskName}`;
                taskInfo.innerHTML = '';

                responseData.forEach(task => {
                    const taskCard = document.createElement("div");
                    taskCard.className = "card mb-3";
                    taskCard.innerHTML = `
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title progress-div">Task Progress ID: ${task.progress_id}</h5>
                                
                                <div class="table-responsive">
                                    <table class="table table-bordered table-fixed">
                                        <colgroup>
                                            <col style="width: 20%;" />
                                            <col style="width: 80%;" />
                                        </colgroup>
                                        <tbody>
                                            <tr>
                                                <th scope="row">User Name</th>
                                                <td>${task.username}</td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Completion Date</th>
                                                <td>${task.completion_date}</td>
                                            </tr>
                                            <tr>
                                                <th scope="row">Notes</th>
                                                <td>${task.notes}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                ${verifyStatus === 200 && ( verifyData.role === 'admin' || verifyData.user_id === task.user_id) ?`
                                    <button class="btn btn-danger btn-sm delete-button" data-progress-id="${task.progress_id}"><i class="fas fa-trash-alt"></i></button>
                                ` : ``}
                            </div>
                        </div>
                    `;
                    taskInfo.appendChild(taskCard);
                    if (verifyStatus === 200 && verifyData.user_id === task.user_id) {
                        const deleteButton = taskCard.querySelector(".delete-button");
                        deleteButton.addEventListener("click", () => {
                            // Show the custom popup
                            const confirmationPopup = document.getElementById("confirmationPopup");
                            confirmationPopup.style.display = "block";
                
                            // Add event listener for confirm delete button
                            const confirmDeleteButton = document.getElementById("confirmDelete");
                            confirmDeleteButton.addEventListener("click", () => {
                                // Fetch API to delete progress
                                const deleteProgressCallback = (deleteStatus, deleteData) => {
                                    if (deleteStatus === 200) {
                                        // Eliminate the need for alert and simply reload the page
                                        console.log("Task deleted successfully.")
                                        confirmationPopup.style.display = "none";
                                        setTimeout(() => location.reload(), 2000);
                                    } else {
                                        console.error("Error deleting task. Unexpected response:", deleteData);
                                        alert("Error deleting task. Check console for details.");
                                    }
                                };                                
                
                                // Fetch the delete API
                                fetchMethod(currentUrl + `/api/task_progresses/${task.progress_id}/${verifyData.user_id}`, deleteProgressCallback, "DELETE");
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
            }    
                // Now that we have added the task cards, create and append the form
                if (verifyStatus === 200) {
                    const form = document.createElement("form");
                    const warningCard = document.createElement("div"); // New warning card element
                    const warningText = document.createElement("p"); // New warning text element

                    form.addEventListener("submit", (event) => {
                        event.preventDefault();
                         // Retrieve input values
                        const completionDateInput = event.target.elements["completionDate"];
                        const notes = event.target.elements["notes"].value;

                        // Check if the completion date is beyond the current time
                        const inputDate = new Date(completionDateInput.value);
                        const currentDate = new Date();

                        if (inputDate > currentDate) {
                            // Display a warning message
                            warningCard.classList.remove("d-none");
                            warningCard.classList.add("alert", "alert-danger");
                            warningText.innerHTML = "Please enter a completion date that is not beyond the current time.";
                            return; // Stop further execution
                        }

                        // Proceed with form submission if the completion date is valid
                        const formattedCompletionDate = inputDate.toISOString().slice(0, 19).replace("T", " ");

                        const postData = {
                            user_id: verifyData.user_id,
                            task_id: taskId,
                            notes: notes,
                            completion_date: formattedCompletionDate
                        };
                        const callbackForPostData = (postStatus, postdata) => {
                                if (postStatus === 200) {
                                    // Handle success
                                    warningCard.classList.remove("d-none"); // Show the warning card
                                    warningCard.classList.add("alert", "alert-success");
                                    warningText.innerHTML = "Task progress added successfully";
                            
                                    // Reload the page after a short delay
                                    setTimeout(() => {
                                        window.location.reload();
                                    }, 2000); // Adjust the delay as needed
                                } else {
                                    // Handle error
                                    warningCard.classList.remove("d-none"); // Show the warning card
                                    warningCard.classList.add("alert", "alert-danger");
                                    warningText.innerHTML = "Progress with same username and notes already exist or date time error.";
                                }
                            };
                            fetchMethod(currentUrl + "/api/task_progresses/", callbackForPostData, "POST", postData);
                    });

                    form.innerHTML = `
                        <div class="form-container">
                            <div class="row justify-content-center mt-2">
                                <div class="col-md-6 px-5">
                                    <h3 class="mb-2 container">Add New Task Progress for Task: ${taskName}</h3>
                                    <div class="form-group pb-3">
                                        <label for="completionDate">Completion Date:</label>
                                        <input type="date" class="form-control" id="completionDate" required>
                                    </div>
                                    <div class="form-group pb-3">
                                        <label for="notes">Notes:</label>
                                        <textarea class="form-control" id="notes" rows="3" required></textarea>
                                    </div>
                                    <button type="submit" class="btn btn-primary btn-block mt-2">Submit</button>
                                </div>
                            </div>
                        </div>
                    `;

                    // Append the warning card and text to the form
                    warningCard.id = "warningCard";
                    warningCard.className = "card border-danger mt-3 mb-3 d-none";
                    warningCard.appendChild(warningText);
                    form.appendChild(warningCard);

                    taskInfo.appendChild(form);
                    form.reset();
                }
            
        };

        fetchMethod(currentUrl + `/api/task_progresses/task_id/${taskId}`, callbackForTaskList);
    }, "GET", null, token);
});
