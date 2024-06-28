export const uploadChunkHandler = async (req, res) => {
  const user = req.body.user
  const file = req.file
  const fileSize = file.size / 1024 / 1024
  console.log(file);
}
