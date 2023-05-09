import { doc } from "prettier";
import css from "/dist/style.css";
import getDay from "date-fns/getDay";

async function getWeather (query) {
    try{
        const url = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=258c8af65ae04a5fa51224910232104&q=${query}&days=3&aqi=no&alerts=no`, {mode: 'cors'});
        let data = await url.json();
        console.log(data);
        pullData(data, 0);
        localStorage.setItem('prevResult', query);
    }
    catch(err){
       await console.error(err);
    }
};
function pullData (data, day) {
    const [current, forecast, location] = [data.current, data.      forecast, data.location];
    const pulledData = {
        region: ` ${location.name}, ${location.region}`,
        condition: forecast.forecastday[day].day.condition.text,
        dayofWeek: forecast.forecastday[day].date,
        icon: forecast.forecastday[day].day.condition.icon,
        temp_F: Math.floor(current.temp_f),
        temp_C: Math.floor(current.temp_c),
        precip: `Precipitation: ${forecast.forecastday[day].day.daily_chance_of_rain}%`,
        humidity: `Humidity: ${Math.floor(forecast.forecastday[day].day.avghumidity)}%`,
        windMPH: `Wind: ${Math.floor(current.wind_mph)}mph`,
        weekday: weekdayCheck(forecast.forecastday[day].hour[0].time_epoch)
    };
    const locationOutput = document.querySelector('.location header');
    locationOutput.textContent = pulledData.region;
    fillData(pulledData);
    dayBuilder(forecast.forecastday);
};

function fillData (data){
    const outputs = [...document.querySelectorAll('.output')];
    const [location, icon, tempF, tempC, precip, hum, wind, dayte, wType] = [...outputs];
    icon.src = data.icon;
    tempF.textContent = data.temp_F;
    tempC.textContent = data.temp_C;
    precip.textContent = data.precip;
    hum.textContent = data.humidity;
    wind.textContent = data.windMPH;
    dayte.textContent = data.weekday;
    wType.textContent = data.condition;
};
function dayBuilder (dayData) {
    const weekContainer = document.querySelector('.weekly');
    while (weekContainer.firstChild){
        weekContainer.firstChild.remove();
    }
    dayData.forEach((item) =>{
        const container = document.createElement('div');
        container.classList.add('weekContainer');
        const weekday = document.createElement('p');
        weekday.textContent = weekdayCheck(item.hour[0].time_epoch, 1);
        const icon = document.createElement('img');
        icon.classList.add('weekIcon');
        icon.src = `${item.day.condition.icon}`;
        const tempRangeF = document.createElement('p');
        tempRangeF.classList.add('tempF')
        tempRangeF.textContent = `${Math.floor(item.day.maxtemp_f)}° - ${Math.floor(item.day.mintemp_f)}°`;
        const tempRangeC = document.createElement('p');
        tempRangeC.classList.add('tempC');
        tempRangeC.textContent = `${Math.floor(item.day.maxtemp_c)}° - ${Math.floor(item.day.mintemp_c)}°`;
        if(localStorage.getItem('tempPref') === 'celsius'){
            tempRangeC.classList.add('active');
        }
        else{
            tempRangeF.classList.add('active');
        }
        const dayObj = {
            icon: item.day.condition.icon,
            temp_F: Math.floor(item.day.avgtemp_f),
            temp_C: Math.floor(item.day.avgtemp_c),
            precip: `Precipitation: ${Math.floor(item.day.daily_chance_of_rain)}%`,
            humidity: `Humidity: ${Math.floor(item.day.avghumidity)}%`,
            windMPH: `Wind: ${Math.floor(item.day.maxwind_mph)}mph`,
            weekday: weekdayCheck(item.hour[0].time_epoch),
            condition: item.day.condition.text
        }
        container.addEventListener('click', (e) => {
            fillData(dayObj)}
            );
        container.appendChild(weekday);
        container.appendChild(icon);
        container.appendChild(tempRangeF);
        container.appendChild(tempRangeC);
        weekContainer.appendChild(container);
    });

}

function weekdayCheck (day, abbrev= 0) {
    let epochDay = day;
    if (epochDay.toString().length === 10) {
        epochDay *= 1000;
    };
    let weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    if (abbrev) {
        weekDays = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];
    }
    epochDay = getDay(new Date(epochDay));
    return  weekDays[epochDay];
};

function focusToggle (target) {
    const week = [...document.querySelectorAll('#weekly > div')];
    week.forEach((weekDay) => {
        weekDay.classList.remove('active');
    });
    target.classList.add('active');
};

function tempToggle (type) {
    const fahrenheit = [...document.querySelectorAll('.tempF')];
    const celsius = [...document.querySelectorAll('.tempC')];
    if (type === 'fahrenheit'){
        fahrenheit.forEach((item) => {
            item.classList.add('active');
        });
        celsius.forEach((item) => {
            item.classList.remove('active');
        });
    }
    if (type === 'celsius'){
        celsius.forEach((item) => {
            item.classList.add('active');
        });
        fahrenheit.forEach((item) => {
            item.classList.remove('active');
        });
    }
    localStorage.setItem('tempPref', type);
};

function init () {
    if(!'prevResult' in localStorage){
        localStorage.setItem('prevResult', "");
    }
    else{
        getWeather(localStorage.getItem('prevResult'));
    }
    const textField = document.querySelector('.textField');
    textField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter'){
            e.preventDefault();
            getWeather(e.target.value);
        }
    });
    if(!'tempPref' in localStorage){
        tempToggle('fahrenheit');
    }
    else{
        tempToggle(localStorage.getItem('tempPref'));
    }
    const tempF = document.querySelector('#tempF');
    const tempC = document.querySelector('#tempC');
    tempF.addEventListener('click', (e) => {
        tempToggle('fahrenheit')});
    tempC.addEventListener('click', (e) => {
        tempToggle('celsius')});
}

init();