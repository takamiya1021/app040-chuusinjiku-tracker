// サンプルテスト - テスト環境の動作確認用
describe('Sample Test', () => {
  it('should pass a simple assertion', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle string operations', () => {
    const str = 'Hello World'
    expect(str).toContain('World')
    expect(str.length).toBe(11)
  })
})
