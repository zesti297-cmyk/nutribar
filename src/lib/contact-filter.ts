// Detecta tentativa de passar telefone/WhatsApp dentro de uma mensagem do chat.
// A plataforma quer manter o contato interno, então o envio é BLOQUEADO quando
// isto acha um número. É de propósito mais "paranoico" que preciso: preferimos
// barrar um número solto de mais do que deixar vazar um WhatsApp.

// Palavras que, por extenso, formam um telefone ("nove oito sete...") em pt/es/en.
// Cinco ou mais seguidas viram suspeita de número ditado para furar o filtro.
const SPELLED_DIGITS = [
  // pt
  "zero", "um", "uma", "dois", "duas", "três", "tres", "quatro", "cinco",
  "seis", "sete", "oito", "nove", "meia",
  // es
  "cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve",
  // en
  "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "zero",
];

const spelledPattern = new RegExp(
  `\\b(?:${SPELLED_DIGITS.join("|")})\\b(?:[\\s,.-]+\\b(?:${SPELLED_DIGITS.join("|")})\\b){4,}`,
  "iu",
);

/**
 * True se o texto parece conter um número de telefone/WhatsApp.
 *
 * Estratégia: normaliza separadores comuns de telefone (espaço, ., -, (), +) e
 * conta dígitos em sequências. Um telefone tem tipicamente 8+ dígitos; usamos 7
 * como limiar para pegar variações. Também barra números ditados por extenso.
 */
export function containsPhoneNumber(text: string): boolean {
  if (!text) return false;

  // Números por extenso ("nove oito sete seis cinco...").
  if (spelledPattern.test(text)) return true;

  // Junta dígitos separados por caracteres típicos de telefone, para que
  // "9 8 7 6 5 4 3 2" ou "(11) 98765-4321" contem como uma só sequência.
  // Mantém letras/outros como quebra de sequência.
  let run = 0;
  let maxRun = 0;
  for (const ch of text) {
    if (ch >= "0" && ch <= "9") {
      run += 1;
      if (run > maxRun) maxRun = run;
    } else if (" .-()+\t ".includes(ch)) {
      // separador comum de telefone: não zera a sequência
      continue;
    } else {
      run = 0;
    }
  }

  return maxRun >= 7;
}
