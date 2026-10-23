/**
 * Safe Mathematical Parser and Evaluator without eval()
 * Implements Shunting-Yard Algorithm & Reverse Polish Notation (RPN) Evaluator
 */

export interface EvaluationResult {
  success: boolean;
  result?: number;
  formattedResult?: string;
  error?: string;
}

type TokenType = 'NUMBER' | 'OP' | 'FUNC' | 'LPAREN' | 'RPAREN' | 'UNARY_MINUS';

interface Token {
  type: TokenType;
  value: string;
}

// Strip floating point representation artifacts like 0.30000000000000004
export function cleanFloat(num: number): number {
  if (Number.isNaN(num) || !Number.isFinite(num)) return num;
  return parseFloat(num.toPrecision(12));
}

export function formatResultNumber(num: number): string {
  if (!Number.isFinite(num)) {
    return 'خطا';
  }
  const cleaned = cleanFloat(num);
  // If scientific notation is needed for extremely small or large numbers
  if (Math.abs(cleaned) >= 1e14 || (Math.abs(cleaned) > 0 && Math.abs(cleaned) < 1e-6)) {
    return cleaned.toExponential(6).replace('e+', 'e+').replace('e-', 'e-');
  }
  // Remove trailing zeros in decimal representation
  return String(cleaned);
}

/**
 * Tokenizes the mathematical expression string
 */
function tokenize(expression: string): Token[] {
  const sanitized = expression
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/√/g, 'sqrt')
    .replace(/π/g, `${Math.PI}`)
    .replace(/\be\b/g, `${Math.E}`);

  const tokens: Token[] = [];
  let i = 0;

  while (i < sanitized.length) {
    const ch = sanitized[i];

    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    // Numbers (digits and decimal point)
    if (/[0-9.]/.test(ch)) {
      let numStr = '';
      let dotCount = 0;
      while (i < sanitized.length && /[0-9.]/.test(sanitized[i])) {
        if (sanitized[i] === '.') {
          dotCount++;
          if (dotCount > 1) {
            throw new Error('قالب عدد نامعتبر است (بیش از یک ممیز اعشاری)');
          }
        }
        numStr += sanitized[i];
        i++;
      }
      tokens.push({ type: 'NUMBER', value: numStr });
      continue;
    }

    // Function names (e.g. sqrt, sin, cos, tan, log, ln)
    if (/[a-zA-Z]/.test(ch)) {
      let funcName = '';
      while (i < sanitized.length && /[a-zA-Z]/.test(sanitized[i])) {
        funcName += sanitized[i];
        i++;
      }
      tokens.push({ type: 'FUNC', value: funcName.toLowerCase() });
      continue;
    }

    // Operators and Parentheses
    if (ch === '(') {
      tokens.push({ type: 'LPAREN', value: '(' });
      i++;
      continue;
    }

    if (ch === ')') {
      tokens.push({ type: 'RPAREN', value: ')' });
      i++;
      continue;
    }

    if (['+', '-', '*', '/', '^', '%'].includes(ch)) {
      // Check for unary minus: at start of expression, or immediately after an operator or '('
      const lastToken = tokens[tokens.length - 1];
      const isUnary =
        ch === '-' &&
        (!lastToken ||
          lastToken.type === 'OP' ||
          lastToken.type === 'LPAREN' ||
          lastToken.type === 'UNARY_MINUS');

      if (isUnary) {
        tokens.push({ type: 'UNARY_MINUS', value: 'u-' });
      } else {
        tokens.push({ type: 'OP', value: ch });
      }
      i++;
      continue;
    }

    throw new Error(`کاراکتر ناشناخته: ${ch}`);
  }

  return tokens;
}

const PRECEDENCE: Record<string, number> = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2,
  '%': 2,
  '^': 3,
  'u-': 4,
};

const RIGHT_ASSOCIATIVE: Record<string, boolean> = {
  '^': true,
  'u-': true,
};

/**
 * Shunting-Yard Algorithm to convert tokens to Reverse Polish Notation (RPN)
 */
