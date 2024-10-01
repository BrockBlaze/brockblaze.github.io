// Check if there is a saved date in localStorage when the page loads
var Hours = 0;

window.onload = function () {
    hideMoney();
    const savedDate = localStorage.getItem("savedDate");
    if (savedDate) {
        const cdate = new Date();
        saveDate = new Date(savedDate);
        const diff = cdate - saveDate;
        Hours = (diff / (1000 * 60 * 60)).toFixed(2);
    }

    if (Hours < 12) {
        if (savedDate) {
            document.getElementById("inputDateTime").value = savedDate;
            calculateDifference(new Date(savedDate));
        }
    }
}

// Save the selected date to localStorage and calculate the difference
function saveDate() {
    const inputDate = document.getElementById("inputDateTime").value;
    if (!inputDate) {
        document.getElementById("result").textContent =
            "Please select a valid date and time.";
        return;
    }

    localStorage.setItem("savedDate", inputDate); // Save the date in localStorage
    calculateDifference(new Date(inputDate));
}

// Calculate and display the time difference
function calculateDifference(inputDateTime) {

    const currentDateTime = new Date();
    const resultDiv = document.getElementById('result');
    const mresultDiv = document.getElementById('mresult');

    // Calculate the difference in milliseconds
    const diffInMs = currentDateTime - inputDateTime;


    // Convert milliseconds into hours, minutes, seconds
    const diffInHours = Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffInMinutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffInSeconds = Math.floor((diffInMs % (1000 * 60)) / 1000);

    const diffInHoursString = diffInHours.toString().padStart(2, '0');
    const diffInMinutesString = diffInMinutes.toString().padStart(2, '0');
    const diffSecString = diffInSeconds.toString().padStart(2, '0');

    // Calculate the total difference in days as a float
    const diffInHoursFloat = (diffInMs / (1000 * 60 * 60)).toFixed(2);

    const money = diffInHoursFloat * 20;


    resultDiv.innerHTML = `
                Time At Work: ${diffInHoursString}:${diffInMinutesString}:${diffSecString}
                <br>
                ${diffInHoursFloat} - hours
            `;
    mresultDiv.innerHTML = `${(Math.round(money * 100) / 100).toFixed(2)} `;

}

function showMoney() {
    document.getElementById('mresult').style.display = "block";
}

function hideMoney() {
    document.getElementById('mresult').style.display = "none";
}

setInterval(saveDate, 1000);
