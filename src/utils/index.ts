import { splitTags, trimTitle } from 'utags-utils'
import Console from 'console-tagger'
import {
  HASH_DELIMITER,
  FILTER_DELIMITER,
  OR_CONDITION_DELIMITER,
  defaultFavicons,
} from '../config/constants.js'

const console = new Console({
  prefix: 'utils',
  color: { line: 'white', background: 'orange' },
})

/**
 * Normalizes and simplifies a URL by:
 * 1. Removing tracking parameters (utm_*, fbclid, etc)
 * 2. Simplifying path segments (keep first 2 or last 1)
 * 3. Removing trailing slashes
 * 4. Decoding special characters
 * 5. Stripping protocol and www prefix
 * @param {string} url - Original URL to process
 * @returns {string} Cleaned and human-readable URL
 */
export function humanizeUrl(url: string) {
  try {
    const parsed = new URL(url)

    // Filter common tracking parameters while preserving valid query parameters
    const allowedParameters = [...parsed.searchParams].filter(
      ([key]) => !/^(utm_|fbclid|gclid|mc_|yclid|_ga|zanpid)/.test(key)
    )

    // Path simplification logic: Keep first and last segments when exceeding 2, otherwise keep original
    const pathSegments = parsed.pathname.split('/').filter(Boolean)
    const simplifiedPath =
      pathSegments.length > 2
        ? `/${pathSegments[0]}/.../${pathSegments.slice(-1).join('')}`
        : parsed.pathname

    // Build new URL object with cleaned parameters and simplified path
    const cleaned = new URL(parsed.origin)
    cleaned.pathname = simplifiedPath
    for (const [k, v] of allowedParameters) {
      cleaned.searchParams.set(k, v)
    }

    // Decode URI components and remove protocol, www prefix, and trailing slash
    return decodeURIComponent(`${cleaned.toString()}${parsed.hash}`)
      .replace(/\/$/, '')
      .replace(/^(https?:\/\/)?(www\.)?/, '')
  } catch {
    return url.replace(/^(https?:\/\/)?(www\.)?/, '').split(/[?#]/)[0]
  }
}

export function formatDatetime(date: number, full = false) {
  const locale = ['zh-CN', 'en-US', 'ja-JP', 'ko-KR'][1]
  return full
    ? new Date(date).toLocaleString(locale, {
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : new Date(date).toLocaleString(locale, {
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
}

/**
 * Cleans trailing spaces and slashes from filter string
 * @param {string|undefined} str - Raw string with possible trailing spaces/slashes
 * @returns {string} Cleaned string
 * @example
 * cleanFilterString('a,b,c/a.com/  ') // => 'a,b,c/a.com'
 * cleanFilterString('a,b,c/  /  ')   // => 'a,b,c'
 */
export function cleanFilterString(filterString: string | undefined) {
  if (!filterString) {
    return ''
  }

  return filterString.replace(/[\s/]+$/, '').trim()
}

/**
 * Parses filter string from URL hash
 * @param {string} filterString - Format: `[tags]/[domains]/[keyword]`
 *                                 - tags: URL-encoded comma-separated tags (e.g 'tag1%2Ctag2')
 *                                 - domains: URL-encoded comma-separated domains
 *                                 - keyword: URL-encoded search term
 * @returns {Object|undefined} Object with:
 *                  - searchKeyword: Cleaned search term
 *                  - selectedTags: Set of tags
 *                  - selectedDomains: Set of domains
 *                 Returns undefined on parse failure
 * @example
 * // Input example
 * parseFilterString('tag1%2Ctag2/example.com%2Ctest.com/keyword%20test')
 * // Returns
 * {
 *   searchKeyword: 'keyword test',
 *   selectedTags: new Set(['tag1', 'tag2']),
 *   selectedDomains: new Set(['example.com', 'test.com'])
 * }
 */
export function parseFilterString(filterString: string | undefined) {
  try {
    console.info(`current filter string: [${filterString}]`)

    if (filterString) {
      // Split into three parts: tags, domains, keyword [tags/domains/keyword]
      const [tagString = '', domainString = '', keyword = ''] =
        filterString.split(FILTER_DELIMITER, 3)

      // Process tag array (returns empty array if empty string)
      const tags = splitTags(decodeURIComponent(tagString))

      // Process domain array (returns empty array if empty string)
      const domains = splitTags(decodeURIComponent(domainString))

      // Clean and decode search keyword
      const cleanedKeyword = trimTitle(decodeURIComponent(keyword))

      return {
        searchKeyword: cleanedKeyword,
        selectedTags: new Set(tags),
        selectedDomains: new Set(domains),
      }
    }
  } catch (error) {
    console.error('Failed to parse filter string:', {
      error,
      filterString,
    })
  }

  return undefined
}

/**
 * Converts tags, domains, and keywords into a URL-safe filter string
 * @param {Set<string>} tags - Set of tags to encode
 * @param {Set<string>} domains - Set of domains to encode
 * @param {string} keyword - Search keyword to encode
 * @returns {string} Formatted as [encoded_tags]/[encoded_domains]/[encoded_keyword]
 * @example
 * convertToFilterString(new Set(['tag1', 'tag2']), new Set(['example.com', 'test.com']), 'keyword')
 * // Returns 'tag1%2Ctag2/example.com%2Ctest.com/keyword'
 * @example
 * convertToFilterString(new Set(), new Set(), '')
 * // Returns ''
 */
export function convertToFilterString(
  tags: Set<string>,
  domains: Set<string>,
  keyword: string
) {
  const filterString = [
    encodeURIComponent([...tags].join(OR_CONDITION_DELIMITER)),
    encodeURIComponent([...domains].join(OR_CONDITION_DELIMITER)),
    encodeURIComponent(keyword.trim()),
  ].join(FILTER_DELIMITER)

  return filterString === '//' ? '' : filterString.replace(/[/#]+$/, '')
}

/**
 * Converts a hash-based filter string into URLSearchParams format.
 *
 * This function takes a URL hash string containing filter information in the format
 * `tag1%2Ctag2/example.com%2Ctest.com/keyword%20test` and converts it into URLSearchParams
 * with the structure `t=tag1,tag2&d=example.com,test.com&q=keyword test`.
 *
 * @param {string|undefined} hash - The URL hash string containing filter information.
 *                                 Expected format: `[encoded_tags]/[encoded_domains]/[encoded_keyword]`
 * @returns {URLSearchParams} A URLSearchParams object containing the parsed filter parameters:
 *                           - 't' parameter for tags (comma-separated)
 *                           - 'd' parameter for domains (comma-separated)
 *                           - 'q' parameter for search keyword
 * @example
 * // Returns URLSearchParams with 't=tag1,tag2&d=example.com,test.com&q=keyword test'
 * parseHashFiltersToSearchParams('tag1%2Ctag2/example.com%2Ctest.com/keyword%20test');
 *
 * @example
 * // Returns URLSearchParams with 't=tag1,tag2&d=example.com,test.com&q=keyword test&t=tag3,tag4&d=example.net,test.net&q=keyword test2'
 * parseHashFiltersToSearchParams('tag1%2Ctag2/example.com%2Ctest.com/keyword%20test#tag3%2Ctag4/example.net%2Ctest.net/keyword%20test2');
 *
 * @example
 * // Returns empty URLSearchParams
 * parseHashFiltersToSearchParams('');
 */
export function parseHashFiltersToSearchParams(
  hash: string | undefined
): URLSearchParams {
  const searchParams = new URLSearchParams()

  if (!hash?.trim()) return searchParams

  const filterStrings = hash.split(HASH_DELIMITER).filter(Boolean)

  for (const filterString of filterStrings) {
    const filter = parseFilterString(filterString)
    if (!filter) continue

    const { selectedTags, selectedDomains, searchKeyword } = filter

    if (selectedTags.size > 0) {
      searchParams.append(
        't',
        Array.from(selectedTags).join(OR_CONDITION_DELIMITER)
      )
    }

    if (selectedDomains.size > 0) {
      searchParams.append(
        'd',
        Array.from(selectedDomains).join(OR_CONDITION_DELIMITER)
      )
    }

    if (searchKeyword) {
      searchParams.append('q', searchKeyword)
    }
  }

  return searchParams
}

/**
 * Extracts filter parameters from URL hash and merges them into URL search parameters.
 *
 * This function takes a URL string, extracts the hash portion containing filter parameters,
 * converts them to URLSearchParams format using parseHashFiltersToSearchParams,
 * and merges them into the existing URL search parameters.
 *
 * @param {string} href - The URL string containing both search parameters and hash
 * @returns {void} Modifies the URL's search parameters in place by merging hash parameters
 * @example
 * // For URL 'https://example.com?existing=param#tag1,tag2/domain.com/keyword'
 * // Will merge hash parameters into search params as 'existing=param&t=tag1,tag2&d=domain.com&q=keyword'
 * mergeHashFiltersIntoSearchParams('https://example.com?existing=param#tag1,tag2/domain.com/keyword');
 */
export function mergeHashFiltersIntoSearchParams(
  href: string
): URLSearchParams {
  const url = new URL(href)
  const searchParams = url.searchParams
  const hash = url.hash
  const searchParams2 = parseHashFiltersToSearchParams(hash)
  for (const [key, value] of searchParams2.entries()) {
    searchParams.append(key, value)
  }

  console.log(searchParams.toString())
  return searchParams
}

export function getHostName(href: string) {
  if (!href) {
    return ''
  }

  const url = new URL(href)
  if (
    url.protocol === 'http:' ||
    url.protocol === 'https:' ||
    url.protocol === 'ftp:'
  ) {
    return url.hostname
  }

  return url.protocol
}

export function getFaviconUrl(href: string, size: 16 | 32 | 64 = 16) {
  // TODO: add cache. cache[href][size]
  // TODO: 获取不到 favicon 时，使用首字母图片作为 favicon。标题或域名首字母
  // https://www.google.com/s2/favicons?domain=google.com&sz=64
  // https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://google.com&size=64
  // const domain=new URL(href).hostname
  const domain = new URL(href).origin
  const url = `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${domain}&size=${size}`
  const wrapUrl = `https://wsrv.nl/?w=${size}&h=${size}&url=${encodeURIComponent(url)}&default=${defaultFavicons[size]}`
  return wrapUrl
}

/**
 * Normalizes and deduplicates an array of strings by:
 * 1. Trimming whitespace from each string
 * 2. Filtering out empty strings
 * 3. Removing duplicate strings (case-sensitive)
 *
 * @param {string[]} strings - Array of strings to process
 * @returns {string[]} New array with unique, non-empty, trimmed strings
 * @example
 * // Returns ['tag1', 'tag2', 'tag3']
 * normalizeAndDeduplicateStrings([' tag1', 'tag2 ', ' tag1 ', '', 'tag3'])
 */
export const normalizeAndDeduplicateStrings = (strings: string[]): string[] => [
  ...new Set(strings.map((string) => string.trim()).filter(Boolean)),
]

/**
 * Deduplicates a two-dimensional array based on the content of each sub-array.
 * Uses each sub-array's string representation as a key to ensure arrays with identical elements are only kept once.
 *
 * @param {T[][]} arr - The two-dimensional array to deduplicate
 * @param {boolean} [ignoreOrder=false] - When true, array elements will be sorted before comparison,
 *                                        making [1,2] and [2,1] considered identical
 * @returns {T[][]} A deduplicated two-dimensional array
 * @example
 * // Returns [[1, 2], [3, 4]]
 * deduplicateArrays([[1, 2], [1, 2], [3, 4]])
 * @example
 * // With ignoreOrder=true, returns [[1, 2], [3, 4]]
 * deduplicateArrays([[1, 2], [2, 1], [3, 4]], true)
 */
export function deduplicateArrays<T>(arr: T[][], ignoreOrder = false): T[][] {
  // Use a Map object with string representation of arrays as keys and original arrays as values
  const uniqueMap = new Map<string, T[]>()

  for (const item of arr) {
    // When ignoreOrder is true, sort the array before creating the key
    // This ensures that arrays with the same elements in different orders are considered identical
    const keyArray =
      ignoreOrder && Array.isArray(item)
        ? [...item].sort((a, b) => {
            // 对于数字类型，使用数值比较
            if (typeof a === 'number' && typeof b === 'number') {
              return a - b
            }

            // 对于字符串类型，使用字符串比较
            if (typeof a === 'string' && typeof b === 'string') {
              return a.localeCompare(b)
            }

            // 对于其他类型，转换为字符串后比较
            return String(a).localeCompare(String(b))
          })
        : item
    const key = keyArray.join(',')

    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, item)
    }
  }

  return Array.from(uniqueMap.values())
}
