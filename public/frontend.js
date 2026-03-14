const classListContainer = document.getElementById("classListContainer")
const newClassName = document.getElementById("newClassName")
const addClassBtn = document.getElementById("addClassBtn")
const classSelect = document.getElementById("studentClassId")
const filterClass = document.getElementById("filterClass")
const studentId = document.getElementById("studentId")
const studentName = document.getElementById("studentName")
const studentAge = document.getElementById("studentAge")
const studentMarks = document.getElementById("studentMarks")
const studentPresent = document.getElementById("studentPresent")
const addStudentBtn = document.getElementById("addStudentBtn")
const updateStudentBtn = document.getElementById("updateStudentBtn")
const studentListContainer = document.getElementById("studentListContainer")
const deleteStudentBtn = document.getElementById("deleteStudentBtn")
const filterName = document.getElementById("filterName")
const filterMarksMin = document.getElementById("filterMarksMin")
const filterPresentMin = document.getElementById("filterPresentMin")
const applyFilterBtn = document.getElementById("applyFilterBtn")

const api = "http://127.0.0.1:3000"

let editingStudentId = null
let students = []
let classes = []


newClassName.addEventListener("keyup", (event)=>{
    if(event.key==="Enter"){
        loadNewClass();
        
    }
})

addClassBtn.addEventListener("click", ()=>{
    loadNewClass();
    
})


// =============Create class=============
const loadNewClass = async () =>{

    const newClassValue = newClassName.value;
    // const newClassId = classes.length + 1

    const res = await fetch(api + "/classes",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            // id: newClassId,
            name: newClassValue
        })
    });

    if(!res.ok){
    console.log("Request failed")
    return
    }

    // const data = await res.json();

    newClassName.value = "";

    await displayClasses();
    valueSelect();
}

// ===============Read Classes==================
const displayClasses = async () => {    
    classListContainer.innerHTML = ""
    const res = await fetch(api + "/classes")
    if(!res.ok){
    console.log("Request failed")
    return
    }
    const data = await res.json()
    classes = data
    // console.log(classes);
    classes.forEach(el=>{
        const classBadge = document.createElement("span")
        classBadge.innerHTML = `
        <span class="badge bg-blue-900/60 text-blue-200 py-3 px-3 border border-blue-700/50 flex items-center gap-1">
            ${el.name} 
            <button onclick="deleteClass(${el.id})" class="delete-class-btn text-blue-300 hover:text-white">✕</button>
        </span>
        `
        classListContainer.appendChild(classBadge)
    })
}


const deleteClass = async (id) =>{
    const res = await fetch(api + "/classes/" +id,{
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        }
    })
    // const data = await res.text();
    // console.log(data);
    await displayClasses()    
}





// Student Crud
const valueSelect = () => {
    classSelect.innerHTML = '<option value="">— select class —</option>' + 
    classes.map(c => `<option value="${c.id}">${c.name}</option>`)
    filterClass.innerHTML = '<option value="">— select class —</option>' + 
    classes.map(c => `<option value="${c.id}">${c.name}</option>`)
    // displayClasses()
}

addStudentBtn.addEventListener("click", ()=>{
    createStudent();
})
const createStudent = () => {
    const id = students.length + 1
    const name = studentName.value
    const age = parseInt(studentAge.value)
    const marks = parseInt(studentMarks.value)
    const present = parseInt(studentPresent.value)
    const class_id = parseInt(classSelect.value)    
    const student = {
        id,
        name,
        age,
        class_id,
        marks,
        present,
    }

    students.push(student)
    displayStudents(students)
    studentName.value = ""
    studentAge.value = ""
    studentMarks.value = ""
    studentPresent.value = ""
    classSelect.value = ""
}

