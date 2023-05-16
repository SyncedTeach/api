module.exports = {
    httpMethod: "get",
    async run(app, req, res) {
        res.json({
            "website": "meow"
        });
    }
}
