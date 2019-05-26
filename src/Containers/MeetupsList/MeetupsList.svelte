<script>
  export let meetups;
  import MeetupItem from "./MeetupItem/MeetupItem.svelte";
</script>

<style>
  .meetups-container {
    padding: 1rem 8rem;
    margin-top: 4rem;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-column-gap: 1rem;
    grid-row-gap: 1.5rem;
  }
</style>

<div class="meetups-container">

  {#each meetups as { id, title, subtitle, description, imageUrl, address, contactEmail }, index (id)}
    <MeetupItem
      {id}
      {title}
      {subtitle}
      {description}
      {imageUrl}
      {address}
      {contactEmail} />
  {/each}
</div>
