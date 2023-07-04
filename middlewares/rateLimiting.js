const AccessModel = require("../models/AccessModel");

const rateLimiting = async (req, res, next) => {
    const sessionId = req.session.id;

    const sessionDb = await AccessModel.findOne({ sessionId: sessionId });
    console.log(sessionDb);
    if (!sessionDb) {

        const accessObj = new AccessModel({
            sessionId: sessionId,
            time: Date.now(),
        });

        await accessObj.save();
        next();
        return;
    }

    const previousAccessTime = sessionDb.time;
    const currentTime = Date.now();


    if (currentTime - previousAccessTime < 2000) {
        console.log("here");
        return res.send({
            status: 401,
            message: "Too many request, Please try in some time",
        });
    }

    try {
        await AccessModel.findOneAndUpdate(
            { sessionId: sessionId },
            { time: Date.now() }
        );
        next();
    } catch (error) {
        return res.send({
            status: 500,
            message: "Database error in access model",
            error: error,
        });
    }
};

module.exports = { rateLimiting };