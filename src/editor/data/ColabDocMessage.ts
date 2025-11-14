import { SerializedColabDoc } from "./ColabDoc";

export type ColabDocSendMessageType = "load" | "update" | "ping";

export type ColabDocSendGenericMessage = {
    type: ColabDocSendMessageType;
    user: string;
    peer: string;
}

export type ColabDocSendLoadMessage = {
    type: "load";
} & ColabDocSendGenericMessage

export type ColabDocSendUpdateMessage = {
    type: "update";
    delta: string;
} & ColabDocSendGenericMessage

export type ColabDocPingMessage = {
    type: "ping";
}

export type ColabDocSendMessage = 
    ColabDocSendLoadMessage 
    | ColabDocSendUpdateMessage
    | ColabDocPingMessage;

export type ColabDocReceiveMessageType = "init" | "update";

export type ColabDocReceiveGenericMessage = {
    type: ColabDocReceiveMessageType;
}

export type ColabDocReceiveInitMessage = {
    type: "init";
    colabDoc: SerializedColabDoc;
} & ColabDocReceiveGenericMessage

export type ColabDocReceiveUpdateMessage = {
    type: "update";
    delta: string;
} & ColabDocReceiveGenericMessage

export type ColabDocReceiveMessage = 
    ColabDocReceiveInitMessage
    | ColabDocReceiveUpdateMessage;