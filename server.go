package main

import (
	"fmt"
	"strconv"
	"log"
	"os"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/static"

	// "gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)


type Student struct {
	ID      uint   `json:"id" gorm:"primaryKey"`
	Name    string `json:"name"`
	Age     int    `json:"age"`
	ClassID int    `json:"class_id"`
	Marks   int    `json:"marks"`
	Present int    `json:"present"`
}

type Class struct {
	ID   uint   `json:"id" gorm:"primaryKey"`
	Name string `json:"name"`
}

func main(){
	// dsn := "root:@tcp(127.0.0.1:3306)/student_db?charset=utf8mb4&parseTime=True&loc=Local"
	// dsn := "postgresql://mydatabase_0mo6_user:c36WMGCrVLYxvaPktol6R1ChjZDrWAV3@dpg-d6ovdtfafjfc739enl5g-a.oregon-postgres.render.com/mydatabase_0mo6"
	dsn := "postgresql://neondb_owner:npg_sX0YgAEw1hOG@ep-young-cloud-ad9s130n-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
	// dsn := os.Getenv("postgresql://neondb_owner:npg_sX0YgAEw1hOG@ep-young-cloud-ad9s130n-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require")
	// if dsn == "" {
	// 	log.Fatal("DATABASE_URL not set")
	// }
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	} 
	fmt.Println("Database connected!")

	// Migrate the schema
	db.AutoMigrate(&Class{}, &Student{})

	app := fiber.New()
	app.Use(cors.New())
	

	// Class Roues
	// ====================Read Classes=======================
	app.Get("/classes", func(c fiber.Ctx) error {
	var classes []Class
	result := db.Find(&classes)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}
	return c.JSON(classes)
	})

	// ===================Create Class===================
	app.Post("/classes",func(c fiber.Ctx) error {
		var newClass Class
		if err := c.Bind().Body(&newClass); err != nil {
			return c.Status(400).JSON(fiber.Map{
				"error": "Invalid input",
			})
		}
		var existing Class
		db.Where("name = ?", newClass.Name).First(&existing)
		
		
		if existing.ID != 0 {
			return c.JSON(existing)
		}
		db.Create(&newClass)
		return c.JSON(newClass)
	})

	// ===================Delete Class====================
	app.Delete("/classes/:id", func(c fiber.Ctx)error{
		id, err := strconv.Atoi(c.Params("id"))
		if err != nil {
			return c.Status(400).JSON(fiber.Map{
				"error": "Invalid ID format",
			})
		}
		
		// First check if class exists
		var class Class
		result := db.First(&class, id)
		if result.Error != nil {
			return c.Status(404).JSON(fiber.Map{
				"error": "Class not found",
			})
		}
		
		// Delete the class
		db.Delete(&Class{}, id)
		return c.SendString("Deleted")
	})


	// Student Routes

	// =================Create Student=================
	
	app.Post("/students", func(c fiber.Ctx)error{
		var newStudent Student
		if err:= c.Bind().Body(&newStudent); err != nil{
			return c.Status(400).JSON(fiber.Map{
			"error": "Invalid input",

		})}
		db.Create(&newStudent)
		return c.JSON(newStudent)
	})

	// =================Read Students================
	// =================Read Students================
app.Get("/students",func(c fiber.Ctx)error{
    var students []Student
    result := db.Find(&students)
    if result.Error != nil {
        return c.Status(500).JSON(fiber.Map{
            "error": result.Error.Error(),
        })
    }
    // Always return 200 with the students array (which could be empty)
    return c.Status(200).JSON(students)
})

	// ================Read with filtered=================
	app.Get("/students/filtered", func(c fiber.Ctx) error {

	name := c.Query("name")
	classID := c.Query("class_id")
	marks := c.Query("marks")
	present := c.Query("present")

	query := db.Model(&Student{})

	if name != "" {
		query = query.Where("name LIKE ?", "%"+name+"%")
	}

	if classID != "" {
		query = query.Where("class_id = ?", classID)
	}

	if marks != "" {
		query = query.Where("marks >= ?", marks)
	}

	if present != "" {
		query = query.Where("present >= ?", present)
	}

	var students []Student
	query.Find(&students)

	return c.JSON(students)
	})

	// ===================Get Single Student=============
	app.Get("/students/:id", func(c fiber.Ctx)error{
		id, err := strconv.Atoi(c.Params("id"))
		if err != nil {
			return c.Status(400).JSON(fiber.Map{
				"error": "Invalid ID format",
			})}
		var student Student
		db.First(&student, id)
		return c.JSON(student)
	})

	// ===================Update Student==================
	app.Put("/students/:id",func(c fiber.Ctx)error{
		id, err := strconv.Atoi(c.Params("id"))
		if err != nil {
			return c.Status(400).JSON(fiber.Map{
				"error": "Invalid ID format",
			})}
		var student Student
		result := db.First(&student, id)
		if result.Error != nil{
			return c.Status(404).JSON(fiber.Map{
				"Error" : "Data Not found",
			})
		}
		var updatedStudent Student
		if err := c.Bind().Body(&updatedStudent) ; err != nil{
			return c.Status(400).JSON(fiber.Map{
				"Error" : "Invalid Input",
			})}
		student.Name = updatedStudent.Name
		student.Age = updatedStudent.Age
		student.Marks = updatedStudent.Marks
		student.ClassID = updatedStudent.ClassID
		student.Present = updatedStudent.Present

		db.Save(&student)

		return c.JSON(student)
	})

	// =================Delete Student================
	app.Delete("/students/:id",func(c fiber.Ctx)error{
		id, err := strconv.Atoi(c.Params("id"))
		if err != nil {
			return c.Status(400).JSON(fiber.Map{
				"error": "Invalid ID format",
			})}
		var student Student
		result := db.Delete(&student, id)
		if result.Error != nil{
			return c.Status(404).JSON(fiber.Map{
				"Error" : "Data Not found",
			})
		}
		return c.SendString("Student Deleted")
	})

	// =============Delete Student with ClassId===============
	app.Delete("/students/class/:id", func(c fiber.Ctx) error {

		classId := c.Params("id")

		db.Where("class_id = ?", classId).Delete(&Student{})

		return c.JSON(fiber.Map{
			"message": "students deleted",
		})
	})


	// ====================Stats Part=======================


	app.Get("/stats", func(c fiber.Ctx) error {
    var totalStudents int64
    var totalClasses int64
    var avgMarks float64
    var avgPresent float64
    var totalPresent int64

    db.Model(&Student{}).Count(&totalStudents)
    db.Model(&Class{}).Count(&totalClasses)
    db.Model(&Student{}).Select("AVG(marks)").Scan(&avgMarks)
    db.Model(&Student{}).Select("AVG(present)").Scan(&avgPresent)
    db.Model(&Student{}).Select("SUM(present)").Scan(&totalPresent)

    return c.JSON(fiber.Map{
        "total_students": totalStudents,
        "total_classes": totalClasses,
        "avg_marks": avgMarks,
        "avg_present": avgPresent,
        "total_present": totalPresent,
    })
	})
	app.Use("/", static.New("./public"))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	app.Listen(":" + port)
}