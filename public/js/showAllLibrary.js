function handleSortDropdownChange() {
    let sortType = sessionStorage.getItem("selectedSort") || "";
    const sortDropdown = document.getElementById("sortDropdown");

    sortDropdown.addEventListener("change", async () => {
        const selectedOption = sortDropdown.value;

        if (selectedOption === "default" || selectedOption === "") {
            sortType = "";
        } else if (selectedOption === "hp" || selectedOption === "atk" || selectedOption === "def" || selectedOption === "points") {
            sortType = selectedOption;
        } else if (selectedOption === "profession/Saber|Sect" || selectedOption === "profession/Sword|Sect" || selectedOption === "profession/Shield|Sect") {
            sortType = selectedOption;
        } else {
            console.error("Invalid option selected.");
            alert("Invalid option selected. Please try again.");
        }

        sessionStorage.setItem("selectedSort", sortType);
        location.reload();
    });

    for (let i = 0; i < sortDropdown.options.length; i++) {
        if (sortDropdown.options[i].value === sortType) {
            sortDropdown.options[i].selected = true;
            break;
        }
    }
    console.log(sortType)
    return sortType;
}

document.addEventListener("DOMContentLoaded", function () {
    sortType = handleSortDropdownChange();

    const token = localStorage.getItem("token");
    const verifyTokenCallback = (verifyStatus, verifyData) => {
        console.log("Token Verification Status:", verifyStatus);
        console.log("Token Verification Data:", verifyData);

        const libraryCallBack = async (libraryStatus, libraryData) => {
            console.log("Library Status:", libraryStatus);
            console.log("Library Data:", libraryData);

            const librariesList = document.getElementById("librariesList");
            librariesList.innerHTML = "";

            const warningText = document.createElement("div");
            warningText.className = "alert";
            librariesList.appendChild(warningText);

            if (libraryStatus === 500) {
                warningText.style.display = 'block';
                warningText.classList.add("alert-danger");
                warningText.innerHTML = `No Skills found.`;
                setTimeout(()=> {
                    warningText.style.display = 'none'
                }, 3000)
            }

            const characterByUserIdPromise = new Promise((resolve, reject) => {
                const characterByUserIdCallBack = (characterStatus, characterData) => {
                    if (characterStatus === 200) {
                        resolve(characterData.character_id);
                    } else {
                        warningText.classList.add("alert-info");
                        warningText.style.display = 'block';
                        warningText.innerHTML = `To buy a skill, the user must make a character first, Thanks.`;
                        setTimeout(()=> {
                            warningText.style.display = 'none'
                        }, 3000)
                        reject("No character data. Please make a character first, Thanks.");
                    }
                };
                fetchMethod(currentUrl + `/api/characters/user/${verifyData.user_id}`, characterByUserIdCallBack);
            });

            let isCharacter = true;
            let character_id;
            try {
                character_id = await characterByUserIdPromise;
            } catch (error) {
                isCharacter = false;
            }

            libraryData.forEach(async (skill) => {
                try {
                    const displayItem = document.createElement("div");
                    displayItem.className =
                        "col-xl-4 col-lg-4 col-md-6 col-sm-12 mb-4 position-relative";

                    displayItem.innerHTML = `
                        <div class="card thread-card">
                            <div class="card-body">
                                <h5 class="card-title">Library ID: ${skill.library_id}</h5>
                                <p class="card-text">
                                    <span>Skill Name:</span> ${skill.skill_name} <br>
                                    <span>Profession:</span>${skill.profession} <br>
                                    <span>Health Point(HP):</span> 
                                    <span style="color: crimson; ">${skill.hp}</span> <br>
                                    <span>Attack(ATK):</span> 
                                    <span style="color: crimson; ">${skill.atk}</span> <br>
                                    <span>Defense(DEF):</span> 
                                    <span style="color: crimson; ">${skill.def}</span> <br>
                                    <span style="color: green; ">Point:</span>
                                    <span style="color: green; ">${skill.points_worth}</span> <br>
                                </p>
                                ${verifyStatus === 200 && isCharacter === true ? `
                                    <button class="btn btn-success btn-sm buy-button" data-library-id="${skill.library_id}">
                                    <i class="fa-solid fa-cart-shopping"></i>
                                    </button>
                                ` : ''}
                                ${verifyStatus === 200 && verifyData.role == 'admin'? `
                                    <div class="edit-delete-buttons position-absolute top-0 end-0 p-2">
                                        <a href="updateLibrary.html?library_id=${skill.library_id}" class="btn btn-secondary btn-sm"><i class="fas fa-edit"></i></a>
                                        <button class="btn btn-danger btn-sm delete-button" data-library-id="${skill.library_id}">
                                            <i class="fas fa-trash-alt"></i>
                                        </button>
                                    </div>
                                ` : ``}
                            </div>
                        </div>
                    `;
                    librariesList.appendChild(displayItem);

                    if (verifyStatus === 200 && isCharacter === true) {
                        const buyButton = displayItem.querySelector(".buy-button");
                        buyButton.addEventListener("click", async () => {
                            console.log(character_id);

                            // Show the custom popup
                            const confirmationPopup = document.getElementById("confirmationPopup");
                            confirmationPopup.style.display = "block";

                            const popupMessage = document.getElementById('popup-message');
                            popupMessage.innerHTML = 'Do you want to buy the Skill?';

                            // Add event listener for confirm buy button
                            const confirmDeleteButton = document.getElementById("confirmDelete");
                            confirmDeleteButton.addEventListener("click", () => {
                                const data = {
                                    character_id: character_id,
                                    library_id: skill.library_id
                                };

                                // Fetch API to buy Skill
                                const buySkillCallback = (buyStatus, buyData) => {
                                    if (buyStatus === 200) {
                                        // Eliminate the need for alert and simply display a success message
                                        console.log("Skill bought successfully.");
                                    
                                        // Styling for the success message
                                        warningText.classList.add("alert-primary");
                                        warningText.style.display = 'block';
                                        warningText.style.position = 'fixed';
                                        warningText.style.top = '10%';
                                        warningText.style.left = '50%';
                                        warningText.style.transform = 'translateX(-50%)';
                                        warningText.style.width = '80%';
                                        warningText.style.maxWidth = '400px'; // Set a maximum width for smaller screens
                                        warningText.style.padding = '10px';
                                        warningText.style.textAlign = 'center';
                                        warningText.style.borderRadius = '5px';
                                        warningText.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.2)';
                                        warningText.style.zIndex = '99999';
                                    
                                        // Display success message
                                        warningText.innerHTML = "Skill bought successfully. " + buyData.message;
                                    
                                        // Hide confirmation popup
                                        confirmationPopup.style.display = "none";
                                    
                                        // Reload the page after 3 seconds
                                        setTimeout(()=> {
                                            warningText.style.display = 'none'
                                        }, 3000)
                                    }
                                    else {
                                        // Error buying skill
                                        console.error("Error buying skill. Unexpected response:", buyData);
                                    
                                        // Styling for the error message
                                        warningText.classList.add("alert-danger");
                                        warningText.style.display = 'block';
                                        warningText.style.position = 'fixed';
                                        warningText.style.top = '10%';
                                        warningText.style.left = '50%';
                                        warningText.style.transform = 'translateX(-50%)';
                                        warningText.style.width = '80%';
                                        warningText.style.maxWidth = '400px'; // Set a maximum width for smaller screens
                                        warningText.style.padding = '10px';
                                        warningText.style.textAlign = 'center';
                                        warningText.style.borderRadius = '5px';
                                        warningText.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.2)';
                                        warningText.style.zIndex = '99999';
                                    
                                        // Display error message
                                        warningText.innerHTML = buyData.message + " Do more Tasks, Complete Quests, Win Duels, or Trade to get more points.";
                                    
                                        // Hide confirmation popup
                                        confirmationPopup.style.display = "none";

                                        // Reload the page after 3 seconds
                                        setTimeout(()=> {
                                            warningText.style.display = 'none'
                                        }, 3000)
                                    }
                                };

                                // Fetch the buy API
                                fetchMethod(currentUrl + `/api/libraries/buy/`, buySkillCallback, "POST", data);
                            });

                            // Add event listener for cancel delete button
                            const cancelDeleteButton = document.getElementById("cancelDelete");
                            cancelDeleteButton.addEventListener("click", () => {
                                // Hide the popup without deleting the task
                                confirmationPopup.style.display = "none";
                            });
                        });
                    }

                    if (verifyStatus === 200 && verifyData.role == 'admin') {
                        const deleteButton = displayItem.querySelector(".delete-button");
                        deleteButton.addEventListener("click", () => {
                            // Show the custom popup
                            const confirmationPopup = document.getElementById("confirmationPopup");
                            confirmationPopup.style.display = "block";

                            const popupMessage = document.getElementById('popup-message');
                            popupMessage.innerHTML = 'Do you want to delete the Skill?';

                            // Add event listener for confirm delete button
                            const confirmDeleteButton = document.getElementById("confirmDelete");
                            confirmDeleteButton.addEventListener("click", () => {
                                // Fetch API to delete Skill
                                const deleteSkillCallback = (deleteStatus, deleteData) => {
                                    if (deleteStatus === 204) {
                                        // Eliminate the need for alert and simply reload the page
                                        console.log("Skill deleted successfully.")
                                        confirmationPopup.style.display = "none";
                                        setTimeout(() => location.reload(), 2000);
                                    } else {
                                        console.error("Error deleting skill. Unexpected response:", deleteData);
                                        warningText.style.display = 'block'
                                        warningText.classList.add("alert-danger");
                                        warningText.innerHTML = `Error deleting skill. Check console for details.`;
                                        setTimeout(()=> {
                                            warningText.style.display = 'none'
                                        }, 3000)
                                    }
                                };

                                // Fetch the delete API
                                fetchMethod(currentUrl + `/api/libraries/${skill.library_id}/`, deleteSkillCallback, "DELETE");
                            });

                            // Add event listener for cancel delete button
                            const cancelDeleteButton = document.getElementById("cancelDelete");
                            cancelDeleteButton.addEventListener("click", () => {
                                // Hide the popup without deleting the task
                                confirmationPopup.style.display = "none";
                            });
                        });
                    }
                } catch (error) {
                    console.error(error);
                }
            });

            if (verifyStatus === 200 && verifyData.role == 'admin') {
                const addSkill = document.getElementById("addItem");
                const addSkillDiv = document.createElement("div");
                addSkillDiv.className = "col-xl-6 col-lg-6 col-md-6 col-sm-12 mb-4 d-block align-items-center";
                addSkillDiv.innerHTML = `
                    <div class="form-container mb-2">
                        <h2>Create a New Skill</h2>

                        <form id="LibraryaddNewSkillForm">
                            <div class="mb-3">
                                <label for="profession" class="form-label">Profession:</label>
                                <select class="form-control" id="skill_profession" required>
                                    <option value="Saber Sect">Saber</option>
                                    <option value="Sword Sect">Sword</option>
                                    <option value="Shield Sect">Shield</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="skill_name" class="form-label">Skill Name:</label>
                                <input type="text" class="form-control" id="skill_name" required>
                            </div>
                            <div class="mb-3">
                                <label for="hp" class="form-label">HP (int):</label>
                                <input type="number" class="form-control" id="skill_hp" required>
                            </div>
                            <div class="mb-3">
                                <label for="atk" class="form-label">Attack (int):</label>
                                <input type="number" class="form-control" id="skill_atk" required>
                            </div>
                            <div class="mb-3">
                                <label for="def" class="form-label">Defense (int):</label>
                                <input type="number" class="form-control" id="skill_def" required>
                            </div>
                            <div class="mb-3">
                                <label for="points" class="form-label">Points (int):</label>
                                <input type="number" class="form-control" id="skill_points" required>
                            </div>
                            <button type="button" class="btn btn-primary" id="addSkillButton">Create Skill</button>
                        </form>
                    </div>
                `;
                addSkill.appendChild(addSkillDiv);

                const addSkillButton = document.getElementById('addSkillButton');
                addSkillButton.addEventListener("click", () => {
                    const warningSkill = document.createElement("div");
                    warningSkill.className = "alert ";
                    warningSkill.style.color = 'black';
                    warningSkill.className = "alert ";
                    warningSkill.style.color = 'black';
                    warningSkill.style.position = 'fixed';
                    warningSkill.style.top = '10%';
                    warningSkill.style.left = '50%';
                    warningSkill.style.transform = 'translateX(-50%)';
                    warningSkill.style.width = '80%';
                    warningSkill.style.maxWidth = '400px'; // Set a maximum width for smaller screens
                    warningSkill.style.padding = '10px';
                    warningSkill.style.textAlign = 'center';
                    warningSkill.style.borderRadius = '5px';
                    warningSkill.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.2)';
                    warningSkill.style.zIndex = '99999';

                    addSkill.appendChild(warningSkill);
                    const profession = document.getElementById("skill_profession").value;
                    const skill_name = document.getElementById("skill_name").value;
                    const hp = document.getElementById("skill_hp").value;
                    const atk = document.getElementById("skill_atk").value;
                    const def = document.getElementById("skill_def").value;
                    const points = document.getElementById("skill_points").value;

                    // You can use these values to construct your data object for the API call
                    const data = {
                        profession: profession,
                        skill_name: skill_name,
                        hp: hp,
                        atk: atk,
                        def: def,
                        points_worth: points
                    };

                    const addNewSkillCallBack = (addNewSkillStatus, addNewSkillData) => {
                        console.log("Add Skill Status:", addNewSkillStatus);
                        console.log("Add Skill Data:", addNewSkillData);

                        if (addNewSkillStatus === 201) {
                            // Skill creation successful
                            warningSkill.style.display = 'block'
                            warningSkill.classList.add('alert-success')
                            warningSkill.innerHTML = "Skill created successfully."

                            // Refresh the page after 2 seconds
                            setTimeout(() => {
                                location.reload();
                            }, 2000);
                        } else if (addNewSkillStatus === 404) {
                            // Skill creation successful
                            warningSkill.style.display = 'block'
                            warningSkill.classList.add('alert-danger')
                            warningSkill.innerHTML = addNewSkillData.message;
                            setTimeout(()=>{
                                warningSkill.style.display = 'none'
                            }, 2000)
                        } else {
                            // Display error message if Skill creation fails
                            warningSkill.style.display = 'block'
                            warningSkill.classList.add('alert-danger')
                            warningSkill.innerHTML = "Skill creation failed. Please try again.";
                            setTimeout(()=>{
                                warningSkill.style.display = 'none'
                            }, 2000)
                        }
                    }

                    fetchMethod(currentUrl + "/api/libraries/", addNewSkillCallBack, "POST", data);
                });
            }
        }
        fetchMethod(currentUrl + `/api/libraries/${sortType}`, libraryCallBack);
    }
    fetchMethod(currentUrl + "/api/jwt/verify/", verifyTokenCallback, "GET", null, token);
});