const displayStudents = (arr) => {
    studentListContainer.innerHTML = "";
    arr.forEach(s => {
        const list = document.createElement("div") 
        list.innerHTML = `
        <div class="student-card cursor-pointer" data-student-id="${s.id}">
              <div class="flex items-center gap-3 w-3/12">
                <span class="avatar-placeholder text-sm">${s.name.charAt(0)}</span>
                <div>
                  <div class="font-semibold text-white text-sm">${s.name}</div>
                  <div class="flex text-xs text-blue-300/70 gap-2 mt-0.5">
                    <span>ID ${s.id}</span>
                    <span>●</span>
                    <span>${s.age} y</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-4 w-5/12 justify-start">
                <span class="class-badge">${getClassName(s.class_id)}</span>
                <span class="mark-pill">📊 ${s.marks}%</span>
                <span class="attendance-icon ${s.present > 20 ? 'bg-blue-900/40 text-blue-300 border border-blue-800' : 'bg-amber-900/30 text-amber-300'}">📅 ${s.present}</span>
              </div>
              <div class="flex items-center gap-1">
                <button class="action-btn edit-student" data-student-id="${s.id}">✎ edit</button>
                <button class="action-btn delete-student" data-student-id="${s.id}">🗑️ delete</button>
              </div>
            </div>
        `;
        studentListContainer.appendChild(list)
        
    } )
}

function getClassName(classId){
    const found = classes.find(c => c.id === classId)    
    return found ? found.name : "—"
}


// EDIT

studentListContainer.addEventListener("dblclick", (event) => {
    if (event.target.closest(".student-card")) {
        if (event.target.closest(".delete-student")) return

        const card = event.target.closest(".student-card")
        const id = parseInt(card.dataset.studentId)

        editingStudentId = id  // track which student
        const student = students.find(s => s.id === id)
        if (!student) return

        studentName.value = student.name
        studentAge.value = student.age
        studentMarks.value = student.marks
        studentPresent.value = student.present
        classSelect.value = student.class_id
    }
})

updateStudentBtn.addEventListener("click", () => {
    if (editingStudentId === null) return

    const student = students.find(s => s.id === editingStudentId)
    if (!student) return

    student.name = studentName.value
    student.age = parseInt(studentAge.value)
    student.marks = parseInt(studentMarks.value)
    student.present = parseInt(studentPresent.value)
    student.class_id = parseInt(classSelect.value)

    displayStudents(students)

    // Reset form
    studentName.value = ""
    studentAge.value = ""
    studentMarks.value = ""
    studentPresent.value = ""
    classSelect.value = ""
    editingStudentId = null
})


// DELETE
studentListContainer.addEventListener("click",(event)=>{

    if(event.target.closest(".delete-student")){
        const btn = event.target.closest(".delete-student")
        const id = parseInt(btn.dataset.studentId)

        deleteStudent(id)
    }

})

const deleteStudent = (id) => {
    let newArr = students.filter(el=> el.id !==id)
    students = newArr
    displayStudents(students)
    
}

deleteStudentBtn.addEventListener("click", ()=>{
    // if (editingStudentId === null) return
    students.forEach(el=> {
        if(el.id === editingStudentId){
            let newArr = students.filter(el=> el.id !==editingStudentId)
            students = newArr
            displayStudents(students)

            // Reset form
            studentName.value = ""
            studentAge.value = ""
            studentMarks.value = ""
            studentPresent.value = ""
            classSelect.value = ""
            editingStudentId = null
        }
        else{
            return
        }
    })
})



const filterStudents = () => {
    const name = filterName.value;
    const classId = filterClass.value;    
    const marks = filterMarksMin.value;
    const present = filterPresentMin.value;

    const result = students.filter(student => {

    return (!name || student.name.toLowerCase().includes(name.toLowerCase()))
        && (!classId || student.class_id === parseInt(classId))
        && (!marks || student.marks >= marks)
        && (!present || student.present >= present)

    })
    displayStudents(result)
}

applyFilterBtn.addEventListener("click", filterStudents)

valueSelect();
displayStudents(students);
displayClasses();