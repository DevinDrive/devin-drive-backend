import { StringSession } from "telegram/sessions/index.js";
import { CONNECTION_RETRIES, apiCred } from "../config.js";
import { TelegramClient} from "telegram";
import fs from 'fs';

export const createFolder = async (req,res) => {
    const{name,user, docId} = req.body

    var data = user.collections.push({
        name:name,
        files:[]
    })
    const id = user.collections[data-1]._id.toString()

    if(user._id == docId){
        user.files.push({
            id: id,
            name: name,
            type: "folder"
        })
    }
    else{
        console
        const length = user.collections.length
        for(let i=0; i<length; i++){
            if(user.collections[i]._id == docId){
                user.collections[i].files.push({
                    id: id,
                    name: name,
                    type: "folder"
                });
            }
        }
    }
    await user.save()
    res.json("Created successfully")
}

export const addToFolder = async (req,res, next) => {
    if (!req.files) {
        return res.status(400).send('No files were uploaded.');
    }
    const {docId, user} = req.body
    const files = req.files
    const sessionString = user.session
    const session = new StringSession(sessionString)
    const client = new TelegramClient(session,apiCred.apiId,apiCred.apiHash,{connectionRetries:CONNECTION_RETRIES})
    await client.connect()
    for (let i = 0; i< files.length; i++) {
        if(user._id == docId){
            user.files.push({
                id: -1,
                name: files[i].originalname,
                codeName: files[i].filename,
                type: "file",
                size: files[i].size,
            })
        }
        else{
            const size = user.collections.length
            for(let j=0; j<size; j++){
                if(user.collections[j]._id == docId){
                    user.collections[j].files.push({
                        id: -1,
                        name: files[i].originalname,
                        codeName: files[i].filename,
                        type: "file",
                        size: files[i].size
                    })
                    break;
                }
            }
        }
        await user.save();
    }
    res.end();
    for(let i=0; i<files.length; i++){
        let fileSize = files[files.length-(i+1)].size;
        var item = await client.sendFile("me",{file:`files/${files[files.length-(i+1)].filename}`, caption: files[files.length-(i+1)].originalname, progressCallback: (progress, total) => {console.log(`Uploaded ${progress*fileSize/(1024*1024)} of ${fileSize/(1024*1024)} MB`) },}) ;
        if(user._id == docId){
            user.files[user.files.length-(i+1)].id = item.id;
        }
        else{
            const size = user.collections.length
            for(let j=0; j<size; j++){
                if(user.collections[j]._id == docId){
                    user.collections[j].files[user.collections[j].files.length-(i+1)].id = item.id;
                    break;
                }
            }
        }
        await user.save();
        try {
            await fs.promises.unlink(`files/${files[files.length-(i+1)].filename}`);
            console.log(`Removed file ${files[files.length-(i+1)].originalname}`);
        } catch (err) {
            console.error(`Error deleting file ${files[files.length-(i+1)].originalname}:`, err);
        }
    }
    await client.disconnect()
}


export const getAllFilesFromFolder = (req,res) => {
    const user = req.body.user
    const docId = req.body.docId
    console.log(user._id)
    if(user._id == docId){
        res.json({
            "id": -1,
            "files": user.files,    
        })
    }
    else{
        const length = user.collections.length
        for(let i=0; i<length; i++){
            if(user.collections[i]._id == docId){
                console.log(i)
                res.json({
                    "id": i,
                    "files": user.collections[i].files
                })
            }
        }
    }
}

export const deleteFolder = async (req,res, next) => {
    const {folderId, parentFolderId, user} = req.body
    const sessionString = user.session
    const session = new StringSession(sessionString)
    const client = new TelegramClient(session,apiCred.apiId,apiCred.apiHash,{connectionRetries:CONNECTION_RETRIES})
    await client.connect()

    let ind;
    let fidArray = [];
    let folderIdArray = [];
    folderIdArray.push(folderId);
    for(let i=0; i<user.collections.length; i++){
        if(user.collections[i]._id == folderId){
            ind = i;
            break;
        }
    }
        
    async function iterateFolders(ind){
        let array = user.collections[ind].files;
        for (let i = 0; i < array.length; ++i) {
            let id = array[i]._id;
            let fId = array[i].id;
            let type = array[i].type;
            if(type == "file"){
                fidArray.push(Number(fId));
                user.collections[Number(ind)].files = await user.collections[Number(ind)].files.filter(file => file._id != id)
            }
            else if(type == "folder") {
                folderIdArray.push(fId);
                for(let i=0; i<user.collections.length; i++){
                    if(user.collections[i]._id == fId) iterateFolders(i);
                }
            }
        }
    }
    iterateFolders(ind);
    await client.deleteMessages("me",fidArray, {revoke:true})
    for(let i=0; i<folderIdArray.length; i++) user.collections = await user.collections.filter(folder => folder._id != folderIdArray[i]);
    if(parentFolderId==user._id) user.files = await user.files.filter(folder => folder.id != folderId);
    else user.collections[parentFolderId].files = await user.collections[parentFolderId].files.filter(folder => folder.id != folderId);
    await user.save();
    res.json("working on folders ...............")
}