/**
 * ==========================================================================
 * LOCAL COMMUNITY EVENT PORTAL - JAVASCRIPT LOGIC
 * Workshop Level: Beginner-Friendly & Educationally Commented
 * ==========================================================================
 */

// Debugging Note (HTML5 Ex 10): Let's print an initial diagnostic load log.
// When debugging in Chrome DevTools, check the "Console" tab to verify this runs!
console.log("[Portal Diagnostic] script.js successfully loaded. Environment ready.");

// Global state tracking to support page unload warnings
let isFormDirty = false;

// ==========================================================================
// A. Page Initialization (Prefetch Stored Selections - HTML5 Ex 8)
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    console.log("[Portal Initialization] Running DOMContentLoaded tasks...");
    
    // Retrieve stored preferences from localStorage
    const savedEvent = localStorage.getItem("preferredEventType");
    
    if (savedEvent) {
        console.log(`[Preferences found] Stored preference value: "${savedEvent}"`);
        const eventDropdown = document.getElementById("eventType");
        
        if (eventDropdown) {
            // Pre-select the saved preference category
            eventDropdown.value = savedEvent;
            // Update the fee badge to reflect the pre-selected category
            handleEventTypeChange(savedEvent);
            console.log(`[Preferences applied] Event dropdown pre-selected to "${savedEvent}"`);
        }
    } else {
        console.log("[Preferences] No previous preferences found in localStorage.");
    }
    
    // Attach listener to input fields to track form editing (for Ex 7 onbeforeunload)
    const inputs = document.querySelectorAll("#eventForm input, #eventForm textarea, #eventForm select");
    inputs.forEach(input => {
        input.addEventListener("input", () => {
            isFormDirty = true;
        });
    });
});

// ==========================================================================
// B. Input Validation & Form Feedback Events (HTML5 Ex 5 & Ex 6)
// ==========================================================================

/**
 * 1. Phone number format validation on Blur (HTML5 Ex 6)
 * Triggered by 'onblur' when the phone input loses cursor focus.
 */
function validatePhoneNumber(inputElement) {
    const value = inputElement.value.trim();
    const errorDisplay = document.getElementById("phoneError");
    
    // Simple 10-digit number regex pattern (e.g. 9876543210)
    const phonePattern = /^\d{10}$/;
    
    if (value === "") {
        errorDisplay.textContent = "";
        inputElement.style.border = "1px solid rgba(255, 255, 255, 0.15)";
        return false;
    }
    
    if (!phonePattern.test(value)) {
        errorDisplay.textContent = "⚠️ Invalid phone format. Please enter exactly 10 digits (no spaces/hyphens).";
        inputElement.style.border = "2px solid #f87171"; // Red border highlights error
        console.warn(`[Validation Warning] Phone input '${value}' is invalid.`);
        return false;
    } else {
        errorDisplay.textContent = "";
        inputElement.style.border = "2px solid #4ade80"; // Green border shows success
        console.log(`[Validation Success] Phone input '${value}' is valid.`);
        return true;
    }
}

/**
 * 2. Event Type Dropdown onchange Fee Display (HTML5 Ex 6 & Ex 8)
 * Triggered by 'onchange' when a user selects a different option.
 */
function handleEventTypeChange(selectedValue) {
    console.log(`[Event Dropdown change] Selected: ${selectedValue}`);
    
    // Event pricing configuration array
    const feeSchedule = {
        food: "$15.00",
        art: "$25.00",
        music: "$35.00",
        farmers: "$0.00 (Free Admission!)",
        craft: "$5.00",
        cleanup: "$0.00 (Volunteer Program)"
    };
    
    const feeBadge = document.getElementById("eventFeeBadge");
    
    if (feeBadge && feeSchedule[selectedValue] !== undefined) {
        // Display selected event fee dynamically
        feeBadge.textContent = feeSchedule[selectedValue];
        
        // Highlight badge animation effect
        feeBadge.style.transform = "scale(1.05)";
        setTimeout(() => feeBadge.style.transform = "scale(1)", 150);
        
        // HTML5 Exercise 8: Save selected event type preference in localStorage
        localStorage.setItem("preferredEventType", selectedValue);
        // Save simple session key to satisfy sessionStorage requirements
        sessionStorage.setItem("lastSelectionTime", new Date().toLocaleTimeString());
        console.log(`[Storage updated] Saved preferredEventType = "${selectedValue}" to localStorage`);
    }
}

/**
 * 3. Character Counter in Accommodations Textarea (HTML5 Ex 6)
 * Triggered by keyup event to capture text size.
 */
