document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    const verifyTokenCallback = (verifyStatus, verifyData) => {
        console.log("Token Verification Status:", verifyStatus);
        console.log("Token Verification Data:", verifyData);

        const newsfeedCallBack = async (newsfeedStatus, newsfeedData) => {
            console.log("Newsfeed Status:", newsfeedStatus);
            console.log("Newsfeed Data:", newsfeedData);

            const newsfeedsList = document.getElementById("newsfeedsList");
            newsfeedsList.innerHTML = "";

            const warningText = document.createElement("div");
            warningText.className = "alert";
            newsfeedsList.appendChild(warningText);
            
            if(newsfeedData === 0 ) {
                warningText.classList.add("alert-danger");
                warningText.innerHTML = `No posts found.`;
            }

            newsfeedData.forEach(async (post) => {
                const userPromise = new Promise((resolve, reject) => {
                    const userCallBack = (userStatus, userData) => {
                        if (userStatus === 200) {
                            resolve(userData.username);
                        } else {
                            reject("No user data");
                        }
                    };

                    fetchMethod(currentUrl + `/api/users/${post.user_id}`, userCallBack);
                });

                try {
                    const username = await userPromise;
                    const displayItem = document.createElement("div");
                    displayItem.className = "col-12 mb-4 position-relative";

                    if (verifyData.user_id === post.user_id) {
                        displayItem.classList.add('text-end');
                    } else {
                        displayItem.classList.add('text-start');
                    }
                    
                    const justifyContentClass = verifyData.user_id === post.user_id ? 'justify-content-end' : 'justify-content-start';

                    displayItem.innerHTML = `
                        <div class="section">
                            <div class="card-body px-3">
                                <p class="card-text">
                                <div class="d-flex ${justifyContentClass}">
                                <i class="fa-solid fa-user"></i>&nbsp;&nbsp;${username}&nbsp;&nbsp;<span style="color: crimson;">${post.post_date}</span>
                                ${verifyStatus === 200 && (verifyData.role === 'admin' || verifyData.user_id === post.user_id) ? `
                                <div class="edit-delete-buttons mx-2">
                                    <a href="updatePost.html?newsfeed_id=${post.newsfeed_id}" class="btn btn-secondary btn-sm"><i class="fas fa-edit"></i></a>
                                    <button class="btn btn-danger btn-sm delete-button" data-newsfeed-id="${post.newsfeed_id}">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                </div>
                                ` : ``}   
                                </div>
                                    <span>Title:</span> <span style="text-transform: uppercase">${post.post_title}</span> <br>
                                    <span style="color: green;"></span> <br> ${post.post_content} <br> 
                                </p>
                                <div class="comment-button-container">
                                    <a href="comment.html?newsfeed_id=${post.newsfeed_id}" class="btn btn-primary btn-sm comment-button" data-newsfeed-id="${post.newsfeed_id}">
                                        <i class="fas fa-comment"></i> Comment
                                    </a>
                                </div>                         
                            </div>
                        </div>
                    `;

                    newsfeedsList.appendChild(displayItem);


                    if (verifyStatus === 200 && verifyData.user_id === post.user_id) {
                        const deleteButton = displayItem.querySelector(".delete-button");
                        deleteButton.addEventListener("click", () => {
                            // Show the custom popup
                            const confirmationPopup = document.getElementById("confirmationPopup");
                            confirmationPopup.style.display = "block";

                            // Add event listener for confirm delete button
                            const confirmDeleteButton = document.getElementById("confirmDelete");
                            confirmDeleteButton.addEventListener("click", () => {
                                // Fetch API to delete Post
                                const deletePostCallback = (deleteStatus, deleteData) => {
                                    if (deleteStatus === 204) {
                                        // Eliminate the need for alert and simply reload the page
                                        console.log("Post deleted successfully.")
                                        confirmationPopup.style.display = "none";
                                        setTimeout(() => location.reload(), 2000);
                                    } else {
                                        console.error("Error deleting task. Unexpected response:", deleteData);
                                        alert("Error deleting post. Check console for details.");
                                    }
                                };

                                // Fetch the delete API
                                fetchMethod(currentUrl + `/api/newsfeeds/${post.newsfeed_id}/${verifyData.user_id}`, deletePostCallback, "DELETE");
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
            if( verifyStatus === 200 ) {
                const addPost = document.getElementById("addPost");
                const addPostDiv = document.createElement("div");
                addPostDiv.className =
                  "col-12 d-block align-items-center";
                  addPostDiv.innerHTML = `
                  <div class="form-container mb-2">
                      <h2>What is on your mind?</h2>
                      <button type="button" class="btn btn-primary float-end" id="addPostButton"><i class="fa-solid fa-paper-plane"></i></button>
                      <!-- Warning message container -->
                      <div id="warningMessage" class="mb-3 text-danger"></div>
                      
                      <form id="postForm">
                          <div class="mb-3">
                              <label for="postTitle" class="form-label">Post Title:</label>
                              <input type="text" class="form-control" id="postTitle" required>
                          </div>
                          <div class="mb-3">
                              <label for="postContent" class="form-label">Post Content:</label>
                              <textarea class="form-control" id="postContent" rows="1" required></textarea>
                          </div>
                      </form>
                  </div>
              `;              
                addPost.appendChild(addPostDiv)
    
                const addPostButton = document.getElementById('addPostButton');
                addPostButton.addEventListener("click", () => {
                    const post_title = document.getElementById("postTitle").value;
                    const post_content = document.getElementById("postContent").value;
                    const data = {
                        user_id: verifyData.user_id,
                        post_title: post_title,
                        post_content: post_content,
                    }
                    const addPostCallBack = (addPostStatus, addPostData) => {
                        console.log("Add Post Status:", addPostStatus);
                        console.log("Add Post Data:", addPostData);
                        const warningMessage = document.getElementById("warningMessage");
    
                        if (addPostStatus === 201) {
                            // Post creation successful
                            warningMessage.textContent = "Post created successfully!";
                            
                            // Refresh the page after 2 seconds
                            setTimeout(() => {
                                location.reload();
                            }, 2000);
                        } else if (addPostStatus === 404){
                            warningMessage.textContent = "User not Found"
                        }else {
                            // Display error message if Post creation fails
                            warningMessage.textContent = "Post creation failed. Please try again.";
                        }
                    }
                    fetchMethod(currentUrl + "/api/newsfeeds/", addPostCallBack, "POST", data)
                })
            }
        }
        fetchMethod(currentUrl + "/api/newsfeeds/", newsfeedCallBack);
    }
    fetchMethod(currentUrl + "/api/jwt/verify/", verifyTokenCallback, "GET", null, token);
});
