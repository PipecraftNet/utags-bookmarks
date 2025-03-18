import { describe, it, expect } from 'vitest'
import { humanizeUrl, cleanFilterString, parseFilterString } from './index.js'

describe('humanizeUrl', () => {
  it('should correctly handle URLs with tracking parameters', () => {
    const url =
      'https://www.example.com/path1/path2/path3?utm_source=test&valid=1#section'
    expect(humanizeUrl(url)).toBe('example.com/path1/.../path3?valid=1#section')
  })

  it('should preserve valid query parameters', () => {
    const url = 'http://example.com?foo=bar&gclid=123&valid=true'
    expect(humanizeUrl(url)).toBe('example.com/?foo=bar&valid=true')
  })

  it('should simplify long paths keeping first and last segments', () => {
    const url = 'https://example.com/a/b/c/d/e'
    expect(humanizeUrl(url)).toBe('example.com/a/.../e')
  })

  it('should preserve hash fragments', () => {
    const url = 'https://example.com#anchor'
    expect(humanizeUrl(url)).toBe('example.com/#anchor')
  })

  it('should return original value for invalid URLs', () => {
    const url = 'invalid-url'
    expect(humanizeUrl(url)).toBe('invalid-url')
  })

  it('should remove trailing slashes', () => {
    const url = 'https://example.com/path/'
    expect(humanizeUrl(url)).toBe('example.com/path')
  })
})

describe('cleanFilterString', () => {
  it('should trim trailing spaces and slashes', () => {
    expect(cleanFilterString('a,b,c/a.com/  ')).toBe('a,b,c/a.com')
  })

  it('should clean pure space endings', () => {
    expect(cleanFilterString('test/   ')).toBe('test')
  })

  it('should handle empty input returning empty string', () => {
    expect(cleanFilterString(undefined)).toBe('')
    expect(cleanFilterString('')).toBe('')
  })

  it('should preserve valid path slashes', () => {
    expect(cleanFilterString('a/b/c')).toBe('a/b/c')
  })

  it('should clean mixed ending delimiters', () => {
    expect(cleanFilterString('  x, y, z  /  /  ')).toBe('x, y, z')
    expect(cleanFilterString('  /  /  ')).toBe('')
  })
})

describe('parseFilterString', () => {
  it('should correctly parse complete parameters', () => {
    const result = parseFilterString(
      'tag1%2Ctag2/example.com%2Ctest.com/keyword%20test'
    )
    expect(result).toEqual({
      searchKeyword: 'keyword test',
      selectedTags: new Set(['tag1', 'tag2']),
      selectedDomains: new Set(['example.com', 'test.com']),
    })
  })

  it('should handle missing tag section', () => {
    const result = parseFilterString('/domain.com/ keyword   test ')
    expect(result).toEqual({
      searchKeyword: 'keyword test',
      selectedTags: new Set([]),
      selectedDomains: new Set(['domain.com']),
    })
  })

  it('should handle missing domain section', () => {
    const result = parseFilterString('tagA%2CtagB//domain.com')
    expect(result).toEqual({
      searchKeyword: 'domain.com',
      selectedTags: new Set(['tagA', 'tagB']),
      selectedDomains: new Set([]),
    })
  })

  it('should handle missing keyword section', () => {
    const result = parseFilterString('tagA%2CtagB/domain.com/')
    expect(result?.searchKeyword).toBe('')
  })

  it('should handle empty string input', () => {
    expect(parseFilterString('')).toBeUndefined()
  })

  it('should decode special characters', () => {
    const result = parseFilterString(
      '%E4%B8%AD%E6%96%87%20tag/%E4%B8%AD%E6%96%87.com/key'
    )
    expect(result).toEqual({
      searchKeyword: 'key',
      selectedTags: new Set(['中文 tag']),
      selectedDomains: new Set(['中文.com']),
    })
  })

  it('should handle invalid URI encoding', () => {
    expect(parseFilterString('invalid%2/example.com/key')).toBeUndefined()
  })

  it('should return undefined when parsing fails', () => {
    expect(parseFilterString('invalid//@#$%^&*()')).toBeUndefined()
  })
})