function countCharacters(textareaElement) {
    const textLength = textareaElement.value.length;
    const counter = document.getElementById("charCount");
    
    if (counter) {
        counter.textContent = textLength;
        
        // Visual indicator adjustments for large feedback lengths
        if (textLength > 150) {
            counter.style.color = "#f87171"; // Warning tone
        } else {
            counter.style.color = "#38bdf8"; // Standard active tone
        }
    }
}

/**
 * 4. Submit Button onclick Confirmation check (HTML5 Ex 6)
 * Triggered by 'onclick' on the submit button.
 */
function confirmClick(event) {
    console.log("[Submit Clicked] Displaying browser confirmation modal...");
    
    // Confirm dialogue asks the user if they're sure they want to submit
    const proceed = confirm("Are you ready to submit your registration form to the Metro City Council database?");
    
    if (!proceed) {
        // Cancel submission and prevent form processing if user selects 'Cancel'
        event.preventDefault();
        console.log("[Submit Cancelled] User aborted submission.");
    }
}

/**
 * 5. Main Form Submit Submission Action (HTML5 Ex 5)
 * Triggered by 'onsubmit' when form validation passes.
 */
function handleFormSubmit(event) {
    event.preventDefault(); // Stop standard HTTP page reload
    console.log("[Form Submission] Processing inputs...");
    
    // Fetch input elements
    const name = document.getElementById("fullName").value;
    const email = document.getElementById("userEmail").value;
    const date = document.getElementById("eventDate").value;
    const eventSelect = document.getElementById("eventType");
    const eventName = eventSelect.options[eventSelect.selectedIndex].text;
    
    // Final check for phone number validation
    const phoneInput = document.getElementById("userPhone");
    if (!validatePhoneNumber(phoneInput)) {
        alert("Please correct validation errors before registering.");
        return;
    }

    // HTML5 Exercise 5: Display confirmation message inside <output> element
    const confirmationOutput = document.getElementById("confirmationOutput");
    if (confirmationOutput) {
        confirmationOutput.style.display = "block";
        confirmationOutput.innerHTML = `
            🎉 <strong>Registration Successful!</strong><br>
            Thank you, <strong>${name}</strong>. A confirmation pass has been dispatched to <strong>${email}</strong>.<br>
            <small>Category: ${eventName} | Date: ${date}</small>
        `;
        
        // Scroll smoothly to output
        confirmationOutput.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    
    // Clean dirty state because form is now submitted successfully
    isFormDirty = false;
    console.log("[Form Completed] Success state rendered. Form dirtiness reset.");
}

// ==========================================================================
// C. Saving & Clearing User Preferences (HTML5 Ex 8)
// ==========================================================================

/**
 * Clear Preferences clears both localStorage and sessionStorage
 */
function clearPreferences() {
    console.log("[Clear Preferences] Wiping storage caches...");
    
    // Clear both storages
    localStorage.removeItem("preferredEventType");
    sessionStorage.clear();
    
    // Reset dropdown and fee badge
    const dropdown = document.getElementById("eventType");
    if (dropdown) dropdown.value = "";
    
    const feeBadge = document.getElementById("eventFeeBadge");
    if (feeBadge) feeBadge.textContent = "$0.00 (Select event category)";
    
    alert("✅ Local Preferences and Session storage successfully cleared!");
    console.log("[Preferences Wiped] UI reset complete.");
}

// ==========================================================================
// D. Geolocation Event Coordinates Finder (HTML5 Ex 9)
// ==========================================================================

/**
 * getCurrentPosition query with high accuracy configurations
 */
function findNearbyEvents() {
    const geoDisplay = document.getElementById("geoDisplay");
    geoDisplay.innerHTML = `<p style="color: #38bdf8;">🛰️ Querying GPS satellites. Please approve browser location prompt...</p>`;
    console.log("[Geolocation API] Request initiated.");
    
    // Check compatibility
    if (!navigator.geolocation) {
        geoDisplay.innerHTML = "❌ Geolocation is not supported by your current browser.";
        console.error("[Geolocation Error] Not supported by browser.");
        return;
    }
    
    // High accuracy settings, 5-second timeout, no-cache configurations
    const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };
    
    navigator.geolocation.getCurrentPosition(
        // Success Callback
        (position) => {
            const lat = position.coords.latitude.toFixed(6);
            const lng = position.coords.longitude.toFixed(6);
            const accuracy = position.coords.accuracy.toFixed(1);
            
            console.log(`[Geolocation Success] Latitude: ${lat}, Longitude: ${lng}, Acc: ${accuracy}m`);
            
            geoDisplay.innerHTML = `
                <div class="geo-data">
                    <p>🟢 <strong>Location Located!</strong></p>
                    <p>🌐 Latitude: <strong>${lat}</strong></p>
                    <p>🌐 Longitude: <strong>${lng}</strong></p>
                    <p>📏 Accuracy: <strong>±${accuracy} meters</strong></p>
                    <p style="margin-top: 10px; color: #10b981; font-size: 0.85rem;">
                        🗺️ <em>Nearest site found: Central Municipal Civic Center (1.2 miles away).</em>
                    </p>
                </div>
            `;
        },
        // Error Callback
        (error) => {
            console.error(`[Geolocation Failure] Error code ${error.code}: ${error.message}`);
            let errorText = "❌ An error occurred during geolocation fetch.";
            
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorText = "❌ Location request denied by user. Please re-enable location permissions in your browser address bar.";
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorText = "❌ Location network information is currently unavailable.";
                    break;
                case error.TIMEOUT:
                    errorText = "❌ Location request timed out before receiving data. (5s Limit exceeded).";
                    break;
            }
            
            geoDisplay.innerHTML = `<p style="color: #f87171; font-weight: 500;">${errorText}</p>`;
        },
        options
    );
}

