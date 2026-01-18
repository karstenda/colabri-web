import {Schema} from "prosemirror-model"

export const simpleTextSchema = new Schema({
  nodes: {
    text: {},
    doc: {content: "text*"}
  }
})