function shuntingYard(tokens: Token[]): Token[] {
  const outputQueue: Token[] = [];
  const operatorStack: Token[] = [];

  for (const token of tokens) {
    if (token.type === 'NUMBER') {
      outputQueue.push(token);
    } else if (token.type === 'FUNC') {
      operatorStack.push(token);
    } else if (token.type === 'OP' || token.type === 'UNARY_MINUS') {
      const op1 = token.value;
      while (operatorStack.length > 0) {
        const top = operatorStack[operatorStack.length - 1];
        if (top.type === 'FUNC') {
          outputQueue.push(operatorStack.pop()!);
          continue;
        }
        if (top.type === 'OP' || top.type === 'UNARY_MINUS') {
          const op2 = top.value;
          const p1 = PRECEDENCE[op1] ?? 0;
          const p2 = PRECEDENCE[op2] ?? 0;
          const isRight = RIGHT_ASSOCIATIVE[op1] || false;

          if ((!isRight && p1 <= p2) || (isRight && p1 < p2)) {
            outputQueue.push(operatorStack.pop()!);
          } else {
            break;
          }
        } else {
          break;
        }
      }
      operatorStack.push(token);
    } else if (token.type === 'LPAREN') {
      operatorStack.push(token);
    } else if (token.type === 'RPAREN') {
      let foundMatchingLeft = false;
      while (operatorStack.length > 0) {
        const top = operatorStack.pop()!;
        if (top.type === 'LPAREN') {
          foundMatchingLeft = true;
          break;
        } else {
          outputQueue.push(top);
        }
      }
      if (!foundMatchingLeft) {
        throw new Error('پرانتزهای عبارت نامتعادل هستند');
      }
      if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type === 'FUNC') {
        outputQueue.push(operatorStack.pop()!);
      }
    }
  }

  while (operatorStack.length > 0) {
    const top = operatorStack.pop()!;
    if (top.type === 'LPAREN' || top.type === 'RPAREN') {
      throw new Error('پرانتزهای عبارت نامتعادل هستند');
    }
    outputQueue.push(top);
  }

  return outputQueue;
}

/**
 * Evaluates Reverse Polish Notation queue
 */
function evaluateRPN(rpnTokens: Token[]): number {
  const stack: number[] = [];

  for (const token of rpnTokens) {
    if (token.type === 'NUMBER') {
      const val = parseFloat(token.value);
      if (Number.isNaN(val)) throw new Error('مقدار عددی نامعتبر است');
      stack.push(val);
    } else if (token.type === 'UNARY_MINUS') {
      if (stack.length < 1) throw new Error('عملوند کافی برای علامت منفی وجود ندارد');
      const val = stack.pop()!;
      stack.push(-val);
    } else if (token.type === 'OP') {
      if (stack.length < 2) throw new Error('عملوند کافی برای عملگر وجود ندارد');
      const b = stack.pop()!;
      const a = stack.pop()!;

      switch (token.value) {
        case '+':
          stack.push(cleanFloat(a + b));
          break;
        case '-':
          stack.push(cleanFloat(a - b));
          break;
        case '*':
          stack.push(cleanFloat(a * b));
          break;
        case '/':
          if (b === 0) {
            throw new Error('تقسیم بر صفر امکان‌پذیر نیست');
          }
          stack.push(cleanFloat(a / b));
          break;
        case '%':
          // Standard modulo or percentage operator
          stack.push(cleanFloat(a % b));
          break;
        case '^':
          stack.push(cleanFloat(Math.pow(a, b)));
          break;
        default:
          throw new Error(`عملگر ناشناخته: ${token.value}`);
      }
    } else if (token.type === 'FUNC') {
      if (stack.length < 1) throw new Error('ورودی کافی برای تابع وجود ندارد');
      const a = stack.pop()!;

      switch (token.value) {
        case 'sqrt':
          if (a < 0) {
            throw new Error('جذر عدد منفی تعریف‌نشده است');
          }
          stack.push(cleanFloat(Math.sqrt(a)));
          break;
        case 'sin':
          // Accepts degrees converted to radians for user friendliness
          stack.push(cleanFloat(Math.sin((a * Math.PI) / 180)));
          break;
        case 'cos':
          stack.push(cleanFloat(Math.cos((a * Math.PI) / 180)));
          break;
        case 'tan': {
          const mod = Math.abs(a % 180);
          if (mod === 90) throw new Error('تانژانت ۹۰ درجه تعریف‌نشده است');
          stack.push(cleanFloat(Math.tan((a * Math.PI) / 180)));
          break;
        }
        case 'log':
          if (a <= 0) throw new Error('لگاریتم برای اعداد نامثبت تعریف نشده است');
          stack.push(cleanFloat(Math.log10(a)));
          break;
        case 'ln':
          if (a <= 0) throw new Error('لگاریتم طبیعی برای اعداد نامثبت تعریف نشده است');
          stack.push(cleanFloat(Math.log(a)));
          break;
        case 'abs':
          stack.push(Math.abs(a));
          break;
        default:
          throw new Error(`تابع پشتیبانی‌نشده: ${token.value}`);
      }
    }
  }

  if (stack.length !== 1) {
    throw new Error('عبارت محاسباتی ناقص یا نامعتبر است');
  }

  return cleanFloat(stack[0]);
}

/**
 * Main safe evaluation function
 */
export function evaluateExpression(expr: string): EvaluationResult {
  if (!expr || expr.trim() === '') {
    return { success: false, error: 'عبارت خالی است' };
  }

  try {
    const tokens = tokenize(expr);
    if (tokens.length === 0) {
      return { success: false, error: 'عبارت خالی است' };
    }
    const rpn = shuntingYard(tokens);
    const result = evaluateRPN(rpn);

    if (Number.isNaN(result) || !Number.isFinite(result)) {
      return { success: false, error: 'نتیجه تعریف‌نشده یا بی‌نهایت است' };
    }

    return {
      success: true,
      result,
      formattedResult: formatResultNumber(result),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'خطای محاسباتی';
    return {
      success: false,
      error: message,
    };
  }
}
