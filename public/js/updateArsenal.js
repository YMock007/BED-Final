document.addEventListener("DOMContentLoaded", function () {
    const updateArsenalForm = document.getElementById("updateArsenalForm");
    const warningCard = document.getElementById("warningCard");
    const warningText = document.getElementById("warningText");
    const url = new URL(document.URL);
    const urlParams = url.searchParams;
    const arsenalId = urlParams.get("arsenal_id");


    const callbackForArsenalTitle = (responseStatus, responseData) => {
        const arsenalTitle = document.getElementById("arsenal-title"); // Corrected id
        console.log("responseStatus:", responseStatus);
        console.log("responseData:", responseData);
        let arsenalName = responseData.equipment_name; // Assign the value to the outer variable
        arsenalTitle.innerHTML = `Arsenal ${arsenalId}: ${arsenalName}`;
    };

    fetchMethod(currentUrl + `/api/arsenals/${arsenalId}`, callbackForArsenalTitle);

    updateArsenalForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const equipment_name = document.getElementById("equipment_name").value;
        const profession = document.getElementById("profession").value;
        const hp = document.getElementById("hp").value;
        const atk = document.getElementById("atk").value;
        const def = document.getElementById("def").value;
        const pointsWorth = parseInt(document.getElementById("pointsWorth").value);
        console.log(profession)
        console.log(equipment_name)
        // Perform JWT token verification
        const token = localStorage.getItem("token");
        fetchMethod(currentUrl + "/api/jwt/verify", (verifyStatus) => {
            if (verifyStatus === 200) {
                // Token is valid, proceed with the update
                if (pointsWorth > 0 && pointsWorth <= 150) {
                    // Positive points proceed
                    console.log("Update successful");
                    console.log("Arsenal_id:", arsenalId);
                    console.log("Equipment_name:", equipment_name);
                    console.log("profession:", profession);
                    console.log("Health Points:", hp);
                    console.log("Attack:", atk);
                    console.log("Defense:", def);
                    console.log("Points:", pointsWorth);
                    warningCard.classList.add("d-none");

                    const data = {
                        arsenalId: arsenalId,
                        equipment_name: equipment_name,
                        profession: profession,
                        hp: hp,
                        atk: atk,
                        def: def,
                        points_worth: pointsWorth
                    };

                    const callback = (responseStatus, responseData) => {
                        console.log("responseStatus:", responseStatus);
                        console.log("responseData:", responseData);
                        if (responseStatus === 200) {
                            // Check if update was successful
                            console.log("Arsenal updated successfully!");
                            warningCard.classList.remove("d-none")
                            warningText.innerText = "Arsenal Updated Successfully";
                            
                            // Redirect to index.html
                            setTimeout(() => {
                                window.location.href = "arsenalAndLibrary.html";
                            }, 2000); // Redirect after 2 seconds (adjust as needed)
                        } else {
                            warningCard.classList.remove("d-none");
                            warningText.innerText = "Error.";
                        }
                    };
                    
                    // Perform Arsenal update request
                    fetchMethod(currentUrl + `/api/arsenals/${arsenalId}`, callback, "PUT", data);
                    // Reset the form fields
                    updateArsenalForm.reset();
                } else {
                    // Points are not positive, handle error
                    warningCard.classList.remove("d-none");
                    warningText.innerText = "Points must be greater than 0 and less than 150.";
                }
            } else {
                // Token verification failed, handle error
                warningCard.classList.remove("d-none");
                warningText.innerText = "Invalid Token.";
            }
        }, "GET", null, token);
    });
});
