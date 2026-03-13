const newClassName = document.getElementById("newClassName")
const addClassBtn = document.getElementById("addClassBtn")
const classListContainer = document.getElementById("classListContainer")
const api = "http://127.0.0.1:3000"

let students = [
    { id: 101, name: 'Olivia Chen', age: 16, class_id: 1, marks: 94, present: 23 },
    { id: 102, name: 'Marcus Reed', age: 17, class_id: 2, marks: 81, present: 19 },
    { id: 103, name: 'Sofia Khan', age: 16, class_id: 3, marks: 76, present: 24 },
    { id: 104, name: 'Liam Wright', age: 15, class_id: 4, marks: 67, present: 12 },
    { id: 105, name: 'Emma Watson', age: 17, class_id: 1, marks: 89, present: 26 },
    { id: 106, name: 'Noah Brown', age: 16, class_id: 2, marks: 93, present: 22 },
    ];

let classes = [
    { id: 1, name: '10-A' },
    { id: 2, name: '10-B' },
    { id: 3, name: '11-A' },
    { id: 4, name: '9-C' },
    { id: 5, name: '12-B' },
    ];



newClassName.addEventListener("keyup", (event)=>{
    if(event.key==="Enter"){
        loadNewClass();
        
    }
})

addClassBtn.addEventListener("click", ()=>{
    loadNewClass();
    
})

// const loadNewClass = async () => {
//     const newClass = newClassName.value; 
//     console.log(newClass);
//     const res = await fetch(api + "/ccreate",{
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//             name: newClass
//         })
//     })
//     const data = await res.json()
//     console.log(data);
    
//     newClassName.value = "";
    
// }

const loadNewClass = () =>{
    const newClassValue = newClassName.value;
    const newClassId = classes.length
    const newClass = {
        id: newClassId,
        name: newClassValue
    }
    classes.push(newClass)
    displayClasses();
    // console.log(classes);
}

const displayClasses = () => {    
    classListContainer.innerHTML = ""

    classes.forEach(el=>{
        const classBadge = document.createElement("span")
        classBadge.innerHTML = `
        <span class="badge bg-blue-900/60 text-blue-200 py-3 px-3 border border-blue-700/50 flex items-center gap-1">
            ${el.name} 
            <button onclick="deleteClass(${el.id})" class="delete-class-btn text-blue-300 hover:text-white" data-class-id="${el.id}">✕</button>
          </span>
        `;
        classListContainer.appendChild(classBadge)
        console.log(el);
    })
}
displayClasses();

const deleteClass = (id) =>{
    let deletedClasses = classes.filter(el=> el.id != id)
    classes = deletedClasses
    displayClasses()    
}