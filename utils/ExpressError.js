//purpose: This will allow us to add a custom message and status code for any errors that occur. By default the Error class has a message and stack trace.

class ExpressError extends Error {
    constructor(message, statusCode)
    {
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError;