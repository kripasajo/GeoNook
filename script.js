/// Retrieve tasks from localStorage or initialize an empty array
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










// Add an event listener to the search button
document.getElementById("search-btn").addEventListener("click", function() {
    const locationInput = document.getElementById("location-input").value;

    if (locationInput) {
        getCoordinates(locationInput);
    } else {
        alert("Please enter a location.");
    }
});

// Function to get coordinates from a location input using Nominatim API
function getCoordinates(location) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);

                // Set the latitude and longitude input fields
                document.getElementById("latitude").value = lat.toFixed(5);
                document.getElementById("longitude").value = lon.toFixed(5);

                // Optionally, you can center the map to this location
                map.setView([lat, lon], 13); // Adjust the zoom level as necessary
                if (currentLocationMarker) {
                    map.removeLayer(currentLocationMarker); // Remove old marker if it exists
                }
                currentLocationMarker = L.marker([lat, lon]).addTo(map);
                currentLocationMarker.bindPopup(`Location: ${location}`).openPopup();
            } else {
                alert("Location not found. Please try again.");
            }
        })
        .catch(error => {
            console.error("Error fetching coordinates:", error);
            alert("An error occurred while fetching the location.");
        });
}











// Location autocomplete feature
const suggestionsDiv = document.getElementById("suggestions");

// Event listener for the location input to fetch suggestions
document.getElementById("location-input").addEventListener("input", function() {
    const locationInput = this.value;

    if (locationInput.length > 2) { // Only fetch suggestions if input is more than 2 characters
        fetchSuggestions(locationInput);
    } else {
        suggestionsDiv.innerHTML = ""; // Clear suggestions if input is too short
        suggestionsDiv.style.display = "none"; // Hide suggestions
    }
});

// Function to fetch location suggestions from Nominatim API
function fetchSuggestions(query) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(query)}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            suggestionsDiv.innerHTML = ""; // Clear existing suggestions
            if (data.length > 0) {
                data.forEach(item => {
                    const div = document.createElement("div");
                    div.classList.add("suggestion-item");
                    div.textContent = item.display_name; // Display name from API
                    div.onclick = () => {
                        // When a suggestion is clicked, set the value of the input
                        document.getElementById("location-input").value = item.display_name;
                        document.getElementById("latitude").value = item.lat;
                        document.getElementById("longitude").value = item.lon;

                        // Optionally, center the map to this location
                        map.setView([item.lat, item.lon], 13);
                        if (currentLocationMarker) {
                            map.removeLayer(currentLocationMarker);
                        }
                        currentLocationMarker = L.marker([item.lat, item.lon]).addTo(map);
                        currentLocationMarker.bindPopup(`Location: ${item.display_name}`).openPopup();

                        suggestionsDiv.innerHTML = ""; // Clear suggestions after selection
                        suggestionsDiv.style.display = "none"; // Hide suggestions
                    };
                    suggestionsDiv.appendChild(div); // Add suggestion to suggestions div
                });
                suggestionsDiv.style.display = "block"; // Show suggestions
            } else {
                suggestionsDiv.style.display = "none"; // Hide suggestions if no results
            }
        })
        .catch(error => {
            console.error("Error fetching suggestions:", error);
            suggestionsDiv.style.display = "none"; // Hide suggestions on error
        });
}

// Hide suggestions when clicking outside
document.addEventListener("click", function(event) {
    if (!suggestionsDiv.contains(event.target) && event.target.id !== "location-input") {
        suggestionsDiv.innerHTML = ""; // Clear suggestions
        suggestionsDiv.style.display = "none"; // Hide suggestions
    }
});

















// Assuming you have a function to add tasks to the list
function addTaskToDOM(task) {
    const taskListElement = document.getElementById("task-list");
    const listItem = document.createElement("li");
    listItem.id = `task-${task.id}`; // Set unique ID for each task
    listItem.textContent = task.name;
    taskListElement.appendChild(listItem);
}

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



// Function to display the current location
function displayCurrentLocation() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                document.getElementById("location-display").textContent = `Latitude: ${lat.toFixed(5)}, Longitude: ${lon.toFixed(5)}`;
            }, 
            (error) => {
                console.error("Error fetching location:", error);
                document.getElementById("location-display").textContent = "Unable to retrieve location.";
                if (error.code === error.PERMISSION_DENIED) {
                    alert("Please allow location access for this app to work properly.");
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    alert("Location information is unavailable.");
                } else if (error.code === error.TIMEOUT) {
                    alert("The request to get user location timed out.");
                } else {
                    alert("An unknown error occurred.");
                }
            }
        );
    } else {
        document.getElementById("location-display").textContent = "Geolocation is not supported by your browser.";
    }
}


// Start proximity check for tasks
function startProximityCheck() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLon = position.coords.longitude;
                
                tasks.forEach((task, index) => {
                    const distance = getDistance(userLat, userLon, task.location[0], task.location[1]);
                    if (distance < 0.5) { // Assuming 0.5 km as proximity threshold
                        showNotification(`Reminder: ${task.task} is at proximity`, index);
                    }
                });
            },
            (error) => {
                console.error("Error fetching location:", error);
                alert("Could not retrieve location.");
            }
        );
    } else {
        alert("Geolocation not supported by this browser.");
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

let currentTaskId = null; // To keep track of the task in notification

// Show notification for a specific task
function showNotification(message, taskId) {
    document.getElementById("popup-message").textContent = message;
    document.getElementById("popup-modal").style.display = "block";
    currentTaskId = taskId; // Store the current task ID to mark it done later
}


// Function to mark task as done (remove from task list)
function markTaskDone() {
    closeModal();

    if (currentTaskId !== null) {
        tasks.splice(currentTaskId, 1); // Remove task from array
        saveTasks(); // Update localStorage
        displayTasks(); // Update task list display
    }

    currentTaskId = null;
}


// Close modal function
function closeModal() {
    document.getElementById("popup-modal").style.display = "none";
}



