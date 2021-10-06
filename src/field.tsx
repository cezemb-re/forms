import {
  createElement,
  ReactElement,
  ReactNode,
  ComponentType,
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import isEqual from 'lodash.isequal';
import { FieldState, FormState, useFormContext, FormFields } from './state';

export interface FieldComponentProps<V = any, F extends FormFields = FormFields>
  extends Partial<FieldState<V>> {
  form: FormState<F>;
  onFocus: () => void;
  onChange: (eventOrValue: ChangeEvent<{ value: V }> | V) => void;
  onBlur: () => void;
  [key: string]: any; // Custom Props
}

export interface FieldProps<V = any, F extends FormFields = FormFields> {
  name: keyof F;
  initialValue?: V;
  component?: string | ComponentType<FieldComponentProps<V, F>>;
  onChange?: (value: V) => void;
  children?: ReactNode;
  [key: string]: any;
}

export default function Field<V = any, F extends FormFields = FormFields>({
  name,
  initialValue,
  component,
  onChange,
  children,
  ...customProps
}: FieldProps<V, F>): ReactElement | null {
  const memoizedName = useRef<keyof F>();
  const memoizedInitialValue = useRef<V>();

  const { formState, mountField, focusField, changeField, blurField } = useFormContext<F>();

  useEffect(() => {
    if (memoizedName.current !== name || !isEqual(memoizedInitialValue.current, initialValue)) {
      mountField(name, initialValue);
      memoizedName.current = name;
      memoizedInitialValue.current = initialValue;
    }
  }, [name, initialValue, mountField]);

  const onFocus = useCallback(() => {
    focusField(name);
  }, [focusField, name]);

  const change = useCallback(
    (eventOrValue: ChangeEvent<{ value: V }> | V) => {
      let value: V;
      if (
        typeof eventOrValue === 'object' &&
        eventOrValue &&
        'target' in eventOrValue &&
        eventOrValue.target &&
        'value' in eventOrValue.target
      ) {
        value = eventOrValue.target.value;
      } else if (
        typeof eventOrValue === 'object' &&
        eventOrValue &&
        'currentTarget' in eventOrValue &&
        eventOrValue.currentTarget &&
        'value' in eventOrValue.currentTarget
      ) {
        value = eventOrValue.currentTarget.value;
      } else {
        value = eventOrValue as V;
      }
      changeField(name, value);
      if (onChange) {
        onChange(value);
      }
    },
    [changeField, name, onChange],
  );

  const onBlur = useCallback(() => {
    blurField(name);
  }, [blurField, name]);

  if (!formState.fields || !(name in formState.fields)) {
    return null;
  }

  if (component) {
    return createElement<FieldComponentProps<V, F>>(
      component,
      {
        ...customProps,
        ...formState.fields[name],
        form: formState,
        onFocus,
        onChange: change,
        onBlur,
      },
      children,
    );
  }

  return createElement('input', {
    ...customProps,
    name,
    value: formState.fields[name]?.value,
    onFocus,
    onChange: change,
    onBlur,
  });
}
