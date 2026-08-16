"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formsApi, type BuilderData } from "./api";
import { formQueryKeys } from "./query-keys";
import type { SubmitResponseInput, UpdateFormInput } from "@repo/validators";

export function useFormsQuery() {
  return useQuery({ queryKey: formQueryKeys.all, queryFn: formsApi.list });
}

export function useFormQuery(formId: string) {
  return useQuery({ queryKey: formQueryKeys.detail(formId), queryFn: () => formsApi.get(formId), enabled: Boolean(formId) });
}

export function useFormAnalyticsQuery(formId: string) {
  return useQuery({ queryKey: formQueryKeys.analytics(formId), queryFn: () => formsApi.analytics(formId), enabled: Boolean(formId) });
}

export function useFormResponsesQuery(formId: string) {
  return useQuery({ queryKey: formQueryKeys.responses(formId), queryFn: () => formsApi.responses(formId), enabled: Boolean(formId) });
}

export function useFormResponseQuery(formId: string, responseId: string) {
  return useQuery({ queryKey: formQueryKeys.response(formId, responseId), queryFn: () => formsApi.response(formId, responseId), enabled: Boolean(formId && responseId) });
}

export function useBuilderQuery(formId: string) {
  return useQuery({ queryKey: formQueryKeys.builder(formId), queryFn: () => formsApi.builder(formId), enabled: Boolean(formId) });
}

export function usePublicFormQuery(publicId: string) {
  return useQuery({ queryKey: formQueryKeys.public(publicId), queryFn: () => formsApi.publicForm(publicId), enabled: Boolean(publicId), retry: false });
}

export function useFormMutations() {
  const queryClient = useQueryClient();
  const invalidateForms = () => queryClient.invalidateQueries({ queryKey: formQueryKeys.all });
  const invalidateForm = (formId: string) => Promise.all([
    invalidateForms(),
    queryClient.invalidateQueries({ queryKey: formQueryKeys.detail(formId) }),
    queryClient.invalidateQueries({ queryKey: formQueryKeys.analytics(formId) }),
  ]);

  return {
    create: useMutation({ mutationFn: formsApi.create, onSuccess: invalidateForms }),
    duplicate: useMutation({ mutationFn: formsApi.duplicate, onSuccess: invalidateForms }),
    remove: useMutation({ mutationFn: formsApi.remove, onSuccess: invalidateForms }),
    update: useMutation({
      mutationFn: ({ formId, ...input }: { formId: string } & UpdateFormInput) => formsApi.update(formId, input),
      onSuccess: (_response, { formId }) => invalidateForm(formId),
    }),
    saveBuilder: useMutation({
      mutationFn: ({ formId, builder }: { formId: string; builder: BuilderData }) => formsApi.saveBuilder(formId, builder),
      onSuccess: (response, { formId }) => queryClient.setQueryData(formQueryKeys.builder(formId), response),
    }),
  };
}

export function usePublicResponseMutation() {
  return useMutation({
    mutationFn: ({ publicId, ...payload }: { publicId: string } & SubmitResponseInput) =>
      formsApi.submitPublicResponse(publicId, payload),
  });
}
