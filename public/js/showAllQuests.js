function handleSortDropdownChange() {
    let filterType = sessionStorage.getItem("selectedQuest") || "";
    const sortDropdown = document.getElementById("sortDropdown");

    sortDropdown.addEventListener("change", async () => {
        const selectedOption = sortDropdown.value;

        if (selectedOption === "default" || selectedOption === "") {
            filterType = "";
        } else if (selectedOption === "reward" || selectedOption === "enemy") {
            filterType = selectedOption;
        } else {
            console.error("Invalid option selected.");
            alert("Invalid option selected. Please try again.");
        }

        sessionStorage.setItem("selectedQuest", filterType);
        location.reload();
    });

    for (let i = 0; i < sortDropdown.options.length; i++) {
        if (sortDropdown.options[i].value === filterType) {
            sortDropdown.options[i].selected = true;
            break;
        }
    }
    console.log(filterType)
    return filterType;
}

document.addEventListener("DOMContentLoaded", function () {
    filterType = handleSortDropdownChange();

    const token = localStorage.getItem("token");
    const verifyTokenCallback = (verifyStatus, verifyData) => {
        console.log("Token Verification Status:", verifyStatus);
        console.log("Token Verification Data:", verifyData);

        const questCallBack = async (questStatus, questData) => {
            console.log("Quest Status:", questStatus);
            console.log("Quest Data:", questData);

            const questsList = document.getElementById("questsList");
            questsList.innerHTML = "";

            const warningText = document.createElement("div");
            warningText.className = "alert";
            warningText.style.display = 'none'
            warningText.style.position = 'fixed';
            warningText.style.top = '25%';
            warningText.style.left = '50%';
            warningText.style.transform = 'translateX(-50%)';
            warningText.style.width = '80%';
            warningText.style.maxWidth = '400px'; // Set a maximum width for smaller screens
            warningText.style.padding = '10px';
            warningText.style.textAlign = 'center';
            warningText.style.borderRadius = '5px';
            warningText.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.2)';
            warningText.style.zIndex = '99999';

            questsList.appendChild(warningText);

            if (questStatus !== 200) {
                warningText.style.display = 'block'
                warningText.classList.add("alert-danger");
                warningText.innerHTML = `No Quests found.`;
                setTimeout(()=> {
                    warningText.style.display = 'none'
                }, 3000)
            }

            const characterByUserIdPromise = new Promise((resolve, reject) => {
                const characterByUserIdCallBack = (characterStatus, characterData) => {
                    if (characterStatus === 200) {
                        resolve(characterData.character_id);
                    } else {
                        warningText.style.display = 'block'
                        warningText.classList.add("alert-info");
                        warningText.innerHTML = `To do a quest, the user must make a character first, Thanks.`;
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

            questData.forEach(async (quest) => {
                try {
                    const displayItem = document.createElement("div");
                    displayItem.className =
                        "col-12 mb-4 position-relative";

                    displayItem.innerHTML = `
                        <div class="card thread-card table-responsive">
                            <div class="card-body">
                                <div class="container mt-4">
                                    <table class="table table-bordered table-hover table-striped">
                                    <thead class="thead-light">
                                        <tr class="align-top">
                                        <th>Quest ID</th>
                                        <th>Quest Title</th>
                                        <th>Quest Description</th>
                                        <th>Enemy Name</th>
                                        <th>Enemy Health Points</th>
                                        <th>Enemy Attack</th>
                                        <th>Enemy Defense</th>
                                        <th>Health Points Reward</th>
                                        <th>Attack Reward</th>
                                        <th>Defense Reward</th>
                                        <th>Point Reward</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                        <td>${quest.quest_id}</td>
                                        <td>${quest.title}</td>
                                        <td>${quest.description}</td>
                                        <td>${quest.enemy_name}</td>
                                        <td style="color: crimson;">${quest.enemy_hp}</td>
                                        <td style="color: crimson;">${quest.enemy_atk}</td>
                                        <td style="color: crimson;">${quest.enemy_def}</td>
                                        <td style="color: green;">${quest.hp_reward}</td>
                                        <td style="color: green;">${quest.atk_reward}</td>
                                        <td style="color: green;">${quest.def_reward}</td>
                                        <td style="color: green;">${quest.points_reward}</td>
                                        </tr>
                                    </tbody>
                                    </table>
                                </div>
                                
                                ${verifyStatus === 200 && isCharacter === true? `
                                <button class="btn btn-primary btn-md do-quest-button" data-quests-id="${quest.quest_id}">
                                <i class="fa-solid fa-gun"> Do Quest</i>
                                </button>
                                ` : ''}
                                ${verifyStatus === 200 && verifyData.role == 'admin' ? `
                                <div class="edit-delete-buttons position-absolute top-0 end-0 p-2">
                                    <a href="updateQuest.html?quest_id=${quest.quest_id}" class="btn btn-secondary btn-sm"><i class="fas fa-edit"></i></a>
                                    <button class="btn btn-danger btn-sm delete-button" data-quest-id="${quest.quest_id}">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                </div>
                                ` : ``}
                            </div>
                        </div>
                    `;
                    questsList.appendChild(displayItem);

                    if (verifyStatus === 200 && isCharacter === true) {
                        const doQuestButton = displayItem.querySelector(".do-quest-button");
                        doQuestButton.addEventListener("click", async () => {
                            console.log(character_id);

                            // Show the custom popup
                            const confirmationPopup = document.getElementById("confirmationPopup");
                            confirmationPopup.style.display = "block";

                            const popupMessage = document.getElementById('popup-message');
                            popupMessage.innerHTML = 'Do you want to do the Quest?';
                            // Add event listener for confirm do button
                            const confirmDeleteButton = document.getElementById("confirmDelete");
                            confirmDeleteButton.addEventListener("click", () => {
                                confirmationPopup.style.display = "none";
                                const data = {
                                    character_id: character_id,
                                    quest_id: quest.quest_id
                                }
                                // Fetch API to do Quest
                                const doQuestCallback = (questStatus, questData) => {
                                    if (questStatus === 200) {
                                        // Eliminate the need for alert and simply display a success message
                                        console.log("Quest done successfully.", questData);

                                        // Styling for the success message
                                        warningText.style.display = 'block'
                                        warningText.classList.add("alert-primary");
                                    

                                        // Display success message
                                        warningText.innerHTML = (questData.battleDetail && questData.battleDetail.message || '') +
                                        (questData.characterUpdateResult && questData.characterUpdateResult.message || '') +
                                        (questData.pointsUpdateResult && questData.pointsUpdateResult.message || '') ||
                                        (questData.message || '');
                                                         ;

                                        // Hide confirmation popu

                                        // Reload the page after 3 seconds
                                        setTimeout(()=> {
                                            warningText.style.display = 'none'
                                        }, 3000)
                                    }
                                    else {
                                        // Error doing quest Quest
                                        console.error(`Error doing Quest. Unexpected response: `);

                                        // Styling for the error message
                                        warningText.style.display = 'block'
                                        warningText.classList.add("alert-danger");

                                        // Display error message
                                        warningText.innerHTML = questData.message ? questData.message : "Character lost the mattch or not enough points.";

                                        // Reload the page after 3 seconds
                                        setTimeout(()=> {
                                            warningText.style.display = 'none'
                                        }, 3000)
                                    }
                                };

                                // Fetch the do API
                                fetchMethod(currentUrl + `/api/quests/${quest.quest_id}/character/${character_id}`, doQuestCallback, "POST");
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
                            popupMessage.innerHTML = 'Do you want to delete the Quest?';
                            // Add event listener for confirm delete button
                            const confirmDeleteButton = document.getElementById("confirmDelete");
                            confirmDeleteButton.addEventListener("click", () => {
                                // Fetch API to delete Quest
                                const deleteEquipmentCallback = (deleteStatus, deleteData) => {
                                    if (deleteStatus === 200) {
                                        // Eliminate the need for alert and simply reload the page
                                        console.log("Quest deleted successfully.")
                                        confirmationPopup.style.display = "none";
                                        warningText.style.display = 'block'
                                        warningText.style.display = 'success'
                                        warningText.classList.add("alert-danger");
                                        warningText.innerHTML = deleteData.message
                                        setTimeout(()=> {
                                            warningText.style.display = 'none'
                                        }, 2000)
                                        setTimeout(() => location.reload(), 2000);
                                    } else {
                                        console.error("Error deleting task. Unexpected response:", deleteData);
                                        warningText.style.display = 'block'
                                        warningText.classList.add("alert-danger");
                                        warningText.innerHTML = `Error deleting quest. Check console for details.`;
                                        setTimeout(()=> {
                                            warningText.style.display = 'none'
                                        }, 2000)
                                    }
                                };

                                // Fetch the delete API
                                fetchMethod(currentUrl + `/api/quests/${quest.quest_id}/`, deleteEquipmentCallback, "DELETE");
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
                const addQuest = document.getElementById("addQuest");
                const addQuestDiv = document.createElement("div");
                addQuestDiv.className = "col-12 mb-4 d-block align-items-center";
                addQuestDiv.innerHTML = `
                    <div class="form-container mb-2">
                        <h2>Create a New Quest</h2>
            
                        <form id="addQuestForm">
                            <div class="mb-3">
                                <label for="quest_name" class="form-label">Quest Name:</label>
                                <input type="text" class="form-control" id="quest_name" required>
                            </div>
                            <div class="mb-3">
                                <label for="description" class="form-label">Description:</label>
                                <input type="number" class="form-control" id="description" required>
                            </div>
                            <div class="mb-3">
                            <label for="enemy_name" class="form-label">Enemy Name:</label>
                                <input type="text" class="form-control" id="enemy_name" required>
                            </div>
                            <div class="mb-3">
                                <label for="enemy_hp" class="form-label">Enemy Health:</label>
                                <input type="number" class="form-control" id="enemy_hp" required>
                            </div>
                            <div class="mb-3">
                                <label for="enemy_atk" class="form-label">Enemy Attack(int):</label>
                                <input type="number" class="form-control" id="enemy_atk" required>
                            </div>
                            <div class="mb-3">
                                <label for="enemy_def" class="form-label">Enemy Defense(int):</label>
                                <input type="number" class="form-control" id="enemy_def" required>
                            </div>
                            <div class="mb-3">
                                <label for="hp_reward" class="form-label">Health Reward(int):</label>
                                <input type="number" class="form-control" id="hp_reward" required>
                            </div>
                            <div class="mb-3">
                                <label for="atk_reward" class="form-label">Attack Reward(int):</label>
                                <input type="number" class="form-control" id="atk_reward" required>
                            </div>
                            <div class="mb-3">
                                <label for="def_reward" class="form-label">Defense Reward(int):</label>
                                <input type="number" class="form-control" id="def_reward" required>
                            </div>
                            <div class="mb-3">
                                <label for="points_reward" class="form-label">Points Reward(int):</label>
                                <input type="number" class="form-control" id="points_reward" required>
                            </div>
                            <button type="button" class="btn btn-primary" id="addQuestButton">Create Quest</button>
                        </form>
                    </div>
                    `;
                addQuest.appendChild(addQuestDiv);

                const addQuestButton = document.getElementById('addQuestButton');
                addQuestButton.addEventListener("click", () => {
                    const warningQuest = document.createElement("div");
                    warningQuest.className = "alert ";
                    warningQuest.style.color = 'black';
                    warningQuest.style.position = 'fixed';
                    warningQuest.style.top = '10%';
                    warningQuest.style.left = '50%';
                    warningQuest.style.transform = 'translateX(-50%)';
                    warningQuest.style.width = '80%';
                    warningQuest.style.maxWidth = '400px'; // Set a maximum width for smaller screens
                    warningQuest.style.padding = '10px';
                    warningQuest.style.textAlign = 'center';
                    warningQuest.style.borderRadius = '5px';
                    warningQuest.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.2)';
                    warningQuest.style.zIndex = '99999';
                
                    addQuest.appendChild(warningQuest);
                
                    const quest_name = document.getElementById("quest_name").value;
                    const description = document.getElementById("description").value;
                    const enemy_name = document.getElementById("enemy_name").value;
                    const enemy_hp = document.getElementById("enemy_hp").value;
                    const enemy_atk = document.getElementById("enemy_atk").value;
                    const enemy_def = document.getElementById("enemy_def").value;
                    const hp_reward = document.getElementById("hp_reward").value;
                    const atk_reward = document.getElementById("atk_reward").value;
                    const def_reward = document.getElementById("def_reward").value;
                    const points_reward = document.getElementById("points_reward").value;
                
                    // You can use these values to construct your data object for the API call
                    const data = {
                        title: quest_name,
                        description: description,
                        enemy_name: enemy_name,
                        enemy_hp: enemy_hp,
                        enemy_atk: enemy_atk,
                        enemy_def: enemy_def,
                        hp_reward: hp_reward,
                        atk_reward: atk_reward,
                        def_reward: def_reward,
                        points_reward: points_reward
                    };
                
                    const addNewQuestCallBack = (addNewQuestStatus, addNewQuestData) => {
                        console.log("Add Quest Status:", addNewQuestStatus);
                        console.log("Add Quest Data:", addNewQuestData);
                
                        if (addNewQuestStatus === 201) {
                            // Quest creation successful
                            warningQuest.style.display = 'block';
                            warningQuest.classList.add('alert-success');
                            warningQuest.innerHTML = "Quest created successfully.";
                            // Refresh the page after 2 seconds
                            setTimeout(() => {
                                location.reload();
                            }, 2000);
                        } else if (addNewQuestStatus === 404) {
                            warningQuest.style.display = 'block';
                            warningQuest.classList.add('alert-danger');
                            warningQuest.innerHTML = addNewQuestData.message;
                            setTimeout(() => {
                                warningQuest.style.display = 'none';
                            }, 2000);
                        } else {
                            // Display error message if Quest creation fails
                            warningQuest.style.display = 'block';
                            warningQuest.classList.add('alert-danger');
                            warningQuest.innerHTML = "Quest creation failed. Please try again.";
                            setTimeout(() => {
                                warningQuest.style.display = 'none';
                            }, 2000);
                        }
                    };
                
                    fetchMethod(currentUrl + "/api/quests/", addNewQuestCallBack, "POST", data);
                });
            }
        }
        fetchMethod(currentUrl + `/api/quests/${filterType}`, questCallBack);
    }
    fetchMethod(currentUrl + "/api/jwt/verify/", verifyTokenCallback, "GET", null, token);
});



