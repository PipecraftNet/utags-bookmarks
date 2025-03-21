<script>
  import { onMount } from 'svelte'
  import ThemeSwitcher from './ThemeSwitcher.svelte'

  let {
    collapsed = false,
    showAddModal = $bindable(),
    importData,
    exportData,
    clearAll,
    toggleView,
  } = $props()

  let theme = $state(localStorage.getItem('theme') || 'system')

  $effect(() => {
    console.log('call $effect')
    localStorage.setItem('theme', theme)
    const root = document.documentElement

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      root.classList.toggle('dark', mediaQuery.matches)
      root.style.colorScheme = mediaQuery.matches ? 'dark' : 'light'
    } else {
      root.classList.toggle('dark', theme === 'dark')
      root.style.colorScheme = theme
    }
  })

  onMount(() => {
    console.log('call onMount')
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const systemThemeHandler = () => {
      if (theme === 'system') {
        document.documentElement.classList.toggle('dark', mediaQuery.matches)
        document.documentElement.style.colorScheme = mediaQuery.matches
          ? 'dark'
          : 'light'
      }
    }

    mediaQuery.addEventListener('change', systemThemeHandler)
    return () => mediaQuery.removeEventListener('change', systemThemeHandler)
  })
</script>

<div
  class="header fixed top-0 right-0 left-0 z-50 flex h-14 items-center justify-between border-b border-(color:--seperator-line-color) bg-white px-4 shadow-sm dark:bg-black">
  <!-- 桌面端导航 -->
  <div class="hidden md:flex md:items-center md:gap-6">
    <span
      class="logo-text bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-xl font-bold text-transparent"
      >UTags</span>
    <div class="flex gap-4">
      <button
        class="nav-btn flex items-center gap-2 rounded-md px-4 py-2 text-gray-600 transition-colors duration-200 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        onclick={importData}>
        <span class="text-lg">📥</span>
        <span>导入</span>
      </button>
      <button
        class="nav-btn flex items-center gap-2 rounded-md px-4 py-2 text-gray-600 transition-colors duration-200 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        onclick={exportData}>导出</button>
      <button
        class="nav-btn flex items-center gap-2 rounded-md px-4 py-2 text-gray-600 transition-colors duration-200 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        onclick={clearAll}>清空</button>
    </div>
  </div>

  <!-- 移动端汉堡菜单 -->
  <div class="md:hidden">
    <button class="hamburger p-2" onclick={() => (collapsed = !collapsed)}>
      {collapsed ? '☰' : '✕'}
    </button>
  </div>

  <!-- 移动端下拉菜单 -->
  {#if !collapsed}
    <div
      class="absolute top-16 right-0 left-0 z-50 border-b border-(color:--seperator-line-color) bg-white/90 shadow-md md:hidden dark:bg-black/90">
      <div class="flex flex-col gap-2 p-4">
        <button
          class="w-full rounded-md px-4 py-2 text-left text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          onclick={importData}>📥 导入</button>
        <button
          class="w-full rounded-md px-4 py-2 text-left text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          onclick={exportData}>📤 导出</button>
        <button
          class="w-full rounded-md px-4 py-2 text-left text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          onclick={clearAll}>🗑️ 清空</button>
      </div>
    </div>
  {/if}

  <!-- 右侧工具区 -->
  <div class="flex items-center gap-4">
    <button
      class="rounded-md px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
      onclick={() => (showAddModal = true)}>+ 添加</button>

    <ThemeSwitcher bind:theme type="button" />

    <button
      class="rounded-md px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
      onclick={toggleView}>切换布局</button>
  </div>
</div>

<style>
  .header {
    /* --header-height: 3.5rem; */
    /* background-color: white; */
  }

  @media (max-width: 768px) {
    .hamburger {
      font-size: 1.5rem;
      line-height: 1;
    }
  }
</style>
