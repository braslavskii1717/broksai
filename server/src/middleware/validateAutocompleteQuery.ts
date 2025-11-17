import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

const AUTOCOMPLETE_REGEX = /^[а-яё0-9\s-]+$/;

const schema = z.object({
  q: z
    .string()
    .transform((value) => value.trim().toLowerCase())
    .refine((value) => value.length >= 2, { message: 'Минимальная длина запроса 2 символа' })
    .refine((value) => value.length <= 50, { message: 'Максимальная длина запроса 50 символов' })
    .refine((value) => AUTOCOMPLETE_REGEX.test(value), {
      message: 'Допустимы только русские буквы, цифры, пробелы и дефисы',
    }),
});

export type AutocompleteQueryParams = z.infer<typeof schema>;

declare module 'express-serve-static-core' {
  interface Locals {
    autocompleteParams: AutocompleteQueryParams;
  }
}

export function validateAutocompleteQuery(req: Request, res: Response, next: NextFunction) {
  const parsed = schema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      error: 'INVALID_QUERY',
      message: parsed.error.issues[0]?.message ?? 'Некорректный запрос',
    });
  }

  res.locals.autocompleteParams = parsed.data;
  next();
}
