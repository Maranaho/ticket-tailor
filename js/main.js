import {
    months,
    days,
    ukAddresses
} from "./utils.js"

// const threshold = 100
const transitionDuration = 700
const eventListElt = document.getElementById("eventList")
const searchEventsElt = document.getElementById("searchEvents")
const selectionElt = document.getElementById("selection")
const avatarElt = document.getElementById("avatar")
const submitBtnElt = document.getElementById("submitBtn")
const fullNameElt = document.getElementById("fullName")
const searchEventsbTNElt = document.getElementById("searchEventsbTN")
const resultsLengthEltCtn = document.getElementsByClassName("resultsLength")[0]
const nicknameElts = document.getElementsByClassName("nickname")
const resultsLengthElt = document.getElementById("resultsLength")
const mainElt = document.getElementsByTagName("main")[0]
let fetchedEvents = null
let copyOfFlatData = null
let filteredEvents = {}
let flatFilteredEvents = {}
let searchValue = ""

const handleData = data =>{
    const formattedEvents = Object.keys(data).reduce((acc,eventKey)=>{

        const event = data[eventKey]        
        const startTime = event.start_time
        const endTime = event.end_time
        const date = new Date(startTime)
        const year = date.getFullYear()
        const day = date.getDate()
        const weekday = days[date.getDay()]
        const eventMonth = `${date.getMonth()}_${year}`
        const address = ukAddresses[event.address]
        const newEvent = {
            day,
            weekday,
            address,
            name:event.name,
            startTime,
            endTime,
            selected:event.selected,
            isVirtual:event.virtual
        }

        if(!acc.hasOwnProperty(year)) acc[year] = {}
        if(!acc[year].hasOwnProperty(eventMonth)) acc[year][eventMonth] = {}
        acc[year][eventMonth][eventKey] = newEvent
        return acc

    },{})

    return formattedEvents    
}

