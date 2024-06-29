document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    const url = new URL(document.URL);
    const urlParams = url.searchParams;
    const newsfeed_id = urlParams.get("newsfeed_id");
    const commentTitle = document.getElementById("comment-title"); // Corrected id

    const callBackForOldPost = (oldPostStatus, oldPostData) => {
        if(oldPostStatus === 404) {
            console.log(oldPostData.message)
        } else if (oldPostStatus === 200 ) {
            const oldPost = document.getElementById("oldPost");
            oldPost.innerHTML = "";

            const post = document.createElement("div");
            post.className = "col12 mb-4 position-relative";
            post.innerHTML = `
            <div class="card thread-card">
                            <div class="card-body">
                                <h5 class="card-title">Post ID: ${oldPostData.newsfeed_id}</h5>
                                <p class="card-text">
                                    <span>Title:</span> <span style=" ; text-transform= upppercase">${oldPostData.post_title}</span> <br>
                                    <span>Updated Time:</span> 
                                    <span style="color: crimson; ;">${oldPostData.post_date}</span> <br><br>
                                    <span style="color: green; ;">POST</span> <br> ${oldPostData.post_content} <br>
                                </p>
                            </div>
                        </div>
            `
            oldPost.appendChild(post)
        }
    }
    fetchMethod(currentUrl + `/api/newsfeeds/${newsfeed_id}`, callBackForOldPost)
    commentTitle.innerHTML = `Comments For Post ${newsfeed_id}`
    const verifyTokenCallback = (verifyStatus, verifyData) => {
        console.log("Token Verification Status:", verifyStatus);
        console.log("Token Verification Data:", verifyData);

        const commentCallBack = async (commentStatus, commentData) => {
            console.log("comment Status:", commentStatus);
            console.log("comment Data:", commentData);
            const commentsList = document.getElementById("commentsList");
            commentsList.innerHTML = "";

            const warningText = document.createElement("div");
            warningText.className = "alert";
            commentsList.appendChild(warningText);
            
            if(commentData.length === 0 ) {
                warningText.classList.add("alert-danger");
                warningText.innerHTML = `No comment found for the Post ${newsfeed_id}`;
            }

            commentData.forEach(async (comment) => {
                const userPromise = new Promise((resolve, reject) => {
                    const userCallBack = (userStatus, userData) => {
                        if (userStatus === 200) {
                            resolve(userData.username);
                        } else {
                            reject("No user data");
                        }
                    };

                    fetchMethod(currentUrl + `/api/users/${comment.user_id}`, userCallBack);
                });

                try {
                    let username = await userPromise;
                    const displayItem = document.createElement("div");
                    displayItem.className =
                        "col12 mb-4 position-relative";

                    displayItem.innerHTML = `
                        <div class="card thread-card">
                            <div class="card-body">
                                <h5 class="card-title">Comment ID: ${comment.comment_id}</h5>
                                <p class="card-text">
                                    <span style="color: black; ">Username:</span> ${username} <br>
                                    <span style="color: green; ">COMMENT</span> <br> ${comment.comment_content} <br>
                                </p>
                                ${verifyStatus === 200 &&  (verifyData.role === 'admin' || verifyData.user_id === comment.user_id) ? `
                                    <div class="edit-delete-buttons position-absolute top-0 end-0 p-2">
                                        <button class="btn btn-secondary btn-sm update-button" data-comment-id="${comment.comment_id}">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-danger btn-sm delete-button" data-comment-id="${comment.comment_id}">
                                            <i class="fas fa-trash-alt"></i>
                                        </button>
                                    </div>
                                ` : ``}
                            </div>
                        </div>
                    `;
                    commentsList.appendChild(displayItem);

                    if (verifyStatus === 200 && verifyData.user_id === comment.user_id) {

                        const updateButton = displayItem.querySelector(".update-button"); // Add this line

                        // Add event listener for update button
                        updateButton.addEventListener("click", () => {
                            // Show the custom popup for updating
                            const updateConfirmationPopup = document.getElementById("updateConfirmationPopup");
                            updateConfirmationPopup.style.display = "block";
                            
                            let data;
                            // Add event listener for confirm update button
                            const confirmUpdateButton = document.getElementById("confirmUpdate");
                            confirmUpdateButton.addEventListener("click", () => {
                                data = {
                                    comment_id: comment.comment_id,
                                    comment_content: document.getElementById('commentInput').value
                                }
                                // Fetch API to update Comment (similar to delete logic)
                                const updateCommentCallback = (updateStatus, updateData) => {
                                    if (updateStatus === 201) {
                                        console.log("Comment updated successfully.")
                                        updateConfirmationPopup.style.display = "none";
                                        // You may want to handle further actions after update
                                        setTimeout(() => location.reload(), 2000);
                                    } else {
                                        console.error("Error updating Comment. Unexpected response:", updateData);
                                        warningText.classList.add("alert-danger");
                                        warningText.innerHTML = `Error updating Comment. Check console for details.`;
                                        setTimeout(() => {
                                            warningText.style.display = "none"
                                        }, 2000)
                                    }
                                };

                                // Fetch the update API
                                fetchMethod(currentUrl + `/api/comments/${comment.comment_id}`, updateCommentCallback, "PUT", data);
                            });

                            // Add event listener for cancel update button
                            const cancelUpdateButton = document.getElementById("cancelUpdate");
                            cancelUpdateButton.addEventListener("click", () => {
                                // Hide the update popup without updating the comment
                                updateConfirmationPopup.style.display = "none";
                            });
                        });


                        const deleteButton = displayItem.querySelector(".delete-button");
                        deleteButton.addEventListener("click", () => {
                            // Show the custom popup
                            const confirmationPopup = document.getElementById("confirmationPopup");
                            confirmationPopup.style.display = "block";

                            // Add event listener for confirm delete button
                            const confirmDeleteButton = document.getElementById("confirmDelete");
                            confirmDeleteButton.addEventListener("click", () => {
                                // Fetch API to delete Comment
                                const deleteCommentCallback = (deleteStatus, deleteData) => {
                                    if (deleteStatus === 204) {
                                        // Eliminate the need for alert and simply reload the page
                                        console.log("Comment deleted successfully.")
                                        confirmationPopup.style.display = "none";
                                        setTimeout(() => location.reload(), 2000);
                                    } else {
                                        console.error("Error deleting Comment. Unexpected response:", deleteData);
                                        warningText.classList.add("alert-danger");
                                        warningText.innerHTML = `Error deleting Comment. Check console for details.`;
                                    }
                                };

                                // Fetch the delete API
                                fetchMethod(currentUrl + `/api/comments/${comment.comment_id}/${verifyData.user_id}`, deleteCommentCallback, "DELETE");
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
            if (verifyStatus === 200) {
                const addComment = document.getElementById("addComment");
                const addCommentDiv = document.createElement("div");
                addCommentDiv.className =
                    "col-12 mb-4 d-block align-items-center";
                addCommentDiv.innerHTML = `
                    <div class="form-container mb-2">
                        <h2>Create a New Comment</h2>
                        
                        <!-- Warning message container -->
                        <div id="warningMessage" class="mb-3 text-danger"></div>
                        
                        <form id="commentForm">
                            <div class="mb-3">
                                <label for="commentContent" class="form-label">Comment Content:</label>
                                <textarea class="form-control" id="commentContent" rows="4" required></textarea>
                            </div>
                            <button type="button" class="btn btn-primary" id="addCommentButton">Create Comment</button>
                        </form>
                    </div>
                `;              
                addComment.appendChild(addCommentDiv)

                const addCommentButton = document.getElementById('addCommentButton');
                addCommentButton.addEventListener("click", () => {
                    const comment_content = document.getElementById("commentContent").value;
                    const data = {
                        user_id: verifyData.user_id,
                        newsfeed_id: newsfeed_id,
                        comment_content: comment_content,
                    }
                    const addCommentCallBack = (addCommentStatus, addCommentData) => {
                        console.log("Add Comment Status:", addCommentStatus);
                        console.log("Add Comment Data:", addCommentData);
                        const warningMessage = document.getElementById("warningMessage");

                        if (addCommentStatus === 201) {
                            // Comment creation successful
                            warningMessage.textContent = "Comment created successfully!";
                            
                            // Refresh the page after 2 seconds
                            setTimeout(() => {
                                location.reload();
                            }, 2000);
                        } else if (addCommentStatus === 404) {
                            warningMessage.textContent = "User not Found";
                        } else {
                            // Display error message if Comment creation fails
                            warningMessage.textContent = "Comment creation failed. Please try again.";
                        }
                    }
                    fetchMethod(currentUrl + "/api/comments/", addCommentCallBack, "POST", data)
                })
            }
        }
        fetchMethod(currentUrl + `/api/comments/${newsfeed_id}`, commentCallBack);
    }
    fetchMethod(currentUrl + "/api/jwt/verify/", verifyTokenCallback, "GET", null, token);
});
