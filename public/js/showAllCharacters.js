
const token = localStorage.getItem("token");

const verifyTokenCallback = (verifyStatus, verifyData) => {
    console.log("Token Verification Status:", verifyStatus);
    console.log("Token Verification Data:", verifyData);

    const characterListCallback = async (responseStatus, responseData) => {
        console.log("Response Status:", responseStatus);
        console.log("Response Data:", responseData);

        const users_list = [];
        const characterList = document.getElementById("charactersList");
        characterList.innerHTML = ''; // Clear existing content

        responseData.forEach(async (character) => {
            users_list.push(character.user_id);

            let userPromise;
            if (character.user_id) {
                // Make fetch request to get user data
                userPromise = new Promise((resolve, reject) => {
                    const userCallBack = (userStatus, userData) => {
                        if (userStatus === 200) {
                            resolve(userData.username);
                        } else {
                            reject("No user data");
                        }
                    };
                    fetchMethod(currentUrl + `/api/users/${character.user_id}`, userCallBack);
                });
            } else {
                console.error("User ID is undefined for character:", character);
            }

            try {
                let owner_name;
                try {
                    owner_name = await userPromise;
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    owner_name = "Unknown User"; // Provide a default value
                }

                const displayItem = document.createElement("div");
                displayItem.className =
                    "col-xl-4 col-lg-6 col-md-6 col-sm-12 mb-4 position-relative"; // Added position-relative

                displayItem.innerHTML = `
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Character ID: ${character.character_id}</h5>
                            <p class="card-text">
                                <span>Owner Name:</span> ${owner_name} <br>
                                <span>Character Name:</span> ${character.character_name} <br>
                                <span>Sect:</span> ${character.sect} <br>
                                <span>HP:</span> 
                                <span style="color: crimson; ">${character.hp}</span> <br>
                                <span>ATK:</span> 
                                <span style="color: crimson; ">${character.atk}</span> <br>
                                <span>DEF:</span> 
                                <span style="color: crimson; ">${character.def}</span> <br>
                                <span>Equipment:</span> ${character.equipment} <br>
                                <span>Skill:</span> ${character.skill} <br>
                            </p>
                            ${verifyStatus === 200 && verifyData.user_id !== character.user_id ? `
                            <div class="deuls-button-container">
                            <a href="deuls.html?character_name=${character.character_name}" class="btn btn-primary btn-sm deul-button" data-character-name="${character.character_name}">
                                <i class="fas fa-khanda"></i>  Deul
                            </a>
                            </div>
                            `: ''} 
                            ${verifyStatus === 200 &&  (verifyData.role === 'admin' || verifyData.user_id === character.user_id) ? `
                                <div class="edit-delete-buttons position-absolute top-0 end-0 p-2">
                                    <a href="updateCharacter.html?character_id=${character.character_id}" class="btn btn-secondary btn-sm"><i class="fas fa-edit"></i></a>
                                    <button class="btn btn-danger btn-sm delete-button" data-character-id="${character.character_id}"><i class="fas fa-trash-alt"></i></button>
                                </div>
                            ` : ``}
                        </div>
                    </div>
                `;
                characterList.appendChild(displayItem);
                if (verifyStatus === 200 && verifyData.user_id === character.user_id) {
                    const deleteButton = displayItem.querySelector(".delete-button");
                    deleteButton.addEventListener("click", () => {
                        // Show the custom popup
                        const confirmationPopup = document.getElementById("confirmationPopup");
                        confirmationPopup.style.display = "block";
            
                        // Add event listener for confirm delete button
                        const confirmDeleteButton = document.getElementById("confirmDelete");
                        confirmDeleteButton.addEventListener("click", () => {
                            // Fetch API to delete Character
                            const deleteCharacterCallback = (deleteStatus, deleteData) => {
                                if (deleteStatus === 204) {
                                    // Eliminate the need for alert and simply reload the page
                                    console.log("Character deleted successfully.")
                                    confirmationPopup.style.display = "none";
                                    setTimeout(() => location.reload(), 2000);
                                } else {
                                    console.error("Error deleting Character. Unexpected response:", deleteData);
                                    alert("Error deleting Character. Check console for details.");
                                }
                            };                                
            
                            // Fetch the delete API
                            fetchMethod(currentUrl + `/api/characters/${character.character_id}`, deleteCharacterCallback, "DELETE");
                        });
            
                        // Add event listener for cancel delete button
                        const cancelDeleteButton = document.getElementById("cancelDelete");
                        cancelDeleteButton.addEventListener("click", () => {
                            // Hide the popup without deleting the Character
                            confirmationPopup.style.display = "none";
                        });
                    });
                }
            } catch (error) {
                console.error(error);
            }
        });
        console.log(users_list)
        console.log(verifyData.user_id)
        if( verifyStatus === 200 && users_list.includes(verifyData.user_id) === false ) {
            const userPromise = new Promise((resolve, reject) => {
                const userCallBack = (userStatus, userData) => {
                    if (userStatus === 200) {
                        resolve(userData.username);
                    } else {
                        reject("No user data");
                    }
                };

                fetchMethod(currentUrl + `/api/users/${verifyData.user_id}`, userCallBack);
            });
            let username = await userPromise
            console.log(username)
            const addCharacter = document.getElementById("addCharacter");
            const addCharacterDiv = document.createElement("div");
            addCharacterDiv.className =
              "col-12 mb-4 d-block align-items-center";
            addCharacterDiv.innerHTML = `
            <div class="form-container mb-2">
                <h2>As the user ${username} doesn't have any character, please creates the new one</h2>
                <p>For a millennium, three powerful sects have reigned over this world. As you step into this realm, you must choose your path among them. Select one of the following sects: Saber Sect, Sword Sect, Shield Sect.</p>
                
                <!-- Warning message container -->
                <div id="warningMessage" class="mb-3 text-danger"></div>
                
                <form id="characterForm">
                    <div class="mb-3">
                        <label for="characterName" class="form-label">Character Name:</label>
                        <input type="text" class="form-control" id="characterName" required>
                    </div>
                    <div class="mb-3">
                        <label for="sect" class="form-label">Select Sect:</label>
                        <select class="form-select" id="sect" required>
                            <option value="Saber Sect">Saber Sect (Strong ATK, Weak DEF)</option>
                            <option value="Sword Sect">Sword Sect (Balanced)</option>
                            <option value="Shield Sect">Shield Sect (Strong DEF, Weak ATK)</option>
                        </select>
                    </div>
                    <button type="button" class="btn btn-primary" id="addCharacterButton">Create Character</button>
                </form>
            </div>
              `;
            
            addCharacter.appendChild(addCharacterDiv)

            const addCharacterButton = document.getElementById('addCharacterButton');
            addCharacterButton.addEventListener("click", () => {
                const characterName = document.getElementById("characterName").value;
                const sect = document.getElementById("sect").value;
                const data = {
                    user_id: verifyData.user_id,
                    character_name: characterName,
                    sect: sect
                }
                const addCharacterCallBack = (addCharacterStatus, addCharacterData) => {
                    console.log("Add Character Status:", addCharacterStatus);
                    console.log("Add Character Data:", addCharacterData);
                    const warningMessage = document.getElementById("warningMessage");

                    if (addCharacterStatus === 201) {
                        // Character creation successful
                        warningMessage.textContent = "Character created successfully!";
                        
                        // Refresh the page after 2 seconds
                        setTimeout(() => {
                            location.reload();
                        }, 2000);
                    } else if (addCharacterStatus === 409){
                        warningMessage.textContent = "User not Found"
                    }else {
                        // Display error message if character creation fails
                        warningMessage.textContent = "Character creation failed. Please try again.";
                    }
                }
                fetchMethod(currentUrl + "/api/characters/", addCharacterCallBack, "POST", data)
            })
        }
    };
    fetchMethod(currentUrl + "/api/characters/", characterListCallback);
}

fetchMethod(currentUrl + "/api/jwt/verify", verifyTokenCallback, "GET", null, token);