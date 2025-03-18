<script>
  import Favicon from './Favicon.svelte'

  let { href, tags, title, formatedUpdated, dateTitleText } = $props()
</script>

<div class="list-simple group relative mx-[6px] p-2">
  <div class="title flex items-center gap-2 truncate">
    <Favicon {href} classNames="h-4 w-4 flex-none" />
    <a {href} {title} target="_blank" rel="noopener">
      <span>{title}</span>
    </a>
  </div>
  <div class="url-path mt-1 truncate text-xs">
    <a {href} target="_blank" rel="noopener">{href}</a>
  </div>
  <div class="description mt-1 flex flex-wrap items-baseline gap-1 truncate">
    <span class="tags flex flex-wrap gap-1">
      {#each tags as tag}
        <a href="#{encodeURIComponent(tag)}" class="tag">{tag}</a>
      {/each}
    </span>
    <span class="datetime text-gray-500" title={dateTitleText}
      >{formatedUpdated}</span>
    <span class="action">edit</span>
    <span class="action">delete</span>
  </div>
</div>

<style>
  .list-simple {
    flex: 1 1 0;
  }
  .list-simple .title {
    position: relative;
  }
  .list-simple .title a {
    color: #4644d5;
    display: block;
    font-size: 14px;
    font-weight: 500;
    overflow: hidden;
    width: fit-content;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .list-simple .url-path {
    color: #4240d4cc;
  }
  .list-simple .tags .tag {
    color: #048f8d;
    font-size: 14px;
  }

  .list-simple .title a:hover,
  .list-simple .url-path a:hover,
  .list-simple .tags .tag:hover {
    text-decoration: underline;
  }
  .list-simple .tag::before {
    content: '#';
  }
  .list-simple .datetime,
  .list-simple .action {
    color: #6b7280;
    font-size: 13px;
  }
  .list-simple .description span:not(:first-of-type):not(.tag)::before {
    content: '|';
    margin-right: calc(var(--spacing) * 1);
  }
</style>
