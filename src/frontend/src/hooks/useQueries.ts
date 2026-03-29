import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

function getOrCreateSessionId(): string {
  const key = "nginx_academy_session";
  let sessionId = localStorage.getItem(key);
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(key, sessionId);
  }
  return sessionId;
}

export const sessionId = getOrCreateSessionId();

export function useLessonStatus(lessonId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["lessonStatus", lessonId],
    queryFn: async () => {
      if (!actor) return false;
      return actor.getLessonStatus(sessionId, lessonId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProgressPercentage() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["progressPercentage"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getProgressPercentage(sessionId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMarkLesson() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lessonId,
      completed,
    }: {
      lessonId: string;
      completed: boolean;
    }) => {
      if (!actor) return;
      await actor.markLesson(sessionId, lessonId, completed);
    },
    onSuccess: (_, { lessonId }) => {
      queryClient.invalidateQueries({ queryKey: ["lessonStatus", lessonId] });
      queryClient.invalidateQueries({ queryKey: ["progressPercentage"] });
    },
  });
}
