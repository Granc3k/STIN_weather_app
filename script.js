//TODO schovat je
const APIkey = "356cf740e9ac5d292a62fd5a5efdb120";
const APIadress = "https://api.openweathermap.org/data/2.5/weather?&units=metric&q=";

const historyAPI = "https://api.open-meteo.com/v1/forecast?"
const historyAPISet = "&daily=temperature_2m_max,temperature_2m_min,rain_sum,showers_sum,snowfall_sum&timezone=auto&"

const containter = document.querySelector('.container');
const search = document.querySelector('.search-box button');
const weatherBox = document.querySelector('.weather-box');
const weatherDetails = document.querySelector('.weather-details');
const error404 = document.querySelector('.not-found');
const historyTable = document.querySelector('.history-table');

var userName="";
var lat = "";
var long = "";


document.addEventListener("DOMContentLoaded", function () {
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const loginMenu = document.querySelector('.login-menu');
    
    // Function to toggle login menu visibility
    function toggleLoginMenu() {
        hamburgerMenu.classList.toggle('clicked');
        loginMenu.classList.toggle('active');
    }
    
    // Toggle login menu when hamburger icon is clicked
    hamburgerMenu.addEventListener('click', toggleLoginMenu);
    
    // Prevent click event propagation for login menu
    loginMenu.addEventListener('click', (event) => {
        event.stopPropagation();
    });
});


search.addEventListener('click', () => {
    
    const city = document.querySelector('.search-box input').value;
    if(city === '') return;
    const apiUrl = `${APIadress}${city}&appid=${APIkey}`
    
    fetch(apiUrl).then(response => response.json()).then(json => {
        
        if(json.cod === '404') {
            //Check if the city is not found
            containter.style.height = '500px';
            weatherBox.classList.remove('active');
            weatherDetails.classList.remove('active');
            historyTable.classList.remove('active');
            error404.classList.add('active');
            return;
        }

        containter.style.height = 'auto';
        weatherBox.classList.add('active');
        weatherDetails.classList.add('active');
        historyTable.classList.add('active');
        error404.classList.remove('active');

        const image = document.querySelector('.weather-box img');
        const temperature = document.querySelector('.weather-box .temperature');
        const description = document.querySelector('.weather-box .description');
        const humidity = document.querySelector('.weather-details .humidity span');
        const wind = document.querySelector('.weather-details .wind span');
        
        switch(json.weather[0].main) {
            case 'Clear':
                image.src = 'images/clear.png';
                break;
            case 'Clouds':
                image.src = 'images/cloud.png';
                break;
            case 'Rain':
                image.src = 'images/rain.png';
                break;
            case 'Snow':
                image.src = 'images/snow.png';
                break;
            case 'Mist':
                image.src = 'images/mist.png';
                break;
            case 'Haze':
                image.src = 'images/mist.png';
                break;
            default:
                image.src = 'images/cloud.png';
                break;
        }

        temperature.innerHTML = `${parseInt(json.main.temp)}<span>°C</span>`;
        description.innerHTML = `${json.weather[0].description}`;
        humidity.innerHTML = `${json.main.humidity}%`;
        wind.innerHTML = `${parseInt(json.wind.speed)}Km/h`;

        lat = json.coord.lat;
        long = json.coord.lon;

        if(userName === ""){
            historyTable.innerHTML = "Pro získání historie počasí této lokace se prosím přihlašte/registrujte";
        }else{
            //alert("Není ještě implementováno");
            renderTable();
        }
    });

});

async function renderTable(){
    const historyData = await getHistoryData(); // Získání historických dat asynchronně
    console.log(historyData);
    let output = `
        <table>
            <thead>
                <tr>
                <th>Date</th>
                <th>Max Temp</th>
                <th>Min Temp</th>
                <th>Rain</th>
                <th>Shower</th>
                <th>Snow</th>
                </tr>
            </thead>
            <tbody>`;

    historyData.forEach(data => {
        output += renderRow(data); // Vytvoření řádku pro každý objekt v historyData
    });

    output += `</tbody></table>`;
    historyTable.innerHTML = output;
}


function renderRow(data){
    console.log(data);
    return `
    <tr>
        <td>${data.date}</td>
        <td>${data.maxTemp}°C</td>
        <td>${data.minTemp}°C</td>
        <td>${data.rain}mm</td>
        <td>${data.shower}mm</td>
        <td>${data.snow}cm</td>
    </tr>`
}

async function getHistoryData() {
    const historyData = [];
    const promises = [];

    for (let i = 0; i < 7; i++) {
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - i - 1); // Subtract i + 1 days to get historical dates
        const year = currentDate.getFullYear();
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const day = currentDate.getDate().toString().padStart(2, '0');

        const historyApiUrl = `${historyAPI}latitude=${lat}&longitude=${long}${historyAPISet}start_date=${year}-${month}-${day}&end_date=${year}-${month}-${day}`;
        
        // Pushing each fetch promise into promises array
        promises.push(fetch(historyApiUrl).then(response => response.json()));
    }

    // Waiting for all promises to resolve
    const responses = await Promise.all(promises);

    responses.forEach(json => {
        if (json.cod === '404') {
            alert("City not found");
            return;
        }
        console.log(json);
        historyData.push({
            date: `${json.daily.time}`,
            maxTemp: parseInt(json.daily.temperature_2m_max),
            minTemp: parseInt(json.daily.temperature_2m_min),
            rain: parseInt(json.daily.rain_sum),
            shower: parseInt(json.daily.showers_sum),
            snow: parseInt(json.daily.snowfall_sum)
        });
    });
    
    return historyData; 
}
