import { createContext, SyntheticEvent, useContext } from 'react';

export type FieldValidationFunction = (value: any) => Error | string | null | void;

export interface FieldState<Value = any> {
  name?: string;
  initialValue: Value;
  value: Value;
  hasChanged: boolean;
  isValid: boolean;
  isActive: boolean;
  visited: boolean;
  submitted: boolean;
  error: string | null;
  warning: string | null;
}

export const defaultFieldState: FieldState = {
  name: undefined,
  initialValue: undefined,
  value: undefined,
  hasChanged: false,
  isValid: true,
  isActive: false,
  visited: false,
  submitted: false,
  error: null,
  warning: null,
};

export interface FormFields {
  [key: string]: any;
}

export type FormErrors<Fields extends FormFields = FormFields> = {
  [key in keyof Fields]?: string;
} & { _global?: string };

export class FormSubmitError<Fields extends FormFields = FormFields> extends Error {
  __FLAG__: 'FormSubmitError';

  submitErrors: FormErrors<Fields> | null;

  constructor(errors: string | FormErrors) {
    super(typeof errors === 'string' ? errors : 'Unknown error');
    this.submitErrors = typeof errors === 'string' ? { _global: errors } : errors;
    this.__FLAG__ = 'FormSubmitError';
  }
}

export function isFormSubmitError(error: any): boolean {
  return !!(error && '__FLAG__' in error && error.__FLAG__ && error.__FLAG__ === 'FormSubmitError');
}

export type FormValidationFunction<Fields extends FormFields = FormFields> = (
  values: Partial<Fields>,
) => FormErrors<Fields> | Error | string | null | void;

export type FormSubmitFunction<Fields extends FormFields = FormFields> = (
  values: Fields,
  changes: Partial<Fields>,
) => Promise<any> | FormErrors | Error | string | null | void;

export interface FormState<Fields extends FormFields = FormFields> {
  nbFields: number;
  hasChanged: boolean;
  isValid: boolean;
  isActive: boolean;
  visited: boolean;
  isSubmitting: boolean;
  submitSucceeded: boolean;
  submitFailed: boolean;
  submitCounter: number;
  values: Partial<Fields>;
  changes: Partial<Fields>;
  fields: { [key in keyof Fields]?: FieldState };
  errors: FormErrors<Fields>;
  error: string | null;
  warning: string | null;
  warnings: FormErrors<Fields>;
  liveValidation: boolean;
  onSubmit?: FormSubmitFunction<Fields> | null;
  onChange?: FormSubmitFunction<Fields> | null;
  validate?: FormValidationFunction<Fields> | null;
  warn?: FormValidationFunction<Fields> | null;
}

export function getDefaultFormState<Fields extends FormFields = FormFields>(): FormState<Fields> {
  return {
    nbFields: 0,
    hasChanged: false,
    isValid: true,
    isSubmitting: false,
    submitSucceeded: false,
    submitFailed: false,
    isActive: false,
    visited: false,
    submitCounter: 0,
    values: {},
    changes: {},
    fields: {},
    errors: {},
    error: null,
    warning: null,
    warnings: {},
    liveValidation: false,
  };
}

export interface FormContext<Fields extends FormFields = FormFields> {
  formState: FormState<Fields>;
  mountField: (
    name: keyof Fields,
    initialValue: any,
    validateField?: FieldValidationFunction,
    warnField?: FieldValidationFunction,
  ) => void;
  focusField: (name: keyof Fields) => void;
  changeField: (name: keyof Fields, value: any) => void;
  blurField: (name: keyof Fields) => void;
  resetField: (name: keyof Fields) => void;
  submitForm: (event?: SyntheticEvent) => Promise<void> | boolean | void;
  resetForm: () => void;
}

export function getDefaultContext<Fields extends FormFields = FormFields>(): FormContext<Fields> {
  return {
    formState: getDefaultFormState<Fields>(),
    mountField: () => undefined,
    focusField: () => undefined,
    changeField: () => undefined,
    blurField: () => undefined,
    resetField: () => undefined,
    submitForm: () => undefined,
    resetForm: () => undefined,
  };
}

const formContext = createContext<FormContext<any>>(getDefaultContext());

export function useFormContext<Fields extends FormFields = FormFields>(): FormContext<Fields> {
  return useContext<FormContext<Fields>>(formContext);
}

export default formContext;
