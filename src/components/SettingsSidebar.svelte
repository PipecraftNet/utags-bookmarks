<script>
  import { onMount } from 'svelte'
  import { $ as _$ } from 'browser-extension-utils'
  import { initFocusTrap } from 'focus-trap-lite'
  import { LayoutList } from 'lucide-svelte'
  import {
    settings,
    importDataOld,
    exportData,
    clearAll,
  } from '../stores/stores.js'
  import { viewModes } from '../config/view-modes.js'
  import { sortOptions } from '../config/sort-options.js'
  import { themeOptions } from '../config/theme-options.js'
  import { languageOptions } from '../config/language-options.js'
  import ThemeSwitcher from './ThemeSwitcher.svelte'
  import DropdownMenu from './DropdownMenu.svelte'
  import ImportModal from './ImportModal.svelte'
  import Switch from './Switch.svelte'
  import CloseIcon from './svg/CloseIcon.svelte'
  import InfoIcon from './svg/InfoIcon.svelte'
  import GitHubIcon from './svg/GitHubIcon.svelte'
  import IssueIcon from './svg/IssueIcon.svelte'
  import RoadmapIcon from './svg/RoadmapIcon.svelte'
  import SortIcon from './svg/SortIcon.svelte'
  import ViewModeIcon from './svg/ViewModeIcon.svelte'
  import ThemeIcon from './svg/ThemeIcon.svelte'
  import FilterListIcon from './svg/FilterListIcon.svelte'
  import LanguageIcon from './svg/LanguageIcon.svelte'
  import AddIcon from './svg/AddIcon.svelte'
  import DarkModeIcon from './svg/DarkModeIcon.svelte'

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

  let themeOpen = $state(false)
  let viewModeOpen = $state(false)
  let sortByOpen = $state(false)
  let languageOpen = $state(false)
  let showImportModal = $state(false)
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
          <CloseIcon />
        </button>
      </div>

      <div
        class="flex max-h-[calc(100vh-8rem)] flex-col gap-y-10 overflow-y-auto pr-3">
        <div class="setting-group gap-y-6">
          <h3
            class="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
            界面设置
          </h3>
          <div class="gap-y-4">
            <div
              class="relative flex items-center justify-between px-1 py-1.25">
              <div
                class="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <DarkModeIcon />
                <span>深色主题</span>
              </div>
              <ThemeSwitcher type="button" />
            </div>
          </div>

          <div class="gap-y-4">
            <div class="relative flex items-center justify-between px-1 py-1.5">
              <div
                class="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <ThemeIcon />
                <span>主题风格</span>
              </div>
              <DropdownMenu
                bind:open={themeOpen}
                items={themeOptions}
                selectedValue={$settings.skin}
                onSelect={(value) => ($settings.skin = value)}
                showButton={true}
                buttonLabel={themeOptions.find(
                  (opt) => opt.value === $settings.skin
                )?.label || '选择主题'}
                width="w-50" />
            </div>
          </div>

          <div class="gap-y-4">
            <div class="relative flex items-center justify-between px-1 py-1.5">
              <div
                class="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <LayoutList size={24} />
                <span>视图模式</span>
              </div>
              <DropdownMenu
                bind:open={viewModeOpen}
                items={viewModes}
                selectedValue={$settings.viewMode}
                onSelect={(value) => ($settings.viewMode = value)}
                showButton={true}
                buttonLabel={viewModes.find(
                  (opt) => opt.value === $settings.viewMode
                )?.label || '选择视图模式'}
                width="w-50" />
            </div>
          </div>

          <div class="gap-y-4">
            <div class="relative flex items-center justify-between px-1 py-1.5">
              <div
                class="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <SortIcon />
                <span>排序方式</span>
              </div>
              <DropdownMenu
                bind:open={sortByOpen}
                items={sortOptions}
                selectedValue={$settings.sortBy}
                onSelect={(value) => {
                  $settings.sortBy = value
                  window.dispatchEvent(new CustomEvent('sortByChanged'))
                }}
                showButton={true}
                buttonLabel={sortOptions.find(
                  (opt) => opt.value === $settings.sortBy
                )?.label || '选择排序方式'}
                width="w-50" />
            </div>
          </div>

          <div class="gap-y-4">
            <div class="flex items-center justify-between px-1 py-0.5">
              <div
                class="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <FilterListIcon />
                <span>筛选栏位置</span>
              </div>
              <div
                class="flex gap-2 rounded-lg bg-gray-100 p-1 shadow-inner dark:bg-gray-700/90 dark:shadow-gray-900/30">
                <label class="flex-1">
                  <input
                    type="radio"
                    class="peer absolute h-0 w-0 opacity-0"
                    value="left"
                    bind:group={$settings.sidebarPosition} />
                  <span
                    class="block cursor-pointer rounded-md px-4 py-1.5 text-center text-sm transition-colors peer-checked:bg-white peer-checked:text-gray-800 dark:peer-checked:bg-gray-600 dark:peer-checked:text-gray-100">
                    左
                  </span>
                </label>
                <label class="flex-1">
                  <input
                    type="radio"
                    class="peer absolute h-0 w-0 opacity-0"
                    value="right"
                    bind:group={$settings.sidebarPosition} />
                  <span
                    class="block cursor-pointer rounded-md px-4 py-1.5 text-center text-sm transition-colors peer-checked:bg-white peer-checked:text-gray-800 dark:peer-checked:bg-gray-600 dark:peer-checked:text-gray-100">
                    右
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div class="gap-y-4">
            <div class="relative flex items-center justify-between px-1 py-1.5">
              <div
                class="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <LanguageIcon />
                <span>界面语言</span>
              </div>
              <DropdownMenu
                bind:open={languageOpen}
                items={languageOptions}
                selectedValue={$settings.language || 'zh'}
                onSelect={(value) => ($settings.language = value)}
                showButton={true}
                buttonLabel={languageOptions.find(
                  (opt) => opt.value === ($settings.language || 'zh')
                )?.label || '选择语言'}
                width="w-50" />
            </div>
          </div>
        </div>

        <div class="setting-group gap-y-6">
          <h4
            class="text-md mb-4 font-semibold text-gray-900 dark:text-gray-100">
            工具栏显示设置
          </h4>

          <!-- 新增Header工具栏设置 -->
          <div class="gap-y-4">
            <div class="flex items-center justify-between px-1 py-1.5">
              <div
                class="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <DarkModeIcon />
                <span>深色主题按钮</span>
              </div>
              <Switch bind:checked={$settings.headerToolbarSettings.theme} />
            </div>

            <div class="flex items-center justify-between px-1 py-1.5">
              <div
                class="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <ThemeIcon />
                <span>主题风格按钮</span>
              </div>
              <Switch bind:checked={$settings.headerToolbarSettings.skin} />
            </div>

            <div class="flex items-center justify-between px-1 py-1.5">
              <div
                class="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <LayoutList size={24} />
                <span>视图模式按钮</span>
              </div>
              <Switch bind:checked={$settings.headerToolbarSettings.viewMode} />
            </div>

            <div class="flex items-center justify-between px-1 py-1.5">
              <div
                class="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <SortIcon />
                <span>排序方式按钮</span>
              </div>
              <Switch bind:checked={$settings.headerToolbarSettings.sortBy} />
            </div>

            <div class="flex items-center justify-between px-1 py-1.5">
              <div
                class="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <FilterListIcon />
                <span>筛选栏位置按钮</span>
              </div>
              <Switch
                bind:checked={
                  $settings.headerToolbarSettings.sidebarPosition
                } />
            </div>

            <div class="flex items-center justify-between px-1 py-1.5">
              <div
                class="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <AddIcon />
                <span>添加操作按钮</span>
              </div>
              <Switch
                bind:checked={$settings.headerToolbarSettings.addButton} />
            </div>
          </div>
        </div>

        <!-- 新增数据管理分组 -->
        <div class="setting-group gap-y-6">
          <h3
            class="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
            数据管理
          </h3>
          <div class="gap-y-4">
            <div class="flex items-center justify-between px-1 py-1.5">
              <button
                class="flex items-center gap-3 text-gray-700 hover:text-blue-600 dark:text-gray-300"
                onclick2={() => importDataOld()}
                onclick={() => (showImportModal = true)}>
                <span>📥 导入数据</span>
              </button>
            </div>
            <div class="flex items-center justify-between px-1 py-1.5">
              <button
                class="flex items-center gap-3 text-gray-700 hover:text-blue-600 dark:text-gray-300"
                onclick={() => exportData()}>
                <span>📤 导出数据</span>
              </button>
            </div>
            <div class="flex items-center justify-between px-1 py-1.5">
              <button
                class="flex items-center gap-3 text-red-600 hover:text-red-700 dark:text-red-400"
                onclick={clearAll}>
                <span>🗑️ 清空数据</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 新增关于分组 -->
        <div class="setting-group gap-y-6">
          <h3
            class="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
            关于
          </h3>
          <div class="gap-y-4">
            <div class="flex items-center justify-between px-1 py-1.5">
              <div
                class="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <InfoIcon />
                <span>版本号</span>
              </div>
              <span class="text-gray-500 dark:text-gray-400"
                >v{__APP_VERSION__}</span>
            </div>
            <div class="flex items-center justify-between px-1 py-1.5">
              <a
                href="https://github.com/utags/utags-bookmarks"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-3 text-gray-700 hover:text-blue-600 dark:text-gray-300">
                <GitHubIcon />
                <span>GitHub 仓库</span>
              </a>
            </div>
            <div class="flex items-center justify-between px-1 py-1.5">
              <a
                href="https://github.com/utags/utags-bookmarks/issues"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-3 text-gray-700 hover:text-blue-600 dark:text-gray-300">
                <IssueIcon />
                <span>报告问题</span>
              </a>
            </div>
            <div class="flex items-center justify-between px-1 py-1.5">
              <a
                href="https://github.com/utags/utags-bookmarks?tab=readme-ov-file#-development-roadmap"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-3 text-gray-700 hover:text-blue-600 dark:text-gray-300">
                <RoadmapIcon />
                <span>开发路线图</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <ImportModal bind:showImportModal />
{/if}

<style global>
  .settings-sidebar {
    border-left: 1px solid rgba(0, 0, 0, 0.06);
  }

  :root.dark .settings-sidebar {
    border-left-color: rgba(255, 255, 255, 0.1);
  }
</style>
