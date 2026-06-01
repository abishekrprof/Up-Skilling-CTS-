/**
 * ==========================================================================
 * JAVASCRIPT EXERCISES: PORTAL DYNAMIC CONTROLLERS
 * Project Theme: Local Community Event Portal
 * Exercises: 1 to 14 Comprehensive Sequential Implementation
 * ==========================================================================
 */

// ==========================================================================
// EXERCISE 1: JavaScript Basics & Setup
// ==========================================================================
console.log("Welcome to the Community Portal - JavaScript Environment Activated.");

// We alert the user that the page has loaded successfully.
window.onload = () => {
    alert("📢 Welcome to the Metro Civic Events Center! JavaScript exercises successfully initialized.");
};

// ==========================================================================
// GLOBAL STATE DATABASE & VARIABLES
// ==========================================================================
// Global variable holding the loaded Event instances.
let activeEvents = [];

// ==========================================================================
// EXERCISE 5: Objects and Prototypes
// ==========================================================================
// We define an Event class (modern representation of constructors & prototypes)
class CivicEvent {
    constructor(event_id, title, date, category, seats, fee, description, location) {
        this.event_id = event_id;
        this.title = title;
        this.date = date;
        this.category = category;
        this.seats = seats; // let replacement inside object
        this.fee = fee;
        this.description = description;
        this.location = location;
        this.attendees = [];
    }

    // Method to display dynamic event info using Template Literals (Exercise 2)
    getSummary() {
        // EXERCISE 2: Template Literals & Constants
        const info = `Event: ${this.title} | Location: ${this.location} | Date: ${this.date}`;
        return info;
    }
}

// Adding Check Availability directly to the prototype (Exercise 5)
CivicEvent.prototype.checkAvailability = function() {
    return this.seats > 0;
};

// ==========================================================================
// EXERCISE 4: Functions, Scope & Closures
// ==========================================================================
/**
 * Closure implementation to track the total registrations for a category.
 * Each invocation of trackCategoryRegistration holds its state.
 */
function createRegistrationTracker() {
    const counts = {
        food: 0,
        art: 0,
        music: 0,
        farmers: 0,
        craft: 0,
        cleanup: 0
    };
    
    return {
        register: function(category) {
            if (counts[category] !== undefined) {
                counts[category]++;
                // Update the sidebar stats DOM dynamically
                const statSpan = document.getElementById(`stat-${category}`);
                if (statSpan) {
                    statSpan.textContent = counts[category];
                }
                return counts[category];
            }
            return 0;
        },
        getCounts: function() {
            return counts;
        }
    };
}

// Instantiate the closure function
const categoryTracker = createRegistrationTracker();

// ==========================================================================
// EXERCISE 9: Async JS, Promises & Async/Await
// ==========================================================================
/**
 * Asynchronously fetches event records from our events.json mock endpoint
 * and populates activeEvents array using ES6+ features.
 */
async function loadEventsData() {
    const spinner = document.getElementById("loadingSpinner");
    const grid = document.getElementById("eventsGrid");
    
    try {
        console.log("[AJAX] Initializing async load for events.json...");
        // 1. Simulate server loading lag (500ms)
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // 2. Fetch mock API endpoint
        const response = await fetch("events.json");
        if (!response.ok) {
            throw new Error(`HTTP network error: status ${response.status}`);
        }
        
        const rawData = await response.json();
        console.log("[AJAX Success] Payload received.", rawData);
        
        // 3. Clear grid and parse data into prototype Class objects
        grid.innerHTML = "";
        activeEvents = [];
        
        rawData.forEach(item => {
            // EXERCISE 6: Arrays push
            const newEv = new CivicEvent(
                item.event_id,
                item.title,
                item.date,
                item.category,
                item.seats,
                item.fee,
                item.description,
                item.location
            );
            activeEvents.push(newEv);
        });
        
        // Hide loader spinner
        if (spinner) spinner.style.display = "none";
        
        // 4. Render all loaded events
        renderEventCards(activeEvents);
        
    } catch (err) {
        console.error("[AJAX Error] Failed fetching database: ", err);
        grid.innerHTML = `<p style="color: #f87171; text-align: center; width: 100%;">❌ Error loading civic database: ${err.message}</p>`;
        if (spinner) spinner.style.display = "none";
    }
}

// Kick off async data fetch when page DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    loadEventsData();
});

// ==========================================================================
// EXERCISE 7: DOM Manipulation & Card Rendering
// ==========================================================================
/**
 * Renders the event list dynamically into the HTML grid using document.createElement.
 */
