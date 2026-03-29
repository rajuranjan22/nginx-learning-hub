import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Iter "mo:core/Iter";

actor {
  type LessonId = Text;
  type SessionId = Text;

  let totalLessons = 10;

  let sessionProgress = Map.empty<SessionId, Map.Map<LessonId, Bool>>();

  func getSessionMap(sessionId : SessionId) : Map.Map<LessonId, Bool> {
    switch (sessionProgress.get(sessionId)) {
      case (?progress) { progress };
      case (null) { Runtime.trap("Session does not exist") };
    };
  };

  public shared ({ caller }) func markLesson(sessionId : SessionId, lessonId : LessonId, completed : Bool) : async () {
    let progress = switch (sessionProgress.get(sessionId)) {
      case (null) { Map.empty<LessonId, Bool>() };
      case (?existing) { existing };
    };
    progress.add(lessonId, completed);
    sessionProgress.add(sessionId, progress);
  };

  public query ({ caller }) func getLessonStatus(sessionId : SessionId, lessonId : LessonId) : async Bool {
    let progress = getSessionMap(sessionId);
    switch (progress.get(lessonId)) {
      case (?completed) { completed };
      case (null) { false };
    };
  };

  public query ({ caller }) func getProgressPercentage(sessionId : SessionId) : async Nat {
    switch (sessionProgress.get(sessionId)) {
      case (null) { 0 };
      case (?progress) {
        let completedLessons = progress.values().toArray().filter(func(completed) { completed }).size();
        if (totalLessons == 0) { return 0 };
        (completedLessons * 100) / totalLessons;
      };
    };
  };
};
