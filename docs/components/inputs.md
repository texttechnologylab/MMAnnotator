# Input Components

All input components integrate with `react-hook-form` via the `control` prop and are designed to work inside a shadcn `<Form>`.

## ButtonInput

Toggle button group for categorical selection. Renders as a row of buttons where only one can be active.

```tsx
<ButtonInput
  control={control}
  name="rating"
  label="Quality"
  buttons={[
    { label: "Good", style: "primary", value: "good" },
    { label: "Neutral", style: "secondary", value: "neutral" },
    { label: "Bad", style: "danger", value: "bad" }
  ]}
/>
```

## SelectInput

Dropdown select powered by shadcn's Select component.

```tsx
<SelectInput
  control={control}
  name="category"
  label="Category"
  items={[
    { label: "News", value: "news" },
    { label: "Blog", value: "blog" }
  ]}
/>
```

## ComboBoxInput

Searchable dropdown using shadcn's Command/Popover.

## CheckBoxInput / SwitchInput

Boolean toggle fields.

## DateInput

Calendar-based date picker using `react-day-picker`.

## CustomInput / NumberInput

Standard text and number input fields with label and validation support.
