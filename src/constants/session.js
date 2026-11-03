// Session timing limits used by the auth provider.
// Kept out of code so nothing here is a magic number.
export const IDLE_LIMIT_MS = 10 * 60 * 1000; // auto sign-out after 10 idle minutes (web parity)