function renderEventCards(eventList) {
    const grid = document.getElementById("eventsGrid");
    grid.innerHTML = "";
    
    if (eventList.length === 0) {
        grid.innerHTML = `<p style="color: #64748b; text-align: center; width: 100%; padding: 40px 0;">No matching events found in active registry.</p>`;
        return;
    }
    
    // EXERCISE 3 & 10: loops (forEach), let/const, destructuring
    eventList.forEach(event => {
        // EXERCISE 10: Destructuring event details
        const { event_id, title, date, category, seats, fee, description, location } = event;
        
        // EXERCISE 3: Conditionals (if-else) checking seats/availabilities
        // We establish checks for dates and empty seats
        const isAvailable = event.checkAvailability();
        const seatsClass = seats === 0 ? "sold-out" : (seats < 15 ? "low-seats" : "");
        const seatsText = seats === 0 ? "SOLD OUT" : `${seats} seats left`;
        
        // Create main event card element
        const card = document.createElement("div");
        card.className = "event-card";
        card.id = `event-card-${event_id}`;
        // Hide by default to support jQuery fadeIn
        card.style.display = "none";
        
        // We set image path dynamically based on category
        const imagePath = `images/${category}_festival.png`; // Fallback name
        let displayImg = "images/art_exhibition.png"; // default
        if (category === "food") displayImg = "images/food_festival.png";
        else if (category === "art") displayImg = "images/art_exhibition.png";
        else if (category === "music") displayImg = "images/music_concert.png";
        else if (category === "farmers") displayImg = "images/farmers_market.png";
        else if (category === "craft") displayImg = "images/craft_fair.png";
        else if (category === "cleanup") displayImg = "images/park_cleanup.png";

        // EXERCISE 6: Array map sample layout concatenation
        card.innerHTML = `
            <div class="card-img-wrapper">
                <img src="${displayImg}" alt="${title}">
                <span class="category-tag">${category}</span>
            </div>
            <div class="card-body">
                <h3>${title}</h3>
                <div class="event-meta">
                    <span>📅 ${date}</span>
                    <span>📍 ${location}</span>
                </div>
                <p class="event-desc">${description}</p>
                <div class="card-footer">
                    <span class="seats-badge ${seatsClass}">🎟️ ${seatsText}</span>
                    <button class="btn-register" onclick="openRegistrationModal(${event_id})" ${!isAvailable ? 'disabled' : ''}>
                        ${isAvailable ? 'Register' : 'Sold Out'}
                    </button>
                </div>
            </div>
        `;
        
        grid.appendChild(card);
        
        // EXERCISE 14: jQuery fadeIn effect on creation
        $(`#event-card-${event_id}`).fadeIn(500);
    });
}

// ==========================================================================
// EXERCISE 4 & 6 & 8: High Order Functions, Filters & Event Handling
// ==========================================================================

/**
 * Filter Events by Category (Exercise 4 & 6 & 8)
 * Triggered by 'onchange' of select category box.
 */
function handleCategoryFilter(selectedCategory) {
    console.log(`[Filter Action] Filter category selected: ${selectedCategory}`);
    
    // EXERCISE 10: Spread operator cloning list
    const listCopy = [...activeEvents];
    
    let filteredList;
    if (selectedCategory === "all") {
        filteredList = listCopy;
    } else {
        // EXERCISE 6: Array filter method
        filteredList = listCopy.filter(event => event.category === selectedCategory);
    }
    
    // Animate removal and re-rendering using jQuery (Exercise 14)
    $(".event-card").fadeOut(250, () => {
        if ($(".event-card").last()[0]) {
            // Once all fade out, re-render and fade back in
            renderEventCards(filteredList);
        }
    });
    
    // If list is empty, fadeOut finishes instantly, render immediately
    if (filteredList.length === 0) {
        renderEventCards(filteredList);
    }
}

/**
 * Quick search filter by event name using keydown (Exercise 8)
 * Triggered by keydown events in the Search Input.
 */
function handleQuickSearch(event) {
    const inputElement = event.target;
    
    // Capture user search terms
    setTimeout(() => {
        const query = inputElement.value.toLowerCase().trim();
        console.log(`[Search Input] query: "${query}"`);
        
        const listCopy = [...activeEvents];
        
        // Pass callback to filter dynamically (Exercise 4)
        const filterCallback = (ev) => ev.title.toLowerCase().includes(query);
        const filteredList = listCopy.filter(filterCallback);
        
        renderEventCards(filteredList);
    }, 10);
}

// ==========================================================================
// EXERCISE 11 & 12: Working with Forms, Inputs & AJAX Fetch
// ==========================================================================

/**
 * Triggers modal popup box for secure user details entry.
 */
