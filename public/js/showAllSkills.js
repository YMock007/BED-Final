function fetchSkillsData(learnValue) {
    const token = localStorage.getItem("token");
    const skillsList = document.getElementById("skillsList");

    const verifyTokenCallback = async (verifyStatus, verifyData) => {
        if ( verifyStatus === 200 ) {
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
        let character_skill;
        try {
            const characterData = await characterByUserIdPromise;
            character_id = characterData.character_id;
            character_sect = characterData.sect
            character_skill = characterData.skill
        } catch (error) {
            console.error(error)
        }

        const skillsCallBack = async (skillStatus, skillData) => {
            console.log("skill Status:", skillStatus);
            console.log("skill Data:", skillData);

            skillsList.innerHTML = ""; // Clear existing content

            const warningText = document.createElement("div");
            warningText.className = "alert";
            skillsList.appendChild(warningText); // Append warningText to skillList

            if (skillStatus === 404 || skillData === 500) {
                warningText.classList.add("alert-danger");
                warningText.innerHTML = skillData.message ? skillData.message : skillData.error.error;
                return;
            }

            skillData.forEach(async (skill) => {
                try {
                    const displaySkills = document.createElement("div");
                    displaySkills.className =
                        "col-xl-3 col-lg-4 col-md-6 col-sm-12 mb-4 position-relative";

                    const professionStyle = `text-transform: uppercase;`;

                    displaySkills.innerHTML = `
                        <div class="card thread-card">
                            <div class="card-body">
                                <h5 class="card-title">Skill ID: ${skill.skill_id}</h5>
                                <p class="card-text">
                                    <span>Skill Name:</span> ${skill.skill_name} <br>
                                    <span>Profession:</span> <span style="${professionStyle}">${skill.profession}</span> <br>
                                    <span>Health Point(HP):</span> <span style="color: crimson;">${skill.hp}</span> <br>
                                    <span>Attack(ATK):</span> <span style="color: crimson;">${skill.atk}</span> <br>
                                    <span>Defense(DEF):</span> <span style="color: crimson;">${skill.def}</span> <br>
                                    <span style="color: green;">POINTS</span> <br> ${skill.points_worth} <br>
                                </p>
                                ${verifyStatus === 200 ? `
                                    <div class="sell-item-container d-flex justify-content-between">
                                        <button class="btn btn-primary btn-sm sell-skill-button" data-newsfeed-id="${skill.skill_id}">
                                            <i class="fas fa-sack-dollar"  style="letter-spacing: 2px;"> Sell</i> 
                                        </button>
                                        ${character_sect === skill.profession ? `
                                            ${character_skill === skill.skill_name ? `
                                                <button class="btn btn-danger btn-sm alr-learn-button position-relative">
                                                    <i class="fas fa-heart-crack" style="letter-spacing: 2px;"> Unequipable</i>
                                                </button>
                                            ` : `
                                                <button class="btn btn-success btn-sm position-relative learn-button" data-skill-name="${skill.skill_name}">
                                                    <i class="fas fa-heart" style="letter-spacing: 2px;"> Equip?</i>
                                                </button>
                                            `}
                                        ` : ''}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `;

                    skillsList.appendChild(displaySkills);

                    if(verifyStatus === 200 && verifyData.user_id && skill.skill_id ) {
                        const sellSkillButton = displaySkills.querySelector(".sell-skill-button"); // Add this line

                        // Add event listener for update button
                        sellSkillButton.addEventListener("click", () => {
                            // Show the custom popup for updating
                            const addPointsPopUpEquipment = document.getElementById("addPointsPopUpEquipment");
                            const addPointsPopUpSkill = document.getElementById("addPointsPopUpSkill");
                            addPointsPopUpEquipment.style.display = "none";
                            addPointsPopUpSkill.style.display = 'block';
                            console.log("Showing Skill Pop-up");
                            
                            let data;
                            // Add event listener for confirm update button
                            const confirmSellSkillButton = document.getElementById("confirmSellSkill");
                            confirmSellSkillButton.addEventListener("click", () => {
                                data = {
                                    seller_user_id: verifyData.user_id,
                                    skill_id: skill.skill_id,
                                    points: document.getElementById('pointsSkill').value
                                }
                                if(isNaN(data.points) || !data.points || data.points === "") {
                                    warningText.style.display = 'block';
                                    warningText.classList.add("alert-danger");
                                    warningText.innerHTML = `Please fill the points correctly.`;
                                    addPointsPopUpSkill.style.display = "none";
                                    setTimeout(() => {
                                        warningText.style.display = "none";
                                    }, 2000);
                                    return;
                                }
                                // Fetch API to sell skill (similar to delete logic)
                                const sellSkillCallback = (sellStatus, sellData) => {
                                    if (sellStatus === 201) {
                                        console.log("Added to te selling items successfully.")
                                        warningText.style.display = 'block';
                                        warningText.classList.add("alert-danger")
                                        warningText.innerHTML = `Added to the selling items successfully.`;
                                        document.getElementById('pointsSkill').value = '';
                                        addPointsPopUpSkill.style.display = "none";
                                        // You may want to handle further actions after update
                                        setTimeout(() => location.reload(), 2000);
                                    } else {
                                        console.error("Error Selling Skill.", sellData);
                                        warningText.style.display = 'block';
                                        warningText.classList.add("alert-danger");
                                        addPointsPopUpSkill.style.display = "none";
                                        warningText.innerHTML = sellData.error ? (sellData.error + (sellData.message ? sellData.message : '')) : (sellData || (sellData.error && sellData.error.message) || '');
                                        setTimeout(() => {
                                            warningText.style.display = "none";
                                        }, 2000);
                                    }
                                };
                                // Fetch the update API
                                fetchMethod(currentUrl + `/api/trades/sell`, sellSkillCallback, "POST", data);
                            });

                            // Add event listener for cancel update button
                            const cancelSellSkillButton = document.getElementById("cancelSellSkill");
                            cancelSellSkillButton.addEventListener("click", () => {
                                // Hide the update popup without updating the comment
                                addPointsPopUpSkill.style.display = "none";
                            });
                        });
                    }
                    if (verifyStatus === 200 && character_sect === skill.profession && character_skill !== skill.skill_name) {
                        const learnButton = displaySkills.querySelector(".learn-button");
                        learnButton.addEventListener("click", async() => {

                            // Show the custom popup
                            const confirmationPopup = document.getElementById("confirmationPopup");
                            confirmationPopup.style.display = "block";

                            const popupMessage = document.getElementById('popup-message');
                            popupMessage.innerHTML = 'Do you want to Equip this Skill?';
                            // Add event listener for confirm learn button
                            const confirmDeleteButton = document.getElementById("confirmDelete");
                            confirmDeleteButton.addEventListener("click", () => {
                                const data = {
                                    character_id: character_id,
                                    skill_id: skill.skill_id
                                }
                                // Fetch API to learn Skill
                                const learnSkillCallback = (learnStatus, learnData) => {
                                    if (learnStatus === 200) {
                                        // Eliminate the need for alert and simply display a success message
                                        console.log("Skill bought successfully.");
                                    
                                        // Styling for the success message
                                        warningText.style.display = 'block';
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
                                        warningText.innerHTML = "Equiping success. " + learnData.message;
                                    
                                        // Hide confirmation popup
                                        confirmationPopup.style.display = "none";
                                    
                                        // Reload the page after 3 seconds
                                        setTimeout(() => location.reload(), 3000);
                                    }
                                    else {
                                        // Error learning skill Skill
                                        console.error("Error learning Skill. Unexpected response:", learnData);
                                    
                                        // Styling for the error message
                                        warningText.style.display = 'block';
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
                                        warningText.innerHTML = learnData.message + " Do more Tasks, Complete Quests, Win Duels, or Trade  to get more points..";
                                    
                                        // Hide confirmation popup
                                        confirmationPopup.style.display = "none";

                                        // Reload the page after 3 seconds
                                        setTimeout(() => location.reload(), 3000);
                                    }
                                };

                                // Fetch the learn API
                                fetchMethod(currentUrl + `/api/skills/character/${character_id}/learn/`, learnSkillCallback, "POST", data);
                            });

                         // Add event listener for cancel delete button
                         const cancelDeleteButton = document.getElementById("cancelDelete");
                         cancelDeleteButton.addEventListener("click", () => {
                             // Hide the popup without deleting the task
                             confirmationPopup.style.display = "none";
                         });   
                        });
                    };
                    if(verifyStatus === 200 && character_skill === skill.skill_name) {
                        const alrEquipButton = displaySkills.querySelector(".alr-learn-button");
                        alrEquipButton.addEventListener("click", async() => {

                            warningText.style.display = 'block';
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
                        
                            // Display success message
                            warningText.innerHTML = "Skill is alrady in use";
                            setTimeout(() => {
                                warningText.style.display = "none";
                            }, 2000);
                        });
                    }
                } catch (error) {
                    console.error(error);
                    warningText.classList.add("alert-danger");
                    warningText.innerHTML = skillData.message;
                }
            });
        };
        fetchMethod(currentUrl + `/api/skills/character/${character_id}/${learnValue}`, skillsCallBack);
        }
    };
    fetchMethod(currentUrl + "/api/jwt/verify/", verifyTokenCallback, "GET", null, token);
}

function isCheckedSkill() {
    let skillCheck = document.getElementById('skillCheck');
    return skillCheck.checked ? 'learn' : '';
}

// Initial execution on DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
    let learnValue = isCheckedSkill()
    console.log(learnValue)
    fetchSkillsData(learnValue);
});

// Call fetchSkiData when isCheck function is invoked
function isCheckSkill() {
    let learnValue = isCheckedSkill();
    console.log(learnValue);
    fetchSkillsData(learnValue);
}
