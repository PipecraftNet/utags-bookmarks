<script>
  import { fade } from 'svelte/transition'
  import Console from 'console-tagger'
  import { $ as _$ } from 'browser-extension-utils'
  import { HASH_DELIMITER } from '../constants.js'
  import { parseFilterString, convertToFilterString } from '../utils/index.js'

  const console = new Console({
    prefix: 'composite-filters-level' + level,
    color: { line: 'white', background: ['green', 'blue', 'purple'][level - 1] },
  })

  let { level, input, output = $bindable(), filterString, paused } = $props()

  console.log(`component loaded`)

  // 筛选相关状态
  let searchKeyword = $state('')
  let selectedTags = $state(new Set())
  let selectedDomains = $state(new Set())
  let tagCounts = $state(new Map())
  let domainCounts = $state(new Map())
  let statesInited = false

  function scrollTagIntoView(tag) {
    const element = _$(
      `.composite-filters-${level} .filter-group-tags label[data-key="${tag}"]`
    )
    if (element) {
      element.scrollIntoView({
        behavior: 'auto',
        block: 'nearest',
      })
    }
  }

  function scrollDomainIntoView(domain) {
    const element = _$(
      `.composite-filters-${level} .filter-group-domains label[data-key="${domain}"]`
    )
    if (element) {
      element.scrollIntoView({
        behavior: 'auto',
        block: 'nearest',
      })
    }
  }

  // 重置筛选条件
  function resetFilterWith(keyword, tags, domains) {
    console.log(`resetFilterWith`, keyword, tags, domains)
    searchKeyword = keyword || ''
    selectedTags = tags || new Set()
    selectedDomains = domains || new Set()

    if (tags && tags.size > 0) {
      setTimeout(() => {
        scrollTagIntoView(Array.from(tags)[0])
      }, 5)
    }

    if (domains && domains.size > 0) {
      setTimeout(() => {
        scrollDomainIntoView(Array.from(domains)[0])
      }, 5)
    }
  }

  // update url hash
  function updateUrlHash() {
    // hash sample: #tag1,tag2/domain1,domain2/keywod#tag3,tag4/domain3,domain4/keyword2#...
    const filterString = convertToFilterString(
      selectedTags,
      selectedDomains,
      searchKeyword
    )

    // 第一次执行时，selectedTags, selectedDomains, searchKeyword 还是初始化状态，不更新 url hash
    if (!statesInited) {
      statesInited = true
      return
    }

    let newUrlHash
    if (level === '1' && filterString === '') {
      // filters are empty
      newUrlHash = '#'
      // Notes: 不能设置为 ''，历史记录前进后退时会出现问题
    } else {
      const filterStringArr = location.hash.split(HASH_DELIMITER)
      const currentFilterString = filterStringArr[level] || ''
      console.log(
        `last filter string:`,
        `[${decodeURIComponent(currentFilterString)}]`,
        '\n                  new filter string:',
        `[${decodeURIComponent(filterString)}]`
      )
      if (currentFilterString === filterString) {
        return
      }
      filterStringArr.length = level
      filterStringArr[level] = filterString

      newUrlHash = filterStringArr.join(HASH_DELIMITER).replace(/[/#]+$/, '')
    }

    if (location.hash !== newUrlHash) {
      console.log(`new url hash [${newUrlHash}]`)
      globalThis.currentUrlHash = newUrlHash
      location.hash = newUrlHash
    }
  }

  $effect(() => {
    console.log(`call updateUrlHash()`)
    updateUrlHash()
  })

  // 监听 input 变化并更新 tagCounts 和 domainCounts
  $effect(() => {
    console.log(
      `init tagCounts and domainCounts - input list length:`,
      input.length
    )

    const _tagCounts = new Map(
      input
        .flatMap((entry) => entry[1].tags)
        .reduce((acc, tag) => {
          acc.set(tag, (acc.get(tag) || 0) + 1)
          return acc
        }, new Map())
    )

    const _domainCounts = new Map(
      input
        .map((entry) => new URL(entry[0]).hostname)
        .reduce((acc, domain) => {
          acc.set(domain, (acc.get(domain) || 0) + 1)
          return acc
        }, new Map())
    )

    // get filters from url hash
    const filter = parseFilterString(filterString)
    if (filter) {
      let lastOne
      for (const tag of filter.selectedTags) {
        lastOne = tag

        if (!_tagCounts.get(tag)) {
          _tagCounts.set(tag, 0)
        }
      }

      setTimeout(() => {
        scrollTagIntoView(lastOne)
      }, 5)

      for (const domain of filter.selectedDomains) {
        lastOne = domain

        if (!_domainCounts.get(domain)) {
          _domainCounts.set(domain, 0)
        }
      }

      setTimeout(() => {
        scrollDomainIntoView(lastOne)
      }, 5)

      searchKeyword = filter.searchKeyword
      selectedTags = filter.selectedTags
      selectedDomains = filter.selectedDomains
    } else {
      searchKeyword = ''
      selectedTags = new Set()
      selectedDomains = new Set()
    }

    tagCounts = _tagCounts
    domainCounts = _domainCounts
  })

  // 监听筛选条件变化并更新 output
  $effect(() => {
    if (paused) {
      console.log(`paused`)
      return
    }
    console.log(
      `current filter:`,
      `'${searchKeyword}'`,
      selectedTags,
      selectedDomains
    )

    if (searchKeyword || selectedTags.size || selectedDomains.size) {
      console.log(`=> apply filter`)
      output = input.filter(([url, entry]) => {
        const lowerKeyword = searchKeyword.trim().toLowerCase()
        const hasKeyword =
          lowerKeyword === '' ||
          url.toLowerCase().includes(lowerKeyword) ||
          entry.meta.title?.toLowerCase().includes(lowerKeyword) ||
          entry.tags.some((tag) => tag.toLowerCase().includes(lowerKeyword))

        const hasAllTags =
          selectedTags.size === 0 ||
          entry.tags.some((tag) => selectedTags.has(tag))

        const hasDomain =
          selectedDomains.size === 0 ||
          selectedDomains.has(new URL(url).hostname)

        return hasKeyword && hasAllTags && hasDomain
      })
    } else {
      output = [...input]
    }

    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('filterUpdated'))
    }, 5)
  })

  function toggleTag(tag) {
    selectedTags = selectedTags.has(tag)
      ? new Set([...selectedTags].filter((t) => t !== tag))
      : new Set([...selectedTags, tag])
  }

  function toggleDomain(domain) {
    selectedDomains = selectedDomains.has(domain)
      ? new Set([...selectedDomains].filter((d) => d !== domain))
      : new Set([...selectedDomains, domain])
  }
