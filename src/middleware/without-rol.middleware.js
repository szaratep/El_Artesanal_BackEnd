const removeRol = (req, res, next) => {
    const inputdata = req.body;
 
    delete inputdata.role;
 
    next();
}
 
export default removeRol;
 