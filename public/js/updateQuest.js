document.addEventListener("DOMContentLoaded", function () {
    const updateQuestForm = document.getElementById("UpdateQuestForm"); // Updated form ID
    const warningCard = document.getElementById("warningCard");
    const warningText = document.getElementById("warningText");
    const url = new URL(document.URL);
    const urlParams = url.searchParams;
    const quest_id = urlParams.get("quest_id");
    const questTitle = document.getElementById("quest-title");

    let currentQuest;

    const callbackForCurrentQuest = (responseStatus, responseData) => {
        console.log("responseStatus:", responseStatus);
        console.log("responseData:", responseData);
        currentQuest = responseData;
        questTitle.innerHTML = `Editing Quest ${currentQuest.quest_id}`;

        // Set the default values for form fields
        document.getElementById("quest_name").value = currentQuest.title;
        document.getElementById("description").value = currentQuest.description;
        document.getElementById("enemy_name").value = currentQuest.enemy_name;
        document.getElementById("enemy_hp").value = currentQuest.enemy_hp;
        document.getElementById("enemy_atk").value = currentQuest.enemy_atk;
        document.getElementById("enemy_def").value = currentQuest.enemy_def;
        document.getElementById("hp_reward").value = currentQuest.hp_reward;
        document.getElementById("atk_reward").value = currentQuest.atk_reward;
        document.getElementById("def_reward").value = currentQuest.def_reward;
        document.getElementById("points_reward").value = currentQuest.points_reward;
    };

    fetchMethod(currentUrl + `/api/quests/${quest_id}`, callbackForCurrentQuest);

    const submitButton = document.getElementById("updateQuestButton")
    submitButton.addEventListener("click", function (event) {
        event.preventDefault();

        const newQuestName = document.getElementById("quest_name").value;
        const newDescription = document.getElementById("description").value;
        const newEnemyName = document.getElementById("enemy_name").value;
        const newEnemyHp = document.getElementById("enemy_hp").value;
        const newEnemyAtk = document.getElementById("enemy_atk").value;
        const newEnemyDef = document.getElementById("enemy_def").value;
        const newHpReward = document.getElementById("hp_reward").value;
        const newAtkReward = document.getElementById("atk_reward").value;
        const newDefReward = document.getElementById("def_reward").value;
        const newPointsReward = document.getElementById("points_reward").value;

        // Perform JWT token verification
        const token = localStorage.getItem("token");
        fetchMethod(currentUrl + "/api/jwt/verify", (verifyStatus, verifyData) => {
            if (verifyStatus === 200 && verifyData.role === 'admin') {
                // Token is valid, proceed with the update
                console.log("Update successful");
                const data = {
                    quest_id: quest_id,
                    title: newQuestName,
                    description: newDescription,
                    enemy_name: newEnemyName,
                    enemy_hp: newEnemyHp,
                    enemy_atk: newEnemyAtk,
                    enemy_def: newEnemyDef,
                    hp_reward: newHpReward,
                    atk_reward: newAtkReward,
                    def_reward: newDefReward,
                    points_reward: newPointsReward
                };

                const updateCallback = (updateStatus, updateData) => {
                    console.log("updateStatus:", updateStatus);
                    console.log("updateData:", updateData);
                    if (updateStatus === 200) {
                        console.log("Quest updated successfully!");
                        warningText.style.display = 'block'
                        warningText.innerText = "Quest Updated Successfully";

                        // Redirect to quests.html after 2 seconds
                        setTimeout(() => {
                            warningText.style.display = 'none'
                            window.location.href = "quests.html";
                        }, 2000);
                    } else {
                        warningText.style.display = 'block'
                        warningText.innerText = "Error.";
                        setTimeout(() => {
                            warningText.style.display = 'none'
                            window.location.href = "quests.html";
                        }, 2000);
                    }
                };

                fetchMethod(currentUrl + `/api/quests/${quest_id}`, updateCallback, "PUT", data);
                updateQuestForm.reset();
            } else {
                // Token verification failed, handle error
                warningCard.classList.remove("d-none");
                warningText.innerText = "Invalid Token.";
            }
        }, "GET", null, token);
    });
});
