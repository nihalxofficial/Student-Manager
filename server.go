package main

import (
	"fmt"
	// "strconv"
	"log"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/static"

	"gorm.io/driver/mysql"
	// "gorm.io/driver/postgres"
	"gorm.io/gorm"
)


type Class struct{
	Id uint 		`gorm:"primaryKey" json:"id"`
	Name string		`json:"name"`
}

type Student struct{
	ID      uint   `gorm:"primaryKey" json:"id"`
	Name    string `json:"name"`
	Age     int    `json:"age"`
	ClassID uint   `json:"class_id"` // link to Class
	Class   Class  `gorm:"foreignKey:ClassID" json:"class"`
	Marks   int    `json:"marks"`
	Present int    `json:"present"`
}

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

	app.Listen(":3000")
}