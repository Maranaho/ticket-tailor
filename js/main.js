import {
    months,
    days,
    ukAddresses
} from "./utils.js"

const threshold = 20
const eventListElt = document.getElementById("eventList")
let croppedEvents = null

const handleData = data =>{
    const formattedEvents = Object.keys(data).reduce((acc,eventKey)=>{

        const event = data[eventKey]
        const startTime = event.start_time
        const endTime = event.end_time
        const date = new Date(startTime)
        const year = date.getFullYear()
        const day = date.getDay()
        const weekday = days[day]
        const eventMonth = `${date.getMonth()}_${year}`
        const address = ukAddresses[event.address]
        const newEvent = {
            day,
            weekday,
            address,
            name:event.name,
            startTime,
            endTime,
            selected:false,
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
        const croppedData = Object.fromEntries(
            Object.entries(initialData).slice(0, threshold)
        )
        croppedEvents = handleData(croppedData)
        init()
    } catch (error) {
        console.error('Error loading the JSON file:', error)
    }
}

const populateList = ()=>{

    //refresh the list
    eventListElt.innerHTML = ""

    //Populate the list
    Object.keys(croppedEvents).forEach(yearKey=>{

        // Year level
        const year = croppedEvents[yearKey]
        const yearElt = document.createElement("article")
        yearElt.classList.add("Year")
        
        const yearTitleElt = document.createElement("h3")        
        yearTitleElt.innerText = yearKey
        yearElt.appendChild(yearTitleElt)
        
        Object.keys(year).forEach(monthKey=>{
            
            // Month level
            const month = year[monthKey]
            const monthElt = document.createElement("article")
            monthElt.classList.add("Month")

            const monthTitleElt = document.createElement("h4")        
            const monthIdx = Number(monthKey.split("_")[0])
            monthTitleElt.innerText = months[monthIdx].slice(0,3)
            monthElt.appendChild(monthTitleElt)
            
            Object.keys(month).forEach(eventKey=>{
                
                // Event level

                //Build out a single event
                const path = `${yearKey}/${monthKey}/${eventKey}`
                const eventElt = document.createElement("article")
                eventElt.classList.add("Event")
                eventElt.setAttribute("data-event-key",path)
                const { 
                    name,
                    selected,
                    startTime,
                    endTime,
                    day,
                    isVirtual,
                    weekday,
                    address,
                } = month[eventKey]


                // Checkbox
                const selectLabelElt = document.createElement("label")
                const checkboxElt = document.createElement("input")
                checkboxElt.type = "checkbox"
                selectLabelElt.setAttribute("for",eventKey)
                checkboxElt.id = eventKey
                checkboxElt.checked = selected
                eventElt.classList.toggle("selected", selected)
                selectLabelElt.appendChild(checkboxElt)
                eventElt.appendChild(selectLabelElt)
                
                // Date
                const dateElt = document.createElement("time")
                console.log(month[eventKey]);
                dateElt.dateTime = startTime.slice(0,10)
                const dayElt = document.createElement("span")
                const weekDayElt = document.createElement("span")
                dayElt.innerText = day
                weekDayElt.innerText = weekday.slice(0,3)
                dateElt.appendChild(dayElt)
                dateElt.appendChild(weekDayElt)
                eventElt.appendChild(dateElt)
                
                
                // Info
                const infoElt = document.createElement("div")
                infoElt.classList.add("info")
                
                // Title
                const titleElt = document.createElement("h5")
                titleElt.innerText = name
                infoElt.appendChild(titleElt)
                
                // Start and end time
                const startAndEndTime = document.createElement("span")
                startAndEndTime.classList.add("startAndEndTime")
                // Start time
                const startTimeElt = document.createElement("span")
                startTimeElt.innerText = moment(startTime)
                .minute(Math.round(moment(startTime).minute() / 30) * 30)
                .second(0)
                .format('LT')
                startAndEndTime.appendChild(startTimeElt)

                // End time
                const endTimeElt = document.createElement("span")
                endTimeElt.innerText = moment(endTime)
                .minute(Math.round(moment(endTime).minute() / 30) * 30)
                .second(0)
                .format('LT')
                startAndEndTime.appendChild(endTimeElt)
                
                // Location
                let locationElt
                if(isVirtual) {
                    locationElt = document.createElement("span")
                    locationElt.innerText = "Online"
                } else {
                    locationElt = document.createElement("p")
                    address.split(",").forEach(line=>{
                        const addressLine = document.createElement("span")
                        addressLine.innerText = line
                        locationElt.appendChild(addressLine)
                    })
                }
                locationElt.classList.add("location")

                // Fill up the info
                infoElt.appendChild(startAndEndTime)
                infoElt.appendChild(locationElt)

                // Fill up the event
                eventElt.appendChild(infoElt)
                // Fill up the month
                monthElt.appendChild(eventElt)
            })
            
            // Fill up the year
            yearElt.appendChild(monthElt)
            
        })
        
        // Fill up the event list
        eventListElt.appendChild(yearElt)
    })
    
}

const handleEventClick = e =>{
    const keyAttribute = "data-event-key"
    const eventElt = e.target.closest(`[${keyAttribute}]`)
    if(eventElt){
        const eventKey = eventElt.getAttribute(keyAttribute)
        const path = eventKey.split("/")
        croppedEvents[path[0]][path[1]][path[2]].selected ^= true

        populateList()
    }
    
}

const init = ()=>{
    populateList()
    eventListElt.addEventListener("click",handleEventClick)
}

// getData()
