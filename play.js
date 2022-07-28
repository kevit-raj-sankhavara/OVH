const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';

async function checkTheMigrationStatus(pattern) {
    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch(err => { console.log(err); });

    if (!client) {
        return;
    }
    const db = client.db("staging-saas-botplatform");

    const checkingJSON = {
        accesses: [],
        agendajobs: [],
        apitools: [],
        assertions: [],
        audiocodessettings: [],
        audits: [],
        bdks: [],
        bots: ['chatBotDesign.botImage'],
        bots_old: ['chatBotDesign.botImage'],
        bottriggerpoints: [],
        botusers: [],
        broadcastexecutors: [],
        campaigns: ['audioCodes.fileUrl'],
        confusionmatrixes: [],
        conversationdetailshistories: [],
        conversationhistories: [],
        conversations: [],
        departments: [],
        dialogflowauths: [],
        dialogflowentities: [],
        dialogflowintents: [],
        dialogflowsytementities: [],
        dialogflowtokens: [],
        dialogflowtrainings: [],
        entities: [],
        fallbacks: [],
        fallbacktrainings: [],
        fis: [],
        flowblocksteps: ['icon'],
        flowfolders: [],
        flowhistories: [],
        flows: ['thumbnail'],
        flowsteps: [
            'buttonWithImage.button.image',
            'carousels.image',
            'carousels.buttons.value',
            'review.reviewChoices.img',
            'card.image',
            'card.url',
            'card.buttons.value',
            'checklist.checklistItems.image',
            'list.listItems.image',
        ],
        flowversions: ['blockSteps.icon', 'blockSteps.flowSteps.carousels.image', 'lhs.thumbnail'],
        forms: [],
        growthtools: ['qrCode.url'],
        'handoff-designs': [],
        'handoff-messages': [],
        handoffs: [],
        handoffv1: [],
        ibmdiscoverydocuments: ['filePath'],
        icons: [],
        instagramsettings: [],
        intentfolderolds: [],
        intentfolders: [],
        intentmappings: [],
        intents: [],
        keywords: [],
        knowledgebases: [],
        mediauploads: [],
        messages: ['attachment.contentUrl'],
        msteamstokens: [],
        multinlps: [],
        navigators: [],
        nlphistories: [],
        nlphistoryolds: [],
        nlpolds: [],
        nlps: [],
        nlptraininghistories: [],
        notes: [],
        operations: [],
        organizations: ['logo'],
        previewlinks: [],
        profiles: [],
        ruleexecutors: [],
        rules: [],
        saasagendajobs: [],
        sankygraphs: [],
        schedulemessageconfigs: [],
        services: [],
        servicetokens: [],
        slacksettings: [],
        snapshots: [],
        snapshotsteps: [],
        systementities: [],
        taganalytics: [],
        tags: [],
        templatemessages: [],
        transcripts: [
            'checklist.checklistItems.image',
            'checklist.maskedData.checklistItems.image',
            'translatedObj.checklistItems.image',
            'translatedObj.maskedData.checklistItems.image',
            'buttonWithImage.button.image',
            'buttonWithImage.maskedData.button.image',
            'carousel.image_url',
            'carousel.maskedData.image_url',
        ],
        universalauths: [],
        'unpublished-flowblocksteps': ['icon'],
        'unpublished-flows': ['thumbnail'],
        'unpublished-flowsteps': ['carousels.image'],
        userfis: ['value'],
        users: ['notifications.data.profilePic', 'profileImage'],
        users_copy: [],
        voximplants: [],
        whatsappprofilesettings: ['photo'],
        whatsapptemplatemessages: [],
        whatsappwidgets: ['content.chatHeader.picture.url'],
        widgetconsentscreens: [],
    };

    const checkingQuery = { $regex: pattern, $options: 'i' };

    for (const collection of Object.keys(checkingJSON).filter(d => checkingJSON[d].length)) {
        const finalQuery = {
            $or: checkingJSON[collection].map(field => {
                return { [field]: checkingQuery };
            }),
        };

        const countOfDocumentFound = await db.collection(collection).countDocuments(finalQuery);
        if (!countOfDocumentFound) {
            continue;
        }
        const totalCount = await db.collection(collection).estimatedDocumentCount();
        console.log(`Found ${countOfDocumentFound} out of ${totalCount} in collection: ${collection}`);
        console.log(`Query: db.getCollection('${collection}').find(${JSON.stringify(finalQuery)})`);
    }
}

checkTheMigrationStatus(".ovh.");
