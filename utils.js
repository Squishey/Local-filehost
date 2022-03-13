function sendJson(res, obj){
    let statusCode = obj.status;
    delete obj.status;
    res.status(statusCode).send(JSON.stringify(obj));
}

module.exports = { sendJson }