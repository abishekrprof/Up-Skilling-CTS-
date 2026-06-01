/**
 * ==========================================================================
 * LOCAL COMMUNITY EVENT PORTAL - INTERACTIVE PLAYGROUND LOGIC
 * ==========================================================================
 */

console.log("[Portal Diagnostic] main.js successfully loaded. Environment ready.");

// Alert when page has loaded successfully
window.onload = () => {
    alert("📢 Welcome to the Metro Civic Events Center! Interactive portal successfully initialized.");
};

// ==========================================================================
// GLOBAL STATE DATABASE & VARIABLES
// ==========================================================================
let activeEvents = [];

// ==========================================================================
// Event Model Class
// ==========================================================================
class CivicEvent {
    constructor(event_id, title, date, category, seats, fee, description, location) {
        this.event_id = event_id;
        this.title = title;
        this.date = date;
        this.category = category;
        this.seats = seats;
        this.fee = fee;
        this.description = description;
        this.location = location;
        this.attendees = [];
    }

    getSummary() {
        const info = `Event: ${this.title} | Location: ${this.location} | Date: ${this.date}`;
        return info;
    }
}

// Adding Check Availability directly to prototype
CivicEvent.prototype.checkAvailability = function() {
    return this.seats > 0;
};

// ==========================================================================
// Category Registrations State Closure
// ==========================================================================
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

const categoryTracker = createRegistrationTracker();

