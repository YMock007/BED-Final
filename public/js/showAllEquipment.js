function fetchEquipmentData(equipValue) {
    const token = localStorage.getItem("token");
    const equipmentList = document.getElementById("equipmentList");

    const verifyTokenCallback = async (verifyStatus, verifyData) => {
       if(verifyStatus === 200) {
        console.log("Token Verification Status:", verifyStatus);
        console.log("Token Verification Data:", verifyData);

        const characterByUserIdPromise = new Promise((resolve, reject) => {
            const characterByUserIdCallBack = (characterStatus, characterData) => {
                if (characterStatus === 200) {
                    resolve(characterData);
                } else {
                    reject("No character data. Please make a character first, Thanks.");
                }
            };
            fetchMethod(currentUrl + `/api/characters/user/${verifyData.user_id}`, characterByUserIdCallBack);
        });

        let character_id;
        let character_sect;
        let character_equipment;
        try {
            const characterData = await characterByUserIdPromise;
            character_id = characterData.character_id;
            character_sect = characterData.sect;
            character_equipment = characterData.equipment;
        } catch (error) {
            console.error(error)
        }

        const equipmentCallBack = async (equipmentStatus, equipmentData) => {
            console.log("Equipment Status:", equipmentStatus);
            console.log("Equipment Data:", equipmentData);

            equipmentList.innerHTML = ""; // Clear existing content
            console.log(character_sect)
            console.log(character_equipment)
            const warningText = document.createElement("div");
            warningText.className = "alert";
            equipmentList.appendChild(warningText); // Append warningText to equipmentList

            if (equipmentStatus === 404 || equipmentStatus === 500) {
                warningText.classList.add("alert-danger");
                warningText.innerHTML = equipmentData.message ? equipmentData.message : equipmentData.error.error;
                return;
            }

            equipmentData.forEach(async (equipment) => {
                try {
                    const displayEquipment = document.createElement("div");
                    displayEquipment.className = "col-xl-3 col-lg-4 col-md-6 col-sm-12 mb-4 position-relative";

                    const professionStyle = `text-transform: uppercase;`;

                    displayEquipment.innerHTML = `
                        <div class="card thread-card">
                            <div class="card-body">
                                <h5 class="card-title">Equipment ID: ${equipment.equipment_id}</h5>
                                <p class="card-text">
                                    <span>Equipment Name:</span> ${equipment.equipment_name} <br>
                                    <span>Profession:</span> <span style="${professionStyle}">${equipment.profession}</span> <br>
                                    <span>Health Point(HP):</span> <span style="color: crimson;">${equipment.hp}</span> <br>
                                    <span>Attack(ATK):</span> <span style="color: crimson;">${equipment.atk}</span> <br>
                                    <span>Defense(DEF):</span> <span style="color: crimson;">${equipment.def}</span> <br>
                                    <span style="color: green;">POINTS</span> <br> ${equipment.points_worth} <br>
                                </p>
                                ${verifyStatus === 200 ? `
                                    <div class="sell-item-container d-flex justify-content-between">
                                        <button class="btn btn-primary btn-sm sell-equipment-button" data-newsfeed-id="${equipment.equipment_id}">
                                            <i class="fas fa-sack-dollar"  style="letter-spacing: 2px;"> SELL</i>
                                        </button>
                                        ${character_sect === equipment.profession ? `
                                            ${character_equipment === equipment.equipment_name ? `
                                                <button class="btn btn-danger btn-sm position-relative alr-equip-button">
                                                    <i class="fas fa-heart-crack"  style="letter-spacing: 2px;"> Unequipable</i>
                                                </button>
                                            ` : `
                                                <button class="btn btn-success btn-sm position-relative equip-button" data-equipment-name="${equipment.equipment_name}">
                                                    <i class="fas fa-heart"  style="letter-spacing: 2px;"> Equip?</i>
                                                </button>
                                            `}
                                        ` : ''}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `;

                    equipmentList.appendChild(displayEquipment);

                    if(verifyStatus === 200 && verifyData.user_id && equipment.equipment_id ) {
                        const sellEquipmentButton = displayEquipment.querySelector(".sell-equipment-button"); // Add this line

                        // Add event listener for update button
                        sellEquipmentButton.addEventListener("click", () => {

                            const addPointsPopUpEquipment = document.getElementById("addPointsPopUpEquipment");
                            const addPointsPopUpSkill = document.getElementById("addPointsPopUpSkill");
                            addPointsPopUpSkill.style.display = 'none';
                            addPointsPopUpEquipment.style.display = "block";
                            
                            let data;
                            // Add event listener for confirm update button
                            const confirmSellEquipmentButton = document.getElementById("confirmSellEquipment");
                            confirmSellEquipmentButton.addEventListener("click", () => {
                                data = {
                                    seller_user_id: verifyData.user_id,
                                    equipment_id: equipment.equipment_id,
                                    points: document.getElementById('pointsEquipment').value
                                }
                                if(isNaN(data.points) || !data.points || data.points === "") {
                                    warningText.style.display = 'block'
                                    warningText.classList.add("alert-danger");
                                    warningText.innerHTML = `Please fill the points correctly.`;
                                    addPointsPopUpEquipment.style.display = "none";
                                    setTimeout(() => {
                                        warningText.style.display = 'none'
                                    }, 2000)
                                    return;
                                }
                                // Fetch API to sell equipment (similar to delete logic)
                                const sellEquipmentCallback = (sellStatus, sellData) => {
                                    if (sellStatus === 201) {
                                        console.log("Added to te selling items successfully.")
                                        warningText.style.display = 'block'
                                        warningText.classList.add("alert-danger")
                                        warningText.innerHTML = `Added to the selling items successfully.`;
                                        document.getElementById('pointsEquipment').value = '';
                                        addPointsPopUpEquipment.style.display = "none";
                                        // You may want to handle further actions after update
                                        setTimeout(() => location.reload(), 2000);
                                    } else {
                                        console.error("Error Selling Equipment.", sellData);
                                        warningText.style.display = 'block'
                                        warningText.classList.add("alert-danger");
                                        addPointsPopUpEquipment.style.display = "none";
                                        warningText.innerHTML = sellData.error ? (sellData.error + (sellData.message ? sellData.message : '')) : (sellData || (sellData.error && sellData.error.message) || '');
                                        setTimeout(() => {
                                            warningText.style.display = 'none'
                                        }, 2000)
                                    }
                                };
                                // Fetch the update API
                                fetchMethod(currentUrl + `/api/trades/sell`, sellEquipmentCallback, "POST", data);
                            });

                            // Add event listener for cancel update button
                            const cancelSellEquipmentButton = document.getElementById("cancelSellEquipment");
                            cancelSellEquipmentButton.addEventListener("click", () => {
                                // Hide the update popup without updating the comment
                                addPointsPopUpEquipment.style.display = "none";
                            });
                        });
                    }
                    if (verifyStatus === 200 && character_sect === equipment.profession && character_equipment !== equipment.equipment_name) {
                        const equipButton = displayEquipment.querySelector(".equip-button");
                        equipButton.addEventListener("click", async() => {

                            // Show the custom popup
                            const confirmationPopup = document.getElementById("confirmationPopup");
                            confirmationPopup.style.display = "block";

                            const popupMessage = document.getElementById('popup-message');
                            popupMessage.innerHTML = 'Do you want to Equip this Equipment?';
                            // Add event listener for confirm equip button
                            const confirmDeleteButton = document.getElementById("confirmDelete");
                            confirmDeleteButton.addEventListener("click", () => {
                                const data = {
                                    character_id: character_id,
                                    equipment_id: equipment.equipment_id
                                }
                                // Fetch API to equip Equipment
                                const equipEquipmentCallback = (equipStatus, equipData) => {
                                    if (equipStatus === 200) {
                                        // Eliminate the need for alert and simply display a success message
                                        console.log("Equipment bought successfully.");
                                    
                                        // Styling for the success message
                                        warningText.style.display = 'block'
                                        warningText.classList.add("alert-success");
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
                                        warningText.innerHTML = "Equiping success. " + equipData.message;
                                    
                                        // Hide confirmation popup
                                        confirmationPopup.style.display = "none";
                                    
                                        // Reload the page after 3 seconds
                                        setTimeout(() => location.reload(), 3000);
                                    }
                                    else {
                                        // Error equiping equipment Equipment
                                        console.error("Error equiping Equipment. Unexpected response:", equipData);
                                    
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
                                        warningText.innerHTML = equipData.message + " Do more Tasks, Complete Quests, Win Duels, or Trade  to get more points..";
                                    
                                        // Hide confirmation popup
                                        confirmationPopup.style.display = "none";

                                        // Reload the page after 3 seconds
                                        setTimeout(() => location.reload(), 3000);
                                    }
                                };

                                // Fetch the equip API
                                fetchMethod(currentUrl + `/api/equipment/character/${character_id}/equip/`, equipEquipmentCallback, "POST", data);
                            });

                         // Add event listener for cancel delete button
                         const cancelDeleteButton = document.getElementById("cancelDelete");
                         cancelDeleteButton.addEventListener("click", () => {
                             // Hide the popup without deleting the task
                             confirmationPopup.style.display = "none";
                         });   
                        });
                    };
                    if(verifyStatus === 200 && character_equipment === equipment.equipment_name) {
                        const alrEquipButton = displayEquipment.querySelector(".alr-equip-button");
                        alrEquipButton.addEventListener("click", async() => {
                            warningText.style.display = 'block'
                            warningText.classList.add("alert-warning");
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
                            warningText.innerHTML = "Equipment is alrady in use";
                            // Display success message
                            setTimeout(() => {
                                warningText.style.display = 'none'
                            }, 2000)
                        });
                    }
                } catch (error) {
                    console.error(error);
                }
            });
        };
        fetchMethod(currentUrl + `/api/equipment/character/${character_id}/${equipValue}`, equipmentCallBack);
       }
    };
    fetchMethod(currentUrl + "/api/jwt/verify/", verifyTokenCallback, "GET", null, token);
}

function isCheckedEquipment() {
    let equipCheck = document.getElementById('equipCheck');
    return equipCheck.checked ? 'equip' : '';
}

// Initial execution on DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
    let equipValue = isCheckedEquipment()
    console.log(equipValue)
    fetchEquipmentData(equipValue);
});

// Call fetchEquipmentData when isCheck function is invoked
function isCheckEquipment() {
    let equipValue = isCheckedEquipment();
    console.log(equipValue);
    fetchEquipmentData(equipValue);
}
