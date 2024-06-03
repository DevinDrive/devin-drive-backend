export const renameFileHandler = async (req,res)=>{
    const user = req.user
    try {
        for (const i in user.files) {
            if(i.id == req.body.id){
                i.name = req.body.name;
                break
            }
        }
        await user.save();
        res.json(success)
    } catch (error) {
        res.status(400).json(error)
    }
    
}