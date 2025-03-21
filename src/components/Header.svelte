<script>
  export let collapsed = false
  export let showAddModal
  export let importData
  export let exportData
  export let clearAll
  export let toggleView
</script>

<div
  class="header fixed top-0 right-0 left-0 z-50 flex h-14 items-center justify-between border-b border-gray-200 px-4 shadow-sm">
  <!-- 桌面端导航 -->
  <div class="hidden md:flex md:items-center md:gap-6">
    <span
      class="logo-text bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-xl font-bold text-transparent"
      >UTags</span>
    <div class="flex gap-4">
      <button
        class="nav-btn flex items-center gap-2 rounded-md px-4 py-2 text-gray-600 transition-colors duration-200 hover:bg-gray-100"
        on:click={importData}>
        <span class="text-lg">📥</span>
        <span>导入</span>
      </button>
      <button
        class="nav-btn flex items-center gap-2 rounded-md px-4 py-2 text-gray-600 transition-colors duration-200 hover:bg-gray-100"
        on:click={exportData}>导出</button>
      <button
        class="nav-btn flex items-center gap-2 rounded-md px-4 py-2 text-gray-600 transition-colors duration-200 hover:bg-gray-100"
        on:click={clearAll}>清空</button>
    </div>
  </div>

  <!-- 移动端汉堡菜单 -->
  <div class="md:hidden">
    <button class="hamburger p-2" on:click={() => (collapsed = !collapsed)}>
      {collapsed ? '☰' : '✕'}
    </button>
  </div>

  <!-- 移动端下拉菜单 -->
  {#if !collapsed}
    <div
      class="absolute top-16 right-0 left-0 z-50 border-b border-gray-200 bg-white/90 shadow-md md:hidden">
      <div class="flex flex-col gap-2 p-4">
        <button
          class="w-full rounded-md px-4 py-2 text-left text-gray-600 hover:bg-gray-100"
          on:click={importData}>📥 导入</button>
        <button
          class="w-full rounded-md px-4 py-2 text-left text-gray-600 hover:bg-gray-100"
          on:click={exportData}>📤 导出</button>
        <button
          class="w-full rounded-md px-4 py-2 text-left text-gray-600 hover:bg-gray-100"
          on:click={clearAll}>🗑️ 清空</button>
      </div>
    </div>
  {/if}

  <!-- 右侧工具区 -->
  <div class="flex items-center gap-4">
    <button
      class="rounded-md px-4 py-2 text-gray-600 hover:bg-gray-100"
      on:click={() => (showAddModal = true)}>+ 添加</button>
    <button
      class="rounded-md px-4 py-2 text-gray-600 hover:bg-gray-100"
      on:click={toggleView}>切换布局</button>
  </div>
</div>

<style>
  .header {
    /* --header-height: 3.5rem; */
    background-color: white;
  }

  @media (max-width: 768px) {
    .hamburger {
      font-size: 1.5rem;
      line-height: 1;
    }
  }
</style>
