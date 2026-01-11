import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type RefineInput } from "@shared/schema";
import { prompts } from "@shared/schema"; // Import table definition for types if needed, though usually inferred from routes
import { z } from "zod";

// Types inferred from schema/routes
type Prompt = typeof prompts.$inferSelect;

export function usePrompts() {
  return useQuery({
    queryKey: [api.prompts.list.path],
    queryFn: async () => {
      const res = await fetch(api.prompts.list.path);
      if (!res.ok) throw new Error("Failed to fetch history");
      return api.prompts.list.responses[200].parse(await res.json());
    },
  });
}

export function usePrompt(id: number) {
  return useQuery({
    queryKey: [api.prompts.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.prompts.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch prompt");
      return api.prompts.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useRefinePrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { input_text?: string; file?: File; source_type?: string }) => {
      const formData = new FormData();

      if (data.input_text) {
        formData.append('input_text', data.input_text);
      }

      if (data.file) {
        formData.append('file', data.file);
      }

      if (data.source_type) {
        formData.append('source_type', data.source_type);
      }

      const res = await fetch(api.prompts.refine.path, {
        method: api.prompts.refine.method,
        body: formData,
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message);
        }
        throw new Error("Failed to refine prompt");
      }

      return api.prompts.refine.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.prompts.list.path] });
    },
  });
}
