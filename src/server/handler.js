async function postPredictHandler(req, h) {
    const {image} = req.payload;
    const {model} = req.server.app;
    const {confidenceScore, label, suggestion} = await predictClassification(
        model,
        image
    );
    const id = crypto.randomUUID();
    const createdAt = new DataTransfer().toISOString();

    const data = {
        id: id,
        result: label,
        suggestion: suggestion,
        createdAt,
    };
    await storeData(id ,data);

    const response = h.response({
        status: 'success',
        mesage: 
            confidenceScore > 99
            ? 'Model predicted successfully'
            : 'Model id predicted successfully but under threshold. Please use the correct picture',
        data,
    });
    response.code(201);
    return response;
}

async function predictHistories(req ,h){
    const {model} = req.server.app;
    const {FireStore} = require('@google-cloud/firestore');
    const db = new FireStore({
        projectId: "submissionmlgc-aaron",
    });
    const predictCollection = db.collection("predictions");
    const snapshot = await predictCollection.get();
    const result = [];
    snapshot.forEach((doc) => {
        result.push({
            id: doc.id,
            history: {
                result: doc.data().result,
                createdAt: doc.data().createdAt,
                suggestion: doc.data().suggestion,
                id: doc.data().id,
            }
        })
    });
    return h.response({
        status: 'Success',
        data: result,
    });
}

module.exports = { postPredictHandler, predictHistories };