// As respostas do onboarding são gravadas com a chave crua (snake_case) e, no
// caso do tipo de cirurgia, com o valor em código ("bariatrica"). Estes mapas
// levam a chave e o valor de volta ao idioma do painel — o que não tiver
// tradução cai no valor cru, para nunca esconder um dado da nutricionista.

const ANSWER_LABEL_KEY: Record<string, string> = {
  surgery_type: "onboarding.fields.surgeryType",
  language: "onboarding.fields.language",
  country: "onboarding.fields.country",
  surgery_city: "onboarding.fields.surgeryCity",
  hospital: "onboarding.fields.hospital",
};

const SURGERY_TYPE_VALUE_KEY: Record<string, string> = {
  bariatrica: "onboarding.surgeryTypes.bariatric",
  endocrina: "onboarding.surgeryTypes.endocrine",
  outro: "onboarding.surgeryTypes.other",
};

type Translate = (key: string) => string;

/** Rótulo traduzido de uma resposta do onboarding (fallback: a chave crua). */
export function answerLabel(t: Translate, key: string): string {
  const labelKey = ANSWER_LABEL_KEY[key];
  return labelKey ? t(labelKey) : key;
}

/** Valor traduzido — hoje só o tipo de cirurgia tem opções em código. */
export function answerValue(t: Translate, key: string, value: unknown): string {
  if (key === "surgery_type") {
    const valueKey = SURGERY_TYPE_VALUE_KEY[String(value)];
    if (valueKey) return t(valueKey);
  }
  return String(value);
}
