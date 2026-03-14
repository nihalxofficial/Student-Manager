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

	// Student Routes
	// app.Get("/students",getStudents)
	// app.Post("/students", createStudendt)
	// app.Put("/students/:id",updateStudent)
	// app.Delete("/students/:id",deleteStudent)

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
		id, _ := strconv.Atoi(c.Params("id"))
		var deleteClass Class
		db.Delete(&deleteClass,id)
		return c.SendString("Deleted")
	})
	
	app.Listen(":3000")
}