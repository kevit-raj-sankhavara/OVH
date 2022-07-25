const mongoose = require("mongoose");
const { Schema } = require("mongoose");

mongoose.connect("mongodb://localhost:27017/staging-saas-botplatform", () => {
    console.log("Connected");
})

// For already exist collection
const IBMSchema = new mongoose.Schema({
    // filePath: String
    documentId: Schema.Types.String,
    fileName: Schema.Types.String,
    fileType: Schema.Types.String,
    filePath: Schema.Types.String,
    status: Schema.Types.String,
    botId: {
        type: Schema.Types.ObjectId,
        ref: 'bot',
    },
    agentId: {
        type: Schema.Types.ObjectId,
        ref: 'nlp',
    },
    language: {
        type: Schema.Types.String,
        // enum: NLPLanguageTypeEnum,
    },
    response: [
        {
            channelId: Schema.Types.String,
            isTextResponse: {
                type: Schema.Types.Boolean,
                default: true,
            },
            isFiMapping: {
                type: Schema.Types.Boolean,
                default: false,
            },
            fiName: Schema.Types.String,
            isDefaultText: { type: Schema.Types.Boolean, default: true },
            text: Schema.Types.String,
            flowId: {
                type: Schema.Types.ObjectId,
                ref: 'flow',
            },
            flowName: Schema.Types.String,
        },
    ]
});
const IBM = mongoose.model('Ibmdiscoverydocuments', IBMSchema, 'ibmdiscoverydocuments');

module.exports = IBM;