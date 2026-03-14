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

// const api = "http://127.0.0.1:3000"
const api = "https://student-manager-s0ou.onrender.com"

let statTotal = document.getElementById("statTotal")
let statClasses = document.getElementById("statClasses")
let statAvgMarks = document.getElementById("statAvgMarks")
let statPresentAvg = document.getElementById("statPresentAvg")
let statTotalPresent = document.getElementById("statTotalPresent")
let editingStudentId = null
let classes = []


const showStats = async () => {
    const res = await fetch(api+"/stats")
    const stats = await res.json()
    // console.log(stats);
    statTotal.innerText = stats.total_students
    statClasses.innerText = stats.total_classes
    statAvgMarks.innerText = stats.avg_marks.toFixed(2)
    statPresentAvg.innerText = stats.avg_present.toFixed(2)
    statTotalPresent.innerText = stats.total_present
    
}


// Class Crud================================
// ===============Create class===============
newClassName.addEventListener("keyup", (event)=>{
    if(event.key==="Enter"){
        loadNewClass();
        
    }
})

addClassBtn.addEventListener("click", ()=>{
    loadNewClass();
    
})


// ==================Create class===============
const loadNewClass = async () =>{

    const newClassValue = newClassName.value;

    const res = await fetch(api + "/classes",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: newClassValue
        })
    });

    if(!res.ok){
    console.log("Request failed")
    return
    }
    newClassName.value = "";
    await displayClasses();
    valueSelect();
    showStats();
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
    classes = Array.isArray(data) ? data : []
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
    valueSelect();
    showStats();
}

// ===============Delete Class===================
// ===============Delete Class===================
const deleteClass = async (classId) => {
    // get students
    const res = await fetch(api + "/students")
    
    // Even if status is not ok, try to parse the response
    let students = []
    try {
        students = await res.json()
        // Ensure students is an array
        if (!Array.isArray(students)) {
            students = []
        }
    } catch (e) {
        console.log("Error parsing students response:", e)
        students = []
    }

    // check if class has students
    const hasStudents = students.some(s => s.class_id === classId)

    if (hasStudents) {
        const ok = confirm("This class has students. Delete them all?")
        if (!ok) return

        // delete students of that class
        await fetch(api + "/students/class/" + classId, {
            method: "DELETE"
        })
    }

    // delete class
    await fetch(api + "/classes/" + classId, {
        method: "DELETE"
    })

    displayClasses()
    displayStudents()
}

const valueSelect = () => {
    classSelect.innerHTML = '<option value="">— select class —</option>' + 
    classes.map(c => `<option value="${c.id}">${c.name}</option>`)
    filterClass.innerHTML = '<option value="">— select class —</option>' + 
    classes.map(c => `<option value="${c.id}">${c.name}</option>`)
}


// Student Crud======================================

studentListContainer.addEventListener("dblclick", async (event) => {
    if (event.target.closest(".student-card")) {
        if (event.target.closest(".delete-student")) return        

        const card = event.target.closest(".student-card")
        const id = parseInt(card.dataset.studentId)

        editingStudentId = id
        const res = await fetch(api + "/students/"+id)
        const student =  await res.json()
        
        if (!student) return

        studentName.value = student.name
        studentAge.value = student.age
        studentMarks.value = student.marks
        studentPresent.value = student.present
        classSelect.value = student.class_id
    }
})

studentListContainer.addEventListener("click",(event)=>{

    if(event.target.closest(".delete-student")){        
        const btn = event.target.closest(".delete-student")
        const id = parseInt(btn.dataset.studentId)
        console.log("from event function");
        
        deleteStudent(id)
    }

})

addStudentBtn.addEventListener("click", ()=>{
    createStudent();
})

// ===================Update Student==============
updateStudentBtn.addEventListener("click", async () => {
    if (editingStudentId === null) return
    const name = studentName.value
    const age = parseInt(studentAge.value)
    const marks = parseInt(studentMarks.value)
    const present = parseInt(studentPresent.value)
    const class_id = parseInt(classSelect.value)

    const response = await fetch(api + "/students/"+ editingStudentId,{
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name,
            marks,
            age,
            present,
            class_id,
        })
    })
    const data = await response.json()
    console.log(data);
    
    displayStudents()

    // Reset form
    studentName.value = ""
    studentAge.value = ""
    studentMarks.value = ""
    studentPresent.value = ""
    classSelect.value = ""
    editingStudentId = null
})


deleteStudentBtn.addEventListener("click", async ()=>{
    const res = await fetch(api+"/students/"+editingStudentId,{
        method: "DELETE"
    })
    const data = await res.text()
    studentName.value = ""
    studentAge.value = ""
    studentMarks.value = ""
    studentPresent.value = ""
    classSelect.value = ""
    editingStudentId = null
    displayStudents()
})


// ==================Create Student======================

const createStudent = async () => {
    const name = studentName.value
    const age = parseInt(studentAge.value)
    const marks = parseInt(studentMarks.value)
    const present = parseInt(studentPresent.value)
    const class_id = parseInt(classSelect.value)    

    const res = await fetch(api+"/students",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: name,
            age: age,
            marks: marks,
            present: present,
            class_id: class_id
        })
    })
    // const newStudent = await res.json();
    // students.push(newStudent);
    displayStudents()
    

    studentName.value = "";
    studentAge.value = "";
    studentMarks.value = "";
    studentPresent.value = "";
    classSelect.value = "";
}


// ======================Read Student=====================

const displayStudents = async () => {
    const res = await fetch(api + "/students")
    const students = await res.json()   
     if (!Array.isArray(students)) {
        console.error("Expected array but got:", students)
        return
    } 

    studentListContainer.innerHTML = "";
    students.forEach(s => {
        
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
    showStats();
}

function getClassName(classId){
    const found = classes.find(c => c.id === classId)    
    return found ? found.name : "—"
}


// ======================Delete Student=====================

const deleteStudent = async(id) => {    
    const res = await fetch(api+"/students/"+id,{
        method: "DELETE"
    })
    const data = await res.text()
    displayStudents()
}

// ================Filter Students=================

const filterStudents = async () => {    
    let url = api + "/students/filtered?"

    const name = filterName.value
    const classId = filterClass.value
    const marks = filterMarksMin.value
    const present = filterPresentMin.value

    if(name){
        url += "name=" + name + "&"
    }

    if(classId){
        url += "class_id=" + classId + "&"
    }

    if(marks){
        url += "marks=" + marks + "&"
    }

    if(present){
        url += "present=" + present + "&"
    }

    const res = await fetch(url)
    const students = await res.json()
    studentListContainer.innerHTML = "";
    students.forEach(s => {
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

applyFilterBtn.addEventListener("click", filterStudents)

valueSelect();
showStats();

const init = async () => {
    await displayClasses();   // load classes first
    await displayStudents();  // then load students
}

init();