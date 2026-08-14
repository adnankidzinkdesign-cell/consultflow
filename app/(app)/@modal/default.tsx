// Required alongside a parallel route slot (@modal): when the current URL
// doesn't match any route inside @modal (i.e. most of the time — no modal
// should be open), Next.js renders this instead of erroring.
export default function Default() {
  return null;
}
