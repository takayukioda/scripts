// Convert HEX string into string
const ASCII_LENGTH = 2;
const UNICODE_LENGTH = 4;

const str2hex = (str) => Array.from(str)
  .map((c) => c.codePointAt().toString(16).padStart(4, "0"))
  .join("");

const hex2str = (hex, length = UNICODE_LENGTH) => hex
  .split("")
  .reduce((stack, c, index) => {
    if (index % length === 0) {
      stack.push(c);
    } else {
      const i = Math.floor(index / length);
      stack[i] = stack[i].concat(c);
    }
    return stack;
  }, [])
  .map((code) => String.fromCodePoint(`0x${code}`))
  ; //.join("");

if (process.argv.length < 3) {
  console.error("This script requires 1 argument.");
  process.exit(1);
}
const code = process.argv[2];
//const code = str2hex(process.argv[2]);
console.log("Given:", process.argv[2]);
console.log("Hex  :", code)
console.log("h2s/2:", hex2str(code, ASCII_LENGTH));
console.log("h2s/4:", hex2str(code, UNICODE_LENGTH));
process.exit(0);
