import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type SessionId = string;
export type LessonId = string;
export interface backendInterface {
    getLessonStatus(sessionId: SessionId, lessonId: LessonId): Promise<boolean>;
    getProgressPercentage(sessionId: SessionId): Promise<bigint>;
    markLesson(sessionId: SessionId, lessonId: LessonId, completed: boolean): Promise<void>;
}
