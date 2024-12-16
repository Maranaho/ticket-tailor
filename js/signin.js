const formElt = document.getElementById("form") 
const firstNameElt = document.getElementById("firstName") 
const lastNameElt = document.getElementById("lastName") 
const nicknameElt = document.getElementById("nickname") 
const skipElt = document.getElementById("skip") 
const signinElt = document.getElementById("signin") 

const handleFormSubmit = e =>e.preventDefault()

const handleNavigate = sendName =>{
    const baseurl = "search-events.html"
    let url = baseurl + "?nickname=Guest&fullname=Anonymous_User"
    if(sendName){

        let nickname = nicknameElt.value
        let fullname = `${firstNameElt.value}_${lastNameElt.value}`
        if(nickname === "")nickname = "Guest"
        if(firstNameElt.value === "" || lastNameElt.value === "")fullname = "Anonymous_User"
        const nameParams = `?nickname=${nickname}&fullname=${fullname}`
        url = baseurl + nameParams
        
    }
    window.location.href = url
}


formElt.addEventListener("submit",handleFormSubmit)
skipElt.addEventListener("click",()=>handleNavigate())
signinElt.addEventListener("click",()=>handleNavigate(true))

