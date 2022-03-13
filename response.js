class Response{
    constructor(method, status, details){
        this.method = method;
        this.status = status;
        this.details = details;
    }
}

module.exports = { Response }