import { toArray } from '../toArray';

describe('toArray (normalização de contrato de lista)', () => {
  it('retorna o próprio array quando recebe array puro', () => {
    const input = [{ id: '1' }, { id: '2' }];
    expect(toArray<{ id: string }>(input)).toEqual(input);
  });

  it('retorna o mesmo array de referência quando recebe array puro (sem cópia)', () => {
    const input = [{ id: '1' }];
    expect(toArray<{ id: string }>(input)).toBe(input);
  });

  it('desembrulha envelope { data: [...] }', () => {
    const input = { data: [{ id: '1' }, { id: '2' }], total: 2 };
    expect(toArray<{ id: string }>(input)).toEqual([{ id: '1' }, { id: '2' }]);
  });

  it('retorna array vazio para null/undefined', () => {
    expect(toArray<unknown>(null)).toEqual([]);
    expect(toArray<unknown>(undefined)).toEqual([]);
  });

  it('retorna array vazio para primitivos', () => {
    expect(toArray<unknown>('texto')).toEqual([]);
    expect(toArray<unknown>(42)).toEqual([]);
    expect(toArray<unknown>(true)).toEqual([]);
  });

  it('retorna array vazio para objeto sem propriedade data', () => {
    expect(toArray<unknown>({ items: [1, 2] })).toEqual([]);
    expect(toArray<unknown>({})).toEqual([]);
  });

  it('não entra em loop em estruturas recursivas com chave data', () => {
    const recursive: Record<string, unknown> = { total: 1 };
    recursive.data = recursive;
    // Deve retornar o valor de data sem tentar normalizar novamente.
    expect(toArray<unknown>(recursive)).toBe(recursive.data);
  });

  it('preserva tipagem genérica (type-level, validado em runtime com cast)', () => {
    const wrapped = { data: ['a', 'b'] };
    const result = toArray<string>(wrapped);
    expect(result).toEqual(['a', 'b']);
  });
});
