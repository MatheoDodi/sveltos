<script>
  export let meetups;
  import MeetupItem from "./MeetupItem/MeetupItem.svelte";
</script>

<style>
  .meetups-container {
    padding: 1rem 8rem;
    margin-top: 4rem;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
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
