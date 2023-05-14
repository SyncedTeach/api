module.exports = {
    httpMethod: "get",
    async run(app, req, res) {
        res.json({
            "version": "v1",
            "website": "test"
        });
    }
}
