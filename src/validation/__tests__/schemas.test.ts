import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  acceptInvitationSchema,
} from '../schemas';

describe('schemas', () => {
  describe('loginSchema', () => {
    it('aceita email válido e senha com mínimo 6 caracteres', () => {
      const result = loginSchema.safeParse({
        email: 'teste@exemplo.com',
        password: '123456',
      });
      expect(result.success).toBe(true);
    });

    it('rejeita email inválido', () => {
      const result = loginSchema.safeParse({
        email: 'email-invalido',
        password: '123456',
      });
      expect(result.success).toBe(false);
    });

    it('rejeita senha com menos de 6 caracteres', () => {
      const result = loginSchema.safeParse({
        email: 'teste@exemplo.com',
        password: '12345',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('forgotPasswordSchema', () => {
    it('aceita email válido', () => {
      const result = forgotPasswordSchema.safeParse({
        email: 'teste@exemplo.com',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('resetPasswordSchema', () => {
    it('aceita token, senha e confirmação iguais', () => {
      const result = resetPasswordSchema.safeParse({
        token: 'token123',
        password: '123456',
        confirmPassword: '123456',
      });
      expect(result.success).toBe(true);
    });

    it('rejeita senhas diferentes', () => {
      const result = resetPasswordSchema.safeParse({
        token: 'token123',
        password: '123456',
        confirmPassword: '654321',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('acceptInvitationSchema', () => {
    it('aceita token, senha e confirmação', () => {
      const result = acceptInvitationSchema.safeParse({
        token: 'invitation-token',
        password: '123456',
        confirmPassword: '123456',
      });
      expect(result.success).toBe(true);
    });
  });
});
