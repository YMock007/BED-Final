document.addEventListener("DOMContentLoaded", function () {
    const updateCharacterForm = document.getElementById("updateCharacterForm");
    const warningCard = document.getElementById("warningCard");
    const warningText = document.getElementById("warningText");
    const url = new URL(document.URL);
    const urlParams = url.searchParams;
    const character_id = urlParams.get("character_id");
    const characterTitle = document.getElementById("character-title"); // Corrected id

    let characterName; // Define characterName outside the functions

    const callbackForCharacterName = (responseStatus, responseData) => {
        console.log("responseStatus:", responseStatus);
        console.log("responseData:", responseData);
        characterName = responseData.character_name; // Assign the value to the outer variable
        characterTitle.innerHTML = `Character ${character_id}: Current Name = ${characterName}`;
    };

    fetchMethod(currentUrl + `/api/characters/${character_id}`, callbackForCharacterName);

    updateCharacterForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("name").value;

        // Perform JWT token verification
        const token = localStorage.getItem("token");
        fetchMethod(currentUrl + "/api/jwt/verify", (verifyStatus) => {
            if (verifyStatus === 200) {
                // Token is valid, proceed with the update
                // Positive points proceed
                console.log("Update successful");
                console.log("Character_id:", character_id);
                console.log("Name:", name);
                warningCard.classList.add("d-none");

                const data = {
                    character_id: character_id,
                    character_name: name
                };

                const callback = (responseStatus, responseData) => {
                    console.log("responseStatus:", responseStatus);
                    console.log("responseData:", responseData);
                    if (responseStatus === 201) {
                        // Check if update was successful
                        console.log("Task updated successfully!");
                        warningCard.classList.remove("d-none")
                        warningText.innerText = "Character Updated Successfully";
                        
                        // Redirect to index.html
                        setTimeout(() => {
                            window.location.href = "character.html";
                        }, 2000); // Redirect after 2 seconds (adjust as needed)
                    } else {
                        warningCard.classList.remove("d-none");
                        warningText.innerText = "Error.";
                    }
                };
                
                // Perform task update request
                fetchMethod(currentUrl + `/api/characters/${character_id}`, callback, "PUT", data);
                // Reset the form fields
                updateCharacterForm.reset();
            } else {
                // Token verification failed, handle error
                warningCard.classList.remove("d-none");
                warningText.innerText = "Invalid Token.";
            }
        }, "GET", null, token);
    });
});
