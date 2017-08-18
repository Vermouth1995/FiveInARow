package main

import (
    "github.com/gin-gonic/gin"
    "github.com/robvdl/pongo2gin"
    "github.com/flosch/pongo2"
    "net/http"
)

func main()  {
    router := gin.New()
    router.HTMLRender = pongo2gin.New(pongo2gin.RenderOptions{
        TemplateDir: "template",
        ContentType: "text/html; charset=utf-8",
    })

    router.Static("/static", "./static")

    router.GET("/", func(c *gin.Context) {
        c.HTML(http.StatusOK, "gobang.html", pongo2.Context{
            "title"      : "FiveInARow",
        })
    })
    router.Run(":8888")
}