</script>

<aside
  class="composite-filters composite-filters-{level} flex flex-col gap-4"
  out:fade={{ duration: 500 }}>
  <div class="flex flex-col gap-2">
    <button
      class="reset-filter rounded-md border border-gray-200 bg-gray-100 px-2 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
      onclick={() => {
        resetFilterWith()
      }}>
      重置筛选 #{level}
    </button>
    <div class="relative w-full" style="padding-right: 1px;">
      <input
        type="text"
        placeholder="搜索 URL/标题/标签..."
        class="w-full rounded-md border border-gray-300 bg-transparent py-1.5 pr-8 pl-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        bind:value={searchKeyword} />
      {#if searchKeyword}
        <button
          class="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-gray-100 p-1 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          onclick={() => (searchKeyword = '')}
          aria-label="清除搜索关键词">
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      {/if}
    </div>
  </div>

  <div class="filter-controls flex h-full flex-col gap-4">
    {#if tagCounts && tagCounts.size}
      <div class="filter-group filter-group-tags relative overflow-y-auto">
        <h4
          class="sticky top-0 m-0 border-b border-gray-100 bg-white py-2 text-sm font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
          标签筛选
        </h4>
        {#each Array.from(tagCounts).sort((a, b) => b[1] - a[1]) as [tag, count]}
          <label
            data-key={tag}
            class="flex items-center gap-2 truncate rounded-md px-1 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
            <input
              type="checkbox"
              class="form-checkbox h-3.5 w-3.5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              checked={selectedTags.has(tag)}
              onchange={() => {
                toggleTag(tag)
                // selectedTags = selectedTagss
              }} />
            <span class="truncate">{tag}</span>
            <span class="text-xs font-medium text-gray-400">{count}</span>
          </label>
        {/each}
      </div>
    {/if}

    {#if domainCounts && domainCounts.size}
      <div class="filter-group filter-group-domains relative overflow-y-auto">
        <h4
          class="sticky top-0 m-0 border-b border-gray-100 bg-white py-2 text-sm font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
          域名筛选
        </h4>
        {#each Array.from(domainCounts).sort((a, b) => b[1] - a[1]) as [domain, count]}
          <label
            data-key={domain}
            class="flex items-center gap-2 truncate rounded-md px-1 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
            <input
              type="checkbox"
              class="form-checkbox h-3.5 w-3.5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              checked={selectedDomains.has(domain)}
              onchange={() => {
                toggleDomain(domain)
                // selectedDomains = selectedDomains
              }} />
            <span class="truncate">{domain}</span>
            <span class="text-xs font-medium text-gray-400 dark:text-gray-500"
              >{count}</span>
          </label>
        {/each}
      </div>
    {/if}
  </div>
</aside>

<style>
  .composite-filters {
    width: var(--sidebar-width);
    min-width: var(--sidebar-width);
    border-right: var(--sidebar-border-right);
    border-left: var(--sidebar-border-left);
    padding-left: var(--sidebar-padding-left);
    padding-right: var(--sidebar-padding-right);
    scroll-snap-align: var(--sidebar-scroll-snap-align);
    padding-top: var(--sidebar-padding-top, 20px);
    padding-bottom: 20px;
  }

  .filter-controls {
    overflow: hidden;
  }
  .filter-group {
    /* position: relative; */

    scroll-padding-top: 55px;
  }

  .filter-group-domains {
    min-height: calc(40%);
  }

  .filter-group h4 {
    position: sticky;
    top: 0;
    padding: 8px 0;
    z-index: 1;
    margin: 0;
  }

  .reset-filter {
    align-self: var(--sidebar-reset-filter-align-self);
  }
</style>
