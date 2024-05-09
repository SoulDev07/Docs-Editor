import { Schema, model } from 'mongoose';

const documentSchema = new Schema({
  title: {
    type: String,
    default: "Untitled Document"
  },
  content: {
    type: Object,
    default: { ops: [{ insert: '\n' }] }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  modifiedAt: {
    type: Date,
    default: Date.now
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
},
  { collection: "documents" }
);

const Document = model("Document", documentSchema);

export default Document;