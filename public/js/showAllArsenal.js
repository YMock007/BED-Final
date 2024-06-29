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

        const arsenalCallBack = async (arsenalStatus, arsenalData) => {
            console.log("Arsenal Status:", arsenalStatus);
            console.log("Arsenal Data:", arsenalData);

            const arsenalsList = document.getElementById("arsenalsList");
            arsenalsList.innerHTML = "";

            const warningText = document.createElement("div");
            warningText.className = "alert";
            arsenalsList.appendChild(warningText);

            if (arsenalStatus === 500) {
                warningText.style.display = 'block'
                warningText.classList.add("alert-danger");
                warningText.innerHTML = `No Equipment found.`;
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
                        warningText.innerHTML = `To buy an equipment, the user must make a character first, Thanks.`;
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

            arsenalData.forEach(async (equipment) => {
                try {
                    const displayItem = document.createElement("div");
                    displayItem.className =
                        "col-xl-4 col-lg-4 col-md-6 col-sm-12 mb-4 position-relative";

                    displayItem.innerHTML = `
                        <div class="card thread-card">
                            <div class="card-body">
                                <h5 class="card-title">Arsenal ID: ${equipment.arsenal_id}</h5>
                                <p class="card-text">
                                    <span>Equipment Name:</span> ${equipment.equipment_name} <br>
                                    <span>Profession:</span>${equipment.profession} <br>
                                    <span>Health Point(HP):</span> 
                                    <span style="color: crimson; ">${equipment.hp}</span> <br>
                                    <span>Attack(ATK):</span> 
                                    <span style="color: crimson; ">${equipment.atk}</span> <br>
                                    <span>Defense(DEF):</span> 
                                    <span style="color: crimson; ">${equipment.def}</span> <br>
                                    <span style="color: green; ">Point:</span>
                                    <span style="color: green; ">${equipment.points_worth}</span> <br>
                                </p>
                                ${verifyStatus === 200 && isCharacter === true? `
                                <button class="btn btn-success btn-sm buy-button" data-arsenal-id="${equipment.arsenal_id}">
                                <i class="fa-solid fa-cart-shopping"></i>
                                </button>
                                ` : ''}
                                ${verifyStatus === 200 && verifyData.role == 'admin' ? `
                                <div class="edit-delete-buttons position-absolute top-0 end-0 p-2">
                                    <a href="updateArsenal.html?arsenal_id=${equipment.arsenal_id}" class="btn btn-secondary btn-sm"><i class="fas fa-edit"></i></a>
                                    <button class="btn btn-danger btn-sm delete-button" data-arsenal-id="${equipment.arsenal_id}">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                </div>
                                ` : ``}
                            </div>
                        </div>
                    `;
                    arsenalsList.appendChild(displayItem);

                    if (verifyStatus === 200 && isCharacter === true) {
                        const buyButton = displayItem.querySelector(".buy-button");
                        buyButton.addEventListener("click", async () => {
                            console.log(character_id);

                            // Show the custom popup
                            const confirmationPopup = document.getElementById("confirmationPopup");
                            confirmationPopup.style.display = "block";

                            const popupMessage = document.getElementById('popup-message');
                            popupMessage.innerHTML = 'Do you want to buy the Equipment?';
                            // Add event listener for confirm buy button
                            const confirmDeleteButton = document.getElementById("confirmDelete");
                            confirmDeleteButton.addEventListener("click", () => {
                                const data = {
                                    character_id: character_id,
                                    arsenal_id: equipment.arsenal_id
                                }
                                // Fetch API to buy Equipment
                                const buyEquipmentCallback = (buyStatus, buyData) => {
                                    if (buyStatus === 200) {
                                        // Eliminate the need for alert and simply display a success message
                                        console.log("Equipment bought successfully.");

                                        // Styling for the success message
                                        warningText.style.display = 'block'
                                        warningText.classList.add("alert-primary");
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
                                        warningText.innerHTML = "Equipment bought successfully. " + buyData.message;

                                        // Hide confirmation popup
                                        confirmationPopup.style.display = "none";

                                        // Reload the page after 3 seconds
                                        setTimeout(()=> {
                                            warningText.style.display = 'none'
                                        }, 3000)
                                    }
                                    else {
                                        // Error buying equipment Equipment
                                        console.error("Error buying Equipment. Unexpected response:", buyData);

                                        // Styling for the error message
                                        warningText.style.display = 'block'
                                        warningText.classList.add("alert-danger");
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
                                        warningText.innerHTML = buyData.message + " Do more Tasks, Complete Quests, Win Duels, or Trade  to get more points..";

                                        // Hide confirmation popup
                                        confirmationPopup.style.display = "none";

                                        // Reload the page after 3 seconds
                                        setTimeout(()=> {
                                            warningText.style.display = 'none'
                                        }, 3000)
                                    }
                                };

                                // Fetch the buy API
                                fetchMethod(currentUrl + `/api/arsenals/buy/`, buyEquipmentCallback, "POST", data);
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
                            popupMessage.innerHTML = 'Do you want to delete the Equipment?';
                            // Add event listener for confirm delete button
                            const confirmDeleteButton = document.getElementById("confirmDelete");
                            confirmDeleteButton.addEventListener("click", () => {
                                // Fetch API to delete Equipment
                                const deleteEquipmentCallback = (deleteStatus, deleteData) => {
                                    if (deleteStatus === 204) {
                                        // Eliminate the need for alert and simply reload the page
                                        console.log("Equipment deleted successfully.")
                                        confirmationPopup.style.display = "none";
                                        setTimeout(() => location.reload(), 2000);
                                    } else {
                                        console.error("Error deleting task. Unexpected response:", deleteData);
                                        warningText.style.display = 'block'
                                        warningText.classList.add("alert-danger");
                                        warningText.innerHTML = `Error deleting equipment. Check console for details.`;
                                        setTimeout(()=> {
                                            warningText.style.display = 'none'
                                        }, 2000)
                                    }
                                };

                                // Fetch the delete API
                                fetchMethod(currentUrl + `/api/arsenals/${equipment.arsenal_id}/`, deleteEquipmentCallback, "DELETE");
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
                const addEquipment = document.getElementById("addItem");
                const addEquipmentDiv = document.createElement("div");
                addEquipmentDiv.className = "col-xl-6 col-lg-6 col-md-6 col-sm-12 mb-4 d-block align-items-center";
                addEquipmentDiv.innerHTML = `
                    <div class="form-container mb-2">
                        <h2>Create a New Equipment</h2>
            
                        <form id="EquipmentaddNewEquipmentForm">
                            <div class="mb-3">
                                <label for="profession" class="form-label">Profession:</label>
                                <select class="form-control" id="equipment_profession" required>
                                    <option value="Saber Sect">Saber</option>
                                    <option value="Sword Sect">Sword</option>
                                    <option value="Shield Sect">Shield</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="equipment_name" class="form-label">Equipment Name:</label>
                                <input type="text" class="form-control" id="equipment_name" required>
                            </div>
                            <div class="mb-3">
                                <label for="hp" class="form-label">HP (int):</label>
                                <input type="number" class="form-control" id="equipment_hp" required>
                            </div>
                            <div class="mb-3">
                                <label for="atk" class="form-label">Attack (int):</label>
                                <input type="number" class="form-control" id="equipment_atk" required>
                            </div>
                            <div class="mb-3">
                                <label for="def" class="form-label">Defense (int):</label>
                                <input type="number" class="form-control" id="equipment_def" required>
                            </div>
                            <div class="mb-3">
                                <label for="points" class="form-label">Points (int):</label>
                                <input type="number" class="form-control" id="equipment_points" required>
                            </div>
                            <button type="button" class="btn btn-primary" id="addEquipmentButton">Create Equipment</button>
                        </form>
                    </div>
                    `;
                addEquipment.appendChild(addEquipmentDiv);

                const addEquipmentButton = document.getElementById('addEquipmentButton');
                addEquipmentButton.addEventListener("click", () => {
                    const warningEquipment = document.createElement("div");
                    warningEquipment.className = "alert ";
                    warningEquipment.style.color = 'black';
                    warningEquipment.style.position = 'fixed';
                    warningEquipment.style.top = '10%';
                    warningEquipment.style.left = '50%';
                    warningEquipment.style.transform = 'translateX(-50%)';
                    warningEquipment.style.width = '80%';
                    warningEquipment.style.maxWidth = '400px'; // Set a maximum width for smaller screens
                    warningEquipment.style.padding = '10px';
                    warningEquipment.style.textAlign = 'center';
                    warningEquipment.style.borderRadius = '5px';
                    warningEquipment.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.2)';
                    warningEquipment.style.zIndex = '99999';

                    addEquipment.appendChild(warningEquipment);
                    const profession = document.getElementById("equipment_profession").value;
                    const equipment_name = document.getElementById("equipment_name").value;
                    const hp = document.getElementById("equipment_hp").value;
                    const atk = document.getElementById("equipment_atk").value;
                    const def = document.getElementById("equipment_def").value;
                    const points = document.getElementById("equipment_points").value;

                    // You can use these values to construct your data object for the API call
                    const data = {
                        profession: profession,
                        equipment_name: equipment_name,
                        hp: hp,
                        atk: atk,
                        def: def,
                        points_worth: points
                    };
                    const addNewEquipmentCallBack = (addNewEquipmentStatus, addNewEquipmentData) => {
                        console.log("Add EquipmentaddNewEquipment Status:", addNewEquipmentStatus);
                        console.log("Add EquipmentaddNewEquipment Data:", addNewEquipmentData);


                        if (addNewEquipmentStatus === 201) {
                            // EquipmentaddNewEquipment creation successful
                            warningEquipment.style.display = 'block'
                            warningEquipment.classList.add('alert-success')
                            warningEquipment.innerHTML = "Equipment created successfully."
                            // Refresh the page after 2 seconds
                            setTimeout(() => {
                                location.reload();
                            }, 2000);
                        } else if (addNewEquipmentStatus === 404) {
                            warningEquipment.style.display = 'block'
                            warningEquipment.classList.add('alert-danger')
                            warningEquipment.innerHTML = addEquipment.message;
                            setTimeout(()=>{
                                warningEquipment.style.display = 'none'
                            }, 2000)
                        } else {
                            // Display error message if EquipmentaddNewEquipment creation fails
                            warningEquipment.style.display = 'block'
                            warningEquipment.classList.add('alert-danger')
                            warningEquipment.innerHTML = "Equipment creation failed. Please try again.";
                            setTimeout(()=>{
                                warningEquipment.style.display = 'none'
                            }, 2000)
                        }
                    }
                    fetchMethod(currentUrl + "/api/arsenals/", addNewEquipmentCallBack, "POST", data)
                })
            }
        }
        fetchMethod(currentUrl + `/api/arsenals/${sortType}`, arsenalCallBack);
    }
    fetchMethod(currentUrl + "/api/jwt/verify/", verifyTokenCallback, "GET", null, token);
});



