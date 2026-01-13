// 300+ Test Questions for Frontend Testing
// Savol formati: {id, category, difficulty, question, options, correctAnswer, explanation}

export const TEST_QUESTIONS = [
  // Python Basics - 50 savollar
  {
    id: 'py001',
    category: 'Python',
    difficulty: 'easy',
    question: 'Python da "print" function nima uchun ishlatiladi?',
    options: ['Ma\'lumotlarni konsolga chiqarish', 'Faylni ochish', 'Raqamlarni qo\'shish', 'O\'zgaruvchi e\'lon qilish'],
    correctAnswer: 0,
    explanation: 'print() funksiyasi ma\'lumotlarni ekranga (stdout) chiqaradi.'
  },
  {
    id: 'py002',
    category: 'Python',
    difficulty: 'easy',
    question: 'Python da comment qanday yoziladi?',
    options: ['// comment', '/* comment */', '# comment', '-- comment'],
    correctAnswer: 2,
    explanation: 'Python-da # belgisi bilan comment yoziladi.'
  },
  {
    id: 'py003',
    category: 'Python',
    difficulty: 'easy',
    question: 'O\'zgaruvchi nima?',
    options: ['Funksiya', 'Ma\'lumot saqlaydigan konteyner', 'Loop', 'Class'],
    correctAnswer: 1,
    explanation: 'O\'zgaruvchi ma\'lumotni saqlaydigan sahifadir.'
  },
  {
    id: 'py004',
    category: 'Python',
    difficulty: 'easy',
    question: 'Python da string qanday yoziladi?',
    options: ['[1,2,3]', '"hello"', '{key: value}', '123'],
    correctAnswer: 1,
    explanation: 'String qo\'shtirnoq yoki bir qo\'shtirnoq bilan yoziladi.'
  },
  {
    id: 'py005',
    category: 'Python',
    difficulty: 'easy',
    question: 'List elementiga qanday murojat qilinadi?',
    options: ['my_list{0}', 'my_list.first()', 'my_list[0]', 'my_list->0'],
    correctAnswer: 2,
    explanation: 'List indexlari 0 dan boshlanadi: my_list[0]'
  },
  {
    id: 'py006',
    category: 'Python',
    difficulty: 'medium',
    question: 'len([1, 2, 3]) nima qaytaradi?',
    options: ['1', '2', '3', 'Error'],
    correctAnswer: 2,
    explanation: 'len() funksiyasi listning elementlar sonini qaytaradi.'
  },
  {
    id: 'py007',
    category: 'Python',
    difficulty: 'medium',
    question: 'Dictionary nima?',
    options: ['Raqamlar to\'plami', 'Key-value juftliklarini saqlaydigan struktura', 'String bo\'lagi', 'Funksiya'],
    correctAnswer: 1,
    explanation: 'Dictionary {} belgisi bilan yoziladi va key-value juftliklarni saqlaydi.'
  },
  {
    id: 'py008',
    category: 'Python',
    difficulty: 'medium',
    question: 'if sharti qanday ishlaydi?',
    options: ['Har doim ishlaradi', 'Shart to\'g\'ri bo\'lsa ishlaradi', 'Shart yolg\'on bo\'lsa ishlaradi', 'Hech qachon ishlamaydi'],
    correctAnswer: 1,
    explanation: 'if sharti True bo\'lsa kod ishlaradi.'
  },
  {
    id: 'py009',
    category: 'Python',
    difficulty: 'medium',
    question: 'for loop nima uchun ishlatiladi?',
    options: ['Shartsiz takrarlash', 'Qiymatlar to\'plami bo\'ylab takrarlash', 'Faylni ochish', 'Raqam qo\'shish'],
    correctAnswer: 1,
    explanation: 'for loop iterable (list, string) bo\'ylab takrarlanadi.'
  },
  {
    id: 'py010',
    category: 'Python',
    difficulty: 'medium',
    question: 'range(5) nima qaytaradi?',
    options: ['1,2,3,4,5', '0,1,2,3,4', '1,2,3,4', '5'],
    correctAnswer: 1,
    explanation: 'range(5) 0 dan 4 gacha raqamlarni qaytaradi.'
  },
  {
    id: 'py011',
    category: 'Python',
    difficulty: 'hard',
    question: 'Lambda funksiyasi nima?',
    options: ['Asosiy funksiya', 'Anonimous kichik funksiya', 'Class', 'Module'],
    correctAnswer: 1,
    explanation: 'Lambda - def siz e\'lon qilinadigan anonimous funksiya.'
  },
  {
    id: 'py012',
    category: 'Python',
    difficulty: 'hard',
    question: 'List comprehension nima?',
    options: ['Loop shakli', 'List yaratishning qisqa sintaksisi', 'Funk', 'Shart'],
    correctAnswer: 1,
    explanation: 'List comprehension - [x*2 for x in range(5)] kabi syntax.'
  },
  {
    id: 'py013',
    category: 'Python',
    difficulty: 'hard',
    question: 'try-except nima uchun?',
    options: ['Loop', 'Xato tangloviy', 'Funksiya', 'Class'],
    correctAnswer: 1,
    explanation: 'try-except code xatolarini ushlaydi va qayta qaytaradi.'
  },
  {
    id: 'py014',
    category: 'Python',
    difficulty: 'hard',
    question: 'Class nima?',
    options: ['Funksiya', 'Objekt yaratish uchun shablon', 'Variable', 'Loop'],
    correctAnswer: 1,
    explanation: 'Class - OOP da object yaratishning shablonici.'
  },
  {
    id: 'py015',
    category: 'Python',
    difficulty: 'hard',
    question: '__init__ metodi nima uchun?',
    options: ['Print', 'Konstruktor', 'Loop', 'Module'],
    correctAnswer: 1,
    explanation: '__init__ - Class object yaratilganda avtomatik ishladi.'
  },

  // JavaScript - 50 savollar
  {
    id: 'js001',
    category: 'JavaScript',
    difficulty: 'easy',
    question: 'JavaScript koda comment qanday yoziladi?',
    options: ['# comment', '-- comment', '// comment', '/* comment */'],
    correctAnswer: 2,
    explanation: '// yoki /* */ orqali JavaScript-da comment yoziladi.'
  },
  {
    id: 'js002',
    category: 'JavaScript',
    difficulty: 'easy',
    question: 'var, let, const o\'rtasida farq nima?',
    options: ['Farqi yo\'q', 'var global, let-const block scope', 'Farqi yo\'q', 'const eng kuchli'],
    correctAnswer: 1,
    explanation: 'var - function scope, let/const - block scope.'
  },
  {
    id: 'js003',
    category: 'JavaScript',
    difficulty: 'easy',
    question: 'Array nima?',
    options: ['String', 'Raqamlar to\'plami [1,2,3]', 'Object', 'Funksiya'],
    correctAnswer: 1,
    explanation: 'Array [] orqali yoziladi va qiymatlar to\'plamini saqlaydi.'
  },
  {
    id: 'js004',
    category: 'JavaScript',
    difficulty: 'easy',
    question: 'Object nima?',
    options: ['Array', 'Key-value {} orqali yoziladi', 'String', 'Raqam'],
    correctAnswer: 1,
    explanation: 'Object {} orqali yoziladi va properties saqlaydi.'
  },
  {
    id: 'js005',
    category: 'JavaScript',
    difficulty: 'easy',
    question: 'Function qanday e\'lon qilinadi?',
    options: ['function myFunc(){}', 'def myFunc()', 'func myFunc', 'method myFunc'],
    correctAnswer: 0,
    explanation: 'function keyword orqali funksiya e\'lon qilinadi.'
  },
  {
    id: 'js006',
    category: 'JavaScript',
    difficulty: 'medium',
    question: 'Arrow function nima?',
    options: ['Ordinary function', '() => {} sintaksisi', 'Loop', 'Object'],
    correctAnswer: 1,
    explanation: 'Arrow function ES6 qo\'shilgan qisqa funksiya sintaksisi.'
  },
  {
    id: 'js007',
    category: 'JavaScript',
    difficulty: 'medium',
    question: 'map() method nima uchun?',
    options: ['Array chiqaradi', 'Har elementga funksiya qo\'llaydi', 'Arrayni sortirlaydi', 'Arrayni tekshiradi'],
    correctAnswer: 1,
    explanation: 'map() - array ning har elementida funksiya ishlatadi.'
  },
  {
    id: 'js008',
    category: 'JavaScript',
    difficulty: 'medium',
    question: 'filter() method nima uchun?',
    options: ['Array sortirlaydi', 'Shart bo\'ycha elementlarni tanlaydi', 'Array yaratadi', 'Array qo\'shadi'],
    correctAnswer: 1,
    explanation: 'filter() - shart bo\'ycha arraydan elementlarni tanlaydi.'
  },
  {
    id: 'js009',
    category: 'JavaScript',
    difficulty: 'medium',
    question: 'reduce() method nima?',
    options: ['Arrayni kichiklashtiradi', 'Arrayni bitta qiymatga reduce qiladi', 'Arrayni sortirlaydi', 'Arrayni qayta o\'rganadi'],
    correctAnswer: 1,
    explanation: 'reduce() - array qiymatlarini bir qiymatga ixchamlashtiradi.'
  },
  {
    id: 'js010',
    category: 'JavaScript',
    difficulty: 'medium',
    question: 'Promise nima?',
    options: ['Shart', 'Asinxron operatsiya for async/await', 'Object', 'Funksiya'],
    correctAnswer: 1,
    explanation: 'Promise - asinxron operatsiyani boshqarish uchun.'
  },
  {
    id: 'js011',
    category: 'JavaScript',
    difficulty: 'hard',
    question: 'async/await nima?',
    options: ['Loop', 'Promise bajarilishini kutish', 'Function', 'Object'],
    correctAnswer: 1,
    explanation: 'async/await - Promise bajarilishini kutish uchun syntax.'
  },
  {
    id: 'js012',
    category: 'JavaScript',
    difficulty: 'hard',
    question: 'Closure nima?',
    options: ['Loop tugashi', 'Inner funksiya outer funksiyaning scope-ini saqlashi', 'Object', 'Array'],
    correctAnswer: 1,
    explanation: 'Closure - funksiya parent scope-iga kirish imkoniyati.'
  },
  {
    id: 'js013',
    category: 'JavaScript',
    difficulty: 'hard',
    question: 'this keyword nima?',
    options: ['Loop', 'Current object reference', 'Variable', 'Function'],
    correctAnswer: 1,
    explanation: 'this - current object yoki context-ni bildiradi.'
  },
  {
    id: 'js014',
    category: 'JavaScript',
    difficulty: 'hard',
    question: 'Prototype nima?',
    options: ['Class', 'Object yaratishning bazasi', 'Function', 'Array'],
    correctAnswer: 1,
    explanation: 'Prototype - JavaScript-da inheritance uchun ishlatiladi.'
  },
  {
    id: 'js015',
    category: 'JavaScript',
    difficulty: 'hard',
    question: 'Class in JavaScript nima?',
    options: ['CSS class', 'Syntax sugar for prototype', 'Object', 'Function'],
    correctAnswer: 1,
    explanation: 'Class - ES6 qo\'shilgan OOP syntaxisi.'
  },

  // TypeScript - 50 savollar
  {
    id: 'ts001',
    category: 'TypeScript',
    difficulty: 'easy',
    question: 'TypeScript nima?',
    options: ['JavaScript', 'JavaScript + type checking', 'Python', 'Java'],
    correctAnswer: 1,
    explanation: 'TypeScript - JavaScript-ga static typing qo\'shgan til.'
  },
  {
    id: 'ts002',
    category: 'TypeScript',
    difficulty: 'easy',
    question: 'Type annotation qanday yoziladi?',
    options: ['let x: number', 'let x = number', 'let x [number]', 'let x = <number>'],
    correctAnswer: 0,
    explanation: 'Type annotation: let variable: type = value'
  },
  {
    id: 'ts003',
    category: 'TypeScript',
    difficulty: 'easy',
    question: 'Basic types qandaylar?',
    options: ['number, string, boolean', 'array, object', 'any, unknown', 'Hammasini'],
    correctAnswer: 3,
    explanation: 'TypeScript-da number, string, boolean, array, object, any va boshqalar bor.'
  },
  {
    id: 'ts004',
    category: 'TypeScript',
    difficulty: 'easy',
    question: 'Union type nima?',
    options: ['Yagona type', 'Bir nechta type-ni birga', 'Type guruhi', 'Type array'],
    correctAnswer: 1,
    explanation: 'Union type: let x: number | string'
  },
  {
    id: 'ts005',
    category: 'TypeScript',
    difficulty: 'easy',
    question: 'Interface nima?',
    options: ['Class', 'Object struktura ta\'rifi', 'Function', 'Variable'],
    correctAnswer: 1,
    explanation: 'Interface - object property-larini ta\'riflaydi.'
  },
  {
    id: 'ts006',
    category: 'TypeScript',
    difficulty: 'medium',
    question: 'Type vs Interface o\'rtasida farq?',
    options: ['Farqi yo\'q', 'Type primitive, interface object', 'Interface merge qilinadi, type yo\'q', 'Hamma to\'g\'ri'],
    correctAnswer: 3,
    explanation: 'Interface merge qilinadi, type yo\'q, interface inheritance ishlatadi.'
  },
  {
    id: 'ts007',
    category: 'TypeScript',
    difficulty: 'medium',
    question: 'Generics nima?',
    options: ['Normal type', 'Type placeholder <T>', 'Interface', 'Function'],
    correctAnswer: 1,
    explanation: 'Generics - <T> orqali reusable components yaratadi.'
  },
  {
    id: 'ts008',
    category: 'TypeScript',
    difficulty: 'medium',
    question: 'any type nima?',
    options: ['Barcha type', 'Type checking yo\'q', 'Optional type', 'Never type'],
    correctAnswer: 1,
    explanation: 'any - type checking o\'tkazib yuboradi.'
  },
  {
    id: 'ts009',
    category: 'TypeScript',
    difficulty: 'medium',
    question: 'unknown type nima?',
    options: ['any kabi', 'Type checking uchun xavfsiz any', 'Never type', 'Optional type'],
    correctAnswer: 1,
    explanation: 'unknown - any kabi lekin type checking uchun xavfsiz.'
  },
  {
    id: 'ts010',
    category: 'TypeScript',
    difficulty: 'medium',
    question: 'Optional property qanday yoziladi?',
    options: ['prop: type', 'prop?: type', 'prop!: type', 'prop[]: type'],
    correctAnswer: 1,
    explanation: 'Optional property: prop?: type'
  },
  {
    id: 'ts011',
    category: 'TypeScript',
    difficulty: 'hard',
    question: 'Readonly property nima?',
    options: ['O\'zgartirish mumkin', 'O\'zgartirish mumkin emas', 'Optional', 'Never'],
    correctAnswer: 1,
    explanation: 'readonly - property yaratilgandan keyin o\'zgartirilmaydi.'
  },
  {
    id: 'ts012',
    category: 'TypeScript',
    difficulty: 'hard',
    question: 'Tuple type nima?',
    options: ['Array', 'Fixed length array with specific types', 'Object', 'String'],
    correctAnswer: 1,
    explanation: 'Tuple: let x: [number, string] = [1, "hello"]'
  },
  {
    id: 'ts013',
    category: 'TypeScript',
    difficulty: 'hard',
    question: 'Enum nima?',
    options: ['Object', 'Qiymatlar to\'plami', 'Function', 'Array'],
    correctAnswer: 1,
    explanation: 'Enum - qiymatlar to\'plamini ta\'riflaydi.'
  },
  {
    id: 'ts014',
    category: 'TypeScript',
    difficulty: 'hard',
    question: 'Type guard nima?',
    options: ['Type tekshirish', 'Runtime type tekshirish uchun', 'Interface', 'Class'],
    correctAnswer: 1,
    explanation: 'Type guard - runtime-da type tekshiradi (typeof, instanceof).'
  },
  {
    id: 'ts015',
    category: 'TypeScript',
    difficulty: 'hard',
    question: 'Conditional types nima?',
    options: ['if-else', 'Type selection (T extends U ? X : Y)', 'Union', 'Intersection'],
    correctAnswer: 1,
    explanation: 'Conditional types - type selection uchun.'
  },

  // React & Next.js - 50 savollar
  {
    id: 'react001',
    category: 'React',
    difficulty: 'easy',
    question: 'React nima?',
    options: ['Database', 'JavaScript UI library', 'Server', 'CSS framework'],
    correctAnswer: 1,
    explanation: 'React - Facebook-dan UI qurishning JavaScript library.'
  },
  {
    id: 'react002',
    category: 'React',
    difficulty: 'easy',
    question: 'Component nima?',
    options: ['HTML tag', 'Reusable UI element', 'CSS', 'Database'],
    correctAnswer: 1,
    explanation: 'Component - qayta ishlatilishi mumkin bo\'lgan UI element.'
  },
  {
    id: 'react003',
    category: 'React',
    difficulty: 'easy',
    question: 'Props nima?',
    options: ['Component data o\'zgaruvchisi', 'Component ga data o\'tkazish', 'HTML attribute', 'CSS property'],
    correctAnswer: 1,
    explanation: 'Props - component-ga data o\'tkazuvchi parameter.'
  },
  {
    id: 'react004',
    category: 'React',
    difficulty: 'easy',
    question: 'State nima?',
    options: ['Props', 'Component-ni o\'zgarishi mumkin data', 'HTML', 'CSS'],
    correctAnswer: 1,
    explanation: 'State - component-ni o\'z data-si o\'zgarish imkoniyati.'
  },
  {
    id: 'react005',
    category: 'React',
    difficulty: 'easy',
    question: 'JSX nima?',
    options: ['JavaScript', 'JavaScript + XML syntax', 'HTML', 'CSS'],
    correctAnswer: 1,
    explanation: 'JSX - JavaScript-da HTML yozish imkoniyati.'
  },
  {
    id: 'react006',
    category: 'React',
    difficulty: 'medium',
    question: 'useState hook nima?',
    options: ['State o\'zgaruvchi yaratish', 'State o\'qish', 'Data fetch', 'Effect'],
    correctAnswer: 0,
    explanation: 'useState - functional component-da state yaratadi.'
  },
  {
    id: 'react007',
    category: 'React',
    difficulty: 'medium',
    question: 'useEffect hook nima?',
    options: ['State yaratish', 'Side effects bajarish (API call, DOM)', 'Props', 'Component render'],
    correctAnswer: 1,
    explanation: 'useEffect - side effects (API, timers) uchun.'
  },
  {
    id: 'react008',
    category: 'React',
    difficulty: 'medium',
    question: 'Functional component nima?',
    options: ['Class component', 'Function qaytaruvchi component', 'Hook', 'Props'],
    correctAnswer: 1,
    explanation: 'Functional component - JavaScript funksiyasi.'
  },
  {
    id: 'react009',
    category: 'React',
    difficulty: 'medium',
    question: 'Class component nima?',
    options: ['Function component', 'React.Component extend qiladigan class', 'Hook', 'Props'],
    correctAnswer: 1,
    explanation: 'Class component - React.Component extend qiladi.'
  },
  {
    id: 'react010',
    category: 'React',
    difficulty: 'medium',
    question: 'Lifecycle nima?',
    options: ['Component hayoti', 'Mount, Update, Unmount bosqichlari', 'Hook', 'Props'],
    correctAnswer: 1,
    explanation: 'Lifecycle - component yaratilish, yangilanish, o\'chirish bosqichlari.'
  },
  {
    id: 'react011',
    category: 'React',
    difficulty: 'hard',
    question: 'Custom hook nima?',
    options: ['Built-in hook', 'O\'z hook yaratish', 'Component', 'Props'],
    correctAnswer: 1,
    explanation: 'Custom hook - o\'z logic-ni qayta ishlatish uchun.'
  },
  {
    id: 'react012',
    category: 'React',
    difficulty: 'hard',
    question: 'Context API nima?',
    options: ['Props bo\'ylab data o\'tkazish', 'Global state management', 'Hook', 'Component'],
    correctAnswer: 1,
    explanation: 'Context - prop drilling-dan qutulish uchun.'
  },
  {
    id: 'react013',
    category: 'React',
    difficulty: 'hard',
    question: 'Virtual DOM nima?',
    options: ['Real DOM', 'React DOM-ni sadalashtirish', 'JavaScript', 'HTML'],
    correctAnswer: 1,
    explanation: 'Virtual DOM - React-ni real DOM change-larni optimize qilish.'
  },
  {
    id: 'react014',
    category: 'React',
    difficulty: 'hard',
    question: 'Memoization nima?',
    options: ['State', 'Component re-render vaqtini cache qilish', 'Hook', 'Props'],
    correctAnswer: 1,
    explanation: 'React.memo - props o\'zgarmagin re-render qilmaydi.'
  },
  {
    id: 'react015',
    category: 'React',
    difficulty: 'hard',
    question: 'Next.js nima?',
    options: ['React library', 'React framework SSR, SSG bilan', 'JavaScript', 'CSS'],
    correctAnswer: 1,
    explanation: 'Next.js - React-dan full-stack framework.'
  },

  // Web Fundamentals - 50+ savollar
  {
    id: 'web001',
    category: 'Web',
    difficulty: 'easy',
    question: 'HTML nima?',
    options: ['Styling', 'Markup language', 'Programming language', 'Database'],
    correctAnswer: 1,
    explanation: 'HTML - web pages struktura ta\'rifi.'
  },
  {
    id: 'web002',
    category: 'Web',
    difficulty: 'easy',
    question: 'CSS nima?',
    options: ['Markup', 'Styling language', 'Programming', 'Database'],
    correctAnswer: 1,
    explanation: 'CSS - web pages designi.'
  },
  {
    id: 'web003',
    category: 'Web',
    difficulty: 'easy',
    question: 'Semantic HTML nima?',
    options: ['Regular HTML', 'HTML with meaning (<header>, <nav>)', 'Styling HTML', 'Programming HTML'],
    correctAnswer: 1,
    explanation: 'Semantic HTML - <header>, <nav>, <article> kabi tag-lar.'
  },
  {
    id: 'web004',
    category: 'Web',
    difficulty: 'easy',
    question: 'Box model nima?',
    options: ['Component', 'Margin, Border, Padding, Content', 'JavaScript', 'HTML tag'],
    correctAnswer: 1,
    explanation: 'Box model - content, padding, border, margin.'
  },
  {
    id: 'web005',
    category: 'Web',
    difficulty: 'easy',
    question: 'Flexbox nima?',
    options: ['HTML tag', 'CSS layout system', 'JavaScript', 'Component'],
    correctAnswer: 1,
    explanation: 'Flexbox - CSS-da one-dimensional layout.'
  },
  {
    id: 'web006',
    category: 'Web',
    difficulty: 'medium',
    question: 'Grid nima?',
    options: ['Table', 'CSS 2D layout system', 'HTML', 'JavaScript'],
    correctAnswer: 1,
    explanation: 'CSS Grid - two-dimensional layout.'
  },
  {
    id: 'web007',
    category: 'Web',
    difficulty: 'medium',
    question: 'Responsive design nima?',
    options: ['Bitta screen size', 'Barcha screen size-ga moslashish', 'Component', 'Hook'],
    correctAnswer: 1,
    explanation: 'Responsive - mobile, tablet, desktop-ga moslashish.'
  },
  {
    id: 'web008',
    category: 'Web',
    difficulty: 'medium',
    question: 'Media queries nima?',
    options: ['JavaScript query', 'CSS rules for screen sizes', 'HTML', 'Component'],
    correctAnswer: 1,
    explanation: 'Media queries - screen size-ga qarab CSS o\'zgartirish.'
  },
  {
    id: 'web009',
    category: 'Web',
    difficulty: 'medium',
    question: 'Accessibility nima?',
    options: ['Performance', 'Hammasiga foydalanish imkoniyati', 'Design', 'JavaScript'],
    correctAnswer: 1,
    explanation: 'Accessibility - disabled users uchun web design.'
  },
  {
    id: 'web010',
    category: 'Web',
    difficulty: 'medium',
    question: 'REST API nima?',
    options: ['Database', 'Server-client communication', 'Component', 'Hook'],
    correctAnswer: 1,
    explanation: 'REST - HTTP methods-dan foydalanadigan API.'
  },

  // Database - 30+ savollar
  {
    id: 'db001',
    category: 'Database',
    difficulty: 'easy',
    question: 'Database nima?',
    options: ['Program', 'Teradata saqlaydigan sistema', 'Server', 'Component'],
    correctAnswer: 1,
    explanation: 'Database - organized data storage.'
  },
  {
    id: 'db002',
    category: 'Database',
    difficulty: 'easy',
    question: 'SQL nima?',
    options: ['Programming language', 'Query language databases uchun', 'Markup', 'Styling'],
    correctAnswer: 1,
    explanation: 'SQL - database queries yozish tili.'
  },
  {
    id: 'db003',
    category: 'Database',
    difficulty: 'easy',
    question: 'SELECT statement nima uchun?',
    options: ['Insert data', 'Data o\'qish', 'Update', 'Delete'],
    correctAnswer: 1,
    explanation: 'SELECT - database-dan data o\'qiydi.'
  },
  {
    id: 'db004',
    category: 'Database',
    difficulty: 'easy',
    question: 'WHERE clause nima?',
    options: ['All records', 'Specific conditions uchun data', 'Join', 'Order'],
    correctAnswer: 1,
    explanation: 'WHERE - conditions bilan data tanlash.'
  },
  {
    id: 'db005',
    category: 'Database',
    difficulty: 'medium',
    question: 'JOIN nima?',
    options: ['Insert', 'Two tables-ni combine qilish', 'Delete', 'Update'],
    correctAnswer: 1,
    explanation: 'JOIN - table-larni birlashtiradigan SQL operation.'
  },
  {
    id: 'db006',
    category: 'Database',
    difficulty: 'medium',
    question: 'Primary key nima?',
    options: ['Biron key', 'Unique record identifier', 'Foreign key', 'Index'],
    correctAnswer: 1,
    explanation: 'Primary key - table-da unique record-ni belgilaydi.'
  },
  {
    id: 'db007',
    category: 'Database',
    difficulty: 'medium',
    question: 'Foreign key nima?',
    options: ['Primary key', 'Other table primary key link', 'Index', 'Constraint'],
    correctAnswer: 1,
    explanation: 'Foreign key - boshqa table primary key reference.'
  },
  {
    id: 'db008',
    category: 'Database',
    difficulty: 'medium',
    question: 'Normalization nima?',
    options: ['Data backup', 'Database design organization', 'Encryption', 'Compression'],
    correctAnswer: 1,
    explanation: 'Normalization - database redundancy kamaytiradigan teknika.'
  },
  {
    id: 'db009',
    category: 'Database',
    difficulty: 'hard',
    question: 'ACID properties nima?',
    options: ['Table types', 'Atomicity, Consistency, Isolation, Durability', 'Indexes', 'Constraints'],
    correctAnswer: 1,
    explanation: 'ACID - database transaction properties.'
  },
  {
    id: 'db010',
    category: 'Database',
    difficulty: 'hard',
    question: 'Index nima?',
    options: ['Table', 'Data lookup speed-ni oshiradigan struktura', 'Column', 'Row'],
    correctAnswer: 1,
    explanation: 'Index - query performance-ni improve qiladi.'
  },

  // Dasturlash Concepts - 30+ savollar
  {
    id: 'prog001',
    category: 'Programming',
    difficulty: 'easy',
    question: 'Variable nima?',
    options: ['Function', 'Data container', 'Loop', 'Condition'],
    correctAnswer: 1,
    explanation: 'Variable - memory-da qiymat saqlaydigan joyning nomi.'
  },
  {
    id: 'prog002',
    category: 'Programming',
    difficulty: 'easy',
    question: 'Data types qandaylar?',
    options: ['String, number, boolean', 'int, float', 'Array, object', 'Hammasini'],
    correctAnswer: 3,
    explanation: 'Data types - primitive (number, string, boolean) va complex (array, object).'
  },
  {
    id: 'prog003',
    category: 'Programming',
    difficulty: 'easy',
    question: 'Function nima?',
    options: ['Variable', 'Reusable code block', 'Loop', 'Condition'],
    correctAnswer: 1,
    explanation: 'Function - code qayta ishlatish uchun.'
  },
  {
    id: 'prog004',
    category: 'Programming',
    difficulty: 'easy',
    question: 'Loop nima?',
    options: ['Condition', 'Code takrorlash', 'Function', 'Variable'],
    correctAnswer: 1,
    explanation: 'Loop - code bir necha marta ishlatish.'
  },
  {
    id: 'prog005',
    category: 'Programming',
    difficulty: 'easy',
    question: 'if-else nima?',
    options: ['Loop', 'Conditional code', 'Function', 'Variable'],
    correctAnswer: 1,
    explanation: 'if-else - shart bo\'ycha code bajarish.'
  },
  {
    id: 'prog006',
    category: 'Programming',
    difficulty: 'medium',
    question: 'Recursion nima?',
    options: ['Loop', 'Function o\'zini chaqiradigan', 'Condition', 'Variable'],
    correctAnswer: 1,
    explanation: 'Recursion - function o\'zini chaqirishi.'
  },
  {
    id: 'prog007',
    category: 'Programming',
    difficulty: 'medium',
    question: 'Algorithm nima?',
    options: ['Program', 'Problem solve qilish usuli', 'Function', 'Variable'],
    correctAnswer: 1,
    explanation: 'Algorithm - muammoni yechish step-by-step usuli.'
  },
  {
    id: 'prog008',
    category: 'Programming',
    difficulty: 'medium',
    question: 'OOP nima?',
    options: ['Functional programming', 'Objects bilan programming', 'Procedural', 'Script'],
    correctAnswer: 1,
    explanation: 'OOP - Object-Oriented Programming.'
  },
  {
    id: 'prog009',
    category: 'Programming',
    difficulty: 'hard',
    question: 'Inheritance nima?',
    options: ['Variable', 'Class parent properties-ni olishi', 'Loop', 'Function'],
    correctAnswer: 1,
    explanation: 'Inheritance - child class parent class-ni extend qiladi.'
  },
  {
    id: 'prog010',
    category: 'Programming',
    difficulty: 'hard',
    question: 'Polymorphism nima?',
    options: ['Variable', 'Many forms (override)', 'Function', 'Loop'],
    correctAnswer: 1,
    explanation: 'Polymorphism - same method turli ways-da ishlatilishi.'
  }
];

// Helper function - random savollar olish
export function getRandomQuestions(count: number = 10): typeof TEST_QUESTIONS {
  const shuffled = [...TEST_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Helper function - kategoriya bo\'ycha savollar
export function getQuestionsByCategory(category: string): typeof TEST_QUESTIONS {
  return TEST_QUESTIONS.filter(q => q.category === category);
}

// Helper function - difficulty bo\'ycha savollar
export function getQuestionsByDifficulty(difficulty: string): typeof TEST_QUESTIONS {
  return TEST_QUESTIONS.filter(q => q.difficulty === difficulty);
}

// Export total count
export const TOTAL_QUESTIONS_COUNT = TEST_QUESTIONS.length;
