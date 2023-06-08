import * as yup from "yup";

const noteFormSchema = yup.object().shape({
  title: yup
    .string()
    .required("Title is required.")
    .max(50, "Title cannot exceed 30 characters.")
    .test("only-spaces", "Title cannot contain only spaces.", (value) => {
      return !/^\s+$/.test(value);
    }),
});

export default noteFormSchema;
