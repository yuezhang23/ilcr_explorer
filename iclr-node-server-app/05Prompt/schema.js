import mongoose from "mongoose";

const predictionSchema = new mongoose.Schema({
    prompt: {type: String, required: true},
    paper_id : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'iclr_2024',
        required: true
    },
    paper_title: {type: String, required: true},
    model: {type: String, default: 'gpt-4o-mini'},
    rebuttal: {type: Number, default: -1},
    prediction: {type: String, default: 'None'},
});


// const templatesSchema = new mongoose.Schema({
//     name: {type: String, default: 'Template-01'},
//     template: {type: String, required: true, unique: true},
// });

// templatesSchema.pre('save', async function(next) {
//     if (this.isNew && !this.name) {
//         const count = await mongoose.model('templates').countDocuments();
//         this.name = 'Template-' + (count + 1).toString(); 
//     }
//     next();
// });

// export default {predictionSchema, templatesSchema};
export default predictionSchema;