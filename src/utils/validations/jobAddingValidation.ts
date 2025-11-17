import * as Yup from "yup";

export const jobSchema = Yup.object().shape({
  jobrole: Yup.string().required("Job Role is required"),
  jobLocation: Yup.string().required("Job Location is required"),
  workTime: Yup.string().required("Work Time is required"),
  workMode: Yup.string().required("Work Mode is required"),
  minExperience: Yup.number()
    .required("Minimum Experience is required")
    .min(0, "Experience cannot be negative"),
  minSalary: Yup.number().required("Minimum Salary is required"),
  maxSalary: Yup.number().required("Maximum Salary is required"),
  requirements: Yup.string().required("Requirements are required"),
  responsibilities: Yup.string().required("Responsibilities are required"),
});