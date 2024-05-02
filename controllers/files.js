import { StringSession } from "telegram/sessions/index.js";
import { CONNECTION_RETRIES, apiCred } from "../config.js";
import { TelegramClient} from "telegram";
import fs from 'fs';


export const getAFile= async (req,res, next) => {
    const fileId = req.body.fileId
    const fieldId = req.body.fieldId
    const codeName = req.body.codeName
    const user = req.body.user
    const sessionString = user.session
    const session = new StringSession(sessionString)
    const client = new TelegramClient(session, apiCred.apiId, apiCred.apiHash, { connectionRetries: CONNECTION_RETRIES })

    await client.connect()
    if(fileId == -1){
        res.sendfile("files/"+codeName)
    }
    else{
        const id = Number(fileId)
        const item = await client.getMessages("me", {ids:id})
        await client.downloadMedia(item[0],{
            outputFile: "files/"+codeName,
            progressCallback: (progress, total) => {
                console.log(`Downloaded ${progress/(1024*1024)} of ${total/(1024*1024)} MB`)
            }
        }).then(async () => {await res.sendfile("files/"+codeName)})
        await client.disconnect();
    }
}

export const deleteFile = async (req,res, next) => {
    const {docId, telegramId, parentId, user} = req.body
    const sessionString = user.session
    const session = new StringSession(sessionString)
    const client = new TelegramClient(session,apiCred.apiId,apiCred.apiHash,{connectionRetries:CONNECTION_RETRIES})
    await client.connect()
    await client.deleteMessages("me",[Number(telegramId)], {revoke:true})
    if(user._id == parentId) user.files = user.files.filter(file => file._id != docId);
    else {
        for(let i=0; i<user.collections.length; i++){
            if(user.collections[i]._id == parentId){
                user.collections[i].files = await user.collections[i].files.filter(file => file._id != docId)
                break;
            }
        }
    }
    await user.save();
    res.json("file deleted successfully")
}