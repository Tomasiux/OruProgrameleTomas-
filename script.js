function getFormatTime(dt) {
    let dateObj = new Date(dt * 1000);
    let hours = dateObj.getUTCHours();
    let minutes = dateObj.getUTCMinutes();

    let timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    return timeString;
}
function iniciarMap(lon,lat){
    var coord = {lat: 55.7172 ,lng: 21.1175};
    var map = new google.maps.Map(document.getElementById('map'),{
      zoom: 10,
      center: coord
    });
    var marker = new google.maps.Marker({
      position: coord,
      map: map
    });
}
function getCurrentDay(dt, length = 'full') {
    let days = ['Sekmadienis', 'Pirmadienis', 'Antradienis', 'Trečiadienis', 'Ketvirtadienis', 'Penktadienis', 'Šeštadienis'];
    let dateObj = new Date(dt * 1000);

    let currentDay = days[dateObj.getDay()];
    if (length === 'full') {
        return ucFirst(currentDay);
    } else {
        return ucFirst(currentDay.slice(0, length));
    }
}

function getCurrentDate(dt, separator) {
    let month = ['SAU', 'VAS', 'KOV', 'BAL', 'GEG', 'BIRZ', 'LIE', 'RUGP', 'RUGS', 'SPA', 'LAP', 'GRUO']
    let dateObj = new Date(dt * 1000);

    let currentDate = dateObj.getDate();
    let currentMonth = month[dateObj.getMonth()];

    return `${currentDate}${separator}${ucFirst(currentMonth)}`;
}
function getDirection(deg) {
    var directions = ["Siaures", "Siaures vakaru", "Vakaru", "Pietvakariu", "Pietu", "Pietryciu", "Rytu", "Siaures rytu"];
    var index = Math.round(((deg %= 360) < 0 ? deg + 360 : deg) / 45) % 8;
    return directions[index];
}

function ucFirst(str) {
    if (!str) return str;
    return str[0].toUpperCase() + str.slice(1);
}

function printHoursForecast(array, timezone) {
    let output = document.querySelectorAll('.hour-block');
    for (let i = 0; i < output.length; i++) {
        output[i].children[0].innerHTML = `<img src="https://openweathermap.org/img/wn/${array[i].weather[0].icon}.png" alt="Weather icon">`;
        output[i].children[1].innerHTML = Math.round(array[i].temp - 273.15) + '&deg;';
        output[i].children[2].textContent = getFormatTime(array[i].dt + timezone);
    }
}

function printDailyForecast(array, timezone) {
    let output = document.querySelectorAll('.week-wrapper');
    for (let i = 0; i < output.length; i++) {
        output[i].children[0].children[0].textContent = getCurrentDay((array[i].dt + timezone), 3).toUpperCase();
        output[i].children[0].children[1].textContent = getCurrentDate((array[i].dt + timezone), ' ');
        output[i].children[1].children[0].innerHTML = Math.round(array[i].temp.max - 273.15) + '&deg;';
        output[i].children[1].children[1].innerHTML = Math.round(array[i].temp.min - 273.15) + '&deg;';
        output[i].children[2].children[0].innerHTML = `<img src="https://openweathermap.org/img/wn/${array[i].weather[0].icon}.png" alt="Weather icon">`;
        output[i].children[2].children[1].textContent = ucFirst(array[i].weather[0].description);
    }
}

function showWeather() {
    let url = '';

    const apiKey = '3ab2367d43db37f83f51914c9dcb87f4'
    if (arguments.length === 1) {
        url = `https://api.openweathermap.org/data/2.5/weather?q=${arguments[0]}&lang=lt&appid=${apiKey}`
    } else {
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${arguments[0]}&lon=${arguments[1]}&lang=lt&appid=${apiKey}`
    }
    fetch(url)
        .then(function (resp) {
            return resp.json()
        })
        .then(function (data) {
            document.querySelector('.city').textContent =`${data.name}, ${data.sys.country}`;
            document.querySelector('.date').textContent = `${getCurrentDay(data.dt)}, ${getCurrentDate((data.dt), ' ')}`;
            document.querySelector('.temp').innerHTML = Math.round(data.main.temp - 273.15) + '&deg;';
            document.querySelector('.condition').textContent = data.weather[0]['description'];
            document.querySelector("#deg").innerText = getDirection(data.wind.deg) + " vejas";
            document.querySelector('.icon-big').innerHTML = `<img src="https://openweathermap.org/img/wn/${data.weather[0]['icon']}@2x.png" alt="Weather icon">`;
            document.querySelector('#humidity').textContent = data.main.humidity + '%';
            document.querySelector('#wind').textContent = data.wind.speed + ' m/s';
            document.querySelector('#sunrise').textContent = getFormatTime(data.sys.sunrise + data.timezone);
            document.querySelector('#sunset').textContent = getFormatTime(data.sys.sunset + data.timezone);
            document.querySelector('#length').textContent = getFormatTime(data.sys.sunset - data.sys.sunrise);
            const { lon, lat } = data.coord;
            document.body.style.backgroundImage =
      "url('https://source.unsplash.com/1600x900/?" + data.name + "')";

            fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${data.coord.lat}&lon=${data.coord.lon}&exclude=current&lang=lt&appid=${apiKey}`)
                .then(function (resp) {
                    return resp.json()
                })
                .then(function (data) {
                    printHoursForecast(data.hourly, data.timezone_offset);
                    printDailyForecast(data.daily, data.timezone_offset);
                    document.querySelector('.result').classList.remove('hidden');
                    document.querySelector('.loading').classList.add('hidden');
                    document.querySelector('.wrapper').classList.remove('error');
                })
                .catch(function (error) {

                });
        })
        .catch(function (error) {

            document.querySelector('.loading').classList.add('hidden');
            document.querySelector('.wrapper').classList.add('error');
        });

}

document.querySelector('.search__button').onclick = function (e) {
    e.preventDefault();
    document.querySelector('.result').classList.add('hidden');
    let input = document.querySelector('.search__input');
    if (input.value) {
        input.style.border = '1px dashed #303030';
        showWeather(input.value);
        input.value = '';
        document.querySelector('.loading').classList.remove('hidden');
        this.disabled = false;
    } else {
        input.style.border = '1px dashed red';
        this.disabled = false;
    }
}
;