// ==========================================================================
// Asynchronous Mock API Fetching
// ==========================================================================
async function loadEventsData() {
    const spinner = document.getElementById("loadingSpinner");
    const grid = document.getElementById("eventsGrid");
    
    try {
        console.log("[AJAX] Initializing async load for events.json...");
        // Simulate network latency (600ms)
        await new Promise(resolve => setTimeout(resolve, 600));
        
        const response = await fetch("events.json");
        if (!response.ok) {
            throw new Error(`HTTP network error: status ${response.status}`);
        }
        
        const rawData = await response.json();
        console.log("[AJAX Success] Payload received.", rawData);
        
        grid.innerHTML = "";
        activeEvents = [];
        
        rawData.forEach(item => {
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
        
        if (spinner) spinner.style.display = "none";
        renderEventCards(activeEvents);
        
    } catch (err) {
        console.error("[AJAX Error] Failed fetching database: ", err);
        grid.innerHTML = `<p style="color: #f87171; text-align: center; width: 100%;">❌ Error loading civic database: ${err.message}</p>`;
        if (spinner) spinner.style.display = "none";
    }
}

// Initialise fetch on load
document.addEventListener("DOMContentLoaded", () => {
    loadEventsData();
});

// ==========================================================================
// DOM Dynamic Event Card Renderer
// ==========================================================================
function renderEventCards(eventList) {
    const grid = document.getElementById("eventsGrid");
    grid.innerHTML = "";
    
    if (eventList.length === 0) {
        grid.innerHTML = `<p style="color: #64748b; text-align: center; width: 100%; padding: 40px 0;">No matching events found in active registry.</p>`;
        return;
    }
    
    eventList.forEach(event => {
        const { event_id, title, date, category, seats, fee, description, location } = event;
        
        const isAvailable = event.checkAvailability();
        const seatsClass = seats === 0 ? "sold-out" : (seats < 15 ? "low-seats" : "");
        const seatsText = seats === 0 ? "SOLD OUT" : `${seats} seats left`;
        
        const card = document.createElement("div");
        card.className = "event-card";
        card.id = `event-card-${event_id}`;
        card.style.display = "none";
        
        let displayImg = "images/art_exhibition.png"; // default
        if (category === "food") displayImg = "images/food_festival.png";
        else if (category === "art") displayImg = "images/art_exhibition.png";
        else if (category === "music") displayImg = "images/music_concert.png";
        else if (category === "farmers") displayImg = "images/farmers_market.png";
        else if (category === "craft") displayImg = "images/craft_fair.png";
        else if (category === "cleanup") displayImg = "images/park_cleanup.png";

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
        
        // jQuery fadeIn animation
        $(`#event-card-${event_id}`).fadeIn(500);
    });
}

// ==========================================================================
// Event Handlers for Filters & Search Bar
// ==========================================================================

/**
 * Filter Events by Category Selection
 */
function handleCategoryFilter(selectedCategory) {
    console.log(`[Filter Action] Filter category selected: ${selectedCategory}`);
    
    const listCopy = [...activeEvents];
    
    let filteredList;
    if (selectedCategory === "all") {
        filteredList = listCopy;
    } else {
        filteredList = listCopy.filter(event => event.category === selectedCategory);
    }
    
    // Animate removal and re-rendering using jQuery
    $(".event-card").fadeOut(250, () => {
        if ($(".event-card").last()[0]) {
            renderEventCards(filteredList);
        }
    });
    
    if (filteredList.length === 0) {
        renderEventCards(filteredList);
    }
}

/**
 * Quick search filter by event name using keydown
 */
function handleQuickSearch(event) {
    const inputElement = event.target;
    
    setTimeout(() => {
        const query = inputElement.value.toLowerCase().trim();
        console.log(`[Search Input] query: "${query}"`);
        
        const listCopy = [...activeEvents];
        const filterCallback = (ev) => ev.title.toLowerCase().includes(query);
        const filteredList = listCopy.filter(filterCallback);
        
        renderEventCards(filteredList);
    }, 10);
}

// ==========================================================================
// Forms Registrations & API Posting
// ==========================================================================

function openRegistrationModal(eventId) {
    const eventObj = activeEvents.find(ev => ev.event_id === eventId);
    if (!eventObj || !eventObj.checkAvailability()) return;
    
    document.getElementById("modalEventId").value = eventId;
    document.getElementById("modalEventTitle").textContent = `Register for ${eventObj.title}`;
    
    document.getElementById("nameError").style.display = "none";
    document.getElementById("emailError").style.display = "none";
    document.getElementById("regForm").reset();
    
    document.getElementById("registerModal").style.display = "flex";
}

function closeRegistrationModal() {
    document.getElementById("registerModal").style.display = "none";
}

async function submitRegistration(event) {
    event.preventDefault();
    
    const form = document.getElementById("regForm");
    const eventId = parseInt(document.getElementById("modalEventId").value);
    
    const name = form.elements["fullName"].value.trim();
    const email = form.elements["emailAddr"].value.trim();
    
    const nameError = document.getElementById("nameError");
    const emailError = document.getElementById("emailError");
    
    nameError.style.display = "none";
    emailError.style.display = "none";
    
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
    
    try {
        console.log(`[Form Submission] EventId: ${eventId} | Citizen: ${name}`);
        const eventObj = activeEvents.find(ev => ev.event_id === eventId);
        
        if (!eventObj) {
            throw new Error("Event record not found in system.");
        }
        
        if (eventObj.seats <= 0) {
            throw new Error("This event is sold out!");
        }
        
        const submitBtn = document.getElementById("registerBtn");
        submitBtn.disabled = true;
        submitBtn.textContent = "Processing reservation request...";
        
        console.log("[Fetch POST] Dispatching API transaction payload...");
        
        const payload = {
            eventId: eventId,
            fullName: name,
            email: email,
            registrationTimestamp: new Date().toISOString()
        };
        
        console.log("[JSON Payload]", JSON.stringify(payload));
        
        // Simulate network API posting latency (800ms)
        await new Promise((resolve) => setTimeout(resolve, 800));
        
        eventObj.seats--;
        eventObj.attendees.push({ name, email });
        
        categoryTracker.register(eventObj.category);
        updateDiagnosticConsole(eventObj);
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
// Real-time Dashboard Entries Diagnostic
// ==========================================================================
function updateDiagnosticConsole(eventObj) {
    const consoleDiv = document.getElementById("prototypeConsole");
    if (!consoleDiv) return;
    
    const entries = Object.entries(eventObj);
    
    let htmlOutput = `<p style="color: #4ade80; margin-bottom: 8px;">🟢 Registration Added! Event Properties:</p>`;
    entries.forEach(([key, val]) => {
        if (key === "attendees" || key === "description") return;
        htmlOutput += `<div><strong>${key}:</strong> <span style="color: #e2e8f0;">${val}</span></div>`;
    });
    
    consoleDiv.innerHTML = htmlOutput;
}
