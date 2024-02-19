
import express from 'express';
import multer from 'multer';
import bodyParser from 'body-parser';
import fs from 'fs';
import {google} from 'googleapis';
import { converBase64ToImage } from 'convert-base64-to-image'
// const { json, urlencoded } = bodyParser;
import cors from 'cors';
const app = express();
app.use(cors({
    origin: ['http://localhost:3000','https://liveimageeditor.netlify.app'],
    credentials: true 
}));
// app.use(json());
// app.use(urlencoded({ extended: false }));

app.use(bodyParser.text({ limit: '200mb' }));
const port = 8083;

const storage=multer.diskStorage({
    destination:'uploads',
    filename: function (req,file,callback) {
       const extenstion=file.orginalname.split(".").pop()
       callback(null,`${file.fieldname}-${Date.now()}.${extenstion}`);
    }
})

const upload=multer({storage:storage})

app.post('/upload', async(req,res)=>{
    const url=req.body
    const base64 = url
    let ms = Date.now();
    const pathToSaveImage = `./uploads/${ms}.png`
    const path = converBase64ToImage(base64, pathToSaveImage)  
    try {
        const auth=new google.auth.GoogleAuth({
            keyFile:"key.json",
            scopes:["https://www.googleapis.com/auth/drive"]
        })
        const drive =google.drive({
            version:"v3",
            auth
        })

        const uploadFiles=[]
        const response=await drive.files.create({
            requestBody:{
                name:ms,
                mimeType:"image/png",
                // parents:['12rXNMs_wwzAO4vyhTbMcPE1Ou_Q0EAei'] //Real one
                parents:['1h5n5wg2e3j9Cd7F-h0bBPJLtaNCrg_6a'] //Test one

            },
            media:{
                body:fs.createReadStream(pathToSaveImage)
         }
        })
        res.json({message:"Successfully saved image"})
        //     const response=await drive.files.create({
        //     requestBody:{
        //         name:file.orginalname,
        //         mimeType:file.mimetype,
        //         parents:['1h5n5wg2e3j9Cd7F-h0bBPJLtaNCrg_6a']
        //     },
        //     media:{
        //         body:fs.createReadStream(file.path)
        //     }
        // })
        // uploadFiles.push(response.data)
        
        // res.json({files:uploadFiles})
         
    
  } catch (error) {
    res.status(error.status);
  }
})

app.listen(port, () => console.log(`Backend service listening on port ${port}!`));