const getData = async()=> {
    try {
        const res = await fetch('../events.json')
        if (!res.ok) throw new Error("Ohoh")
        const initialData = await res.json()
        if(!copyOfFlatData) copyOfFlatData = {...initialData}
        fetchedEvents = handleData(initialData)
        init()
    } catch (error) {
        console.error('Error loading the JSON file:', error)
    }
}
const populateList = () => {
    // Refresh the list
    eventListElt.innerHTML = ""
    // Populate the list
    
    Object.keys(filteredEvents).forEach(yearKey => {

        // Year level
        const year = filteredEvents[yearKey];
        const yearElt = document.createElement("article");
        yearElt.classList.add("Year");

        const yearTitleElt = document.createElement("h3");
        yearTitleElt.innerText = yearKey;
        yearElt.appendChild(yearTitleElt);

        Object.keys(year).sort((a, b) => {
            const [monthA, yearA] = a.split('_').map(Number);
            const [monthB, yearB] = b.split('_').map(Number);
            return (yearA - yearB) || (monthA - monthB); 
        }).forEach(monthKey => {

            // Month level
            const month = year[monthKey];
            const monthElt = document.createElement("article");
            monthElt.classList.add("Month");

            const monthTitleElt = document.createElement("h4");
            const monthIdx = Number(monthKey.split("_")[0]);
            monthTitleElt.innerText = months[monthIdx].slice(0, 3);
            monthElt.appendChild(monthTitleElt);

            // Sort events within each month by start time
            Object.keys(month)
                .sort((a, b) => {
                    const startTimeA = new Date(month[a].startTime);
                    const startTimeB = new Date(month[b].startTime);
                    return startTimeA - startTimeB;
                })
                .forEach(eventKey => {

                    // Event level

                    // Build out a single event
                    const path = `${yearKey}/${monthKey}/${eventKey}`;
                    const eventElt = document.createElement("article");
                    eventElt.classList.add("Event");
                    eventElt.setAttribute("data-event-key", path);
                    const { 
                        name, 
                        selected, 
                        startTime, 
                        endTime, 
                        day, 
                        isVirtual, 
                        weekday, 
                        address 
                    } = month[eventKey];

                    // Checkbox
                    const selectLabelElt = document.createElement("label");
                    const checkboxElt = document.createElement("input");
                    checkboxElt.type = "checkbox";
                    selectLabelElt.setAttribute("for", eventKey);
                    checkboxElt.id = eventKey;
                    checkboxElt.checked = selected;
                    eventElt.classList.toggle("selected", selected);
                    selectLabelElt.appendChild(checkboxElt);
                    eventElt.appendChild(selectLabelElt);

                    // Date
                    const dateElt = document.createElement("time");
                    dateElt.dateTime = startTime.slice(0, 10);
                    const dayElt = document.createElement("span");
                    const weekDayElt = document.createElement("span");
                    dayElt.innerText = day;
                    weekDayElt.innerText = weekday.slice(0, 3);
                    dateElt.appendChild(weekDayElt);
                    dateElt.appendChild(dayElt);
                    eventElt.appendChild(dateElt);

                    // Info
                    const infoElt = document.createElement("div");
                    infoElt.classList.add("info");

                    // Title
                    const titleElt = document.createElement("h5");
                    titleElt.innerText = name;
                    infoElt.appendChild(titleElt);

                    // Start and end time
                    const metaElt = document.createElement("div");
                    metaElt.classList.add("meta");
                    const startAndEndTime = document.createElement("span");
                    startAndEndTime.classList.add("startAndEndTime");

                    // Start time
                    const startTimeElt = document.createElement("span");
                    startTimeElt.innerText = moment(startTime)
                        .minute(Math.round(moment(startTime).minute() / 30) * 30)
                        .second(0)
                        .format('LT');
                    startAndEndTime.appendChild(startTimeElt);

                    // End time
                    const endTimeElt = document.createElement("span");
                    endTimeElt.innerText = moment(endTime)
                        .minute(Math.round(moment(endTime).minute() / 30) * 30)
                        .second(0)
                        .format('LT');
                    startAndEndTime.appendChild(endTimeElt);

                    // Location
                    let locationElt;
                    if (isVirtual) {
                        locationElt = document.createElement("span");
                        locationElt.innerText = "Online";
                    } else {
                        locationElt = document.createElement("p");
                        address.split(",").forEach(line => {
                            const addressLine = document.createElement("span");
                            addressLine.innerText = line;
                            locationElt.appendChild(addressLine);
                        });
                    }
                    locationElt.classList.add("location");
                    metaElt.appendChild(startAndEndTime);

                    // Fill up the info
                    metaElt.appendChild(locationElt);
                    infoElt.appendChild(metaElt);

                    // Fill up the event
                    eventElt.appendChild(infoElt);
                    // Fill up the month
                    monthElt.appendChild(eventElt);
                });

            // Fill up the year
            yearElt.appendChild(monthElt);
        });

        // Fill up the event list
        eventListElt.appendChild(yearElt);
    });
};

let selectedEvents = {}
const updateKeysList = event =>{
    const { unformattedKey, name } = event
    const key = unformattedKey.replace("_","").split("/").join("")
    
    if(!selectedEvents.hasOwnProperty(key)) selectedEvents[key] = name
    else delete selectedEvents[key]
    
}

const checkIfAnyAreSelected = ()=>{
    const atLeastOneSelection = Object.keys(selectedEvents).length    
    const btnIsDisabled = submitBtnElt.disabled
    if(atLeastOneSelection && btnIsDisabled) submitBtnElt.removeAttribute("disabled")
    if(!atLeastOneSelection && !btnIsDisabled) submitBtnElt.setAttribute("disabled", "true")
}

const handleEventClick = e =>{
    const keyAttribute = "data-event-key"
    const eventElt = e.target.closest(`[${keyAttribute}]`)
    if(eventElt){
        
        const eventKey = eventElt.getAttribute(keyAttribute)
        
        const path = eventKey.split("/")
        
        copyOfFlatData[path[2]].selected ^= true
        filteredEvents[path[0]][path[1]][path[2]].selected ^= true
        const name = filteredEvents[path[0]][path[1]][path[2]].name
        
        populateList()
        updateKeysList({unformattedKey:eventKey,name})
        checkIfAnyAreSelected()
    }
    
}

