import {
  createContext,
  useContext,
} from "react";
import {
  FormProvider,
  useFormContext,
  Controller,
} from "react-hook-form";
import { cn } from "../../lib/utils";
import { Label } from "./label";

// Re-export FormProvider as Form
export { FormProvider as Form };

// Context for each field
const FormFieldContext = createContext({});
const FormItemContext = createContext({});

export function FormField(props) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

export function FormItem({ className, ...props }) {
  return (
    <FormItemContext.Provider value={{}}>
      <div className={cn("space-y-1.5", className)} {...props} />
    </FormItemContext.Provider>
  );
}

export function FormLabel({ className, ...props }) {
  const { name } = useContext(FormFieldContext);
  const { formState } = useFormContext();
  const error = formState.errors[name];
  return (
    <Label
      className={cn(error && "text-red-500", className)}
      htmlFor={name}
      {...props}
    />
  );
}

export function FormControl({ ...props }) {
  const { name } = useContext(FormFieldContext);
  return <div id={name} {...props} />;
}

export function FormDescription({ className, ...props }) {
  return (
    <p className={cn("text-xs text-sage-500", className)} {...props} />
  );
}

export function FormMessage({ className, children, ...props }) {
  const { name } = useContext(FormFieldContext);
  const { formState } = useFormContext();
  const error = formState.errors[name];
  const body = error ? String(error?.message ?? "") : children;
  if (!body) return null;
  return (
    <p className={cn("text-xs font-medium text-red-500", className)} {...props}>
      {body}
    </p>
  );
}
