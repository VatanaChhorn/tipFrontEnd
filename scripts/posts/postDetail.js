var postID = sessionStorage.getItem("postID");
var currentUser = JSON.parse(localStorage.getItem("currentUser"));
var category = JSON.parse(sessionStorage.getItem('category'));

// MARK: - VIEW CREATOR
function renderContent(data) {
    const contentContainer = document.getElementById('contentContainer');
    contentContainer.innerHTML = `
        <span class="badge rounded-pill text-bg-info mb-2">${capitalizeFirstLetter(category.title)}</span>
        <span class="badge rounded-pill text-bg-success mb-2">${data.date}</span>
        <h2>${capitalizeFirstLetter(data.title)}</h2>
        <h6 class="card-subtitle mb-2 text-body-secondary">By ${capitalizeFirstLetter(data.author)}</h6>
        <p class="card-text">${data.content}</p>
    `;
}

function renderComments(comments) {
    const commentsList = document.getElementById('commentsList');
    commentsList.innerHTML = '';
    comments.forEach(async comment => {
        const card = document.createElement('div');
        var user = await getUserById(comment.user_id);
        comment.author = user.data.username;
        comment.date = getDateMonthYear(comment.created_time);

        card.classList.add('card', 'mb-2');
        card.innerHTML = `
            <div class="card-body">
                <h6 class="card-title">${capitalizeFirstLetter(comment.author)}</h6>
                <p class="card-subtitle mb-2 text-body-secondary">On ${comment.date}</p>
                <p class="card-text">${capitalizeFirstLetter(comment.content)}</p>
            </div>
        `;
        commentsList.appendChild(card);
    });
}

document.getElementById('postButton').addEventListener('click', async function () {
    const commentInput = document.getElementById('commentInput');
    const commentText = commentInput.value.trim();
    if (commentText !== '') {
        const newComment = {
            user_id: currentUser._id,
            post_id: postID,
            content: commentText
        };
        await createComment(newComment);
        fetchCommentsData(postID);
        commentInput.value = '';
    }
});

// MARK: - NETWORKING
async function fetchPostData(postId) {
    try {
        const response = await fetch(`http://localhost:30002/post/${postId}`);
        var data = await response.json();
        var user = await getUserById(data.user_id);
        data.author = user.data.username;
        data.date = getDateMonthYear(data.created_time);
        renderContent(data);
    } catch (error) {
        alert('Error fetching post data:' + error);
        renderContent([]);
    }
}

async function fetchCommentsData(postId) {
    try {
        const response = await fetch(`http://localhost:30002/comment/${postId}`);
        const data = await response.json();
        const sortedComments = data.data.sort((a, b) => {
            if (capitalizeFirstLetter(a.created_time) < capitalizeFirstLetter(b.created_time)) return 1;
            if (capitalizeFirstLetter(a.created_time) > capitalizeFirstLetter(b.created_time)) return -1;
            return 0;
        });
        renderComments(sortedComments);
    } catch (error) {
        console.error('Error fetching comments data:', error);
    }
}

async function createComment(commentData) {
    try {
        const response = await fetch('http://localhost:30002/comment/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(commentData)
        });
        const responseData = await response.json();
        console.log('Comment created successfully:', responseData);
    } catch (error) {
        console.error('Error creating comment:', error);
    }
}

async function getUserById(id) {
    try {
        const response = await fetch(`http://localhost:30002/auth/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        const userData = await response.json();
        return userData;
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
}
// MARK: - HELPER FUNCTIONS
function getMonthName(monthNumber) {
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    return months[monthNumber - 1];
}

function getDateMonthYear(dateString) {
    const dateObject = new Date(dateString);
    const date = dateObject.getDate();
    const month = getMonthName(dateObject.getMonth() + 1);
    const year = dateObject.getFullYear();
    return date + " " + month + ", " + year
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// MARK: - INIT
function init() {
    fetchPostData(postID);
    fetchCommentsData(postID);
}

window.onload = init; 