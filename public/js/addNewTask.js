document.addEventListener("DOMContentLoaded", function () {
    const addNewTaskForm = document.getElementById("addNewTaskForm");
    const warningCard = document.getElementById("warningCard");
    const warningText = document.getElementById("warningText");

    addNewTaskForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const title = document.getElementById("title").value;
        const description = document.getElementById("description").value;
        const points = document.getElementById("points").value;

        // Perform JWT token verification
        const token = localStorage.getItem("token");
        fetchMethod(currentUrl + "/api/jwt/verify", (verifyStatus) => {
            if (verifyStatus === 200) {
                // Token is valid, proceed with the update
                if (points > 0 && points <= 100) {
                    // Positive points proceed
                    console.log("Task added successfully");
                    console.log("Title:", title);
                    console.log("Description:", description);
                    console.log("Points:", points);
                    warningCard.classList.add("d-none");

                    const data = {
                        title: title,
                        description: description,
                        points: points
                    };

                    const callback = (responseStatus, responseData) => {
                        console.log("responseStatus:", responseStatus);
                        console.log("responseData:", responseData);
                        if (responseStatus === 201) {
                            // Check if update was successful
                            console.log("Task added successfully!");
                            warningCard.classList.remove("d-none")
                            warningText.innerText = "Task added successfully";
                            
                            // Redirect to index.html
                            setTimeout(() => {
                                window.location.href = "index.html";
                            }, 2000); // Redirect after 2 seconds (adjust as needed)
                        } else {
                            warningCard.classList.remove("d-none");
                            warningText.innerText = "Error.";
                        }
                    };
                    
                    // Perform task add request
                    fetchMethod(currentUrl + `/api/tasks/`, callback, "POST", data);
                    // Reset the form fields
                    addNewTaskForm.reset();
                } else {
                    // Points are not positive, handle error
                    warningCard.classList.remove("d-none");
                    warningText.innerText = "Points must be greater than 0 and less than 100.";
                }
            } else {
                // Token verification failed, handle error
                warningCard.classList.remove("d-none");
                warningText.innerText = "Invalid Token.";
            }
        }, "GET", null, token);
    });
});
