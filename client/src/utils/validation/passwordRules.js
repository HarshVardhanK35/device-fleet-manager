export function getPasswordRules(password) {
  return [
    { text: "8+ characters", ok: password.length >= 8 },
    { text: "One number", ok: /\d/.test(password) },
    { text: "One uppercase letter", ok: /[A-Z]/.test(password) },
  ];
}