let timeout
const handleMainPageClick = e =>{
    const hitAttribute = "data-target"
    const hitTarget = e.target.closest(`[${hitAttribute}]`)
    if(hitTarget){
        if(hitTarget.getAttribute(hitAttribute) === "blank"){
            resultsLengthEltCtn.classList.remove("show")
            eventListElt.classList.remove("show")
            timeout = setTimeout(()=>{
                eventListElt.classList.add("hidden")
            },transitionDuration)
        }
    }

    const selection = Object.keys(selectedEvents).length
    selectionElt.innerText = `${selection} selected.`

}

const showDropdown = ()=>{
    clearTimeout(timeout)
    eventListElt.classList.remove("hidden")
    resultsLengthEltCtn.classList.add("show")
    eventListElt.classList.add("show")
}


const unselectAllEvents = ()=>{
    submitBtnElt.setAttribute("disabled", "true")
    getData()
    selectedEvents = {}
    fetchedEvents = null
    copyOfFlatData = null
    filteredEvents = {}
    flatFilteredEvents = {}
    searchValue = ""
}

const postEvents = () => {
    const placeholderUrl = "https://jsonplaceholder.typicode.com/posts"
    const data = {
        ids: Object.keys(selectedEvents).join(",")
    }

    fetch(placeholderUrl, { 
        method: "POST",
        headers: {
            "Content-Type": "application/json" 
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(() => {
        const nbOfEvents = Object.keys(selectedEvents).length
        const successMessage = `Success!\n You posted ${nbOfEvents} events:\n ${String(Object.keys(selectedEvents))}`
        unselectAllEvents()
        alert(successMessage);
    })
    .catch(error => {
        console.error("Error:", error)
    })
}

const handleSubmit = ()=>{
    searchValue = ""
    searchEventsElt.value = ""
    postEvents()
}

const filterEvents = () =>{

    const loCaseValue = searchValue.toLowerCase()
    flatFilteredEvents = Object.keys(copyOfFlatData).reduce((acc,eventKey)=>{
        const loCaseName = copyOfFlatData[eventKey].name.toLowerCase()
        
        const eventCanGoThru = loCaseName.includes(loCaseValue) || loCaseValue === ""        
        if(eventCanGoThru) acc[eventKey] = copyOfFlatData[eventKey]
        return acc
    },{})
    
    filteredEvents = handleData(flatFilteredEvents)
    populateList()
}

const handleChange = e =>{
    const val = e.target.value
    searchValue = val
    filterEvents()
    checkIfNoResults()
}

const handleFocus = e =>{
    e.target.select()
}

const checkIfNoResults = ()=>{
    const nb = Object.keys(flatFilteredEvents).length
    const nbOfResults = nb === 200 ? 234 : nb
    const selection = Object.keys(selectedEvents).length
    const eventsCountMessage = `${nbOfResults} event${nbOfResults > 1 ?"s":""}`
    resultsLengthElt.innerText = nb > 0 ? eventsCountMessage : `Nothing here ${selection > 0 ?"but":"and"},`

    eventListElt.classList.toggle("empty",nb === 0)
}

const getName = ()=>{
    const url = window.location.href;

    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has('nickname') && urlParams.has('fullname')) {
        const nickname = urlParams.get('nickname');
        const fullname = urlParams.get('fullname');
        fullNameElt.innerText = fullname.split("_").join(" ")
        Array.from(nicknameElts).forEach(elt=>elt.innerText = nickname)
        avatar.innerText = nickname[0]
    }
}

const init = ()=>{
    filterEvents()
    populateList()
    getName()
}


eventListElt.addEventListener("click",handleEventClick)
mainElt.addEventListener("click",handleMainPageClick)
searchEventsElt.addEventListener("click",showDropdown)
searchEventsElt.addEventListener("input",handleChange)
searchEventsElt.addEventListener("focus",handleFocus)
searchEventsbTNElt.addEventListener("click",showDropdown)
submitBtnElt.addEventListener("click",handleSubmit)
eventListElt.classList.add("hidden")
getData()

// Cleanup
window.addEventListener("beforeunload", () => {
    clearTimeout(timeout)
})
