export interface FormState<Field extends string = string> {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Partial<Record<Field, string[]>>;
  /** Submitted text values, so the form can be refilled after an error. */
  values?: Partial<Record<Field, string>>;
}

export const initialFormState: FormState = { status: "idle" };
