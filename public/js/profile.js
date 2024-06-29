document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    const warningText = document.createElement("div");
            warningText.className = "alert alert-warning";
            warningText.style.display = 'none';
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

    const verifyTokenCallback = async (verifyStatus, verifyData) => {    
        if(verifyStatus === 200) {
            console.log("Token Verification Status:", verifyStatus);
            console.log("Token Verification Data:", verifyData);

            const walletByUserIdPromise = new Promise((resolve, reject) => {
                const walletByUserIdCallBack = (walletStatus, walletData) => {
                    if (walletStatus === 200) {
                        resolve(walletData.points_balance);
                    } else {
                        reject("No user found.");
                    }
                };
                fetchMethod(currentUrl + `/api/wallets/${verifyData.user_id}`, walletByUserIdCallBack);
            });
    
            let points_balance;
            try {
                points_balance = await walletByUserIdPromise;
            } catch (error) {
                console.error(error)
            }
            
            const displayUser = document.createElement('div');
            const userCallBack = (userStatus, userData) => {
                console.log("User Status:", userStatus);
                console.log("User Data:", userData);
                const userProfile = document.getElementById("userProfile");
                userProfile.innerHTML = "";
                userProfile.appendChild(warningText)

                displayUser.className = 'col-xl-6 col-lg-6 col-md-8 col-sm-10 col-xs-10 mb-4 position-relative';
                // Using template literals for inner HTML with Bootstrap classes
                displayUser.innerHTML = `
                    <div class="card" id="userCard">
                        <div class="card-body">
                            <h5 class="card-title">User Information</h5>
                            <p class="card-text" style="text-transform: UPPERCASE;">Role: ${verifyData.role}</p>
                            <p class="card-text">User ID: ${userData.user_id}</p>
                            <p class="card-text">User Name: ${userData.username}</p>
                            <p class="card-text">Current Points Balnace: <span style="color: orange;">${points_balance}</span></p>
                            <p class="card-text">Email: ${userData.email}  <button class="btn btn-sm emailUpdateButton"><i class="fas fa-edit fa-lg" style="color: green;"></i></button></p> 
                            <p class="card-text">Created On: ${userData.created_on}</p>
                            <p class="card-text">Updated On: ${userData.updated_on}</p>
                            <p class="card-text">Last Login: ${userData.last_login_on}</p>
                            <p class="card-text"><button type="button" class="btn btn-info btn-small updatePasswordButton">Update Password?</button></p>
                        </div>
                    </div>
                `;

                // Append the displayUser div to the document body or any other container
                userProfile.appendChild(displayUser);

                const updateButton = displayUser.querySelector(".emailUpdateButton"); // Add this line
                // Add event listener for update button
                updateButton.addEventListener("click", function (event) {
                    event.preventDefault()
                    // Show the custom popup for updating
                    const updateConfirmationPopup = document.getElementById("updateConfirmationPopup");
                    updateConfirmationPopup.style.display = "block";
                    document.getElementById('emailInput').defaultValue = `${userData.email}`
                    document.getElementById('usernameInput').defaultValue  = `${userData.username}`
                    let data;
                    // Add event listener for confirm update button
                    const confirmUpdateButton = document.getElementById("confirmUpdate");
                    confirmUpdateButton.addEventListener("click", () => {
                        // Fetch API to update Email (similar to delete logic)
                        data = {
                            user_id: verifyData.user_id,
                            email: document.getElementById('emailInput').value,
                            username: document.getElementById('usernameInput').value,
                        }

                        if(data.email === '' || data.username === '') {
                            warningText.style.display = 'block';
                            warningText.className = "alert alert-danger";
                            warningText.innerHTML = `Fill the all field.`;
                            updateConfirmationPopup.style.display = "none";
                            setTimeout(() => {
                                warningText.style.display = "none"   
                            }, 2000)
                            return;
                        }
                        updateConfirmationPopup.style.display = "none";
                        const updateEmailCallback = (updateStatus, updateData) => {
                            if (updateStatus === 200) {
                                console.log("Email updated successfully.")
                                updateConfirmationPopup.style.display = "none";
                                warningText.style.display = 'block';
                                warningText.className = "alert alert-success";
                                warningText.innerHTML = `Email updated successfully.`;
                                setTimeout(() => {
                                    warningText.style.display = "none";
                                }, 2000)
                            } else {
                                console.error("Error updating Email. Unexpected response:", updateData);
                                warningText.style.display = 'block';
                                warningText.className = "alert alert-danger";
                                warningText.innerHTML = updateData.message;
                                setTimeout(() => {
                                    warningText.style.display = "none"
                                }, 2000)
                            }
                        };

                        // Fetch the update API
                        fetchMethod(currentUrl + `/api/users/${verifyData.user_id}`, updateEmailCallback, "PUT", data);
                    });

                    // Add event listener for cancel update button
                    const cancelUpdateButton = document.getElementById("cancelUpdate");
                    cancelUpdateButton.addEventListener("click", () => {
                        // Hide the update popup without updating the email
                        updateConfirmationPopup.style.display = "none";
                    });
                });

                const updatePasswordButton = displayUser.querySelector('.updatePasswordButton')
                const passwordForm = document.getElementById('updatePasswordForm');
                updatePasswordButton.addEventListener('click', () => {
                    const submitButton = document.getElementById('submitUpdatePasswordForm');
                    const cancelButton = document.getElementById('cancelUpdatePasswordForm');
                    passwordForm.className = passwordForm.className === 'd-none' ? 'd-block' : 'd-none';
                    
                    submitButton.addEventListener('click', (event) => {
                        event.preventDefault(); // Prevent form submission

                        const oldPassword = document.getElementById('oldPassword').value;
                        const newPassword = document.getElementById('newPassword').value;
                        const confirmNewPassword = document.getElementById('confirmNewPassword').value;
                        
                        const data = {
                            user_id: verifyData.user_id,
                            oldPassword: oldPassword,
                            newPassword: newPassword
                        }
                
                        if (newPassword !== confirmNewPassword) {
                            warningText.style.display = 'block';
                            warningText.className = 'alert alert-warning';
                            warningText.innerHTML = 'Password do not match';
                            setTimeout(() => {
                                warningText.style.display = 'none';
                            }, 2000);
                        } else {
                            const updatePasswordCallBack = (updatePasswordStatus, updatePasswordData) => {
                                if (updatePasswordStatus === 201) {
                                    warningText.style.display = 'block';
                                    warningText.className = 'alert alert-success';
                                    warningText.innerHTML = updatePasswordData.message;
                                    setTimeout(() => {
                                        warningText.style.display = 'none';
                                        localStorage.removeItem('token');
                                        // Redirect to the login page
                                        window.location.href = '/login.html';
                                    }, 2000);
                                } else {
                                    warningText.style.display = 'block';
                                    warningText.className = 'alert alert-warning';
                                    warningText.innerHTML = updatePasswordData.message;
                                    setTimeout(() => {
                                        warningText.style.display = 'none';
                                    }, 2000);
                                }
                            }
                            fetchMethod(currentUrl + `/api/users/password/${verifyData.user_id}`, updatePasswordCallBack, "PUT", data);
                        }
                    })

                    cancelButton.addEventListener('click', (event) => {
                        passwordForm.className = 'd-none';
                    })
                })
                
            };
            fetchMethod(currentUrl + `/api/users/${verifyData.user_id}`, userCallBack)
        }  else {
            const userProfile = document.getElementById("userProfile");
            userProfile.innerHTML = "";
            userProfile.appendChild(warningText)
            warningText.style.display = 'block';
            warningText.innerHTML = "Please Login first."
            setTimeout(()=> {
                warningText.style.display = 'none';
            }, 3000)
        }
    }   
    fetchMethod(currentUrl + "/api/jwt/verify/", verifyTokenCallback, "GET", null, token);
})
