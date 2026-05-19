import * as Yup from "yup";
import { IFeedbackFormValues } from "../interfaces/IFeedbackFormValues";

const countWords = (text: string): number =>
    text.trim().split(/\s+/).filter(w => w.length > 0).length;

export const FeedbackValidationSchema: Yup.ObjectSchema<IFeedbackFormValues> = Yup.object({
    rating: Yup.number()
        .min(1, 'Please select a star rating')
        .required('Star rating is required'),

    feedback: Yup.string()
        .required('Feedback is required')
        .test('min-one-word', 'Please enter at least one word', (value) => {
            if (!value) return false;
            return countWords(value) >= 1;
        })
        .test('max-50-words', 'Feedback must not exceed 50 words', (value) => {
            if (!value) return true;
            return countWords(value) <= 50;
        }),
});
