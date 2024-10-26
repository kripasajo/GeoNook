// Retrieve tasks from localStorage or initialize an empty array
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Display tasks on page load
document.addEventListener("DOMContentLoaded", displayTasks);

// Function to toggle between sections
function showSection(sectionId) {
    document.getElementById("task-menu").style.display = sectionId === "task-menu" ? "block" : "none";
    document.getElementById("proximity-check").style.display = sectionId === "proximity-check" ? "block" : "none";
}

// Event listener to display task form when clicking "Add New Task" button
document.getElementById("new-task-btn").addEventListener("click", () => {
    const taskForm = document.getElementById("task-form");
    taskForm.style.display = taskForm.style.display === "none" ? "block" : "none";
});

// Event listener to add a new task when form is submitted
document.getElementById("task-form").addEventListener("submit", function(e) {
    e.preventDefault();
    const task = document.getElementById("task").value;
    const lat = parseFloat(document.getElementById("latitude").value);
    const lon = parseFloat(document.getElementById("longitude").value);

    if (task && !isNaN(lat) && !isNaN(lon)) {
        tasks.push({ task, location: [lat, lon] });
        saveTasks();
        displayTasks();
        document.getElementById("task").value = ''; // Clear task input field
        document.getElementById("latitude").value = ''; // Clear latitude input field
        document.getElementById("longitude").value = ''; // Clear longitude input field
        document.getElementById("task-form").style.display = "none"; // Hide task form after adding task
    } else {
        alert("Please enter valid task and location coordinates.");
    }
});

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Display tasks in the task list
function displayTasks() {
    const taskList = document.getElementById("task-list");
    taskList.innerHTML = "";
    tasks.forEach((taskItem, index) => {
        const li = document.createElement("li");
        li.textContent = `${taskItem.task} - Location: (${taskItem.location[0]}, ${taskItem.location[1]})`;

        // Delete button
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.classList.add("delete-btn");
        deleteButton.onclick = () => {
            tasks.splice(index, 1);
            saveTasks();
            displayTasks();
        };
        li.appendChild(deleteButton);

        taskList.appendChild(li);
    });
}






// Initialize the map with a default view
const map = L.map('map').setView([20.5937, 78.9629], 5); // Default location: center of India

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Marker to show the selected location
let marker;

// Event listener to update latitude and longitude on map click
map.on('click', function(e) {
    const { lat, lng } = e.latlng;

    // Remove the old marker if it exists
    if (marker) {
        map.removeLayer(marker);
    }

    // Add a new marker at the clicked location
    marker = L.marker([lat, lng]).addTo(map);

    // Update the form fields with selected latitude and longitude
    document.getElementById("latitude").value = lat.toFixed(5);
    document.getElementById("longitude").value = lng.toFixed(5);
});
//





// Start proximity check for tasks
function startProximityCheck() {
    if ("geolocation" in navigator) {
        navigator.geolocation.watchPosition((position) => {
            const userLat = position.coords.latitude;
            const userLon = position.coords.longitude;

            tasks.forEach(taskItem => {
                const [taskLat, taskLon] = taskItem.location;
                const distance = getDistance(userLat, userLon, taskLat, taskLon);

                if (distance < 0.5) {  // 0.5 km threshold for proximity
                    showPopup(`Reminder: ${taskItem.task} is nearby!`);
                }
            });
        });
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}

// Calculate distance between two points (Haversine formula)
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Show a popup notification with a given message
function showPopup(message) {
    // Set the message content
    document.getElementById("popup-message").textContent = message;
    // Display the modal
    document.getElementById("popup-modal").style.display = "block";
}

// Close the popup modal
function closeModal() {
    document.getElementById("popup-modal").style.display = "none";
}
