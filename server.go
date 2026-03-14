package main

import (
	"fmt"
	"strconv"
	"log"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/static"

	"gorm.io/driver/mysql"
	// "gorm.io/driver/postgres"
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


// var db *gorm.DB

func main(){
	dsn := "root:@tcp(127.0.0.1:3306)/student_db?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	fmt.Println("Database connected!")

	// Migrate the schema
	db.AutoMigrate(&Class{}, &Student{})

	app := fiber.New()
	app.Use(cors.New())
	app.Use("/", static.New("./public"))

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
			})}
		var deleteClass Class
		db.Delete(&deleteClass,id)
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
	// app.Get("/students",func(c fiber.Ctx)error{
	// 	var students []Student
	// 	result := db.Find(&students)
	// 	if result.Error != nil {
	// 	return c.Status(500).JSON(fiber.Map{
	// 		"error": result.Error.Error(),
	// 	})}
	// 	if result.RowsAffected == 0 {
	// 		return c.Status(404).JSON(fiber.Map{"error": "Record not found"})
	// 	}
	// 	return c.JSON(students)
	// })

	// ================Read with filtered=================
	app.Get("/students", func(c fiber.Ctx) error {

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

	app.Delete("/students/class/:id", func(c fiber.Ctx) error {

		classId := c.Params("id")

		db.Where("class_id = ?", classId).Delete(&Student{})

		return c.JSON(fiber.Map{
			"message": "students deleted",
		})
	})

	// ================Filter Students===============
	
	
	app.Listen(":3000")
}