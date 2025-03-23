<script>
  import { onMount } from 'svelte'
  import ThemeSwitcher from './ThemeSwitcher.svelte'
  import { $ as _$ } from 'browser-extension-utils'
  import { initFocusTrap } from 'focus-trap-lite'
  import { settings } from '../stores.ts'

  let { showSettings = $bindable() } = $props()

  $effect(() => {
    if (showSettings) {
      initFocusTrap(_$('.settings-sidebar'))
    }
  })

  onMount(() => {
    const keydownHandler = (event) => {
      if (showSettings) {
        if (event.key === 'Escape') {
          showSettings = false
        }
      }
    }

    document.addEventListener('keydown', keydownHandler)
    return () => document.removeEventListener('keydown', keydownHandler)
  })

  $effect(() => {
    const position = $settings.sidebarPosition
    setTimeout(() => {
      document.querySelector('.aside-area aside:last-of-type')?.scrollIntoView({
        behavior: 'auto',
        block: 'start',
        inline: position === 'right' ? 'start' : 'end',
      })
    }, 10)
  })
</script>

{#if showSettings}
  <div
    class="dimmed-layer fixed inset-0 z-[90] bg-white/50 transition-colors dark:bg-gray-800/50"
    onclick={(e) => {
      if (e.target === e.currentTarget) {
        showSettings = false
      }
    }}
    onkeydown={(event) => {
      if (event.key === 'Escape') {
        showSettings = false
      }
    }}
    tabindex="-1"
    role="button"
    aria-label="关闭设置侧边栏">
    <div
      class="settings-sidebar absolute inset-y-0 right-0 z-[100] w-96 bg-white/95 p-6 shadow-2xl backdrop-blur-xl transition-transform duration-300 dark:bg-gray-800/95"
      class:translate-x-0={showSettings}
      class:translate-x-full={!showSettings}>
      <div class="mb-6 flex items-center justify-between">
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          设置
        </h2>
        <button
          class="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          onclick={() => (showSettings = false)}
          aria-label="关闭设置侧边栏">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="h-6 w-6">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="gap-y-8">
        <div class="setting-group gap-y-6">
          <h3
            class="mb-6 text-xl font-semibold text-gray-900 dark:text-gray-100">
            界面设置
          </h3>
          <div class="gap-y-4">
            <div class="flex items-center justify-between px-1 py-1.5">
              <span class="text-gray-700 dark:text-gray-300">主题</span>
              <ThemeSwitcher type="button" />
            </div>
          </div>
          <div class="gap-y-4">
            <div class="flex items-center justify-between px-1 py-1.5">
              <span class="text-gray-700 dark:text-gray-300">筛选栏位置</span>
              <div
                class="flex gap-2 rounded-lg bg-gray-100 p-1 shadow-inner dark:bg-gray-700/90 dark:shadow-gray-900/30">
                <label class="flex-1">
                  <input
                    type="radio"
                    class="peer absolute h-0 w-0 opacity-0"
                    value="left"
                    bind:group={$settings.sidebarPosition} />
                  <span
                    class="block cursor-pointer rounded-md px-4 py-2 text-center text-sm transition-colors peer-checked:bg-white peer-checked:text-gray-800 dark:peer-checked:bg-gray-600 dark:peer-checked:text-gray-100">
                    左侧
                  </span>
                </label>
                <label class="flex-1">
                  <input
                    type="radio"
                    class="peer absolute h-0 w-0 opacity-0"
                    value="right"
                    bind:group={$settings.sidebarPosition} />
                  <span
                    class="block cursor-pointer rounded-md px-4 py-2 text-center text-sm transition-colors peer-checked:bg-white peer-checked:text-gray-800 dark:peer-checked:bg-gray-600 dark:peer-checked:text-gray-100">
                    右侧
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style global>
  .settings-sidebar {
    border-left: 1px solid rgba(0, 0, 0, 0.06);
  }

  :root.dark .settings-sidebar {
    border-left-color: rgba(255, 255, 255, 0.1);
  }
</style>
