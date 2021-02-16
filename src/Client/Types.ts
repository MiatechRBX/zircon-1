import {
	ZirconStandardOutput,
	ZirconiumRuntimeErrorMessage,
	ZirconiumParserErrorMessage,
	ZirconLogOutput,
	ZirconLogErrorOutput,
	ZirconErrorOutput,
} from "Shared/Remotes";

export const enum ZirconContext {
	Server,
	Client,
}

export type ZirconTag = string | Instance | { toString(): string };
export interface ZirconLoggable {
	toString(): string;
}

export enum ZirconLogLevel {
	Debug,
	Info,
	Warning,
	Error,

	/**
	 * "What a terrible failure"
	 * Used if the result should never happen, yet
	 */
	Wtf,
}

export const enum ZirconMessageType {
	ZirconiumOutput = "zr:output",
	ZirconiumError = "zr:error",
	ZirconiumExecutionMessage = "zr:execute",
	ZirconLogOutputMesage = "zirclog:message",
	ZirconLogErrorMessage = "zirclog:error",
	PlainText = "plain",
}

export function isContextMessage(
	message: ConsoleMessage,
): message is ZrOutputMessage | ZrErrorMessage | ZirconLogMessage | ZirconLogError {
	return (
		message.type === ZirconMessageType.ZirconLogErrorMessage ||
		message.type === ZirconMessageType.ZirconLogOutputMesage ||
		message.type === ZirconMessageType.ZirconiumOutput ||
		message.type === ZirconMessageType.ZirconiumError
	);
}

export function getMessageText(message: ConsoleMessage) {
	if (message.type === ZirconMessageType.ZirconLogOutputMesage) {
		return message.message.message;
	} else if (message.type === ZirconMessageType.ZirconLogErrorMessage) {
		return message.error.message;
	} else if (message.type === ZirconMessageType.ZirconiumOutput) {
		return message.message.message;
	} else if (message.type === ZirconMessageType.ZirconiumError) {
		return message.error.message;
	} else if (message.type === ZirconMessageType.ZirconiumExecutionMessage) {
		return message.source;
	} else if (message.type === ZirconMessageType.PlainText) {
		return message.message;
	} else {
		return "";
	}
}

export function isLogMessage(message: ConsoleMessage): message is ZirconLogMessage | ZirconLogError {
	return (
		message.type === ZirconMessageType.ZirconLogErrorMessage ||
		message.type === ZirconMessageType.ZirconLogOutputMesage
	);
}

export function isLogLevel(logLevel: ZirconLogLevel, message: ConsoleMessage) {
	if (message.type === ZirconMessageType.ZirconLogOutputMesage) {
		return message.message.level >= logLevel;
	} else if (message.type === ZirconMessageType.ZirconLogErrorMessage) {
		return message.error.level >= logLevel;
	} else if (message.type === ZirconMessageType.ZirconiumError) {
		return logLevel >= ZirconLogLevel.Error;
	} else if (message.type === ZirconMessageType.ZirconiumOutput) {
		return logLevel === ZirconLogLevel.Info;
	} else {
		return false;
	}
}

interface ZirconContextMessage {
	readonly context: ZirconContext;
}

export interface ZrOutputMessage extends ZirconContextMessage {
	readonly type: ZirconMessageType.ZirconiumOutput;
	readonly script?: string;
	readonly message: ZirconStandardOutput;
}
export interface ConsolePlainMessage {
	readonly type: ZirconMessageType.PlainText;
	readonly message: string;
}

export interface ConsoleSyntaxMessage {
	readonly type: ZirconMessageType.ZirconiumExecutionMessage;
	readonly source: string;
}

export interface ZrErrorMessage extends ZirconContextMessage {
	readonly type: ZirconMessageType.ZirconiumError;
	readonly script?: string;
	readonly error: ZirconiumRuntimeErrorMessage | ZirconiumParserErrorMessage;
}
export interface ConsoleLuauError extends ZirconContextMessage {
	readonly type: "luau:error";
	readonly error: string;
	readonly stackTrace?: string[];
}

export interface ZirconLogMessage extends ZirconContextMessage {
	readonly type: ZirconMessageType.ZirconLogOutputMesage;
	readonly message: ZirconLogOutput;
}

export interface ZirconLogErrorData {}

export interface ZirconLogError extends ZirconContextMessage {
	readonly type: ZirconMessageType.ZirconLogErrorMessage;
	readonly error: ZirconLogErrorOutput;
}

export type ConsoleMessage =
	| ZrOutputMessage
	| ZrErrorMessage
	| ConsolePlainMessage
	| ConsoleLuauError
	| ConsoleSyntaxMessage
	| ZirconLogMessage
	| ZirconLogError;