// ==========================================================================
// E. Video Media Elements & Navigation Guard (HTML5 Ex 7)
// ==========================================================================

/**
 * 1. Video oncanplay load listener
 */
function videoReady() {
    const status = document.getElementById("videoStatus");
    if (status) {
        status.textContent = "✅ Video loaded & ready to play!";
        status.style.backgroundColor = "rgba(16, 185, 129, 0.15)";
        status.style.borderColor = "rgba(16, 185, 129, 0.3)";
        status.style.color = "#4ade80";
        console.log("[Video Media Event] videoReady triggered (oncanplay active).");
    }
}

/**
 * 2. BeforeUnload warning guard.
 * Warns citizens if they attempt to navigate away after editing the form.
 */
window.addEventListener("beforeunload", (event) => {
    if (isFormDirty) {
        console.log("[Navigation Guard] User is attempting to leave with unfinished form content.");
        
        // Standard code to trigger standard browser leave confirmation dialogue
        event.preventDefault();
        event.returnValue = "You have unsaved changes in your registration form. Are you sure you want to leave?";
        return event.returnValue;
    }
});

// ==========================================================================
// F. Image Enlarge Double-Click Modal Events (HTML5 Ex 6)
// ==========================================================================

/**
 * 1. Double Click enlarges the image by opening a full page modal overlay.
 */
function enlargeImage(imgElement) {
    const modal = document.getElementById("imageModal");
    const enlargedImg = document.getElementById("enlargedImg");
    const modalCaption = document.getElementById("modalCaption");
    
    if (modal && enlargedImg && modalCaption) {
        modal.style.display = "flex";
        enlargedImg.src = imgElement.src;
        modalCaption.textContent = imgElement.alt + " (Double-Click zoom)";
        console.log(`[Gallery Modal Opened] Viewing image: ${imgElement.src}`);
    }
}

/**
 * 2. Closes the enlargement modal
 */
function closeModal() {
    const modal = document.getElementById("imageModal");
    if (modal) {
        modal.style.display = "none";
        console.log("[Gallery Modal Closed]");
    }
}

// ==========================================================================
// G. Sandbox Box Model Helper: display vs visibility (CSS3 Ex 8)
// ==========================================================================

let displayState = true;
let visibilityState = true;

function toggleBoxDisplay() {
    const box = document.getElementById("demoBox2");
    const desc = document.getElementById("boxDescription");
    displayState = !displayState;
    
    if (displayState) {
        box.style.display = "block";
        desc.textContent = "Box B is displayed normally. Box A, B, and C flow perfectly.";
    } else {
        box.style.display = "none";
        desc.textContent = "Box B is now `display: none`. It is fully removed; Box C moves left to take its spot!";
    }
    console.log(`[Box Model Sandbox] Toggle display: ${displayState ? 'block' : 'none'}`);
}

function toggleBoxVisibility() {
    const box = document.getElementById("demoBox2");
    const desc = document.getElementById("boxDescription");
    visibilityState = !visibilityState;
    
    if (visibilityState) {
        box.style.visibility = "visible";
        desc.textContent = "Box B is visible. Normal layout restored.";
    } else {
        box.style.visibility = "hidden";
        desc.textContent = "Box B is `visibility: hidden`. It is invisible, but still takes up its physical box model space!";
    }
    console.log(`[Box Model Sandbox] Toggle visibility: ${visibilityState ? 'visible' : 'hidden'}`);
}
