//purpose: allows us to catch any errors within any async function that is imported. Reduces the amount of repeated code.

module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}