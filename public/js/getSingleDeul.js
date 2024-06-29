// Assuming you have the radio buttons with the given IDs
const allRadioButton = document.getElementById("all");
const winRadioButton = document.getElementById("win");
const lostRadioButton = document.getElementById("lost");

// Function to check which radio button is selected and get its value
function getSelectedRadioValue() {
    if (allRadioButton.checked) {
        return allRadioButton.value;
    } else if (winRadioButton.checked) {
        return winRadioButton.value;
    } else if (lostRadioButton.checked) {
        return lostRadioButton.value;
    } else {
        // Handle the case where no radio button is selected
        return null;
    }
}

// Function to be called when the radio button changes
function onRadioChange() {
    const selectedRadioValue = getSelectedRadioValue();

    if (selectedRadioValue !== null) {
        console.log("Selected filtering Value:", selectedRadioValue);
        // Call your function here, for example:
        getSingleTask(selectedRadioValue);
    } else {
        console.log("No Choice selected.");
    }
}

// Add event listeners to radio buttons
allRadioButton.addEventListener("change", onRadioChange);
winRadioButton.addEventListener("change", onRadioChange);
lostRadioButton.addEventListener("change", onRadioChange);

getSingleTask();
// Example function to be called when the radio button changes
function getSingleTask(filter) {
    if(!filter) {
        filter = 'character_name';
    }
    console.log(filter)
    console.log("getSingleTask function called.");
    const token = localStorage.getItem("token");
    const url = new URL(document.URL);
    const urlParams = url.searchParams;
    const character_name = urlParams.get("character_name");
    const characterTitle = document.getElementById("character-title");
    characterTitle.innerHTML = `Deuls for ${character_name}`;
    const verifyCallBack = (verifyStatus, verifyData) => {
        console.log('VerifyStatus', verifyStatus);
        console.log('verifyData', verifyData);  
        const deulsCallBack = async (deulsStatus, deulsData) => {
            console.log('DeulsStatus', deulsStatus);
            console.log('DeulsData', deulsData); 
            
            const warningCharacter = document.createElement("div");
            warningCharacter.className = "alert";
            warningCharacter.style.display = 'none'

            const warningText = document.createElement("div");
            warningText.className = "alert";
            warningText.style.display = 'none'
            warningText.style.position = 'fixed';
            warningText.style.top = '50%';
            warningText.style.left = '50%';
            warningText.style.transform = 'translateX(-50%)';
            warningText.style.width = '100%';
            warningText.style.maxWidth = '400px'; // Set a maximum width for smaller screens
            warningText.style.padding = '10px';
            warningText.style.textAlign = 'center';
            warningText.style.borderRadius = '5px';
            warningText.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.2)';
            warningText.style.zIndex = '99999';     

            const characterByUserIdPromise = new Promise((resolve, reject) => {
                const characterByUserIdCallBack = (characterStatus, characterData) => {
                    if (characterStatus === 200) {
                        resolve(characterData.character_name);
                    } else {
                        warningCharacter.style.display = 'block'
                        warningCharacter.classList.add("alert-danger");
                        warningCharacter.innerHTML = `To duel this character, the user must make a character first, Thanks.`;
                        setTimeout(()=> {
                            warningCharacter.style.display = 'none';
                        }, 2000)
                        reject("No character data. Please make a character first, Thanks.");
                    }
                };
                fetchMethod(currentUrl + `/api/characters/user/${verifyData.user_id}`, characterByUserIdCallBack);
            });

            let user_character_name;
            try {
                user_character_name = await characterByUserIdPromise;
            } catch (error) {
                isCharacter = false;
            }
            const deulsList = document.getElementById("deulsList");
            deulsList.innerHTML = "";
            deulsList.appendChild(warningCharacter);
            deulsList.appendChild(warningText);

            if(deulsData.length === 0 || deulsStatus === 404) {
                warningText.classList.add("alert-danger");
                warningText.style.display = 'block';
                warningText.innerHTML = `${deulsData.message} for the Character ${character_name}`;
                setTimeout(()=> {
                    warningText.style.display = 'none';
                }, 2000)
            }
            if(deulsStatus === 200) {
                deulsData.forEach(duel => {
                    const displayItem = document.createElement('div');
                    displayItem.className =
                    "col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12 mb-4 position-relative";

                    displayItem.innerHTML = `
                        <div class="card thread-card">
                            <div class="card-body">
                                <h5 class="card-title">Deul ID: ${duel.duel_id}</h5>
                                <p class="card-text">
                                    <span style="color: black; ">Deul Status:</span>
                                    <span style="${character_name === duel.winner_name ? 'color: green;' : 'color: crimson;'}">
                                    ${character_name === duel.winner_name ? 'Winner!' : 'Loser!'}
                                    </span> <br>                            
                                    <span>Points Bet</span>
                                    <span style="color: green">${duel.points_bet}</span> <br>
                                    <span>Winner Name</span>
                                    <span style="color: green">${duel.winner_name}</span> <br>
                                    <span>Loser Name</span>
                                    <span style="color: crimson">${duel.loser_name}</span> <br>
                                    <span>Duel Date: ${duel.duel_date}</span> <br>
                                </p>
                            </div>
                        </div>
                    `;
                    deulsList.appendChild(displayItem);               
                });
            }
            if(verifyStatus === 200 && user_character_name) {
                const deulDiv = document.createElement('div');
                deulDiv.className ="text-center col12 mb-4 position-relative ";
                deulDiv.innerHTML = `
                    <button class="btn btn-primary btn-lg deul-button px-5" data-character-name="${character_name}">
                    <i class="fas fa-khanda"></i> DEUL
                    </button>`
                deulsList.appendChild(deulDiv)

                const deulButton = deulDiv.querySelector('.deul-button');
                deulButton.addEventListener('click', () => {
                    const pointsBetPopUp = document.getElementById("pointsBetPopUp");
                    pointsBetPopUp.style.display = "block";
                    
                    const confirmBetButton = document.getElementById("confirmBetButton");
                    let data;
                    confirmBetButton.addEventListener('click', () => {
                        data = {
                            participant_1_name: user_character_name,
                            participant_2_name: character_name,
                            points_bet: document.getElementById('points-bet').value
                        }
                        if(isNaN(data.points_bet) || !data.points_bet || data.points_bet === "" || data.points_bet <= 0) {
                            warningText.style.display = 'block'
                            warningText.classList.add("alert-danger");
                            warningText.innerHTML = `Please fill the points correctly.`;
                            pointsBetPopUp.style.display = "none";
                            setTimeout(() => {
                                warningText.style.display = 'none'
                            }, 2000)
                            return;
                        }
                        pointsBetPopUp.style.display = "none";
                        const fightCallBack = (fightStatus, fightData) => {
                            if (fightStatus === 200) {
                                console.log("Dueling Success.")
                                warningText.style.display = 'block'
                                warningText.classList.add("alert-danger")
                                warningText.innerHTML = `Deuling Success`;
                                document.getElementById('points-bet').value = '';

                                // Reload the page after a delay (2 seconds)
                                setTimeout(() => {
                                    location.reload();
                                }, 2000);                               
                            } else {
                                console.error("Error Dueling.", fightData);
                                warningText.style.display = 'block'
                                warningText.classList.add("alert-danger");                                warningText.innerHTML = fightData.message;
                                setTimeout(() => {
                                    warningText.style.display = 'none'
                                }, 2000)
                            }
                        }
                        fetchMethod(currentUrl + '/api/duels', fightCallBack, "POST", data)
                    });
                    const cancelBetButton = document.getElementById("cancelBetButton");
                    cancelBetButton.addEventListener("click", () => {
                        // Hide the update popup without updating the comment
                        pointsBetPopUp.style.display = "none";
                    });
                });
            }
        }
        fetchMethod(currentUrl + `/api/duels/${filter}/${character_name}`, deulsCallBack)    
    }
    fetchMethod(currentUrl + `/api/jwt/verify`,verifyCallBack, "GET", null, token)
}
