const express = require('express')
const bodyParser = require('body-parser')
const expressFileUpload = require('express-fileupload')
const ffmpeg = require("fluent-ffmpeg");
const fs = require('fs')
const app = express()
const PORT = process.env.PORT || 5000 

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(
    expressFileUpload({
      useTempFiles: true,
      tempFileDir: "/tmp/",
    })
  );

  ffmpeg.setFfmpegPath("C:/ffmpeg/bin/ffmpeg.exe");

  ffmpeg.setFfprobePath("C:/ffmpeg/bin");
  
  ffmpeg.setFlvtoolPath("C:/flvtool");
  
  console.log(ffmpeg);

app.get("/",(req,res) => {

    // res.send("Hello world")
    res.sendFile(__dirname + "/index.html");
    
    })

    app.post("/convert", (req, res) => {

        let to = req.body.to;
        let file = req.files.file;
        let fileFormat = file.name.split('.')
        if(fileFormat[1]!=='mp4'){
            return res.send(`<h1>Invalid file format.Please upload mp4 only</h1>`)
        }

        // console.log(file.name.split('.'))
        let fileName = `output.${to}`;
        console.log(to);
        console.log(file);
      
        file.mv("tmp/" + file.name, function (err) {
          if (err) return res.sendStatus(500).send(err);
          console.log("File Uploaded successfully");
        });
      
        ffmpeg("tmp/" + file.name)
          .withOutputFormat(to)
          .on("end", function (stdout, stderr) {
            console.log("Finished");
            res.download(__dirname + fileName, function (err) {
              if (err) throw err;
      
              fs.unlink(__dirname + fileName, function (err) {
                if (err) throw err;
                console.log("File deleted");
              });
            });
            fs.unlink("tmp/" + file.name, function (err) {
              if (err) throw err;
              console.log("File deleted");
            });

          })
          .on("error", function (err) {
            console.log("an error happened: " + err.message);
            fs.unlink("tmp/" + file.name, function (err) {
              if (err) throw err;
              console.log("File deleted");
            });
          })
          .saveToFile(__dirname + fileName);
      });

    app.listen(PORT,() =>{
    console.log("App is listening on Port 5000")
    })