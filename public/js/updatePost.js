document.addEventListener("DOMContentLoaded", function () {
    const updatePostForm = document.getElementById("updatePostForm");
    const warningCard = document.getElementById("warningCard");
    const warningText = document.getElementById("warningText");
    const url = new URL(document.URL);
    const urlParams = url.searchParams;
    const newsfeed_id = urlParams.get("newsfeed_id");
    const postTitle = document.getElementById("post-title"); // Corrected id

    let currentPost; // Define characterName outside the functions

    const callbackForCurrentPost = (responseStatus, responseData) => {
        console.log("responseStatus:", responseStatus);
        console.log("responseData:", responseData);
        currentPost = responseData;
        postTitle.innerHTML = `Editing Post ${currentPost.newsfeed_id}`;

        // Set the default values for form fields
        document.getElementById("newTitle").value = currentPost.post_title;
        document.getElementById("newContent").value = currentPost.post_content;
    };
    fetchMethod(currentUrl + `/api/newsfeeds/${newsfeed_id}`, callbackForCurrentPost);

    updatePostForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const newTitle = document.getElementById("newTitle").value;
        const newContent = document.getElementById("newContent").value;

        // Perform JWT token verification
        const token = localStorage.getItem("token");
        fetchMethod(currentUrl + "/api/jwt/verify", (verifyStatus, verifyData) => {
            if (verifyStatus === 200) {
                // Token is valid, proceed with the update
                // Positive points proceed
                console.log("Update successful");
                console.log("newsfeed_id:", newsfeed_id);
                console.log("newTitle:", newTitle);
                console.log("newContent:", newContent);

                warningCard.classList.add("d-none");

                const data = {
                    newsfeed_id: newsfeed_id,
                    post_title: newTitle,
                    post_content: newContent
                };

                const callback = (responseStatus, responseData) => {
                    console.log("responseStatus:", responseStatus);
                    console.log("responseData:", responseData);
                    if (responseStatus === 201) {
                        // Check if update was successful
                        console.log("Task updated successfully!");
                        warningCard.classList.remove("d-none");
                        warningText.innerText = "Post Updated Successfully";

                        // Redirect to index.html
                        setTimeout(() => {
                            window.location.href = "newsfeed.html";
                        }, 2000); // Redirect after 2 seconds (adjust as needed)
                    } else {
                        warningCard.classList.remove("d-none");
                        warningText.innerText = "Error.";
                    }
                };

                // Perform task update request
                fetchMethod(currentUrl + `/api/newsfeeds/${newsfeed_id}`, callback, "PUT", data);
                // Reset the form fields
                updatePostForm.reset();
            } else {
                // Token verification failed, handle error
                warningCard.classList.remove("d-none");
                warningText.innerText = "Invalid Token.";
            }
        }, "GET", null, token);
    });
});