function openRegistrationModal(eventId) {
    const eventObj = activeEvents.find(ev => ev.event_id === eventId);
    if (!eventObj || !eventObj.checkAvailability()) return;
    
    document.getElementById("modalEventId").value = eventId;
    document.getElementById("modalEventTitle").textContent = `Register for ${eventObj.title}`;
    
    // Reset form errors
    document.getElementById("nameError").style.display = "none";
    document.getElementById("emailError").style.display = "none";
    document.getElementById("regForm").reset();
    
    // Show Modal backdrop
    document.getElementById("registerModal").style.display = "flex";
}

/**
 * Closes modal popup box.
 */
function closeRegistrationModal() {
    document.getElementById("registerModal").style.display = "none";
}

/**
 * Form Submission handling (Exercises 11, 12, 13)
 */
async function submitRegistration(event) {
    // EXERCISE 11: Prevent default form action
    event.preventDefault();
    
    const form = document.getElementById("regForm");
    const eventId = parseInt(document.getElementById("modalEventId").value);
    
    // Capture form values via form elements (Exercise 11)
    const name = form.elements["fullName"].value.trim();
    const email = form.elements["emailAddr"].value.trim();
    
    const nameError = document.getElementById("nameError");
    const emailError = document.getElementById("emailError");
    
    // Reset errors
    nameError.style.display = "none";
    emailError.style.display = "none";
    
    // Inline validation checks (Exercise 11)
    let hasError = false;
    if (name.length < 3) {
        nameError.textContent = "⚠️ Full name must be at least 3 characters long.";
        nameError.style.display = "block";
        hasError = true;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        emailError.textContent = "⚠️ Please enter a valid email format.";
        emailError.style.display = "block";
        hasError = true;
    }
    
    if (hasError) {
        console.warn("[Validation Alert] Registration form input errors caught.");
        return;
    }
    
    // EXERCISE 3 & 13: Try-Catch logic block & debugging logger steps
    try {
        console.log(`[Form Submission] EventId: ${eventId} | Citizen: ${name}`);
        const eventObj = activeEvents.find(ev => ev.event_id === eventId);
        
        if (!eventObj) {
            throw new Error("Event record not found in system.");
        }
        
        // Check seats left
        if (eventObj.seats <= 0) {
            throw new Error("This event is sold out!");
        }
        
        // Disable submit button during mock network request
        const submitBtn = document.getElementById("registerBtn");
        submitBtn.disabled = true;
        submitBtn.textContent = "Processing reservation request...";
        
        // EXERCISE 12: AJAX POST fetch simulator using mock API and setTimeout delay
        console.log("[Fetch POST] Dispatching API transaction payload...");
        
        const payload = {
            eventId: eventId,
            fullName: name,
            email: email,
            registrationTimestamp: new Date().toISOString()
        };
        
        // EXERCISE 13: Debugging - Log the post payload
        console.log("[JSON Payload]", JSON.stringify(payload));
        
        // Perform simulated fetch post action
        await new Promise((resolve) => setTimeout(resolve, 800)); // Delay
        
        // EXERCISE 2: seats decrement operator
        eventObj.seats--; // seats decremented successfully
        eventObj.attendees.push({ name, email });
        
        // Update Closures (Exercise 4)
        categoryTracker.register(eventObj.category);
        
        // EXERCISE 5: Diagnostic output listing object prototype entries
        updateDiagnosticConsole(eventObj);
        
        // Re-render display grid with updated seats
        renderEventCards(activeEvents);
        
        closeRegistrationModal();
        alert(`🎉 Success! Registration ticket dispatched to ${email} for "${eventObj.title}".`);
        
        submitBtn.disabled = false;
        submitBtn.textContent = "Secure Registration";
        
    } catch (error) {
        console.error("[AJAX POST Failure] Registration process error: ", error);
        alert(`❌ Registration Failed: ${error.message}`);
    }
}

// ==========================================================================
// EXERCISE 5: Object.entries Diagnostic Output
// ==========================================================================
function updateDiagnosticConsole(eventObj) {
    const consoleDiv = document.getElementById("prototypeConsole");
    if (!consoleDiv) return;
    
    // Object.entries lists key-value properties
    const entries = Object.entries(eventObj);
    
    let htmlOutput = `<p style="color: #4ade80; margin-bottom: 8px;">🟢 Registration Added! Event Properties:</p>`;
    entries.forEach(([key, val]) => {
        // Skip display of long array data for readability
        if (key === "attendees" || key === "description") return;
        htmlOutput += `<div><strong>${key}:</strong> <span style="color: #e2e8f0;">${val}</span></div>`;
    });
    
    consoleDiv.innerHTML = htmlOutput;
}
